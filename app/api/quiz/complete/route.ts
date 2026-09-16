import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkAndIncrementUsage, getRateLimitIdentity } from "@/lib/rateLimit";
import { tropes, type TropeSlug } from "@/lib/quizTropes";

const QUIZ_DAILY_LIMIT = 2;

export async function POST(request: Request) {
  const { trope } = (await request.json()) as { trope?: TropeSlug };
  if (!trope || !tropes[trope]) {
    return NextResponse.json({ error: "Invalid trope." }, { status: 400 });
  }

  const identity = await getRateLimitIdentity();
  const allowed = await checkAndIncrementUsage(identity.identifier, "quiz", QUIZ_DAILY_LIMIT);

  const response = allowed
    ? NextResponse.json({ ok: true })
    : NextResponse.json(
        { ok: false, limited: true, error: `You've already taken the quiz ${QUIZ_DAILY_LIMIT} times today — come back tomorrow for another reading!` },
        { status: 429 }
      );

  if (identity.anonCookie) {
    response.cookies.set(identity.anonCookie.name, identity.anonCookie.value, {
      maxAge: identity.anonCookie.maxAge,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }

  if (!allowed) {
    return response;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.from("profiles").update({ halloween_trope: trope }).eq("id", user.id);
  }

  return response;
}
