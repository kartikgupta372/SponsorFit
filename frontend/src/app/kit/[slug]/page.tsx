import Link from "next/link";
import { AutoPrint } from "@/components/kit/AutoPrint";
import { KitDocument } from "@/components/kit/KitDocument";
import { DEFAULT_SHOW_ID, getBrand } from "@/lib/mock-data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = getBrand(slug);
  return { title: `Media kit for ${brand.name} | SponsorFit` };
}

/** Public, brand-facing media kit. No login required. */
export default async function PublicKitPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = getBrand(slug);
  return (
    <div className="min-h-dvh bg-eggplant-950 px-3 py-6 print:bg-white print:p-0 sm:px-6 sm:py-10">
      <AutoPrint />
      <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl shadow-lift print:rounded-none print:shadow-none">
        <KitDocument brandId={brand.id} showId={DEFAULT_SHOW_ID} />
      </div>
      <p className="mx-auto mt-6 max-w-3xl text-center text-xs text-ink-faint print:hidden">
        Created with{" "}
        <Link href="/" className="text-violet-300 underline hover:text-orchid-300">SponsorFit</Link>
      </p>
    </div>
  );
}
