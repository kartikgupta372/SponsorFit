"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Creator preferences, kept in the browser for now.
 * With the backend, these move to the user's row in Postgres; the hook's
 * shape stays the same so the screens do not change.
 */
export interface Settings {
  safety: { alcohol: boolean; gambling: boolean; adult: boolean };
  existingSponsors: string[];
}

const KEY = "sf_settings";

export const DEFAULT_SETTINGS: Settings = {
  safety: { alcohol: true, gambling: true, adult: true },
  existingSponsors: ["Brightleaf Coffee"],
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSettings({ ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) });
    } catch {
      /* storage unavailable: keep defaults */
    }
  }, []);

  const update = useCallback((next: Settings) => {
    setSettings(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  return { settings, update };
}
