import { z } from 'zod';

// Mirrors schema/entry.schema.json, which mirrors supabase/migrations/001_initial.sql
// (the schema authority). A unit test asserts the field names and enums here stay
// in sync with the JSON Schema (CLAUDE.md rule 2). Change all three together.

export const TASK_PATTERNS = [
  'extraction',
  'classification',
  'summarisation',
  'generation',
  'reconciliation',
  'translation',
  'analysis',
  'agentic_workflow',
  'conversation',
  'other',
] as const;

export const PROMPT_STRATEGIES = [
  'zero_shot',
  'few_shot',
  'rag',
  'agentic',
  'fine_tuned',
  'other',
] as const;

export const INDUSTRY_TAGS = [
  'accounting',
  'supply_chain',
  'legal',
  'finance',
  'insurance',
  'healthcare',
  'engineering',
  'hr',
  'marketing',
  'customer_service',
  'retail',
  'manufacturing',
  'government',
  'education',
  'general',
] as const;

// ISO date (YYYY-MM-DD), matching the JSON Schema "date" format.
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a date in the form YYYY-MM-DD');

// The plain object shape (no cross-field refinements). Exported so the schema
// sync test can read its field names directly.
export const entryObject = z
  .object({
    task_name: z.string().min(5).max(120),
    task_pattern: z.enum(TASK_PATTERNS),
    industry_tags: z.array(z.enum(INDUSTRY_TAGS)).min(1),
    task_unit: z.string().min(3).max(60),
    provider: z.string().min(1),
    model: z.string().min(1),
    prompt_strategy: z.enum(PROMPT_STRATEGIES),
    calls_per_unit: z.number().min(1),
    includes_retries: z.boolean(),
    input_tokens_median: z.number().int().positive(),
    output_tokens_median: z.number().int().positive(),
    input_tokens_p90: z.number().int().positive().optional(),
    output_tokens_p90: z.number().int().positive().optional(),
    sample_size: z.number().int().min(10),
    measurement_date: isoDate,
    methodology: z.string().min(80),
    source_url: z.string().url().optional(),
    submitter_display: z.string().max(60).optional(),
  });

// The DB enforces p90 >= median with a check constraint; mirror it here so the
// form catches it before a round trip.
export const entrySchema = entryObject
  .refine(
    (e) =>
      e.input_tokens_p90 === undefined ||
      e.input_tokens_p90 >= e.input_tokens_median,
    { message: 'Input p90 must be at least the median', path: ['input_tokens_p90'] },
  )
  .refine(
    (e) =>
      e.output_tokens_p90 === undefined ||
      e.output_tokens_p90 >= e.output_tokens_median,
    { message: 'Output p90 must be at least the median', path: ['output_tokens_p90'] },
  );

export type EntryInput = z.infer<typeof entrySchema>;
