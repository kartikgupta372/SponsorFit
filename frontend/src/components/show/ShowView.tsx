"use client";

import { useState } from "react";
import { Check, Copy, Database, Lightbulb, MapPin, Mic, Play, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { CoverArt } from "@/components/art/CoverArt";
import { LogoMark } from "@/components/layout/Logo";
import { IndexBars } from "@/components/charts/IndexBars";
import { UsHeatmap } from "@/components/charts/UsHeatmap";
import { compact, hashSeed, type AnalysisRow, type AudienceProfile, type MatchRow, type ShowRow } from "@/lib/model";
import { cn } from "@/lib/cn";

const TABS = ["Overview", "Live & Local", "Episode ideas"] as const;
type Tab = (typeof TABS)[number];

function Card({ title, hint, children, className }: { title: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("surface p-5 sm:p-6", className)}>
      <div className="mb-5">
        <h2 className="font-semibold">{title}</h2>
        {hint && <p className="mt-0.5 text-xs text-ink-muted">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function ShareCard({ seed, name, themes }: { seed: number; name: string; themes: string[] }) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/15">
      <div className="absolute inset-0">
        <CoverArt seed={seed} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-eggplant-950 via-eggplant-950/55 to-transparent" />
      <div className="relative flex h-full flex-col justify-between p-5">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
          <LogoMark size={20} /> Audience DNA
        </div>
        <div>
          <p className="font-display text-3xl font-semibold leading-tight">{name}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {themes.map((t) => (
              <Chip key={t} tone="orchid">{t}</Chip>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ShowView({ analysis, show, matches }: { analysis: AnalysisRow; show: ShowRow; matches: MatchRow[] }) {
  const profile = ("themes" in analysis.profile ? analysis.profile : { themes: [], domains: [], age: [], gender: [], heat: [], episodeIdeas: [], audienceTags: [] }) as AudienceProfile;
  const seed = hashSeed(show.name);
  const cities = profile.heat.map((h) => ({ city: h.city, lat: h.lat, lon: h.lon, intensity: h.intensity }));
  const [tab, setTab] = useState<Tab>("Overview");
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard can be blocked; nothing to recover */
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-5">
          <span className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-white/15 shadow-lift">
            <CoverArt seed={seed} />
          </span>
          <div>
            <p className="label mb-1.5">Audience DNA</p>
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{show.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Chip tone="violet" icon={show.platform === "podcast" ? <Mic size={11} /> : <Play size={11} />}>
                {show.platform === "podcast" ? "Podcast" : "YouTube"}
              </Chip>
              <Chip tone={analysis.source === "qloo" ? "mint" : "signal"} icon={<Database size={11} />}>
                {analysis.source === "qloo" ? "Qloo taste data" : "Sample data"}
              </Chip>
              <span className="text-sm text-ink-muted">{compact(show.audience_size)} {show.platform === "podcast" ? "listeners / episode" : "views / video"}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button href="/app/new" variant="outline">
            <RefreshCw size={16} /> New analysis
          </Button>
          <Button href={`/app/shows/${analysis.id}/sponsors`}>See {matches.length} matching sponsors</Button>
        </div>
      </div>

      {/* Tabs */}
      <div role="tablist" aria-label="Audience sections" className="mb-6 flex gap-1 overflow-x-auto border-b border-white/[0.08]">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            id={`tab-${t}`}
            aria-selected={tab === t}
            aria-controls="tab-panel"
            onClick={() => setTab(t)}
            className={cn(
              "relative whitespace-nowrap px-4 pb-3.5 pt-2 text-sm font-medium transition-colors",
              tab === t ? "text-ink" : "text-ink-muted hover:text-ink-soft",
            )}
          >
            {t}
            {tab === t && (
              <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-violet-500 via-orchid-400 to-signal-500" />
            )}
          </button>
        ))}
      </div>

      <div id="tab-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="animate-fade-up" key={tab}>
        {tab === "Overview" && (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <Card title="Age" hint="Qloo index vs. the average consumer. Right of centre means over-represented.">
                <IndexBars rows={profile.age} />
              </Card>
              <Card title="Gender" hint="Qloo index vs. the average consumer.">
                <IndexBars rows={profile.gender} />
                {profile.summary && <p className="mt-6 border-t border-white/[0.07] pt-4 text-sm leading-relaxed text-ink-soft">{profile.summary}</p>}
              </Card>
              <Card title="Share card" hint="A square summary you can post.">
                <ShareCard seed={seed} name={show.name} themes={profile.themes.slice(0, 3)} />
                <Button variant="outline" size="sm" className="mt-4 w-full" onClick={copyLink}>
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  {copied ? "Link copied" : "Copy link"}
                </Button>
              </Card>
            </div>

            <Card title="Taste map" hint="Qloo taste tags this audience over-indexes on, grouped by domain. 100 is the strongest signal.">
              <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2 xl:grid-cols-4">
                {profile.domains.length === 0 && <p className="text-sm text-ink-muted">No taste tags returned.</p>}
                {profile.domains.map((d) => (
                  <div key={d.domain}>
                    <p className="label mb-3.5">{d.domain}</p>
                    <ul className="space-y-3">
                      {d.items.map((it) => (
                        <li key={it.label}>
                          <div className="mb-1 flex justify-between text-sm">
                            <span className="text-ink-soft">{it.label}</span>
                            <span className="tabular-nums text-ink-muted">{it.affinity}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/[0.07]">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-orchid-400"
                              style={{ width: `${it.affinity}%` }}
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
              <Card title="Where your audience lives" hint="Brighter and larger means a stronger concentration.">
                <div className="grid gap-6 md:grid-cols-[1.5fr_1fr] md:items-center">
                  <UsHeatmap cities={cities} />
                  <ol className="space-y-2.5">
                    {cities.length === 0 && <li className="text-sm text-ink-muted">No US heatmap data for this audience.</li>}
                    {cities.slice(0, 6).map((c, i) => (
                      <li key={c.city} className="flex items-center gap-3 text-sm">
                        <span className="w-5 text-ink-faint tabular-nums">{i + 1}</span>
                        <span className="flex-1">{c.city}</span>
                        <span className="tabular-nums text-ink-muted">{c.intensity}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </Card>
              <Card title="Themes" hint="Top taste tags from Qloo, strongest first.">
                <div className="flex flex-wrap gap-2">
                  {profile.audienceTags.slice(0, 18).map((t, i) => (
                    <Chip key={t} tone={i % 3 === 0 ? "orchid" : i % 3 === 1 ? "violet" : "neutral"}>
                      {t}
                    </Chip>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {tab === "Live & Local" && (
          <div>
            <p className="mb-6 max-w-2xl text-ink-muted">
              Planning a live show, a meetup or a local giveaway? These are the cities where Qloo&apos;s heatmap shows your
              audience&apos;s tastes concentrate. Pair them with a top brand for a local activation.
            </p>
            {cities.length === 0 ? (
              <p className="surface p-6 text-sm text-ink-muted">Qloo returned no US heatmap for this audience.</p>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {cities.slice(0, 4).map((c, i) => {
                  const partner = matches.filter((m) => !m.safety)[i];
                  return (
                    <section key={c.city} className="surface p-5 sm:p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
                          <MapPin size={18} className="text-orchid-300" /> {c.city}
                        </h2>
                        <Chip tone="signal">Heat {c.intensity}</Chip>
                      </div>
                      <div className="h-2 rounded-full bg-white/[0.07]">
                        <div className="h-full rounded-full bg-gradient-to-r from-violet-500 via-orchid-400 to-signal-500" style={{ width: `${c.intensity}%` }} />
                      </div>
                      {partner && (
                        <p className="mt-4 text-sm text-ink-soft">
                          Idea: a live taping in {c.city} presented by <span className="font-semibold text-ink">{partner.name}</span>, with a
                          listener meetup around {profile.themes[i % Math.max(1, profile.themes.length)] ?? "your show"}.
                        </p>
                      )}
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === "Episode ideas" && (
          <div>
            <p className="mb-6 max-w-2xl text-ink-muted">
              Topics your audience is likely to love, written by the agent from their strongest Qloo taste signals.
            </p>
            {profile.episodeIdeas.length === 0 ? (
              <p className="surface p-6 text-sm text-ink-muted">Episode ideas need the Groq key. They appear on your next analysis once it is set.</p>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {profile.episodeIdeas.map((idea) => (
                  <article key={idea.title} className="surface flex flex-col p-5 sm:p-6">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-signal-500/15 text-signal-400">
                      <Lightbulb size={19} />
                    </span>
                    <h2 className="mt-4 font-display text-xl font-semibold leading-snug">{idea.title}</h2>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{idea.why}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
