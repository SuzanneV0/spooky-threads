import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminUserId } from "@/lib/auth";
import { all, run } from "@/lib/db/client";
import type { Tables } from "@/lib/db/types";
import { Constants } from "@/lib/db/types";

export async function GET() {
  if (!(await getAdminUserId())) return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const orders = await all<Tables<"orders">>("SELECT * FROM orders ORDER BY created_at DESC");
  return NextResponse.json({ orders });
}

const statusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(Constants.public.Enums.order_status),
});

export async function PATCH(request: Request) {
  if (!(await getAdminUserId())) return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const parsed = statusSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid status." }, { status: 400 });

  await run("UPDATE orders SET status = ? WHERE id = ?", [parsed.data.status, parsed.data.id]);
  return NextResponse.json({ ok: true });
}
