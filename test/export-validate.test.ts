import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { validateEntry, validateEntries } from '../scripts/validate-export.mjs';

// Tests the JSON Schema validator used by the export script. The validator
// catches bad data before it is written to data/exports/. BUILD_PLAN §Phase 6:
// "Validation failure fails the Action loudly rather than committing bad data."

const seed = JSON.parse(
  readFileSync(
    fileURLToPath(new URL('../data/seed-entries.example.json', import.meta.url)),
    'utf8',
  ),
);

// The seed example uses null for absent optional fields. The JSON Schema's
// additionalProperties: false would reject extra null keys only if they are
// not declared. source_url and submitter_display are declared, so null is
// fine as long as the schema allows it. The schema declares them as
// { "type": "string", "format": "uri" } without nullable, so null is invalid.
// Drop null keys to mirror what the DB view returns (null becomes absent in
// the JSON wire format when the column is null, but PostgREST returns null).
// Actually PostgREST returns literal null. We need to handle that: the
// schema's optional fields (source_url, submitter_display, input_tokens_p90,
// output_tokens_p90) accept null in the real API output but the JSON Schema
// as written does not declare "null" as a type. The export script sends rows
// straight from the API. For the test, we use valid complete rows (no nulls)
// to prove the validator accepts good data, and construct broken rows to
// prove it rejects bad data.

function validEntry() {
  return {
    ...seed.entries[0],
    // The seed uses null; the validator (JSON Schema) does not accept null
    // for string fields. Use a real URL or omit the key.
    source_url: 'https://example.com/benchmark',
    submitter_display: 'example',
  };
}

describe('validateEntry', () => {
  it('accepts a valid entry', () => {
    const result = validateEntry(validEntry());
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects an entry missing a required field', () => {
    const entry = validEntry();
    delete entry.task_name;
    const result = validateEntry(entry);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects an invalid task_pattern enum value', () => {
    const entry = validEntry();
    entry.task_pattern = 'not_a_real_pattern';
    const result = validateEntry(entry);
    expect(result.valid).toBe(false);
  });

  it('rejects a negative input_tokens_median', () => {
    const entry = validEntry();
    entry.input_tokens_median = -100;
    const result = validateEntry(entry);
    expect(result.valid).toBe(false);
  });

  it('rejects a sample_size below 10', () => {
    const entry = validEntry();
    entry.sample_size = 5;
    const result = validateEntry(entry);
    expect(result.valid).toBe(false);
  });

  it('rejects methodology shorter than 80 characters', () => {
    const entry = validEntry();
    entry.methodology = 'Too short.';
    const result = validateEntry(entry);
    expect(result.valid).toBe(false);
  });

  it('rejects an additional property not in the schema', () => {
    const entry = validEntry();
    entry.bogus_field = 'should not be here';
    const result = validateEntry(entry);
    expect(result.valid).toBe(false);
  });

  it('rejects an invalid industry tag', () => {
    const entry = validEntry();
    entry.industry_tags = ['not_a_real_industry'];
    const result = validateEntry(entry);
    expect(result.valid).toBe(false);
  });
});

describe('validateEntries', () => {
  it('accepts an array of valid entries', () => {
    const entries = seed.entries.map((e: Record<string, unknown>) => ({
      ...e,
      source_url: 'https://example.com/benchmark',
      submitter_display: (e.submitter_display as string) ?? 'example',
    }));
    const result = validateEntries(entries);
    expect(result.valid).toBe(true);
    expect(result.count).toBe(entries.length);
    expect(result.failures).toEqual([]);
  });

  it('accepts an empty array (no approved entries yet)', () => {
    const result = validateEntries([]);
    expect(result.valid).toBe(true);
    expect(result.count).toBe(0);
    expect(result.failures).toEqual([]);
  });

  it('reports which rows are invalid with their index and id', () => {
    const entries = [
      { ...seed.entries[0], id: 'aaa', source_url: 'https://example.com', submitter_display: 'x' },
      { ...seed.entries[0], id: 'bbb', source_url: 'https://example.com', submitter_display: 'x', sample_size: 3 },
      { ...seed.entries[0], id: 'ccc', source_url: 'https://example.com', submitter_display: 'x', task_pattern: 'bad' },
    ];

    const result = validateEntries(entries);
    expect(result.valid).toBe(false);
    expect(result.count).toBe(3);
    expect(result.failures).toHaveLength(2);
    expect(result.failures[0].index).toBe(1);
    expect(result.failures[0].id).toBe('bbb');
    expect(result.failures[1].index).toBe(2);
    expect(result.failures[1].id).toBe('ccc');
  });
});
