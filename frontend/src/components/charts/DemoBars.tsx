import { cn } from "@/lib/cn";

interface Row {
  label: string;
  show: number;
  baseline: number;
}

/**
 * Horizontal bars: the filled bar is this show's audience share, the thin
 * marker is the general population. "x" shows how much the audience over-indexes.
 */
export function DemoBars({ rows, unit = "%" }: { rows: Row[]; unit?: string }) {
  const max = Math.max(...rows.flatMap((r) => [r.show, r.baseline])) * 1.15;
  return (
    <ul className="space-y-3.5">
      {rows.map((row) => {
        const index = row.show / row.baseline;
        const over = index >= 1.15;
        return (
          <li key={row.label}>
            <div className="mb-1.5 flex items-baseline justify-between text-sm">
              <span className="text-ink-soft">{row.label}</span>
              <span className="flex items-center gap-2">
                <span className="tabular-nums text-ink">
                  {row.show}
                  {unit}
                </span>
                <span
                  className={cn(
                    "rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
                    over
                      ? "bg-signal-500/15 text-signal-400"
                      : index < 0.85
                        ? "bg-white/[0.05] text-ink-faint"
                        : "bg-white/[0.05] text-ink-muted",
                  )}
                  title="Compared with the general population"
                >
                  {index.toFixed(1)}x
                </span>
              </span>
            </div>
            <div className="relative h-2.5 rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 via-orchid-400 to-signal-500"
                style={{ width: `${(row.show / max) * 100}%` }}
              />
              <div
                className="absolute top-[-3px] h-[16px] w-[2px] rounded bg-white/70"
                style={{ left: `${(row.baseline / max) * 100}%` }}
                title={`General population: ${row.baseline}${unit}`}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
