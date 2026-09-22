import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTierBySlug } from "@/lib/subscriptionTiers";
import { getStripeClient } from "@/lib/stripe";
import { firstIssueMessage, subscribeSchema } from "@/lib/validation";

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

  const parsed = subscribeSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
  }
  const tier = getTierBySlug(parsed.data.tierSlug);
  if (!tier) {
    return NextResponse.json({ error: "Unknown subscription tier." }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, stripe_subscription_id")
    .eq("id", user.id)
    .single();

  const origin = new URL(request.url).origin;
  const stripe = getStripeClient(apiKey);

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
      // Reuse the existing Stripe customer if we have one, so switching plans
      // doesn't create a duplicate customer record for the same person.
      ...(profile?.stripe_customer_id
        ? { customer: profile.stripe_customer_id }
        : { customer_email: user.email ?? undefined }),
      client_reference_id: user.id,
      metadata: {
        user_id: user.id,
        tier_slug: tier.slug,
        // Carried through so the webhook can cancel the old plan once the
        // new one is confirmed paid — never before, so an abandoned
        // checkout never leaves the customer with no active subscription.
        previous_subscription_id: profile?.stripe_subscription_id ?? "",
      },
      subscription_data: { metadata: { user_id: user.id, tier_slug: tier.slug } },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe subscription checkout error:", error);
    return NextResponse.json({ error: "Something went wrong starting checkout. Please try again." }, { status: 502 });
  }
}
