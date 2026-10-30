/**
 * Shapes stored in Postgres and sent to the browser.
 * Shared by the agent (server) and the screens (client).
 */
import type { ScoreParts } from "./types";

export type Platform = "podcast" | "youtube";
export type Source = "qloo" | "sample";
export type DealStage = "Pitched" | "Replied" | "Negotiating" | "Won" | "Lost";
export type Tone = "Casual" | "Professional" | "Bold";

export interface SeedEntity {
  id: string;
  name: string;
  type: string;
}

export interface ShowRow {
  id: string;
  user_id: string;
  name: string;
  platform: Platform;
  audience_size: number;
  qloo_entity_id: string | null;
  seed_entities: SeedEntity[];
  created_at: string;
}

export interface TasteItem {
  label: string;
  affinity: number; // 0..100
}
export interface TasteDomain {
  domain: string;
  items: TasteItem[];
}
export interface IndexBar {
  label: string;
  index: number; // -100..100, Qloo over/under-index
}
export interface HeatPoint {
  city: string;
  lat: number;
  lon: number;
  intensity: number; // 0..100
}
export interface EpisodeIdea {
  title: string;
  why: string;
}

export interface AudienceProfile {
  summary?: string;
  themes: string[];
  domains: TasteDomain[];
  age: IndexBar[];
  gender: IndexBar[];
  heat: HeatPoint[];
  episodeIdeas: EpisodeIdea[];
  audienceTags: string[];
  ageRaw?: Record<string, number>;
}

export interface TraceCall {
  step: string;
  endpoint: string;
  params: Record<string, string>;
  count: number;
  ms: number;
  cached: boolean;
  status: string;
  preview: string[];
}

export interface AnalysisRow {
  id: string;
  user_id: string;
  show_id: string;
  status: "queued" | "running" | "complete" | "failed";
  source: Source;
  profile: AudienceProfile | Record<string, never>;
  trace: TraceCall[];
  without_qloo: string[];
  qloo_calls: number;
  error: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface MatchRow {
  id: string;
  analysis_id: string;
  user_id: string;
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
  created_at: string;
}

export interface FollowUp {
  when: string;
  subject: string;
  body: string;
}

export interface PitchRow {
  id: string;
  user_id: string;
  match_id: string;
  tone: Tone;
  subject: string;
  body: string;
  follow_ups: FollowUp[];
  ad_read: string;
  updated_at: string;
}

export interface DealRow {
  id: string;
  user_id: string;
  match_id: string;
  stage: DealStage;
  amount: number;
  note: string;
  updated_at: string;
}

export interface KitData {
  show: { name: string; platform: Platform; audience: number; host?: string };
  brand: { name: string; category: string; fit: number; parts: ScoreParts; reasons: string[]; tags: string[] };
  audience: { age: IndexBar[]; brandAge: IndexBar[]; themes: string[] };
  rate: { low: number; high: number };
  source: Source;
}

export interface KitRow {
  slug: string;
  user_id: string;
  match_id: string;
  data: KitData;
  views: number;
  created_at: string;
}

export interface ProfileRow {
  id: string;
  display_name: string | null;
  safety: { alcohol: boolean; gambling: boolean; adult: boolean };
  existing_sponsors: string[];
}

/* ---- Helpers shared by server and client ---- */

export const AGE_LABELS: Record<string, string> = {
  "24_and_younger": "Under 25",
  "25_to_29": "25-29",
  "30_to_34": "30-34",
  "35_and_younger": "Under 35",
  "35_to_44": "35-44",
  "36_to_55": "36-55",
  "45_to_54": "45-54",
  "55_and_older": "55+",
};

export function ageBars(raw: Record<string, number> | undefined): IndexBar[] {
  if (!raw) return [];
  return Object.entries(raw).map(([k, v]) => ({ label: AGE_LABELS[k] ?? k.replace(/_/g, " "), index: Math.round(v * 100) }));
}

/** Rate advisor: CPM range times audience, nudged by fit. Guidance, not a quote. */
export const CPM = { low: 18, high: 30 } as const;
export function rateFor(audience: number, fit: number) {
  const multiplier = 0.8 + (fit / 100) * 0.5;
  const round = (n: number) => Math.max(50, Math.round(n / 50) * 50);
  return {
    low: round((audience / 1000) * CPM.low * multiplier),
    high: round((audience / 1000) * CPM.high * multiplier),
    multiplier,
  };
}

export const compact = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${Math.round(n / 1000)}K` : String(n);

/** Stable small hash so each brand/show gets its own colour and cover art. */
export function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}
export const hueOf = (s: string) => hashSeed(s) % 360;
