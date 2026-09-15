"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import ProductArt from "@/components/ProductArt";

export default function CartPage() {
  const { lines, subtotalCents, setQuantity, removeItem } = useCart();

  if (lines.length === 0) {
    return (
      <div className="container" style={{ padding: "3rem 1.25rem" }}>
        <h1>Your cart</h1>
        <p>Your cart is empty. <Link href="/collections">Start shopping →</Link></p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "3rem 1.25rem" }}>
      <h1>Your cart</h1>
      <ul className="cart-list">
        {lines.map((line) => (
          <li key={line.productId} className="card cart-line">
            <div className="cart-line-art">
              <ProductArt slug={line.slug} productType={line.productType} />
            </div>
            <div className="cart-line-info">
              <Link href={`/products/${line.slug}`}>{line.name}</Link>
              <p>${(line.priceCents / 100).toFixed(2)}</p>
            </div>
            <div className="quantity-stepper">
              <button onClick={() => setQuantity(line.productId, line.quantity - 1)} aria-label="Decrease quantity">
                −
              </button>
              <input
                type="number"
                min={1}
                value={line.quantity}
                onChange={(e) => setQuantity(line.productId, Math.max(1, Number(e.target.value) || 1))}
              />
              <button onClick={() => setQuantity(line.productId, line.quantity + 1)} aria-label="Increase quantity">
                +
              </button>
            </div>
            <p className="cart-line-total">${((line.priceCents * line.quantity) / 100).toFixed(2)}</p>
            <button className="button secondary small" onClick={() => removeItem(line.productId)}>
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="cart-summary">
        <p>Subtotal: <strong>${(subtotalCents / 100).toFixed(2)}</strong></p>
        <button className="button" disabled title="Stripe checkout is coming in the course">
          Checkout (coming soon)
        </button>
      </div>
    </div>
  );
}
