"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { BrandMark } from "@/components/art/BrandMark";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { DEALS, dealStats, getBrand } from "@/lib/mock-data";
import type { Deal, DealStage } from "@/lib/types";
import { cn } from "@/lib/cn";

const STAGES: DealStage[] = ["Pitched", "Replied", "Negotiating", "Won", "Lost"];
const DOT: Record<DealStage, string> = {
  Pitched: "bg-violet-400",
  Replied: "bg-orchid-400",
  Negotiating: "bg-signal-400",
  Won: "bg-mint",
  Lost: "bg-white/30",
};

const money = (n: number) => `$${n.toLocaleString("en-US")}`;

export function PipelineBoard() {
  const [deals, setDeals] = useState<Deal[]>(DEALS);
  const [openId, setOpenId] = useState<string | null>(null);
  const open = deals.find((d) => d.id === openId) ?? null;

  const wonValue = deals.filter((d) => d.stage === "Won").reduce((s, d) => s + d.amount, 0);
  const pipelineValue = deals
    .filter((d) => d.stage === "Replied" || d.stage === "Negotiating")
    .reduce((s, d) => s + d.amount, 0);
  const base = dealStats();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenId(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function move(id: string, stage: DealStage) {
    setDeals((all) => all.map((d) => (d.id === id ? { ...d, stage, lastActivity: "Just now" } : d)));
  }
  function setNote(id: string, note: string) {
    setDeals((all) => all.map((d) => (d.id === id ? { ...d, note } : d)));
  }

  return (
    <div>
      <dl className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Pitches sent", String(deals.length)],
          ["Reply rate", `${base.replyRate}%`],
          ["In play", money(pipelineValue)],
          ["Won", money(wonValue)],
        ].map(([k, v]) => (
          <div key={k} className="surface p-4">
            <dt className="text-xs text-ink-muted">{k}</dt>
            <dd className="mt-1 font-display text-2xl font-semibold tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0">
        {STAGES.map((stage) => {
          const items = deals.filter((d) => d.stage === stage);
          return (
            <section key={stage} aria-label={stage} className="w-[17rem] shrink-0 snap-start lg:w-auto">
              <header className="mb-3 flex items-center justify-between px-1">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <span className={cn("h-2 w-2 rounded-full", DOT[stage])} />
                  {stage}
                </h2>
                <span className="text-xs tabular-nums text-ink-muted">{items.length}</span>
              </header>
              <ul className="min-h-24 space-y-3 rounded-2xl bg-eggplant-950/40 p-2">
                {items.length === 0 && (
                  <li className="px-3 py-6 text-center text-xs text-ink-faint">Nothing here yet.</li>
                )}
                {items.map((d) => {
                  const b = getBrand(d.brandId);
                  return (
                    <li key={d.id} className="surface p-3.5">
                      <button
                        type="button"
                        onClick={() => setOpenId(d.id)}
                        className="flex w-full items-center gap-3 text-left"
                        aria-label={`Open ${b.name} deal`}
                      >
                        <BrandMark name={b.name} hue={b.hue} size={36} />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">{b.name}</span>
                          <span className="block text-xs text-ink-muted">{d.lastActivity}</span>
                        </span>
                      </button>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold tabular-nums text-signal-400">{money(d.amount)}</span>
                        <label className="sr-only" htmlFor={`mv-${d.id}`}>Move {b.name} to</label>
                        <select
                          id={`mv-${d.id}`}
                          value={d.stage}
                          onChange={(e) => move(d.id, e.target.value as DealStage)}
                          className="h-8 rounded-lg border border-white/10 bg-eggplant-900 px-2 text-xs text-ink-soft"
                        >
                          {STAGES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Deal details">
          <button
            type="button"
            aria-label="Close details"
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpenId(null)}
          />
          <aside className="absolute inset-y-0 right-0 flex w-full max-w-md animate-fade-up flex-col border-l border-white/10 bg-eggplant-850 p-6">
            {(() => {
              const b = getBrand(open.brandId);
              return (
                <>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <BrandMark name={b.name} hue={b.hue} size={48} />
                      <div>
                        <h2 className="text-lg font-semibold">{b.name}</h2>
                        <Chip tone="violet">{open.stage}</Chip>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpenId(null)}
                      aria-label="Close"
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-white/10 hover:text-ink"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-white/[0.04] p-3">
                      <dt className="text-xs text-ink-muted">Deal value</dt>
                      <dd className="mt-1 font-semibold tabular-nums">{money(open.amount)}</dd>
                    </div>
                    <div className="rounded-xl bg-white/[0.04] p-3">
                      <dt className="text-xs text-ink-muted">Last activity</dt>
                      <dd className="mt-1 font-semibold">{open.lastActivity}</dd>
                    </div>
                  </dl>
                  <label htmlFor="deal-note" className="mb-1.5 mt-6 block text-sm font-medium text-ink-soft">Notes</label>
                  <textarea
                    id="deal-note"
                    value={open.note}
                    onChange={(e) => setNote(open.id, e.target.value)}
                    rows={5}
                    className="w-full resize-none rounded-xl border border-white/10 bg-eggplant-900/70 px-4 py-3 text-sm focus:border-orchid-400/70 focus:outline-none focus:ring-2 focus:ring-orchid-400/20"
                  />
                  <div className="mt-auto flex flex-wrap gap-2 pt-6">
                    <Button href={`/app/pitches/${b.id}`} variant="outline" size="sm">View pitch</Button>
                    <Button href={`/app/sponsors/${b.id}`} variant="outline" size="sm">View brand</Button>
                    {open.stage !== "Won" && (
                      <Button size="sm" onClick={() => move(open.id, "Won")} className="ml-auto">Mark as won</Button>
                    )}
                  </div>
                </>
              );
            })()}
          </aside>
        </div>
      )}
      <p className="mt-2 text-xs text-ink-faint">
        Sample deals. Changes stay in this browser tab until the backend is connected.{" "}
        <Link href="/app/pitches" className="underline hover:text-ink">Start a new pitch</Link>
      </p>
    </div>
  );
}
