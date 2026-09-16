import type { Metadata } from "next";
import Image from "next/image";
import ProductRow from "@/components/ProductRow";
import { getProductsByThemeSlug } from "@/lib/queries";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
};

export default async function Home() {
  const [newArrivals, halloween, fall] = await Promise.all([
    getProductsByThemeSlug("new", 10),
    getProductsByThemeSlug("halloween"),
    getProductsByThemeSlug("fall"),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      <section className="hero">
        <div className="container">
          <h1>🎃 Spooky Threads</h1>
          <p>Halloween apparel and home goods, cursed to look this good all season long.</p>
        </div>
      </section>

      <section className="hero-banner">
        <Image
          src="/hero-banner.jpg"
          alt="Two friends in pumpkin-head costumes"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center 48%" }}
        />
      </section>

      <ProductRow title="New Arrivals" href="/collections/new" products={newArrivals} />
      <ProductRow title="Halloween Must-Haves" href="/collections/halloween" products={halloween} />
      <ProductRow title="Cozy Fall Favorites" href="/collections/fall" products={fall} />
    </>
  );
}
