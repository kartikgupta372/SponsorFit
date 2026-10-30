"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { validateEmail } from "@/lib/validate";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const { requestReset } = useAuth();
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const error = touched ? validateEmail(email) : undefined;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (validateEmail(email)) return;
    setBusy(true);
    // Same message whether or not the account exists, so emails can't be probed.
    await requestReset(email).catch(() => undefined);
    setBusy(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="animate-fade-up text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-mint/10 text-mint">
          <MailCheck size={30} />
        </div>
        <h2 className="mt-6 font-display text-3xl font-semibold">Check your inbox</h2>
        <p className="mt-3 text-ink-muted">
          If an account exists for <span className="text-ink">{email}</span>, a reset link is on its
          way. It can take a minute to arrive.
        </p>
        <div className="mt-8 space-y-3">
          <Button href="/reset-password" variant="outline" className="w-full">
            I have the link
          </Button>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="text-sm text-violet-300 hover:text-orchid-300"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <Link
        href="/login"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
      >
        <ArrowLeft size={15} /> Back to log in
      </Link>
      <h2 className="font-display text-4xl font-semibold">Reset your password</h2>
      <p className="mt-2 text-ink-muted">
        Enter the email you signed up with and we will send you a link to choose a new password.
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched(true)}
          error={error}
        />
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? <Loader2 className="animate-spin" size={18} /> : null}
          Send reset link
        </Button>
      </form>
    </div>
  );
}
