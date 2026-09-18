import type { Metadata } from "next";
import Link from "next/link";
import ProductRow from "@/components/ProductRow";
import { getProductsByThemeSlug } from "@/lib/queries";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Whimsical Goth Spring Style",
  description:
    "How to wear whimsical goth in spring — light layers, storybook prints, and everyday spooky-cute pieces from Spooky Threads.",
  alternates: { canonical: "/whimsical-goth/spring" },
};

const pageJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Whimsical Goth Spring Style",
  description: "A guide to whimsical goth style for spring, from Spooky Threads.",
  url: `${SITE_URL}/whimsical-goth/spring`,
  isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
};

export default async function WhimsicalGothSpringPage() {
  const products = await getProductsByThemeSlug("magical-witches", 4);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />

      <section className="hero">
        <div className="container">
          <h1>Whimsical Goth Style for Spring</h1>
          <p>Garden witch energy, minus the thorns.</p>
        </div>
      </section>

      <section className="container static-page-content whimsical-copy">
        <p>
          Spring is when whimsical goth gets to stretch out. The layers get lighter, the palette softens
          just enough to let a little lavender and sage in next to the black, and the whole look starts
          leaning less &ldquo;haunted house&rdquo; and more &ldquo;witch who tends a very good garden.&rdquo;
          Think embroidered moons instead of screaming skulls, and a cardigan you can tie around your
          waist instead of a full cloak.
        </p>
        <h2>What to reach for</h2>
        <p>
          This is prime season for our witchier prints — broomsticks, crescent moons, and starry
          florals in softer knits you can wear over a sundress or under a light jacket without
          overheating. Swap heavy boots for something with a little more spring in your step, and let
          one statement piece (a sweater, a tee) do the talking while everything else stays simple.
        </p>
        <p>
          It&apos;s also a good time to lean into accessories over outerwear — a mug on the patio table,
          a tumbler for cold brew season starting early. Whimsical goth doesn&apos;t take a season off; it
          just changes clothes.
        </p>
      </section>

      <ProductRow title="Shop Magical Witches" href="/collections/magical-witches" products={products} />

      <section className="container static-page-content whimsical-copy">
        <p>
          <Link href="/whimsical-goth">← Back to Whimsical Goth, Year-Round</Link>
        </p>
      </section>
    </>
  );
}
