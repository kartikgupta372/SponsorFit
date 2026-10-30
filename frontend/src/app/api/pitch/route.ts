import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { writePitch } from "@/lib/server/pitch";
import type { AnalysisRow, MatchRow, ShowRow, Tone } from "@/lib/model";

export const maxDuration = 30;
const TONES: Tone[] = ["Casual", "Professional", "Bold"];

/** Draft (or redraft) the pitch for one match in the chosen tone, and save it. */
export async function POST(req: NextRequest) {
  const { sb, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { matchId?: string; tone?: Tone };
  const tone = TONES.includes(body.tone as Tone) ? (body.tone as Tone) : "Professional";

  const { data: match } = await sb.from("matches").select("*").eq("id", body.matchId ?? "").single();
  if (!match) return NextResponse.json({ error: "Brand not found." }, { status: 404 });
  const { data: analysis } = await sb.from("analyses").select("*").eq("id", match.analysis_id).single();
  const { data: show } = await sb.from("shows").select("*").eq("id", analysis?.show_id ?? "").single();
  if (!analysis || !show) return NextResponse.json({ error: "Analysis not found." }, { status: 404 });

  const draft = await writePitch(show as ShowRow, match as MatchRow, analysis as AnalysisRow, tone);
  const { source, ...row } = draft;
  const { data, error } = await sb
    .from("pitches")
    .upsert({ user_id: user.id, match_id: match.id, tone, ...row, updated_at: new Date().toISOString() }, { onConflict: "match_id" })
    .select()
    .single();
  if (error) return NextResponse.json({ error: "Could not save the draft." }, { status: 500 });
  return NextResponse.json({ pitch: data, source });
}
