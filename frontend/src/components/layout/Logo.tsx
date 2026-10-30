import Link from "next/link";
import { cn } from "@/lib/cn";

/** Two overlapping circles: audience x brand = fit. */
export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="lm-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#ef7fd8" />
        </linearGradient>
        <linearGradient id="lm-b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ef7fd8" />
          <stop offset="1" stopColor="#ff6a13" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="16" r="9" fill="url(#lm-a)" />
      <circle cx="20" cy="16" r="9" fill="url(#lm-b)" style={{ mixBlendMode: "screen" }} opacity="0.92" />
    </svg>
  );
}

export function Logo({
  href = "/",
  className,
  size = 30,
}: {
  href?: string;
  className?: string;
  size?: number;
}) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5", className)} aria-label="SponsorFit home">
      <LogoMark size={size} />
      <span className="font-display text-xl font-semibold tracking-tight text-ink">
        Sponsor<span className="text-gradient">Fit</span>
      </span>
    </Link>
  );
}
