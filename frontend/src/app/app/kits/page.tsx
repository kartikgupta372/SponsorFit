import Link from "next/link";
import { Eye, ExternalLink, FileText } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { BrandMark } from "@/components/art/BrandMark";
import { FitRing } from "@/components/charts/FitRing";
import { session } from "@/lib/server/data";
import { hueOf, type KitRow } from "@/lib/model";

export const metadata = { title: "Media kits | SponsorFit" };
export const dynamic = "force-dynamic";

export default async function KitsPage() {
  const { sb } = await session();
  const { data } = await sb.from("kits").select("*").order("created_at", { ascending: false });
  const kits = (data ?? []) as KitRow[];
  return (
    <div>
      <PageHeader eyebrow="Media kits" title="Your media kits" subtitle="One shareable page per brand, with the proof built in. See how often each one is opened." />
      {kits.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 px-6 py-16 text-center">
          <FileText className="mx-auto text-ink-faint" size={30} />
          <h2 className="mt-4 font-display text-2xl font-semibold">No published kits yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">Open a sponsor and press Publish media kit to get a link you can send.</p>
          <Button href="/app/sponsors" className="mt-6">Go to sponsors</Button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {kits.map((k) => (
            <article key={k.slug} className="surface flex flex-col p-5 sm:p-6">
              <div className="flex items-start justify-between">
                <BrandMark name={k.data.brand.name} hue={hueOf(k.data.brand.name)} size={52} />
                <FitRing score={k.data.brand.fit} size={56} stroke={6} label={false} />
              </div>
              <h2 className="mt-4 text-lg font-semibold">{k.data.brand.name}</h2>
              <p className="mt-1 flex-1 text-sm text-ink-muted">For {k.data.show.name} · {k.data.brand.category}</p>
              <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4">
                <span className="flex items-center gap-1.5 text-sm text-ink-muted"><Eye size={15} /> {k.views} views</span>
                <div className="flex items-center gap-3 text-sm font-medium">
                  <Link href={`/app/sponsors/${k.match_id}`} className="text-violet-300 hover:text-orchid-300">Brand</Link>
                  <Link href={`/kit/${k.slug}`} target="_blank" className="flex items-center gap-1 text-violet-300 hover:text-orchid-300">Public <ExternalLink size={13} /></Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
