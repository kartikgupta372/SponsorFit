import { redirect } from "next/navigation";
import { ShowView } from "@/components/show/ShowView";
import { loadAnalysis } from "@/lib/server/data";

export const metadata = { title: "Audience DNA | SponsorFit" };
export const dynamic = "force-dynamic";

export default async function ShowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { analysis, show, matches } = await loadAnalysis(id);
  if (analysis.status !== "complete") redirect(`/app/runs/${id}`);
  return <ShowView analysis={analysis} show={show} matches={matches} />;
}
