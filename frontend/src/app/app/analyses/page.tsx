import Link from "next/link";
import { Mic, Play, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { CoverArt } from "@/components/art/CoverArt";
import { FitRing } from "@/components/charts/FitRing";
import { SHOWS } from "@/lib/mock-data";

export const metadata = { title: "Analyses | SponsorFit" };

export default function AnalysesPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Analyses"
        title="Your shows"
        subtitle="Every show you have analyzed. Open one to see its audience and matching sponsors."
        actions={
          <Button href="/app/new">
            <Plus size={17} /> New analysis
          </Button>
        }
      />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {SHOWS.map((s) => (
          <Link
            key={s.id}
            href={`/app/shows/${s.id}`}
            className="surface group overflow-hidden transition-colors hover:border-orchid-400/40"
          >
            <div className="relative h-40 overflow-hidden">
              <div className="h-full w-full transition-transform duration-500 group-hover:scale-105">
                <CoverArt seed={s.seed} rounded={false} />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-eggplant-850 to-transparent" />
              <div className="absolute bottom-3 right-3">
                <FitRing score={s.topFit} size={58} stroke={6} label={false} />
              </div>
            </div>
            <div className="p-5">
              <h2 className="font-display text-xl font-semibold group-hover:text-orchid-300">{s.name}</h2>
              <p className="mt-1 text-sm text-ink-muted">Hosted by {s.host}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Chip tone="violet" icon={s.platform === "podcast" ? <Mic size={11} /> : <Play size={11} />}>
                  {s.platform === "podcast" ? "Podcast" : "YouTube"}
                </Chip>
                <Chip>{s.category}</Chip>
                <span className="text-xs text-ink-faint">{s.analyzedOn}</span>
              </div>
            </div>
          </Link>
        ))}
        <Link
          href="/app/new"
          className="flex min-h-[18rem] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/15 text-ink-muted transition-colors hover:border-orchid-400/50 hover:text-ink"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.06]">
            <Plus size={22} />
          </span>
          <span className="text-sm font-medium">Analyze another show</span>
        </Link>
      </div>
    </div>
  );
}
