import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { db, newId, run } from "@/lib/db/client";
import { sendEmail } from "@/lib/email/send";
import { orderConfirmationEmail } from "@/lib/email/templates";
import { getStripeClient } from "@/lib/stripe";

async function handleCheckoutSessionCompleted(stripe: Stripe, session: Stripe.Checkout.Session) {
  if (session.mode === "subscription") {
    const userId = session.metadata?.user_id;
    const tierSlug = session.metadata?.tier_slug;
    if (!userId || !tierSlug) return;

    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
    const subscriptionId =
      typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

    // Upsert, in case the shopper paid before their profile row was ever created.
    await run(
      `INSERT INTO profiles (id, subscription_tier, stripe_customer_id, stripe_subscription_id) VALUES (?, ?, ?, ?)
       ON CONFLICT (id) DO UPDATE SET subscription_tier = excluded.subscription_tier,
         stripe_customer_id = excluded.stripe_customer_id, stripe_subscription_id = excluded.stripe_subscription_id`,
      [userId, tierSlug, customerId ?? null, subscriptionId ?? null]
    );

    // Now that the new subscription is confirmed active, cancel whatever
    // plan they were switching from. Doing this only now — never before —
    // means an abandoned checkout never leaves someone with no active plan.
    const previousSubscriptionId = session.metadata?.previous_subscription_id;
    if (previousSubscriptionId && previousSubscriptionId !== subscriptionId) {
      try {
        await stripe.subscriptions.cancel(previousSubscriptionId);
      } catch (error) {
        console.error("Failed to cancel previous subscription after plan switch:", error);
      }
    }

    return;
  }

  const userId = session.metadata?.user_id;
  if (!userId) return;

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    expand: ["data.price.product"],
  });

  const shipping = session.collected_information?.shipping_details ?? session.shipping_details;
  const address = shipping?.address ?? session.customer_details?.address;

  const order = { id: newId(), total_cents: session.amount_total ?? 0 };
  const shippingAddress = {
    name: shipping?.name ?? session.customer_details?.name ?? "",
    line1: address?.line1 ?? "",
    line2: address?.line2 ?? "",
    city: address?.city ?? "",
    state: address?.state ?? "",
    postal_code: address?.postal_code ?? "",
    country: address?.country ?? "",
  };

  const orderItems = lineItems.data.map((item) => {
    const product = item.price?.product;
    const productId =
      product && typeof product === "object" && "metadata" in product
        ? (product.metadata.product_id ?? null)
        : null;

    return {
      order_id: order.id,
      product_id: productId,
      product_name: item.description ?? "Item",
      price_cents: item.price?.unit_amount ?? 0,
      quantity: item.quantity ?? 1,
    };
  });

  // The order and its items are written together, so a failure never leaves half an order.
  try {
    await db().batch(
      [
        {
          sql: "INSERT INTO orders (id, user_id, status, total_cents, shipping_address) VALUES (?, ?, 'paid', ?, ?)",
          args: [order.id, userId, order.total_cents, JSON.stringify(shippingAddress)],
        },
        ...orderItems.map((item) => ({
          sql: "INSERT INTO order_items (id, order_id, product_id, product_name, price_cents, quantity) VALUES (?, ?, ?, ?, ?, ?)",
          args: [newId(), item.order_id, item.product_id, item.product_name, item.price_cents, item.quantity],
        })),
      ],
      "write"
    );
  } catch (error) {
    console.error("Failed to create order from Stripe session:", error);
    return;
  }

  const customerEmail = session.customer_details?.email;
  if (customerEmail) {
    const { subject, html } = orderConfirmationEmail({
      orderId: order.id,
      items: orderItems.map((item) => ({
        name: item.product_name,
        quantity: item.quantity,
        priceCents: item.price_cents,
      })),
      totalCents: order.total_cents,
    });
    await sendEmail({ to: customerEmail, subject, html });
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await run(
    "UPDATE profiles SET subscription_tier = NULL, stripe_subscription_id = NULL WHERE stripe_subscription_id = ?",
    [subscription.id]
  );
}

export async function POST(request: Request) {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!apiKey || !webhookSecret) {
    console.error("Stripe webhook received but checkout isn't fully configured.");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const stripe = getStripeClient(apiKey);
  const signature = request.headers.get("stripe-signature");
  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature ?? "", webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    await handleCheckoutSessionCompleted(stripe, event.data.object as Stripe.Checkout.Session);
  } else if (event.type === "customer.subscription.deleted") {
    await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
  }

  return NextResponse.json({ received: true });
}
