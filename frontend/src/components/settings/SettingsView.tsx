"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { useAuth } from "@/lib/auth";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { ProfileRow } from "@/lib/model";

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="surface p-5 sm:p-6">
      <h2 className="font-semibold">{title}</h2>
      {desc && <p className="mt-1 text-sm text-ink-muted">{desc}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

interface Settings {
  safety: ProfileRow["safety"];
  existingSponsors: string[];
}

export function SettingsView({ profile }: { profile: ProfileRow }) {
  const { user, signOut } = useAuth();
  const [settings, setSettings] = useState<Settings>({ safety: profile.safety, existingSponsors: profile.existing_sponsors });
  const [status, setStatus] = useState<string>();
  async function update(next: Settings) {
    setSettings(next);
    const { error } = await supabaseBrowser()
      .from("profiles")
      .update({ safety: next.safety, existing_sponsors: next.existingSponsors })
      .eq("id", profile.id);
    setStatus(error ? "Could not save. Check your connection." : "Saved");
    setTimeout(() => setStatus(undefined), 1600);
  }
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
        desc="The agent flags brands that compete with these and skips the sponsors themselves. Applies to your next analysis."
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

      <Section title="Brand safety" desc={status ?? "Applied to every shortlist. Changes save as you go."}>
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
            ["Spotify for Podcasters", "Import listener counts per episode."],
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
            <p className="text-xs text-ink-muted">15 analyses a day during the hackathon. Usage is shown in the sidebar.</p>
          </div>
          <Button variant="secondary" size="sm" href="/#pricing">See plans</Button>
        </div>
      </Section>

      <section className="rounded-2xl border border-red-400/30 bg-red-500/[0.06] p-5 sm:p-6">
        <h2 className="font-semibold text-red-200">Delete my data</h2>
        <p className="mt-1 text-sm text-ink-muted">
          This deletes your shows, analyses, pitches, deals and media kits for good, then signs you out. Type <b className="text-ink">delete my account</b> to continue.
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
            onClick={async () => {
              const sb = supabaseBrowser();
              // RLS lets users delete their own rows; deleting shows cascades to analyses, matches, pitches, deals and kits.
              await sb.from("shows").delete().eq("user_id", profile.id);
              await sb.from("profiles").update({ existing_sponsors: [], display_name: null }).eq("id", profile.id);
              await signOut();
            }}
            className="border-red-400/40 text-red-200 hover:border-red-300"
          >
            Delete everything
          </Button>
        </div>
      </section>
    </div>
  );
}
