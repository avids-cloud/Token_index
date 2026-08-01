// Validates entries against schema/entry.schema.json.
//
// Used by the export script (scripts/export-dataset.mjs) and by the unit
// tests (test/export-validate.test.ts). Kept dependency-free except for ajv
// (a devDependency) so it runs in CI without a build step.
//
// The JSON Schema mirrors supabase/migrations/001_initial.sql (the schema
// authority). A separate sync test keeps the zod schema in step with the
// JSON Schema. This module validates exports against the JSON Schema
// directly, as BUILD_PLAN §Phase 6 requires.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';

// Load and compile the JSON Schema once. The schema file is the same one
// the browser form validates against (via zod) and the same one the export
// validates against here.
const schemaPath = fileURLToPath(
  new URL('../schema/entry.schema.json', import.meta.url),
);
const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));

const ajv = new Ajv2020({ allErrors: true, strict: false, validateFormats: false });
const validateFn = ajv.compile(schema);

/**
 * Validate a single entry object against the JSON Schema.
 * Returns { valid, errors } where errors is a human-readable array.
 */
export function validateEntry(entry) {
  const valid = validateFn(entry);
  return {
    valid,
    errors: valid ? [] : formatErrors(validateFn.errors),
  };
}

/**
 * Validate an array of entries. Returns { valid, count, failures }.
 * `failures` is an array of { index, id, errors } for each invalid row.
 */
export function validateEntries(entries) {
  const failures = [];
  for (let i = 0; i < entries.length; i++) {
    const result = validateEntry(entries[i]);
    if (!result.valid) {
      failures.push({
        index: i,
        id: entries[i]?.id ?? '(no id)',
        errors: result.errors,
      });
    }
  }
  return {
    valid: failures.length === 0,
    count: entries.length,
    failures,
  };
}

function formatErrors(errors) {
  if (!errors) return ['Unknown validation error'];
  return errors.map((e) => {
    const path = e.instancePath || '(root)';
    return `${path}: ${e.message}`;
  });
}

// Expose the compiled validator for tests that want to inspect it.
export { validateFn as compiledValidator };
