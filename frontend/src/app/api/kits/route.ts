import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { ageBars, rateFor, type AnalysisRow, type KitData, type MatchRow, type ShowRow } from "@/lib/model";

/** Publish (or refresh) the public media kit for one match. Returns its slug. */
export async function POST(req: NextRequest) {
  const { sb, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const { matchId } = (await req.json().catch(() => ({}))) as { matchId?: string };

  const { data: m } = await sb.from("matches").select("*").eq("id", matchId ?? "").single();
  if (!m) return NextResponse.json({ error: "Brand not found." }, { status: 404 });
  const match = m as MatchRow;
  const { data: a } = await sb.from("analyses").select("*").eq("id", match.analysis_id).single();
  const analysis = a as AnalysisRow | null;
  const { data: s } = await sb.from("shows").select("*").eq("id", analysis?.show_id ?? "").single();
  const show = s as ShowRow | null;
  if (!analysis || !show) return NextResponse.json({ error: "Analysis not found." }, { status: 404 });

  const profile = "themes" in analysis.profile ? analysis.profile : null;
  const data: KitData = {
    show: { name: show.name, platform: show.platform, audience: show.audience_size },
    brand: { name: match.name, category: match.category, fit: match.fit, parts: match.parts, reasons: match.reasons, tags: match.tags },
    audience: { age: profile?.age ?? [], brandAge: ageBars(match.demographics?.age), themes: profile?.themes.slice(0, 8) ?? [] },
    rate: rateFor(show.audience_size, match.fit),
    source: analysis.source,
  };

  const { data: existing } = await sb.from("kits").select("slug").eq("match_id", match.id).maybeSingle();
  const base = `${show.name}-${match.name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
  const slug = existing?.slug ?? `${base}-${Math.random().toString(36).slice(2, 7)}`;
  const { error } = await sb.from("kits").upsert({ slug, user_id: user.id, match_id: match.id, data }, { onConflict: "slug" });
  if (error) return NextResponse.json({ error: "Could not publish the kit." }, { status: 500 });
  return NextResponse.json({ slug });
}
