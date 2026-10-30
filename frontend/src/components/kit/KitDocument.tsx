import { Check, Mic, Play } from "lucide-react";
import { CoverArt } from "@/components/art/CoverArt";
import { BrandMark } from "@/components/art/BrandMark";
import { LogoMark } from "@/components/layout/Logo";
import { FitRing } from "@/components/charts/FitRing";
import { compact, hashSeed, hueOf, type IndexBar, type KitData } from "@/lib/model";

function AgeCompare({ show, brand, showName, brandName }: { show: IndexBar[]; brand: IndexBar[]; showName: string; brandName: string }) {
  const labels = show.map((r) => r.label);
  if (!labels.length) return <p className="mt-4 text-sm text-eggplant-700">Qloo returned no age data for this audience.</p>;
  const max = Math.max(...[...show, ...brand].map((r) => Math.abs(r.index)), 1);
  const bar = (v: number) => `${(Math.abs(v) / max) * 50}%`;
  return (
    <>
      <ul className="mt-5 space-y-3.5">
        {labels.map((label) => {
          const s = show.find((r) => r.label === label)?.index ?? 0;
          const b = brand.find((r) => r.label === label)?.index;
          return (
            <li key={label} className="grid grid-cols-[4.5rem_1fr_2.5rem] items-center gap-3 text-sm">
              <span className="text-eggplant-700">{label}</span>
              <div className="space-y-1.5">
                {[{ v: s, cls: "bg-gradient-to-r from-violet-600 to-orchid-400" }, ...(b === undefined ? [] : [{ v: b, cls: "bg-eggplant-900/30" }])].map((x, i) => (
                  <div key={i} className="relative h-2.5 rounded-full bg-eggplant-900/[0.06]">
                    <span className="absolute inset-y-[-2px] left-1/2 w-px bg-eggplant-900/25" />
                    <span className={`absolute inset-y-0 rounded-full ${x.cls}`} style={x.v >= 0 ? { left: "50%", width: bar(x.v) } : { right: "50%", width: bar(x.v) }} />
                  </div>
                ))}
              </div>
              <span className="text-right tabular-nums text-eggplant-900">{s > 0 ? "+" : ""}{s}</span>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex flex-wrap gap-5 text-xs text-eggplant-700">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-5 rounded-full bg-gradient-to-r from-violet-600 to-orchid-400" /> {showName} audience</span>
        {brand.length > 0 && <span className="flex items-center gap-1.5"><span className="h-2.5 w-5 rounded-full bg-eggplant-900/30" /> {brandName} fans</span>}
        <span>Index vs. average consumer (Qloo)</span>
      </div>
    </>
  );
}

/**
 * The media kit a brand sees. Light and paper-like: it is read by a media
 * buyer, not by the creator. Renders a frozen snapshot (KitData).
 */
export function KitDocument({ data }: { data: KitData }) {
  const { show, brand, audience, rate } = data;
  const pct = (n: number) => Math.round(n * 100);
  return (
    <article className="bg-[#fcf8ff] text-eggplant-900">
      <header className="relative overflow-hidden bg-eggplant-900 px-6 py-8 text-ink sm:px-10 sm:py-10">
        <div className="absolute inset-0 opacity-60">
          <CoverArt seed={hashSeed(show.name)} rounded={false} />
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
              {show.platform === "podcast" ? "Podcast" : "YouTube channel"} · {compact(show.audience)} {show.platform === "podcast" ? "listeners per episode" : "views per video"}
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.06] p-3 pr-5">
            <BrandMark name={brand.name} hue={hueOf(brand.name)} size={44} />
            <div>
              <p className="text-[11px] uppercase tracking-widest text-ink-muted">Prepared for</p>
              <p className="font-semibold">{brand.name}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-10 px-6 py-8 sm:px-10 sm:py-10">
        <section className="grid items-center gap-6 sm:grid-cols-[auto_1fr]">
          <FitRing score={brand.fit} size={116} stroke={11} tone="light" />
          <div>
            <h2 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">
              {show.name}&apos;s audience already loves what {brand.name} stands for.
            </h2>
            <p className="mt-3 max-w-xl leading-relaxed text-eggplant-700">
              Measured with Qloo&apos;s taste graph, this audience scores {brand.fit} out of 100 for fit with {brand.name}.
            </p>
          </div>
        </section>

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-eggplant-600">How the score breaks down</h3>
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Taste affinity", pct(brand.parts.affinity), "45%"],
              ["Demographics", pct(brand.parts.demographic), "25%"],
              ["Shared tastes", pct(brand.parts.taste), "20%"],
              ["Novelty", pct(brand.parts.novelty), "10%"],
            ].map(([k, v, w]) => (
              <div key={k as string} className="rounded-xl bg-eggplant-900/[0.05] p-3.5">
                <dt className="text-xs text-eggplant-600">{k} <span className="text-eggplant-600/70">· weight {w}</span></dt>
                <dd className="mt-1 font-display text-2xl font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-eggplant-600">Who is listening</h3>
          <AgeCompare show={audience.age} brand={audience.brandAge} showName={show.name} brandName={brand.name} />
        </section>

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
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-eggplant-600">What this audience loves</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {audience.themes.map((t) => (
                <span key={t} className="rounded-full bg-violet-600/10 px-3.5 py-1.5 text-sm font-medium text-violet-700">{t}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-eggplant-900 p-6 text-ink sm:p-7">
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-orchid-300">Suggested partnership</h3>
          <div className="mt-4 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
            <ul className="space-y-2.5 text-sm">
              <li className="flex gap-2.5"><Check size={16} className="mt-0.5 shrink-0 text-orchid-300" /> Host-read mid-roll in 3 {show.platform === "podcast" ? "episodes" : "videos"}</li>
              <li className="flex gap-2.5"><Check size={16} className="mt-0.5 shrink-0 text-orchid-300" /> A dedicated segment trying {brand.name}</li>
              <li className="flex gap-2.5"><Check size={16} className="mt-0.5 shrink-0 text-orchid-300" /> An audience discount code to measure results</li>
            </ul>
            <div className="sm:text-right">
              <p className="text-[11px] uppercase tracking-widest text-ink-muted">Per {show.platform === "podcast" ? "episode" : "video"}, estimated</p>
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
          {data.source === "sample" && <span>Sample data (no Qloo key at run time).</span>}
        </footer>
      </div>
    </article>
  );
}
