import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  entryObject,
  TASK_PATTERNS,
  PROMPT_STRATEGIES,
  INDUSTRY_TAGS,
} from '../src/lib/entry-schema';

// Keeps the zod schema (src/lib/entry-schema.ts) in step with the JSON Schema
// (schema/entry.schema.json), which mirrors the migration. CLAUDE.md rule 2:
// change the migration, the JSON Schema, and the zod schema together.

const jsonSchema = JSON.parse(
  readFileSync(
    fileURLToPath(new URL('../schema/entry.schema.json', import.meta.url)),
    'utf8',
  ),
);

// Fields present in both, excluding server-managed ones the form never sets.
const SERVER_MANAGED = new Set(['id', 'created_at']);

describe('zod schema stays in sync with the JSON Schema', () => {
  it('covers the same fields', () => {
    const jsonFields = Object.keys(jsonSchema.properties)
      .filter((f) => !SERVER_MANAGED.has(f))
      .sort();
    const zodFields = Object.keys(entryObject.shape).sort();
    expect(zodFields).toEqual(jsonFields);
  });

  it('lists the same task_pattern values', () => {
    expect([...TASK_PATTERNS].sort()).toEqual(
      [...jsonSchema.properties.task_pattern.enum].sort(),
    );
  });

  it('lists the same prompt_strategy values', () => {
    expect([...PROMPT_STRATEGIES].sort()).toEqual(
      [...jsonSchema.properties.prompt_strategy.enum].sort(),
    );
  });

  it('lists the same industry_tags values', () => {
    expect([...INDUSTRY_TAGS].sort()).toEqual(
      [...jsonSchema.properties.industry_tags.items.enum].sort(),
    );
  });

  it('marks the same fields required', () => {
    // A field is optional when its schema accepts undefined. This avoids the
    // deprecated zod `.isOptional()` method.
    const zodRequired = Object.entries(entryObject.shape)
      .filter(([, def]) => def.safeParse(undefined).success === false)
      .map(([name]) => name)
      .sort();
    const jsonRequired = [...jsonSchema.required]
      .filter((f: string) => !SERVER_MANAGED.has(f))
      .sort();
    expect(zodRequired).toEqual(jsonRequired);
  });
});
