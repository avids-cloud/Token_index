import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// The anon key ships to the browser by design; RLS does the security work
// (CLAUDE.md rule 4). The service role key must never appear here or in any
// client-side env var.
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY. ' +
      'Copy .env.example to .env and set both values.',
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
