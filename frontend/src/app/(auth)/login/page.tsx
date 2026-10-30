"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { validateEmail, validatePassword } from "@/lib/validate";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { OrDivider } from "@/components/ui/GoogleButton";

export default function LoginPage() {
  const { signIn, signInDemo } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });
  const [busy, setBusy] = useState<"form" | "demo" | null>(null);
  const [formError, setFormError] = useState<string>();

  // Errors are computed from the current values, so they clear the instant the input is valid.
  const emailError = touched.email ? validateEmail(email) : undefined;
  const passwordError = touched.password ? validatePassword(password) : undefined;

  function destination() {
    const next = new URLSearchParams(window.location.search).get("next");
    return next && next.startsWith("/app") ? next : "/app";
  }

  async function run(kind: "form" | "demo", action: () => Promise<void>) {
    setBusy(kind);
    setFormError(undefined);
    try {
      await action();
      window.location.assign(destination());
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "We could not sign you in. Try again.");
      setBusy(null);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (validateEmail(email) || validatePassword(password)) return;
    void run("form", () => signIn(email, password));
  }

  return (
    <div className="animate-fade-up">
      <h2 className="font-display text-4xl font-semibold">Welcome back</h2>
      <p className="mt-2 text-ink-muted">Log in to see your sponsors and pipeline.</p>

      <div className="mt-8">
        <Button variant="secondary" size="lg" className="w-full" onClick={() => run("demo", signInDemo)} disabled={busy !== null}>
          {busy === "demo" ? <Loader2 className="animate-spin" size={18} /> : null}
          Try the demo, no account needed <ArrowRight size={17} />
        </Button>
      </div>
      <OrDivider />

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          error={emailError}
        />
        <div>
          <Field
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            error={passwordError}
          />
          <div className="mt-2 text-right">
            <Link href="/forgot-password" className="text-sm text-violet-300 hover:text-orchid-300">
              Forgot your password?
            </Link>
          </div>
        </div>

        {formError && (
          <p role="alert" className="rounded-xl border border-signal-500/40 bg-signal-500/10 px-4 py-3 text-sm text-signal-400">
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={busy !== null}>
          {busy === "form" ? <Loader2 className="animate-spin" size={18} /> : null}
          Log in
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-ink-muted">
        New to SponsorFit?{" "}
        <Link href="/signup" className="font-semibold text-violet-300 hover:text-orchid-300">
          Create an account
        </Link>
      </p>
    </div>
  );
}
