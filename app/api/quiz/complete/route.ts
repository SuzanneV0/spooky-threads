import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkAndIncrementUsage, getRateLimitIdentity } from "@/lib/rateLimit";
import { tropes, type TropeSlug } from "@/lib/quizTropes";
import { firstIssueMessage, quizCompleteSchema } from "@/lib/validation";

const QUIZ_DAILY_LIMIT = 2;

export async function POST(request: Request) {
  const parsed = quizCompleteSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
  }
  const trope = parsed.data.trope as TropeSlug;
  if (!tropes[trope]) {
    return NextResponse.json({ error: "Invalid trope." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let hasUnlimitedAccess = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("id", user.id)
      .single();
    hasUnlimitedAccess = !!profile?.subscription_tier;
  }

  const identity = await getRateLimitIdentity();
  const allowed =
    hasUnlimitedAccess || (await checkAndIncrementUsage(identity.identifier, "quiz", QUIZ_DAILY_LIMIT));

  const response = allowed
    ? NextResponse.json({ ok: true })
    : NextResponse.json(
        {
          ok: false,
          limited: true,
          error: `You've already taken the quiz ${QUIZ_DAILY_LIMIT} times today — come back tomorrow for another reading, or subscribe for unlimited tries!`,
        },
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

  if (user) {
    await supabase.from("profiles").update({ halloween_trope: trope }).eq("id", user.id);
  }

  return response;
}
