"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ChevronDown,
  FileText,
  Gem,
  KanbanSquare,
  LayoutDashboard,
  LogOut,
  Mail,
  Plus,
  Radar,
  Settings,
  Check,
  Mic,
  Play,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/Button";
import { CoverArt } from "@/components/art/CoverArt";
import { useAuth } from "@/lib/auth";
import { DEFAULT_SHOW_ID, SHOWS, getShow } from "@/lib/mock-data";
import { cn } from "@/lib/cn";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  match: (path: string) => boolean;
  mobile?: boolean;
}

const NAV: NavItem[] = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard, match: (p) => p === "/app", mobile: true },
  { href: "/app/analyses", label: "Analyses", icon: Radar, match: (p) => p.startsWith("/app/analyses") || p.startsWith("/app/runs") || p === "/app/new" || (p.startsWith("/app/shows") && !p.endsWith("/sponsors")), mobile: true },
  { href: `/app/shows/${DEFAULT_SHOW_ID}/sponsors`, label: "Sponsors", icon: Gem, match: (p) => p.endsWith("/sponsors") || p.startsWith("/app/sponsors"), mobile: true },
  { href: "/app/pitches", label: "Pitches", icon: Mail, match: (p) => p.startsWith("/app/pitches") },
  { href: "/app/pipeline", label: "Pipeline", icon: KanbanSquare, match: (p) => p.startsWith("/app/pipeline"), mobile: true },
  { href: "/app/kits", label: "Media kits", icon: FileText, match: (p) => p.startsWith("/app/kits") },
  { href: "/app/settings", label: "Settings", icon: Settings, match: (p) => p.startsWith("/app/settings"), mobile: true },
];

/** Closes a popover on outside click or Escape. */
function usePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return { open, setOpen, ref };
}

function ShowSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const { open, setOpen, ref } = usePopover();
  const idFromPath = pathname.match(/^\/app\/(?:shows|runs)\/([^/]+)/)?.[1];
  const current = getShow(idFromPath ?? DEFAULT_SHOW_ID);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-11 items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] pl-1.5 pr-3 transition-colors hover:border-white/25"
      >
        <span className="h-8 w-8 overflow-hidden rounded-lg">
          <CoverArt seed={current.seed} />
        </span>
        <span className="hidden max-w-[10rem] truncate text-sm font-medium sm:block">{current.name}</span>
        <ChevronDown size={16} className="text-ink-muted" />
      </button>
      {open && (
        <ul
          role="listbox"
          className="surface-raised absolute left-0 top-[calc(100%+8px)] z-50 w-72 overflow-hidden p-1.5"
        >
          {SHOWS.map((s) => (
            <li key={s.id} role="option" aria-selected={s.id === current.id}>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.push(`/app/shows/${s.id}`);
                }}
                className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-white/[0.07]"
              >
                <span className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                  <CoverArt seed={s.seed} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{s.name}</span>
                  <span className="flex items-center gap-1 text-xs text-ink-muted">
                    {s.platform === "podcast" ? <Mic size={11} /> : <Play size={11} />}
                    {s.platform === "podcast" ? "Podcast" : "YouTube"}
                  </span>
                </span>
                {s.id === current.id && <Check size={16} className="text-orchid-300" />}
              </button>
            </li>
          ))}
          <li className="mt-1 border-t border-white/10 pt-1">
            <Link
              href="/app/new"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-xl p-2.5 text-sm text-ink-soft hover:bg-white/[0.07] hover:text-ink"
            >
              <Plus size={16} /> Add another show
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
}

function UserMenu() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { open, setOpen, ref } = usePopover();
  const initial = (user?.name ?? "?").charAt(0).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-orchid-400 font-display text-lg font-semibold text-white"
      >
        {initial}
      </button>
      {open && (
        <div role="menu" className="surface-raised absolute right-0 top-[calc(100%+8px)] z-50 w-64 p-2">
          <div className="border-b border-white/10 px-3 pb-3 pt-2">
            <p className="truncate text-sm font-semibold">{user?.name}</p>
            <p className="truncate text-xs text-ink-muted">{user?.email}</p>
          </div>
          <Link
            href="/app/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="mt-1 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-ink-soft hover:bg-white/[0.07] hover:text-ink"
          >
            <Settings size={16} /> Settings
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              signOut();
              router.replace("/");
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-ink-soft hover:bg-white/[0.07] hover:text-ink"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready } = useAuth();

  // Belt and braces: the middleware already redirects, this covers a cleared cookie mid-session.
  useEffect(() => {
    if (ready && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [ready, user, router, pathname]);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-white/[0.06] bg-eggplant-900/70 p-5 lg:flex">
        <Logo href="/app" />
        <nav aria-label="Workspace" className="mt-9 flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-gradient-to-r from-violet-600/35 to-orchid-400/15 text-ink shadow-[inset_0_0_0_1px_rgba(239,127,216,0.25)]"
                    : "text-ink-muted hover:bg-white/[0.06] hover:text-ink",
                )}
              >
                <item.icon size={18} className={active ? "text-orchid-300" : ""} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="surface p-4">
          <p className="text-sm font-semibold">2 of 3 free runs left today</p>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-violet-500 via-orchid-400 to-signal-500" />
          </div>
          <Link href="/#pricing" className="mt-3 inline-block text-xs font-semibold text-orchid-300 hover:text-orchid-200">
            See plans
          </Link>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-col pb-20 lg:pb-0">
        <header className="sticky top-0 z-30 flex h-[4.5rem] items-center justify-between gap-3 border-b border-white/[0.06] bg-eggplant-950/80 px-4 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <Logo href="/app" size={26} className="[&>span]:hidden" />
            </div>
            <ShowSwitcher />
          </div>
          <div className="flex items-center gap-3">
            <Button href="/app/new" size="md">
              <Plus size={17} />
              <span className="hidden sm:inline">New analysis</span>
              <span className="sm:hidden">New</span>
            </Button>
            <UserMenu />
          </div>
        </header>

        <main className="mx-auto w-full max-w-[84rem] flex-1 px-4 py-8 sm:px-8 sm:py-10">{children}</main>
      </div>

      {/* Mobile tab bar */}
      <nav
        aria-label="Workspace"
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-white/10 bg-eggplant-900/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
      >
        {NAV.filter((n) => n.mobile).map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-16 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium",
                active ? "text-orchid-300" : "text-ink-muted",
              )}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
