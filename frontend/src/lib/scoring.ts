import type { ScoreParts } from "./types";

/**
 * Fit Score, mirrored from the backend design:
 *   Fit = 100 x (0.45 A + 0.25 D + 0.20 T + 0.10 N)
 *
 *  A affinity, D demographic match, T taste overlap, N novelty (all 0..1).
 *
 * The real score is computed server-side (pure, tested functions). This copy
 * exists so the mock data on screen follows the same maths.
 */
export const FIT_WEIGHTS = {
  affinity: 0.45,
  demographic: 0.25,
  taste: 0.2,
  novelty: 0.1,
} as const;

export function fitScore(parts: ScoreParts): number {
  const raw =
    FIT_WEIGHTS.affinity * parts.affinity +
    FIT_WEIGHTS.demographic * parts.demographic +
    FIT_WEIGHTS.taste * parts.taste +
    FIT_WEIGHTS.novelty * parts.novelty;
  return Math.round(raw * 100);
}

/* ---- The four parts, each a pure function of Qloo data (0..1) ---- */

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/** Rescale Qloo affinities across the candidate set to 0.4..1 so the best brand anchors the scale. */
export function affinityPart(a: number | null, min: number, max: number): number {
  if (a === null) return 0.4;
  if (max - min < 1e-6) return clamp01(a);
  return 0.4 + 0.6 * clamp01((a - min) / (max - min));
}

/** Cosine similarity of two demographic over/under-index vectors, mapped from -1..1 to 0..1. */
export function demographicPart(a: Record<string, number>, b: Record<string, number>): number {
  const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])];
  if (!keys.length) return 0.5;
  let dot = 0, na = 0, nb = 0;
  for (const k of keys) {
    const x = a[k] ?? 0, y = b[k] ?? 0;
    dot += x * y; na += x * x; nb += y * y;
  }
  if (na === 0 || nb === 0) return 0.5;
  return clamp01((dot / Math.sqrt(na * nb) + 1) / 2);
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

/** Share of the brand's own tags that also appear in the audience's top taste tags. */
export function tastePart(brandTags: string[], audienceTags: string[]): { score: number; shared: string[] } {
  if (!brandTags.length) return { score: 0.3, shared: [] };
  const aud = audienceTags.map(norm);
  const shared = brandTags.filter((t) => {
    const n = norm(t);
    return aud.some((a) => a === n || (n.length > 3 && (a.includes(n) || n.includes(a))));
  });
  return { score: clamp01(shared.length / Math.min(brandTags.length, 5)), shared };
}

/** Less popular brands get more credit: they are cheaper and less crowded. */
export function noveltyPart(popularity: number | null): number {
  return popularity === null ? 0.5 : clamp01(1 - popularity);
}

export type FitLevel = "Strong" | "Good" | "Fair";

export function fitLevel(score: number): FitLevel {
  if (score >= 78) return "Strong";
  if (score >= 68) return "Good";
  return "Fair";
}
