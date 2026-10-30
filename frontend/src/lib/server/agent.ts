import "server-only";
import * as qloo from "./qloo";
import { groqEnabled, groqJson, onlyAllowedNumbers } from "./groq";
import type { CallRecord, QlooDemographics, QlooEntity, QlooTag } from "./qloo";
import { affinityPart, demographicPart, fitScore, noveltyPart, tastePart } from "@/lib/scoring";
import { ageBars, type AudienceProfile, type HeatPoint, type ProfileRow, type ShowRow, type TasteDomain, type TraceCall } from "@/lib/model";
import type { ScoreParts } from "@/lib/types";

/**
 * The SponsorFit agent: a fixed seven-step pipeline.
 *
 *   Resolve -> Profile -> Discover -> Enrich -> Score -> Critic -> Generate
 *
 * Qloo supplies every number. Plain TypeScript computes the Fit Score.
 * The LLM (Groq) only classifies brands and writes short reasons, and its
 * text is rejected if it contains a number we did not give it.
 */

export type AgentEvent =
  | { type: "step"; key: StepKey; status: "running" | "done"; note?: string }
  | { type: "call"; call: TraceCall }
  | { type: "profile"; profile: AudienceProfile }
  | { type: "without"; brands: string[] }
  | { type: "match"; match: DraftMatch }
  | { type: "done"; count: number; source: "qloo" | "sample" }
  | { type: "error"; message: string };

export type StepKey = "resolve" | "profile" | "discover" | "enrich" | "score" | "critic" | "generate";

export interface DraftMatch {
  rank: number;
  qloo_id: string;
  name: string;
  category: string;
  fit: number;
  parts: ScoreParts;
  affinity: number | null;
  popularity: number | null;
  tags: string[];
  reasons: string[];
  demographics: { age?: Record<string, number>; shared?: string[]; demoKnown?: boolean };
  image: string | null;
  hidden_gem: boolean;
  safety: string | null;
  competitor_of: string | null;
}

export interface AgentResult {
  profile: AudienceProfile;
  matches: DraftMatch[];
  withoutQloo: string[];
  trace: TraceCall[];
  source: "qloo" | "sample";
}

const MAX_CALLS = 40;
const KEEP = 15;

/* ---------- helpers ---------- */

function domainOf(type: string, name: string): string {
  const t = type.toLowerCase();
  if (t.includes("music")) return "Music";
  if (t.includes("media") || t.includes("film") || t.includes("tv") || t.includes("movie")) return "Film & TV";
  if (t.includes("cuisine") || t.includes("restaurant") || t.includes("dining") || /coffee|food|cook|beer|wine/i.test(name)) return "Food & Drink";
  if (t.includes("book") || t.includes("literary")) return "Books";
  if (t.includes("place") || t.includes("destination") || /travel|trip|hik|camp|trail/i.test(name)) return "Travel & Outdoors";
  return "Lifestyle";
}

function groupTags(tags: QlooTag[]): TasteDomain[] {
  const max = Math.max(...tags.map((t) => t.affinity ?? 0), 0.0001);
  const by = new Map<string, { label: string; affinity: number }[]>();
  for (const t of tags) {
    const d = domainOf(t.type, t.name);
    const list = by.get(d) ?? [];
    if (list.length < 5) list.push({ label: t.name, affinity: Math.round(((t.affinity ?? max * 0.5) / max) * 100) });
    by.set(d, list);
  }
  return [...by.entries()].map(([domain, items]) => ({ domain, items })).sort((a, b) => b.items.length - a.items.length);
}

const CITIES: [string, number, number][] = [
  ["New York", 40.71, -74.0], ["Los Angeles", 34.05, -118.24], ["Chicago", 41.88, -87.63], ["Houston", 29.76, -95.37],
  ["Phoenix", 33.45, -112.07], ["Philadelphia", 39.95, -75.17], ["San Antonio", 29.42, -98.49], ["San Diego", 32.72, -117.16],
  ["Dallas", 32.78, -96.8], ["Austin", 30.27, -97.74], ["San Francisco", 37.77, -122.42], ["Seattle", 47.61, -122.33],
  ["Denver", 39.74, -104.99], ["Boston", 42.36, -71.06], ["Nashville", 36.16, -86.78], ["Portland", 45.52, -122.68],
  ["Las Vegas", 36.17, -115.14], ["Atlanta", 33.75, -84.39], ["Miami", 25.76, -80.19], ["Minneapolis", 44.98, -93.27],
  ["New Orleans", 29.95, -90.07], ["Salt Lake City", 40.76, -111.89], ["Kansas City", 39.1, -94.58], ["Detroit", 42.33, -83.05],
  ["Washington", 38.91, -77.04], ["Charlotte", 35.23, -80.84], ["Asheville", 35.6, -82.55], ["Pittsburgh", 40.44, -79.99],
  ["St. Louis", 38.63, -90.2], ["Raleigh", 35.78, -78.64], ["Columbus", 39.96, -83.0], ["Sacramento", 38.58, -121.49],
  ["Albuquerque", 35.08, -106.65], ["Boise", 43.62, -116.2], ["Madison", 43.07, -89.4], ["Tampa", 27.95, -82.46],
];

function nameCity(lat: number, lon: number): string {
  let best = CITIES[0], d = Infinity;
  for (const c of CITIES) {
    const dd = (c[1] - lat) ** 2 + (c[2] - lon) ** 2;
    if (dd < d) { d = dd; best = c; }
  }
  return best[0];
}

function heatPoints(cells: qloo.QlooHeatCell[]): HeatPoint[] {
  const us = cells.filter((c) => c.lat > 24 && c.lat < 50 && c.lon > -125 && c.lon < -66);
  const byCity = new Map<string, HeatPoint>();
  const max = Math.max(...us.map((c) => c.affinity), 0.0001);
  for (const c of us.sort((a, b) => b.affinity - a.affinity)) {
    const city = nameCity(c.lat, c.lon);
    if (!byCity.has(city)) byCity.set(city, { city, lat: c.lat, lon: c.lon, intensity: Math.round((c.affinity / max) * 100) });
    if (byCity.size >= 10) break;
  }
  return [...byCity.values()];
}

function mergeDemo(rows: QlooDemographics[]): { age: Record<string, number>; gender: Record<string, number> } {
  const age: Record<string, number> = {}, gender: Record<string, number> = {};
  if (!rows.length) return { age, gender };
  for (const r of rows) {
    for (const [k, v] of Object.entries(r.age)) age[k] = (age[k] ?? 0) + v / rows.length;
    for (const [k, v] of Object.entries(r.gender)) gender[k] = (gender[k] ?? 0) + v / rows.length;
  }
  return { age, gender };
}

const pct = (n: number) => Math.round(n * 100);

function templateReasons(m: DraftMatch, rankByAffinity: number, total: number): string[] {
  const out = [`Qloo ranks it #${rankByAffinity} of ${total} brands for your audience's taste`];
  const shared = m.demographics.shared ?? [];
  if (shared.length) out.push(`Shares your audience's taste for ${shared.slice(0, 2).join(" and ")}`);
  if (m.demographics.demoKnown) out.push(`Demographic match of ${pct(m.parts.demographic)}% with your listeners`);
  if (m.hidden_gem) out.push("Less crowded: few creators pitch this brand yet");
  return out.slice(0, 3);
}

/* ---------- the pipeline ---------- */

export async function runAgent(
  show: ShowRow,
  prefs: Pick<ProfileRow, "existing_sponsors">,
  emit: (e: AgentEvent) => void,
): Promise<AgentResult> {
  const source = qloo.qlooSource();
  const trace: TraceCall[] = [];
  let step: StepKey = "resolve";
  const calls: CallRecord[] = [];
  let seen = 0;
  const flush = () => {
    while (seen < calls.length) {
      const c = calls[seen++];
      const t: TraceCall = { step, ...c };
      trace.push(t);
      emit({ type: "call", call: t });
    }
    if (calls.length > MAX_CALLS) throw new Error("Call budget exceeded");
  };
  const begin = (k: StepKey, note?: string) => { step = k; emit({ type: "step", key: k, status: "running", note }); };
  const end = (k: StepKey, note?: string) => { flush(); emit({ type: "step", key: k, status: "done", note }); };

  // Groq-only baseline runs in parallel: what an AI guesses with no taste data.
  const withoutPromise = guessWithoutQloo(show);

  /* 1. Resolve: the audience signal is the show's own Qloo entity plus any "shows like mine". */
  begin("resolve", "Finding your show in the taste graph");
  const signal = [...new Set([show.qloo_entity_id, ...show.seed_entities.map((s) => s.id)].filter(Boolean) as string[])].slice(0, 6);
  if (!signal.length) {
    const found = await qloo.search(show.name, ["urn:entity:podcast"], 3, calls);
    if (found[0]) signal.push(found[0].id);
  }
  if (!signal.length) throw new Error("We could not find this show in Qloo. Add 3 to 5 similar shows, artists or films instead.");
  end("resolve", `${signal.length} audience signal${signal.length > 1 ? "s" : ""}`);

  /* 2. Profile: taste tags, demographics and where the audience is. */
  begin("profile", "Reading who listens and what they love");
  const [tags, demoRows, cells] = await Promise.all([
    qloo.tasteTags(signal, 40, calls),
    qloo.demographics(signal, calls).catch(() => [] as QlooDemographics[]),
    qloo.heatmap(signal, "United States", calls).catch(() => []),
  ]);
  const audienceDemo = mergeDemo(demoRows.filter((r) => !r.id || signal.includes(r.id) || demoRows.length <= signal.length));
  const audienceTags = tags.map((t) => t.name);
  const profile: AudienceProfile = {
    themes: audienceTags.slice(0, 10),
    domains: groupTags(tags.slice(0, 30)),
    age: ageBars(audienceDemo.age),
    gender: Object.entries(audienceDemo.gender).map(([k, v]) => ({ label: k === "male" ? "Men" : k === "female" ? "Women" : k, index: Math.round(v * 100) })),
    heat: heatPoints(cells),
    episodeIdeas: [],
    audienceTags: audienceTags.slice(0, 40),
    ageRaw: audienceDemo.age,
  };
  emit({ type: "profile", profile });
  end("profile", `${tags.length} taste signals`);

  /* 3. Discover: brands this audience over-indexes on. */
  begin("discover", "Collecting candidate brands");
  let brands = await qloo.insightsEntities(signal, "urn:entity:brand", 40, calls);
  const sponsorsLower = prefs.existing_sponsors.map((s) => s.toLowerCase());
  brands = brands.filter((b) => !sponsorsLower.includes(b.name.toLowerCase()));
  if (!brands.length) throw new Error("Qloo returned no brands for this audience. Try adding a few similar shows.");
  const candidates = brands.slice(0, 24);
  end("discover", `${brands.length} candidate brands`);

  /* 4. Enrich: each brand's own audience demographics. */
  begin("enrich", "Profiling each brand's own audience");
  const top = candidates.slice(0, 16);
  const brandDemo = new Map<string, Record<string, number>>();
  const batch = await qloo.demographics(top.map((b) => b.id), calls).catch(() => [] as QlooDemographics[]);
  for (const r of batch) if (r.id && Object.keys(r.age).length) brandDemo.set(r.id, r.age);
  if (brandDemo.size < Math.min(4, top.length) && source === "qloo") {
    // The batch answered for the group, not per brand: ask per brand for the top few.
    const few = top.slice(0, 8);
    const rows = await Promise.all(few.map((b) => qloo.demographics([b.id], calls).catch(() => [] as QlooDemographics[])));
    rows.forEach((r, i) => { if (r[0] && Object.keys(r[0].age).length) brandDemo.set(few[i].id, r[0].age); });
  }
  end("enrich", `${brandDemo.size} brand audiences profiled`);

  /* 5. Score: pure maths, no AI. */
  begin("score", "Computing Fit Scores (pure maths, no AI)");
  const affs = candidates.map((b) => b.affinity ?? 0);
  const amin = Math.min(...affs), amax = Math.max(...affs);
  const pops = candidates.map((b) => b.popularity ?? 0.5).sort((a, b) => a - b);
  const medianPop = pops[Math.floor(pops.length / 2)];
  let drafts: DraftMatch[] = candidates.map((b: QlooEntity) => {
    const demo = brandDemo.get(b.id);
    const taste = tastePart(b.tags, audienceTags);
    const parts: ScoreParts = {
      affinity: affinityPart(b.affinity, amin, amax),
      demographic: demo ? demographicPart(audienceDemo.age, demo) : 0.5,
      taste: taste.score,
      novelty: noveltyPart(b.popularity),
    };
    const fit = fitScore(parts);
    return {
      rank: 0,
      qloo_id: b.id,
      name: b.name,
      category: b.disambiguation || b.tags[0] || "Brand",
      fit,
      parts,
      affinity: b.affinity,
      popularity: b.popularity,
      tags: b.tags.slice(0, 8),
      reasons: [],
      demographics: { age: demo, shared: taste.shared, demoKnown: !!demo },
      image: b.image,
      hidden_gem: (b.popularity ?? 1) < medianPop && fit >= 60,
      safety: null,
      competitor_of: null,
    };
  });
  const byAffinity = [...drafts].sort((a, b) => (b.affinity ?? 0) - (a.affinity ?? 0)).map((d) => d.qloo_id);
  drafts.sort((a, b) => b.fit - a.fit);
  drafts = drafts.slice(0, KEEP);
  drafts.forEach((d, i) => {
    d.rank = i + 1;
    d.reasons = templateReasons(d, byAffinity.indexOf(d.qloo_id) + 1, candidates.length);
  });
  end("score", `${drafts.length} brands scored`);

  /* 6. Critic: the LLM classifies, flags safety and competitors, and rewrites reasons. */
  begin("critic", "Checking brand safety and writing the reasons");
  const critic = await criticize(show, drafts, profile, prefs.existing_sponsors);
  if (critic) {
    for (const d of drafts) {
      const c = critic.brands.find((x) => x.name?.toLowerCase() === d.name.toLowerCase());
      if (!c) continue;
      if (c.category) d.category = c.category.slice(0, 40);
      if (c.safety && ["alcohol", "gambling", "adult"].includes(c.safety)) d.safety = c.safety;
      if (c.competitor_of && prefs.existing_sponsors.some((s) => s.toLowerCase() === c.competitor_of!.toLowerCase())) d.competitor_of = c.competitor_of;
      const allowed = [d.fit, pct(d.parts.affinity), pct(d.parts.demographic), pct(d.parts.taste), pct(d.parts.novelty), show.audience_size, byAffinity.indexOf(d.qloo_id) + 1, candidates.length];
      const good = (c.reasons ?? []).filter((r) => typeof r === "string" && r.length < 140 && onlyAllowedNumbers(r, allowed));
      if (good.length >= 2) d.reasons = good.slice(0, 3);
    }
    profile.episodeIdeas = (critic.episode_ideas ?? []).slice(0, 4).filter((e) => e?.title && e?.why);
    profile.summary = critic.summary;
  }
  for (const d of drafts) emit({ type: "match", match: d });
  emit({ type: "profile", profile });
  end("critic", groqEnabled() ? "Reasons checked against the data" : "Reasons written from the data");

  /* 7. Generate: hand back for saving. Pitches are drafted on demand per brand. */
  begin("generate", "Saving your shortlist");
  const withoutQloo = await withoutPromise;
  emit({ type: "without", brands: withoutQloo });
  end("generate", "Shortlist ready");

  return { profile, matches: drafts, withoutQloo, trace, source };
}

/* ---------- LLM helpers ---------- */

interface CriticOut {
  brands: { name: string; category?: string; safety?: string | null; competitor_of?: string | null; reasons?: string[] }[];
  episode_ideas?: { title: string; why: string }[];
  summary?: string;
}

async function criticize(show: ShowRow, drafts: DraftMatch[], profile: AudienceProfile, sponsors: string[]) {
  const brandLines = drafts.map((d) =>
    `- ${d.name} | fit ${d.fit} | affinity ${pct(d.parts.affinity)} | demographic ${pct(d.parts.demographic)} | taste ${pct(d.parts.taste)} | novelty ${pct(d.parts.novelty)} | qloo hint: ${d.category} | brand tags: ${d.tags.slice(0, 5).join(", ") || "none"} | shared tastes: ${(d.demographics.shared ?? []).join(", ") || "none"}`,
  ).join("\n");
  const system = `You are the critic step of a sponsorship agent for creators. You receive brands already scored with data from Qloo's taste graph.
Return JSON: {"brands":[{"name":string,"category":string (2-3 words, e.g. "Outdoor gear"),"safety":null|"alcohol"|"gambling"|"adult","competitor_of":null|string,"reasons":[3 short strings]}],"episode_ideas":[{"title":string,"why":string}],"summary":string}
Rules:
- Keep every brand name exactly as given.
- competitor_of: name of the creator's existing sponsor in the SAME category as this brand, else null.
- reasons: plain words, under 14 words each, written for a creator. Use ONLY numbers that appear in that brand's line. Never invent statistics.
- episode_ideas: 4 episode or video ideas a sponsor in this audience would love, grounded in the audience tastes. No numbers.
- summary: one sentence describing the audience's taste, no numbers.`;
  const user = `Show: ${show.name} (${show.platform}).
Existing sponsors: ${sponsors.join(", ") || "none"}.
Audience top tastes from Qloo: ${profile.audienceTags.slice(0, 20).join(", ")}.
Brands:
${brandLines}`;
  return groqJson<CriticOut>(system, user, { temperature: 0.3, maxTokens: 3000 });
}

async function guessWithoutQloo(show: ShowRow): Promise<string[]> {
  const fallback = ["A big VPN service", "A meal-kit company", "An online mattress brand", "A website builder", "A sports betting app"];
  const out = await groqJson<{ brands: string[] }>(
    "You suggest sponsors for creators. You have NO audience data. Return JSON {\"brands\": [5 brand names]}.",
    `Which 5 brands would most likely sponsor the ${show.platform} "${show.name}"? Answer with famous brands only.`,
    { temperature: 0.7, maxTokens: 200 },
  );
  const list = (out?.brands ?? []).filter((b) => typeof b === "string" && b.length < 60).slice(0, 5);
  return list.length >= 3 ? list : fallback;
}
