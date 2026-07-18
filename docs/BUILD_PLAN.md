# Build Plan

Execute phases in order. Each phase has acceptance criteria. Do not start a phase until the previous one passes. Human tasks are marked [AVI].

## Phase 0: Prerequisites [AVI]

- [ ] Create Supabase project, note URL and anon key
- [ ] Enable GitHub OAuth and email magic link in Supabase Auth settings
- [ ] Create GitHub repo, connect to Cloudflare Pages
- [ ] Decide final project name and domain
- [ ] Verify every price in `data/model-pricing.json` against current provider pricing pages

Environment variables for local dev and Cloudflare Pages:

```
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
```

Service role key is never used in the site. It stays in Supabase Studio and the export Action secret only.

## Phase 1: Scaffold

- Astro project with React integration and Tailwind
- Directory structure: `src/pages`, `src/components`, `src/lib`, `src/styles`
- Design tokens from `docs/DESIGN.md` as CSS custom properties and Tailwind theme extensions
- IBM Plex Sans and IBM Plex Mono self-hosted via Fontsource, tabular-nums applied to a `.figure` utility class
- Base layout: header with wordmark, nav (Index, Submit, About, API), footer with licence and GitHub link

**Accept:** `npm run dev` serves a styled shell. `npm run build` passes. Deploys to Cloudflare Pages preview.

## Phase 2: Database

- Apply `supabase/migrations/001_initial.sql`
- Generate TypeScript types from the database into `src/lib/database.types.ts` (`supabase gen types typescript`)
- Write `src/lib/supabase.ts` client factory using the anon key
- Write zod schema in `src/lib/entry-schema.ts` matching `schema/entry.schema.json`, with a unit test asserting the two stay in sync on field names and enums
- Load `data/seed-entries.example.json` structure check only. Do NOT insert example entries into the live database. Real seed data is [AVI]

**Accept:** RLS verified by test: anon client can select from `public_entries`, cannot select pending rows, cannot insert. Authenticated client can insert a pending row with own `submitter_id` and cannot insert with `status = 'approved'`.

## Phase 3: Auth and submission form

- `/submit` page, React island
- Sign in with GitHub OAuth, magic link fallback. Signed-out users see the form disabled with a sign-in prompt, not a redirect
- Form fields mirror the zod schema. Grouped sections: Task, How it was run, Token figures, Trust. Inline validation on blur, full validation on submit
- `calls_per_unit` defaults to 1 with helper text explaining agentic workflows
- Methodology field shows a character counter toward the 80 minimum and placeholder text with a good example
- On success: confirmation state explaining the moderation queue, link to submit another
- On database constraint rejection: surface the message readably, never a raw Postgres error

**Accept:** End-to-end test submits a valid entry as an authenticated user and confirms it lands as pending. Invalid submissions blocked client-side and, if forced, server-side.

## Phase 4: Index viewer and calculator

- `/` renders the table of approved entries from `public_entries`, fetched client-side (data changes as moderation happens, so no build-time freeze)
- Columns: task, pattern, industry, model, tokens in/out (median), est. cost per unit, sample size, date
- Repricing strip per `docs/DESIGN.md`: model selector fed from `data/model-pricing.json`, monthly volume input, reprices all rows. Cost formula:
  `cost_per_unit = (input_tokens_median * input_price + output_tokens_median * output_price) / 1,000,000`
  Note `calls_per_unit` is already reflected in the stored token totals (they are summed across calls). Do not multiply again.
- Filters: task pattern, industry tags, provider. URL-persisted so filtered views are shareable
- Every dollar figure shows the pricing `as_of` date
- Sort by any numeric column
- Empty state per DESIGN.md

**Accept:** With 5 test entries approved in a dev database, filtering, sorting, repricing, and volume projection all work. Reduced motion respected. Mobile layout usable at 360px.

## Phase 5: Entry detail and API docs

- `/entry/[id]` detail page: full figures including p90, methodology in full, source link, submitter handle, measurement date, a repricing widget scoped to this entry
- p90 shown as a range against median, labelled "typical vs heavy tail"
- `/api` page documenting the public PostgREST endpoint with copy-paste curl and fetch examples against `public_entries`
- `/about` page: what the index is, entry quality rules, licensing, how moderation works

**Accept:** Detail pages render from live data. API examples on `/api` work when pasted into a terminal.

## Phase 6: Dataset export

- GitHub Action, nightly cron: pulls all `public_entries` rows via PostgREST (service key in Action secret not required if the view is anon-readable, use anon key), validates each row against `schema/entry.schema.json`, writes `data/exports/entries-latest.json` plus a dated snapshot, commits if changed
- Validation failure fails the Action loudly rather than committing bad data
- README section documenting the export format and update cadence

**Accept:** Action runs green on manual dispatch and produces a valid, schema-conformant export.

## Phase 7: Launch checklist [AVI with Claude Code support]

- [ ] 25+ real seed entries approved (own projects anonymised, cited public benchmarks, cohort contributions)
- [ ] Pricing file verified and dated within the last 30 days
- [ ] Lighthouse: accessibility 95+, performance 90+
- [ ] Licence files committed: MIT for code, CC BY 4.0 for `data/`
- [ ] Launch post drafted for Pit Lane to Production and LinkedIn. Hook is the problem: nobody can tell you what AI costs before you build it
- [ ] Show HN draft prepared
- [ ] 3 contributors lined up with entries submitted pre-launch

## Out of scope for v1

Admin UI, contributor profiles, aggregate trend views, CSV export, flagging workflow. Log ideas in GitHub issues, do not build them.
