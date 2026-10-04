import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { getUserId } from "@/lib/auth";
import { db } from "@/lib/db/client";

const ANON_COOKIE = "st_anon_id";
const ANON_COOKIE_MAX_AGE = 60 * 60 * 24 * 400; // ~400 days, the max most browsers allow

export type RateLimitIdentity = {
  identifier: string;
  anonCookie?: { name: string; value: string; maxAge: number };
};

export async function getRateLimitIdentity(): Promise<RateLimitIdentity> {
  const userId = await getUserId();
  if (userId) {
    return { identifier: `user:${userId}` };
  }

  const cookieStore = await cookies();
  const existing = cookieStore.get(ANON_COOKIE)?.value;
  if (existing) {
    return { identifier: `anon:${existing}` };
  }

  const id = randomUUID();
  return {
    identifier: `anon:${id}`,
    anonCookie: { name: ANON_COOKIE, value: id, maxAge: ANON_COOKIE_MAX_AGE },
  };
}

export async function checkAndIncrementUsage(
  identifier: string,
  feature: "chat" | "quiz",
  limit: number
): Promise<boolean> {
  // One atomic statement: bump today's count unless it's already at the limit, and report whether
  // a row was written. Same behaviour as the old check_and_increment_usage Postgres function.
  const today = new Date().toISOString().slice(0, 10);
  try {
    const result = await db().execute({
      sql: `INSERT INTO feature_usage (feature, identifier, usage_date, count) VALUES (?, ?, ?, 1)
            ON CONFLICT (feature, identifier, usage_date)
            DO UPDATE SET count = count + 1 WHERE feature_usage.count < ?`,
      args: [feature, identifier, today, limit],
    });
    return result.rowsAffected > 0;
  } catch (error) {
    console.error(`Rate limit check failed for ${feature}:`, error);
    return true;
  }
}
