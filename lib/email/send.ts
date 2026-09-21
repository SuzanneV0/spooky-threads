import { getResendClient } from "@/lib/email/resend";
import { EMAIL_FROM } from "@/lib/site";

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const resend = getResendClient();
  if (!resend) {
    console.error("RESEND_API_KEY is not set; skipping email send to", to);
    return;
  }

  const { error } = await resend.emails.send({ from: EMAIL_FROM, to, subject, html });
  if (error) {
    console.error("Failed to send email:", error);
  }
}
