import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { all, placeholders } from "@/lib/db/client";
import type { Tables } from "@/lib/db/types";

type Order = Tables<"orders">;
type OrderItem = Tables<"order_items">;

// The signed-in shopper's orders, newest first, each with its line items.
export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  const orders = await all<Order>("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC", [userId]);
  const items = orders.length
    ? await all<OrderItem>(
        `SELECT * FROM order_items WHERE order_id IN (${placeholders(orders.length)})`,
        orders.map((o) => o.id)
      )
    : [];

  return NextResponse.json({
    orders: orders.map((order) => ({ ...order, order_items: items.filter((i) => i.order_id === order.id) })),
  });
}
