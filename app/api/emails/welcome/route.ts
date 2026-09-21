import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send";
import { welcomeEmail } from "@/lib/email/templates";

export async function POST(request: Request) {
  const { userId } = await request.json();
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (error || !data.user?.email) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const name = typeof data.user.user_metadata?.full_name === "string" ? data.user.user_metadata.full_name : "";
  const { subject, html } = welcomeEmail({ name });
  await sendEmail({ to: data.user.email, subject, html });

  return NextResponse.json({ sent: true });
}
