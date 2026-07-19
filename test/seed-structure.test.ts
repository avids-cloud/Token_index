import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { entrySchema } from '../src/lib/entry-schema';

// Structure check ONLY on the illustrative example file. This never inserts data
// into any database (CLAUDE.md rule 3). It just proves the example entries match
// the schema the form validates against, so the quality bar stays honest.

const seed = JSON.parse(
  readFileSync(
    fileURLToPath(
      new URL('../data/seed-entries.example.json', import.meta.url),
    ),
    'utf8',
  ),
);

// The example uses null for absent optional fields (e.g. source_url). The schema
// treats optionals as absent-or-present, so drop null-valued keys before parsing.
function dropNulls(entry: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(entry).filter(([, v]) => v !== null),
  );
}

describe('seed-entries.example.json', () => {
  it('has entries', () => {
    expect(Array.isArray(seed.entries)).toBe(true);
    expect(seed.entries.length).toBeGreaterThan(0);
  });

  it('every example entry matches the entry schema', () => {
    for (const entry of seed.entries) {
      const result = entrySchema.safeParse(dropNulls(entry));
      if (!result.success) {
        throw new Error(
          `${entry.task_name}: ${JSON.stringify(result.error.issues, null, 2)}`,
        );
      }
      expect(result.success).toBe(true);
    }
  });
});
