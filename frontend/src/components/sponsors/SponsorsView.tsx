"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ChevronDown, Filter, Gem, Mail, ShieldCheck, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Switch } from "@/components/ui/Switch";
import { BrandMark } from "@/components/art/BrandMark";
import { FitRing } from "@/components/charts/FitRing";
import { PartsBars } from "@/components/charts/PartsBars";
import { BRANDS, getShow } from "@/lib/mock-data";
import { useSettings } from "@/lib/settings";
import type { BrandScale } from "@/lib/types";
import { cn } from "@/lib/cn";

type Sort = "fit" | "gems" | "budget";
const SCALES: ("All" | BrandScale)[] = ["All", "Local", "Regional", "National"];
const GENERIC = ["A famous VPN service", "A giant meal-kit company", "An online mattress brand"];

export function SponsorsView() {
  const { id } = useParams<{ id: string }>();
  const show = getShow(id);
  const { settings } = useSettings();

  const [category, setCategory] = useState("All");
  const [scale, setScale] = useState<"All" | BrandScale>("All");
  const [gemsOnly, setGemsOnly] = useState(false);
  const [guard, setGuard] = useState(true);
  const [sort, setSort] = useState<Sort>("fit");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(true);

  const categories = useMemo(() => ["All", ...Array.from(new Set(BRANDS.map((b) => b.category)))], []);

  // Competitor guard: hide categories the creator already has a sponsor in.
  const blockedCategories = useMemo(
    () =>
      BRANDS.filter((b) => settings.existingSponsors.includes(b.name)).map((b) => b.category),
    [settings.existingSponsors],
  );

  const { visible, hiddenBySafety, hiddenByGuard } = useMemo(() => {
    let hiddenBySafety = 0;
    let hiddenByGuard = 0;
    let list = BRANDS.filter((b) => {
      if (b.safety && settings.safety[b.safety]) {
        hiddenBySafety++;
        return false;
      }
      if (guard && blockedCategories.includes(b.category) && !settings.existingSponsors.includes(b.name)) {
        hiddenByGuard++;
        return false;
      }
      return true;
    });
    list = list.filter(
      (b) =>
        (category === "All" || b.category === category) &&
        (scale === "All" || b.scale === scale) &&
        (!gemsOnly || b.hiddenGem),
    );
    const rank = { $: 1, $$: 2, $$$: 3 } as const;
    list = [...list].sort((a, b) =>
      sort === "fit"
        ? b.fit - a.fit
        : sort === "gems"
          ? Number(b.hiddenGem) - Number(a.hiddenGem) || b.fit - a.fit
          : rank[a.budget] - rank[b.budget] || b.fit - a.fit,
    );
    return { visible: list, hiddenBySafety, hiddenByGuard };
  }, [category, scale, gemsOnly, guard, sort, settings, blockedCategories]);

  const filters = (
    <div className="space-y-6">
      <div>
        <label htmlFor="cat" className="label mb-2 block">Category</label>
        <div className="relative">
          <select
            id="cat"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-11 w-full appearance-none rounded-xl border border-white/10 bg-eggplant-900/70 pl-4 pr-10 text-sm focus:border-orchid-400/70 focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
        </div>
      </div>

      <div>
        <p className="label mb-2">Brand size</p>
        <div role="radiogroup" aria-label="Brand size" className="grid grid-cols-2 gap-1.5">
          {SCALES.map((s) => (
            <button
              key={s}
              role="radio"
              aria-checked={scale === s}
              onClick={() => setScale(s)}
              className={cn(
                "h-10 rounded-lg border text-sm font-medium transition-colors",
                scale === s
                  ? "border-orchid-400/60 bg-orchid-400/15 text-orchid-200"
                  : "border-white/10 text-ink-muted hover:text-ink",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <Switch checked={gemsOnly} onChange={setGemsOnly} label="Hidden gems only" hint="High fit, little competition" />
      <Switch checked={guard} onChange={setGuard} label="Competitor guard" hint={`Hides categories you already sponsor${hiddenByGuard ? ` (${hiddenByGuard} hidden)` : ""}`} />

      <div className="rounded-xl border border-white/[0.08] bg-eggplant-900/50 p-3.5">
        <p className="flex items-center gap-2 text-sm font-medium">
          <ShieldCheck size={16} className="text-mint" /> Brand safety on
        </p>
        <p className="mt-1 text-xs leading-relaxed text-ink-muted">
          {hiddenBySafety > 0
            ? `${hiddenBySafety} brand hidden by your safety settings.`
            : "No brands hidden by your safety settings."}{" "}
          <Link href="/app/settings" className="text-violet-300 hover:text-orchid-300">Change</Link>
        </p>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="label mb-2">Sponsors for {show.name}</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Your best-fit sponsors</h1>
          <p className="mt-2 text-ink-muted">Ranked by Fit Score. Tap a brand to see the evidence behind its number.</p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="sr-only">Sort by</label>
          <div className="relative">
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="h-11 appearance-none rounded-xl border border-white/10 bg-eggplant-900/70 pl-4 pr-10 text-sm focus:border-orchid-400/70 focus:outline-none"
            >
              <option value="fit">Sort: Fit Score</option>
              <option value="gems">Sort: Hidden gems</option>
              <option value="budget">Sort: Budget (low first)</option>
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
          </div>
          <Button variant="outline" className="lg:hidden" onClick={() => setFiltersOpen(true)}>
            <SlidersHorizontal size={16} /> Filters
          </Button>
        </div>
      </div>

      {/* Without vs With Qloo */}
      <section className="surface mb-8 overflow-hidden" aria-label="Comparison with an AI-only list">
        <button
          type="button"
          onClick={() => setCompareOpen((o) => !o)}
          aria-expanded={compareOpen}
          className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left sm:px-6"
        >
          <span className="flex items-center gap-2.5 font-semibold">
            <Filter size={17} className="text-orchid-300" />
            Why this list is different from asking an AI
          </span>
          <ChevronDown size={18} className={cn("text-ink-muted transition-transform", compareOpen && "rotate-180")} />
        </button>
        {compareOpen && (
          <div className="grid gap-4 border-t border-white/[0.07] p-5 sm:grid-cols-2 sm:p-6">
            <div>
              <p className="label mb-3">AI guess alone</p>
              <ul className="space-y-2">
                {GENERIC.map((g) => (
                  <li key={g} className="rounded-lg border border-white/[0.06] px-3.5 py-2.5 text-sm text-ink-muted">{g}</li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-ink-faint">Famous names, no proof of fit.</p>
            </div>
            <div>
              <p className="label mb-3 text-orchid-300">With Qloo taste data</p>
              <ul className="space-y-2">
                {BRANDS.filter((b) => !b.safety).slice(0, 3).map((b) => (
                  <li key={b.id} className="flex items-center justify-between rounded-lg border border-orchid-400/25 bg-orchid-400/[0.06] px-3.5 py-2.5 text-sm">
                    <span>{b.name}</span>
                    <span className="font-semibold tabular-nums text-orchid-300">{b.fit}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-ink-faint">Specific brands with the evidence attached.</p>
            </div>
          </div>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
        <aside className="surface hidden self-start p-5 lg:sticky lg:top-24 lg:block" aria-label="Filters">
          <h2 className="mb-5 font-semibold">Filters</h2>
          {filters}
        </aside>

        <div>
          <p className="mb-4 text-sm text-ink-muted" aria-live="polite">
            Showing <span className="font-semibold text-ink">{visible.length}</span> of {BRANDS.length} brands
          </p>

          {visible.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 px-6 py-16 text-center">
              <Filter className="mx-auto text-ink-faint" size={28} />
              <h2 className="mt-4 font-display text-2xl font-semibold">No brands match these filters</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">
                Try a wider brand size or turn off hidden gems to see more of your list.
              </p>
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => {
                  setCategory("All");
                  setScale("All");
                  setGemsOnly(false);
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {visible.map((b, i) => (
                <li
                  key={b.id}
                  className="surface animate-fade-up p-5 transition-colors hover:border-orchid-400/35 sm:p-6"
                  style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-center">
                    <div className="flex items-center gap-4 md:w-[19rem] md:shrink-0">
                      <FitRing score={b.fit} size={84} stroke={8} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2.5">
                          <BrandMark name={b.name} hue={b.hue} size={34} />
                          <h2 className="text-lg font-semibold leading-snug">{b.name}</h2>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <Chip>{b.category}</Chip>
                          <Chip tone="violet">{b.scale}</Chip>
                          {b.hiddenGem && <Chip tone="signal" icon={<Gem size={11} />}>Hidden gem</Chip>}
                        </div>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 md:px-2">
                      <PartsBars parts={b.parts} compact />
                    </div>

                    <div className="md:w-60 md:shrink-0">
                      <ul className="space-y-1.5">
                        {b.reasons.slice(0, 2).map((r) => (
                          <li key={r} className="rounded-lg bg-white/[0.04] px-3 py-1.5 text-xs leading-snug text-ink-soft">{r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-4">
                    <span className="text-sm text-ink-muted">
                      Budget tier <span className="ml-1 font-semibold tracking-wider text-signal-400">{b.budget}</span>
                    </span>
                    <div className="flex gap-2">
                      <Button href={`/app/sponsors/${b.id}`} variant="outline" size="sm">View kit</Button>
                      <Button href={`/app/pitches/${b.id}`} size="sm"><Mail size={15} /> Draft pitch</Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <button className="absolute inset-0 bg-black/60" aria-label="Close filters" onClick={() => setFiltersOpen(false)} />
          <div className="surface-raised absolute inset-x-0 bottom-0 max-h-[85dvh] animate-fade-up overflow-y-auto rounded-b-none p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-semibold">Filters</h2>
              <button onClick={() => setFiltersOpen(false)} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/10">
                <X size={18} />
              </button>
            </div>
            {filters}
            <Button className="mt-6 w-full" onClick={() => setFiltersOpen(false)}>
              Show {visible.length} brands
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
