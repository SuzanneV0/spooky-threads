import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserId } from "@/lib/auth";
import { newId, one } from "@/lib/db/client";
import type { Review } from "@/lib/queries";
import { firstIssueMessage, reviewSchema } from "@/lib/validation";

const submitSchema = reviewSchema.extend({ productId: z.string().uuid() });

// Create or replace the signed-in shopper's review of a product (one review per shopper per product).
export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Log in to leave a review." }, { status: 401 });

  const parsed = submitSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
  const { productId, rating, title, body } = parsed.data;

  const review = await one<Review>(
    `INSERT INTO reviews (id, product_id, user_id, rating, title, body) VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT (product_id, user_id) DO UPDATE SET rating = excluded.rating, title = excluded.title,
       body = excluded.body, created_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
     RETURNING *`,
    [newId(), productId, userId, rating, title || null, body || null]
  );
  return NextResponse.json({ review });
}
