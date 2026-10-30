import { redirect } from "next/navigation";
import { SponsorsView } from "@/components/sponsors/SponsorsView";
import { loadAnalysis, loadProfile } from "@/lib/server/data";

export const metadata = { title: "Sponsors | SponsorFit" };
export const dynamic = "force-dynamic";

export default async function SponsorsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ analysis, show, matches }, prefs] = await Promise.all([loadAnalysis(id), loadProfile()]);
  if (analysis.status !== "complete") redirect(`/app/runs/${id}`);
  return <SponsorsView analysis={analysis} show={show} matches={matches} prefs={prefs} />;
}
