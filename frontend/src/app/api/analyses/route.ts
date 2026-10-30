import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/supabase/server";

const DAILY_LIMIT = 15;

interface Body {
  name?: string;
  platform?: "podcast" | "youtube";
  audience_size?: number;
  qloo_entity_id?: string | null;
  seeds?: { id: string; name: string; type: string }[];
}

/** Create a show and a queued analysis. The run itself starts from /api/analyses/[id]/run. */
export async function POST(req: NextRequest) {
  const { sb, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Sign in to run an analysis." }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Body;
  const name = (body.name ?? "").trim().slice(0, 120);
  const platform = body.platform === "youtube" ? "youtube" : "podcast";
  const audience = Math.round(Number(body.audience_size) || 0);
  const seeds = (body.seeds ?? []).filter((s) => s && typeof s.id === "string").slice(0, 5);

  if (!name) return NextResponse.json({ error: "Add your show or channel name." }, { status: 400 });
  if (audience < 100 || audience > 50_000_000)
    return NextResponse.json({ error: "Enter your average audience per episode, between 100 and 50 million." }, { status: 400 });
  if (!body.qloo_entity_id && seeds.length < 1)
    return NextResponse.json({ error: "Pick your show from the list, or add at least one similar show." }, { status: 400 });

  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { count } = await sb.from("analyses").select("id", { count: "exact", head: true }).gte("created_at", since);
  if ((count ?? 0) >= DAILY_LIMIT)
    return NextResponse.json({ error: `You've used all ${DAILY_LIMIT} analyses for today. Try again tomorrow.` }, { status: 429 });

  const { data: show, error: showErr } = await sb
    .from("shows")
    .insert({ user_id: user.id, name, platform, audience_size: audience, qloo_entity_id: body.qloo_entity_id ?? null, seed_entities: seeds })
    .select()
    .single();
  if (showErr || !show) return NextResponse.json({ error: "Could not save your show. Try again." }, { status: 500 });

  const { data: analysis, error } = await sb
    .from("analyses")
    .insert({ user_id: user.id, show_id: show.id })
    .select("id")
    .single();
  if (error || !analysis) return NextResponse.json({ error: "Could not start the analysis. Try again." }, { status: 500 });

  return NextResponse.json({ id: analysis.id });
}
