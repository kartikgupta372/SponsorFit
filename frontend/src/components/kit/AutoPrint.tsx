"use client";

import { useEffect } from "react";

/** Opens the print dialog (Save as PDF) when the page is loaded with ?print=1. */
export function AutoPrint() {
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("print") === "1") {
      const t = setTimeout(() => window.print(), 600);
      return () => clearTimeout(t);
    }
  }, []);
  return null;
}
