import type { Metadata } from "next";
import Link from "next/link";
import ProductPhoto from "@/components/ProductPhoto";
import { getProductsBySlugs, getReviewsForProduct } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Compare Products",
  description: "Compare Spooky Threads products side by side.",
  robots: { index: false, follow: true },
};

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ slugs?: string }>;
}) {
  const { slugs: slugsParam } = await searchParams;
  const slugs = (slugsParam ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);

  const products = slugs.length > 0 ? await getProductsBySlugs(slugs) : [];
  const ordered = slugs
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (ordered.length === 0) {
    return (
      <div className="container compare-page">
        <h1>Compare Products</h1>
        <p style={{ color: "var(--color-muted-text)" }}>
          You haven&apos;t picked any products to compare yet. Check the &ldquo;Compare&rdquo; box on a
          product card while browsing, then come back here.
        </p>
        <Link href="/collections" className="button">
          Browse collections
        </Link>
      </div>
    );
  }

  const ratings = await Promise.all(
    ordered.map(async (product) => {
      const reviews = await getReviewsForProduct(product.id);
      const count = reviews.length;
      const average = count ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : null;
      return { average, count };
    })
  );

  return (
    <div className="container compare-page">
      <h1>Compare Products</h1>

      <div className="compare-table-scroll">
        <div className="compare-table" style={{ "--compare-cols": ordered.length } as React.CSSProperties}>
          <div className="compare-row">
            <div className="compare-row-label" />
            {ordered.map((product) => (
              <div key={product.id} className="compare-cell compare-cell-photo">
                <Link href={`/products/${product.slug}`}>
                  <ProductPhoto slug={product.slug} productType={product.product_type} name={product.name} />
                </Link>
                <Link href={`/products/${product.slug}`} className="compare-cell-name">
                  {product.name}
                </Link>
              </div>
            ))}
          </div>

          <div className="compare-row">
            <div className="compare-row-label">Price</div>
            {ordered.map((product) => (
              <div key={product.id} className="compare-cell">
                ${(product.price_cents / 100).toFixed(2)}
              </div>
            ))}
          </div>

          <div className="compare-row">
            <div className="compare-row-label">Type</div>
            {ordered.map((product) => (
              <div key={product.id} className="compare-cell compare-cell-capitalize">
                {product.product_type}
              </div>
            ))}
          </div>

          <div className="compare-row">
            <div className="compare-row-label">Rating</div>
            {ordered.map((product, i) => (
              <div key={product.id} className="compare-cell">
                {ratings[i].average
                  ? `${ratings[i].average!.toFixed(1)} ★ (${ratings[i].count})`
                  : "No reviews yet"}
              </div>
            ))}
          </div>

          <div className="compare-row">
            <div className="compare-row-label">Description</div>
            {ordered.map((product) => (
              <div key={product.id} className="compare-cell">
                {product.description || "—"}
              </div>
            ))}
          </div>

          <div className="compare-row">
            <div className="compare-row-label">Care</div>
            {ordered.map((product) => (
              <div key={product.id} className="compare-cell">
                {product.wash_instructions || "—"}
              </div>
            ))}
          </div>

          <div className="compare-row">
            <div className="compare-row-label" />
            {ordered.map((product) => (
              <div key={product.id} className="compare-cell">
                <Link href={`/products/${product.slug}`} className="button small">
                  View product
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
