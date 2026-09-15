import { notFound } from "next/navigation";
import ProductPhoto from "@/components/ProductPhoto";
import ProductActions from "@/components/ProductActions";
import ReviewSection from "@/components/ReviewSection";
import { getProductBySlug, getReviewsForProduct } from "@/lib/queries";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product ? `${product.name} — Spooky Threads` : "Product — Spooky Threads" };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const reviews = await getReviewsForProduct(product.id);

  return (
    <div className="container product-detail">
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
