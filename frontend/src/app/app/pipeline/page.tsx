import { PageHeader } from "@/components/ui/PageHeader";
import { PipelineBoard } from "@/components/pipeline/PipelineBoard";
import { loadDeals } from "@/lib/server/data";

export const metadata = { title: "Pipeline | SponsorFit" };
export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const deals = await loadDeals();
  return (
    <div>
      <PageHeader eyebrow="Pipeline" title="Your deals" subtitle="Move each brand along as the conversation does. Open a card for notes and the deal value." />
      <PipelineBoard initial={deals} />
    </div>
  );
}
