import { createClient } from "@supabase/supabase-js";

/**
 * Privileged client that bypasses Row Level Security. Server-only —
 * never import this into client components or expose the key to the browser.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
