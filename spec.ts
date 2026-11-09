export type FontStyle = "editorial" | "modern" | "technical";
export type HeroLayout = "split" | "centered" | "poster";
export type OfferMode = "order" | "inquiry";

export type Palette = {
  bg: string;
  surface: string;
  ink: string;
  muted: string;
  line: string;
  accent: string;
  accentInk: string;
};

export type SiteSpec = {
  version: 1;
  brand: { name: string; mark: string; tagline: string };
  theme: { palette: Palette; font: FontStyle; heroLayout: HeroLayout };
  nav: { links: { label: string; href: string }[]; cta: string };
  hero: { eyebrow: string; headline: string; sub: string; cta: string; note: string };
  features: { title: string; body: string }[];
  band?: { quote: string; caption: string };
  specs: { label: string; value: string }[];
  story: { title: string; body: string; bullets: string[] };
  offer: {
    label: string;
    priceCents: number | null;
    currency: string;
    compareAtCents: number | null;
    mode: OfferMode;
    note: string;
    includes: string[];
  };
  faq: { q: string; a: string }[];
  seo: { title: string; description: string };
};

export type Brief = {
  name: string;
  description: string;
  audience: string;
  tone: string;
  priceCents: number | null;
  currency: string;
  mode: OfferMode;
};

const str = (value: unknown, fallback: string, max = 400): string => {
  if (typeof value !== "string") return fallback;
  const clean = value.replace(/\s+/g, " ").trim();
  if (!clean) return fallback;
  return clean.slice(0, max);
};

export const initials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("") || "S";

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "PKR", "AED", "CAD", "AUD", "SGD"];

export const currencyCode = (value: unknown): string => {
  const code = typeof value === "string" ? value.toUpperCase() : "";
  return CURRENCIES.includes(code) ? code : "USD";
};

export const formatMoney = (cents: number, currency: string): string => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
    }).format(cents / 100);
  } catch {
    return `${currency} ${(cents / 100).toFixed(2)}`;
  }
};

export const briefFromForm = (data: Record<string, unknown>): Brief => {
  const priceRaw = typeof data.price === "string" ? Number(data.price.replace(/[^0-9.]/g, "")) : NaN;
  const priceCents = Number.isFinite(priceRaw) && priceRaw > 0 ? Math.round(priceRaw * 100) : null;
  const mode: OfferMode = priceCents && data.mode === "order" ? "order" : "inquiry";
  return {
    name: str(data.name, "Untitled product", 90),
    description: str(data.description, "", 1200),
    audience: str(data.audience, "", 200),
    tone: str(data.tone, "confident and warm", 60),
    priceCents,
    currency: currencyCode(data.currency),
    mode,
  };
};

/* ------------------------------------------------------------------ */
/* Storefront composer: reads the brief, then writes the page.         */
/* ------------------------------------------------------------------ */

const SAMPLE_THEMES: Palette[] = [
  {
    bg: "#f3efe6",
    surface: "#eae4d8",
    ink: "#1b1a17",
    muted: "#6b675d",
    line: "#d8d1c2",
    accent: "#c8452a",
    accentInk: "#fdf8f2",
  },
  {
    bg: "#0f1b18",
    surface: "#16241f",
    ink: "#f2f1e6",
    muted: "#9fb2a6",
    line: "#2a3a33",
    accent: "#d8ff6b",
    accentInk: "#10201a",
  },
  {
    bg: "#f6f2f7",
    surface: "#ffffff",
    ink: "#211a2b",
    muted: "#6e6180",
    line: "#e3dbe8",
    accent: "#5b2ee0",
    accentInk: "#ffffff",
  },
  {
    bg: "#111111",
    surface: "#1a1a1a",
    ink: "#f4f4f2",
    muted: "#9b9b96",
    line: "#2c2c2c",
    accent: "#ff6b35",
    accentInk: "#140a04",
  },
];

const hash = (value: string): number => {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0;
  return h;
};

const sentencesOf = (text: string): string[] =>
  text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 2);

const FORMAT_NAMES: Record<string, string> = {
  pdf: "PDF",
  epub: "EPUB",
  zip: "ZIP",
  mp3: "MP3",
  mp4: "MP4",
  wav: "WAV",
  figma: "Figma",
  notion: "Notion",
  psd: "PSD",
  keynote: "Keynote",
  "google slides": "Google Slides",
  spreadsheet: "Spreadsheet",
  "template pack": "Template pack",
};

const detectFormat = (text: string): string | null => {
  const match = text.match(
    /\b(pdf|epub|zip|mp3|mp4|wav|figma|notion|psd|keynote|google slides|spreadsheet|template pack)\b/i,
  );
  if (!match) return null;
  return FORMAT_NAMES[match[0].toLowerCase()] ?? match[0];
};

const detectLength = (text: string): string | null => {
  const pages = text.match(/\b(\d+)[- ](?:page|sheet|slide|chapter|lesson|module)s?\b/i);
  return pages ? pages[0].toLowerCase() : null;
};

/** Pull "includes X, Y and Z" out of the description instead of inventing contents. */
const contentsOf = (text: string): string[] => {
  const match = text.match(/\b(?:includes?|including|comes with|you get|contains?)\b[:\s]+([^.!?]+)/i);
  if (!match) return [];
  return match[1]
    .split(/\s*[,;]\s*|\s+(?:and|plus)\s+/i)
    .map((item) =>
      item
        .replace(/^(?:a|an|the)\s+/i, "")
        .replace(/[.!?]+$/, "")
        .trim(),
    )
    .filter((item) => item.length >= 3 && item.length <= 70)
    .slice(0, 5);
};

const capitalise = (value: string): string =>
  value.length ? value[0].toUpperCase() + value.slice(1) : value;

const withAnd = (items: string[]): string =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

export const composeSpec = (brief: Brief): SiteSpec => {
  const seed = hash(brief.name + brief.description + brief.tone);
  const palette = SAMPLE_THEMES[seed % SAMPLE_THEMES.length];
  const tone = brief.tone.toLowerCase();
  const font: FontStyle = tone.includes("technical")
    ? "technical"
    : tone.includes("playful") || tone.includes("bold")
      ? "modern"
      : "editorial";
  const layout: HeroLayout = tone.includes("bold")
    ? "poster"
    : tone.includes("quiet") || tone.includes("technical")
      ? "split"
      : "centered";

  const money = brief.priceCents ? formatMoney(brief.priceCents, brief.currency) : null;
  const canOrder = brief.mode === "order" && Boolean(brief.priceCents);
  const description = brief.description.trim();
  const sentences = sentencesOf(description);
  const format = detectFormat(description);
  const length = detectLength(description);
  const contents = contentsOf(description);
  const firstSentence = sentences[0] ?? "";
  const secondSentence = sentences[1] ?? "";
  const audience = brief.audience.trim();
  const secondIsContents = /^\s*(includes?|including|comes with|you get|contains?)\b/i.test(secondSentence);

  const formatLabel = [format, length].filter(Boolean).join(" · ");
  const contentsLabel = contents.length
    ? withAnd(contents.slice(0, 3)) + (contents.length > 3 ? " and more" : "")
    : firstSentence;

  const heroSub =
    firstSentence ||
    `${brief.name} is a digital product${audience ? ` for ${audience.toLowerCase()}` : ""}, delivered by email after you order.`;

  const featureOneBody = contents.length
    ? `Inside: ${withAnd(contents)}.`
    : firstSentence || "Everything included in one download, ready the moment it reaches your inbox.";

  const featureTwoTitle = audience ? `Made for ${audience.toLowerCase()}` : "Made to be used";
  const featureTwoBody = audience
    ? `Built for ${audience.toLowerCase()} — ${contents[0] ?? "everything you need"} included from the start.`
    : secondSentence && !secondIsContents
      ? secondSentence
      : "Open it and get to work — nothing to install and no manual to read first.";

  const featureThreeBody = format
    ? `${format}${length ? ` (${length})` : ""}, sent straight to your inbox after you order.`
    : "Your files are sent straight to your inbox after you order. No account, no app.";

  const band =
    secondSentence && !secondIsContents && secondSentence.length > 35
      ? { quote: `“${secondSentence.replace(/^["“]|["”]$/g, "")}”`, caption: "From the product notes" }
      : undefined;

  return {
    version: 1,
    brand: {
      name: brief.name,
      mark: initials(brief.name),
      tagline: `${brief.name}, made to be used.`,
    },
    theme: { palette, font, heroLayout: layout },
    nav: {
      links: [
        { label: "What's inside", href: "#product" },
        { label: "Details", href: "#details" },
        { label: "FAQ", href: "#faq" },
      ],
      cta: canOrder ? "Get the files" : "Ask about it",
    },
    hero: {
      eyebrow: `Available now${format ? ` · ${format}` : ""}${length ? ` · ${length}` : ""}`,
      headline: `${brief.name}.`,
      sub: heroSub,
      cta: canOrder && money ? `Get it — ${money}` : "Request availability",
      note: "Digital delivery by email · No account needed",
    },
    features: [
      {
        title: formatLabel || "Everything in one download",
        body: featureOneBody,
      },
      {
        title: featureTwoTitle,
        body: featureTwoBody,
      },
      {
        title: "Delivered by email",
        body: featureThreeBody,
      },
    ],
    band,
    specs: [
      { label: "Designed for", value: audience || "Personal use" },
      { label: "Format", value: formatLabel || "Digital files" },
      { label: "Includes", value: contentsLabel ? capitalise(contentsLabel) : "See the description" },
      { label: "Delivery", value: "Email, after your order" },
    ],
    story: {
      title: `About ${brief.name}`,
      body:
        description ||
        `${brief.name} is delivered by email after you order${format ? `, as ${format}${length ? ` (${length})` : ""}` : ""}.`,
      bullets:
        contents.length >= 2
          ? contents.slice(0, 3).map(capitalise)
          : [format ? `${format} files` : "Digital files", "Email delivery", "One-time purchase"],
    },
    offer: {
      label: canOrder ? "One price. Yours to keep." : "Contact us",
      priceCents: brief.priceCents,
      currency: brief.currency,
      compareAtCents: null,
      mode: brief.mode,
      note: canOrder
        ? "Order below and the maker sends your files by email. One purchase, yours to keep."
        : "Leave your details and we will send availability, pricing and what is included.",
      includes: [
        format ? `${format} files` : "Digital files",
        "Email delivery",
        "One-time purchase",
      ],
    },
    faq: [
      {
        q: "How do I get the files?",
        a: "Order with your email and the maker sends your files to that address, usually the same day.",
      },
      {
        q: "What exactly do I get?",
        a: contents.length
          ? `You get ${withAnd(contents)}.`
          : firstSentence || "Everything described on this page, in digital form.",
      },
      {
        q: "Can I get a refund?",
        a: "Digital files cannot be returned, but if something is wrong with yours, reply to your order email and we will make it right.",
      },
    ],
    seo: {
      title: `${brief.name} — ${format ? `${format} download` : "digital download"}`,
      description: (description || `${brief.name}, a digital product made to be used.`).slice(0, 160),
    },
  };
};
