"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { ArrowRight, Info, Mic, Play, Plus, Search, Sparkles, X } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { CoverArt } from "@/components/art/CoverArt";
import { SHOWS } from "@/lib/mock-data";
import type { Platform } from "@/lib/types";
import { cn } from "@/lib/cn";

interface Match {
  key: string;
  name: string;
  platform: Platform;
  meta: string;
  seed: number;
  showId: string;
}

function hash(text: string) {
  let h = 7;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return h;
}

function titleCase(text: string) {
  return text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

/** Stand-in for Qloo entity search: known sample shows first, then plausible matches. */
function searchShows(query: string, platform: Platform): Match[] {
  const q = query.trim();
  if (q.length < 2) return [];
  const known = SHOWS.filter(
    (s) => s.platform === platform && s.name.toLowerCase().includes(q.toLowerCase()),
  ).map((s) => ({
    key: s.id,
    name: s.name,
    platform: s.platform,
    meta: `${s.category} / ${s.host}`,
    seed: s.seed,
    showId: s.id,
  }));
  const name = titleCase(q);
  const generated: Match[] = [
    { key: `g1-${q}`, name, platform, meta: platform === "podcast" ? "Podcast" : "YouTube channel", seed: hash(name), showId: "the-deep-dive" },
    { key: `g2-${q}`, name: `The ${name} Show`, platform, meta: platform === "podcast" ? "Podcast" : "YouTube channel", seed: hash(name + "2"), showId: "the-deep-dive" },
  ];
  return [...known, ...generated].slice(0, 4);
}

export default function NewAnalysisPage() {
  const router = useRouter();
  const [platform, setPlatform] = useState<Platform>("podcast");
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"search" | "seeds">("search");
  const [seeds, setSeeds] = useState<string[]>([]);
  const [seedInput, setSeedInput] = useState("");

  const matches = useMemo(() => searchShows(query, platform), [query, platform]);

  function choose(m: Match) {
    const params = new URLSearchParams({ q: m.name, p: m.platform });
    router.push(`/app/runs/${m.showId}?${params.toString()}`);
  }

  function addSeed(e: FormEvent) {
    e.preventDefault();
    const value = seedInput.trim();
    if (!value || seeds.length >= 5 || seeds.some((s) => s.toLowerCase() === value.toLowerCase())) return;
    setSeeds((s) => [...s, value]);
    setSeedInput("");
  }

  function startWithSeeds() {
    const params = new URLSearchParams({
      q: query.trim() || "My show",
      p: platform,
      seeds: seeds.join(","),
    });
    router.push(`/app/runs/the-deep-dive?${params.toString()}`);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="New analysis"
        title="Which show should we analyze?"
        subtitle="Search for your podcast or channel. We read its audience through Qloo's taste graph."
      />

      <div className="surface-raised space-y-6 p-5 sm:p-7">
        {/* Step 1 */}
        <div>
          <p className="label mb-3">1. Find your show</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div role="radiogroup" aria-label="Platform" className="flex rounded-xl bg-eggplant-950/60 p-1">
              {(
                [
                  ["podcast", "Podcast", Mic],
                  ["youtube", "YouTube", Play],
                ] as const
              ).map(([value, label, Icon]) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={platform === value}
                  onClick={() => setPlatform(value)}
                  className={cn(
                    "flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-medium transition-colors",
                    platform === value ? "bg-violet-600 text-white" : "text-ink-muted hover:text-ink",
                  )}
                >
                  <Icon size={15} /> {label}
                </button>
              ))}
            </div>
            <label className="relative flex-1">
              <span className="sr-only">Show or channel name</span>
              <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setMode("search");
                }}
                placeholder={platform === "podcast" ? "Search your podcast" : "Search your channel"}
                className="h-12 w-full rounded-xl border border-white/10 bg-eggplant-900/70 pl-11 pr-4 text-[15px] placeholder:text-ink-faint focus:border-orchid-400/70 focus:outline-none focus:ring-2 focus:ring-orchid-400/20"
              />
            </label>
          </div>
        </div>

        {/* Step 2: results */}
        {mode === "search" && (
          <div>
            <p className="label mb-3">2. Confirm it is yours</p>
            {matches.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 px-5 py-10 text-center">
                <Search className="mx-auto text-ink-faint" size={26} />
                <p className="mt-3 text-sm text-ink-muted">
                  Start typing to see matches. Try &ldquo;The Deep Dive&rdquo;.
                </p>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {matches.map((m) => (
                  <li
                    key={m.key}
                    className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-eggplant-900/50 p-3"
                  >
                    <span className="h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                      <CoverArt seed={m.seed} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{m.name}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-muted">
                        {m.platform === "podcast" ? <Mic size={12} /> : <Play size={12} />}
                        {m.meta}
                      </p>
                    </div>
                    <Button size="sm" onClick={() => choose(m)}>
                      This is mine
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              onClick={() => setMode("seeds")}
              className="mt-4 flex items-center gap-1.5 text-sm font-medium text-violet-300 hover:text-orchid-300"
            >
              Cannot find it? Use shows like mine <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Fallback: seeds */}
        {mode === "seeds" && (
          <div className="rounded-2xl border border-orchid-400/25 bg-orchid-400/[0.06] p-5">
            <div className="flex items-start gap-3">
              <Info size={18} className="mt-0.5 shrink-0 text-orchid-300" />
              <div>
                <p className="font-semibold">Shows like mine</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  Smaller shows are often missing from the taste graph. Add 3 to 5 shows with a
                  similar audience, and we will use them to stand in for yours.
                </p>
              </div>
            </div>

            <form onSubmit={addSeed} className="mt-5 flex gap-2">
              <label className="flex-1">
                <span className="sr-only">A show similar to yours</span>
                <input
                  value={seedInput}
                  onChange={(e) => setSeedInput(e.target.value)}
                  placeholder="Add a similar show"
                  disabled={seeds.length >= 5}
                  className="h-11 w-full rounded-xl border border-white/10 bg-eggplant-900/70 px-4 text-sm placeholder:text-ink-faint focus:border-orchid-400/70 focus:outline-none focus:ring-2 focus:ring-orchid-400/20 disabled:opacity-50"
                />
              </label>
              <Button type="submit" variant="secondary" disabled={!seedInput.trim() || seeds.length >= 5}>
                <Plus size={16} /> Add
              </Button>
            </form>

            <ul className="mt-4 flex min-h-9 flex-wrap gap-2">
              {seeds.map((s) => (
                <li key={s}>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-500/15 py-1.5 pl-3.5 pr-1.5 text-sm text-violet-200">
                    {s}
                    <button
                      type="button"
                      aria-label={`Remove ${s}`}
                      onClick={() => setSeeds((all) => all.filter((x) => x !== s))}
                      className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-white/15"
                    >
                      <X size={13} />
                    </button>
                  </span>
                </li>
              ))}
              {seeds.length === 0 && <li className="text-sm text-ink-faint">No shows added yet.</li>}
            </ul>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setMode("search")}
                className="text-sm text-ink-muted hover:text-ink"
              >
                Back to search
              </button>
              <Button onClick={startWithSeeds} disabled={seeds.length < 3}>
                <Sparkles size={16} />
                {seeds.length < 3 ? `Add ${3 - seeds.length} more` : "Start analysis"}
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 border-t border-white/[0.06] pt-5 text-xs text-ink-muted">
          <Chip tone="violet">Safety cap</Chip>
          Each run uses at most 40 data calls, so one analysis never drains your quota.
        </div>
      </div>
    </div>
  );
}
