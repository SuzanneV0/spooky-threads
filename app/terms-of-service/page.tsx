import StaticPage from "@/components/StaticPage";

export const metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of Spooky Threads.",
};

export default function TermsOfServicePage() {
  return (
    <StaticPage title="Terms of Service">
      <p>This is placeholder terms text for a practice storefront — replace it with your real terms before launch.</p>

      <h2>Acceptance of terms</h2>
      <p>
        By creating an account, browsing our collections, or placing an order, you agree to these terms.
        If you don&apos;t agree, please don&apos;t use the site.
      </p>

      <h2>Accounts</h2>
      <p>
        You&apos;re responsible for keeping your account credentials secure and for anything that happens
        under your account. Let us know right away if you think someone else has access to it.
      </p>

      <h2>Orders and payment</h2>
      <p>
        Placing an order is an offer to buy at the listed price. We may cancel or refuse any order,
        including for pricing errors or suspected fraud. Payments are processed securely by Stripe — we
        never see or store your full card details.
      </p>

      <h2>Subscriptions</h2>
      <p>
        Subscription boxes renew automatically each month until you cancel. You can cancel anytime from
        the Subscriptions page, effective immediately — we don&apos;t offer partial refunds for the
        current billing period.
      </p>

      <h2>Shopping assistant</h2>
      <p>
        Our AI shopping assistant is provided for convenience and may occasionally get things wrong.
        Always confirm product details, pricing, and availability on the product page before purchasing.
      </p>

      <h2>Content and conduct</h2>
      <p>
        Reviews and other content you submit should be honest and not infringe on anyone else&apos;s
        rights. We may remove content that violates these terms.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        This is a practice storefront built for a course project. It&apos;s provided as-is, without
        warranties of any kind, to the fullest extent permitted by law.
      </p>

      <h2>Changes to these terms</h2>
      <p>We may update these terms from time to time. Continued use of the site means you accept the changes.</p>
    </StaticPage>
  );
}
