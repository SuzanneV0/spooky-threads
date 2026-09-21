import { Resend } from "resend";

let client: Resend | null = null;

export function getResendClient() {
  if (client) return client;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  client = new Resend(apiKey);
  return client;
}
