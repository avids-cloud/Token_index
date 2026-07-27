import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// The anon key ships to the browser by design; RLS does the security work
// (CLAUDE.md rule 4). The service role key must never appear here or in any
// client-side env var.
//
// The client is created lazily so that the module can be imported during
// static builds without env vars set. The env check runs on first access,
// not at import time.

let client: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> {
  if (client) return client;

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY. ' +
        'Copy .env.example to .env and set both values.',
    );
  }

  client = createClient<Database>(supabaseUrl, supabaseAnonKey);
  return client;
}

// Convenience export that uses the lazy getter.
// Components use `getSupabase()` directly to avoid eager evaluation.
export { getSupabase as supabase };
