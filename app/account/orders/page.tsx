"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/types";

type Order = Tables<"orders"> & { order_items: Tables<"order_items">[] };

const statusLabel: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setOrders((data as Order[]) ?? []);
    })();
  }, [user, supabase]);

  return (
    <div>
      <h1>Orders</h1>
      {orders === null ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <p style={{ color: "var(--color-muted-text)" }}>No orders yet — your orders will show up here once you check out.</p>
      ) : (
        <ul className="order-list">
          {orders.map((order) => (
            <li key={order.id} className="card order-item">
              <div className="order-item-header">
                <span>Order #{order.id.slice(0, 8)}</span>
                <span className="tag">{statusLabel[order.status]}</span>
              </div>
              <p>{new Date(order.created_at).toLocaleDateString()}</p>
              <ul>
                {order.order_items.map((item) => (
                  <li key={item.id}>
                    {item.quantity}× {item.product_name} — ${(item.price_cents / 100).toFixed(2)}
                  </li>
                ))}
              </ul>
              <p className="order-total">Total: ${(order.total_cents / 100).toFixed(2)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
