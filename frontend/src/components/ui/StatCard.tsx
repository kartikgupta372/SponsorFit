import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { Sparkline } from "@/components/charts/Sparkline";

export function StatCard({
  label,
  value,
  trend,
  spark,
  icon,
}: {
  label: string;
  value: string;
  trend?: string;
  spark?: number[];
  icon?: ReactNode;
}) {
  return (
    <div className="surface relative overflow-hidden p-5">
      <div className="flex items-start justify-between">
        <p className="label">{label}</p>
        {icon && <span className="text-ink-faint">{icon}</span>}
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="font-display text-4xl font-semibold leading-none tabular-nums">{value}</p>
          {trend && (
            <p className="mt-2 flex items-center gap-1 text-xs font-medium text-mint">
              <ArrowUpRight size={13} />
              {trend}
            </p>
          )}
        </div>
        {spark && <Sparkline values={spark} />}
      </div>
    </div>
  );
}
