import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/lib/database.types';

// RLS behaviour test (BUILD_PLAN Phase 2 acceptance). This talks to a live
// Supabase project, so it self-skips unless credentials are present. Run it
// locally or in CI with the anon key set:
//
//   PUBLIC_SUPABASE_URL=... PUBLIC_SUPABASE_ANON_KEY=... \
//   TEST_USER_EMAIL=... TEST_USER_PASSWORD=... npm run test
//
// The authenticated cases need a confirmed test user in the project. They skip
// on their own if TEST_USER_* is not set, so the anon cases can still run.

const url = process.env.PUBLIC_SUPABASE_URL;
const anonKey = process.env.PUBLIC_SUPABASE_ANON_KEY;
const testEmail = process.env.TEST_USER_EMAIL;
const testPassword = process.env.TEST_USER_PASSWORD;

const haveAnon = Boolean(url && anonKey);
const haveUser = Boolean(haveAnon && testEmail && testPassword);

function anonClient() {
  return createClient<Database>(url!, anonKey!);
}

const validEntry = {
  task_name: 'RLS test extraction task',
  task_pattern: 'extraction' as const,
  industry_tags: ['general'],
  task_unit: 'per document',
  provider: 'anthropic',
  model: 'claude-haiku-4-5',
  prompt_strategy: 'zero_shot' as const,
  calls_per_unit: 1,
  includes_retries: false,
  input_tokens_median: 1000,
  output_tokens_median: 100,
  sample_size: 25,
  measurement_date: '2026-01-01',
  methodology:
    'Synthetic entry used only by the RLS behaviour test. Tokens are fixed constants, not measured. This text exists purely to clear the 80 character methodology minimum.',
};

describe.skipIf(!haveAnon)('RLS: anonymous access', () => {
  it('can select from public_entries', async () => {
    const { error } = await anonClient().from('public_entries').select('id').limit(1);
    expect(error).toBeNull();
  });

  it('sees no pending rows via the entries table', async () => {
    // The public_entries view only exposes approved rows; the base table is
    // readable to anon only for approved rows too. Either way, no pending leak.
    const { data, error } = await anonClient()
      .from('entries')
      .select('id')
      .eq('status', 'pending');
    expect(error).toBeNull();
    expect(data ?? []).toHaveLength(0);
  });

  it('cannot insert', async () => {
    const { error } = await anonClient()
      .from('entries')
      .insert({ ...validEntry, submitter_id: '00000000-0000-0000-0000-000000000000' });
    expect(error).not.toBeNull();
  });
});

describe.skipIf(!haveUser)('RLS: authenticated submitter', () => {
  it('can insert its own pending row', async () => {
    const client = anonClient();
    const { data: auth, error: signInError } = await client.auth.signInWithPassword({
      email: testEmail!,
      password: testPassword!,
    });
    expect(signInError).toBeNull();
    const uid = auth.user!.id;

    const { data, error } = await client
      .from('entries')
      .insert({ ...validEntry, submitter_id: uid })
      .select('id, status')
      .single();

    expect(error).toBeNull();
    expect(data?.status).toBe('pending');

    // Clean up is not possible via anon (no delete policy); moderation/rejection
    // handles test rows. Keep the test task_name identifiable above.
  });

  it('cannot insert a row pre-set to approved', async () => {
    const client = anonClient();
    const { data: auth } = await client.auth.signInWithPassword({
      email: testEmail!,
      password: testPassword!,
    });
    const uid = auth.user!.id;

    const { error } = await client
      .from('entries')
      // @ts-expect-error status is intentionally forced to test the RLS check
      .insert({ ...validEntry, submitter_id: uid, status: 'approved' });

    expect(error).not.toBeNull();
  });
});
