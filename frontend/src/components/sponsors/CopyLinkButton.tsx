"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, FileDown, Loader2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * Publish / share controls for a brand's media kit.
 * The kit is published on first use: a frozen snapshot at /kit/<slug>.
 */
export function KitShare({ matchId, initialSlug }: { matchId: string; initialSlug: string | null }) {
  const [slug, setSlug] = useState(initialSlug);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string>();

  async function publish(): Promise<string | null> {
    if (slug) return slug;
    setBusy(true);
    setError(undefined);
    try {
      const res = await fetch("/api/kits", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ matchId }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not publish the kit.");
      setSlug(data.slug);
      return data.slug as string;
    } catch (e) {
      setError((e as Error).message);
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    const s = await publish();
    if (!s) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/kit/${s}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: "Open public kit" still works */
    }
  }

  async function open(print: boolean) {
    const w = window.open("about:blank", "_blank");
    const s = await publish();
    if (s && w) w.location.href = `/kit/${s}${print ? "?print=1" : ""}`;
    else w?.close();
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {!slug && (
          <Button onClick={() => void publish()} disabled={busy}>
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />} Publish media kit
          </Button>
        )}
        <Button variant="outline" onClick={copy} disabled={busy}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? "Link copied" : "Copy share link"}
        </Button>
        <Button variant="outline" onClick={() => void open(true)} disabled={busy}>
          <FileDown size={16} /> Export PDF
        </Button>
        <Button variant="ghost" onClick={() => void open(false)} disabled={busy}>
          <ExternalLink size={16} /> Open public kit
        </Button>
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-signal-400">{error}</p>}
    </div>
  );
}
