import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/auth";
import { all, newId, run } from "@/lib/db/client";
import type { Product } from "@/lib/queries";
import { firstIssueMessage, productFormSchema } from "@/lib/validation";

export async function GET() {
  if (!(await getAdminUserId())) return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const products = await all<Product>("SELECT * FROM products ORDER BY created_at DESC");
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  if (!(await getAdminUserId())) return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const parsed = productFormSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
  const p = parsed.data;

  try {
    await run(
      `INSERT INTO products (id, slug, name, description, price_cents, wash_instructions, product_type, is_new)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [newId(), p.slug, p.name, p.description, p.price_cents, p.wash_instructions, p.product_type, p.is_new ? 1 : 0]
    );
  } catch {
    return NextResponse.json({ error: "A product with that slug already exists." }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}
