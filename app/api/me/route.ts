import { NextResponse } from "next/server";
import { getOrCreateProfile, getUserId } from "@/lib/auth";

// The signed-in shopper's profile (subscription tier, quiz result, admin flag).
export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ profile: null });

  const { id, is_admin, halloween_trope, subscription_tier } = await getOrCreateProfile(userId);
  return NextResponse.json({ profile: { id, is_admin, halloween_trope, subscription_tier } });
}
