import Link from "next/link";
import { Mic, Play, Plus, Radar } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { CoverArt } from "@/components/art/CoverArt";
import { FitRing } from "@/components/charts/FitRing";
import { loadShows, loadTopFits } from "@/lib/server/data";
import { compact, hashSeed } from "@/lib/model";

export const metadata = { title: "Analyses | SponsorFit" };
export const dynamic = "force-dynamic";

export default async function AnalysesPage() {
  const shows = await loadShows();
  const tops = await loadTopFits(shows.map((s) => s.analysisId));
  return (
    <div>
      <PageHeader
        eyebrow="Analyses"
        title="Your shows"
        subtitle="Every show you have analyzed. Open one to see its audience and matching sponsors."
        actions={<Button href="/app/new"><Plus size={17} /> New analysis</Button>}
      />
      {shows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 px-6 py-16 text-center">
          <Radar className="mx-auto text-ink-faint" size={30} />
          <h2 className="mt-4 font-display text-2xl font-semibold">No analyses yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">Search your show and the agent will map its audience in about 20 seconds.</p>
          <Button href="/app/new" className="mt-6">Run your first analysis</Button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {shows.map((s) => (
            <Link
              key={s.analysisId}
              href={s.status === "complete" ? `/app/shows/${s.analysisId}` : `/app/runs/${s.analysisId}`}
              className="surface group overflow-hidden transition-colors hover:border-orchid-400/40"
            >
              <div className="relative h-40 overflow-hidden">
                <div className="h-full w-full transition-transform duration-500 group-hover:scale-105">
                  <CoverArt seed={hashSeed(s.show.name)} rounded={false} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-eggplant-850 to-transparent" />
                {tops[s.analysisId] !== undefined && (
                  <div className="absolute bottom-3 right-3">
                    <FitRing score={tops[s.analysisId]} size={58} stroke={6} label={false} />
                  </div>
                )}
              </div>
              <div className="p-5">
                <h2 className="font-display text-xl font-semibold group-hover:text-orchid-300">{s.show.name}</h2>
                <p className="mt-1 text-sm text-ink-muted">{compact(s.show.audience_size)} {s.show.platform === "podcast" ? "listeners / episode" : "views / video"}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Chip tone="violet" icon={s.show.platform === "podcast" ? <Mic size={11} /> : <Play size={11} />}>
                    {s.show.platform === "podcast" ? "Podcast" : "YouTube"}
                  </Chip>
                  <Chip tone={s.status === "complete" ? "mint" : s.status === "failed" ? "signal" : "neutral"}>{s.status}</Chip>
                  {s.source === "sample" && <Chip>sample data</Chip>}
                  <span className="text-xs text-ink-faint">{new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
