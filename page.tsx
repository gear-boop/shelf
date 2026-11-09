import type { Metadata } from "next";
import DashboardClient from "@/components/dashboard-client";
import { Brand } from "@/components/brand";

export const metadata: Metadata = {
  title: "Order book — Shelf",
  description: "Orders from every storefront you have built.",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b hairline">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-4">
          <Brand />
          <div className="flex items-center gap-6 text-[12px] text-ink/45">
            <a href="/" className="transition hover:text-ink">
              Studio
            </a>
            <a href="/#workflow" className="hidden transition hover:text-ink sm:block">
              Workflow
            </a>
          </div>
        </div>
      </header>
      <DashboardClient />
    </div>
  );
}
