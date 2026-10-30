"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Check, Database, Gem, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { CoverArt } from "@/components/art/CoverArt";
import { BrandMark } from "@/components/art/BrandMark";
import { FitRing } from "@/components/charts/FitRing";
import { hashSeed, hueOf, type AnalysisRow, type AudienceProfile, type ShowRow, type TraceCall } from "@/lib/model";
import { cn } from "@/lib/cn";

const STEPS = [
  { key: "resolve", title: "Resolve", detail: "Find the show in Qloo's taste graph" },
  { key: "profile", title: "Profile", detail: "Taste tags, demographics and heatmap" },
  { key: "discover", title: "Discover", detail: "Brands this audience over-indexes on" },
  { key: "enrich", title: "Enrich", detail: "Each brand's own audience demographics" },
  { key: "score", title: "Score", detail: "Fit Score with plain maths, no AI" },
  { key: "critic", title: "Critic", detail: "Brand safety, competitors, grounded reasons" },
  { key: "generate", title: "Generate", detail: "Save the shortlist" },
] as const;
type StepState = "waiting" | "running" | "done";

interface LiveMatch {
  qloo_id: string;
  name: string;
  category: string;
  fit: number;
  reasons: string[];
  hidden_gem: boolean;
  safety: string | null;
}

const CAP = 40;

function callLabel(c: TraceCall) {
  const t = c.params["filter.type"];
  if (c.endpoint === "/search") return "Entity search";
  if (!t) return c.endpoint;
  const name = t.replace("urn:entity:", "").replace("urn:", "");
  return { tag: "Taste tags", demographics: "Demographics", heatmap: "Heatmap", brand: "Brand insights" }[name] ?? name;
}

export function RunView({ analysis, show, matches }: { analysis: AnalysisRow; show: ShowRow; matches: LiveMatch[] }) {
  const finishedAlready = analysis.status === "complete";
  const [states, setStates] = useState<Record<string, StepState>>(() =>
    Object.fromEntries(STEPS.map((s) => [s.key, finishedAlready ? "done" : "waiting"])),
  );
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [calls, setCalls] = useState<TraceCall[]>(analysis.trace ?? []);
  const [profile, setProfile] = useState<AudienceProfile | null>("themes" in analysis.profile ? (analysis.profile as AudienceProfile) : null);
  const [live, setLive] = useState<LiveMatch[]>(matches);
  const [status, setStatus] = useState(analysis.status);
  const [error, setError] = useState<string | null>(analysis.error);
  const [source, setSource] = useState(analysis.source);
  const started = useRef(false);

  useEffect(() => {
    if (analysis.status === "running") {
      // Another tab (or a refresh) owns the stream: wait for the saved result.
      const t = setInterval(() => window.location.reload(), 4000);
      return () => clearInterval(t);
    }
    if (analysis.status !== "queued" || started.current) return;
    started.current = true;
    setStatus("running");

    (async () => {
      try {
        const res = await fetch(`/api/analyses/${analysis.id}/run`, { method: "POST" });
        if (res.status === 409) return window.location.reload();
        if (!res.ok || !res.body) throw new Error((await res.json().catch(() => ({}))).error || "Could not start the agent.");
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          let nl: number;
          while ((nl = buf.indexOf("\n")) >= 0) {
            const line = buf.slice(0, nl).trim();
            buf = buf.slice(nl + 1);
            if (!line) continue;
            const e = JSON.parse(line);
            if (e.type === "step") {
              setStates((s) => ({ ...s, [e.key]: e.status }));
              if (e.note) setNotes((n) => ({ ...n, [e.key]: e.note }));
            } else if (e.type === "call") setCalls((c) => [...c, e.call]);
            else if (e.type === "profile") setProfile(e.profile);
            else if (e.type === "match") setLive((m) => (m.some((x) => x.qloo_id === e.match.qloo_id) ? m.map((x) => (x.qloo_id === e.match.qloo_id ? e.match : x)) : [...m, e.match]));
            else if (e.type === "done") setSource(e.source);
            else if (e.type === "saved") {
              setStatus("complete");
              // Reload so every screen reads the saved rows (with their ids).
              setTimeout(() => window.location.reload(), 900);
            } else if (e.type === "error") {
              setError(e.message);
              setStatus("failed");
            }
          }
        }
      } catch (err) {
        setError((err as Error).message);
        setStatus("failed");
      }
    })();
  }, [analysis.id, analysis.status]);

  const doneCount = STEPS.filter((s) => states[s.key] === "done").length;
  const progress = Math.round((doneCount / STEPS.length) * 100);
  const sorted = [...live].sort((a, b) => b.fit - a.fit);
  const topAge = profile?.age.length ? [...profile.age].sort((a, b) => b.index - a.index)[0] : null;
  const complete = status === "complete";

  return (
    <div>
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <span className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
            <CoverArt seed={hashSeed(show.name)} />
          </span>
          <div>
            <p className="label mb-1">{complete ? "Analysis complete" : status === "failed" ? "Analysis stopped" : "Agent running"}</p>
            <h1 className="font-display text-3xl font-semibold tracking-tight">{show.name}</h1>
            <p className="mt-1 text-sm text-ink-muted">
              {show.platform === "podcast" ? "Podcast" : "YouTube channel"}
              {show.seed_entities.length > 0 && ` · audience signal: ${show.seed_entities.map((s) => s.name).join(", ")}`}
            </p>
          </div>
        </div>
        {complete && (
          <div className="flex flex-wrap gap-2">
            <Button href={`/app/shows/${analysis.id}`} variant="outline">Audience DNA</Button>
            <Button href={`/app/shows/${analysis.id}/sponsors`}>See all sponsors</Button>
          </div>
        )}
      </div>

      {status === "failed" && (
        <div role="alert" className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl border border-signal-500/40 bg-signal-500/10 p-5">
          <AlertTriangle className="text-signal-400" />
          <p className="flex-1 text-sm text-ink-soft">{error || "The agent stopped."}</p>
          <Button href="/app/new" variant="outline">Try again</Button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[25rem_1fr]">
        {/* Trace */}
        <section className="surface self-start p-5 lg:sticky lg:top-24" aria-label="Agent trace">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="font-semibold">Agent trace</h2>
            <Chip tone={source === "qloo" ? "mint" : "signal"} icon={<Database size={11} />}>
              {source === "qloo" ? "Live Qloo data" : "Sample data"}
            </Chip>
          </div>
          <div className="mb-5">
            <div className="mb-1.5 flex justify-between text-xs text-ink-muted">
              <span>Qloo calls used</span>
              <span className="tabular-nums text-ink">{calls.length} of {CAP}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Analysis progress">
              <div className="h-full rounded-full bg-gradient-to-r from-violet-500 via-orchid-400 to-signal-500 transition-all duration-500" style={{ width: `${complete ? 100 : progress}%` }} />
            </div>
          </div>
          <ol className="space-y-1">
            {STEPS.map((step, i) => {
              const st = states[step.key];
              const stepCalls = calls.filter((c) => c.step === step.key);
              return (
                <li key={step.key} className="flex gap-3.5">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                        st === "done" && "bg-mint/15 text-mint",
                        st === "running" && "bg-orchid-400/20 text-orchid-300",
                        st === "waiting" && "border border-white/15 text-ink-faint",
                      )}
                    >
                      {st === "done" ? <Check size={14} /> : st === "running" ? <Loader2 size={14} className="animate-spin" /> : i + 1}
                    </span>
                    {i < STEPS.length - 1 && <span className={cn("my-1 w-px flex-1", st === "done" ? "bg-mint/30" : "bg-white/10")} />}
                  </div>
                  <div className="min-w-0 flex-1 pb-3">
                    <p className={cn("text-sm font-semibold", st === "waiting" && "text-ink-faint")}>{step.title}</p>
                    <p className="text-xs text-ink-muted">{notes[step.key] ?? step.detail}</p>
                    {stepCalls.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {stepCalls.map((c, j) => (
                          <li key={j} className="flex items-center justify-between gap-2 rounded-lg bg-white/[0.04] px-2.5 py-1.5 text-[11px]">
                            <span className="truncate text-ink-soft">
                              <span className="font-semibold text-violet-200">{callLabel(c)}</span>
                              {c.preview.length > 0 && <span className="text-ink-muted"> · {c.preview.slice(0, 2).join(", ")}</span>}
                            </span>
                            <span className={cn("shrink-0 tabular-nums", c.status === "error" ? "text-signal-400" : "text-ink-muted")}>
                              {c.status === "error" ? "failed" : `${c.count} · ${c.cached ? "cached" : `${c.ms}ms`}`}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Results */}
        <div className="space-y-6">
          <section className="surface p-6" aria-label="Audience summary">
            <h2 className="mb-4 font-semibold">Audience DNA</h2>
            {!profile ? (
              <div className="grid gap-3 sm:grid-cols-3">
                {[0, 1, 2].map((i) => <div key={i} className="skeleton h-24" />)}
              </div>
            ) : (
              <div className="grid animate-fade-up gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-white/[0.08] bg-eggplant-900/60 p-4">
                  <p className="label">Strongest age band</p>
                  <p className="mt-2 font-display text-3xl font-semibold">{topAge?.label ?? "n/a"}</p>
                  {topAge && <p className="mt-1 text-xs text-signal-400">{topAge.index > 0 ? "+" : ""}{topAge.index} index vs average</p>}
                </div>
                <div className="rounded-xl border border-white/[0.08] bg-eggplant-900/60 p-4">
                  <p className="label">Top city</p>
                  <p className="mt-2 font-display text-3xl font-semibold">{profile.heat[0]?.city ?? "n/a"}</p>
                  {profile.heat[0] && <p className="mt-1 text-xs text-ink-muted">Heat {profile.heat[0].intensity} / 100</p>}
                </div>
                <div className="rounded-xl border border-white/[0.08] bg-eggplant-900/60 p-4">
                  <p className="label">Top tastes</p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {profile.themes.slice(0, 3).map((t) => <Chip key={t} tone="orchid">{t}</Chip>)}
                  </div>
                </div>
              </div>
            )}
          </section>

          <section aria-label="Sponsor matches">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Best-fit sponsors</h2>
              {states.critic === "done" && <Chip tone="mint">Checked for brand safety</Chip>}
            </div>
            {sorted.length === 0 ? (
              <div className="space-y-3">
                {status === "failed" ? (
                  <p className="text-sm text-ink-muted">No results.</p>
                ) : (
                  [0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)
                )}
              </div>
            ) : (
              <ul className="space-y-3">
                {sorted.slice(0, 6).map((b, i) => (
                  <li key={b.qloo_id} className="surface flex animate-fade-up items-center gap-4 p-4" style={{ animationDelay: `${i * 70}ms` }}>
                    <span className="hidden w-6 text-center font-display text-xl text-ink-faint sm:block">{i + 1}</span>
                    <BrandMark name={b.name} hue={hueOf(b.name)} size={50} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{b.name}</p>
                        {b.hidden_gem && <Chip tone="signal" icon={<Gem size={11} />}>Hidden gem</Chip>}
                        {b.safety && <Chip>{b.safety}</Chip>}
                      </div>
                      <p className="mt-0.5 text-xs text-ink-muted">{b.category}</p>
                      {b.reasons[0] && <p className="mt-1.5 text-sm text-ink-soft">{b.reasons[0]}</p>}
                    </div>
                    <FitRing score={b.fit} size={60} stroke={6} label={false} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          {complete && (
            <section className="relative animate-fade-up overflow-hidden rounded-2xl border border-orchid-400/30 bg-gradient-to-br from-violet-700/40 to-eggplant-850 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-signal-500/15 text-signal-400">
                    <Sparkles size={22} />
                  </span>
                  <div>
                    <p className="font-semibold">{sorted.length} brands ranked with evidence</p>
                    <p className="text-sm text-ink-muted">Open one to see the proof, draft a pitch and share a media kit.</p>
                  </div>
                </div>
                <Button href={`/app/shows/${analysis.id}/sponsors`}>Review sponsors</Button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
