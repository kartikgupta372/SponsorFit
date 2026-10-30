import { Mail, Sparkles } from "lucide-react";
import { CoverArt } from "@/components/art/CoverArt";
import { BrandMark } from "@/components/art/BrandMark";
import { FitRing } from "@/components/charts/FitRing";
import { UsHeatmap } from "@/components/charts/UsHeatmap";
import { Chip } from "@/components/ui/Chip";
import { BRANDS, CITIES } from "@/lib/mock-data";

/** A composed product preview: shortlist, audience heatmap, pitch and cover art. */
export function HeroVisual() {
  const rows = BRANDS.slice(0, 3);
  return (
    <div className="relative mx-auto h-[34rem] w-full max-w-[34rem]">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/40 blur-[90px]"
      />

      {/* Cover art tile */}
      <div className="absolute right-2 top-0 h-32 w-32 rotate-6 animate-float-slow overflow-hidden rounded-2xl border border-white/15 shadow-lift">
        <CoverArt seed={7} />
      </div>

      {/* Main shortlist card */}
      <div className="surface-raised absolute left-0 top-10 w-[88%] p-5 sm:w-[24rem]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="label">Top sponsors</p>
            <p className="font-display text-lg font-semibold">The Deep Dive</p>
          </div>
          <Chip tone="mint">Analysis complete</Chip>
        </div>
        <ul className="space-y-3">
          {rows.map((b) => (
            <li
              key={b.id}
              className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-eggplant-900/60 p-3"
            >
              <BrandMark name={b.name} hue={b.hue} size={40} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{b.name}</p>
                <p className="truncate text-xs text-ink-muted">{b.reasons[0]}</p>
              </div>
              <FitRing score={b.fit} size={46} stroke={5} label={false} />
            </li>
          ))}
        </ul>
      </div>

      {/* Heatmap card */}
      <div className="surface-raised absolute bottom-6 left-4 w-60 animate-float p-3 sm:left-10">
        <p className="label mb-2">Where they listen</p>
        <UsHeatmap cities={CITIES} />
      </div>

      {/* Pitch card */}
      <div className="surface-raised absolute bottom-0 right-0 w-56 animate-float-slow p-4 [animation-delay:1.5s]">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-signal-500/15 text-signal-400">
            <Mail size={15} />
          </span>
          Pitch drafted
        </div>
        <p className="text-xs leading-relaxed text-ink-muted">
          &ldquo;My listeners over-index on hiking and trail running, a{" "}
          <span className="text-ink">92%</span> affinity match with your customers&hellip;&rdquo;
        </p>
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-orchid-300">
          <Sparkles size={12} /> Evidence attached
        </div>
      </div>
    </div>
  );
}
