import type { IndexBar } from "@/lib/model";

/**
 * Diverging bars for Qloo's over/under-index values (-100..100).
 * Right of centre: this audience over-indexes. Left: under-indexes.
 */
export function IndexBars({ rows, empty = "Qloo returned no demographic data for this audience." }: { rows: IndexBar[]; empty?: string }) {
  if (!rows.length) return <p className="text-sm text-ink-muted">{empty}</p>;
  const max = Math.max(...rows.map((r) => Math.abs(r.index)), 1);
  return (
    <ul className="space-y-3">
      {rows.map((r) => {
        const w = (Math.abs(r.index) / max) * 50;
        const pos = r.index >= 0;
        return (
          <li key={r.label} className="grid grid-cols-[5rem_1fr_3rem] items-center gap-3 text-sm">
            <span className="text-ink-muted">{r.label}</span>
            <span className="relative h-2.5 rounded-full bg-white/[0.06]">
              <span className="absolute inset-y-[-3px] left-1/2 w-px bg-white/25" />
              <span
                className={pos ? "absolute inset-y-0 left-1/2 rounded-r-full bg-gradient-to-r from-violet-500 to-orchid-400" : "absolute inset-y-0 rounded-l-full bg-white/30"}
                style={pos ? { width: `${w}%` } : { width: `${w}%`, right: "50%" }}
              />
            </span>
            <span className={pos ? "text-right tabular-nums text-orchid-300" : "text-right tabular-nums text-ink-muted"}>
              {pos ? "+" : ""}
              {r.index}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
