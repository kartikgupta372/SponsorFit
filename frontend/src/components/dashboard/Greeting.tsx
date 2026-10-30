"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";

export function Greeting() {
  const { user } = useAuth();
  // Computed after mount: the server's clock is not the visitor's clock.
  const [part, setPart] = useState("day");
  useEffect(() => {
    const hour = new Date().getHours();
    setPart(hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening");
  }, []);
  const first = user?.name?.split(" ")[0] ?? "there";

  return (
    <>
      <p className="label mb-2">Dashboard</p>
      <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        Good {part}, {first}
      </h1>
    </>
  );
}
