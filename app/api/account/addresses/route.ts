import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { all, newId, one, run } from "@/lib/db/client";
import type { Tables } from "@/lib/db/types";
import { addressSchema, firstIssueMessage } from "@/lib/validation";

type Address = Tables<"addresses">;

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  const addresses = await all<Address>(
    "SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at",
    [userId]
  );
  return NextResponse.json({ addresses });
}

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  const parsed = addressSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
  const a = parsed.data;

  // A shopper's first address becomes their default.
  const existing = await one<{ n: number }>("SELECT COUNT(*) AS n FROM addresses WHERE user_id = ?", [userId]);
  await run(
    `INSERT INTO addresses (id, user_id, label, full_name, line1, line2, city, state, postal_code, country, is_default)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [newId(), userId, a.label, a.full_name, a.line1, a.line2 || null, a.city, a.state, a.postal_code, a.country,
     existing?.n ? 0 : 1]
  );
  return NextResponse.json({ ok: true });
}
