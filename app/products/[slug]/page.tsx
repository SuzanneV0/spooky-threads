import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductPhoto from "@/components/ProductPhoto";
import ProductActions from "@/components/ProductActions";
import ReviewSection from "@/components/ReviewSection";
import { getProductBySlug, getReviewsForProduct } from "@/lib/queries";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return { title: "Product" };

  const description = product.description || `${product.name} from Spooky Threads.`;
  const image = `/products/${product.slug}.png`;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${slug}` },
    openGraph: {
      title: product.name,
      description,
      url: `/products/${slug}`,
      type: "website",
      images: [{ url: image, width: 1254, height: 1254, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: [image],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const reviews = await getReviewsForProduct(product.id);
  const ratingCount = reviews.length;
  const averageRating = ratingCount
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount
    : null;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || undefined,
    image: `${SITE_URL}/products/${product.slug}.png`,
    sku: product.id,
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/products/${slug}`,
      priceCurrency: "USD",
      price: (product.price_cents / 100).toFixed(2),
      availability: "https://schema.org/InStock",
    },
    ...(averageRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: averageRating.toFixed(1),
            reviewCount: ratingCount,
          },
        }
      : {}),
  };

  return (
    <div className="container product-detail">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <div className="product-detail-art">
        <ProductPhoto slug={product.slug} productType={product.product_type} name={product.name} sizes="(max-width: 768px) 100vw, 380px" />
      </div>

      <div className="product-detail-info">
        {product.is_new && <span className="tag">New</span>}
        <h1>{product.name}</h1>
        <p className="product-detail-price">${(product.price_cents / 100).toFixed(2)}</p>
        <p>{product.description}</p>

        <ProductActions product={product} />

        <details className="wash-instructions">
          <summary>Wash instructions</summary>
          <p>{product.wash_instructions}</p>
        </details>
      </div>

      <div className="product-detail-reviews">
        <ReviewSection productId={product.id} initialReviews={reviews} />
      </div>
    </div>
  );
}
