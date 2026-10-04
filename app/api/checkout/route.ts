import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getUserEmail, getUserId } from "@/lib/auth";
import { all, placeholders } from "@/lib/db/client";
import { getStripeClient } from "@/lib/stripe";
import { checkoutSchema, firstIssueMessage } from "@/lib/validation";

export async function POST(request: Request) {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Checkout isn't configured yet — add a STRIPE_SECRET_KEY to .env.local." },
      { status: 503 }
    );
  }

  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json({ error: "Please log in to check out." }, { status: 401 });
  }

  const parsed = checkoutSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
  }
  const { items } = parsed.data;

  const productIds = items.map((i) => i.productId);
  const products = await all<{ id: string; name: string; price_cents: number }>(
    `SELECT id, name, price_cents FROM products WHERE id IN (${placeholders(productIds.length)})`,
    productIds
  );

  if (products.length === 0) {
    return NextResponse.json({ error: "Those items are no longer available." }, { status: 400 });
  }

  const productsById = new Map(products.map((p) => [p.id, p]));

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.flatMap((item) => {
    const product = productsById.get(item.productId);
    if (!product) return [];

    return [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.size ? `${product.name} — Size ${item.size}` : product.name,
            metadata: { product_id: product.id, ...(item.size ? { size: item.size } : {}) },
          },
          unit_amount: product.price_cents,
        },
        quantity: item.quantity,
      },
    ];
  });

  if (lineItems.length === 0) {
    return NextResponse.json({ error: "Those items are no longer available." }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  const stripe = getStripeClient(apiKey);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart?canceled=1`,
      customer_email: await getUserEmail(),
      client_reference_id: userId,
      metadata: { user_id: userId },
      shipping_address_collection: { allowed_countries: ["US"] },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Something went wrong starting checkout. Please try again." }, { status: 502 });
  }
}
