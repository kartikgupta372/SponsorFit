import Link from "next/link";
import { ArrowRight, Gem, Mic, Play, Radar, Send, Trophy, Reply, Plus } from "lucide-react";
import { Greeting } from "@/components/dashboard/Greeting";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { CoverArt } from "@/components/art/CoverArt";
import { BrandMark } from "@/components/art/BrandMark";
import { FitRing } from "@/components/charts/FitRing";
import { BRANDS, DEALS, SHOWS, dealStats } from "@/lib/mock-data";
import type { DealStage } from "@/lib/types";

const STAGES: DealStage[] = ["Pitched", "Replied", "Negotiating", "Won", "Lost"];
const STAGE_BAR: Record<DealStage, string> = {
  Pitched: "bg-violet-400",
  Replied: "bg-orchid-400",
  Negotiating: "bg-signal-400",
  Won: "bg-mint",
  Lost: "bg-white/25",
};

export default function DashboardPage() {
  const stats = dealStats();
  const maxStage = Math.max(...STAGES.map((s) => DEALS.filter((d) => d.stage === s).length));
  const gems = BRANDS.filter((b) => b.hiddenGem && !b.safety).slice(0, 3);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Greeting />
          <p className="mt-2 text-ink-muted">Here is where your sponsorship work stands today.</p>
        </div>
        <Button href="/app/new">
          <Plus size={17} /> Run a new analysis
        </Button>
      </div>

      {/* Stat cards */}
      <section aria-label="Key numbers" className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Shows analyzed" value={String(SHOWS.length)} icon={<Radar size={18} />} spark={[1, 1, 2, 2, 2, 3]} />
        <StatCard label="Pitches sent" value={String(stats.sent)} trend="+4 this week" icon={<Send size={18} />} spark={[2, 3, 3, 5, 7, 8, 11]} />
        <StatCard label="Reply rate" value={`${stats.replyRate}%`} trend="Above creator average" icon={<Reply size={18} />} spark={[30, 38, 35, 44, 50, 55]} />
        <StatCard label="Deals won" value={`$${stats.wonValue.toLocaleString("en-US")}`} trend={`${stats.wonCount} signed`} icon={<Trophy size={18} />} spark={[0, 0, 500, 500, 2300, 2300]} />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        {/* Recent analyses */}
        <section className="surface p-5 sm:p-6" aria-labelledby="recent-h">
          <div className="mb-5 flex items-center justify-between">
            <h2 id="recent-h" className="text-lg font-semibold">Recent analyses</h2>
            <Link href="/app/analyses" className="flex items-center gap-1 text-sm text-violet-300 hover:text-orchid-300">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <ul className="divide-y divide-white/[0.06]">
            {SHOWS.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/app/shows/${s.id}`}
                  className="group flex items-center gap-4 py-3.5 transition-colors first:pt-0 last:pb-0"
                >
                  <span className="h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                    <CoverArt seed={s.seed} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold group-hover:text-orchid-300">{s.name}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
                      <span className="flex items-center gap-1">
                        {s.platform === "podcast" ? <Mic size={12} /> : <Play size={12} />}
                        {s.platform === "podcast" ? "Podcast" : "YouTube"}
                      </span>
                      <span>{s.reach}</span>
                      <span>{s.analyzedOn}</span>
                    </span>
                  </span>
                  <Chip tone="mint" className="hidden sm:inline-flex">Complete</Chip>
                  <FitRing score={s.topFit} size={50} stroke={5} label={false} />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Pipeline snapshot */}
        <section className="surface p-5 sm:p-6" aria-labelledby="pipe-h">
          <div className="mb-5 flex items-center justify-between">
            <h2 id="pipe-h" className="text-lg font-semibold">Pipeline</h2>
            <Link href="/app/pipeline" className="flex items-center gap-1 text-sm text-violet-300 hover:text-orchid-300">
              Open board <ArrowRight size={14} />
            </Link>
          </div>
          <ul className="space-y-4">
            {STAGES.map((stage) => {
              const count = DEALS.filter((d) => d.stage === stage).length;
              return (
                <li key={stage}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="text-ink-soft">{stage}</span>
                    <span className="font-semibold tabular-nums">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.07]">
                    <div
                      className={`h-full rounded-full ${STAGE_BAR[stage]}`}
                      style={{ width: `${(count / maxStage) * 100}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="mt-5 border-t border-white/[0.06] pt-4 text-sm text-ink-muted">
            <span className="font-semibold text-ink">{stats.open} conversations</span> are waiting on your next move.
          </p>
        </section>
      </div>

      {/* Fresh gems */}
      <section aria-labelledby="gems-h">
        <div className="mb-4 flex items-center gap-2.5">
          <Gem size={19} className="text-signal-400" />
          <h2 id="gems-h" className="text-lg font-semibold">Hidden gems for The Deep Dive</h2>
          <span className="text-sm text-ink-muted">High fit, low competition</span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {gems.map((b) => (
            <Link
              key={b.id}
              href={`/app/sponsors/${b.id}`}
              className="surface group flex items-center gap-4 p-4 transition-colors hover:border-orchid-400/40"
            >
              <BrandMark name={b.name} hue={b.hue} size={52} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold group-hover:text-orchid-300">{b.name}</p>
                <p className="mt-0.5 truncate text-xs text-ink-muted">{b.category}</p>
                <p className="mt-1.5 line-clamp-2 text-xs text-ink-soft">{b.reasons[0]}</p>
              </div>
              <FitRing score={b.fit} size={52} stroke={5} label={false} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
