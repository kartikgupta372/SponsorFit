import Link from "next/link";
import { ArrowRight, Gem, Mic, Play, Radar, Send, Trophy, Reply, Plus, Sparkles } from "lucide-react";
import { Greeting } from "@/components/dashboard/Greeting";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { CoverArt } from "@/components/art/CoverArt";
import { BrandMark } from "@/components/art/BrandMark";
import { FitRing } from "@/components/charts/FitRing";
import { loadDeals, loadShows, loadTopFits, session } from "@/lib/server/data";
import { compact, hashSeed, hueOf, type DealStage, type MatchRow } from "@/lib/model";

export const dynamic = "force-dynamic";

const STAGES: DealStage[] = ["Pitched", "Replied", "Negotiating", "Won", "Lost"];
const STAGE_BAR: Record<DealStage, string> = {
  Pitched: "bg-violet-400",
  Replied: "bg-orchid-400",
  Negotiating: "bg-signal-400",
  Won: "bg-mint",
  Lost: "bg-white/25",
};

export default async function DashboardPage() {
  const { sb } = await session();
  const [shows, deals] = await Promise.all([loadShows(), loadDeals()]);
  const tops = await loadTopFits(shows.map((s) => s.analysisId));
  const latest = shows.find((s) => s.status === "complete");
  const { data: gemRows } = latest
    ? await sb.from("matches").select("*").eq("analysis_id", latest.analysisId).eq("hidden_gem", true).is("safety", null).order("fit", { ascending: false }).limit(3)
    : { data: [] };
  const gems = (gemRows ?? []) as MatchRow[];

  const sent = deals.length;
  const replied = deals.filter((d) => d.stage !== "Pitched").length;
  const won = deals.filter((d) => d.stage === "Won");
  const open = deals.filter((d) => d.stage === "Replied" || d.stage === "Negotiating").length;
  const maxStage = Math.max(1, ...STAGES.map((s) => deals.filter((d) => d.stage === s).length));

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

      {shows.length === 0 && (
        <section className="relative overflow-hidden rounded-3xl border border-orchid-400/30 bg-gradient-to-br from-violet-700/40 via-eggplant-850 to-eggplant-900 p-7 sm:p-10">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-signal-500/15 text-signal-400">
            <Sparkles size={24} />
          </span>
          <h2 className="mt-5 max-w-xl font-display text-3xl font-semibold leading-tight">Find the brands your audience already loves</h2>
          <p className="mt-3 max-w-xl text-ink-soft">
            Search your show, and the agent reads its audience through Qloo&apos;s taste graph, ranks brands by Fit Score and drafts
            the pitch. It takes about 20 seconds.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button href="/app/new?q=Radiolab&p=podcast">Try it with Radiolab</Button>
            <Button href="/app/new" variant="outline">Use my own show</Button>
          </div>
        </section>
      )}

      <section aria-label="Key numbers" className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Shows analyzed" value={String(shows.length)} icon={<Radar size={18} />} />
        <StatCard label="Pitches sent" value={String(sent)} icon={<Send size={18} />} />
        <StatCard label="Reply rate" value={sent ? `${Math.round((replied / sent) * 100)}%` : "n/a"} trend={sent ? `${replied} of ${sent} replied` : undefined} icon={<Reply size={18} />} />
        <StatCard label="Deals won" value={`$${won.reduce((s, d) => s + d.amount, 0).toLocaleString("en-US")}`} trend={won.length ? `${won.length} signed` : undefined} icon={<Trophy size={18} />} />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="surface p-5 sm:p-6" aria-labelledby="recent-h">
          <div className="mb-5 flex items-center justify-between">
            <h2 id="recent-h" className="text-lg font-semibold">Recent analyses</h2>
            <Link href="/app/analyses" className="flex items-center gap-1 text-sm text-violet-300 hover:text-orchid-300">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {shows.length === 0 ? (
            <p className="text-sm text-ink-muted">No analyses yet.</p>
          ) : (
            <ul className="divide-y divide-white/[0.06]">
              {shows.slice(0, 5).map((s) => (
                <li key={s.analysisId}>
                  <Link
                    href={s.status === "complete" ? `/app/shows/${s.analysisId}` : `/app/runs/${s.analysisId}`}
                    className="group flex items-center gap-4 py-3.5 transition-colors first:pt-0 last:pb-0"
                  >
                    <span className="h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                      <CoverArt seed={hashSeed(s.show.name)} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold group-hover:text-orchid-300">{s.show.name}</span>
                      <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
                        <span className="flex items-center gap-1">
                          {s.show.platform === "podcast" ? <Mic size={12} /> : <Play size={12} />}
                          {s.show.platform === "podcast" ? "Podcast" : "YouTube"}
                        </span>
                        <span>{compact(s.show.audience_size)} audience</span>
                        <span>{new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      </span>
                    </span>
                    <Chip tone={s.status === "complete" ? "mint" : s.status === "failed" ? "signal" : "violet"} className="hidden sm:inline-flex">
                      {s.status === "complete" ? "Complete" : s.status === "failed" ? "Failed" : "Running"}
                    </Chip>
                    {tops[s.analysisId] !== undefined && <FitRing score={tops[s.analysisId]} size={50} stroke={5} label={false} />}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="surface p-5 sm:p-6" aria-labelledby="pipe-h">
          <div className="mb-5 flex items-center justify-between">
            <h2 id="pipe-h" className="text-lg font-semibold">Pipeline</h2>
            <Link href="/app/pipeline" className="flex items-center gap-1 text-sm text-violet-300 hover:text-orchid-300">
              Open board <ArrowRight size={14} />
            </Link>
          </div>
          <ul className="space-y-4">
            {STAGES.map((stage) => {
              const count = deals.filter((d) => d.stage === stage).length;
              return (
                <li key={stage}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="text-ink-soft">{stage}</span>
                    <span className="font-semibold tabular-nums">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.07]">
                    <div className={`h-full rounded-full ${STAGE_BAR[stage]}`} style={{ width: `${(count / maxStage) * 100}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="mt-5 border-t border-white/[0.06] pt-4 text-sm text-ink-muted">
            {sent === 0 ? (
              <>No pitches yet. Open a sponsor and press <span className="text-ink">Mark as pitched</span>.</>
            ) : (
              <><span className="font-semibold text-ink">{open} conversations</span> are waiting on your next move.</>
            )}
          </p>
        </section>
      </div>

      {gems.length > 0 && latest && (
        <section aria-labelledby="gems-h">
          <div className="mb-4 flex flex-wrap items-center gap-2.5">
            <Gem size={19} className="text-signal-400" />
            <h2 id="gems-h" className="text-lg font-semibold">Hidden gems for {latest.show.name}</h2>
            <span className="text-sm text-ink-muted">High fit, low competition</span>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {gems.map((b) => (
              <Link key={b.id} href={`/app/sponsors/${b.id}`} className="surface group flex items-center gap-4 p-4 transition-colors hover:border-orchid-400/40">
                <BrandMark name={b.name} hue={hueOf(b.name)} size={52} />
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
      )}
    </div>
  );
}
