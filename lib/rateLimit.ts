import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";

const ANON_COOKIE = "st_anon_id";
const ANON_COOKIE_MAX_AGE = 60 * 60 * 24 * 400; // ~400 days, the max most browsers allow

export type RateLimitIdentity = {
  identifier: string;
  anonCookie?: { name: string; value: string; maxAge: number };
};

export async function getRateLimitIdentity(): Promise<RateLimitIdentity> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return { identifier: `user:${user.id}` };
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
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("check_and_increment_usage", {
    p_identifier: identifier,
    p_feature: feature,
    p_limit: limit,
  });

  if (error) {
    console.error(`Rate limit check failed for ${feature}:`, error);
    return true;
  }

  return data;
}
