import type { Metadata } from "next";
import Link from "next/link";
import ProductRow from "@/components/ProductRow";
import { getProductsByThemeSlug } from "@/lib/queries";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Whimsical Goth Winter Style",
  description:
    "Whimsical goth style for winter — cable knits, candlelit mugs, and cozy dark-academia layers from Spooky Threads.",
  alternates: { canonical: "/whimsical-goth/winter" },
};

const pageJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Whimsical Goth Winter Style",
  description: "A guide to whimsical goth style for winter, from Spooky Threads.",
  url: `${SITE_URL}/whimsical-goth/winter`,
  isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
};

export default async function WhimsicalGothWinterPage() {
  const products = await getProductsByThemeSlug("sweaters", 4);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />

      <section className="hero">
        <div className="container">
          <h1>Whimsical Goth Style for Winter</h1>
          <p>Dark academia's cozier little sister.</p>
        </div>
      </section>

      <section className="container static-page-content whimsical-copy">
        <p>
          Winter is where whimsical goth trades its playfulness for warmth without losing an ounce of
          personality. The silhouettes get bulkier, the palette goes moodier, and every print looks a
          little more like it belongs in candlelight. This is the season for the sweater you bought in
          October and haven&apos;t taken off since — the one with the ghosts, or the moon, or the witch&apos;s
          hat knit right into the pattern.
        </p>
        <h2>What to reach for</h2>
        <p>
          Cable-knit sweaters and cardigans do the heavy lifting here, paired with a blanket you don&apos;t
          feel guilty about never folding and a mug that&apos;s basically part of your hand from December
          through February. Beanies replace hats as the daily accessory, and everything gets a little
          more &ldquo;reading by the fire&rdquo; and a little less &ldquo;trick-or-treating.&rdquo;
        </p>
        <p>
          It&apos;s the quietest version of the aesthetic, and honestly, the coziest — proof that whimsical
          goth was never really about the scare factor to begin with.
        </p>
      </section>

      <ProductRow title="Shop Sweaters" href="/collections/sweaters" products={products} />

      <section className="container static-page-content whimsical-copy">
        <p>
          <Link href="/whimsical-goth">← Back to Whimsical Goth, Year-Round</Link>
        </p>
      </section>
    </>
  );
}
