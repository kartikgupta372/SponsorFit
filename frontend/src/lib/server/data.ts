import "server-only";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import type { AnalysisRow, DealRow, KitRow, MatchRow, PitchRow, ProfileRow, ShowRow } from "@/lib/model";

/** Server-side loaders. Every query runs as the signed-in user, so RLS scopes it. */

export async function session() {
  const { sb, user } = await requireUser();
  if (!user) redirect("/login");
  return { sb, user };
}

export async function loadAnalysis(id: string) {
  const { sb } = await session();
  const { data: analysis } = await sb.from("analyses").select("*").eq("id", id).maybeSingle();
  if (!analysis) notFound();
  const { data: show } = await sb.from("shows").select("*").eq("id", analysis.show_id).single();
  const { data: matches } = await sb.from("matches").select("*").eq("analysis_id", id).order("rank");
  return { analysis: analysis as AnalysisRow, show: show as ShowRow, matches: (matches ?? []) as MatchRow[] };
}

export async function loadMatch(id: string) {
  const { sb } = await session();
  const { data: match } = await sb.from("matches").select("*").eq("id", id).maybeSingle();
  if (!match) notFound();
  const { data: analysis } = await sb.from("analyses").select("*").eq("id", match.analysis_id).single();
  const { data: show } = await sb.from("shows").select("*").eq("id", analysis!.show_id).single();
  const [{ data: pitch }, { data: deal }, { data: kit }] = await Promise.all([
    sb.from("pitches").select("*").eq("match_id", id).maybeSingle(),
    sb.from("deals").select("*").eq("match_id", id).maybeSingle(),
    sb.from("kits").select("*").eq("match_id", id).maybeSingle(),
  ]);
  return {
    match: match as MatchRow,
    analysis: analysis as AnalysisRow,
    show: show as ShowRow,
    pitch: (pitch ?? null) as PitchRow | null,
    deal: (deal ?? null) as DealRow | null,
    kit: (kit ?? null) as KitRow | null,
  };
}

export async function loadProfile(): Promise<ProfileRow> {
  const { sb, user } = await session();
  const { data } = await sb.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return (
    (data as ProfileRow) ?? {
      id: user.id,
      display_name: null,
      safety: { alcohol: true, gambling: true, adult: true },
      existing_sponsors: [],
    }
  );
}

/** Latest analysis per show, newest first. */
export async function loadShows() {
  const { sb } = await session();
  const { data } = await sb
    .from("analyses")
    .select("id, status, created_at, source, shows(id, name, platform, audience_size)")
    .order("created_at", { ascending: false })
    .limit(50);
  const seen = new Set<string>();
  const out: { analysisId: string; status: string; created_at: string; source: string; show: Pick<ShowRow, "id" | "name" | "platform" | "audience_size"> }[] = [];
  for (const row of (data ?? []) as unknown as { id: string; status: string; created_at: string; source: string; shows: Pick<ShowRow, "id" | "name" | "platform" | "audience_size"> }[]) {
    if (!row.shows || seen.has(row.shows.id)) continue;
    seen.add(row.shows.id);
    out.push({ analysisId: row.id, status: row.status, created_at: row.created_at, source: row.source, show: row.shows });
  }
  return out;
}

export interface DealWithBrand extends DealRow {
  matches: Pick<MatchRow, "id" | "name" | "fit" | "category" | "analysis_id"> | null;
}

export async function loadDeals() {
  const { sb } = await session();
  const { data } = await sb.from("deals").select("*, matches(id, name, fit, category, analysis_id)").order("updated_at", { ascending: false });
  return (data ?? []) as DealWithBrand[];
}

/** Top match per analysis, for list cards. */
export async function loadTopFits(analysisIds: string[]) {
  if (!analysisIds.length) return {} as Record<string, number>;
  const { sb } = await session();
  const { data } = await sb.from("matches").select("analysis_id, fit").in("analysis_id", analysisIds).eq("rank", 1);
  return Object.fromEntries((data ?? []).map((r) => [r.analysis_id, r.fit])) as Record<string, number>;
}
