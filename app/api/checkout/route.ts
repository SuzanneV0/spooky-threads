import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe";

export async function POST(request: Request) {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Checkout isn't configured yet — add a STRIPE_SECRET_KEY to .env.local." },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Please log in to check out." }, { status: 401 });
  }

  const { items } = (await request.json()) as {
    items: { productId: string; quantity: number; size: string | null }[];
  };
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  const { data: products } = await supabase
    .from("products")
    .select("id, name, price_cents")
    .in(
      "id",
      items.map((i) => i.productId)
    );

  if (!products || products.length === 0) {
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
        quantity: Math.max(1, item.quantity ?? 1),
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
      customer_email: user.email ?? undefined,
      client_reference_id: user.id,
      metadata: { user_id: user.id },
      shipping_address_collection: { allowed_countries: ["US"] },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    if (error instanceof Error) {
      console.error("Stripe checkout error detail:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    }
    return NextResponse.json({ error: "Something went wrong starting checkout. Please try again." }, { status: 502 });
  }
}
