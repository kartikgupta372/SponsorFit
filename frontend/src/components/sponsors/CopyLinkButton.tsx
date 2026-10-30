"use client";

import { useState } from "react";
import { Check, Copy, FileDown } from "lucide-react";
import { Button } from "@/components/ui/Button";

/** Copies the public media-kit link for a brand. */
export function CopyLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/kit/${slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: the link is also reachable via "Open public kit" */
    }
  }

  return (
    <Button variant="outline" onClick={copy}>
      {copied ? <Check size={16} /> : <Copy size={16} />}
      {copied ? "Link copied" : "Copy share link"}
    </Button>
  );
}

/** Opens the public kit with ?print=1, which triggers the browser's print dialog (Save as PDF). */
export function ExportPdfButton({ slug }: { slug: string }) {
  return (
    <Button
      variant="outline"
      onClick={() => window.open(`/kit/${slug}?print=1`, "_blank", "noopener")}
    >
      <FileDown size={16} /> Export PDF
    </Button>
  );
}
