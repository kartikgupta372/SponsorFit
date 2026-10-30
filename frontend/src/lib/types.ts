/**
 * Types shaped like the responses the backend will return.
 * When the real API is wired in, only the data source changes, not these shapes.
 */

export type Platform = "podcast" | "youtube";

export interface Show {
  id: string;
  name: string;
  platform: Platform;
  host: string;
  category: string;
  /** Seed for the generative cover art, so each show keeps its own picture. */
  seed: number;
  reach: string;
  /** Average audience per episode or video, used by the rate advisor. */
  audience: number;
  topFit: number;
  analyzedOn: string;
}

/** The four parts of the Fit Score, each normalised 0..1. */
export interface ScoreParts {
  affinity: number;
  demographic: number;
  taste: number;
  novelty: number;
}

export type BrandScale = "Local" | "Regional" | "National";
export type BudgetTier = "$" | "$$" | "$$$";

export interface BrandMatch {
  id: string;
  name: string;
  category: string;
  scale: BrandScale;
  parts: ScoreParts;
  fit: number;
  reasons: string[];
  hiddenGem: boolean;
  budget: BudgetTier;
  /** Brand-safety category, if the brand belongs to a sensitive one. */
  safety?: "alcohol" | "gambling" | "adult";
  /** Hue (0-360) for the brand's monogram colour. */
  hue: number;
  blurb: string;
}

export interface AgeBucket {
  label: string;
  show: number;
  baseline: number;
}

export interface TasteItem {
  label: string;
  affinity: number;
}

export interface TasteDomain {
  domain: "Music" | "Film & TV" | "Dining" | "Travel";
  items: TasteItem[];
}

export interface CityHeat {
  city: string;
  lon: number;
  lat: number;
  intensity: number;
}

export type DealStage = "Pitched" | "Replied" | "Negotiating" | "Won" | "Lost";

export interface Deal {
  id: string;
  brandId: string;
  amount: number;
  stage: DealStage;
  lastActivity: string;
  note: string;
}

export interface AgentStep {
  key: string;
  title: string;
  detail: string;
  calls: string[];
}
