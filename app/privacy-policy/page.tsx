import StaticPage from "@/components/StaticPage";

export const metadata = {
  title: "Privacy Policy",
  description: "How Spooky Threads collects, uses, and protects your information.",
};

export default function PrivacyPolicyPage() {
  return (
    <StaticPage title="Privacy Policy">
      <p>This is placeholder policy text for a practice storefront — replace it with your real policy before launch.</p>
      <h2>What we collect</h2>
      <p>
        When you create an account, we collect your name, email address, and any shipping addresses you
        add. When you place an order, we collect the items purchased and order total.
      </p>
      <h2>How we use it</h2>
      <p>We use your information to process orders, manage your account, and respond to support requests.</p>
      <h2>Your choices</h2>
      <p>
        You can update or delete your saved addresses and account details at any time from your{" "}
        account page.
      </p>
    </StaticPage>
  );
}
