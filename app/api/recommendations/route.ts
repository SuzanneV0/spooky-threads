import { NextResponse } from "next/server";
import { getProductsByThemeSlug } from "@/lib/queries";
import { tropes, type TropeSlug } from "@/lib/quizTropes";

// Up to four products from the collection that matches a quiz result.
export async function GET(request: Request) {
  const trope = new URL(request.url).searchParams.get("trope") as TropeSlug | null;
  if (!trope || !tropes[trope]) return NextResponse.json({ products: [] });

  return NextResponse.json({ products: await getProductsByThemeSlug(trope, 4) });
}
