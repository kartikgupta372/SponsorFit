"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Copy, Loader2, Mail, Save, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { BrandMark } from "@/components/art/BrandMark";
import { FitRing } from "@/components/charts/FitRing";
import { supabaseBrowser } from "@/lib/supabase/client";
import { hueOf, rateFor, type DealRow, type MatchRow, type PitchRow, type ShowRow, type Tone } from "@/lib/model";
import { cn } from "@/lib/cn";

const TONES: Tone[] = ["Casual", "Professional", "Bold"];
const SIDE_TABS = ["Follow-ups", "Ad-read script", "Evidence used"] as const;
type SideTab = (typeof SIDE_TABS)[number];

function CopyBox({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-violet-300 hover:bg-white/[0.07] hover:text-orchid-300"
      aria-label={`Copy ${label}`}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function PitchStudio({ match, show, pitch, deal }: { match: MatchRow; show: ShowRow; pitch: PitchRow | null; deal: DealRow | null }) {
  const brand = match;
  const [tone, setTone] = useState<Tone>(pitch?.tone ?? "Professional");
  const [subject, setSubject] = useState(pitch?.subject ?? "");
  const [body, setBody] = useState(pitch?.body ?? "");
  const [follow, setFollow] = useState(pitch?.follow_ups ?? []);
  const [ad, setAd] = useState(pitch?.ad_read ?? "");
  const [side, setSide] = useState<SideTab>("Follow-ups");
  const [copied, setCopied] = useState(false);
  const [pitched, setPitched] = useState(!!deal);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<"idle" | "saving" | "saved">("idle");
  const [source, setSource] = useState<"ai" | "template" | null>(null);
  const [error, setError] = useState<string>();
  const first = useRef(true);

  async function draft(t: Tone) {
    setBusy(true);
    setError(undefined);
    try {
      const res = await fetch("/api/pitch", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ matchId: match.id, tone: t }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not draft the pitch.");
      setSubject(data.pitch.subject);
      setBody(data.pitch.body);
      setFollow(data.pitch.follow_ups ?? []);
      setAd(data.pitch.ad_read ?? "");
      setSource(data.source);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  // First visit: draft automatically. Later tone changes redraft.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      if (!pitch) void draft(tone);
      return;
    }
    void draft(tone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tone]);

  async function save() {
    setSaved("saving");
    const sb = supabaseBrowser();
    await sb.from("pitches").update({ subject, body, tone, updated_at: new Date().toISOString() }).eq("match_id", match.id);
    setSaved("saved");
    setTimeout(() => setSaved("idle"), 1800);
  }

  async function markPitched() {
    const sb = supabaseBrowser();
    const { data: u } = await sb.auth.getUser();
    if (!u.user) return;
    const { error: err } = await sb
      .from("deals")
      .upsert({ user_id: u.user.id, match_id: match.id, stage: "Pitched", amount: rate.low, note: `Pitched on ${new Date().toLocaleDateString()}` }, { onConflict: "match_id" });
    if (err) setError("Could not add this deal to your pipeline.");
    else setPitched(true);
  }

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const rate = rateFor(show.audience_size, brand.fit);
  const pct = (n: number) => Math.round(n * 100);

  const evidence = [
    ["Fit Score", `${brand.fit} / 100`],
    ["Taste affinity", `${pct(brand.parts.affinity)}`],
    ["Demographic match", `${pct(brand.parts.demographic)}%`],
    ["Taste overlap", `${pct(brand.parts.taste)}`],
    ["Novelty", `${pct(brand.parts.novelty)}`],
    [show.platform === "podcast" ? "Listeners per episode" : "Views per video", show.audience_size.toLocaleString("en-US")],
    ["Suggested rate", `$${rate.low.toLocaleString("en-US")} to $${rate.high.toLocaleString("en-US")}`],
  ];

  return (
    <div>
      <Link
        href={`/app/sponsors/${brand.id}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
      >
        <ArrowLeft size={15} /> Back to {brand.name}
      </Link>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <BrandMark name={brand.name} hue={hueOf(brand.name)} size={56} />
          <div>
            <p className="label mb-1">Pitch studio</p>
            <h1 className="font-display text-3xl font-semibold tracking-tight">{brand.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <FitRing score={brand.fit} size={64} stroke={6} label={false} />
          <Chip tone="mint">{source === "template" ? "Template draft" : "Grounded in Qloo data"}</Chip>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        {/* Editor */}
        <section className="surface-raised min-w-0 p-5 sm:p-6" aria-label="Email draft">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div role="radiogroup" aria-label="Tone" className="flex rounded-xl bg-eggplant-950/60 p-1">
              {TONES.map((t) => (
                <button
                  key={t}
                  role="radio"
                  aria-checked={tone === t}
                  onClick={() => setTone(t)}
                  className={cn(
                    "h-9 rounded-lg px-4 text-sm font-medium transition-colors",
                    tone === t ? "bg-violet-600 text-white" : "text-ink-muted hover:text-ink",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <p className="flex items-center gap-1.5 text-xs text-ink-faint">
              {busy ? <><Loader2 size={13} className="animate-spin" /> Writing with the agent...</> : <><Sparkles size={13} /> Switching tone writes a fresh draft</>}
            </p>
          </div>

          <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-ink-soft">Subject</label>
          <input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="h-12 w-full rounded-xl border border-white/10 bg-eggplant-900/70 px-4 text-[15px] focus:border-orchid-400/70 focus:outline-none focus:ring-2 focus:ring-orchid-400/20"
          />

          <label htmlFor="body" className="mb-1.5 mt-5 block text-sm font-medium text-ink-soft">Message</label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={17}
            disabled={busy}
            className="w-full resize-y rounded-xl border border-white/10 bg-eggplant-900/70 px-4 py-3 text-[15px] leading-relaxed focus:border-orchid-400/70 focus:outline-none focus:ring-2 focus:ring-orchid-400/20"
          />

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <Button variant="outline" onClick={copyAll}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy email"}
            </Button>
            <Button href={mailto} variant="outline">
              <Mail size={16} /> Open in email app
            </Button>
            <Button variant="outline" onClick={save} disabled={busy || saved === "saving"}>
              {saved === "saved" ? <Check size={16} /> : <Save size={16} />}
              {saved === "saved" ? "Saved" : "Save edits"}
            </Button>
            <Button onClick={markPitched} disabled={pitched || busy} className="sm:ml-auto">
              {pitched ? <Check size={16} /> : <Send size={16} />}
              {pitched ? "Marked as pitched" : "Mark as pitched"}
            </Button>
          </div>
          {error && <p role="alert" className="mt-3 text-sm text-signal-400">{error}</p>}
          {pitched && (
            <p className="mt-3 text-sm text-mint" role="status">
              Added to your pipeline. Track the reply on your{" "}
              <Link href="/app/pipeline" className="underline hover:text-ink">pipeline board</Link>.
            </p>
          )}
        </section>

        {/* Side panel */}
        <section className="surface min-w-0 self-start p-5 sm:p-6" aria-label="Pitch extras">
          <div role="tablist" aria-label="Pitch extras" className="mb-5 flex gap-1 overflow-x-auto rounded-xl bg-eggplant-950/60 p-1">
            {SIDE_TABS.map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={side === t}
                aria-controls="side-panel"
                id={`side-${t}`}
                onClick={() => setSide(t)}
                className={cn(
                  "h-9 flex-1 whitespace-nowrap rounded-lg px-3 text-sm font-medium transition-colors",
                  side === t ? "bg-white/10 text-ink" : "text-ink-muted hover:text-ink",
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <div id="side-panel" role="tabpanel" aria-labelledby={`side-${side}`} key={side} className="animate-fade-up">
            {side === "Follow-ups" && (
              <ul className="space-y-4">
                {follow.length === 0 && <p className="text-sm text-ink-muted">Drafting...</p>}
                {follow.map((f) => (
                  <li key={f.when} className="rounded-xl border border-white/[0.08] bg-eggplant-900/50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <Chip tone="violet">{f.when}</Chip>
                      <CopyBox label={f.when} text={`Subject: ${f.subject}\n\n${f.body}`} />
                    </div>
                    <p className="text-sm font-semibold">{f.subject}</p>
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-muted">{f.body}</p>
                  </li>
                ))}
              </ul>
            )}

            {side === "Ad-read script" && (
              <div className="rounded-xl border border-white/[0.08] bg-eggplant-900/50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <Chip tone="orchid">About 20 seconds</Chip>
                  <CopyBox label="ad read" text={ad} />
                </div>
                <p className="text-sm leading-relaxed text-ink-soft">{ad || "Drafting..."}</p>
                <p className="mt-3 text-xs text-ink-faint">Edit it so it sounds like you before you record.</p>
              </div>
            )}

            {side === "Evidence used" && (
              <div>
                <p className="mb-4 text-sm text-ink-muted">
                  Every figure in your pitch comes from this list, so a brand can check your claims.
                </p>
                <dl className="divide-y divide-white/[0.06] rounded-xl border border-white/[0.08] bg-eggplant-900/50">
                  {evidence.map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between px-4 py-3 text-sm">
                      <dt className="text-ink-muted">{k}</dt>
                      <dd className="font-semibold tabular-nums">{v}</dd>
                    </div>
                  ))}
                </dl>
                <Link href={`/app/sponsors/${brand.id}`} className="mt-4 inline-flex items-center gap-1.5 text-sm text-violet-300 hover:text-orchid-300">
                  Publish the media kit to attach it
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
