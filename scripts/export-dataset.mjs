#!/usr/bin/env node

// Token Cost Index — dataset export.
//
// Fetches all approved entries from the public_entries view via the Supabase
// REST API (PostgREST) using the anon key, validates every row against
// schema/entry.schema.json, and writes two files:
//   data/exports/entries-latest.json   (the current snapshot, overwritten)
//   data/exports/entries-YYYY-MM-DD.json (a dated copy, kept)
//
// If any row fails validation the script prints which row and why, then
// exits non-zero so the GitHub Action fails loudly instead of committing
// bad data. BUILD_PLAN §Phase 6.
//
// If the latest export is byte-identical to the previous one, the script
// still writes both files (the dated copy is cheap) but exits with code 2
// so the Action can skip the commit step. A normal run exits 0.
//
// Usage:
//   node scripts/export-dataset.mjs
//
// Required environment variables:
//   PUBLIC_SUPABASE_URL       The project URL
//   PUBLIC_SUPABASE_ANON_KEY  The anon (public) key. RLS allows reading
//                             approved entries. No service role needed.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { validateEntries } from './validate-export.mjs';

// --- Config ---------------------------------------------------------------

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const anonKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  console.error(
    'Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY. ' +
      'Set both environment variables and try again.',
  );
  process.exit(1);
}

const exportsDir = fileURLToPath(
  new URL('../data/exports/', import.meta.url),
);

// PostgREST endpoint for the public_entries view.
const endpoint = `${supabaseUrl}/rest/v1/public_entries?order=created_at.asc`;

// --- Fetch ----------------------------------------------------------------

async function fetchEntries() {
  const res = await fetch(endpoint, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Failed to fetch public_entries: ${res.status} ${res.statusText}\n${body}`,
    );
  }

  return res.json();
}

// --- Write ----------------------------------------------------------------

function today() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function writeExport(entries) {
  mkdirSync(exportsDir, { recursive: true });

  const json = JSON.stringify(entries, null, 2) + '\n';

  const latestPath = `${exportsDir}entries-latest.json`;
  const datedPath = `${exportsDir}entries-${today()}.json`;

  // Check if the latest export has changed so the Action can skip committing.
  let changed = true;
  if (existsSync(latestPath)) {
    const previous = readFileSync(latestPath, 'utf8');
    if (previous === json) changed = false;
  }

  writeFileSync(latestPath, json);
  writeFileSync(datedPath, json);

  return { changed, latestPath, datedPath };
}

// --- Main -----------------------------------------------------------------

async function main() {
  console.log('Fetching approved entries from public_entries...');

  let entries;
  try {
    entries = await fetchEntries();
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  if (!Array.isArray(entries)) {
    console.error('Expected an array of entries from the API. Got:', typeof entries);
    process.exit(1);
  }

  console.log(`Fetched ${entries.length} entries. Validating against schema...`);

  const result = validateEntries(entries);

  if (!result.valid) {
    console.error(
      `\nValidation failed: ${result.failures.length} of ${result.count} entries are invalid.`,
    );
    for (const f of result.failures) {
      console.error(`\n  Row ${f.index} (${f.id}):`);
      for (const e of f.errors) {
        console.error(`    ${e}`);
      }
    }
    console.error(
      '\nRefusing to write invalid data. Fix the database row(s) and re-run.',
    );
    process.exit(1);
  }

  console.log(`All ${result.count} entries valid. Writing export files...`);

  const { changed, latestPath, datedPath } = writeExport(entries);

  console.log(`  Wrote ${latestPath}`);
  console.log(`  Wrote ${datedPath}`);

  if (!changed) {
    console.log('No change since the last export. Action may skip the commit.');
    // Exit code 2 signals "no change" to the GitHub Action.
    process.exit(2);
  }

  console.log('Export complete.');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
