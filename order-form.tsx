"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/spec";

type Props = {
  slug: string;
  mode: "order" | "inquiry";
  priceCents: number | null;
  currency: string;
};

type Success = { reference: string; email: string };

export default function OrderForm({ slug, mode, priceCents, currency }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [company, setCompany] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<Success | null>(null);

  const isOrder = mode === "order" && Boolean(priceCents);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);

    try {
      const response = await fetch(`/api/sites/${slug}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, quantity: 1, note, company }),
      });
      const data = (await response.json()) as { reference?: string; error?: string };
      if (!response.ok || !data.reference) {
        setError(data.error ?? "That did not go through. Please try again.");
        return;
      }
      setSuccess({ reference: data.reference, email });
    } catch {
      setError("The connection dropped. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-2xl border p-6" style={{ borderColor: "var(--sf-line)", background: "var(--sf-bg)" }}>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{ background: "var(--sf-accent)", color: "var(--sf-accent-ink)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="mt-4 text-xl font-semibold tracking-tight">
          {isOrder ? "Order received." : "Message received."}
        </h3>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--sf-muted)" }}>
          {isOrder
            ? `The maker has your details. Your files are on their way to ${success.email}.`
            : `We will reply to ${success.email} with availability and what is included.`}
        </p>
        <div
          className="mt-5 flex items-center justify-between rounded-lg border px-3 py-2.5"
          style={{ borderColor: "var(--sf-line)" }}
        >
          <span className="sf-mono" style={{ color: "var(--sf-muted)" }}>
            Reference
          </span>
          <span className="font-mono text-sm font-semibold tracking-wide">{success.reference}</span>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border p-5 sm:p-6"
      style={{ borderColor: "var(--sf-line)", background: "var(--sf-bg)" }}
    >
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-lg font-semibold tracking-tight">{isOrder ? "Get your copy" : "Ask about it"}</h3>
        {isOrder && priceCents && (
          <span className="text-sm font-semibold" style={{ color: "var(--sf-muted)" }}>
            {formatMoney(priceCents, currency)}
          </span>
        )}
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <label className="sf-mono block" htmlFor="order-name" style={{ color: "var(--sf-muted)" }}>
            Name
          </label>
          <input
            id="order-name"
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
            className="sf-input mt-1.5"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div>
          <label className="sf-mono block" htmlFor="order-email" style={{ color: "var(--sf-muted)" }}>
            Email
          </label>
          <input
            id="order-email"
            type="email"
            required
            autoComplete="email"
            className="sf-input mt-1.5"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div>
          <label className="sf-mono block" htmlFor="order-note" style={{ color: "var(--sf-muted)" }}>
            Notes <span style={{ opacity: 0.6 }}>(optional)</span>
          </label>
          <textarea
            id="order-note"
            rows={3}
            maxLength={600}
            className="sf-input mt-1.5 resize-y"
            placeholder={isOrder ? "Anything the maker should know?" : "What would you like to know?"}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </div>

        <input
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
          value={company}
          onChange={(event) => setCompany(event.target.value)}
          name="company"
        />
      </div>

      {error && (
        <p className="mt-3 text-xs leading-relaxed" style={{ color: "var(--sf-accent)" }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-70"
        style={{ background: "var(--sf-accent)", color: "var(--sf-accent-ink)" }}
      >
        {busy ? "Sending…" : isOrder ? "Place order" : "Send inquiry"}
        {!busy && <span aria-hidden>→</span>}
      </button>

      <p className="mt-2.5 text-center text-[11px]" style={{ color: "var(--sf-muted)" }}>
        {isOrder
          ? "No card is taken here. The maker follows up with payment and your files."
          : "No payment is taken here. Your details go straight to the maker."}
      </p>
    </form>
  );
}
