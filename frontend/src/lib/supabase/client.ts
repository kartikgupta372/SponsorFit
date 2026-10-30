import { createBrowserClient } from "@supabase/ssr";

/** Supabase client for the browser. Row Level Security limits it to the user's own rows. */
export function supabaseBrowser() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}
