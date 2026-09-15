import StaticPage from "@/components/StaticPage";

export const metadata = { title: "Return Policy — Spooky Threads" };

export default function ReturnPolicyPage() {
  return (
    <StaticPage title="Return Policy">
      <p>This is placeholder return text for a practice storefront — replace it with your real policy before launch.</p>
      <h2>Returns</h2>
      <p>Items can be returned within 30 days of delivery for a full refund, provided they're unworn and unwashed.</p>
      <h2>Exchanges</h2>
      <p>Need a different size? Start a return and place a new order for the item you'd like instead.</p>
    </StaticPage>
  );
}
