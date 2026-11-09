"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SavedSite, forgetSite, loadSites, saveSite } from "@/lib/client-store";
import { formatMoney } from "@/lib/spec";

type Order = {
  id: string;
  reference: string;
  name: string;
  email: string;
  note: string | null;
  total_cents: number | null;
  currency: string;
  created_at: string;
};

type AdminData = {
  site: {
    slug: string;
    name: string;
    createdAt: string;
    priceLabel: string | null;
    spec: { offer: { mode: string }; brand: { tagline: string } };
  };
  orders: Order[];
  imageUrl: string;
};

const when = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function DashboardClient() {
  const [entries, setEntries] = useState<SavedSite[]>([]);
  const [data, setData] = useState<Record<string, AdminData | null>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const loadAll = useCallback(async (sites: SavedSite[]) => {
    setLoading(true);
    const results = await Promise.all(
      sites.map(async (site) => {
        try {
          const response = await fetch(`/api/sites/${site.slug}`, {
            headers: { Authorization: `Bearer ${site.token}` },
            cache: "no-store",
          });
          if (!response.ok) {
            return { slug: site.slug, data: null, error: "Access expired, or this storefront no longer exists." };
          }
          return { slug: site.slug, data: (await response.json()) as AdminData, error: null };
        } catch {
          return { slug: site.slug, data: null, error: "Could not reach the server." };
        }
      }),
    );

    const nextData: Record<string, AdminData | null> = {};
    const nextErrors: Record<string, string> = {};
    results.forEach((result) => {
      nextData[result.slug] = result.data;
      if (result.error) nextErrors[result.slug] = result.error;
    });
    setData(nextData);
    setErrors(nextErrors);
    setLoading(false);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("site");
    const token = params.get("token");
    if (slug && token) {
      saveSite({ slug, name: slug, token, createdAt: new Date().toISOString() });
      window.history.replaceState({}, "", "/dashboard");
    }
    const sites = loadSites();
    setEntries(sites);
    setReady(true);
    void loadAll(sites);
  }, [loadAll]);

  const totals = useMemo(() => {
    let count = 0;
    let revenue = 0;
    let currency = "USD";
    Object.values(data).forEach((entry) => {
      entry?.orders.forEach((order) => {
        count += 1;
        if (order.total_cents) {
          revenue += order.total_cents;
          currency = order.currency;
        }
      });
    });
    return { count, revenue, currency };
  }, [data]);

  const copyLink = async (slug: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/s/${slug}`);
      setCopied(slug);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      setCopied(null);
    }
  };

  const remove = async (entry: SavedSite) => {
    if (
      !window.confirm(`Delete “${data[entry.slug]?.site.name ?? entry.slug}” and its orders? This cannot be undone.`)
    ) {
      return;
    }
    try {
      await fetch(`/api/sites/${entry.slug}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${entry.token}` },
      });
    } finally {
      forgetSite(entry.slug);
      const sites = loadSites();
      setEntries(sites);
      setData((current) => {
        const next = { ...current };
        delete next[entry.slug];
        return next;
      });
    }
  };

  return (
    <div className="mx-auto max-w-[980px] px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-medium tracking-[0.16em] text-ink/55 uppercase">Dashboard</p>
          <h1 className="mt-2 text-[30px] leading-tight font-medium tracking-[-0.025em] text-ink">Order book</h1>
          <p className="mt-1.5 max-w-[52ch] text-[12.5px] leading-relaxed text-ink/55">
            Every storefront you built, with the orders it has taken. Nothing here is public.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEntries(loadSites());
              void loadAll(loadSites());
            }}
            className="rounded-md border px-3 py-2 text-[11.5px] font-medium text-ink/60 transition hover:bg-ink/[0.03] hover:text-ink hairline"
          >
            Refresh
          </button>
          <a
            href="/"
            className="rounded-md bg-ink px-3 py-2 text-[11.5px] font-medium text-paper transition hover:bg-ink/85"
          >
            New storefront
          </a>
        </div>
      </div>

      {ready && entries.length > 0 && (
        <dl className="mt-7 grid grid-cols-3 divide-x overflow-hidden rounded-md border bg-card hairline">
          {[
            ["Storefronts", String(entries.length)],
            ["Orders", String(totals.count)],
            ["Order value", totals.revenue ? formatMoney(totals.revenue, totals.currency) : "—"],
          ].map(([label, value]) => (
            <div key={label} className="px-4 py-3">
              <dt className="text-[9px] font-medium tracking-[0.14em] text-ink/55 uppercase">{label}</dt>
              <dd className="mt-1 text-[17px] font-medium tracking-[-0.01em] text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {!ready && <div className="mt-7 h-36 animate-pulse rounded-md border bg-card hairline" />}

      {ready && entries.length === 0 && (
        <div className="mt-7 rounded-md border bg-card px-6 py-12 text-center hairline">
          <h2 className="text-[15px] font-medium text-ink">No storefronts on this browser yet.</h2>
          <p className="mx-auto mt-2 max-w-[42ch] text-[12.5px] leading-relaxed text-ink/55">
            Build one and it will appear here with its order book. If you already have one, open its private dashboard
            link from the studio.
          </p>
          <a
            href="/"
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-[12px] font-medium text-paper transition hover:bg-ink/85"
          >
            Open the brief <span aria-hidden>→</span>
          </a>
        </div>
      )}

      <div className="mt-5 space-y-4">
        {entries.map((entry) => {
          const admin = data[entry.slug];
          const error = errors[entry.slug];
          const name = admin?.site.name ?? entry.name;
          const orders = admin?.orders ?? [];
          const currency = orders.find((order) => order.total_cents)?.currency ?? "USD";
          const value = orders.reduce((sum, order) => sum + (order.total_cents ?? 0), 0);

          return (
            <article key={entry.slug} className="overflow-hidden rounded-md border bg-card hairline">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 hairline">
                <div className="flex min-w-0 items-center gap-3">
                  {admin?.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={admin.imageUrl} alt="" className="h-9 w-9 rounded border object-cover hairline" />
                  ) : (
                    <div className="h-9 w-9 animate-pulse rounded border bg-paper hairline" />
                  )}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <h2 className="truncate text-[13.5px] font-medium tracking-[-0.01em] text-ink">{name}</h2>
                      {admin?.site.priceLabel && (
                        <span className="font-mono text-[10px] text-ink/55">{admin.site.priceLabel}</span>
                      )}
                    </div>
                    <a
                      href={`/s/${entry.slug}`}
                      className="block truncate font-mono text-[10.5px] text-ink/48 hover:text-clay"
                    >
                      /s/{entry.slug}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-ink/55">
                  <button onClick={() => copyLink(entry.slug)} className="transition hover:text-ink">
                    {copied === entry.slug ? "Copied" : "Copy link"}
                  </button>
                  <a href={`/s/${entry.slug}`} className="transition hover:text-ink">
                    Open
                  </a>
                  <button onClick={() => remove(entry)} className="transition hover:text-clay">
                    Delete
                  </button>
                </div>
              </div>

              {loading && !admin && !error && (
                <div className="space-y-2 px-4 py-4">
                  <div className="h-2.5 w-2/3 animate-pulse rounded bg-ink/10" />
                  <div className="h-2.5 w-1/3 animate-pulse rounded bg-ink/10" />
                </div>
              )}

              {error && <p className="px-4 py-4 text-[11.5px] text-clay/80">{error}</p>}

              {admin && orders.length === 0 && (
                <p className="px-4 py-4 text-[11.5px] text-ink/48">
                  No orders yet. Share the link and the first one lands here.
                </p>
              )}

              {admin && orders.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left">
                    <thead>
                      <tr className="border-b hairline">
                        {["Reference", "Customer", "Value", "Received"].map((heading, index) => (
                          <th
                            key={heading}
                            className={`px-4 py-2 text-[9px] font-medium tracking-[0.14em] text-ink/55 uppercase ${
                              index >= 2 ? "text-right" : ""
                            }`}
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b last:border-0 align-top hairline">
                          <td className="px-4 py-2.5 font-mono text-[10px] whitespace-nowrap text-ink/48">
                            {order.reference}
                          </td>
                          <td className="max-w-[280px] px-4 py-2.5 text-[12px] text-ink/80">
                            <span className="font-medium text-ink">{order.name}</span>
                            <a href={`mailto:${order.email}`} className="ml-2 text-[10.5px] text-ink/48 hover:text-clay">
                              {order.email}
                            </a>
                            {order.note && (
                              <span className="mt-0.5 block text-[10.5px] leading-relaxed text-ink/48">
                                “{order.note}”
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-right text-[12px] whitespace-nowrap text-ink/75">
                            {order.total_cents ? formatMoney(order.total_cents, order.currency) : "—"}
                          </td>
                          <td className="px-4 py-2.5 text-right text-[10.5px] whitespace-nowrap text-ink/55">
                            {when(order.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={4} className="px-4 py-2 text-right text-[10px] text-ink/55">
                          {orders.length} order{orders.length === 1 ? "" : "s"} ·{" "}
                          {value ? formatMoney(value, currency) : "—"} total
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <p className="mt-6 border-t pt-4 text-[10.5px] leading-relaxed text-ink/40 hairline">
        Access is tied to this browser. Keep the private dashboard link the studio gives you to open these storefronts
        elsewhere.
      </p>
    </div>
  );
}
