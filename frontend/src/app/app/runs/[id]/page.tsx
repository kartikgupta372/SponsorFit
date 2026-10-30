import { Suspense } from "react";
import { RunView } from "@/components/run/RunView";

export const metadata = { title: "Analysis | SponsorFit" };

export default function RunPage() {
  // useSearchParams needs a Suspense boundary in the App Router.
  return (
    <Suspense fallback={<div className="skeleton h-64 w-full rounded-2xl" />}>
      <RunView />
    </Suspense>
  );
}
