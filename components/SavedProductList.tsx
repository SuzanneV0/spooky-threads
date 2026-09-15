"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/queries";

export default function SavedProductList({ kind, title }: { kind: "saved" | "wishlist"; title: string }) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[] | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: links } = await supabase
        .from("user_product_lists")
        .select("product_id")
        .eq("user_id", user.id)
        .eq("kind", kind);

      const ids = (links ?? []).map((l) => l.product_id);
      if (ids.length === 0) {
        setProducts([]);
        return;
      }
      const { data } = await supabase.from("products").select("*").in("id", ids);
      setProducts(data ?? []);
    })();
  }, [user, kind, supabase]);

  return (
    <div>
      <h1>{title}</h1>
      {products === null ? (
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p style={{ color: "var(--color-muted-text)" }}>Nothing here yet — browse the shop to add items.</p>
      ) : (
        <div className="grid cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
