import StaticPage from "@/components/StaticPage";

export const metadata = { title: "Shipping Information — Spooky Threads" };

export default function ShippingInformationPage() {
  return (
    <StaticPage title="Shipping Information">
      <p>This is placeholder shipping text for a practice storefront — replace it with your real policy before launch.</p>
      <h2>Processing time</h2>
      <p>Orders are typically processed within 1–2 business days.</p>
      <h2>Shipping speeds</h2>
      <p>Standard shipping takes 5–7 business days. Expedited shipping takes 2–3 business days.</p>
      <h2>Tracking</h2>
      <p>Once your order ships, you can track it from your Orders page.</p>
    </StaticPage>
  );
}
