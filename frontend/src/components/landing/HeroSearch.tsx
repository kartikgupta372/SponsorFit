"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Mic, Play, Search } from "lucide-react";
import { useAuth } from "@/lib/auth";
import type { Platform } from "@/lib/types";
import { cn } from "@/lib/cn";

const EXAMPLES = [
  { label: "Radiolab", q: "Radiolab", p: "podcast" },
  { label: "How I Built This", q: "How I Built This", p: "podcast" },
  { label: "Binging with Babish", q: "Binging with Babish", p: "youtube" },
] as const;

/**
 * The demo entry point. Works while logged out: it opens a demo workspace so
 * anyone (a judge, a sponsor) can try the whole flow without signing up.
 */
export function HeroSearch() {
  const { user, signInDemo } = useAuth();
  const [platform, setPlatform] = useState<Platform>("podcast");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);

  const [error, setError] = useState<string>();

  async function go(example?: (typeof EXAMPLES)[number]) {
    setBusy(true);
    setError(undefined);
    try {
      if (!user) await signInDemo();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not open the demo.");
      setBusy(false);
      return;
    }
    const params = new URLSearchParams();
    const q = example ? example.q : query.trim();
    if (q) params.set("q", q);
    params.set("p", example ? example.p : platform);
    window.location.assign(`/app/new?${params.toString()}`);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void go();
  }

  return (
    <div>
      <form
        onSubmit={onSubmit}
        className="surface-raised p-2 shadow-glow"
        aria-label="Find sponsors for your show"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div
            role="radiogroup"
            aria-label="Platform"
            className="flex shrink-0 rounded-xl bg-eggplant-950/60 p-1"
          >
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
                  "flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg px-3.5 text-sm font-medium transition-colors sm:flex-none",
                  platform === value
                    ? "bg-violet-600 text-white"
                    : "text-ink-muted hover:text-ink",
                )}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          <label className="relative flex-1">
            <span className="sr-only">Your show or channel name</span>
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={platform === "podcast" ? "Your podcast name" : "Your channel name"}
              className="h-12 w-full rounded-xl bg-transparent pl-11 pr-3 text-[15px] text-ink placeholder:text-ink-faint focus:outline-none"
            />
          </label>

          <button
            type="submit"
            disabled={busy}
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-signal-500 px-6 text-sm font-semibold text-eggplant-950 transition-all hover:-translate-y-0.5 hover:bg-signal-400 disabled:opacity-60"
          >
            {busy ? <Loader2 size={17} className="animate-spin" /> : null}
            Find my sponsors
          </button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-ink-muted">Or try an example:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex.label}
            type="button"
            onClick={() => go(ex)}
            disabled={busy}
            className="rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-1.5 text-sm text-ink-soft transition-colors hover:border-orchid-400/60 hover:text-ink disabled:opacity-60"
          >
            {ex.label}
          </button>
        ))}
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-signal-400">{error}</p>}
    </div>
  );
}
