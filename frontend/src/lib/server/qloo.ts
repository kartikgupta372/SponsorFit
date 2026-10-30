import "server-only";
import { sampleQloo } from "./qloo-sample";

/**
 * Qloo Insights API client.
 *
 * - The key only ever lives on the server (X-Api-Key header).
 * - Every call is recorded in a trace so the UI can show exactly what the
 *   agent asked Qloo and what came back. That trace is the evidence.
 * - 429 and 5xx are retried with backoff; 404 means "no results".
 * - A small in-memory cache stops repeated demo runs from burning quota.
 *
 * Without QLOO_API_KEY the client switches to a clearly labelled sample
 * graph so the app still runs end to end; every run records its source.
 */

export interface QlooEntity {
  id: string;
  name: string;
  type: string;
  popularity: number | null;
  affinity: number | null;
  image: string | null;
  tags: string[];
  disambiguation: string | null;
}
export interface QlooTag {
  id: string;
  name: string;
  type: string;
  affinity: number | null;
}
export interface QlooDemographics {
  id: string;
  age: Record<string, number>;
  gender: Record<string, number>;
}
export interface QlooHeatCell {
  lat: number;
  lon: number;
  affinity: number;
}
export interface CallRecord {
  endpoint: string;
  params: Record<string, string>;
  count: number;
  ms: number;
  cached: boolean;
  status: "ok" | "empty" | "error";
  preview: string[];
}

export class QlooError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
  }
}

export const qlooSource = (): "qloo" | "sample" => (process.env.QLOO_API_KEY ? "qloo" : "sample");

const BASE = (process.env.QLOO_BASE_URL || "https://hackathon.api.qloo.com").replace(/\/$/, "");
const CACHE = new Map<string, { at: number; value: unknown }>();
const TTL = 6 * 3600 * 1000;

const num = (v: unknown): number | null => {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
};

function results(payload: unknown, key: string): Record<string, unknown>[] {
  if (!payload || typeof payload !== "object") return [];
  const r = (payload as Record<string, unknown>).results;
  if (Array.isArray(r)) return r as Record<string, unknown>[];
  if (r && typeof r === "object") {
    const v = (r as Record<string, unknown>)[key];
    if (Array.isArray(v)) return v as Record<string, unknown>[];
    for (const val of Object.values(r)) {
      if (Array.isArray(val) && val.length && typeof val[0] === "object") return val as Record<string, unknown>[];
    }
  }
  const top = (payload as Record<string, unknown>)[key];
  return Array.isArray(top) ? (top as Record<string, unknown>[]) : [];
}

function toEntity(raw: Record<string, unknown>): QlooEntity | null {
  const id = (raw.entity_id ?? raw.id) as string | undefined;
  const name = raw.name as string | undefined;
  if (!id || !name) return null;
  const props = (raw.properties ?? {}) as Record<string, unknown>;
  const query = (raw.query ?? {}) as Record<string, unknown>;
  const img = props.image as { url?: string } | string | undefined;
  const types = (raw.types ?? []) as string[];
  const subtype = (raw.subtype as string) || types.find((t) => typeof t === "string" && t.startsWith("urn:entity:")) || "";
  const tags = ((raw.tags ?? []) as { name?: string }[])
    .map((t) => (t && typeof t.name === "string" ? t.name.trim() : ""))
    .filter(Boolean)
    .slice(0, 12);
  return {
    id: String(id),
    name: String(name),
    type: subtype.split(":").pop() || "entity",
    popularity: num(raw.popularity),
    affinity: num(query.affinity),
    image: typeof img === "string" ? img : img?.url ?? null,
    tags,
    disambiguation: (raw.disambiguation as string) ?? null,
  };
}

function encode(params: Record<string, string | number | boolean | string[] | undefined>) {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    if (Array.isArray(v)) {
      if (v.length) out[k] = v.join(",");
    } else out[k] = String(v);
  }
  return out;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function get(path: string, params: Record<string, string>, trace: CallRecord[] | null, key: string) {
  const qs = new URLSearchParams(params).toString();
  const cacheKey = `${path}?${qs}`;
  const started = Date.now();
  const record: CallRecord = { endpoint: path, params, count: 0, ms: 0, cached: false, status: "ok", preview: [] };

  let payload: unknown;
  const hit = CACHE.get(cacheKey);
  if (hit && Date.now() - hit.at < TTL) {
    payload = hit.value;
    record.cached = true;
  } else {
    let delay = 800;
    for (let attempt = 1; ; attempt++) {
      let res: Response;
      try {
        res = await fetch(`${BASE}${path}?${qs}`, {
          headers: { "X-Api-Key": process.env.QLOO_API_KEY!, Accept: "application/json" },
          cache: "no-store",
          signal: AbortSignal.timeout(15000),
        });
      } catch {
        if (attempt < 3) {
          await sleep(delay);
          delay *= 2;
          continue;
        }
        record.status = "error";
        record.ms = Date.now() - started;
        trace?.push(record);
        throw new QlooError("Could not reach Qloo. Check your connection and try again.");
      }
      if (res.ok) {
        payload = await res.json().catch(() => ({}));
        CACHE.set(cacheKey, { at: Date.now(), value: payload });
        break;
      }
      if (res.status === 404) {
        payload = { results: [] };
        break;
      }
      if ((res.status === 429 || res.status >= 500) && attempt < 3) {
        const ra = Number(res.headers.get("retry-after"));
        await sleep(Number.isFinite(ra) && ra > 0 ? Math.min(ra * 1000, 8000) : delay);
        delay *= 2;
        continue;
      }
      record.status = "error";
      record.ms = Date.now() - started;
      trace?.push(record);
      if (res.status === 401 || res.status === 403) throw new QlooError("Qloo rejected the API key.", res.status);
      if (res.status === 429) throw new QlooError("Qloo is rate limiting us. Wait a minute and try again.", 429);
      throw new QlooError(`Qloo returned an error (${res.status}).`, res.status);
    }
  }
  const items = results(payload, key);
  record.count = items.length;
  record.ms = Date.now() - started;
  record.status = items.length ? "ok" : "empty";
  record.preview = items
    .slice(0, 5)
    .map((i) => String(i.name ?? i.entity_id ?? ""))
    .filter(Boolean);
  trace?.push(record);
  return items;
}

/* -------------------------------------------------------------------------- */

export async function search(query: string, types: string[], take = 8, trace: CallRecord[] | null = null) {
  if (qlooSource() === "sample") return sampleQloo.search(query, types, trace);
  const items = await get("/search", encode({ query, take, types }), trace, "entities");
  return items.map(toEntity).filter((e): e is QlooEntity => !!e);
}

export async function tasteTags(signal: string[], take = 30, trace: CallRecord[] | null = null) {
  if (qlooSource() === "sample") return sampleQloo.tags(trace);
  const items = await get(
    "/v2/insights",
    encode({ "filter.type": "urn:tag", "signal.interests.entities": signal, take }),
    trace,
    "tags",
  );
  return items
    .map((r): QlooTag | null => {
      const id = (r.tag_id ?? r.id) as string | undefined;
      const name = String(r.name ?? "").trim();
      if (!id || !name) return null;
      return {
        id: String(id),
        name,
        type: String(r.subtype ?? r.type ?? ""),
        affinity: num(((r.query ?? {}) as Record<string, unknown>).affinity),
      };
    })
    .filter((t): t is QlooTag => !!t);
}

export async function demographics(signal: string[], trace: CallRecord[] | null = null) {
  if (qlooSource() === "sample") return sampleQloo.demographics(signal, trace);
  const items = await get(
    "/v2/insights",
    encode({ "filter.type": "urn:demographics", "signal.interests.entities": signal }),
    trace,
    "demographics",
  );
  return items.map((r): QlooDemographics => {
    const q = (r.query ?? {}) as Record<string, Record<string, unknown>>;
    const clean = (o: Record<string, unknown> | undefined) =>
      Object.fromEntries(Object.entries(o ?? {}).filter(([, v]) => num(v) !== null).map(([k, v]) => [k, num(v)!]));
    return { id: String(r.entity_id ?? ""), age: clean(q.age), gender: clean(q.gender) };
  });
}

export async function insightsEntities(
  signal: string[],
  type: string,
  take = 40,
  trace: CallRecord[] | null = null,
  extra: Record<string, string | number | boolean | string[] | undefined> = {},
) {
  if (qlooSource() === "sample") return sampleQloo.brands(trace);
  const items = await get(
    "/v2/insights",
    encode({ "filter.type": type, "signal.interests.entities": signal, take, ...extra }),
    trace,
    "entities",
  );
  return items.map(toEntity).filter((e): e is QlooEntity => !!e);
}

export async function heatmap(signal: string[], location: string, trace: CallRecord[] | null = null) {
  if (qlooSource() === "sample") return sampleQloo.heatmap(trace);
  const items = await get(
    "/v2/insights",
    encode({ "filter.type": "urn:heatmap", "filter.location.query": location, "signal.interests.entities": signal }),
    trace,
    "heatmap",
  );
  return items
    .map((r): QlooHeatCell | null => {
      const loc = (r.location ?? {}) as Record<string, unknown>;
      const q = (r.query ?? {}) as Record<string, unknown>;
      const lat = num(loc.latitude ?? loc.lat);
      const lon = num(loc.longitude ?? loc.lon ?? loc.lng);
      if (lat === null || lon === null) return null;
      return { lat, lon, affinity: num(q.affinity) ?? 0 };
    })
    .filter((c): c is QlooHeatCell => !!c);
}
