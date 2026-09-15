import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

export type Product = Tables<"products">;
export type Collection = Tables<"collections">;

export async function getCollectionBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("collections").select("*").eq("slug", slug).single();
  return data;
}

export async function getProductsForCollectionSlug(slug: string): Promise<{
  collection: Collection | null;
  children: Collection[];
  products: Product[];
}> {
  const supabase = await createClient();
  const collection = await getCollectionBySlug(slug);
  if (!collection) return { collection: null, children: [], products: [] };

  if (collection.kind === "department") {
    const { data: children } = await supabase
      .from("collections")
      .select("*")
      .eq("parent_id", collection.id)
      .order("sort_order");

    const childIds = (children ?? []).map((c) => c.id);
    if (childIds.length === 0) return { collection, children: children ?? [], products: [] };

    const { data: links } = await supabase
      .from("product_collections")
      .select("product_id")
      .in("collection_id", childIds);

    const productIds = Array.from(new Set((links ?? []).map((l) => l.product_id)));
    if (productIds.length === 0) return { collection, children: children ?? [], products: [] };

    const { data: products } = await supabase.from("products").select("*").in("id", productIds);
    return { collection, children: children ?? [], products: products ?? [] };
  }

  const { data: links } = await supabase
    .from("product_collections")
    .select("product_id")
    .eq("collection_id", collection.id);

  const productIds = (links ?? []).map((l) => l.product_id);
  if (productIds.length === 0) return { collection, children: [], products: [] };

  const { data: products } = await supabase.from("products").select("*").in("id", productIds);
  return { collection, children: [], products: products ?? [] };
}

export async function getProductBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*").eq("slug", slug).single();
  return data;
}

export async function getReviewsForProduct(productId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getProductsByThemeSlug(slug: string, limit = 8) {
  const supabase = await createClient();
  const collection = await getCollectionBySlug(slug);
  if (!collection) return [];

  const { data: links } = await supabase
    .from("product_collections")
    .select("product_id")
    .eq("collection_id", collection.id)
    .limit(limit);

  const productIds = (links ?? []).map((l) => l.product_id);
  if (productIds.length === 0) return [];

  const { data: products } = await supabase.from("products").select("*").in("id", productIds).limit(limit);
  return products ?? [];
}

export async function getAllCollections() {
  const supabase = await createClient();
  const { data } = await supabase.from("collections").select("*").order("sort_order");
  return data ?? [];
}
