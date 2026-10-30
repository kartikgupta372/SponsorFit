import "server-only";
import { BRANDS, THEMES } from "@/lib/mock-data";
import type { CallRecord, QlooDemographics, QlooEntity, QlooHeatCell, QlooTag } from "./qloo";

/**
 * A small stand-in taste graph, used ONLY when QLOO_API_KEY is not set.
 * Runs made with it are stored with source = "sample" and the UI labels them,
 * so sample numbers are never mistaken for Qloo's.
 */

function rec(trace: CallRecord[] | null, endpoint: string, params: Record<string, string>, preview: string[], count: number) {
  trace?.push({ endpoint, params, count, ms: 40 + Math.round(Math.random() * 60), cached: false, status: "ok", preview });
}

const AGE_KEYS = ["24_and_younger", "25_to_29", "30_to_34", "35_to_44", "45_to_54", "55_and_older"];
const AUDIENCE_AGE = [-0.15, 0.35, 0.45, 0.3, -0.15, -0.45];

export const sampleQloo = {
  search(query: string, types: string[], trace: CallRecord[] | null): QlooEntity[] {
    const q = query.trim() || "Your show";
    const kind = types[0]?.split(":").pop() || "podcast";
    const base = [
      { name: q, d: kind === "podcast" ? "Podcast" : "Creator" },
      { name: `${q} Daily`, d: "Podcast" },
      { name: `The ${q} Hour`, d: "Podcast" },
    ];
    const out = base.map((b, i) => ({
      id: `sample-${kind}-${q.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${i}`,
      name: b.name,
      type: kind,
      popularity: 0.6 - i * 0.1,
      affinity: null,
      image: null,
      tags: [],
      disambiguation: b.d,
    }));
    rec(trace, "/search", { query: q }, out.map((e) => e.name), out.length);
    return out;
  },

  tags(trace: CallRecord[] | null): QlooTag[] {
    const names = [
      "Hiking", "Trail running", "Indie folk", "Documentary", "Specialty coffee", "Science",
      "Cast iron cooking", "Independent bookstores", "Board games", "Road trips", "Sustainability",
      "Ambient electronic", "Birdwatching", "Long-form journalism", "Craft beer", "Camping",
      ...THEMES,
    ];
    const uniq = [...new Set(names)].slice(0, 24);
    const tags = uniq.map((name, i) => ({
      id: `urn:tag:keyword:sample:${name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
      name,
      type: i % 3 === 0 ? "urn:tag:genre:media" : i % 3 === 1 ? "urn:tag:keyword:brand" : "urn:tag:style",
      affinity: Math.round((0.95 - i * 0.025) * 100) / 100,
    }));
    rec(trace, "/v2/insights", { "filter.type": "urn:tag" }, tags.slice(0, 5).map((t) => t.name), tags.length);
    return tags;
  },

  demographics(signal: string[], trace: CallRecord[] | null): QlooDemographics[] {
    const out = signal.map((id) => {
      const b = BRANDS.find((x) => `sample-brand-${x.id}` === id);
      const d = b ? b.parts.demographic : 1;
      const age = Object.fromEntries(
        AGE_KEYS.map((k, i) => [k, Math.round((AUDIENCE_AGE[i] * d + (1 - d) * (i % 2 ? 0.3 : -0.3)) * 100) / 100]),
      );
      return { id, age, gender: { male: 0.08 * d, female: -0.08 * d } };
    });
    rec(trace, "/v2/insights", { "filter.type": "urn:demographics" }, out.slice(0, 4).map((x) => x.id), out.length);
    return out;
  },

  brands(trace: CallRecord[] | null): QlooEntity[] {
    const tagPool = ["Hiking", "Trail running", "Specialty coffee", "Cast iron cooking", "Board games", "Road trips",
      "Sustainability", "Camping", "Science", "Documentary", "Independent bookstores", "Craft beer"];
    const out = BRANDS.map((b, i) => ({
      id: `sample-brand-${b.id}`,
      name: b.name,
      type: "brand",
      popularity: Math.round((1 - b.parts.novelty) * 100) / 100,
      affinity: b.parts.affinity,
      image: null,
      tags: tagPool.filter((_, j) => (j + i) % 3 !== 0).slice(0, Math.round(2 + b.parts.taste * 6)),
      disambiguation: b.category,
    }));
    rec(trace, "/v2/insights", { "filter.type": "urn:entity:brand" }, out.slice(0, 5).map((e) => e.name), out.length);
    return out;
  },

  heatmap(trace: CallRecord[] | null): QlooHeatCell[] {
    const cells = [
      [47.6, -122.3, 0.92], [39.7, -105.0, 0.88], [45.5, -122.7, 0.85], [30.3, -97.7, 0.83],
      [42.4, -71.1, 0.74], [41.9, -87.6, 0.7], [37.8, -122.4, 0.68], [35.6, -82.6, 0.64],
      [44.98, -93.27, 0.6], [40.7, -74.0, 0.55],
    ].map(([lat, lon, affinity]) => ({ lat, lon, affinity }));
    rec(trace, "/v2/insights", { "filter.type": "urn:heatmap" }, [`${cells.length} cells`], cells.length);
    return cells;
  },
};
