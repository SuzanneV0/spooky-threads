import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { getProductsForCollectionSlug } from "@/lib/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { collection, products } = await getProductsForCollectionSlug(slug);

  if (!collection) return { title: "Collection" };

  const description = `Shop ${collection.name} at Spooky Threads — ${products.length} Halloween ${
    products.length === 1 ? "item" : "items"
  } including apparel and home goods.`;

  return {
    title: collection.name,
    description,
    alternates: { canonical: `/collections/${slug}` },
    openGraph: { title: collection.name, description, url: `/collections/${slug}` },
  };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { collection, children, products } = await getProductsForCollectionSlug(slug);

  if (!collection) notFound();

  return (
    <div className="container" style={{ padding: "3rem 1.25rem" }}>
      <h1>{collection.name}</h1>

      {children.length > 0 && (
        <ul className="collection-list">
          {children.map((child) => (
            <li key={child.id}>
              <Link href={`/collections/${child.slug}`}>{child.name}</Link>
            </li>
          ))}
        </ul>
      )}

      {products.length === 0 ? (
        <p style={{ color: "var(--color-muted-text)" }}>No products in this collection yet.</p>
      ) : (
        <div className="grid cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
