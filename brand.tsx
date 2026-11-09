import Link from "next/link";

export const Brand = ({ href = "/" }: { href?: string }) => (
  <Link href={href} className="inline-flex items-baseline">
    <span className="text-[15px] font-semibold tracking-[-0.015em] text-ink">
      Shelf<span className="text-clay">.</span>
    </span>
  </Link>
);
