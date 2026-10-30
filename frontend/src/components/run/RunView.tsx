"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Check, FastForward, Gem, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { CoverArt } from "@/components/art/CoverArt";
import { BrandMark } from "@/components/art/BrandMark";
import { FitRing } from "@/components/charts/FitRing";
import { AGENT_STEPS, AGE_BUCKETS, BRANDS, CITIES, THEMES, getShow } from "@/lib/mock-data";
import { cn } from "@/lib/cn";

/**
 * Each call is one "event". The trace advances one event per tick.
 * This is a SIMULATION on sample data. With the live backend, these events
 * will arrive over Server-Sent Events as the agent really makes each Qloo call.
 */
const EVENTS = AGENT_STEPS.flatMap((s, si) => s.calls.map((label, ci) => ({ si, ci, label })));
const TOTAL = EVENTS.length;
const TICK_MS = 520;
const CALL_CAP = 40;
const FINAL_CALLS = 31;

function stepRange(si: number) {
  const first = EVENTS.findIndex((e) => e.si === si);
  return { first, last: first + AGENT_STEPS[si].calls.length - 1 };
}

export function RunView() {
  const { id } = useParams<{ id: string }>();
  const search = useSearchParams();
  const show = getShow(id);
  const title = search.get("q") || show.name;
  const platform = search.get("p") === "youtube" ? "YouTube channel" : "Podcast";
  const seeds = (search.get("seeds") ?? "").split(",").filter(Boolean);

  const [done, setDone] = useState(0);

  useEffect(() => {
    if (done >= TOTAL) return;
    const t = setTimeout(() => setDone((d) => d + 1), TICK_MS);
    return () => clearTimeout(t);
  }, [done]);

  const stepDone = (si: number) => done > stepRange(si).last;
  const finished = done >= TOTAL;
  const callsUsed = Math.min(CALL_CAP, Math.round((done * FINAL_CALLS) / TOTAL));
  const progress = Math.round((done / TOTAL) * 100);

  const profileDone = stepDone(1);
  const scoreDone = stepDone(4);
  const criticDone = stepDone(5);
  const results = useMemo(() => BRANDS.filter((b) => !b.safety).slice(0, 5), []);
  const topCity = CITIES[0];
  const topAge = [...AGE_BUCKETS].sort((a, b) => b.show / b.baseline - a.show / a.baseline)[0];

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <span className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
            <CoverArt seed={show.seed} />
          </span>
          <div>
            <p className="label mb-1">{finished ? "Analysis complete" : "Analysis running"}</p>
            <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-ink-muted">
              {platform}
              {seeds.length > 0 && ` · standing in: ${seeds.join(", ")}`}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!finished && (
            <Button variant="outline" onClick={() => setDone(TOTAL)}>
              <FastForward size={16} /> Skip to results
            </Button>
          )}
          {finished && (
            <>
              <Button variant="outline" onClick={() => setDone(0)}>
                <RotateCcw size={16} /> Replay
              </Button>
              <Button href={`/app/shows/${show.id}/sponsors`}>See all sponsors</Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[24rem_1fr]">
        {/* ---------- Left: trace ---------- */}
        <section className="surface self-start p-5 lg:sticky lg:top-24" aria-label="Agent trace">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Agent trace</h2>
            <Chip tone="violet">Simulated</Chip>
          </div>

          <div className="mb-5">
            <div className="mb-1.5 flex justify-between text-xs text-ink-muted">
              <span>Data calls used</span>
              <span className="tabular-nums text-ink">
                {callsUsed} of {CALL_CAP}
              </span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-white/[0.08]"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Analysis progress"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 via-orchid-400 to-signal-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <ol className="space-y-1">
            {AGENT_STEPS.map((step, si) => {
              const { first, last } = stepRange(si);
              const state = done > last ? "done" : done >= first ? "running" : "waiting";
              return (
                <li key={step.key} className="flex gap-3.5">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                        state === "done" && "bg-mint/15 text-mint",
                        state === "running" && "bg-orchid-400/20 text-orchid-300",
                        state === "waiting" && "border border-white/15 text-ink-faint",
                      )}
                    >
                      {state === "done" ? (
                        <Check size={14} />
                      ) : state === "running" ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        si + 1
                      )}
                    </span>
                    {si < AGENT_STEPS.length - 1 && (
                      <span className={cn("my-1 w-px flex-1", state === "done" ? "bg-mint/30" : "bg-white/10")} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 pb-3">
                    <p className={cn("text-sm font-semibold", state === "waiting" && "text-ink-faint")}>
                      {step.title}
                    </p>
                    <p className="text-xs text-ink-muted">{step.detail}</p>
                    {state !== "waiting" && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {step.calls.map((label, ci) => {
                          const idx = first + ci;
                          if (idx > done) return null;
                          const complete = idx < done;
                          return (
                            <Chip
                              key={label}
                              tone={complete ? "violet" : "orchid"}
                              icon={
                                complete ? (
                                  <Check size={10} />
                                ) : (
                                  <Loader2 size={10} className="animate-spin" />
                                )
                              }
                            >
                              {label}
                            </Chip>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {/* ---------- Right: results streaming in ---------- */}
        <div className="space-y-6">
          {/* Audience summary */}
          <section className="surface p-6" aria-label="Audience summary">
            <h2 className="mb-4 font-semibold">Audience DNA</h2>
            {!profileDone ? (
              <div className="grid gap-3 sm:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="skeleton h-24" />
                ))}
              </div>
            ) : (
              <div className="grid animate-fade-up gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-white/[0.08] bg-eggplant-900/60 p-4">
                  <p className="label">Strongest age band</p>
                  <p className="mt-2 font-display text-3xl font-semibold">{topAge.label}</p>
                  <p className="mt-1 text-xs text-signal-400">
                    {(topAge.show / topAge.baseline).toFixed(1)}x the general population
                  </p>
                </div>
                <div className="rounded-xl border border-white/[0.08] bg-eggplant-900/60 p-4">
                  <p className="label">Top city</p>
                  <p className="mt-2 font-display text-3xl font-semibold">{topCity.city}</p>
                  <p className="mt-1 text-xs text-ink-muted">Heat score {topCity.intensity} / 100</p>
                </div>
                <div className="rounded-xl border border-white/[0.08] bg-eggplant-900/60 p-4">
                  <p className="label">Top themes</p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {THEMES.slice(0, 3).map((t) => (
                      <Chip key={t} tone="orchid">{t}</Chip>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Sponsor cards */}
          <section aria-label="Sponsor matches">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Best-fit sponsors</h2>
              {criticDone && <Chip tone="mint">Checked for brand safety</Chip>}
            </div>

            {!scoreDone ? (
              <div className="space-y-3">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-24 rounded-2xl" />
                ))}
              </div>
            ) : (
              <ul className="space-y-3">
                {results.map((b, i) => (
                  <li
                    key={b.id}
                    className="surface flex animate-fade-up items-center gap-4 p-4"
                    style={{ animationDelay: `${i * 90}ms` }}
                  >
                    <span className="hidden w-6 text-center font-display text-xl text-ink-faint sm:block">
                      {i + 1}
                    </span>
                    <BrandMark name={b.name} hue={b.hue} size={50} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{b.name}</p>
                        {b.hiddenGem && (
                          <Chip tone="signal" icon={<Gem size={11} />}>Hidden gem</Chip>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-ink-muted">{b.category}</p>
                      {criticDone ? (
                        <p className="mt-1.5 text-sm text-ink-soft">{b.reasons[0]}</p>
                      ) : (
                        <div className="skeleton mt-2 h-4 w-3/4" />
                      )}
                    </div>
                    <FitRing score={b.fit} size={60} stroke={6} label={false} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Completion */}
          {finished && (
            <section className="relative animate-fade-up overflow-hidden rounded-2xl border border-orchid-400/30 bg-gradient-to-br from-violet-700/40 to-eggplant-850 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-signal-500/15 text-signal-400">
                    <Sparkles size={22} />
                  </span>
                  <div>
                    <p className="font-semibold">5 media kits and 5 pitches are ready</p>
                    <p className="text-sm text-ink-muted">Review the evidence, then send when you are happy.</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button href={`/app/shows/${show.id}`} variant="outline">View Audience DNA</Button>
                  <Button href={`/app/sponsors/${results[0].id}`}>Open top match</Button>
                </div>
              </div>
            </section>
          )}

          <p className="text-xs text-ink-faint">
            Sample data. See{" "}
            <Link href="/app/shows/the-deep-dive/sponsors" className="underline hover:text-ink-soft">
              the full shortlist
            </Link>{" "}
            for filters and the Without-vs-With-Qloo view.
          </p>
        </div>
      </div>
    </div>
  );
}
