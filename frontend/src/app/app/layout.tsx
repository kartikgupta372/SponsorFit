import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { loadShows, session } from "@/lib/server/data";
import { DAILY_LIMIT } from "@/lib/model";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
  const { sb } = await session();
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const [shows, { count }] = await Promise.all([
    loadShows(),
    sb.from("analyses").select("id", { count: "exact", head: true }).gte("created_at", since),
  ]);
  return (
    <AppShell
      shows={shows.map((s) => ({ analysisId: s.analysisId, name: s.show.name, platform: s.show.platform, status: s.status }))}
      used={count ?? 0}
      limit={DAILY_LIMIT}
    >
      {children}
    </AppShell>
  );
}
