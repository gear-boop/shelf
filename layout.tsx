import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shelf — a digital product becomes a storefront",
  description:
    "Shelf turns a cover image and a short brief into a published storefront for a digital product, with a working order backend.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-paper text-ink antialiased">{children}</body>
    </html>
  );
}
