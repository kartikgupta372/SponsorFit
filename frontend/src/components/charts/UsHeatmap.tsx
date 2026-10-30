import type { CityHeat } from "@/lib/types";

/**
 * A lightweight audience heatmap: a dotted outline of the continental US with
 * glowing bubbles on cities. Pure SVG, no map library, so it stays tiny.
 * Real heat values will come from Qloo's heatmap insights.
 */

// Rough continental-US outline as [lon, lat] pairs (stylised on purpose).
const OUTLINE: [number, number][] = [
  [-124.7, 48.4], [-123, 46], [-124, 42], [-124.2, 40.3], [-122.5, 37.5], [-120.6, 34.5],
  [-117.1, 32.5], [-114.7, 32.7], [-111, 31.3], [-108.2, 31.3], [-106.5, 31.8], [-104.5, 29.6],
  [-103, 29], [-101.4, 29.8], [-99.5, 27.5], [-97.2, 25.9], [-97.4, 27.8], [-94.7, 29.4],
  [-91.5, 29.6], [-89.4, 29], [-89.6, 30.2], [-85.5, 29.7], [-84, 30], [-82.8, 27.8],
  [-81.8, 26.1], [-80.4, 25.2], [-80, 26.8], [-81.3, 29.9], [-81.4, 31.5], [-79, 33.5],
  [-76.5, 34.7], [-75.5, 35.3], [-76, 37], [-75.2, 38.4], [-74, 39.7], [-74, 40.5],
  [-72, 41], [-70, 41.7], [-70.6, 43], [-70, 43.8], [-67, 44.8], [-67.8, 47.1],
  [-69.2, 47.4], [-71.5, 45], [-75, 45], [-79, 43.3], [-82.5, 41.7], [-83, 42],
  [-82.4, 43.1], [-83.5, 45.3], [-84.8, 46.6], [-88, 48], [-89.6, 48], [-94.6, 48.7],
  [-95.2, 49], [-123, 49],
];

const W = 184;
const H = 101;
const px = (lon: number) => (lon + 125) * 3.1;
const py = (lat: number) => (49.6 - lat) * 4.1;

export function UsHeatmap({ cities }: { cities: CityHeat[] }) {
  const points = OUTLINE.map(([lon, lat]) => `${px(lon).toFixed(1)},${py(lat).toFixed(1)}`).join(" ");
  const ranked = [...cities].sort((a, b) => b.intensity - a.intensity);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Audience heatmap. Strongest cities: ${ranked
        .slice(0, 3)
        .map((c) => c.city)
        .join(", ")}`}
    >
      <defs>
        <pattern id="us-dots" width="3.6" height="3.6" patternUnits="userSpaceOnUse">
          <circle cx="1.8" cy="1.8" r="0.7" fill="#6d4a99" />
        </pattern>
        <clipPath id="us-clip">
          <polygon points={points} />
        </clipPath>
        <radialGradient id="us-glow">
          <stop offset="0" stopColor="#ff6a13" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#ef7fd8" stopOpacity="0.5" />
          <stop offset="1" stopColor="#8b5cf6" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g clipPath="url(#us-clip)">
        <rect width={W} height={H} fill="url(#us-dots)" />
      </g>
      <polygon points={points} fill="none" stroke="rgba(167,139,250,0.25)" strokeWidth="0.5" />

      {ranked.map((c, i) => {
        const r = 3 + (c.intensity / 100) * 9;
        const x = px(c.lon);
        const y = py(c.lat);
        return (
          <g key={c.city}>
            <circle cx={x} cy={y} r={r * 1.9} fill="url(#us-glow)" opacity={0.35 + c.intensity / 200} />
            {i < 3 && (
              <circle
                cx={x}
                cy={y}
                r={r}
                fill="none"
                stroke="#ff8a3d"
                strokeWidth="0.6"
                className="animate-pulse-ring"
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              />
            )}
            <circle cx={x} cy={y} r={1.6} fill="#fff" />
            <title>{`${c.city}: ${c.intensity}/100`}</title>
          </g>
        );
      })}
    </svg>
  );
}
