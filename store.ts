import { Brief, SiteSpec, formatMoney } from "@/lib/spec";
import { D1Database } from "@/lib/cf";

export type SiteRow = {
  id: string;
  slug: string;
  name: string;
  spec: string;
  image_key: string;
  image_type: string;
  admin_token: string;
  source: string;
  created_at: string;
};

export type OrderRow = {
  id: string;
  site_id: string;
  reference: string;
  name: string;
  email: string;
  quantity: number;
  note: string | null;
  total_cents: number | null;
  currency: string;
  status: string;
  created_at: string;
};

export type PublicSite = {
  id: string;
  slug: string;
  name: string;
  spec: SiteSpec;
  imageKey: string;
  source: string;
  createdAt: string;
};

const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";

export const randomToken = (length = 6): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
};

export const slugify = (input: string): string => {
  const base = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42);
  return base || "storefront";
};

export const safeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

export const toPublicSite = (row: SiteRow): PublicSite => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  spec: JSON.parse(row.spec) as SiteSpec,
  imageKey: row.image_key,
  source: row.source,
  createdAt: row.created_at,
});

export const createSite = async (
  db: D1Database,
  input: { spec: SiteSpec; name: string; imageKey: string; imageType: string; source: string; brief: Brief },
): Promise<{ slug: string; token: string; id: string }> => {
  const id = crypto.randomUUID();
  const token = `${randomToken(10)}${randomToken(10)}`;
  const base = slugify(input.name);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const slug = `${base}-${randomToken(4)}`;
    const existing = await db.prepare("SELECT id FROM sites WHERE slug = ?").bind(slug).first();
    if (existing) continue;

    await db
      .prepare(
        `INSERT INTO sites (id, slug, name, spec, image_key, image_type, admin_token, source, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        id,
        slug,
        input.name,
        JSON.stringify(input.spec),
        input.imageKey,
        input.imageType,
        token,
        input.source,
        new Date().toISOString(),
      )
      .run();

    return { slug, token, id };
  }

  throw new Error("Could not allocate a storefront address. Try a slightly different product name.");
};

export const getSiteBySlug = async (db: D1Database, slug: string): Promise<SiteRow | null> =>
  db.prepare("SELECT * FROM sites WHERE slug = ?").bind(slug).first<SiteRow>();

export const getOrders = async (db: D1Database, siteId: string): Promise<OrderRow[]> => {
  const result = await db
    .prepare("SELECT * FROM orders WHERE site_id = ? ORDER BY created_at DESC LIMIT 200")
    .bind(siteId)
    .all<OrderRow>();
  return result.results ?? [];
};

export const createOrder = async (
  db: D1Database,
  input: {
    siteId: string;
    name: string;
    email: string;
    quantity: number;
    note: string | null;
    totalCents: number | null;
    currency: string;
  },
): Promise<{ reference: string }> => {
  const reference = `SF-${Date.now().toString(36).slice(-5).toUpperCase()}${randomToken(3).toUpperCase()}`;
  await db
    .prepare(
      `INSERT INTO orders (id, site_id, reference, name, email, quantity, note, total_cents, currency, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      crypto.randomUUID(),
      input.siteId,
      reference,
      input.name,
      input.email,
      input.quantity,
      input.note,
      input.totalCents,
      input.currency,
      "new",
      new Date().toISOString(),
    )
    .run();
  return { reference };
};

export const deleteSite = async (db: D1Database, slug: string): Promise<void> => {
  const site = await getSiteBySlug(db, slug);
  if (!site) return;
  await db.batch([
    db.prepare("DELETE FROM orders WHERE site_id = ?").bind(site.id),
    db.prepare("DELETE FROM sites WHERE id = ?").bind(site.id),
  ]);
};

export const priceLabel = (spec: SiteSpec): string | null =>
  spec.offer.priceCents ? formatMoney(spec.offer.priceCents, spec.offer.currency) : null;
