import Link from "next/link";
import { Eye, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { BrandMark } from "@/components/art/BrandMark";
import { FitRing } from "@/components/charts/FitRing";
import { BRANDS, kitViews } from "@/lib/mock-data";

export const metadata = { title: "Media kits | SponsorFit" };

export default function KitsPage() {
  const kits = BRANDS.filter((b) => !b.safety).slice(0, 6);
  return (
    <div>
      <PageHeader
        eyebrow="Media kits"
        title="Your media kits"
        subtitle="One shareable page per brand, with the proof built in. See when a brand opens yours."
      />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {kits.map((b) => (
          <article key={b.id} className="surface flex flex-col p-5 sm:p-6">
            <div className="flex items-start justify-between">
              <BrandMark name={b.name} hue={b.hue} size={52} />
              <FitRing score={b.fit} size={56} stroke={6} label={false} />
            </div>
            <h2 className="mt-4 text-lg font-semibold">{b.name}</h2>
            <p className="mt-1 flex-1 text-sm text-ink-muted">{b.category}</p>
            <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4">
              <span className="flex items-center gap-1.5 text-sm text-ink-muted">
                <Eye size={15} /> {kitViews(b.id)} views
              </span>
              <div className="flex items-center gap-3 text-sm font-medium">
                <Link href={`/app/sponsors/${b.id}`} className="text-violet-300 hover:text-orchid-300">Edit</Link>
                <Link href={`/kit/${b.id}`} target="_blank" className="flex items-center gap-1 text-violet-300 hover:text-orchid-300">
                  Public <ExternalLink size={13} />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
