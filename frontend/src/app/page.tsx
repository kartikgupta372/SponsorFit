import Link from "next/link";
import {
  BadgeCheck,
  BarChart3,
  Check,
  Gem,
  KanbanSquare,
  Mail,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Reveal } from "@/components/ui/Reveal";
import { BrandMark } from "@/components/art/BrandMark";
import { FitRing } from "@/components/charts/FitRing";
import { HeroSearch } from "@/components/landing/HeroSearch";
import { HeroVisual } from "@/components/landing/HeroVisual";
import { AGENT_STEPS, BRANDS, THEMES } from "@/lib/mock-data";
import { cn } from "@/lib/cn";

const GENERIC = [
  "A famous VPN service",
  "A giant meal-kit company",
  "An online mattress brand",
  "A language-learning app",
  "A website builder",
];

const STEPS = [
  { icon: Search, title: "Find your show", text: "Search your podcast or YouTube channel. No match? Add a few shows like yours instead." },
  { icon: Users, title: "Read your audience", text: "Qloo's taste graph reveals who listens, what else they love, and where they live." },
  { icon: BarChart3, title: "Rank the brands", text: "Every brand gets a Fit Score you can see inside: affinity, demographics, taste, novelty." },
  { icon: Mail, title: "Send the pitch", text: "A media kit and a ready-to-send email, written only from the evidence." },
];

const FEATURES = [
  { icon: Users, title: "Audience DNA", text: "Age, gender, shared tastes in music, film, dining and travel, plus a heatmap of where your audience lives." },
  { icon: BadgeCheck, title: "A Fit Score you can explain", text: "Four visible parts, computed with plain maths, not an AI guess. Every number has a reason." },
  { icon: Gem, title: "Hidden gems", text: "Brands your audience loves that nobody else is pitching. Less competition, better deals." },
  { icon: Sparkles, title: "Media kits in a click", text: "A one-page, shareable kit for each brand with the proof built in. Export to PDF." },
  { icon: Mail, title: "Pitch studio", text: "Three tones, timed follow-ups and a host-read ad script, all grounded in your data." },
  { icon: KanbanSquare, title: "Deal pipeline", text: "Track every pitch from sent to signed so nothing slips through." },
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    note: "Try it on your own show",
    items: ["Audience DNA", "Top 5 brands", "1 media kit a month"],
    cta: "Start free",
    featured: false,
  },
  {
    name: "Creator",
    price: "$19",
    note: "per month",
    items: ["Full sponsor shortlist", "Unlimited kits and pitches", "Deal pipeline", "Rate advisor"],
    cta: "Choose Creator",
    featured: true,
  },
  {
    name: "Pro",
    price: "$99",
    note: "per month",
    items: ["Multiple shows", "Agency roster mode", "White-label kits", "Send from Gmail"],
    cta: "Choose Pro",
    featured: false,
  },
];

export default function LandingPage() {
  const ranked = BRANDS.filter((b) => !b.safety).slice(0, 5);

  return (
    <div className="overflow-x-clip">
      {/* ---------- Nav ---------- */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-eggplant-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Logo />
          <nav aria-label="Main" className="hidden items-center gap-8 text-sm text-ink-soft md:flex">
            <a href="#how" className="hover:text-ink">How it works</a>
            <a href="#compare" className="hover:text-ink">Why Qloo</a>
            <a href="#features" className="hover:text-ink">Features</a>
            <a href="#pricing" className="hover:text-ink">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button href="/login" variant="ghost" size="sm">Log in</Button>
            <Button href="/signup" size="sm">Get started</Button>
          </div>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:pt-20">
        <div className="animate-fade-up">
          <Chip tone="orchid" icon={<Sparkles size={13} />}>
            Powered by Qloo&apos;s taste graph
          </Chip>
          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.04] tracking-tight sm:text-6xl xl:text-7xl">
            Find the brands your audience <span className="text-gradient">already loves.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
            Sponsors buy customers, not download counts. SponsorFit shows exactly which brands your
            listeners and viewers over-index on, proves it with data, and drafts the pitch that
            lands the deal.
          </p>
          <div className="mt-9 max-w-2xl">
            <HeroSearch />
          </div>
          <p className="mt-5 text-xs text-ink-faint">
            No sign-up needed to try the demo. Sample data, fictional brands.
          </p>
        </div>
        <Reveal delay={150}>
          <HeroVisual />
        </Reveal>
      </section>

      {/* ---------- Themes marquee ---------- */}
      <div
        aria-hidden="true"
        className="border-y border-white/[0.06] bg-eggplant-900/40 py-4 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]"
      >
        <div className="flex w-max animate-marquee gap-3">
          {[...THEMES, ...THEMES].map((t, i) => (
            <span
              key={i}
              className="rounded-full border border-white/10 px-4 py-1.5 text-sm text-ink-muted"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ---------- Why Qloo ---------- */}
      <section id="compare" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-24 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="label">Why taste data matters</p>
          <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
            An AI alone suggests the same famous brands to everyone.
          </h2>
          <p className="mt-4 text-lg text-ink-soft">
            Qloo knows what a specific audience actually loves. That is the difference between a
            generic list and a pitch a brand takes seriously.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="surface h-full p-7">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-semibold text-ink-soft">AI guess alone</h3>
                <Chip>No audience data</Chip>
              </div>
              <ul className="mt-6 space-y-3">
                {GENERIC.map((g) => (
                  <li
                    key={g}
                    className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-eggplant-900/50 px-4 py-3.5 text-ink-muted"
                  >
                    <X size={16} className="shrink-0 text-ink-faint" />
                    {g}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-sm text-ink-muted">
                Brands that sponsor everyone, with no proof they fit your listeners.
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="surface-raised relative h-full overflow-hidden border-orchid-400/30 p-7">
              <div
                aria-hidden="true"
                className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-orchid-400/20 blur-[70px]"
              />
              <div className="relative flex items-center justify-between">
                <h3 className="font-display text-xl font-semibold">SponsorFit with Qloo</h3>
                <Chip tone="orchid">Grounded in taste data</Chip>
              </div>
              <ul className="relative mt-6 space-y-3">
                {ranked.map((b) => (
                  <li
                    key={b.id}
                    className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-eggplant-900/70 px-3 py-2.5"
                  >
                    <BrandMark name={b.name} hue={b.hue} size={38} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{b.name}</p>
                      <p className="truncate text-xs text-ink-muted">{b.reasons[0]}</p>
                    </div>
                    {b.hiddenGem && <Chip tone="signal" icon={<Gem size={11} />}>Gem</Chip>}
                    <FitRing score={b.fit} size={44} stroke={5} label={false} />
                  </li>
                ))}
              </ul>
              <p className="relative mt-5 flex items-center gap-2 text-sm text-ink-soft">
                <Check size={16} className="text-mint" />
                Ranked by a Fit Score with the evidence behind every number.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section id="how" className="scroll-mt-20 border-y border-white/[0.06] bg-eggplant-900/40">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <Reveal>
            <p className="label">How it works</p>
            <h2 className="mt-3 max-w-xl font-display text-4xl font-semibold sm:text-5xl">
              From show name to signed deal in four steps.
            </h2>
          </Reveal>
          <ol className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 90}>
                <li className="surface relative h-full p-6">
                  <span className="font-display text-5xl font-semibold text-white/[0.07]">
                    {i + 1}
                  </span>
                  <span className="mt-2 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-orchid-400 text-white">
                    <s.icon size={21} />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{s.text}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Agent trace teaser ---------- */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-24 sm:px-8 lg:grid-cols-2">
        <Reveal>
          <p className="label">An agent you can watch</p>
          <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
            Every step of the analysis is visible.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            Seven steps, each one showing the exact Qloo calls it makes. No black box: you see what
            was asked, what came back, and how the ranking was built.
          </p>
          <div className="mt-8">
            <Button href="/signup" size="lg">Run your first analysis</Button>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="surface p-6">
            <ol className="space-y-4">
              {AGENT_STEPS.map((step, i) => (
                <li key={step.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                        i < 4
                          ? "bg-mint/15 text-mint"
                          : "border border-white/15 text-ink-faint",
                      )}
                    >
                      {i < 4 ? <Check size={14} /> : i + 1}
                    </span>
                    {i < AGENT_STEPS.length - 1 && <span className="mt-1 h-full w-px bg-white/10" />}
                  </div>
                  <div className="pb-1">
                    <p className="text-sm font-semibold">{step.title}</p>
                    <p className="text-xs text-ink-muted">{step.detail}</p>
                    {i < 3 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {step.calls.slice(0, 3).map((c) => (
                          <Chip key={c} tone="violet" icon={<Check size={10} />}>{c}</Chip>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </section>

      {/* ---------- Features ---------- */}
      <section id="features" className="scroll-mt-20 border-t border-white/[0.06] bg-eggplant-900/40">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <Reveal className="max-w-2xl">
            <p className="label">Everything in one place</p>
            <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
              Built for creators who want to get paid.
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 90}>
                <div className="surface group h-full p-6 transition-colors hover:border-orchid-400/40">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300 transition-colors group-hover:bg-orchid-400/20 group-hover:text-orchid-300">
                    <f.icon size={21} />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{f.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Pricing ---------- */}
      <section id="pricing" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-24 sm:px-8">
        <Reveal className="mx-auto max-w-xl text-center">
          <p className="label">Pricing</p>
          <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">Start free. Grow when you do.</h2>
        </Reveal>
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {PLANS.map((p, i) => (
            <Reveal key={p.name} delay={i * 90}>
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-2xl border p-7",
                  p.featured
                    ? "border-orchid-400/50 bg-eggplant-800/80 shadow-glow"
                    : "border-white/[0.08] bg-eggplant-850/80",
                )}
              >
                {p.featured && (
                  <span className="absolute -top-3 left-7 rounded-full bg-signal-500 px-3 py-1 text-xs font-bold text-eggplant-950">
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="mt-4 flex items-baseline gap-2">
                  <span className="font-display text-5xl font-semibold">{p.price}</span>
                  <span className="text-sm text-ink-muted">{p.note}</span>
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {p.items.map((it) => (
                    <li key={it} className="flex items-center gap-2.5 text-sm text-ink-soft">
                      <Check size={16} className="shrink-0 text-orchid-300" />
                      {it}
                    </li>
                  ))}
                </ul>
                <Button
                  href="/signup"
                  variant={p.featured ? "primary" : "outline"}
                  className="mt-8 w-full"
                >
                  {p.cta}
                </Button>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-ink-faint">
          Prices are proposals to be validated with real creators.
        </p>
      </section>

      {/* ---------- Final CTA ---------- */}
      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-700 via-eggplant-800 to-eggplant-900 px-8 py-16 text-center sm:px-16">
            <div
              aria-hidden="true"
              className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-orchid-400/30 blur-[90px]"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-signal-500/25 blur-[100px]"
            />
            <h2 className="relative mx-auto max-w-2xl font-display text-4xl font-semibold sm:text-5xl">
              Your audience already knows the brands. Now so do you.
            </h2>
            <div className="relative mt-9 flex flex-wrap justify-center gap-3">
              <Button href="/signup" size="lg">Create your free account</Button>
              <Button href="/login" size="lg" variant="outline">Explore the demo</Button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-ink-muted sm:flex-row sm:px-8">
          <Logo size={24} />
          <p>Built for the Qloo Agentic Hackathon. Sample data, fictional brands.</p>
          <div className="flex gap-5">
            <Link href="/login" className="hover:text-ink">Log in</Link>
            <Link href="/signup" className="hover:text-ink">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
