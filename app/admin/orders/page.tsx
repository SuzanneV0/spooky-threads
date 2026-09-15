"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Tables, Enums } from "@/lib/supabase/types";

type Order = Tables<"orders">;
type OrderStatus = Enums<"order_status">;

const statuses: OrderStatus[] = ["pending", "paid", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const supabase = createClient();

  async function load() {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data ?? []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateStatus(id: string, status: OrderStatus) {
    await supabase.from("orders").update({ status }).eq("id", id);
    load();
  }

  return (
    <div>
      <h1>Orders</h1>
      {orders.length === 0 ? (
        <p style={{ color: "var(--color-muted-text)" }}>No orders placed yet.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Placed</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>#{order.id.slice(0, 8)}</td>
                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                <td>${(order.total_cents / 100).toFixed(2)}</td>
                <td>
                  <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}>
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
