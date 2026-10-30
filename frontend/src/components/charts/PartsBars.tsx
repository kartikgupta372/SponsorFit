import type { ScoreParts } from "@/lib/types";
import { cn } from "@/lib/cn";

const ROWS: { key: keyof ScoreParts; label: string; weight: string; color: string }[] = [
  { key: "affinity", label: "Affinity", weight: "45%", color: "bg-signal-500" },
  { key: "demographic", label: "Demographics", weight: "25%", color: "bg-orchid-400" },
  { key: "taste", label: "Taste overlap", weight: "20%", color: "bg-violet-500" },
  { key: "novelty", label: "Novelty", weight: "10%", color: "bg-violet-300" },
];

/** The four parts behind a Fit Score, so the number is never a black box. */
export function PartsBars({
  parts,
  compact = false,
}: {
  parts: ScoreParts;
  compact?: boolean;
}) {
  return (
    <ul className={cn("space-y-2", compact && "space-y-1.5")}>
      {ROWS.map((row) => (
        <li key={row.key} className="flex items-center gap-3">
          <span
            className={cn(
              "shrink-0 text-ink-muted",
              compact ? "w-[5.5rem] text-[11px]" : "w-28 text-xs",
            )}
          >
            {row.label}
            {!compact && <span className="ml-1 text-ink-faint">{row.weight}</span>}
          </span>
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
            <span
              className={cn("block h-full rounded-full", row.color)}
              style={{ width: `${Math.round(parts[row.key] * 100)}%` }}
            />
          </span>
          <span className="w-8 text-right text-xs tabular-nums text-ink-soft">
            {Math.round(parts[row.key] * 100)}
          </span>
        </li>
      ))}
    </ul>
  );
}
