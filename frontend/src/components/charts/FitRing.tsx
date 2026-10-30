"use client";

import { useEffect, useId, useState } from "react";
import { cn } from "@/lib/cn";

/** Circular Fit Score gauge. The arc draws in on mount. */
export function FitRing({
  score,
  size = 88,
  stroke = 8,
  label = true,
  tone = "dark",
  className,
}: {
  score: number;
  size?: number;
  stroke?: number;
  label?: boolean;
  /** "light" is for use on pale backgrounds such as the media kit. */
  tone?: "dark" | "light";
  className?: string;
}) {
  const gid = useId().replace(/:/g, "");
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - (drawn ? score : 0) / 100);

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Fit score ${score} out of 100`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8b5cf6" />
            <stop offset="0.5" stopColor="#ef7fd8" />
            <stop offset="1" stopColor="#ff6a13" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tone === "light" ? "rgba(26,11,46,0.1)" : "rgba(255,255,255,0.08)"}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-display font-semibold leading-none"
          style={{ fontSize: size * 0.34, color: tone === "light" ? "#1a0b2e" : "#f6eeff" }}
        >
          {score}
        </span>
        {label && size >= 80 && (
          <span
            className="mt-0.5 text-[10px] font-medium uppercase tracking-widest"
            style={{ color: tone === "light" ? "#6b5a86" : "#a691c6" }}
          >
            Fit
          </span>
        )}
      </div>
    </div>
  );
}
