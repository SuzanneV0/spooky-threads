import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/send";
import { contactMessageEmail } from "@/lib/email/templates";
import { CONTACT_EMAIL } from "@/lib/site";
import { contactMessageSchema, firstIssueMessage } from "@/lib/validation";

async function verifyRecaptcha(token: string | undefined) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    console.error("RECAPTCHA_SECRET_KEY is not set; skipping reCAPTCHA verification");
    return true;
  }
  if (!token) return false;

  const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token }),
  });
  const data = await response.json();
  return data.success === true;
}

export async function POST(request: Request) {
  const parsed = contactMessageSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
  }
  const { name, email, messageType, message, recaptchaToken } = parsed.data;

  const recaptchaOk = await verifyRecaptcha(recaptchaToken);
  if (!recaptchaOk) {
    return NextResponse.json({ error: "reCAPTCHA verification failed" }, { status: 400 });
  }

  const { subject, html } = contactMessageEmail({ name, email, messageType, message });
  await sendEmail({ to: CONTACT_EMAIL, subject, html });

  return NextResponse.json({ sent: true });
}
