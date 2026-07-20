# CLAUDE.md

## Commands

```
npm ci               # install exact locked dependencies
npm run dev          # local dev server at localhost:4321
npm run build        # production build, must pass before any commit
npm run test         # unit + integration tests (vitest)
npm run typecheck    # astro check + tsc, must pass before any commit
supabase db push     # apply migrations (needs Supabase CLI auth)
```

## What this project is

Token Cost Index: an open dataset of measured token costs for business AI
tasks, with a searchable web index and cost calculator. Open data, closed
write path. Read these before writing any code, in this order:

1. `docs/product/README.md` for how work flows from spec to shipped
2. `docs/PRD.md` for product decisions and why they were made
3. `docs/BUILD_PLAN.md` for what to build and in what order
4. `docs/DESIGN.md` for the visual direction
5. `supabase/migrations/` as the data model source of truth

## Architecture in five sentences

The site is a set of static pages built with Astro and deployed to Cloudflare
Pages, with small interactive React islands (calculator, submission form).
All data lives in one Supabase Postgres `entries` table; a `public_entries`
view exposes only approved entries with private fields stripped. The browser
talks to Supabase directly with a public anon key; database row-level
security rules, not a server, decide who can read and write what. Token
counts are the only stored cost figures; dollar amounts are computed at
display time from `data/model-pricing.json` and always shown with their
`as_of` date. A nightly GitHub Action (Phase 6, not yet built) exports the
approved dataset to versioned JSON files in `data/exports/`.

## Definition of done

No feature is complete until BOTH of these are true:

1. It has an automated test that fails without the change and passes with it,
   and `npm run test`, `npm run build` and `npm run typecheck` all pass.
2. Avi has confirmed the acceptance criteria by looking at the behaviour.

Claude's own inspection never counts as done. "Done pending your
confirmation" is the strongest claim Claude may make.

## Working rules

- Use plan mode before any implementation work. Present the plan in plain
  English; Avi reviews behaviour, not diffs.
- Follow BUILD_PLAN phase order. Do not skip ahead. Log v2 ideas as GitHub
  issues instead of building them.
- Work happens on a feature branch; `main` only moves via reviewed changes
  with green CI. Never force-push `main`.
- Every change summary is written for a non-technical reader using the PR
  template. No code snippets in summaries.
- Track work on `docs/TASKS.md`: one task in Now, move to Done with date and
  commit SHA only after Avi confirms.

## Hard rules

1. Tokens are stored, dollars are computed. Never write a dollar amount to
   the database. Conversion happens at display time from
   `data/model-pricing.json`, and every dollar figure shows its `as_of` date.
2. The migration files are the schema authority. If a field changes, add a
   new numbered migration (never edit an applied one) and update the JSON
   Schema and zod schema together, keeping the sync test passing.
3. Never insert example data into the live database.
   `data/seed-entries.example.json` is illustrative. Real seed entries come
   from Avi.
4. RLS does the security work. The anon key ships to the browser by design.
   Any new table or view gets RLS policies before it gets data. The service
   role key never appears in site code or client-side env vars.
5. Do not verify pricing from memory. Prices are refreshed by Avi against
   provider pricing pages. Flag `as_of` dates older than 30 days; never
   invent numbers.
6. Minimal dependencies. Justify each addition in the commit message.
7. Cost formula:
   `cost_per_unit_usd = (input_tokens_median * input_price + output_tokens_median * output_price) / 1_000_000`.
   Stored token figures are already summed across all calls per task unit;
   `calls_per_unit` is metadata, not a multiplier. There is a unit test for
   this; keep it passing.

## Copy and code conventions

- All user-facing text: British English, short sentences, no em dashes, no AI
  buzzwords. Buttons name their action. Errors say what went wrong and what
  to do. Full rules in `docs/DESIGN.md`.
- TypeScript strict mode. Components small and flat, one responsibility each.
- Figures rendered with the `.figure` utility (IBM Plex Mono, tabular-nums).
- Accessible by default: semantic HTML, focus states, reduced motion
  respected.

## When unsure

Check PRD non-goals first. If still unclear, stop and ask Avi with lettered
options rather than guessing. A smaller correct build beats a larger
speculative one.
