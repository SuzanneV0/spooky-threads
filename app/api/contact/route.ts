import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/send";
import { contactMessageEmail } from "@/lib/email/templates";
import { CONTACT_EMAIL } from "@/lib/site";

const MESSAGE_TYPES = new Set(["general", "orders", "subscriptions", "other"]);

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
  const { name, email, messageType, message, recaptchaToken } = await request.json();

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof email !== "string" ||
    !email.trim() ||
    typeof messageType !== "string" ||
    !MESSAGE_TYPES.has(messageType) ||
    typeof message !== "string" ||
    !message.trim()
  ) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }

  const recaptchaOk = await verifyRecaptcha(typeof recaptchaToken === "string" ? recaptchaToken : undefined);
  if (!recaptchaOk) {
    return NextResponse.json({ error: "reCAPTCHA verification failed" }, { status: 400 });
  }

  const { subject, html } = contactMessageEmail({ name, email, messageType, message });
  await sendEmail({ to: CONTACT_EMAIL, subject, html });

  return NextResponse.json({ sent: true });
}
