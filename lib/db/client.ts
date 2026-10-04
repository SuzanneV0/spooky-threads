import { createClient, type Client, type InArgs, type ResultSet } from "@libsql/client";

// Server-only: the Turso auth token gives full access to the database, so this module must
// never be imported from a "use client" component. Browser code goes through API routes.

let client: Client | null = null;

export function db(): Client {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL;
    if (!url) throw new Error("TURSO_DATABASE_URL is not set — add it to .env.local.");
    client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  }
  return client;
}

// SQLite stores these as 0/1 and TEXT; the app expects booleans and objects, as under Postgres.
const BOOLEAN_COLUMNS = new Set(["is_new", "is_default", "is_admin"]);
const JSON_COLUMNS = new Set(["shipping_address"]);

function toRows<T>(result: ResultSet): T[] {
  return result.rows.map((row) => {
    const out: Record<string, unknown> = {};
    result.columns.forEach((column, i) => {
      let value: unknown = row[i];
      if (typeof value === "bigint") value = Number(value);
      if (BOOLEAN_COLUMNS.has(column) && value !== null) value = Boolean(value);
      if (JSON_COLUMNS.has(column) && typeof value === "string") value = JSON.parse(value);
      out[column] = value;
    });
    return out as T;
  });
}

export async function all<T>(sql: string, args: InArgs = []): Promise<T[]> {
  return toRows<T>(await db().execute({ sql, args }));
}

export async function one<T>(sql: string, args: InArgs = []): Promise<T | null> {
  return (await all<T>(sql, args))[0] ?? null;
}

export async function run(sql: string, args: InArgs = []): Promise<ResultSet> {
  return db().execute({ sql, args });
}

/** "?, ?, ?" for an IN (...) list of n values. */
export function placeholders(n: number): string {
  return Array.from({ length: n }, () => "?").join(", ");
}

export const newId = () => crypto.randomUUID();
export const nowIso = () => new Date().toISOString();
