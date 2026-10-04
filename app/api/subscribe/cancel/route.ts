import { NextResponse } from "next/server";
import { getProfile, getUserId } from "@/lib/auth";
import { run } from "@/lib/db/client";
import { getStripeClient } from "@/lib/stripe";

export async function POST() {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Subscriptions aren't configured yet — add a STRIPE_SECRET_KEY to .env.local." },
      { status: 503 }
    );
  }

  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json({ error: "Please log in to manage your subscription." }, { status: 401 });
  }

  const profile = await getProfile(userId);

  if (!profile?.stripe_subscription_id) {
    return NextResponse.json({ error: "You don't have an active subscription." }, { status: 400 });
  }

  const stripe = getStripeClient(apiKey);

  try {
    await stripe.subscriptions.cancel(profile.stripe_subscription_id);
  } catch (error) {
    console.error("Stripe subscription cancel error:", error);
    return NextResponse.json({ error: "Something went wrong cancelling your subscription. Please try again." }, { status: 502 });
  }

  await run("UPDATE profiles SET subscription_tier = NULL, stripe_subscription_id = NULL WHERE id = ?", [userId]);

  return NextResponse.json({ ok: true });
}
