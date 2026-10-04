import { all, one, placeholders } from "@/lib/db/client";
import type { Tables } from "@/lib/db/types";

export type Product = Tables<"products">;
export type Collection = Tables<"collections">;
export type Review = Tables<"reviews">;

export async function getCollectionBySlug(slug: string) {
  return one<Collection>("SELECT * FROM collections WHERE slug = ?", [slug]);
}

async function getProductsInCollections(collectionIds: string[], limit?: number): Promise<Product[]> {
  if (collectionIds.length === 0) return [];
  return all<Product>(
    `SELECT * FROM products WHERE id IN (
       SELECT product_id FROM product_collections WHERE collection_id IN (${placeholders(collectionIds.length)})
     ) ORDER BY created_at${limit ? " LIMIT ?" : ""}`,
    limit ? [...collectionIds, limit] : collectionIds
  );
}

export async function getProductsForCollectionSlug(slug: string): Promise<{
  collection: Collection | null;
  children: Collection[];
  products: Product[];
}> {
  const collection = await getCollectionBySlug(slug);
  if (!collection) return { collection: null, children: [], products: [] };

  if (collection.kind === "department") {
    const children = await all<Collection>(
      "SELECT * FROM collections WHERE parent_id = ? ORDER BY sort_order",
      [collection.id]
    );
    const products = await getProductsInCollections(children.map((c) => c.id));
    return { collection, children, products };
  }

  const products = await getProductsInCollections([collection.id]);
  return { collection, children: [], products };
}

export async function getProductBySlug(slug: string) {
  return one<Product>("SELECT * FROM products WHERE slug = ?", [slug]);
}

export async function getProductsBySlugs(slugs: string[]) {
  if (slugs.length === 0) return [];
  return all<Product>(`SELECT * FROM products WHERE slug IN (${placeholders(slugs.length)})`, slugs);
}

export async function getProductsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  return all<Product>(`SELECT * FROM products WHERE id IN (${placeholders(ids.length)})`, ids);
}

export async function getReviewsForProduct(productId: string) {
  return all<Review>("SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC", [productId]);
}

export async function getProductsByThemeSlug(slug: string, limit = 8) {
  const collection = await getCollectionBySlug(slug);
  if (!collection) return [];
  return getProductsInCollections([collection.id], limit);
}

export async function getAllCollections() {
  return all<Collection>("SELECT * FROM collections ORDER BY sort_order");
}

export async function getProductCatalogForAssistant() {
  return all<Pick<Product, "name" | "slug" | "price_cents" | "product_type" | "description" | "is_new">>(
    "SELECT name, slug, price_cents, product_type, description, is_new FROM products ORDER BY name"
  );
}
