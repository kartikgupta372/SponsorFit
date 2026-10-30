import { Check, Mic, Play } from "lucide-react";
import { CoverArt } from "@/components/art/CoverArt";
import { BrandMark } from "@/components/art/BrandMark";
import { LogoMark } from "@/components/layout/Logo";
import { FitRing } from "@/components/charts/FitRing";
import { AGE_BUCKETS, THEMES, brandAgeMix, getBrand, getShow, rateRange } from "@/lib/mock-data";

/**
 * The media kit a brand sees. Deliberately light and paper-like:
 * it is read by a media buyer, not by the creator.
 */
export function KitDocument({ brandId, showId }: { brandId: string; showId: string }) {
  const brand = getBrand(brandId);
  const show = getShow(showId);
  const rate = rateRange(show.audience, brand.fit);
  const brandMix = brandAgeMix(brand.parts.demographic);
  const start = brand.fit % (THEMES.length - 4);
  const shared = THEMES.slice(start, start + 4);

  return (
    <article className="bg-[#fcf8ff] text-eggplant-900">
      {/* Masthead */}
      <header className="relative overflow-hidden bg-eggplant-900 px-6 py-8 text-ink sm:px-10 sm:py-10">
        <div className="absolute inset-0 opacity-60">
          <CoverArt seed={show.seed} rounded={false} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-eggplant-950 via-eggplant-950/85 to-eggplant-950/30" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-orchid-300">
              {show.platform === "podcast" ? <Mic size={13} /> : <Play size={13} />}
              Media kit
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl">{show.name}</h1>
            <p className="mt-2 text-ink-soft">
              Hosted by {show.host} · {show.reach}
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.06] p-3 pr-5">
            <BrandMark name={brand.name} hue={brand.hue} size={44} />
            <div>
              <p className="text-[11px] uppercase tracking-widest text-ink-muted">Prepared for</p>
              <p className="font-semibold">{brand.name}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-10 px-6 py-8 sm:px-10 sm:py-10">
        {/* Headline claim */}
        <section className="grid items-center gap-6 sm:grid-cols-[auto_1fr]">
          <FitRing score={brand.fit} size={116} stroke={11} tone="light" />
          <div>
            <h2 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">
              {show.name} listeners already shop like {brand.name}&apos;s customers.
            </h2>
            <p className="mt-3 max-w-xl leading-relaxed text-eggplant-700">
              Based on Qloo&apos;s taste data, this audience scores {brand.fit} out of 100 for fit with{" "}
              {brand.name}: {brand.reasons[0].toLowerCase()}.
            </p>
          </div>
        </section>

        {/* Audience comparison */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-eggplant-600">Who is listening</h3>
          <p className="mt-1 text-sm text-eggplant-700">
            Age mix of this audience compared with {brand.name}&apos;s customers.
          </p>
          <ul className="mt-5 space-y-3.5">
            {AGE_BUCKETS.map((b, i) => (
              <li key={b.label} className="grid grid-cols-[3.5rem_1fr] items-center gap-4 text-sm">
                <span className="text-eggplant-700">{b.label}</span>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 rounded-full bg-gradient-to-r from-violet-600 to-orchid-400" style={{ width: `${b.show * 2}%` }} />
                    <span className="tabular-nums text-eggplant-900">{b.show}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 rounded-full bg-eggplant-900/25" style={{ width: `${brandMix[i] * 2}%` }} />
                    <span className="tabular-nums text-eggplant-600">{brandMix[i]}%</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-5 text-xs text-eggplant-700">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-5 rounded-full bg-gradient-to-r from-violet-600 to-orchid-400" /> {show.name} audience
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-5 rounded-full bg-eggplant-900/25" /> {brand.name} customers
            </span>
          </div>
        </section>

        {/* Why it fits */}
        <section className="grid gap-8 sm:grid-cols-2">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-eggplant-600">Why it fits</h3>
            <ul className="mt-4 space-y-3">
              {brand.reasons.map((r) => (
                <li key={r} className="flex gap-2.5 text-sm leading-relaxed">
                  <Check size={17} className="mt-0.5 shrink-0 text-violet-600" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-eggplant-600">Shared interests</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {shared.map((t) => (
                <span key={t} className="rounded-full bg-violet-600/10 px-3.5 py-1.5 text-sm font-medium text-violet-700">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Formats and rate */}
        <section className="rounded-2xl bg-eggplant-900 p-6 text-ink sm:p-7">
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-orchid-300">Suggested partnership</h3>
          <div className="mt-4 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
            <ul className="space-y-2.5 text-sm">
              <li className="flex gap-2.5"><Check size={16} className="mt-0.5 shrink-0 text-orchid-300" /> Host-read mid-roll in 3 episodes</li>
              <li className="flex gap-2.5"><Check size={16} className="mt-0.5 shrink-0 text-orchid-300" /> A dedicated segment trying {brand.name} on air</li>
              <li className="flex gap-2.5"><Check size={16} className="mt-0.5 shrink-0 text-orchid-300" /> A listener discount code to measure results</li>
            </ul>
            <div className="sm:text-right">
              <p className="text-[11px] uppercase tracking-widest text-ink-muted">Per episode, estimated</p>
              <p className="font-display text-3xl font-semibold text-signal-400">
                ${rate.low.toLocaleString("en-US")} to ${rate.high.toLocaleString("en-US")}
              </p>
            </div>
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-eggplant-900/10 pt-6 text-xs text-eggplant-600">
          <span className="flex items-center gap-2">
            <LogoMark size={20} /> Audience data from Qloo&apos;s taste graph. Made with SponsorFit.
          </span>
          <span>Sample data, fictional brand.</span>
        </footer>
      </div>
    </article>
  );
}
