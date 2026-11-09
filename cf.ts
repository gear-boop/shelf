import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Minimal structural types for the Cloudflare bindings we use, so the app
 * typechecks without pulling the whole workers-types package into Next.
 */
export type D1PreparedStatement = {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run(): Promise<{ success: boolean }>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
};

export type D1Database = {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<unknown>;
};

export type R2ObjectBodyLike = {
  body: ReadableStream;
  size: number;
  httpMetadata?: { contentType?: string };
  customMetadata?: Record<string, string>;
};

export type R2Bucket = {
  put(
    key: string,
    value: ArrayBuffer | Uint8Array | ReadableStream,
    options?: { httpMetadata?: { contentType?: string; cacheControl?: string } },
  ): Promise<unknown>;
  get(key: string): Promise<R2ObjectBodyLike | null>;
  delete(key: string): Promise<void>;
};

export type Bindings = { DB: D1Database; FILES: R2Bucket };

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS sites (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    spec TEXT NOT NULL,
    image_key TEXT NOT NULL,
    image_type TEXT NOT NULL,
    admin_token TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'ai',
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    site_id TEXT NOT NULL,
    reference TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    note TEXT,
    total_cents INTEGER,
    currency TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS orders_site_idx ON orders (site_id, created_at DESC)`,
];

let schemaReady: Promise<void> | null = null;

const ensureSchema = async (db: D1Database): Promise<void> => {
  if (!schemaReady) {
    schemaReady = db
      .batch(SCHEMA.map((statement) => db.prepare(statement)))
      .then(() => undefined)
      .catch((error) => {
        schemaReady = null;
        throw error;
      });
  }
  return schemaReady;
};

export const getBindings = async (): Promise<Bindings> => {
  const { env } = await getCloudflareContext({ async: true });
  const bindings = env as unknown as Partial<Bindings>;
  if (!bindings.DB) throw new Error("The D1 binding DB is not configured.");
  if (!bindings.FILES) throw new Error("The R2 binding FILES is not configured.");
  await ensureSchema(bindings.DB);
  return bindings as Bindings;
};
