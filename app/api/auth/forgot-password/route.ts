import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send";
import { passwordResetEmail } from "@/lib/email/templates";
import { SITE_URL } from "@/lib/site";
import { firstIssueMessage, forgotPasswordSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const parsed = forgotPasswordSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
  }
  const { email } = parsed.data;

  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: `${SITE_URL}/auth/callback?next=/reset-password` },
  });

  if (!error && data.properties?.action_link) {
    const { subject, html } = passwordResetEmail({ resetLink: data.properties.action_link });
    await sendEmail({ to: email, subject, html });
  }

  // Always report success, whether or not an account exists for this email,
  // so this endpoint can't be used to check which addresses have accounts.
  return NextResponse.json({ sent: true });
}
