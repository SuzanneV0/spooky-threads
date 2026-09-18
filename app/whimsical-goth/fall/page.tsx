import type { Metadata } from "next";
import Link from "next/link";
import ProductRow from "@/components/ProductRow";
import { getProductsByThemeSlug } from "@/lib/queries";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Whimsical Goth Fall Style",
  description:
    "Whimsical goth style hits its stride in fall — cardigans, candy corn, and every cozy print in the Spooky Threads catalog.",
  alternates: { canonical: "/whimsical-goth/fall" },
};

const pageJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Whimsical Goth Fall Style",
  description: "A guide to whimsical goth style for fall, from Spooky Threads.",
  url: `${SITE_URL}/whimsical-goth/fall`,
  isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
};

export default async function WhimsicalGothFallPage() {
  const products = await getProductsByThemeSlug("fall", 4);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />

      <section className="hero">
        <div className="container">
          <h1>Whimsical Goth Style for Fall</h1>
          <p>Home turf. No notes.</p>
        </div>
      </section>

      <section className="container static-page-content whimsical-copy">
        <p>
          If whimsical goth has a hometown, it&apos;s autumn. This is the one season where the aesthetic
          doesn&apos;t need to compromise for the weather at all — cardigans, cable knits, and every
          pumpkin, bat, and black cat print in the catalog were basically designed for exactly this
          stretch of the calendar. It&apos;s less about restraint here and more about how many good pieces
          you can layer before the first frost.
        </p>
        <h2>What to reach for</h2>
        <p>
          Lean all the way in: a graphic tee under a chunky cardigan, a beanie the second there&apos;s a
          chill in the air, and mugs doing double duty as both drinkware and decor on every surface in
          your kitchen. This is the season for the loud prints you&apos;ve been saving — the ones that
          feel like too much in June and exactly right in October.
        </p>
        <p>
          It&apos;s also the best time to build pieces that&apos;ll carry into winter, since fall and
          winter whimsical goth overlap more than any other two seasons on this list.
        </p>
      </section>

      <ProductRow title="Shop Fall" href="/collections/fall" products={products} />

      <section className="container static-page-content whimsical-copy">
        <p>
          <Link href="/whimsical-goth">← Back to Whimsical Goth, Year-Round</Link>
        </p>
      </section>
    </>
  );
}
