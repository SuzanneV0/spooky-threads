import { NextResponse } from "next/server";

// TODO (course lesson): create a Stripe Checkout Session here using the
// `stripe` package and STRIPE_SECRET_KEY from .env.local, then redirect
// the client to session.url.
export async function POST(request: Request) {
  const { items } = await request.json();

  return NextResponse.json({
    message: "Stripe checkout isn't wired up yet.",
    items,
  });
}
