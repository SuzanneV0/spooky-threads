import { renderEmailLayout } from "@/lib/email/layout";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export function welcomeEmail({ name }: { name: string }) {
  const firstName = name.trim().split(" ")[0] || "there";

  return {
    subject: `Welcome to ${SITE_NAME} 🎃`,
    html: renderEmailLayout({
      previewText: `Welcome to ${SITE_NAME} — your Halloween era starts now.`,
      eyebrow: "New account 👻",
      heading: `Welcome, ${firstName}!`,
      bodyHtml: `
        <p>Thanks for creating an account with ${SITE_NAME}. You're all set to shop cozy, spooky-cute apparel and home goods, save favorites to a wishlist, and track your orders.</p>
        <p>Whimsical goth doesn't take a season off — and neither do we.</p>
      `,
      ctaText: "Start shopping",
      ctaHref: SITE_URL,
    }),
  };
}

export function orderConfirmationEmail({
  orderId,
  items,
  totalCents,
}: {
  orderId: string;
  items: { name: string; quantity: number; priceCents: number }[];
  totalCents: number;
}) {
  const itemRows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0; border-bottom:1px solid #b6b0b7;">${item.name} &times; ${item.quantity}</td>
          <td style="padding:8px 0; border-bottom:1px solid #b6b0b7; text-align:right;">$${(
            (item.priceCents * item.quantity) /
            100
          ).toFixed(2)}</td>
        </tr>`
    )
    .join("");

  return {
    subject: `Your ${SITE_NAME} order is confirmed 🎃`,
    html: renderEmailLayout({
      previewText: `Order #${orderId.slice(0, 8)} confirmed — thanks for shopping with ${SITE_NAME}.`,
      eyebrow: "Order confirmed",
      heading: "Your order is confirmed!",
      bodyHtml: `
        <p>Thanks for your order — we're getting it ready to haunt your doorstep. Here's what you picked out:</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px; font-size:14px;">
          ${itemRows}
          <tr>
            <td style="padding:12px 0 0; font-weight:700;">Total</td>
            <td style="padding:12px 0 0; font-weight:700; text-align:right;">$${(totalCents / 100).toFixed(2)}</td>
          </tr>
        </table>
      `,
      ctaText: "View your orders",
      ctaHref: `${SITE_URL}/account/orders`,
    }),
  };
}

export function passwordResetEmail({ resetLink }: { resetLink: string }) {
  return {
    subject: `Reset your ${SITE_NAME} password 🔒`,
    html: renderEmailLayout({
      previewText: "Reset your password — this link will expire soon.",
      eyebrow: "Password reset",
      heading: "Reset your password",
      bodyHtml: `
        <p>We got a request to reset the password on your ${SITE_NAME} account. Click below to choose a new one.</p>
        <p style="color:#55505a; font-size:13px;">If you didn't request this, you can safely ignore this email — your password won't change.</p>
      `,
      ctaText: "Reset password",
      ctaHref: resetLink,
    }),
  };
}
