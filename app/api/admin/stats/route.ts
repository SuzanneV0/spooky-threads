import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/auth";
import { one } from "@/lib/db/client";

export async function GET() {
  if (!(await getAdminUserId())) return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const counts = await one<{ products: number; orders: number; users: number }>(
    `SELECT (SELECT COUNT(*) FROM products) AS products,
            (SELECT COUNT(*) FROM orders) AS orders,
            (SELECT COUNT(*) FROM profiles) AS users`
  );
  return NextResponse.json(counts);
}
