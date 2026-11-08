import Builder from "@/components/builder";
import { Brand } from "@/components/brand";

const STEPS = [
  {
    n: "01",
    title: "Cover",
    body: "One cover image, up to 8 MB. Drag it in, browse, or paste it from the clipboard. It is resized in the browser before upload.",
  },
  {
    n: "02",
    title: "Brief",
    body: "Name, a few sentences about what is inside, an optional price, and the voice you want. That is the entire input.",
  },
  {
    n: "03",
    title: "Storefront",
    body: "Copy, palette, typography and layout are composed together, then published at its own address with the cover and an order form.",
  },
  {
    n: "04",
    title: "Orders",
    body: "Each storefront gets its own order endpoint. Orders are stored in a database and read from your dashboard, ready to fulfil by email.",
  },
];

const ROUTES = [
  { method: "POST", path: "/api/generate", auth: "—", note: "Create a storefront" },
  { method: "POST", path: "/api/sites/:slug/orders", auth: "—", note: "Store an order" },
  { method: "GET", path: "/api/sites/:slug", auth: "Bearer token", note: "Site and order book" },
  { method: "DELETE", path: "/api/sites/:slug", auth: "Bearer token", note: "Remove site and orders" },
  { method: "GET", path: "/media/:key", auth: "—", note: "Product image from R2" },
];

export default function Home() {
  return (
    <div className="min-h-screen" id="top">
      <header className="border-b hairline">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-4">
          <Brand />
          <nav className="flex items-center gap-7 text-[13px] text-ink/55">
            <a href="#workflow" className="hidden transition hover:text-ink sm:block">
              Workflow
            </a>
            <a href="#backend" className="hidden transition hover:text-ink sm:block">
              Backend
            </a>
            <a href="/dashboard" className="text-ink transition hover:text-clay">
              Dashboard <span aria-hidden className="text-ink/35">→</span>
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1180px] px-6">
        <section className="grid items-start gap-12 pt-12 pb-16 md:pt-16 lg:grid-cols-[minmax(0,1fr)_452px] lg:gap-20">
          <div>
            <p className="flex items-center gap-3 text-[10px] font-medium tracking-[0.16em] text-ink/50 uppercase">
              <span className="block h-px w-7 bg-ink/25" aria-hidden />
              Product studio
            </p>

            <h1 className="mt-6 max-w-[17ch] text-[clamp(2.5rem,4.5vw,3.9rem)] leading-[1.03] font-medium tracking-[-0.035em] text-ink">
              A digital product becomes a storefront.
            </h1>

            <p className="mt-6 max-w-[48ch] text-[14.5px] leading-[1.75] text-ink/60">
              Shelf writes the page, chooses the art direction and publishes a single-product site with an order
              backend attached. You supply a cover image and a short brief.
            </p>

            <dl className="mt-10 max-w-[520px] border-t hairline">
              {[
                ["Input", "A cover image, a name, a few sentences about what is inside, an optional price."],
                ["Output", "A published storefront at its own address, orders stored in a database."],
                ["Access", "A private token per storefront. No account, no sign-up."],
              ].map(([term, detail]) => (
                <div key={term} className="grid grid-cols-[92px_1fr] gap-4 border-b py-3.5 hairline">
                  <dt className="pt-0.5 text-[10px] font-medium tracking-[0.14em] text-ink/45 uppercase">{term}</dt>
                  <dd className="text-[13px] leading-relaxed text-ink/75">{detail}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-5 max-w-[46ch] text-[11.5px] leading-relaxed text-ink/35">
              Storefronts render server-side from a composed specification. Order totals are recalculated on the
              server; the price is never trusted from the browser.
            </p>
          </div>

          <div className="lg:pt-1">
            <Builder />
          </div>
        </section>

        <section id="workflow" className="border-t hairline py-14 md:py-18">
          <div className="grid gap-10 md:grid-cols-[280px_1fr] md:gap-16">
            <div>
              <h2 className="text-[22px] leading-tight font-medium tracking-[-0.02em]">From cover image to order.</h2>
              <p className="mt-3 max-w-[34ch] text-[13px] leading-relaxed text-ink/55">
                The whole run takes about a minute. Nothing is billed, nothing is published anywhere you did not ask
                for.
              </p>
            </div>

            <ol className="border-t hairline">
              {STEPS.map((step) => (
                <li key={step.n} className="grid grid-cols-[38px_1fr] gap-4 border-b py-5 hairline sm:grid-cols-[48px_170px_1fr] sm:gap-6">
                  <span className="pt-0.5 font-mono text-[11px] text-clay">{step.n}</span>
                  <h3 className="text-[14px] font-medium tracking-[-0.01em] text-ink">{step.title}</h3>
                  <p className="col-span-2 text-[13px] leading-relaxed text-ink/60 sm:col-span-1">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="backend" className="border-t hairline py-14 md:py-18">
          <div className="grid gap-10 md:grid-cols-[280px_1fr] md:gap-16">
            <div>
              <h2 className="text-[22px] leading-tight font-medium tracking-[-0.02em]">The backend is real.</h2>
              <p className="mt-3 max-w-[34ch] text-[13px] leading-relaxed text-ink/55">
                Orders are validated, priced on the server and stored in Cloudflare D1. Cover images live in R2.
                Everything runs on the same Worker as the page.
              </p>
              <p className="mt-4 max-w-[34ch] text-[12px] leading-relaxed text-ink/45">
                Access to a storefront&apos;s order book is a bearer token created with it — kept in your browser, or
                carried with the private dashboard link.
              </p>
            </div>

            <div className="panel overflow-hidden">
              <div className="flex items-center justify-between border-b px-4 py-2.5 hairline">
                <span className="text-[10px] font-medium tracking-[0.14em] text-ink/50 uppercase">HTTP API</span>
                <span className="font-mono text-[10px] text-ink/35">v1</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[440px] text-left">
                  <thead>
                    <tr className="border-b hairline">
                      {["Method", "Route", "Auth"].map((heading) => (
                        <th
                          key={heading}
                          className="px-4 py-2 text-[9.5px] font-medium tracking-[0.14em] text-ink/45 uppercase"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ROUTES.map((route) => (
                      <tr key={route.method + route.path} className="border-b last:border-0 hairline">
                        <td className="px-4 py-2.5 font-mono text-[10px] tracking-wide text-clay">{route.method}</td>
                        <td className="px-4 py-2.5 font-mono text-[11px] whitespace-nowrap text-ink/75">
                          {route.path}
                        </td>
                        <td className="px-4 py-2.5 text-[11px] whitespace-nowrap text-ink/45">{route.auth}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t px-4 py-3 hairline">
                <p className="text-[11px] leading-relaxed text-ink/45">
                  {ROUTES.length} routes · D1 for sites and orders · R2 for images · schema created on first request
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-wrap items-end justify-between gap-6 border-t py-10 hairline">
          <p className="max-w-[36ch] text-[19px] leading-snug font-medium tracking-[-0.02em]">
            Start with a cover image. The brief takes a minute.
          </p>
          <a
            href="#top"
            className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2.5 text-[12.5px] font-medium text-paper transition hover:bg-ink/85"
          >
            Open the brief <span aria-hidden>↑</span>
          </a>
        </section>
      </main>

      <footer className="border-t hairline">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4 px-6 py-5 text-[11.5px] text-ink/45">
          <div className="flex items-center gap-4">
            <Brand />
            <span className="hidden sm:block">One digital product, done properly.</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="transition hover:text-ink">
              Dashboard
            </a>
            <span className="text-ink/20">·</span>
            <span>Cloudflare Workers · D1 · R2</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
