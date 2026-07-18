# CLAUDE.md

## What this project is

Token Cost Index (working name): an open dataset of measured token costs for business AI tasks, with a searchable web index and cost calculator. Open data, closed write path. Submissions via authenticated web form into a moderation queue. Dataset published via public API and versioned JSON exports.

Read these before writing any code, in this order:

1. `docs/PRD.md` for product decisions and why they were made
2. `docs/BUILD_PLAN.md` for what to build and in what order
3. `docs/DESIGN.md` for the visual direction
4. `supabase/migrations/001_initial.sql` as the data model source of truth

## Stack

- Astro with React islands, Tailwind, Cloudflare Pages
- Supabase: Postgres, Auth (GitHub OAuth + magic link), PostgREST for the read API
- No custom backend server. No ORM. Supabase client only
- zod for client validation, kept in sync with `schema/entry.schema.json` by test

## Commands

```
npm run dev          # local dev server
npm run build        # production build, must pass before any commit
npm run test         # unit tests (vitest)
supabase db push     # apply migrations
supabase gen types typescript --project-id <id> > src/lib/database.types.ts
```

## Hard rules

1. **Tokens are stored, dollars are computed.** Never write a dollar amount to the database. Conversion happens at display time from `data/model-pricing.json`, and every dollar figure shows its `as_of` date.
2. **The migration file is the schema authority.** If a field changes, update the migration (new numbered migration file, never edit 001 after it has been applied), the JSON Schema, and the zod schema together, and update the sync test.
3. **Never insert example data into the live database.** `data/seed-entries.example.json` is illustrative. Real seed entries come from Avi.
4. **RLS does the security work.** The anon key ships to the browser by design. Any new table or view gets RLS policies before it gets data. Service role key never appears in site code or client-side env vars.
5. **Do not verify pricing yourself from memory.** Prices in `data/model-pricing.json` are refreshed by Avi against provider pricing pages. Flag stale `as_of` dates (over 30 days) but do not invent numbers.
6. **Minimal dependencies.** Before adding a package, check whether Astro, React, or the platform already does it. Justify each addition in the commit message.
7. **Follow BUILD_PLAN phase order.** Do not skip ahead. Do not build v2 features. Log ideas as GitHub issues instead.

## Copy conventions

All user-facing text: British English, short sentences, no em dashes, no AI buzzwords (leverage, revolutionise, seamless, unlock, supercharge). Buttons name their action. Errors say what went wrong and what to do. See `docs/DESIGN.md` for the full copy rules.

## Code conventions

- TypeScript strict mode
- Components small and flat, one responsibility each
- Figures rendered with the `.figure` utility (IBM Plex Mono, tabular-nums), no exceptions
- Accessible by default: semantic HTML, focus states, `prefers-reduced-motion` respected
- Tests for: schema sync, RLS behaviour, cost calculation maths, form validation

## Cost calculation

`cost_per_unit_usd = (input_tokens_median * input_price + output_tokens_median * output_price) / 1_000_000`

Stored token figures are already summed across all calls per task unit. `calls_per_unit` is metadata for the reader, not a multiplier in the formula. Getting this wrong double-counts agentic workflows. There is a unit test for this; keep it passing.

## When unsure

Product ambiguity: check PRD non-goals first. If still unclear, stop and ask Avi rather than guessing. A smaller correct build beats a larger speculative one.
