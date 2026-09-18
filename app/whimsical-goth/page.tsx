import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Whimsical Goth, Year-Round",
  description:
    "Whimsical goth isn't just for October. Discover cozy, spooky-cute style for every season — spring, summer, fall, and winter — from Spooky Threads.",
  alternates: { canonical: "/whimsical-goth" },
};

const seasons = [
  {
    slug: "spring",
    emoji: "🌱",
    label: "Spring",
    teaser: "Pastel-meets-midnight layers for the season of renewal.",
  },
  {
    slug: "summer",
    emoji: "🦇",
    label: "Summer",
    teaser: "Light, breezy pieces that keep the spooky-cute going in the heat.",
  },
  {
    slug: "fall",
    emoji: "🎃",
    label: "Fall",
    teaser: "Home turf. Every cardigan and candle you've been waiting for.",
  },
  {
    slug: "winter",
    emoji: "🕯️",
    label: "Winter",
    teaser: "Cable knits, cocoa mugs, and the coziest kind of dark academia.",
  },
];

const pageJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Whimsical Goth, Year-Round",
  description:
    "A year-round guide to whimsical goth style, season by season, from Spooky Threads.",
  url: `${SITE_URL}/whimsical-goth`,
  isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
};

export default function WhimsicalGothPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />

      <section className="hero">
        <div className="container">
          <h1>Whimsical Goth, Year-Round</h1>
          <p>
            Halloween is just the loudest month of a style that never really quiets down.
          </p>
        </div>
      </section>

      <section className="container static-page-content whimsical-copy">
        <p>
          Whimsical goth isn&apos;t a costume you put away on November 1st — it&apos;s ghosts on your
          sweater in July, a witch&apos;s hat on the coat rack in April, and a black cat mug on your desk
          in every month that has a letter in it. It&apos;s spooky without being scary, dark without being
          heavy, and cute enough that your grandmother compliments it at brunch.
        </p>
        <p>
          At Spooky Threads, we design for that feeling all twelve months of the year. Below, we&apos;ve
          broken down how the aesthetic shifts with the seasons — what to layer, what to swap, and which
          pieces from our collections carry it through spring, summer, fall, and winter.
        </p>
      </section>

      <section className="container whimsical-season-section">
        <div className="grid whimsical-season-grid">
          {seasons.map((season) => (
            <Link key={season.slug} href={`/whimsical-goth/${season.slug}`} className="card whimsical-season-card">
              <span className="whimsical-season-emoji">{season.emoji}</span>
              <h2>{season.label}</h2>
              <p>{season.teaser}</p>
              <span className="whimsical-season-link">Read the guide →</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
