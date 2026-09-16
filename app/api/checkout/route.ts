import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

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

  const { items } = (await request.json()) as { items: { productId: string; quantity: number }[] };
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

  const quantityByProduct = new Map(items.map((i) => [i.productId, i.quantity]));

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = products.map((p) => ({
    price_data: {
      currency: "usd",
      product_data: { name: p.name, metadata: { product_id: p.id } },
      unit_amount: p.price_cents,
    },
    quantity: Math.max(1, quantityByProduct.get(p.id) ?? 1),
  }));

  const origin = new URL(request.url).origin;
  const stripe = new Stripe(apiKey);

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
    return NextResponse.json({ error: "Something went wrong starting checkout. Please try again." }, { status: 502 });
  }
}
