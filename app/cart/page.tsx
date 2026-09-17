"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useCart } from "@/components/CartProvider";
import ProductPhoto from "@/components/ProductPhoto";

export default function CartPage() {
  const { user } = useAuth();
  const { lines, subtotalCents, setQuantity, removeItem } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  async function checkout() {
    setCheckingOut(true);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((line) => ({ productId: line.productId, quantity: line.quantity, size: line.size })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setCheckoutError(data.error ?? "Something went wrong starting checkout.");
        setCheckingOut(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setCheckoutError("Something went wrong starting checkout.");
      setCheckingOut(false);
    }
  }

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
          <li key={`${line.productId}-${line.size ?? ""}`} className="card cart-line">
            <div className="cart-line-art">
              <ProductPhoto slug={line.slug} productType={line.productType} name={line.name} sizes="64px" />
            </div>
            <div className="cart-line-info">
              <Link href={`/products/${line.slug}`}>{line.name}</Link>
              {line.size && <p className="cart-line-size">Size: {line.size}</p>}
              <p>${(line.priceCents / 100).toFixed(2)}</p>
            </div>
            <div className="quantity-stepper">
              <button
                onClick={() => setQuantity(line.productId, line.size, line.quantity - 1)}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                value={line.quantity}
                onChange={(e) =>
                  setQuantity(line.productId, line.size, Math.max(1, Number(e.target.value) || 1))
                }
              />
              <button
                onClick={() => setQuantity(line.productId, line.size, line.quantity + 1)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <p className="cart-line-total">${((line.priceCents * line.quantity) / 100).toFixed(2)}</p>
            <button className="button secondary small" onClick={() => removeItem(line.productId, line.size)}>
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="cart-summary">
        <p>Subtotal: <strong>${(subtotalCents / 100).toFixed(2)}</strong></p>
        {checkoutError && <p className="form-error">{checkoutError}</p>}
        {user ? (
          <button className="button" onClick={checkout} disabled={checkingOut}>
            {checkingOut ? "Redirecting…" : "Checkout"}
          </button>
        ) : (
          <Link href="/login" className="button">
            Log in to checkout
          </Link>
        )}
      </div>
    </div>
  );
}
