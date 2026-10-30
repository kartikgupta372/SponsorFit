import { PageHeader } from "@/components/ui/PageHeader";
import { PipelineBoard } from "@/components/pipeline/PipelineBoard";

export const metadata = { title: "Pipeline | SponsorFit" };

export default function PipelinePage() {
  return (
    <div>
      <PageHeader
        eyebrow="Pipeline"
        title="Your deals"
        subtitle="Move each brand along as the conversation does. Open a card for notes."
      />
      <PipelineBoard />
    </div>
  );
}
