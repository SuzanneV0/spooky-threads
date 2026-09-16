import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!apiKey || !webhookSecret || !serviceRoleKey) {
    console.error("Stripe webhook received but checkout isn't fully configured.");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const stripe = new Stripe(apiKey);
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
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;

    if (userId) {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        expand: ["data.price.product"],
      });

      const shipping = session.collected_information?.shipping_details ?? session.shipping_details;
      const address = shipping?.address ?? session.customer_details?.address;

      const supabaseAdmin = createAdminClient();

      const { data: order, error: orderError } = await supabaseAdmin
        .from("orders")
        .insert({
          user_id: userId,
          status: "paid",
          total_cents: session.amount_total ?? 0,
          shipping_address: {
            name: shipping?.name ?? session.customer_details?.name ?? "",
            line1: address?.line1 ?? "",
            line2: address?.line2 ?? "",
            city: address?.city ?? "",
            state: address?.state ?? "",
            postal_code: address?.postal_code ?? "",
            country: address?.country ?? "",
          },
        })
        .select()
        .single();

      if (orderError || !order) {
        console.error("Failed to create order from Stripe session:", orderError);
        return NextResponse.json({ error: "Failed to record order." }, { status: 500 });
      }

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

      const { error: itemsError } = await supabaseAdmin.from("order_items").insert(orderItems);
      if (itemsError) {
        console.error("Failed to create order items from Stripe session:", itemsError);
      }
    }
  }

  return NextResponse.json({ received: true });
}
