"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";

export default function CheckoutSuccessPage() {
  const { clear } = useCart();

  useEffect(() => {
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container" style={{ padding: "4rem 1.25rem", textAlign: "center" }}>
      <h1>Thank you! 🎃</h1>
      <p style={{ color: "var(--color-muted-text)" }}>
        Your order is confirmed — it'll show up in your order history shortly.
      </p>
      <Link href="/account/orders" className="button" style={{ marginTop: "1.5rem", display: "inline-flex" }}>
        View your orders
      </Link>
    </div>
  );
}
