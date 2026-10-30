"use client";

import { useEffect, useState } from "react";
import { Check, Info, Loader2, Mic, Play, Sparkles, X } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { CoverArt } from "@/components/art/CoverArt";
import { EntitySearch, type Entity } from "@/components/new/EntitySearch";
import { hashSeed, type Platform } from "@/lib/model";
import { cn } from "@/lib/cn";

const SHOW_TYPES: Record<Platform, string> = {
  podcast: "podcast",
  youtube: "person,tv_show,podcast",
};

export default function NewAnalysisPage() {
  const [platform, setPlatform] = useState<Platform>("podcast");
  const [initialQ, setInitialQ] = useState("");
  const [show, setShow] = useState<Entity | null>(null);
  const [name, setName] = useState("");
  const [audience, setAudience] = useState("");
  const [seeds, setSeeds] = useState<Entity[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [touched, setTouched] = useState(false);

  // Prefill from the landing page (?q=Radiolab&p=podcast).
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const q = sp.get("q");
    if (sp.get("p") === "youtube") setPlatform("youtube");
    if (q) {
      setInitialQ(q);
      setName(q);
    }
  }, []);

  const audienceNum = Number(audience.replace(/[^0-9]/g, ""));
  const audienceError = touched && (!audienceNum || audienceNum < 100) ? "Enter your average audience, at least 100." : undefined;
  const nameError = touched && !name.trim() ? "Add your show or channel name." : undefined;
  const signalError = touched && !show && seeds.length === 0 ? "Pick your show from the results, or add at least one similar show." : undefined;

  function pickShow(e: Entity) {
    setShow(e);
    if (!name.trim() || name === initialQ) setName(e.name);
  }

  async function start() {
    setTouched(true);
    if (!name.trim() || !audienceNum || audienceNum < 100 || (!show && seeds.length === 0)) return;
    setBusy(true);
    setError(undefined);
    try {
      const res = await fetch("/api/analyses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          platform,
          audience_size: audienceNum,
          qloo_entity_id: show?.id ?? null,
          seeds: seeds.map((s) => ({ id: s.id, name: s.name, type: s.type })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start the analysis.");
      window.location.assign(`/app/runs/${data.id}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="New analysis"
        title="Which show should we analyze?"
        subtitle="Find your podcast or channel in Qloo's taste graph. The agent reads its audience and ranks the brands they already love."
      />

      <div className="surface-raised space-y-8 p-5 sm:p-7">
        {/* 1. Platform + search */}
        <section aria-labelledby="s1">
          <p id="s1" className="label mb-3">1. Find your show</p>
          <div role="radiogroup" aria-label="Platform" className="mb-3 inline-flex rounded-xl bg-eggplant-950/60 p-1">
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
                onClick={() => {
                  setPlatform(value);
                  setShow(null);
                }}
                className={cn(
                  "flex h-10 items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-medium transition-colors",
                  platform === value ? "bg-violet-600 text-white" : "text-ink-muted hover:text-ink",
                )}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>

          {show ? (
            <div className="flex items-center gap-3 rounded-2xl border border-mint/30 bg-mint/[0.06] p-3">
              <span className="h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                {show.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={show.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <CoverArt seed={hashSeed(show.name)} />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate font-semibold">
                  <Check size={15} className="text-mint" /> {show.name}
                </p>
                <p className="text-xs text-ink-muted">Found in Qloo. Its audience will be the signal.</p>
              </div>
              <button type="button" onClick={() => setShow(null)} className="rounded-lg px-3 py-2 text-sm text-ink-muted hover:bg-white/10 hover:text-ink">
                Change
              </button>
            </div>
          ) : (
            <EntitySearch
              types={SHOW_TYPES[platform]}
              label="Search your show"
              placeholder={platform === "podcast" ? "Search your podcast, e.g. Radiolab" : "Search your channel or creator name"}
              initial={initialQ}
              onPick={pickShow}
              actionLabel="This is mine"
            />
          )}
        </section>

        {/* 2. Shows like mine */}
        <section aria-labelledby="s2" className="rounded-2xl border border-orchid-400/25 bg-orchid-400/[0.05] p-5">
          <div className="flex items-start gap-3">
            <Info size={18} className="mt-0.5 shrink-0 text-orchid-300" />
            <div>
              <p id="s2" className="font-semibold">2. Shows like mine <span className="font-normal text-ink-muted">(optional, up to 5)</span></p>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                Smaller shows are often missing from the taste graph. Add podcasts, artists, films or books your
                audience loves, and the agent uses them as the audience signal.
              </p>
            </div>
          </div>
          {seeds.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {seeds.map((s) => (
                <li key={s.id}>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-500/15 py-1.5 pl-3.5 pr-1.5 text-sm text-violet-100">
                    {s.name}
                    <button
                      type="button"
                      aria-label={`Remove ${s.name}`}
                      onClick={() => setSeeds((all) => all.filter((x) => x.id !== s.id))}
                      className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-white/15"
                    >
                      <X size={13} />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
          {seeds.length < 5 && (
            <div className="mt-4">
              <EntitySearch
                types="podcast,artist,movie,tv_show,book"
                label="Add a similar show, artist or film"
                placeholder="Add a similar show, artist, film or book"
                onPick={(e) => setSeeds((all) => (all.some((x) => x.id === e.id) ? all : [...all, e].slice(0, 5)))}
                actionLabel="Add"
                exclude={[...seeds.map((s) => s.id), show?.id ?? ""]}
              />
            </div>
          )}
          {signalError && <p role="alert" className="mt-3 text-sm text-signal-400">{signalError}</p>}
        </section>

        {/* 3. Details */}
        <section aria-labelledby="s3" className="grid gap-5 sm:grid-cols-2">
          <p id="s3" className="label sm:col-span-2">3. A few details</p>
          <div>
            <label htmlFor="show-name" className="mb-1.5 block text-sm font-medium text-ink-soft">Show or channel name</label>
            <input
              id="show-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => name && setTouched(true)}
              className="h-12 w-full rounded-xl border border-white/10 bg-eggplant-900/70 px-4 text-[15px] focus:border-orchid-400/70 focus:outline-none focus:ring-2 focus:ring-orchid-400/20"
            />
            {nameError && <p className="mt-1.5 text-sm text-signal-400">{nameError}</p>}
          </div>
          <div>
            <label htmlFor="audience" className="mb-1.5 block text-sm font-medium text-ink-soft">
              {platform === "podcast" ? "Listeners per episode" : "Views per video"}
            </label>
            <input
              id="audience"
              inputMode="numeric"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g. 25000"
              className="h-12 w-full rounded-xl border border-white/10 bg-eggplant-900/70 px-4 text-[15px] placeholder:text-ink-faint focus:border-orchid-400/70 focus:outline-none focus:ring-2 focus:ring-orchid-400/20"
            />
            {audienceError ? (
              <p className="mt-1.5 text-sm text-signal-400">{audienceError}</p>
            ) : (
              <p className="mt-1.5 text-xs text-ink-faint">Used only for the rate advisor.</p>
            )}
          </div>
        </section>

        {error && (
          <p role="alert" className="rounded-xl border border-signal-500/40 bg-signal-500/10 px-4 py-3 text-sm text-signal-400">{error}</p>
        )}

        <div className="flex flex-col-reverse gap-4 border-t border-white/[0.06] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-xs text-ink-muted">
            <Chip tone="violet">Safety cap</Chip> Each run makes at most 40 Qloo calls.
          </p>
          <Button size="lg" onClick={start} disabled={busy}>
            {busy ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            Find my sponsors
          </Button>
        </div>
      </div>
    </div>
  );
}
