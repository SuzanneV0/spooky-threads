// Applies db/schema.sql to the Turso database in .env.local (or the environment).
// Safe to re-run: every statement uses IF NOT EXISTS.
import { readFileSync, existsSync } from "node:fs";
import { createClient } from "@libsql/client";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const url = process.env.TURSO_DATABASE_URL;
if (!url) {
  console.error("TURSO_DATABASE_URL is not set. Add it to .env.local.");
  process.exit(1);
}

const db = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
const sql = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8");

await db.executeMultiple(sql);
const { rows } = await db.execute("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
console.log(`Schema applied. Tables: ${rows.map((r) => r.name).join(", ")}`);
