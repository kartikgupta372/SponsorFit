import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo />
      <h1 className="font-display text-5xl font-semibold">This page wandered off.</h1>
      <p className="max-w-md text-ink-muted">
        The link may be old or mistyped. Head back and we will get you to the right place.
      </p>
      <div className="flex gap-3">
        <Button href="/">Go home</Button>
        <Button href="/app" variant="outline">Open dashboard</Button>
      </div>
    </main>
  );
}
