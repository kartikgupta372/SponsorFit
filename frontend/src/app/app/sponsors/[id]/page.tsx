import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Eye, ExternalLink, Gem, Mail } from "lucide-react";
import { BrandMark } from "@/components/art/BrandMark";
import { FitRing } from "@/components/charts/FitRing";
import { PartsBars } from "@/components/charts/PartsBars";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { CopyLinkButton, ExportPdfButton } from "@/components/sponsors/CopyLinkButton";
import { KitDocument } from "@/components/kit/KitDocument";
import {
  AGE_BUCKETS,
  BRANDS,
  CPM_RANGE,
  DEFAULT_SHOW_ID,
  brandAgeMix,
  getShow,
  kitViews,
  rateRange,
} from "@/lib/mock-data";
import { fitLevel } from "@/lib/scoring";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = BRANDS.find((x) => x.id === id);
  return { title: `${b?.name ?? "Sponsor"} | SponsorFit` };
}

export default async function SponsorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const brand = BRANDS.find((b) => b.id === id);
  if (!brand) notFound();

  const show = getShow(DEFAULT_SHOW_ID);
  const rate = rateRange(show.audience, brand.fit);
  const mix = brandAgeMix(brand.parts.demographic);

  return (
    <div>
      <Link
        href={`/app/shows/${show.id}/sponsors`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
      >
        <ArrowLeft size={15} /> All sponsors
      </Link>

      {/* Header */}
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-5">
          <BrandMark name={brand.name} hue={brand.hue} size={72} />
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{brand.name}</h1>
            <p className="mt-1.5 max-w-xl text-ink-muted">{brand.blurb}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Chip>{brand.category}</Chip>
              <Chip tone="violet">{brand.scale}</Chip>
              <Chip tone="orchid">{fitLevel(brand.fit)} fit</Chip>
              {brand.hiddenGem && <Chip tone="signal" icon={<Gem size={11} />}>Hidden gem</Chip>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <FitRing score={brand.fit} size={110} stroke={10} />
          <Button href={`/app/pitches/${brand.id}`} size="lg">
            <Mail size={18} /> Draft pitch
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.05fr]">
        {/* Left: evidence */}
        <div className="space-y-6">
          <section className="surface p-6">
            <h2 className="font-semibold">Why this score</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Four parts, each from 0 to 100. The weights are fixed, so you can always check the maths.
            </p>
            <div className="mt-5">
              <PartsBars parts={brand.parts} />
            </div>
            <p className="mt-5 rounded-xl bg-white/[0.04] px-4 py-3 text-xs leading-relaxed text-ink-muted">
              Fit = 45% affinity + 25% demographics + 20% taste overlap + 10% novelty. Calculated with
              plain maths, not by an AI, so the same inputs always give the same score.
            </p>
          </section>

          <section className="surface p-6">
            <h2 className="font-semibold">The evidence</h2>
            <ul className="mt-4 space-y-3">
              {brand.reasons.map((r) => (
                <li key={r} className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mint/15 text-mint">
                    <Check size={12} />
                  </span>
                  {r}
                </li>
              ))}
            </ul>
          </section>

          <section className="surface p-6">
            <h2 className="font-semibold">Audience match</h2>
            <p className="mt-1 text-sm text-ink-muted">Age mix of your listeners next to {brand.name}&apos;s customers.</p>
            <ul className="mt-5 space-y-3.5">
              {AGE_BUCKETS.map((b, i) => (
                <li key={b.label} className="grid grid-cols-[3.5rem_1fr] items-center gap-3 text-sm">
                  <span className="text-ink-muted">{b.label}</span>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <div className="h-2.5 rounded-full bg-gradient-to-r from-violet-500 via-orchid-400 to-signal-500" style={{ width: `${b.show * 2}%` }} />
                      <span className="text-xs tabular-nums text-ink">{b.show}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-2.5 rounded-full bg-white/25" style={{ width: `${mix[i] * 2}%` }} />
                      <span className="text-xs tabular-nums text-ink-muted">{mix[i]}%</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex gap-5 text-xs text-ink-muted">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-5 rounded-full bg-gradient-to-r from-violet-500 to-orchid-400" /> Your audience</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-5 rounded-full bg-white/25" /> Their customers</span>
            </div>
          </section>

          <section className="surface p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold">Rate advisor</h2>
                <p className="mt-1 text-sm text-ink-muted">A starting range to anchor your ask, per episode.</p>
              </div>
              <Chip tone="signal">Estimate</Chip>
            </div>
            <p className="mt-5 font-display text-4xl font-semibold text-signal-400">
              ${rate.low.toLocaleString("en-US")} to ${rate.high.toLocaleString("en-US")}
            </p>
            <dl className="mt-5 grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl bg-white/[0.04] p-3">
                <dt className="text-xs text-ink-muted">Audience</dt>
                <dd className="mt-1 font-semibold tabular-nums">{show.audience.toLocaleString("en-US")}</dd>
              </div>
              <div className="rounded-xl bg-white/[0.04] p-3">
                <dt className="text-xs text-ink-muted">CPM range</dt>
                <dd className="mt-1 font-semibold tabular-nums">${CPM_RANGE.low} to ${CPM_RANGE.high}</dd>
              </div>
              <div className="rounded-xl bg-white/[0.04] p-3">
                <dt className="text-xs text-ink-muted">Fit multiplier</dt>
                <dd className="mt-1 font-semibold tabular-nums">{rate.multiplier.toFixed(2)}x</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs leading-relaxed text-ink-faint">
              Guidance, not a quote. The CPM range is an assumption and should be checked against
              what similar shows charge.
            </p>
          </section>
        </div>

        {/* Right: kit preview */}
        <div className="xl:sticky xl:top-24 xl:self-start">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold">Media kit preview</h2>
            <span className="flex items-center gap-1.5 text-sm text-ink-muted">
              <Eye size={15} /> {kitViews(brand.id)} views
            </span>
          </div>
          <div className="relative max-h-[40rem] overflow-hidden rounded-2xl border border-white/15 shadow-lift">
            <KitDocument brandId={brand.id} showId={show.id} />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-eggplant-950 to-transparent" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <ExportPdfButton slug={brand.id} />
            <CopyLinkButton slug={brand.id} />
            <Button href={`/kit/${brand.id}`} variant="ghost" target="_blank" rel="noopener">
              <ExternalLink size={16} /> Open public kit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
