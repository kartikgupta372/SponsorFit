"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { validatePassword } from "@/lib/validate";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touched, setTouched] = useState({ password: false, confirm: false });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const passwordError = touched.password ? validatePassword(password) : undefined;
  const confirmError =
    touched.confirm && confirm !== password ? "These two passwords do not match yet." : undefined;

  const [failed, setFailed] = useState<string>();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched({ password: true, confirm: true });
    if (validatePassword(password) || confirm !== password) return;
    setBusy(true);
    try {
      await resetPassword(password);
      setDone(true);
    } catch (err) {
      setFailed(err instanceof Error ? err.message : "This reset link has expired. Request a new one.");
    }
    setBusy(false);
  }

  if (done) {
    return (
      <div className="animate-fade-up text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-mint/10 text-mint">
          <CheckCircle2 size={30} />
        </div>
        <h2 className="mt-6 font-display text-3xl font-semibold">Password updated</h2>
        <p className="mt-3 text-ink-muted">You can log in with your new password now.</p>
        <Button href="/login" size="lg" className="mt-8 w-full">
          Log in
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <h2 className="font-display text-4xl font-semibold">Choose a new password</h2>
      <p className="mt-2 text-ink-muted">Pick something you have not used on SponsorFit before.</p>

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
        <Field
          label="New password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          error={passwordError}
        />
        <Field
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          placeholder="Type it once more"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
          error={confirmError}
        />
        {failed && (
          <p role="alert" className="rounded-xl border border-signal-500/40 bg-signal-500/10 px-4 py-3 text-sm text-signal-400">
            {failed} <a href="/forgot-password" className="underline">Request a new link</a>
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? <Loader2 className="animate-spin" size={18} /> : null}
          Update password
        </Button>
      </form>
    </div>
  );
}
