import type { Product } from "@/lib/products";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="card">
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <p>${(product.priceInCents / 100).toFixed(2)}</p>
      <button className="button">Add to cart</button>
    </div>
  );
}
