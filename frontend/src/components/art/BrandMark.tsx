import { cn } from "@/lib/cn";

/** Monogram tile standing in for a brand logo. Colour comes from the brand's hue. */
export function BrandMark({
  name,
  hue,
  size = 48,
  className,
}: {
  name: string;
  hue: number;
  size?: number;
  className?: string;
}) {
  const letters = name
    .replace(/[^A-Za-z& ]/g, "")
    .split(" ")
    .filter((w) => w && w !== "&")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl font-display font-semibold text-white",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(135deg, hsl(${hue} 72% 58%), hsl(${(hue + 40) % 360} 70% 36%))`,
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.18)",
      }}
    >
      {letters}
    </div>
  );
}
