"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/queries";

export default function SavedProductList({ kind, title }: { kind: "saved" | "wishlist"; title: string }) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const res = await fetch(`/api/lists?kind=${kind}`, { cache: "no-store" }).catch(() => null);
      setProducts(res?.ok ? (await res.json()).products : []);
    })();
  }, [user, kind]);

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
