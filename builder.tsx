"use client";

import { useRef, useState } from "react";
import { saveSite } from "@/lib/client-store";

type Created = { slug: string; name: string; token: string };

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "PKR", "AED", "CAD", "AUD", "SGD"];
const TONES = [
  "Confident and editorial",
  "Warm and handmade",
  "Technical and precise",
  "Playful and bold",
  "Quiet and minimal",
];

const STAGES = [
  "Reading the brief",
  "Choosing an art direction",
  "Writing the page",
  "Setting the layout",
  "Preparing the order backend",
];

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

const prepareImage = async (file: File): Promise<File> => {
  if (file.size <= 1_200_000) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.87));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], "product.jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
};

export default function Builder() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [audience, setAudience] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [tone, setTone] = useState(TONES[0]);
  const [mode, setMode] = useState<"order" | "inquiry">("order");
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Created | null>(null);
  const [copied, setCopied] = useState(false);

  const attach = (incoming: File | null | undefined) => {
    setError(null);
    if (!incoming) return;
    if (!ALLOWED.includes(incoming.type)) {
      setError("That file is not a JPG, PNG or WebP image.");
      return;
    }
    if (incoming.size > MAX_BYTES) {
      setError("That image is over 8 MB. Try a smaller one.");
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(incoming);
    setPreview(URL.createObjectURL(incoming));
    setCreated(null);
  };

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setCreated(null);
    setName("");
    setDescription("");
    setAudience("");
    setPrice("");
    setError(null);
  };

  const submit = async () => {
    if (busy) return;
    setError(null);

    if (!file) {
      setError("Start with a cover image.");
      return;
    }
    if (name.trim().length < 2) {
      setError("Give the product a name.");
      return;
    }

    setBusy(true);
    setStage(0);
    const ticker = setInterval(() => setStage((value) => Math.min(STAGES.length - 1, value + 1)), 1100);

    try {
      const upload = await prepareImage(file);
      const body = new FormData();
      body.set("image", upload);
      body.set("name", name.trim());
      body.set("description", description.trim());
      body.set("audience", audience.trim());
      body.set("tone", tone);
      body.set("price", price.trim());
      body.set("currency", currency);
      body.set("mode", price.trim() ? mode : "inquiry");

      const response = await fetch("/api/generate", { method: "POST", body });
      const data = (await response.json()) as {
        slug?: string;
        name?: string;
        token?: string;
        error?: string;
      };

      if (!response.ok || !data.slug || !data.token) {
        setError(data.error ?? "The storefront could not be generated.");
        return;
      }

      saveSite({
        slug: data.slug,
        name: name.trim(),
        token: data.token,
        createdAt: new Date().toISOString(),
      });
      setCreated({ slug: data.slug, name: data.name ?? name.trim(), token: data.token });
    } catch {
      setError("The request did not complete. Try again.");
    } finally {
      clearInterval(ticker);
      setBusy(false);
    }
  };

  const copyDashboardLink = async () => {
    if (!created) return;
    const link = `${window.location.origin}/dashboard?site=${created.slug}&token=${created.token}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setError("Your browser blocked clipboard access.");
    }
  };

  if (created) {
    return (
      <div className="rise panel p-5 sm:p-6">
        <div className="flex items-center justify-between border-b pb-3 hairline">
          <span className="text-[10px] font-medium tracking-[0.14em] text-ink/40 uppercase">Storefront</span>
          <span className="flex items-center gap-1.5 text-[10px] font-medium tracking-[0.14em] text-clay uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-clay" aria-hidden />
            Published
          </span>
        </div>

        <h2 className="mt-4 text-[23px] leading-[1.15] font-medium tracking-[-0.02em] text-ink">
          {created.name} is live.
        </h2>
        <p className="mt-2 text-[12.5px] leading-relaxed text-ink/55">
          Copy, palette and layout were composed from your brief, with the order backend attached.
        </p>

        <div className="mt-5 rounded-md border bg-paper px-3 py-2.5 hairline">
          <span className="text-[9px] font-medium tracking-[0.14em] text-ink/35 uppercase">Address</span>
          <a
            href={`/s/${created.slug}`}
            className="mt-0.5 block truncate font-mono text-[12px] text-ink hover:text-clay"
          >
            /s/{created.slug}
          </a>
        </div>

        <div className="mt-4 flex gap-2">
          <a
            href={`/s/${created.slug}`}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-ink px-4 py-2.5 text-[12.5px] font-medium text-paper transition hover:bg-ink/85"
          >
            Open storefront <span aria-hidden>→</span>
          </a>
          <a
            href="/dashboard"
            className="inline-flex flex-1 items-center justify-center rounded-md border px-4 py-2.5 text-[12.5px] font-medium text-ink transition hover:bg-ink/[0.03] hairline"
          >
            View orders
          </a>
        </div>

        <button
          onClick={copyDashboardLink}
          className="mt-2 w-full rounded-md border border-dashed px-3 py-2 text-[11px] text-ink/45 transition hover:text-ink hairline"
        >
          {copied ? "Copied" : "Copy private dashboard link"}
        </button>

        <button onClick={reset} className="mt-3 text-[11.5px] text-ink/40 underline underline-offset-4 hover:text-ink">
          Start another
        </button>
      </div>
    );
  }

  return (
    <div className="panel p-5 sm:p-6">
      <div className="flex items-baseline justify-between border-b pb-3 hairline">
        <h2 className="text-[15px] font-medium tracking-[-0.01em] text-ink">New storefront</h2>
        <span className="text-[10px] tracking-[0.14em] text-ink/35 uppercase">Brief</span>
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          attach(event.dataTransfer.files?.[0]);
        }}
        onPaste={(event) => {
          const pasted = event.clipboardData.files?.[0];
          if (pasted) attach(pasted);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Add a cover image"
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
        }}
        className={`group relative mt-4 flex min-h-[164px] cursor-pointer items-center justify-center overflow-hidden rounded-md border border-dashed transition ${
          dragging ? "border-clay bg-clay/[0.04]" : "border-ink/20 bg-paper/60 hover:border-ink/40"
        }`}
      >
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Product" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0c]/80 via-[#0d0d0c]/10 to-transparent" />
            <div className="relative z-10 mt-auto flex w-full items-center justify-between p-2.5">
              <span className="rounded bg-ink/70 px-1.5 py-1 font-mono text-[9px] tracking-wider text-paper/85 uppercase backdrop-blur">
                {file ? `${(file.size / 1024).toFixed(0)} KB` : "attached"}
              </span>
              <span className="rounded bg-paper px-2 py-1 text-[10.5px] font-medium text-ink opacity-0 transition group-hover:opacity-100">
                Replace
              </span>
            </div>
          </>
        ) : (
          <div className="px-5 py-6 text-center">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              className="mx-auto text-ink/35"
              aria-hidden
            >
              <rect x="3" y="5" width="18" height="14" rx="1.5" />
              <circle cx="8.5" cy="10" r="1.4" />
              <path d="M4 17l4.5-4.5 3 3L15 11l5 5" strokeLinejoin="round" />
            </svg>
            <p className="mt-2.5 text-[12.5px] font-medium text-ink/80">Cover image</p>
            <p className="mt-0.5 text-[11px] text-ink/40">Drag, paste, or browse — JPG, PNG, WebP</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED.join(",")}
          className="hidden"
          onChange={(event) => attach(event.target.files?.[0])}
        />
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <label className="label" htmlFor="product-name">
            Product name
          </label>
          <input
            id="product-name"
            className="field"
            placeholder="Slow Mornings — a coffee guide"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={80}
          />
        </div>

        <div>
          <label className="label" htmlFor="product-description">
            Description
          </label>
          <textarea
            id="product-description"
            className="field min-h-[78px] resize-y"
            placeholder="What's inside, who it's for, what buyers get — anything the page should know."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={1200}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="product-price">
              Price <span className="text-ink/25">(optional)</span>
            </label>
            <div className="flex">
              <input
                id="product-price"
                className="field rounded-r-none"
                inputMode="decimal"
                placeholder="24"
                value={price}
                onChange={(event) => setPrice(event.target.value.replace(/[^0-9.]/g, ""))}
              />
              <select
                aria-label="Currency"
                className="field w-[78px] rounded-l-none border-l-0 text-[11px]"
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
              >
                {CURRENCIES.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label" htmlFor="product-tone">
              Voice
            </label>
            <select
              id="product-tone"
              className="field text-[11.5px]"
              value={tone}
              onChange={(event) => setTone(event.target.value)}
            >
              {TONES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="product-audience">
            Audience <span className="text-ink/25">(optional)</span>
          </label>
          <input
            id="product-audience"
            className="field"
            placeholder="People learning to brew at home"
            value={audience}
            onChange={(event) => setAudience(event.target.value)}
            maxLength={160}
          />
        </div>

        <div>
          <span className="label">Ordering</span>
          <div className="grid grid-cols-2 gap-1 rounded-md border p-1 hairline">
            {(
              [
                { value: "order", label: "Take orders" },
                { value: "inquiry", label: "Collect inquiries" },
              ] as const
            ).map((option) => {
              const disabled = option.value === "order" && !price.trim();
              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={disabled}
                  onClick={() => setMode(option.value)}
                  className={`rounded px-2 py-1.5 text-[11.5px] font-medium transition ${
                    mode === option.value
                      ? "bg-ink/15 text-ink"
                      : disabled
                        ? "cursor-not-allowed text-ink/25"
                        : "text-ink/55 hover:bg-ink/[0.04] hover:text-ink"
                  }`}
                  title={disabled ? "Add a price to take orders" : undefined}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 border-l-2 border-clay bg-clay/[0.04] py-2 pr-2 pl-3 text-[11.5px] leading-relaxed text-clay">
          {error}
        </div>
      )}

      <button
        onClick={() => submit()}
        disabled={busy}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-2.5 text-[12.5px] font-medium text-paper transition enabled:hover:bg-ink/85 disabled:cursor-wait disabled:opacity-80"
      >
        {busy ? (
          <>
            <span className="h-3 w-3 animate-spin rounded-full border border-paper/30 border-t-paper" />
            {STAGES[stage]}…
          </>
        ) : (
          <>
            Generate storefront <span aria-hidden>→</span>
          </>
        )}
      </button>

      <p className="mt-2 text-[10.5px] text-ink/35">
        {price.trim() ? "Orders are priced and stored on the server." : "Without a price the page collects inquiries."}
      </p>
    </div>
  );
}
