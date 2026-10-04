// Loads the product catalog in db/catalog.json into the Turso database.
// Safe to re-run: existing rows are updated in place, and nothing outside the catalog is touched.
import { readFileSync, existsSync } from "node:fs";
import { createClient } from "@libsql/client";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const url = process.env.TURSO_DATABASE_URL;
if (!url) {
  console.error("TURSO_DATABASE_URL is not set. Add it to .env.local.");
  process.exit(1);
}

const db = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
const catalog = JSON.parse(readFileSync(new URL("../db/catalog.json", import.meta.url), "utf8"));

// Top-level collections first, so every parent exists before its children reference it.
const collections = [...catalog.collections].sort((a, b) => (a.parent_id ? 1 : 0) - (b.parent_id ? 1 : 0));

await db.batch(
  [
    ...collections.map((c) => ({
      sql: `INSERT INTO collections (id, name, slug, kind, parent_id, sort_order) VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT (id) DO UPDATE SET name = excluded.name, slug = excluded.slug, kind = excluded.kind,
              parent_id = excluded.parent_id, sort_order = excluded.sort_order`,
      args: [c.id, c.name, c.slug, c.kind, c.parent_id, c.sort_order],
    })),
    ...catalog.products.map((p) => ({
      sql: `INSERT INTO products (id, name, slug, description, price_cents, product_type, wash_instructions, is_new)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (id) DO UPDATE SET name = excluded.name, slug = excluded.slug,
              description = excluded.description, price_cents = excluded.price_cents,
              product_type = excluded.product_type, wash_instructions = excluded.wash_instructions,
              is_new = excluded.is_new`,
      args: [p.id, p.name, p.slug, p.description, p.price_cents, p.product_type, p.wash_instructions, p.is_new ? 1 : 0],
    })),
    ...catalog.product_collections.map(([productId, collectionId]) => ({
      sql: "INSERT OR IGNORE INTO product_collections (product_id, collection_id) VALUES (?, ?)",
      args: [productId, collectionId],
    })),
  ],
  "write"
);

const { rows } = await db.execute(
  `SELECT (SELECT COUNT(*) FROM collections) AS collections, (SELECT COUNT(*) FROM products) AS products,
          (SELECT COUNT(*) FROM product_collections) AS links`
);
console.log(`Catalog loaded: ${rows[0].collections} collections, ${rows[0].products} products, ${rows[0].links} links.`);
