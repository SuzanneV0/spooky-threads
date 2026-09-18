import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
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
    return NextResponse.json({ error: "Please log in to manage your subscription." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_subscription_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_subscription_id) {
    return NextResponse.json({ error: "You don't have an active subscription." }, { status: 400 });
  }

  const stripe = new Stripe(apiKey);

  try {
    await stripe.subscriptions.cancel(profile.stripe_subscription_id);
  } catch (error) {
    console.error("Stripe subscription cancel error:", error);
    return NextResponse.json({ error: "Something went wrong cancelling your subscription. Please try again." }, { status: 502 });
  }

  await supabase
    .from("profiles")
    .update({ subscription_tier: null, stripe_subscription_id: null })
    .eq("id", user.id);

  return NextResponse.json({ ok: true });
}
