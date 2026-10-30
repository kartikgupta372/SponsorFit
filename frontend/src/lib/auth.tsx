"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User as SbUser } from "@supabase/supabase-js";
import { supabaseBrowser } from "./supabase/client";

/**
 * Auth for the whole app, backed by Supabase Auth.
 * Screens only see this small API, so the provider could change without
 * touching them.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  provider: "email" | "demo";
}

interface AuthApi {
  user: User | null;
  ready: boolean;
  /** Returns true when the account still needs email confirmation. */
  signUp: (name: string, email: string, password: string) => Promise<{ needsConfirm: boolean }>;
  signIn: (email: string, password: string) => Promise<void>;
  signInDemo: () => Promise<void>;
  signOut: () => Promise<void>;
  requestReset: (email: string) => Promise<void>;
  resetPassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthApi | null>(null);

/** Public demo login (its data is sample-only and protected by RLS like any account). */
const DEMO_EMAIL = "demo@sponsorfit.app";
const DEMO_PASSWORD = "SponsorFit-demo-2026";

function toUser(u: SbUser | null | undefined): User | null {
  if (!u) return null;
  const email = u.email ?? "";
  const meta = (u.user_metadata ?? {}) as { name?: string };
  const fallback = email ? email.split("@")[0].replace(/[._-]+/g, " ") : "Demo creator";
  const name = meta.name || fallback.charAt(0).toUpperCase() + fallback.slice(1);
  return { id: u.id, name, email: email || "Demo workspace", provider: u.is_anonymous || email === DEMO_EMAIL ? "demo" : "email" };
}

/** Turn Supabase's messages into ones that say what to do next. */
function friendly(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "That email and password don't match. Check them, or reset your password.";
  if (m.includes("already registered")) return "An account with this email already exists. Log in instead.";
  if (m.includes("email not confirmed")) return "Confirm your email first. Check your inbox for the link.";
  if (m.includes("anonymous sign-ins are disabled")) return "The demo is switched off right now. Create a free account instead.";
  if (m.includes("rate limit")) return "Too many attempts. Wait a minute, then try again.";
  if (m.includes("password")) return message;
  return "Something went wrong on our side. Try again in a moment.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const sb = useMemo(() => supabaseBrowser(), []);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    sb.auth.getUser().then(({ data }) => {
      setUser(toUser(data.user));
      setReady(true);
    });
    const { data } = sb.auth.onAuthStateChange((_e, session) => setUser(toUser(session?.user)));
    return () => data.subscription.unsubscribe();
  }, [sb]);

  const fail = (e: { message: string } | null) => {
    if (e) throw new Error(friendly(e.message));
  };

  const signOut = useCallback(async () => {
    await sb.auth.signOut();
    setUser(null);
    window.location.href = "/";
  }, [sb]);

  const api = useMemo<AuthApi>(
    () => ({
      user,
      ready,
      async signUp(name, email, password) {
        const { data, error } = await sb.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { name: name.trim() }, emailRedirectTo: `${window.location.origin}/app` },
        });
        fail(error);
        return { needsConfirm: !data.session };
      },
      async signIn(email, password) {
        const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
        fail(error);
      },
      async signInDemo() {
        const { data } = await sb.auth.getUser();
        if (data.user) return;
        // Preferred: a private anonymous workspace per visitor.
        const anon = await sb.auth.signInAnonymously({ options: { data: { name: "Demo creator" } } });
        if (!anon.error) return;
        // Fallback when anonymous sign-ins are off: the shared, pre-confirmed demo account.
        const { error } = await sb.auth.signInWithPassword({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
        fail(error);
      },
      signOut,
      async requestReset(email) {
        const { error } = await sb.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        fail(error);
      },
      async resetPassword(password) {
        const { error } = await sb.auth.updateUser({ password });
        fail(error);
      },
    }),
    [user, ready, sb, signOut],
  );

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthApi {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
