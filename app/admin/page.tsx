"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AdminOverview() {
  const [counts, setCounts] = useState<{ products: number; orders: number; users: number } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const [products, orders, users] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      setCounts({
        products: products.count ?? 0,
        orders: orders.count ?? 0,
        users: users.count ?? 0,
      });
    })();
  }, [supabase]);

  return (
    <div>
      <h1>Admin</h1>
      <div className="grid cols-3">
        <Link href="/admin/products" className="card account-tile">
          <h3>Products</h3>
          <p>{counts ? counts.products : "..."} products</p>
        </Link>
        <Link href="/admin/orders" className="card account-tile">
          <h3>Orders</h3>
          <p>{counts ? counts.orders : "..."} orders</p>
        </Link>
        <div className="card account-tile">
          <h3>Customers</h3>
          <p>{counts ? counts.users : "..."} accounts</p>
        </div>
      </div>
    </div>
  );
}
