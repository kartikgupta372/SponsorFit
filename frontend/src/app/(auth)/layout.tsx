import type { ReactNode } from "react";
import { Logo } from "@/components/layout/Logo";
import { CoverArt } from "@/components/art/CoverArt";
import { BrandMark } from "@/components/art/BrandMark";
import { FitRing } from "@/components/charts/FitRing";
import { Chip } from "@/components/ui/Chip";
import { BRANDS } from "@/lib/mock-data";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const top = BRANDS[0];
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      {/* Left: pitch and a floating preview */}
      <aside className="relative hidden overflow-hidden border-r border-white/[0.06] bg-eggplant-900/60 lg:block">
        <div
          aria-hidden="true"
          className="absolute -left-24 top-1/3 h-96 w-96 rounded-full bg-orchid-400/20 blur-[110px]"
        />
        <div
          aria-hidden="true"
          className="absolute -right-10 bottom-0 h-96 w-96 rounded-full bg-violet-600/30 blur-[120px]"
        />
        <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
          <Logo />

          <div className="max-w-md">
            <h1 className="font-display text-4xl font-semibold leading-[1.1] xl:text-5xl">
              Pitch the brands your audience{" "}
              <span className="text-gradient">already loves.</span>
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">
              SponsorFit reads your audience through Qloo&apos;s taste graph, ranks the brands that
              fit, and drafts the pitch with the evidence attached.
            </p>
          </div>

          {/* Floating preview */}
          <div className="relative mx-auto mb-4 h-64 w-full max-w-md">
            <div className="surface-raised absolute left-0 top-0 w-60 animate-float overflow-hidden p-3">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                  <CoverArt seed={7} />
                </div>
                <div>
                  <p className="font-display text-base font-semibold">The Deep Dive</p>
                  <p className="text-xs text-ink-muted">Audience DNA ready</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Chip tone="violet">Outdoors</Chip>
                <Chip tone="orchid">Coffee culture</Chip>
                <Chip tone="signal">Road trips</Chip>
              </div>
            </div>

            <div className="surface-raised absolute bottom-0 right-0 w-72 animate-float-slow p-4 [animation-delay:1.2s]">
              <div className="flex items-center gap-4">
                <FitRing score={top.fit} size={72} stroke={7} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <BrandMark name={top.name} hue={top.hue} size={26} />
                    <p className="truncate text-sm font-semibold">{top.name}</p>
                  </div>
                  <p className="mt-2 text-xs leading-snug text-ink-muted">{top.reasons[0]}</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-ink-faint">Sample data shown. All brands and shows are fictional.</p>
        </div>
      </aside>

      {/* Right: the form */}
      <main className="flex flex-col px-6 py-8 sm:px-10">
        <div className="lg:hidden">
          <Logo />
        </div>
        <div className="mx-auto flex w-full max-w-[26rem] flex-1 flex-col justify-center py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
