import Link from "next/link";
import { ArrowLeft, Check, Eye, Gem, Mail } from "lucide-react";
import { BrandMark } from "@/components/art/BrandMark";
import { FitRing } from "@/components/charts/FitRing";
import { PartsBars } from "@/components/charts/PartsBars";
import { IndexBars } from "@/components/charts/IndexBars";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { KitShare } from "@/components/sponsors/CopyLinkButton";
import { KitDocument } from "@/components/kit/KitDocument";
import { loadMatch } from "@/lib/server/data";
import { CPM, ageBars, buildKit, compact, hueOf, rateFor } from "@/lib/model";
import { fitLevel } from "@/lib/scoring";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sponsor | SponsorFit" };

export default async function SponsorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { match, analysis, show, kit } = await loadMatch(id);
  const rate = rateFor(show.audience_size, match.fit);
  const brandAge = ageBars(match.demographics?.age);
  const audienceAge = "age" in analysis.profile ? analysis.profile.age : [];
  const shared = match.demographics?.shared ?? [];
  const kitData = kit?.data ?? buildKit(show, match, analysis);

  return (
    <div>
      <Link href={`/app/shows/${analysis.id}/sponsors`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft size={15} /> All sponsors for {show.name}
      </Link>

      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-5">
          <BrandMark name={match.name} hue={hueOf(match.name)} size={72} />
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{match.name}</h1>
            <p className="mt-1.5 text-ink-muted">Rank #{match.rank} of the brands Qloo surfaced for {show.name}&apos;s audience.</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Chip>{match.category}</Chip>
              <Chip tone="orchid">{fitLevel(match.fit)} fit</Chip>
              {match.hidden_gem && <Chip tone="signal" icon={<Gem size={11} />}>Hidden gem</Chip>}
              {match.safety && <Chip tone="signal">Flagged: {match.safety}</Chip>}
              {match.competitor_of && <Chip>Competes with {match.competitor_of}</Chip>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <FitRing score={match.fit} size={110} stroke={10} />
          <Button href={`/app/pitches/${match.id}`} size="lg">
            <Mail size={18} /> Draft pitch
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="min-w-0 space-y-6">
          <section className="surface p-6">
            <h2 className="font-semibold">Why this score</h2>
            <p className="mt-1 text-sm text-ink-muted">Four parts, each from 0 to 100, all computed from Qloo data.</p>
            <div className="mt-5">
              <PartsBars parts={match.parts} />
            </div>
            <ul className="mt-5 space-y-2 rounded-xl bg-white/[0.04] px-4 py-3 text-xs leading-relaxed text-ink-muted">
              <li><b className="text-ink-soft">Affinity (45%)</b>: how strongly this audience over-indexes on {match.name} in Qloo&apos;s brand insights{match.affinity !== null ? ` (raw ${match.affinity.toFixed(2)})` : ""}.</li>
              <li><b className="text-ink-soft">Demographics (25%)</b>: similarity of the two audiences&apos; age profiles{match.demographics?.demoKnown ? "" : " (no brand data, set to neutral)"}.</li>
              <li><b className="text-ink-soft">Taste overlap (20%)</b>: share of the brand&apos;s Qloo tags that match your audience&apos;s top tastes.</li>
              <li><b className="text-ink-soft">Novelty (10%)</b>: less popular brands score higher{match.popularity !== null ? ` (popularity ${Math.round(match.popularity * 100)}th percentile)` : ""}.</li>
            </ul>
          </section>

          <section className="surface p-6">
            <h2 className="font-semibold">The evidence</h2>
            <ul className="mt-4 space-y-3">
              {match.reasons.map((r) => (
                <li key={r} className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mint/15 text-mint">
                    <Check size={12} />
                  </span>
                  {r}
                </li>
              ))}
            </ul>
            {(shared.length > 0 || match.tags.length > 0) && (
              <div className="mt-5 border-t border-white/[0.07] pt-4">
                <p className="label mb-2.5">Brand tags in Qloo</p>
                <div className="flex flex-wrap gap-1.5">
                  {match.tags.map((t) => (
                    <Chip key={t} tone={shared.includes(t) ? "orchid" : "neutral"}>{t}</Chip>
                  ))}
                </div>
                {shared.length > 0 && <p className="mt-2 text-xs text-ink-muted">Highlighted tags also appear in your audience&apos;s top tastes.</p>}
              </div>
            )}
          </section>

          <section className="surface p-6">
            <h2 className="font-semibold">Audience match</h2>
            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="label mb-3">Your audience (age index)</p>
                <IndexBars rows={audienceAge} />
              </div>
              <div>
                <p className="label mb-3">{match.name} fans (age index)</p>
                <IndexBars rows={brandAge} empty="Qloo had no demographic data for this brand." />
              </div>
            </div>
          </section>

          <section className="surface p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold">Rate advisor</h2>
                <p className="mt-1 text-sm text-ink-muted">A starting range to anchor your ask, per {show.platform === "podcast" ? "episode" : "video"}.</p>
              </div>
              <Chip tone="signal">Estimate</Chip>
            </div>
            <p className="mt-5 font-display text-4xl font-semibold text-signal-400">
              ${rate.low.toLocaleString("en-US")} to ${rate.high.toLocaleString("en-US")}
            </p>
            <dl className="mt-5 grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl bg-white/[0.04] p-3">
                <dt className="text-xs text-ink-muted">Audience</dt>
                <dd className="mt-1 font-semibold tabular-nums">{compact(show.audience_size)}</dd>
              </div>
              <div className="rounded-xl bg-white/[0.04] p-3">
                <dt className="text-xs text-ink-muted">CPM range</dt>
                <dd className="mt-1 font-semibold tabular-nums">${CPM.low} to ${CPM.high}</dd>
              </div>
              <div className="rounded-xl bg-white/[0.04] p-3">
                <dt className="text-xs text-ink-muted">Fit multiplier</dt>
                <dd className="mt-1 font-semibold tabular-nums">{rate.multiplier.toFixed(2)}x</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs leading-relaxed text-ink-faint">
              Guidance, not a quote. The CPM range is a typical host-read range and should be checked against what similar shows charge.
            </p>
          </section>
        </div>

        <div className="min-w-0 xl:sticky xl:top-24 xl:self-start">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold">Media kit preview</h2>
            <span className="flex items-center gap-1.5 text-sm text-ink-muted">
              <Eye size={15} /> {kit ? `${kit.views} views` : "Not published yet"}
            </span>
          </div>
          <div className="relative max-h-[40rem] overflow-hidden rounded-2xl border border-white/15 shadow-lift">
            <KitDocument data={kitData} />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-eggplant-950 to-transparent" />
          </div>
          <div className="mt-4">
            <KitShare matchId={match.id} initialSlug={kit?.slug ?? null} />
          </div>
        </div>
      </div>
    </div>
  );
}
