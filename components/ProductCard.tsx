"use client";

import Link from "next/link";
import ProductPhoto from "@/components/ProductPhoto";
import { useCart } from "@/components/CartProvider";
import { useCompare, COMPARE_MAX_ITEMS } from "@/components/CompareProvider";
import { requiresSize } from "@/lib/sizes";
import type { Product } from "@/lib/queries";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { items, isSelected, toggle } = useCompare();
  const needsSize = requiresSize(product.product_type);
  const compareSelected = isSelected(product.id);
  const compareDisabled = !compareSelected && items.length >= COMPARE_MAX_ITEMS;

  return (
    <div className="card product-card">
      <div className="product-card-art-wrap">
        <Link href={`/products/${product.slug}`} className="product-card-art">
          <ProductPhoto slug={product.slug} productType={product.product_type} name={product.name} />
          {product.is_new && <span className="tag product-card-badge">New</span>}
        </Link>
        <label
          className={`product-card-compare${compareDisabled ? " disabled" : ""}`}
          title={compareDisabled ? `You can compare up to ${COMPARE_MAX_ITEMS} products` : undefined}
        >
          <input
            type="checkbox"
            checked={compareSelected}
            disabled={compareDisabled}
            onChange={() => toggle({ id: product.id, slug: product.slug, name: product.name })}
          />
          Compare
        </label>
      </div>
      <div className="product-card-body">
        <Link href={`/products/${product.slug}`} className="product-card-name">
          {product.name}
        </Link>
        <p className="product-card-price">${(product.price_cents / 100).toFixed(2)}</p>
        {needsSize ? (
          <Link href={`/products/${product.slug}`} className="button small">
            Select size
          </Link>
        ) : (
          <button
            className="button small"
            onClick={() =>
              addItem({
                productId: product.id,
                slug: product.slug,
                name: product.name,
                priceCents: product.price_cents,
                productType: product.product_type,
                size: null,
              })
            }
          >
            Add to cart
          </button>
        )}
      </div>
    </div>
  );
}
