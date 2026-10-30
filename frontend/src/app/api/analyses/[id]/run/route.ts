import { type NextRequest } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { runAgent, type AgentEvent } from "@/lib/server/agent";
import { qlooSource } from "@/lib/server/qloo";
import type { ShowRow } from "@/lib/model";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * Runs the agent for one queued analysis and streams progress as NDJSON
 * (one JSON event per line). Results are saved before the stream closes.
 */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { sb, user } = await requireUser();
  if (!user) return Response.json({ error: "Sign in first." }, { status: 401 });

  const { data: analysis } = await sb.from("analyses").select("*").eq("id", id).single();
  if (!analysis) return Response.json({ error: "Analysis not found." }, { status: 404 });
  if (analysis.status !== "queued") return Response.json({ status: analysis.status }, { status: 409 });

  const { data: show } = await sb.from("shows").select("*").eq("id", analysis.show_id).single();
  const { data: prefs } = await sb.from("profiles").select("existing_sponsors").eq("id", user.id).maybeSingle();
  if (!show) return Response.json({ error: "Show not found." }, { status: 404 });

  // Claim the run so a second tab cannot start it twice.
  const { data: claimed } = await sb
    .from("analyses")
    .update({ status: "running", source: qlooSource() })
    .eq("id", id)
    .eq("status", "queued")
    .select("id");
  if (!claimed?.length) return Response.json({ status: "running" }, { status: 409 });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (e: AgentEvent | { type: "saved"; id: string }) => {
        try {
          controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));
        } catch {
          /* client went away; keep running so the result is still saved */
        }
      };
      try {
        const result = await runAgent(show as ShowRow, { existing_sponsors: prefs?.existing_sponsors ?? [] }, send);
        const rows = result.matches.map((m) => ({ ...m, analysis_id: id, user_id: user.id }));
        const { error: insErr } = await sb.from("matches").insert(rows);
        if (insErr) throw new Error("Could not save the shortlist.");
        await sb
          .from("analyses")
          .update({
            status: "complete",
            profile: result.profile,
            trace: result.trace,
            without_qloo: result.withoutQloo,
            qloo_calls: result.trace.length,
            source: result.source,
            completed_at: new Date().toISOString(),
          })
          .eq("id", id);
        send({ type: "done", count: rows.length, source: result.source });
        send({ type: "saved", id });
      } catch (e) {
        const message = e instanceof Error ? e.message : "The analysis failed.";
        await sb.from("analyses").update({ status: "failed", error: message }).eq("id", id);
        send({ type: "error", message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store", "X-Accel-Buffering": "no" },
  });
}
