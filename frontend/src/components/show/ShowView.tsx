"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Check, Copy, Lightbulb, MapPin, Mic, Play, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { CoverArt } from "@/components/art/CoverArt";
import { LogoMark } from "@/components/layout/Logo";
import { DemoBars } from "@/components/charts/DemoBars";
import { UsHeatmap } from "@/components/charts/UsHeatmap";
import { AGE_BUCKETS, CITIES, GENDER_SPLIT, TASTES, THEMES, getShow } from "@/lib/mock-data";
import { cn } from "@/lib/cn";

const TABS = ["Overview", "Live & Local", "Episode ideas"] as const;
type Tab = (typeof TABS)[number];

const LOCAL: Record<string, { name: string; kind: string }[]> = {
  Seattle: [
    { name: "Alder & Oak Roasters", kind: "Coffee" },
    { name: "Summit Gear Exchange", kind: "Outdoor retail" },
    { name: "Pine Street Books", kind: "Indie bookstore" },
  ],
  Denver: [
    { name: "Foothill Trail Co-op", kind: "Outdoor retail" },
    { name: "Mile High Provisions", kind: "Food & drink" },
    { name: "Larkspur Print Shop", kind: "Maker studio" },
  ],
  Portland: [
    { name: "Fernhill Plant House", kind: "Plants" },
    { name: "Bridgeline Cafe", kind: "Coffee" },
    { name: "Tinder & Reel", kind: "Film photography" },
  ],
  Austin: [
    { name: "Cedar Street Kitchen", kind: "Restaurant" },
    { name: "Bluebonnet Outfitters", kind: "Outdoor retail" },
    { name: "Second Draft Books", kind: "Indie bookstore" },
  ],
};

const IDEAS = [
  { title: "The quiet comeback of the paper map", signal: "National parks", score: 95, why: "Your listeners lean hard into road trips and parks, and nostalgia for analogue navigation travels well." },
  { title: "What a sound designer hears in a forest", signal: "Nature documentaries", score: 94, why: "Nature documentaries are the single strongest film taste in your audience." },
  { title: "Inside a small-batch roastery", signal: "Third-wave coffee shops", score: 93, why: "Coffee culture is a top-three theme. A visit episode doubles as a natural sponsor moment." },
  { title: "Why slow sci-fi sticks with us", signal: "Slow-burn sci-fi", score: 82, why: "A strong film affinity that pairs with your long-form curiosity theme." },
  { title: "The folk revival nobody planned", signal: "Indie folk", score: 91, why: "Indie folk is your top music taste, so a guest from that scene fits." },
  { title: "Cooking for one, outdoors", signal: "Farm-to-table", score: 85, why: "Bridges two themes your audience loves: food culture and the outdoors." },
];

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

export function ShowView() {
  const { id } = useParams<{ id: string }>();
  const show = getShow(id);
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
            <CoverArt seed={show.seed} />
          </span>
          <div>
            <p className="label mb-1.5">Audience DNA</p>
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{show.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Chip tone="violet" icon={show.platform === "podcast" ? <Mic size={11} /> : <Play size={11} />}>
                {show.platform === "podcast" ? "Podcast" : "YouTube"}
              </Chip>
              <Chip>{show.category}</Chip>
              <span className="text-sm text-ink-muted">Hosted by {show.host} · {show.reach}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button href={`/app/runs/${show.id}`} variant="outline">
            <RefreshCw size={16} /> Re-run
          </Button>
          <Button href={`/app/shows/${show.id}/sponsors`}>See matching sponsors</Button>
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
              <Card title="Age" hint="Filled bar: your audience. White marker: general population.">
                <DemoBars rows={AGE_BUCKETS} />
              </Card>
              <Card title="Gender" hint="Share of your audience versus the general population.">
                <DemoBars rows={GENDER_SPLIT} />
              </Card>
              <Card title="Share card" hint="A square summary you can post.">
                <ShareCard seed={show.seed} name={show.name} themes={THEMES.slice(0, 3)} />
                <Button variant="outline" size="sm" className="mt-4 w-full" onClick={copyLink}>
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  {copied ? "Link copied" : "Copy link"}
                </Button>
              </Card>
            </div>

            <Card title="Taste map" hint="What your audience loves beyond your show. Higher means a stronger match.">
              <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2 xl:grid-cols-4">
                {TASTES.map((d) => (
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
                  <UsHeatmap cities={CITIES} />
                  <ol className="space-y-2.5">
                    {CITIES.slice(0, 6).map((c, i) => (
                      <li key={c.city} className="flex items-center gap-3 text-sm">
                        <span className="w-5 text-ink-faint tabular-nums">{i + 1}</span>
                        <span className="flex-1">{c.city}</span>
                        <span className="tabular-nums text-ink-muted">{c.intensity}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </Card>
              <Card title="Themes" hint="What they keep coming back to.">
                <div className="flex flex-wrap gap-2">
                  {THEMES.map((t, i) => (
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
              Planning a live show or a local giveaway? These are the cities where your audience is
              most concentrated, with local businesses that fit their tastes.
            </p>
            <div className="grid gap-5 md:grid-cols-2">
              {CITIES.slice(0, 4).map((c) => (
                <section key={c.city} className="surface p-5 sm:p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
                      <MapPin size={18} className="text-orchid-300" /> {c.city}
                    </h2>
                    <Chip tone="signal">Heat {c.intensity}</Chip>
                  </div>
                  <ul className="space-y-2.5">
                    {(LOCAL[c.city] ?? []).map((b) => (
                      <li key={b.name} className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-eggplant-900/50 px-4 py-3">
                        <span className="text-sm font-medium">{b.name}</span>
                        <Chip>{b.kind}</Chip>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
            <p className="mt-5 text-xs text-ink-faint">Sample data. Local businesses are fictional.</p>
          </div>
        )}

        {tab === "Episode ideas" && (
          <div>
            <p className="mb-6 max-w-2xl text-ink-muted">
              Topics your audience is likely to love, drawn from their strongest tastes. Each one
              shows the signal behind it.
            </p>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {IDEAS.map((idea) => (
                <article key={idea.title} className="surface flex flex-col p-5 sm:p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-signal-500/15 text-signal-400">
                    <Lightbulb size={19} />
                  </span>
                  <h2 className="mt-4 font-display text-xl font-semibold leading-snug">{idea.title}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{idea.why}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-white/[0.07] pt-4">
                    <Chip tone="violet">{idea.signal}</Chip>
                    <span className="text-sm font-semibold tabular-nums text-orchid-300">{idea.score} match</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
