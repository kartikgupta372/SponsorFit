import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Chip } from "@/components/ui/Chip";
import { BrandMark } from "@/components/art/BrandMark";
import { BRANDS, DEALS } from "@/lib/mock-data";

export const metadata = { title: "Pitches | SponsorFit" };

const STAGE_TONE = {
  Pitched: "violet",
  Replied: "orchid",
  Negotiating: "signal",
  Won: "mint",
  Lost: "neutral",
} as const;

export default function PitchesPage() {
  const rows = BRANDS.filter((b) => !b.safety).slice(0, 9);
  return (
    <div>
      <PageHeader
        eyebrow="Pitches"
        title="Your pitches"
        subtitle="A draft is ready for each of your best-fit brands. Open one to adjust the tone and send."
      />
      <ul className="space-y-3">
        {rows.map((b) => {
          const deal = DEALS.find((d) => d.brandId === b.id);
          return (
            <li key={b.id}>
              <Link
                href={`/app/pitches/${b.id}`}
                className="surface group flex items-center gap-4 p-4 transition-colors hover:border-orchid-400/40 sm:p-5"
              >
                <BrandMark name={b.name} hue={b.hue} size={46} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold group-hover:text-orchid-300">{b.name}</span>
                  <span className="mt-0.5 block truncate text-sm text-ink-muted">{b.reasons[0]}</span>
                </span>
                <span className="hidden text-sm tabular-nums text-ink-muted sm:block">Fit {b.fit}</span>
                <Chip tone={deal ? STAGE_TONE[deal.stage] : "neutral"}>{deal ? deal.stage : "Draft ready"}</Chip>
                <ArrowRight size={17} className="text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-orchid-300" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
