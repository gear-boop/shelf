import { SiteSpec, formatMoney } from "@/lib/spec";
import OrderForm from "@/components/order-form";

const alpha = (hex: string, opacity: number): string => {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const SectionEyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="sf-mono flex items-center gap-2.5" style={{ color: "var(--sf-accent)" }}>
    <span className="inline-block h-px w-5" style={{ background: "var(--sf-accent)" }} aria-hidden />
    {children}
  </p>
);

export default function Storefront({ spec, slug, imageUrl }: { spec: SiteSpec; slug: string; imageUrl: string }) {
  const { palette, font, heroLayout } = spec.theme;
  const serif = font === "editorial";
  const headline = serif ? "sf-serif" : "tracking-[-0.035em]";
  const price = spec.offer.priceCents ? formatMoney(spec.offer.priceCents, spec.offer.currency) : null;
  const isOrder = spec.offer.mode === "order" && Boolean(spec.offer.priceCents);

  const ctaButtons = (
    <div className="flex flex-wrap items-center gap-3">
      <a
        href="#buy"
        className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition hover:opacity-90"
        style={{ background: "var(--sf-accent)", color: "var(--sf-accent-ink)" }}
      >
        {spec.hero.cta}
        <span aria-hidden>→</span>
      </a>
      <a
        href="#product"
        className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-medium transition hover:opacity-80"
        style={{ borderColor: palette.line }}
      >
        More detail
      </a>
    </div>
  );

  const heroCopy = (
    <>
      <SectionEyebrow>{spec.hero.eyebrow}</SectionEyebrow>
      <h1 className={`mt-5 text-[clamp(2.4rem,5.2vw,4.2rem)] leading-[1.02] ${headline}`}>{spec.hero.headline}</h1>
      <p className="mt-5 max-w-xl text-[15px] leading-relaxed sm:text-base" style={{ color: "var(--sf-muted)" }}>
        {spec.hero.sub}
      </p>
      <div className="mt-8">{ctaButtons}</div>
      <p className="sf-mono mt-6" style={{ color: "var(--sf-muted)" }}>
        {spec.hero.note}
      </p>
    </>
  );

  const heroImage = (
    <figure className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem]" style={{ background: palette.surface }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt={spec.brand.name} className="h-full w-full object-cover" />
      {price && (
        <figcaption
          className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold shadow-lg"
          style={{ background: palette.bg, color: palette.ink }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: palette.accent }} />
          {price}
        </figcaption>
      )}
    </figure>
  );

  return (
    <div
      className="storefront min-h-screen"
      style={
        {
          "--sf-bg": palette.bg,
          "--sf-surface": palette.surface,
          "--sf-ink": palette.ink,
          "--sf-muted": palette.muted,
          "--sf-line": palette.line,
          "--sf-accent": palette.accent,
          "--sf-accent-ink": palette.accentInk,
          "--sf-on-image": "#faf7f0",
        } as React.CSSProperties
      }
    >
      <header
        className="sticky top-0 z-40 border-b backdrop-blur-md"
        style={{ borderColor: alpha(palette.ink, 0.08), background: alpha(palette.bg, 0.82) }}
      >
        <div className="sf-wrap flex h-16 items-center justify-between">
          <a href="#top" className="flex items-center gap-2.5">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-md text-[11px] font-bold"
              style={{ background: palette.accent, color: palette.accentInk }}
            >
              {spec.brand.mark}
            </span>
            <span className="text-sm font-semibold tracking-tight">{spec.brand.name}</span>
          </a>
          <nav className="hidden items-center gap-7 md:flex">
            {spec.nav.links.map((link) => (
              <a
                key={link.href + link.label}
                href={link.href}
                className="text-[13px] transition hover:opacity-60"
                style={{ color: palette.muted }}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <a
            href="#buy"
            className="rounded-full px-4 py-2 text-xs font-semibold transition hover:opacity-90"
            style={{ background: palette.ink, color: palette.bg }}
          >
            {spec.nav.cta}
          </a>
        </div>
      </header>

      <main id="top">
        {heroLayout === "split" && (
          <section className="sf-wrap grid items-center gap-10 py-12 md:grid-cols-[1.02fr_0.98fr] md:gap-14 md:py-20">
            <div>{heroCopy}</div>
            {heroImage}
          </section>
        )}

        {heroLayout === "centered" && (
          <section className="sf-wrap py-14 text-center md:py-20">
            <div className="mx-auto max-w-3xl">
              <div className="flex justify-center">{heroCopy}</div>
              <div className="mt-10 text-left">{heroImage}</div>
            </div>
          </section>
        )}

        {heroLayout === "poster" && (
          <section className="relative flex min-h-[70vh] items-end md:min-h-[82vh]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt={spec.brand.name} className="absolute inset-0 h-full w-full object-cover" />
            <div className="sf-wrap relative py-6 md:py-10">
              <div
                className="max-w-[640px] rounded-2xl border p-6 md:p-10"
                style={{ background: palette.bg, borderColor: palette.line }}
              >
                <SectionEyebrow>{spec.hero.eyebrow}</SectionEyebrow>
                <h1 className={`mt-4 text-[clamp(2.3rem,4.6vw,3.8rem)] leading-[1.03] ${headline}`}>
                  {spec.hero.headline}
                </h1>
                <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed" style={{ color: palette.muted }}>
                  {spec.hero.sub}
                </p>
                <div className="mt-7">{ctaButtons}</div>
                <p className="sf-mono mt-5" style={{ color: palette.muted }}>
                  {spec.hero.note}
                </p>
              </div>
            </div>
          </section>
        )}

        <div className="border-y" style={{ background: palette.accent, borderColor: palette.line }}>
          <div className="sf-wrap flex flex-wrap items-center justify-center gap-x-9 gap-y-1.5 py-3.5">
            {spec.offer.includes.map((item) => (
              <span key={item} className="sf-mono whitespace-nowrap" style={{ color: palette.accentInk }}>
                {item}
              </span>
            ))}
          </div>
        </div>

        <section id="product" className="sf-wrap py-16 md:py-24">
          <div className="max-w-2xl">
            <SectionEyebrow>What&apos;s inside</SectionEyebrow>
            <h2 className={`mt-4 text-[clamp(1.9rem,3.4vw,2.8rem)] leading-tight ${headline}`}>A closer look.</h2>
          </div>

          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl md:grid-cols-3" style={{ background: palette.line }}>
            {spec.features.map((feature, index) => (
              <article key={feature.title} className="p-6 md:p-7" style={{ background: palette.bg }}>
                <span className="sf-mono" style={{ color: palette.accent }}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">{feature.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: palette.muted }}>
                  {feature.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        {spec.band && (
          <section className="border-y py-16 md:py-24" style={{ background: palette.surface, borderColor: palette.line }}>
            <div className="sf-wrap grid items-center gap-10 md:grid-cols-2 md:gap-14">
              <figure className="aspect-[4/3] overflow-hidden rounded-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt={`${spec.brand.name} detail`} className="h-full w-full object-cover" />
              </figure>
              <div>
                <blockquote className={`text-[clamp(1.5rem,2.6vw,2.1rem)] leading-snug ${serif ? "sf-serif" : ""}`}>
                  {spec.band.quote}
                </blockquote>
                <p className="sf-mono mt-5" style={{ color: palette.muted }}>
                  {spec.band.caption}
                </p>
              </div>
            </div>
          </section>
        )}

        <section id="details" className="sf-wrap grid gap-12 py-16 md:grid-cols-[1.05fr_0.95fr] md:py-24">
          <div>
            <SectionEyebrow>The story</SectionEyebrow>
            <h2 className={`mt-4 text-[clamp(1.8rem,3vw,2.5rem)] leading-tight ${headline}`}>{spec.story.title}</h2>
            <p className="mt-5 text-[14.5px] leading-[1.75]" style={{ color: palette.muted }}>
              {spec.story.body}
            </p>
            <ul className="mt-6 space-y-2.5">
              {spec.story.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3 text-[13.5px]">
                  <span className="mt-2 h-[1px] w-4 shrink-0" style={{ background: palette.accent }} />
                  {bullet}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <SectionEyebrow>The details</SectionEyebrow>
            <dl className="mt-4 border-t" style={{ borderColor: palette.line }}>
              {spec.specs.map((row) => (
                <div
                  key={row.label}
                  className="flex items-start justify-between gap-6 border-b py-4"
                  style={{ borderColor: palette.line }}
                >
                  <dt className="sf-mono pt-0.5" style={{ color: palette.muted }}>
                    {row.label}
                  </dt>
                  <dd className="max-w-[62%] text-right text-[13.5px] leading-relaxed">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="faq" className="border-t" style={{ borderColor: palette.line }}>
          <div className="sf-wrap max-w-3xl py-16 md:py-24">
            <SectionEyebrow>Questions</SectionEyebrow>
            <h2 className={`mt-4 text-[clamp(1.8rem,3vw,2.4rem)] leading-tight ${headline}`}>Before you download.</h2>
            <div className="mt-8 border-t" style={{ borderColor: palette.line }}>
              {spec.faq.map((item) => (
                <details key={item.q} className="group border-b" style={{ borderColor: palette.line }}>
                  <summary className="flex items-center justify-between gap-6 py-4 text-[15px] font-medium">
                    {item.q}
                    <span className="sf-plus shrink-0 text-xl leading-none transition-transform" style={{ color: palette.muted }}>
                      +
                    </span>
                  </summary>
                  <p className="pb-4 text-[13.5px] leading-relaxed" style={{ color: palette.muted }}>
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="buy" className="border-t py-16 md:py-24" style={{ background: palette.surface, borderColor: palette.line }}>
          <div className="sf-wrap grid gap-10 md:grid-cols-[1fr_0.95fr] md:gap-14">
            <div>
              <SectionEyebrow>{isOrder ? "Order" : "Availability"}</SectionEyebrow>
              <h2 className={`mt-4 text-[clamp(1.9rem,3.4vw,2.8rem)] leading-tight ${headline}`}>
                {price ? `${spec.brand.name}, ${price}.` : spec.brand.name}
              </h2>
              <p className="mt-3 text-[13.5px]" style={{ color: palette.muted }}>
                {spec.offer.label}
              </p>

              <ul className="mt-7 space-y-3">
                {spec.offer.includes.map((item) => (
                  <li key={item} className="flex items-baseline gap-3 text-[13.5px]">
                    <span className="h-px w-4 shrink-0" style={{ background: palette.accent }} aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>

              <p className="mt-7 max-w-sm text-[13.5px] leading-relaxed" style={{ color: palette.muted }}>
                {spec.offer.note}
              </p>

              <figure className="mt-8 hidden overflow-hidden rounded-2xl md:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt={spec.brand.name} className="h-48 w-full object-cover" />
              </figure>
            </div>

            <OrderForm
              slug={slug}
              mode={spec.offer.mode}
              priceCents={spec.offer.priceCents}
              currency={spec.offer.currency}
            />
          </div>
        </section>
      </main>

      <footer style={{ background: palette.ink, color: palette.bg }}>
        <div className="sf-wrap grid gap-8 py-12 md:grid-cols-[1.4fr_1fr] md:items-end">
          <div>
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-md text-[11px] font-bold"
                style={{ background: palette.accent, color: palette.accentInk }}
              >
                {spec.brand.mark}
              </span>
              <span className="text-sm font-semibold tracking-tight">{spec.brand.name}</span>
            </div>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed opacity-60">{spec.brand.tagline}</p>
          </div>
          <div className="flex flex-wrap items-center gap-5 text-[12px] opacity-70 md:justify-end">
            {spec.nav.links.map((link) => (
              <a key={link.href + link.label} href={link.href} className="sf-link-underline hover:opacity-100">
                {link.label}
              </a>
            ))}
            <a href="#buy" className="sf-link-underline hover:opacity-100">
              {spec.nav.cta}
            </a>
          </div>
        </div>
        <div className="sf-wrap flex flex-wrap items-center justify-between gap-3 border-t py-5 text-[11px] opacity-45" style={{ borderColor: alpha(palette.bg, 0.18) }}>
          <span>
            © {new Date().getFullYear()} {spec.brand.name}. All rights reserved.
          </span>
          <a href="/" className="hover:opacity-100">
            Built with Shelf.
          </a>
        </div>
      </footer>
    </div>
  );
}
