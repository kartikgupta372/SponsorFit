"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { validateEmail, validateName, validatePassword } from "@/lib/validate";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export default function SignupPage() {
  const { signUp } = useAuth();
  const [sent, setSent] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ name: false, email: false, password: false });
  const [busy, setBusy] = useState<"form" | null>(null);
  const [formError, setFormError] = useState<string>();

  const nameError = touched.name ? validateName(name) : undefined;
  const emailError = touched.email ? validateEmail(email) : undefined;
  const passwordError = touched.password ? validatePassword(password) : undefined;

  async function run() {
    setBusy("form");
    setFormError(undefined);
    try {
      const { needsConfirm } = await signUp(name, email, password);
      if (needsConfirm) {
        setSent(true);
        setBusy(null);
        return;
      }
      // New accounts start by adding their first show.
      window.location.assign("/app/new");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "We could not create your account. Try again.");
      setBusy(null);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });
    if (validateName(name) || validateEmail(email) || validatePassword(password)) return;
    void run();
  }

  return (
    <div className="animate-fade-up">
      <h2 className="font-display text-4xl font-semibold">Create your account</h2>
      <p className="mt-2 text-ink-muted">Free to start. Your first analysis takes about a minute.</p>

      {sent && (
        <p role="status" className="mt-6 rounded-xl border border-mint/40 bg-mint/10 px-4 py-3 text-sm text-mint">
          Check {email} for a confirmation link, then log in.
        </p>
      )}

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
        <Field
          label="Your name"
          autoComplete="name"
          placeholder="Jordan Reyes"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          error={nameError}
        />
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
        <Field
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          hint="Use 8 or more characters."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          error={passwordError}
        />

        {formError && (
          <p role="alert" className="rounded-xl border border-signal-500/40 bg-signal-500/10 px-4 py-3 text-sm text-signal-400">
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={busy !== null}>
          {busy === "form" ? <Loader2 className="animate-spin" size={18} /> : null}
          Create account
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-ink-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-violet-300 hover:text-orchid-300">
          Log in
        </Link>
      </p>
    </div>
  );
}
