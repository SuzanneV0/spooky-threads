import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserId } from "@/lib/auth";
import { all, newId, run } from "@/lib/db/client";
import type { Product } from "@/lib/queries";

const kindSchema = z.enum(["saved", "wishlist"]);

// The signed-in shopper's "Saved for later" or "Wishlist" products.
export async function GET(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  const kind = kindSchema.safeParse(new URL(request.url).searchParams.get("kind"));
  if (!kind.success) return NextResponse.json({ error: "Unknown list." }, { status: 400 });

  const products = await all<Product>(
    `SELECT p.* FROM products p JOIN user_product_lists l ON l.product_id = p.id
     WHERE l.user_id = ? AND l.kind = ? ORDER BY l.created_at DESC`,
    [userId, kind.data]
  );
  return NextResponse.json({ products });
}

const addSchema = z.object({ productId: z.string().uuid(), kind: kindSchema });

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Log in to save items." }, { status: 401 });

  const parsed = addSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  await run(
    "INSERT OR IGNORE INTO user_product_lists (id, user_id, product_id, kind) VALUES (?, ?, ?, ?)",
    [newId(), userId, parsed.data.productId, parsed.data.kind]
  );
  return NextResponse.json({ ok: true });
}
