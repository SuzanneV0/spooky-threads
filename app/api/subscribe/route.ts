import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { getTierBySlug } from "@/lib/subscriptionTiers";

export async function POST(request: Request) {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Subscriptions aren't configured yet — add a STRIPE_SECRET_KEY to .env.local." },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Please log in to subscribe." }, { status: 401 });
  }

  const { tierSlug } = (await request.json()) as { tierSlug?: string };
  const tier = getTierBySlug(tierSlug);
  if (!tier) {
    return NextResponse.json({ error: "Unknown subscription tier." }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  const stripe = new Stripe(apiKey);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${tier.name} — Spooky Threads Subscription`,
              metadata: { tier_slug: tier.slug },
            },
            unit_amount: Math.round(tier.price * 100),
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/subscriptions?subscribed=1`,
      cancel_url: `${origin}/subscriptions?canceled=1`,
      customer_email: user.email ?? undefined,
      client_reference_id: user.id,
      metadata: { user_id: user.id, tier_slug: tier.slug },
      subscription_data: { metadata: { user_id: user.id, tier_slug: tier.slug } },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe subscription checkout error:", error);
    return NextResponse.json({ error: "Something went wrong starting checkout. Please try again." }, { status: 502 });
  }
}
