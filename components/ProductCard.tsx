"use client";

import Link from "next/link";
import ProductPhoto from "@/components/ProductPhoto";
import { useCart } from "@/components/CartProvider";
import type { Product } from "@/lib/queries";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <div className="card product-card">
      <Link href={`/products/${product.slug}`} className="product-card-art">
        <ProductPhoto slug={product.slug} productType={product.product_type} name={product.name} />
        {product.is_new && <span className="tag product-card-badge">New</span>}
      </Link>
      <div className="product-card-body">
        <Link href={`/products/${product.slug}`} className="product-card-name">
          {product.name}
        </Link>
        <p className="product-card-price">${(product.price_cents / 100).toFixed(2)}</p>
        <button
          className="button small"
          onClick={() =>
            addItem({
              productId: product.id,
              slug: product.slug,
              name: product.name,
              priceCents: product.price_cents,
              productType: product.product_type,
            })
          }
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}
