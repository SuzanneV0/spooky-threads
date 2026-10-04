"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminOverview() {
  const [counts, setCounts] = useState<{ products: number; orders: number; users: number } | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/stats", { cache: "no-store" }).catch(() => null);
      setCounts(res?.ok ? await res.json() : { products: 0, orders: 0, users: 0 });
    })();
  }, []);

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
