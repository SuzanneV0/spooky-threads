import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/auth";
import { run } from "@/lib/db/client";
import { firstIssueMessage, productFormSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  if (!(await getAdminUserId())) return NextResponse.json({ error: "Admins only." }, { status: 403 });
  const { id } = await params;

  const parsed = productFormSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
  const p = parsed.data;

  try {
    await run(
      `UPDATE products SET slug = ?, name = ?, description = ?, price_cents = ?, wash_instructions = ?,
         product_type = ?, is_new = ? WHERE id = ?`,
      [p.slug, p.name, p.description, p.price_cents, p.wash_instructions, p.product_type, p.is_new ? 1 : 0, id]
    );
  } catch {
    return NextResponse.json({ error: "A product with that slug already exists." }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await getAdminUserId())) return NextResponse.json({ error: "Admins only." }, { status: 403 });
  const { id } = await params;

  await run("DELETE FROM products WHERE id = ?", [id]);
  return NextResponse.json({ ok: true });
}
