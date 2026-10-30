"use client";

import { cn } from "@/lib/cn";

/** "Continue with Google" button. Plain letter glyph, no brand asset needed. */
export function GoogleButton({
  onClick,
  loading,
  children = "Continue with Google",
}: {
  onClick: () => void;
  loading?: boolean;
  children?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={cn(
        "flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/[0.04]",
        "text-sm font-semibold text-ink transition-colors hover:border-white/30 hover:bg-white/[0.08] disabled:opacity-60",
      )}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-bold text-eggplant-900">
        G
      </span>
      {children}
    </button>
  );
}

export function OrDivider() {
  return (
    <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-widest text-ink-faint">
      <span className="h-px flex-1 bg-white/10" />
      or
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}
