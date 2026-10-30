import { PitchStudio } from "@/components/pitch/PitchStudio";
import { loadMatch } from "@/lib/server/data";

export const metadata = { title: "Pitch studio | SponsorFit" };
export const dynamic = "force-dynamic";

export default async function PitchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { match, show, pitch, deal } = await loadMatch(id);
  return <PitchStudio match={match} show={show} pitch={pitch} deal={deal} />;
}
