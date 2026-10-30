"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { CoverArt } from "@/components/art/CoverArt";
import { hashSeed } from "@/lib/model";

export interface Entity {
  id: string;
  name: string;
  type: string;
  image: string | null;
  note: string | null;
}

const TYPE_LABEL: Record<string, string> = {
  podcast: "Podcast",
  artist: "Artist",
  movie: "Film",
  tv_show: "TV show",
  book: "Book",
  person: "Creator",
  brand: "Brand",
  videogame: "Game",
};

/** Live typeahead over Qloo's entity search (debounced, cancels stale requests). */
export function EntitySearch({
  types,
  placeholder,
  label,
  initial = "",
  onPick,
  actionLabel = "Select",
  exclude = [],
  autoFocus,
}: {
  types: string;
  placeholder: string;
  label: string;
  initial?: string;
  onPick: (e: Entity) => void;
  actionLabel?: string;
  exclude?: string[];
  autoFocus?: boolean;
}) {
  const [q, setQ] = useState(initial);
  const [results, setResults] = useState<Entity[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [searched, setSearched] = useState(false);
  const ctrl = useRef<AbortController | null>(null);

  useEffect(() => {
    setQ(initial);
  }, [initial]);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    const t = setTimeout(async () => {
      ctrl.current?.abort();
      const c = new AbortController();
      ctrl.current = c;
      setBusy(true);
      setError(undefined);
      try {
        const res = await fetch(`/api/qloo/search?q=${encodeURIComponent(term)}&types=${types}`, { signal: c.signal });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Search failed.");
        setResults(data.results ?? []);
        setSearched(true);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setError((e as Error).message);
      } finally {
        if (!c.signal.aborted) setBusy(false);
      }
    }, 320);
    return () => clearTimeout(t);
  }, [q, types]);

  const shown = results.filter((r) => !exclude.includes(r.id));

  return (
    <div>
      <label className="relative block">
        <span className="sr-only">{label}</span>
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
        <input
          value={q}
          autoFocus={autoFocus}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="h-12 w-full rounded-xl border border-white/10 bg-eggplant-900/70 pl-11 pr-11 text-[15px] placeholder:text-ink-faint focus:border-orchid-400/70 focus:outline-none focus:ring-2 focus:ring-orchid-400/20"
        />
        {busy && <Loader2 size={17} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-ink-muted" />}
      </label>
      {error && <p role="alert" className="mt-2 text-sm text-signal-400">{error}</p>}
      {shown.length > 0 && (
        <ul className="mt-3 space-y-2" aria-label="Search results">
          {shown.slice(0, 6).map((r) => (
            <li key={r.id} className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-eggplant-900/50 p-2.5">
              <span className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-eggplant-800">
                {r.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <CoverArt seed={hashSeed(r.name)} />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{r.name}</span>
                <span className="block truncate text-xs text-ink-muted">
                  {TYPE_LABEL[r.type] ?? r.type}
                  {r.note ? ` · ${r.note}` : ""}
                </span>
              </span>
              <button
                type="button"
                onClick={() => onPick(r)}
                className="h-9 shrink-0 rounded-lg bg-violet-600 px-3.5 text-sm font-semibold text-white hover:bg-violet-500"
              >
                {actionLabel}
              </button>
            </li>
          ))}
        </ul>
      )}
      {searched && !busy && shown.length === 0 && !error && (
        <p className="mt-3 text-sm text-ink-muted">No matches in Qloo for &ldquo;{q}&rdquo;. Try another spelling, or add shows like yours below.</p>
      )}
    </div>
  );
}
