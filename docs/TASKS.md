# Task board

The working ledger for Token Cost Index. This is the single place that tracks
what is being built now, what is next, and what is done. It keeps the build
sequential and spec-driven.

## How to use this board

1. Work is **spec-driven**. Every task names the spec section it comes from
   (`PRD`, `BUILD_PLAN`, `DESIGN`, or the migration). If a task is not traceable
   to the spec, it does not belong here yet. Discuss and add to the spec first.
2. **One task in `Now` at a time.** Pull the top item from `Next` into `Now`,
   build it to its phase's acceptance criteria, then move it to `Done` with the
   date and commit SHA. Then pull the next item up.
3. **Follow `BUILD_PLAN` phase order.** Do not start a phase until the previous
   phase passes its acceptance criteria (CLAUDE.md rule 7).
4. `[AVI]` marks a task only a human can do (accounts, secrets, real data). These
   block the phase until done. Claude Code flags them and works around where
   possible, but does not fake them.
5. New ideas that are not in scope go to **v2 / parked**, not into `Next`.

Status key: `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked on `[AVI]`

---

## Now

- [~] **Phase 6: dataset export.** Code is on the `phase-6-dataset-export`
  branch for Avi to review. Export script, validator, GitHub Action, tests,
  and README section all built and passing. Acceptance needs live
  verification: the Action runs green on manual dispatch and produces a
  valid, schema-conformant export. With no approved entries yet it
  produces an empty array (still valid). Live acceptance with real data
  waits on Avi seeding entries.

## Next

Ordered queue. Top item moves to `Now`.

1. [!] **[AVI] Enable GitHub OAuth + email magic link** in Supabase Auth. — `BUILD_PLAN §Phase 0` *(blocks Phase 3)*
2. [!] **[AVI] Run the RLS test with credentials.** Set `PUBLIC_SUPABASE_ANON_KEY`
   (+ a confirmed `TEST_USER_EMAIL`/`TEST_USER_PASSWORD`) and `npm run test` so
   `test/rls.test.ts` runs live, closing the Phase 2 acceptance criterion. — `BUILD_PLAN §Phase 2 accept`
3. [ ] **Regenerate `src/lib/database.types.ts`** with `supabase gen types` once the
   CLI/MCP is authenticated locally, replacing the hand-authored mirror. — `BUILD_PLAN §Phase 2`
4. [!] **[AVI] Make `main` the default branch** in GitHub settings (Settings →
   General → Default branch). The branch exists; only the default flip needs a
   human. — repo governance session, 2026-07-19
5. [!] **[AVI] Create GitHub repo + connect Cloudflare Pages.** — `BUILD_PLAN §Phase 0`
6. [!] **[AVI] Decide final project name + domain** (working name is a placeholder). — `PRD §top`, `BUILD_PLAN §Phase 0`
7. [!] **[AVI] Verify every price in `data/model-pricing.json`** against provider pages, refresh `as_of` (stale since 2026-01-15). — `BUILD_PLAN §Phase 0`, `CLAUDE.md rule 5`
8. [ ] **Phase 3: `/submit` form**, once OAuth is enabled. — `BUILD_PLAN §Phase 3`

---

## Backlog (by phase)

### Phase 0 — Prerequisites `[AVI]` — `BUILD_PLAN §Phase 0`
See `Next` items 1–5. All human tasks. Set env vars for local + Cloudflare:
`PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`. Service role key stays out of
the site (Studio + export Action secret only).

### Phase 1 — Scaffold — `BUILD_PLAN §Phase 1` — **DONE, see `Done`**
- [x] Astro + React + Tailwind project
- [x] Directory structure `src/pages|components|lib|styles`
- [x] Design tokens as CSS custom properties + Tailwind theme — `DESIGN §Tokens`
- [x] IBM Plex Sans + Mono self-hosted (Fontsource), `.figure` tabular-nums — `DESIGN §Type`
- [x] Base layout: header wordmark + nav, footer licence + GitHub — `BUILD_PLAN §Phase 1`

### Phase 2 — Database — `BUILD_PLAN §Phase 2` — **DONE (one live-run loose end)**
- [x] Apply `supabase/migrations/001_initial.sql` — applied live to `ggpucjklyigxmnhdtyuj`
- [~] `database.types.ts` — hand-authored mirror in place; regenerate via CLI (Next #3)
- [x] `src/lib/supabase.ts` client factory (anon key)
- [x] `src/lib/entry-schema.ts` zod, kept in sync with `schema/entry.schema.json`
- [x] Sync test: zod fields + enums match the JSON Schema — `CLAUDE.md rule 2`
- [x] Structure check on `data/seed-entries.example.json` only. **No example data inserted** — `CLAUDE.md rule 3`
- [~] RLS tests written (`test/rls.test.ts`); self-skip without creds. Run live to close acceptance — Next #2

### Phase 3 — Auth + submission form — `BUILD_PLAN §Phase 3`
- [ ] `/submit` React island; GitHub OAuth + magic-link fallback; signed-out = disabled form + prompt
- [ ] Form mirrors zod schema, grouped Task / How run / Token figures / Trust; inline validate on blur
- [ ] `calls_per_unit` default 1 with agentic helper text; methodology char counter to 80 min
- [ ] Success confirmation explains moderation queue; DB constraint errors surfaced readably
- [ ] E2E: valid authed submit lands `pending`; invalid blocked client + server

### Phase 4 — Index viewer + calculator — `BUILD_PLAN §Phase 4`, `DESIGN §Signature element`
- [x] `/` table of `public_entries`, fetched client-side — PR #26
- [x] Repricing strip: model selector from `data/model-pricing.json`, monthly volume input, reprices rows — PR #26
- [x] Cost formula `= (in_median*in_price + out_median*out_price)/1e6`; **does not** re-multiply `calls_per_unit` — PR #26
- [x] Cost-calc unit test (keep passing) — PR #26
- [x] Filters (pattern, industry, provider) URL-persisted; sort numeric cols; every $ shows `as_of` — PR #26
- [x] Empty state copy; reduced-motion; usable at 360px — PR #26
- [ ] **Live acceptance: verify with 5 test entries in a dev database**

### Phase 5 — Entry detail + API docs — `BUILD_PLAN §Phase 5`
- [x] `/entry/[id]`: full figures incl p90 range "typical vs heavy tail", methodology, source, scoped repricer — branch `phase-5-detail-api-about`
- [x] `/api`: PostgREST endpoint docs with working curl + fetch examples over `public_entries` — branch `phase-5-detail-api-about`
- [x] `/about`: what it is, quality rules, licensing, moderation — branch `phase-5-detail-api-about`
- [ ] **Live acceptance: detail pages render from live data; API examples work when pasted**

### Phase 6 — Dataset export — `BUILD_PLAN §Phase 6`
- [x] Nightly GitHub Action: pull `public_entries` (anon), validate each row vs schema, write `data/exports/entries-latest.json` + dated snapshot, commit if changed — branch `phase-6-dataset-export`
- [x] Validation failure fails the Action loudly (no bad-data commit) — branch `phase-6-dataset-export`
- [x] README export-format section — branch `phase-6-dataset-export`
- [ ] **Live acceptance: Action runs green on manual dispatch and produces a valid export**

### Phase 7 — Launch checklist `[AVI]` — `BUILD_PLAN §Phase 7`
- [ ] 25+ real seed entries approved; pricing verified <30 days; Lighthouse a11y 95+/perf 90+; licence files; launch posts; 3 pre-launch contributors

---

## Done

- [x] **Foundation: land the spec bundle in the repo** — PRD/BUILD_PLAN/DESIGN
  under `docs/`, schema, migration, pricing, seed example, CLAUDE.md, README;
  MIT + CC BY 4.0 licences; `.gitignore`. — 2026-07-18
- [x] **Task-tracking system (`docs/TASKS.md`)** — this board. — 2026-07-18
- [x] **Phase 1 scaffold** — Astro + React + Tailwind, design tokens, IBM Plex
  fonts, `.figure` utility, base layout, nav stubs; `npm run build` passes. —
  2026-07-18
- [x] **Supabase MCP configured** (`.mcp.json`, project scope) + `.env.example`. —
  2026-07-19
- [x] **Repo governance + working agreement** — audit of autonomous-work
  readiness; `main` branch created; CI workflow on every push; `typecheck`
  script (astro check + tsc); README run-locally + deploy sections; loud
  warning when RLS tests skip; CLAUDE.md rewritten with definition of done;
  `docs/product/README.md` flow; `/new-spec` `/build-story` `/verify` `/ship`
  commands; PR template. Avi confirmed the acceptance criteria 2026-07-19.
  Commits `94fa61a`, `c083cd2`. — 2026-07-19
- [x] **Phase 2 database** — migration applied live; supabase client, zod schema,
  cost helper, hand-authored types; schema-sync + cost + seed-structure tests
  pass (11), RLS integration test written (skips without creds); strict tsc and
  `npm run build` clean. — 2026-07-19

---

## v2 / parked (do not build in v1) — `PRD §Scope v2`, `CLAUDE.md rule 7`

- Admin review UI with diff-style approval queue
- Contributor profiles + entry attribution
- Aggregate views: cost ranges per pattern, trend over time
- CSV export, embeddable calculator widget
- Flagging / correction workflow for stale or disputed entries
