import Link from "next/link";
import { notFound } from "next/navigation";
import { AutoPrint } from "@/components/kit/AutoPrint";
import { KitDocument } from "@/components/kit/KitDocument";
import { supabaseServer } from "@/lib/supabase/server";
import type { KitRow } from "@/lib/model";

export const dynamic = "force-dynamic";

async function getKit(slug: string) {
  const sb = await supabaseServer();
  const { data } = await sb.from("kits").select("*").eq("slug", slug).maybeSingle();
  return data as KitRow | null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const kit = await getKit(slug);
  if (!kit) return { title: "Media kit | SponsorFit" };
  return {
    title: `${kit.data.show.name} x ${kit.data.brand.name}: media kit | SponsorFit`,
    description: `${kit.data.show.name}'s audience scores ${kit.data.brand.fit}/100 for fit with ${kit.data.brand.name}, measured with Qloo's taste graph.`,
  };
}

/** Public, brand-facing media kit. No login required. */
export default async function PublicKitPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const kit = await getKit(slug);
  if (!kit) notFound();
  const sb = await supabaseServer();
  await sb.rpc("bump_kit_view", { kit_slug: slug });
  return (
    <div className="min-h-dvh bg-eggplant-950 px-3 py-6 print:bg-white print:p-0 sm:px-6 sm:py-10">
      <AutoPrint />
      <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl shadow-lift print:rounded-none print:shadow-none">
        <KitDocument data={kit.data} />
      </div>
      <p className="mx-auto mt-6 max-w-3xl text-center text-xs text-ink-faint print:hidden">
        Created with{" "}
        <Link href="/" className="text-violet-300 underline hover:text-orchid-300">SponsorFit</Link>
      </p>
    </div>
  );
}
