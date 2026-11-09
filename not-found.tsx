import { Brand } from "@/components/brand";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Brand />
      <p className="mt-9 font-mono text-[10px] tracking-[0.18em] text-clay uppercase">404</p>
      <h1 className="mt-3 text-[30px] leading-tight font-medium tracking-[-0.025em] text-ink">
        This storefront is not here.
      </h1>
      <p className="mt-2 max-w-[40ch] text-[13px] leading-relaxed text-ink/50">
        The address may be mistyped, or the storefront was deleted.
      </p>
      <a
        href="/"
        className="mt-6 rounded-md bg-ink px-4 py-2 text-[12px] font-medium text-paper transition hover:bg-ink/85"
      >
        Back to the studio
      </a>
    </main>
  );
}
