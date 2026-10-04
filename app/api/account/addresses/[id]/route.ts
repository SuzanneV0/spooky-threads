import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { db, run } from "@/lib/db/client";

type Params = { params: Promise<{ id: string }> };

// Make this address the shopper's default. Every query is scoped to the shopper's own rows.
export async function PATCH(_request: Request, { params }: Params) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const { id } = await params;

  await db().batch(
    [
      { sql: "UPDATE addresses SET is_default = 0 WHERE user_id = ?", args: [userId] },
      { sql: "UPDATE addresses SET is_default = 1 WHERE id = ? AND user_id = ?", args: [id, userId] },
    ],
    "write"
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Params) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const { id } = await params;

  await run("DELETE FROM addresses WHERE id = ? AND user_id = ?", [id, userId]);
  return NextResponse.json({ ok: true });
}
