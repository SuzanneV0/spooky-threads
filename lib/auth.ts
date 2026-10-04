import { auth, currentUser } from "@clerk/nextjs/server";
import { one, run } from "@/lib/db/client";
import type { Tables } from "@/lib/db/types";
import { sendEmail } from "@/lib/email/send";
import { welcomeEmail } from "@/lib/email/templates";

export type Profile = Tables<"profiles">;

/** The signed-in Clerk user id, or null. Works in route handlers and server components. */
export async function getUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

export async function getUserEmail(): Promise<string | undefined> {
  const user = await currentUser();
  return user?.primaryEmailAddress?.emailAddress ?? undefined;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  return one<Profile>("SELECT * FROM profiles WHERE id = ?", [userId]);
}

/**
 * Returns the shopper's profile, creating it the first time they're seen after signing up.
 * This replaces the Supabase trigger that made a profile row for every new auth user,
 * and sends the welcome email that the old signup page used to request.
 */
export async function getOrCreateProfile(userId: string): Promise<Profile> {
  const existing = await getProfile(userId);
  if (existing) return existing;

  // Only the Clerk id is stored. Name and email stay with Clerk and are read from there when needed.
  const created = await run("INSERT OR IGNORE INTO profiles (id) VALUES (?)", [userId]);

  if (created.rowsAffected > 0) {
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress;
    if (email) {
      const { subject, html } = welcomeEmail({ name: user?.firstName ?? "" });
      await sendEmail({ to: email, subject, html });
    }
  }

  return (await getProfile(userId))!;
}

/** The signed-in user's id if they're an admin, otherwise null. */
export async function getAdminUserId(): Promise<string | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const profile = await getProfile(userId);
  return profile?.is_admin ? userId : null;
}
