import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { search, qlooSource, QlooError } from "@/lib/server/qloo";

const ALLOWED = new Set(["podcast", "artist", "movie", "tv_show", "book", "person", "brand", "videogame"]);

/** Typeahead for shows, creators and "shows like mine". Signed-in users only, to protect the Qloo quota. */
export async function GET(req: NextRequest) {
  const { user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Sign in to search." }, { status: 401 });

  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 80);
  if (q.length < 2) return NextResponse.json({ results: [], source: qlooSource() });
  const types = (req.nextUrl.searchParams.get("types") ?? "podcast")
    .split(",")
    .filter((t) => ALLOWED.has(t))
    .map((t) => `urn:entity:${t}`);

  try {
    const results = await search(q, types.length ? types : ["urn:entity:podcast"], 8);
    return NextResponse.json({
      source: qlooSource(),
      results: results.map((e) => ({ id: e.id, name: e.name, type: e.type, image: e.image, note: e.disambiguation })),
    });
  } catch (e) {
    const message = e instanceof QlooError ? e.message : "Search failed. Try again.";
    return NextResponse.json({ error: message, results: [] }, { status: 502 });
  }
}
