import type { Metadata } from "next";
import Link from "next/link";
import ProductRow from "@/components/ProductRow";
import { getProductsByThemeSlug } from "@/lib/queries";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Whimsical Goth Summer Style",
  description:
    "How to keep the whimsical goth aesthetic going in summer — breezy tees, ghost prints, and heat-friendly spooky-cute style from Spooky Threads.",
  alternates: { canonical: "/whimsical-goth/summer" },
};

const pageJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Whimsical Goth Summer Style",
  description: "A guide to whimsical goth style for summer, from Spooky Threads.",
  url: `${SITE_URL}/whimsical-goth/summer`,
  isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
};

export default async function WhimsicalGothSummerPage() {
  const products = await getProductsByThemeSlug("spooky-ghosts", 4);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />

      <section className="hero">
        <div className="container">
          <h1>Whimsical Goth Style for Summer</h1>
          <p>Haunted, but make it breathable.</p>
        </div>
      </section>

      <section className="container static-page-content whimsical-copy">
        <p>
          Summer is the season most people assume whimsical goth just sits out. It doesn&apos;t — it just
          gets lighter, literally. This is where the ghosts come in: soft, pale, floaty prints that read
          spooky-cute without a single ounce of black cardigan weighing you down. A friendly ghost on
          white cotton does more work in July than any amount of lace ever could.
        </p>
        <h2>What to reach for</h2>
        <p>
          Stick to single-layer tees in breathable cotton, and let the print carry the mood instead of
          the silhouette. Ghosts, moons, and pastel-on-white designs keep things cool in every sense —
          they photograph well against sand, sidewalk chalk, and popsicle-stained porches alike. Iced
          coffee (or a very cold Diet Coke) in a spooky tumbler counts as an accessory here, not an
          afterthought.
        </p>
        <p>
          If you only own the aesthetic in wool and velvet, summer is the gap in your closet worth
          filling first — it&apos;s the easiest season to prove whimsical goth is a personality, not a
          costume.
        </p>
      </section>

      <ProductRow title="Shop Spooky Ghosts" href="/collections/spooky-ghosts" products={products} />

      <section className="container static-page-content whimsical-copy">
        <p>
          <Link href="/whimsical-goth">← Back to Whimsical Goth, Year-Round</Link>
        </p>
      </section>
    </>
  );
}
