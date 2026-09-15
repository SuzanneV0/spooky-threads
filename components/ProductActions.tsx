"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/lib/queries";

export default function ProductActions({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [listStatus, setListStatus] = useState<string | null>(null);
  const { addItem } = useCart();
  const { user } = useAuth();
  const supabase = createClient();

  async function saveToList(kind: "saved" | "wishlist") {
    if (!user) {
      setListStatus("Log in to save items.");
      return;
    }
    const { error } = await supabase
      .from("user_product_lists")
      .upsert({ user_id: user.id, product_id: product.id, kind }, { onConflict: "user_id,product_id,kind" });
    setListStatus(error ? "Something went wrong." : kind === "saved" ? "Saved for later." : "Added to wishlist.");
  }

  return (
    <div className="product-actions">
      <div className="quantity-row">
        <label htmlFor="qty" className="visually-hidden">
          Quantity
        </label>
        <div className="quantity-stepper">
          <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
            −
          </button>
          <input
            id="qty"
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
          />
          <button type="button" onClick={() => setQuantity((q) => q + 1)} aria-label="Increase quantity">
            +
          </button>
        </div>
        <button
          className="button"
          onClick={() =>
            addItem(
              {
                productId: product.id,
                slug: product.slug,
                name: product.name,
                priceCents: product.price_cents,
                productType: product.product_type,
              },
              quantity
            )
          }
        >
          Add to cart
        </button>
      </div>

      <div className="save-row">
        <button className="button secondary small" onClick={() => saveToList("saved")}>
          Save for later
        </button>
        <button className="button secondary small" onClick={() => saveToList("wishlist")}>
          Add to wishlist
        </button>
      </div>
      {listStatus && <p className="list-status">{listStatus}</p>}
    </div>
  );
}
