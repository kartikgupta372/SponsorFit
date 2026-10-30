import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { BrandMark } from "@/components/art/BrandMark";
import { loadShows, session } from "@/lib/server/data";
import { hueOf, type DealRow, type MatchRow, type PitchRow } from "@/lib/model";

export const metadata = { title: "Pitches | SponsorFit" };
export const dynamic = "force-dynamic";

const STAGE_TONE = { Pitched: "violet", Replied: "orchid", Negotiating: "signal", Won: "mint", Lost: "neutral" } as const;

export default async function PitchesPage() {
  const { sb } = await session();
  const shows = await loadShows();
  const latest = shows.find((s) => s.status === "complete");
  const [{ data: m }, { data: p }, { data: d }] = await Promise.all([
    latest ? sb.from("matches").select("*").eq("analysis_id", latest.analysisId).is("safety", null).order("rank").limit(10) : Promise.resolve({ data: [] }),
    sb.from("pitches").select("*").order("updated_at", { ascending: false }),
    sb.from("deals").select("*"),
  ]);
  const matches = (m ?? []) as MatchRow[];
  const pitches = (p ?? []) as PitchRow[];
  const deals = (d ?? []) as DealRow[];
  const drafted = new Set(pitches.map((x) => x.match_id));
  const { data: draftedRows } = pitches.length
    ? await sb.from("matches").select("*").in("id", pitches.map((x) => x.match_id))
    : { data: [] };
  const rows = [...((draftedRows ?? []) as MatchRow[]), ...matches.filter((x) => !drafted.has(x.id))];

  return (
    <div>
      <PageHeader eyebrow="Pitches" title="Your pitches" subtitle="Each brand gets an email grounded in its evidence. Open one to pick a tone, edit and send." />
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 px-6 py-16 text-center">
          <Mail className="mx-auto text-ink-faint" size={30} />
          <h2 className="mt-4 font-display text-2xl font-semibold">No pitches yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">Run an analysis first. Every brand on your shortlist can get a pitch.</p>
          <Button href="/app/new" className="mt-6">Run an analysis</Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((b) => {
            const deal = deals.find((x) => x.match_id === b.id);
            const pitch = pitches.find((x) => x.match_id === b.id);
            return (
              <li key={b.id}>
                <Link href={`/app/pitches/${b.id}`} className="surface group flex items-center gap-4 p-4 transition-colors hover:border-orchid-400/40 sm:p-5">
                  <BrandMark name={b.name} hue={hueOf(b.name)} size={46} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold group-hover:text-orchid-300">{b.name}</span>
                    <span className="mt-0.5 block truncate text-sm text-ink-muted">{pitch ? pitch.subject : b.reasons[0]}</span>
                  </span>
                  <span className="hidden text-sm tabular-nums text-ink-muted sm:block">Fit {b.fit}</span>
                  <Chip tone={deal ? STAGE_TONE[deal.stage] : pitch ? "orchid" : "neutral"}>{deal ? deal.stage : pitch ? "Drafted" : "Not drafted"}</Chip>
                  <ArrowRight size={17} className="text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-orchid-300" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
