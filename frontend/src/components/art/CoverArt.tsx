import { cn } from "@/lib/cn";

/**
 * Generative cover art.
 * Same seed, same picture, every time. No image files, no network, tiny.
 * Real show artwork will replace this once the Qloo entity images are wired in.
 */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PALETTES = [
  ["#3a1f5f", "#ef7fd8", "#ff6a13", "#8b5cf6"],
  ["#2a1548", "#8b5cf6", "#f5a3e6", "#ff8a3d"],
  ["#4d2b7a", "#ff8a3d", "#ef7fd8", "#c4b5fd"],
  ["#1a0b2e", "#e25bc6", "#8b5cf6", "#ff6a13"],
];

export function CoverArt({
  seed,
  className,
  rounded = true,
}: {
  seed: number;
  className?: string;
  rounded?: boolean;
}) {
  const rnd = mulberry32(seed * 9973 + 17);
  const [bg, c1, c2, c3] = PALETTES[seed % PALETTES.length];
  const id = `cover-${seed}`;

  const sunX = 60 + rnd() * 80;
  const sunY = 50 + rnd() * 60;
  const sunR = 26 + rnd() * 22;

  const rings = Array.from({ length: 4 }, (_, i) => ({
    r: sunR + 18 + i * (14 + rnd() * 6),
    w: 1.2 + rnd() * 1.4,
    o: 0.5 - i * 0.1,
  }));

  const bars = Array.from({ length: 22 }, (_, i) => {
    const h = 6 + rnd() * 46 * (0.4 + 0.6 * Math.sin((i / 21) * Math.PI));
    return { x: 14 + i * 8, h };
  });

  return (
    <svg
      viewBox="0 0 200 200"
      className={cn("block h-full w-full", rounded && "rounded-[inherit]", className)}
      role="img"
      aria-label="Abstract cover art"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={bg} />
          <stop offset="1" stopColor="#12061f" />
        </linearGradient>
        <radialGradient id={`${id}-sun`} cx="0.35" cy="0.3" r="0.9">
          <stop offset="0" stopColor={c2} />
          <stop offset="0.55" stopColor={c1} />
          <stop offset="1" stopColor={c3} />
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill={`url(#${id}-bg)`} />
      {rings.map((ring, i) => (
        <circle
          key={i}
          cx={Math.round(sunX * 100) / 100}
          cy={Math.round(sunY * 100) / 100}
          r={Math.round(ring.r * 100) / 100}
          fill="none"
          stroke={c1}
          strokeWidth={ring.w}
          opacity={Math.round(ring.o * 100) / 100}
        />
      ))}
      <circle cx={Math.round(sunX * 100) / 100} cy={Math.round(sunY * 100) / 100} r={Math.round(sunR * 100) / 100} fill={`url(#${id}-sun)`} />
      <g opacity="0.9">
        {bars.map((b, i) => (
          <rect
            key={i}
            x={b.x}
            y={Math.round((196 - b.h) * 100) / 100}
            width="4.5"
            height={Math.round(b.h * 100) / 100}
            rx="2.25"
            fill={i % 3 === 0 ? c2 : c3}
            opacity={Math.round((0.35 + (i % 4) * 0.15) * 100) / 100}
          />
        ))}
      </g>
    </svg>
  );
}
