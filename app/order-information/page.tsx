import StaticPage from "@/components/StaticPage";

export const metadata = { title: "Order Information — Spooky Threads" };

export default function OrderInformationPage() {
  return (
    <StaticPage title="Order Information">
      <p>This is placeholder order text for a practice storefront — replace it with your real policy before launch.</p>
      <h2>Order status</h2>
      <p>You can view the status of any order — pending, paid, shipped, or delivered — from your Orders page.</p>
      <h2>Changing an order</h2>
      <p>Contact us as soon as possible if you need to change or cancel an order before it ships.</p>
    </StaticPage>
  );
}
