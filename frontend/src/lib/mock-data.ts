import { fitScore } from "./scoring";
import type {
  AgeBucket,
  AgentStep,
  BrandMatch,
  BrandScale,
  BudgetTier,
  CityHeat,
  Deal,
  ScoreParts,
  Show,
  TasteDomain,
} from "./types";

/* ------------------------------------------------------------------ *
 * SAMPLE DATA. Every show, host and brand below is fictional.
 * The shapes match the backend API, so swapping in live Qloo-powered
 * data later only changes where these values come from.
 * ------------------------------------------------------------------ */

export const SHOWS: Show[] = [
  {
    id: "the-deep-dive",
    name: "The Deep Dive",
    platform: "podcast",
    host: "Jordan Reyes",
    category: "Science & Culture",
    seed: 7,
    reach: "42K listeners / episode",
    audience: 42000,
    topFit: 84,
    analyzedOn: "Today, 6:42 PM",
  },
  {
    id: "forkful",
    name: "Forkful",
    platform: "youtube",
    host: "Amara Lindqvist",
    category: "Home Cooking",
    seed: 19,
    reach: "186K subscribers",
    audience: 38000,
    topFit: 81,
    analyzedOn: "Yesterday",
  },
  {
    id: "zero-to-seed",
    name: "Zero to Seed",
    platform: "podcast",
    host: "Dev Malhotra",
    category: "Startups",
    seed: 31,
    reach: "18K listeners / episode",
    audience: 18000,
    topFit: 77,
    analyzedOn: "3 days ago",
  },
];

export const DEFAULT_SHOW_ID = "the-deep-dive";

export function getShow(id: string): Show {
  return SHOWS.find((s) => s.id === id) ?? SHOWS[0];
}

function brand(
  id: string,
  name: string,
  category: string,
  scale: BrandScale,
  parts: ScoreParts,
  budget: BudgetTier,
  hue: number,
  blurb: string,
  reasons: string[],
  hiddenGem = false,
  safety?: BrandMatch["safety"],
): BrandMatch {
  return {
    id,
    name,
    category,
    scale,
    parts,
    fit: fitScore(parts),
    reasons,
    hiddenGem,
    budget,
    hue,
    blurb,
    safety,
  };
}

export const BRANDS: BrandMatch[] = [
  brand(
    "trailhead-supply",
    "Trailhead Supply Co.",
    "Outdoor gear",
    "National",
    { affinity: 0.92, demographic: 0.84, taste: 0.78, novelty: 0.6 },
    "$$$",
    24,
    "Durable packs and trail apparel built for long weekends outside.",
    [
      "Listeners over-index on hiking and trail running",
      "Strong match on the 25-44 age band",
      "Shares 6 of the show's top 8 themes",
    ],
  ),
  brand(
    "kiln-ember",
    "Kiln & Ember",
    "Cookware",
    "Regional",
    { affinity: 0.85, demographic: 0.76, taste: 0.82, novelty: 0.78 },
    "$$",
    12,
    "Small-batch cast iron and ceramics for people who cook from scratch.",
    [
      "Audience loves slow, hands-on food culture",
      "Rarely pitched by shows this size",
      "High overlap with the show's dining tastes",
    ],
    true,
  ),
  brand(
    "fieldnote-press",
    "Fieldnote Press",
    "Books & journals",
    "Regional",
    { affinity: 0.8, demographic: 0.72, taste: 0.85, novelty: 0.86 },
    "$",
    280,
    "Independent publisher of field guides, notebooks and nature writing.",
    [
      "Listeners favour long-form non-fiction",
      "Top theme overlap of any brand on this list",
      "Low competition for this audience's attention",
    ],
    true,
  ),
  brand(
    "brightleaf-coffee",
    "Brightleaf Coffee",
    "Coffee",
    "National",
    { affinity: 0.88, demographic: 0.8, taste: 0.74, novelty: 0.45 },
    "$$",
    32,
    "Single-origin beans roasted in small batches and shipped fresh.",
    [
      "Coffee culture is a top-three audience theme",
      "Demographic profile matches closely",
      "Works well as a recurring host-read",
    ],
  ),
  brand(
    "pocket-atlas",
    "Pocket Atlas",
    "Travel app",
    "National",
    { affinity: 0.83, demographic: 0.88, taste: 0.66, novelty: 0.52 },
    "$$$",
    200,
    "Offline maps and curated itineraries for slow travel.",
    [
      "Audience over-indexes on road trips and national parks",
      "Best demographic match on the list",
      "Seasonal fit for spring and summer episodes",
    ],
  ),
  brand(
    "moss-mortar",
    "Moss & Mortar",
    "Houseplants",
    "Regional",
    { affinity: 0.76, demographic: 0.7, taste: 0.71, novelty: 0.82 },
    "$",
    150,
    "Rare houseplants and planters delivered in compostable packaging.",
    [
      "Sustainable-living theme runs strong",
      "Few creators in this niche are pitching them",
      "Good fit for a giveaway format",
    ],
    true,
  ),
  brand(
    "tidewater-spirits",
    "Tidewater Spirits",
    "Craft spirits",
    "Regional",
    { affinity: 0.81, demographic: 0.74, taste: 0.7, novelty: 0.55 },
    "$$",
    340,
    "Small-batch coastal distillery.",
    [
      "Strong taste overlap with dining and travel",
      "Hidden by your brand-safety setting (alcohol)",
    ],
    false,
    "alcohol",
  ),
  brand(
    "quillfeather-audio",
    "Quillfeather Audio",
    "Headphones",
    "National",
    { affinity: 0.74, demographic: 0.82, taste: 0.62, novelty: 0.4 },
    "$$$",
    260,
    "Studio-tuned headphones for focused listening.",
    [
      "Audio-first audience that listens on commutes",
      "Strong match on the 25-34 age band",
    ],
  ),
  brand(
    "wildroot-provisions",
    "Wildroot Provisions",
    "Snacks",
    "Regional",
    { affinity: 0.69, demographic: 0.66, taste: 0.69, novelty: 0.74 },
    "$",
    95,
    "Foraged-ingredient trail mixes and jerky.",
    [
      "Pairs naturally with the outdoors theme",
      "Under-pitched among shows this size",
    ],
    true,
  ),
  brand(
    "harbor-hale",
    "Harbor & Hale",
    "Menswear",
    "National",
    { affinity: 0.71, demographic: 0.77, taste: 0.58, novelty: 0.35 },
    "$$",
    215,
    "Everyday workwear with a coastal sensibility.",
    [
      "Good demographic match",
      "Moderate taste overlap, strongest in travel",
    ],
  ),
  brand(
    "lumen-lamp",
    "Lumen Lamp Co.",
    "Lighting",
    "Regional",
    { affinity: 0.66, demographic: 0.64, taste: 0.6, novelty: 0.8 },
    "$$",
    50,
    "Warm, sculptural lamps made by small studios.",
    [
      "Audience values design and craft",
      "Very little competing sponsor activity",
    ],
    true,
  ),
  brand(
    "daybreak-roasters",
    "Daybreak Roasters",
    "Coffee",
    "Regional",
    { affinity: 0.72, demographic: 0.7, taste: 0.66, novelty: 0.58 },
    "$$",
    18,
    "Dark and medium roasts delivered on a weekly subscription.",
    [
      "Coffee culture runs strong in your audience",
      "Competes directly with an existing sponsor",
    ],
  ),
  brand(
    "cinder-kitchen",
    "Cinder Kitchen",
    "Meal kits",
    "National",
    { affinity: 0.64, demographic: 0.7, taste: 0.55, novelty: 0.5 },
    "$$",
    8,
    "Chef-designed meal kits with seasonal menus.",
    [
      "Dining taste overlap is solid",
      "Competes with more established meal-kit sponsors",
    ],
  ),
].sort((a, b) => b.fit - a.fit);

export function getBrand(id: string): BrandMatch {
  return BRANDS.find((b) => b.id === id) ?? BRANDS[0];
}

/* ---------------- Audience ---------------- */

export const AGE_BUCKETS: AgeBucket[] = [
  { label: "18-24", show: 14, baseline: 16 },
  { label: "25-34", show: 38, baseline: 22 },
  { label: "35-44", show: 27, baseline: 19 },
  { label: "45-54", show: 13, baseline: 17 },
  { label: "55+", show: 8, baseline: 26 },
];

export const GENDER_SPLIT = [
  { label: "Women", show: 41, baseline: 51 },
  { label: "Men", show: 57, baseline: 48 },
  { label: "Another gender", show: 2, baseline: 1 },
];

export const TASTES: TasteDomain[] = [
  {
    domain: "Music",
    items: [
      { label: "Indie folk", affinity: 91 },
      { label: "Ambient electronic", affinity: 84 },
      { label: "Jazz fusion", affinity: 76 },
      { label: "Post-rock", affinity: 71 },
    ],
  },
  {
    domain: "Film & TV",
    items: [
      { label: "Nature documentaries", affinity: 94 },
      { label: "Slow-burn sci-fi", affinity: 82 },
      { label: "Heist thrillers", affinity: 70 },
      { label: "Cooking competitions", affinity: 66 },
    ],
  },
  {
    domain: "Dining",
    items: [
      { label: "Third-wave coffee shops", affinity: 93 },
      { label: "Farm-to-table", affinity: 85 },
      { label: "Ramen counters", affinity: 78 },
      { label: "Food halls", affinity: 69 },
    ],
  },
  {
    domain: "Travel",
    items: [
      { label: "National parks", affinity: 95 },
      { label: "Road trips", affinity: 88 },
      { label: "Hostel-to-boutique", affinity: 72 },
      { label: "Train journeys", affinity: 68 },
    ],
  },
];

export const THEMES = [
  "Outdoors",
  "Long-form curiosity",
  "Coffee culture",
  "Documentary",
  "Trail running",
  "Indie bookstores",
  "Maker & craft",
  "Sustainable living",
  "Road trips",
  "Board games",
  "Birdwatching",
  "Film photography",
];

export const CITIES: CityHeat[] = [
  { city: "Seattle", lon: -122.3, lat: 47.6, intensity: 92 },
  { city: "Denver", lon: -105.0, lat: 39.7, intensity: 88 },
  { city: "Portland", lon: -122.7, lat: 45.5, intensity: 85 },
  { city: "Austin", lon: -97.7, lat: 30.3, intensity: 83 },
  { city: "Boston", lon: -71.1, lat: 42.4, intensity: 74 },
  { city: "Chicago", lon: -87.6, lat: 41.9, intensity: 70 },
  { city: "New York", lon: -74.0, lat: 40.7, intensity: 68 },
  { city: "Minneapolis", lon: -93.3, lat: 45.0, intensity: 61 },
  { city: "Nashville", lon: -86.8, lat: 36.2, intensity: 57 },
  { city: "Atlanta", lon: -84.4, lat: 33.7, intensity: 52 },
  { city: "San Diego", lon: -117.2, lat: 32.7, intensity: 49 },
];

/* ---------------- Agent run ---------------- */

export const AGENT_STEPS: AgentStep[] = [
  {
    key: "resolve",
    title: "Resolve",
    detail: "Finding your show in the taste graph",
    calls: ["Entity search"],
  },
  {
    key: "profile",
    title: "Profile",
    detail: "Reading who listens and what they love",
    calls: ["Demographics", "Audience themes", "Music tastes", "Film & TV tastes", "Dining tastes", "Travel tastes", "Heatmap"],
  },
  {
    key: "discover",
    title: "Discover",
    detail: "Collecting candidate brands",
    calls: ["Brands by show", "Brands by top theme", "Brands by 2nd theme"],
  },
  {
    key: "enrich",
    title: "Enrich",
    detail: "Profiling each brand's own audience",
    calls: ["Brand demographics x 24"],
  },
  {
    key: "score",
    title: "Score",
    detail: "Computing Fit Scores (no AI, pure maths)",
    calls: ["Fit Score x 48"],
  },
  {
    key: "critic",
    title: "Critic",
    detail: "Removing misfits and writing the reasons",
    calls: ["Brand-safety check", "Reason chips"],
  },
  {
    key: "generate",
    title: "Generate",
    detail: "Drafting media kits and pitches",
    calls: ["Media kit x 5", "Pitch email x 5"],
  },
];

/* ---------------- Pipeline ---------------- */

export const DEALS: Deal[] = [
  { id: "d1", brandId: "trailhead-supply", amount: 2400, stage: "Negotiating", lastActivity: "2 days ago", note: "Asked for a 3-episode bundle." },
  { id: "d2", brandId: "kiln-ember", amount: 1200, stage: "Replied", lastActivity: "Yesterday", note: "Wants to see the media kit PDF." },
  { id: "d3", brandId: "brightleaf-coffee", amount: 1800, stage: "Won", lastActivity: "5 days ago", note: "Signed for 6 host-reads." },
  { id: "d4", brandId: "fieldnote-press", amount: 600, stage: "Pitched", lastActivity: "Today", note: "Follow-up scheduled in 3 days." },
  { id: "d5", brandId: "pocket-atlas", amount: 2000, stage: "Pitched", lastActivity: "3 days ago", note: "No reply yet." },
  { id: "d6", brandId: "moss-mortar", amount: 500, stage: "Won", lastActivity: "1 week ago", note: "Giveaway episode live." },
  { id: "d7", brandId: "quillfeather-audio", amount: 1500, stage: "Lost", lastActivity: "2 weeks ago", note: "Budget frozen this quarter." },
  { id: "d8", brandId: "wildroot-provisions", amount: 450, stage: "Replied", lastActivity: "Today", note: "Sent sample box offer." },
  { id: "d9", brandId: "cinder-kitchen", amount: 900, stage: "Pitched", lastActivity: "4 days ago", note: "Follow-up queued." },
  { id: "d10", brandId: "harbor-hale", amount: 1100, stage: "Pitched", lastActivity: "Today", note: "Awaiting first reply." },
  { id: "d11", brandId: "lumen-lamp", amount: 700, stage: "Pitched", lastActivity: "6 days ago", note: "Second follow-up due." },
];

/** Dashboard numbers are derived from the deals, so they always agree with the pipeline. */
export function dealStats() {
  const sent = DEALS.length;
  const replied = DEALS.filter((d) => d.stage !== "Pitched").length;
  const won = DEALS.filter((d) => d.stage === "Won");
  return {
    sent,
    replyRate: Math.round((replied / sent) * 100),
    wonCount: won.length,
    wonValue: won.reduce((sum, d) => sum + d.amount, 0),
    open: DEALS.filter((d) => d.stage === "Replied" || d.stage === "Negotiating").length,
  };
}

/* ---------------- Pitch copy ---------------- */

export type Tone = "Casual" | "Professional" | "Bold";

export function pitchFor(brandId: string, showId: string, tone: Tone) {
  const b = getBrand(brandId);
  const s = getShow(showId);
  const top = b.reasons[0].toLowerCase();
  const subject: Record<Tone, string> = {
    Casual: `${s.name} listeners already love ${b.category.toLowerCase()}. Want to chat?`,
    Professional: `Partnership proposal: ${s.name} x ${b.name}`,
    Bold: `Your next customers are already listening to ${s.name}`,
  };
  const open: Record<Tone, string> = {
    Casual: `Hi there,\n\nI host ${s.name}, and I think we should work together.`,
    Professional: `Hello,\n\nI am the host of ${s.name}, a ${s.category.toLowerCase()} ${s.platform === "podcast" ? "podcast" : "channel"} with ${s.reach}.`,
    Bold: `Hi,\n\nI'll skip the small talk: the audience of ${s.name} is a better fit for ${b.name} than most channels you are probably paying for.`,
  };
  const body = `${open[tone]}

I analysed my audience against Qloo's taste data, and ${b.name} came out as a ${b.fit}/100 match. The short version: ${top}. My listeners also match your customer profile closely (${Math.round(b.parts.demographic * 100)}% demographic match).

Here is what I would suggest:
  - A host-read ad in 3 episodes, placed mid-roll
  - A dedicated segment where I try ${b.name} on air
  - A discount code so we can measure results together

I have put together a one-page media kit with the data behind this. Happy to send it over, or hop on a 15-minute call whenever suits you.

Best,
[Your name]`;
  return { subject: subject[tone], body };
}

export function followUps(brandId: string, showId: string) {
  const b = getBrand(brandId);
  const s = getShow(showId);
  return [
    {
      when: "After 3 days",
      subject: `Re: ${s.name} x ${b.name}`,
      body: `Hi again,\n\nJust floating this back to the top of your inbox. The media kit has the audience data behind the ${b.fit}/100 match, and I can tailor the offer to your launch calendar.\n\nBest,\n[Your name]`,
    },
    {
      when: "After 8 days",
      subject: `Last note on ${s.name} x ${b.name}`,
      body: `Hi,\n\nI do not want to crowd your inbox, so this is my last note. If the timing is wrong, I would love to be considered for your next campaign window.\n\nThanks for reading,\n[Your name]`,
    },
  ];
}

export function adRead(brandId: string, showId: string) {
  const b = getBrand(brandId);
  const s = getShow(showId);
  return `This episode of ${s.name} is brought to you by ${b.name}. ${b.blurb} I have been trying them out for the past few weeks and I will be honest: it fits right into the kind of things we talk about on this show. If you want to check them out, head to their site and use my code for a little something off. That is ${b.name}, and thank you for supporting the show.`;
}

/* ---------------- Rate advisor ---------------- */

/** Assumed mid-roll CPM range in USD (cost per 1,000 listeners). A starting point, not a market quote. */
export const CPM_RANGE = { low: 18, high: 30 } as const;

export function rateRange(audience: number, fit: number) {
  // Better-fitting brands get more value from the audience, so the multiplier rewards fit.
  const multiplier = 0.9 + (fit - 70) / 100;
  const per = audience / 1000;
  const round = (n: number) => Math.round(n / 10) * 10;
  return {
    low: round(per * CPM_RANGE.low * multiplier),
    high: round(per * CPM_RANGE.high * multiplier),
    multiplier,
  };
}

/** Age mix of a brand's customers: the show's mix pulled toward baseline as demographic match falls. */
export function brandAgeMix(demographic: number) {
  const raw = AGE_BUCKETS.map((b) => demographic * b.show + (1 - demographic) * b.baseline);
  const total = raw.reduce((a, b) => a + b, 0);
  return raw.map((v) => Math.round((v / total) * 100));
}

/** Stable pseudo view count for the media-kit page. */
export function kitViews(brandId: string) {
  let h = 3;
  for (const ch of brandId) h = (h * 17 + ch.charCodeAt(0)) % 61;
  return h + 4;
}
