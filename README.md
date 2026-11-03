# Shelf

A storefront generator for digital products. Drop a cover image, describe what you are selling,
and get a designed single-product site at its own URL — with a real ordering backend attached.

## What it does

1. **Brief** — cover image (drag, browse or paste), name, description, optional price, voice.
2. **Compose** — the studio assembles a complete site spec: brand, palette, typography, hero
   layout, headline, features, story, formats, FAQ and SEO tags.
3. **Publish** — the storefront is stored in D1 and served at `/s/<slug>` with the cover image from R2.
4. **Sell** — the order form posts to `/api/sites/<slug>/orders`; the price is computed on the
   server, the order is stored in D1, and it appears in the private dashboard, ready to fulfil
   by email.

## Local development

```bash
npm install
npm run dev               # http://localhost:3000
```

`next dev` gets local D1 + R2 bindings from `freebuff.wrangler.jsonc` through
`initOpenNextCloudflareForDev`, so no external database is needed. The schema
(`sites`, `orders`) is created automatically on first use.

## Backend API

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/generate` | — | multipart brief + cover image; creates the storefront |
| `POST` | `/api/sites/:slug/orders` | — | store a validated order or inquiry |
| `GET` | `/api/sites/:slug` | Bearer token | storefront + its orders (dashboard) |
| `GET` | `/api/sites/:slug/orders` | Bearer token | orders only |
| `DELETE` | `/api/sites/:slug` | Bearer token | delete site, orders and cover image |
| `GET` | `/media/:key` | — | serve a cover image from R2 |

Access tokens are created per storefront, kept in the browser that built it, and can be carried
to another device with the private dashboard link (`/dashboard?site=<slug>&token=<token>`).

## Deploying

The app is prepared for Freebuff Sites / Cloudflare Workers via OpenNext:

```bash
npm run preview   # build + local Workers preview (workerd)
```

Data lives in the provisioned `DB` (D1) and `FILES` (R2) bindings.
