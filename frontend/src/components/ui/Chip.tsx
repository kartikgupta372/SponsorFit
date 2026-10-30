import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "violet" | "orchid" | "signal" | "mint" | "neutral";

const tones: Record<Tone, string> = {
  violet: "bg-violet-500/15 text-violet-300 border-violet-400/25",
  orchid: "bg-orchid-400/15 text-orchid-300 border-orchid-400/30",
  signal: "bg-signal-500/15 text-signal-400 border-signal-500/30",
  mint: "bg-mint/10 text-mint border-mint/25",
  neutral: "bg-white/[0.05] text-ink-soft border-white/10",
};

export function Chip({
  tone = "neutral",
  children,
  className,
  icon,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium leading-none",
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
