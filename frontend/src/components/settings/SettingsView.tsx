"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { useAuth } from "@/lib/auth";
import { useSettings } from "@/lib/settings";

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="surface p-5 sm:p-6">
      <h2 className="font-semibold">{title}</h2>
      {desc && <p className="mt-1 text-sm text-ink-muted">{desc}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function SettingsView() {
  const { user, signOut } = useAuth();
  const { settings, update } = useSettings();
  const [draft, setDraft] = useState("");
  const [confirm, setConfirm] = useState("");

  function addSponsor() {
    const v = draft.trim();
    if (!v || settings.existingSponsors.some((s) => s.toLowerCase() === v.toLowerCase())) {
      setDraft("");
      return;
    }
    update({ ...settings, existingSponsors: [...settings.existingSponsors, v] });
    setDraft("");
  }
  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addSponsor();
    }
  }

  const safety = [
    ["alcohol", "Hide alcohol brands", "Removes spirits, beer and wine from your shortlist."],
    ["gambling", "Hide gambling brands", "Removes betting and casino brands."],
    ["adult", "Hide adult brands", "Removes brands with adult content."],
  ] as const;

  return (
    <div className="max-w-3xl space-y-6">
      <Section title="Profile">
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-ink-muted">Name</dt>
            <dd className="mt-1 font-medium">{user?.name ?? "Guest"}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-muted">Email</dt>
            <dd className="mt-1 font-medium">{user?.email ?? "Not signed in"}</dd>
          </div>
        </dl>
      </Section>

      <Section
        title="Current sponsors"
        desc="Brands in the same category as these are flagged as competitors, so you never pitch against a partner."
      >
        <ul className="flex flex-wrap gap-2" aria-label="Current sponsors">
          {settings.existingSponsors.map((s) => (
            <li key={s} className="flex items-center gap-1 rounded-full bg-violet-600/20 py-1 pl-3.5 pr-1.5 text-sm">
              {s}
              <button
                type="button"
                aria-label={`Remove ${s}`}
                onClick={() => update({ ...settings, existingSponsors: settings.existingSponsors.filter((x) => x !== s) })}
                className="flex h-6 w-6 items-center justify-center rounded-full text-ink-muted hover:bg-white/10 hover:text-ink"
              >
                <X size={13} />
              </button>
            </li>
          ))}
          {settings.existingSponsors.length === 0 && <li className="text-sm text-ink-faint">No sponsors yet.</li>}
        </ul>
        <div className="mt-4 flex gap-2">
          <label htmlFor="add-sponsor" className="sr-only">Add a sponsor</label>
          <input
            id="add-sponsor"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKey}
            placeholder="Brand name"
            className="h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-eggplant-900/70 px-4 text-sm focus:border-orchid-400/70 focus:outline-none focus:ring-2 focus:ring-orchid-400/20"
          />
          <Button variant="outline" onClick={addSponsor}>Add sponsor</Button>
        </div>
      </Section>

      <Section title="Brand safety" desc="Applied to every shortlist. Changes save as you go.">
        <div className="space-y-5">
          {safety.map(([key, label, hint]) => (
            <Switch
              key={key}
              label={label}
              hint={hint}
              checked={settings.safety[key]}
              onChange={(v) => update({ ...settings, safety: { ...settings.safety, [key]: v } })}
            />
          ))}
        </div>
      </Section>

      <Section title="Connected accounts">
        <ul className="divide-y divide-white/[0.07]">
          {[
            ["Gmail", "Send pitches and track replies from your inbox."],
            ["YouTube", "Pull your audience stats automatically."],
          ].map(([n, d]) => (
            <li key={n} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-medium">{n}</p>
                <p className="text-xs text-ink-muted">{d}</p>
              </div>
              <Chip>Coming soon</Chip>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Plan">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Free plan</p>
            <p className="text-xs text-ink-muted">3 analyses a month. Sample usage shown in the sidebar.</p>
          </div>
          <Button variant="secondary" size="sm" href="/#pricing">See plans</Button>
        </div>
      </Section>

      <section className="rounded-2xl border border-red-400/30 bg-red-500/[0.06] p-5 sm:p-6">
        <h2 className="font-semibold text-red-200">Delete account</h2>
        <p className="mt-1 text-sm text-ink-muted">
          This removes your analyses, pitches and media kits for good. Type <b className="text-ink">delete my account</b> to continue.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <label htmlFor="confirm" className="sr-only">Type delete my account</label>
          <input
            id="confirm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="h-11 flex-1 rounded-xl border border-white/10 bg-eggplant-900/70 px-4 text-sm focus:border-red-300/60 focus:outline-none focus:ring-2 focus:ring-red-300/20"
          />
          <Button
            variant="outline"
            disabled={confirm.trim().toLowerCase() !== "delete my account"}
            onClick={() => {
              try { localStorage.removeItem("sf_settings"); } catch { /* ignore */ }
              signOut();
            }}
            className="border-red-400/40 text-red-200 hover:border-red-300"
          >
            Delete account
          </Button>
        </div>
      </section>
    </div>
  );
}
