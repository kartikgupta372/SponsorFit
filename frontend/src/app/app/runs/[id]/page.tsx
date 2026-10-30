import { RunView } from "@/components/run/RunView";
import { loadAnalysis } from "@/lib/server/data";

export const metadata = { title: "Agent run | SponsorFit" };
export const dynamic = "force-dynamic";

export default async function RunPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { analysis, show, matches } = await loadAnalysis(id);
  return <RunView analysis={analysis} show={show} matches={matches} />;
}
