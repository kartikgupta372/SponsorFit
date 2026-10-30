import { redirect } from "next/navigation";
import { Gem } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { loadShows } from "@/lib/server/data";

export const dynamic = "force-dynamic";

/** "Sponsors" in the nav opens the shortlist of your most recent finished analysis. */
export default async function SponsorsIndex() {
  const shows = await loadShows();
  const done = shows.find((s) => s.status === "complete");
  if (done) redirect(`/app/shows/${done.analysisId}/sponsors`);
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <Gem className="mx-auto text-orchid-300" size={34} />
      <h1 className="mt-5 font-display text-3xl font-semibold">No sponsors yet</h1>
      <p className="mt-2 text-ink-muted">Run your first analysis and the agent will rank the brands your audience already loves.</p>
      <Button href="/app/new" className="mt-7">Run an analysis</Button>
    </div>
  );
}
