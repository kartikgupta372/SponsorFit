import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "How to use | SponsorFit" };

const STEPS = [
  {
    title: "Set your guardrails",
    where: "Settings",
    href: "/app/settings",
    body: "Switch on the categories you never want to promote (alcohol, gambling, adult) and list the brands that already sponsor you. SponsorFit hides unsafe brands and flags competitors of your current sponsors.",
  },
  {
    title: "Analyze your show",
    where: "New analysis",
    href: "/app/new",
    body: "Search for your podcast or channel, add up to five similar shows if yours is small, and enter your average audience. The agent reads your audience in Qloo's taste graph and ranks brands they already love.",
  },
  {
    title: "Read your Audience DNA",
    where: "Analyses",
    href: "/app/analyses",
    body: "See who your audience is: top tastes, age profile, where they live and episode ideas. This is the evidence you will quote in pitches.",
  },
  {
    title: "Shortlist sponsors",
    where: "Sponsors",
    href: "/app/sponsors",
    body: "Each brand has a Fit Score from 0 to 100 and the reasons behind it. Filter by category, hidden gems or safety flags, and compare against what a plain AI would have guessed without Qloo.",
  },
  {
    title: "Draft the pitch",
    where: "Pitches",
    href: "/app/pitches",
    body: "Pick a tone and get an email, two follow-ups and a host-read script built only from your real numbers. Edit anything, then copy it out.",
  },
  {
    title: "Share a media kit",
    where: "Media kits",
    href: "/app/kits",
    body: "Publish a one-page kit with the data behind the match. Send the public link with your pitch and see how many times it was opened.",
  },
  {
    title: "Track the deal",
    where: "Pipeline",
    href: "/app/pipeline",
    body: "Mark a pitch as sent and move it through Pitched, Replied, Negotiating, Won or Lost. Add the amount and a note so you know what you earned.",
  },
];

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Guide"
        title="How to use SponsorFit"
        subtitle="Seven steps from your first analysis to a signed sponsor. Go in order the first time."
        actions={<Button href="/app/new">Start an analysis</Button>}
      />
      <ol className="space-y-4">
        {STEPS.map((s, i) => (
          <li key={s.title} className="surface flex gap-4 p-5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-semibold">{i + 1}</span>
            <div>
              <h2 className="font-semibold">{s.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">{s.body}</p>
              <Link href={s.href} className="mt-2 inline-block text-sm text-orchid-300 hover:underline">
                Open {s.where}
              </Link>
            </div>
          </li>
        ))}
      </ol>
      <section className="surface mt-8 p-5">
        <h2 className="font-semibold">Good to know</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-muted">
          <li>The Fit Score blends audience affinity (45%), age match (25%), shared tastes (20%) and novelty (10%).</li>
          <li>A banner says &quot;Sample data&quot; when the live Qloo key is not set. Results are then illustrative.</li>
          <li>Every figure in a pitch comes from your analysis. If the AI writes a number it was not given, the draft is replaced by a template.</li>
          <li>You can run up to 15 analyses a day. Settings has a button to delete all your data.</li>
        </ul>
      </section>
    </div>
  );
}
