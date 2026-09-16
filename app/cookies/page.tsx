import StaticPage from "@/components/StaticPage";

export const metadata = {
  title: "Cookie Policy",
  description: "How Spooky Threads uses cookies on this site.",
};

export default function CookiesPage() {
  return (
    <StaticPage title="Cookie Policy">
      <p>This is placeholder policy text for a practice storefront — replace it with your real policy before launch.</p>
      <h2>Essential cookies</h2>
      <p>We use cookies to keep you signed in and to remember the contents of your shopping cart.</p>
      <h2>Analytics</h2>
      <p>We may use anonymous analytics cookies to understand how shoppers use the site and improve it.</p>
    </StaticPage>
  );
}
