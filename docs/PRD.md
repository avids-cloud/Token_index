# Token Cost Index. Product Requirements

Working name. Rename before launch.

## Problem

Businesses cannot estimate what API-based AI will cost before they build it. The current method is guess, pilot, extrapolate. Finance teams want a number before sign-off and nobody can give them one. Published benchmarks measure model quality, not cost per business task.

## What this is

An open, community-maintained index of real-world token costs for specific business tasks. Each entry records how many tokens a defined task consumed, measured from actual usage, with enough methodology detail to make entries comparable. A pricing layer converts tokens to current dollars per model.

Open data, closed write path. Anyone can read, query, and export the dataset. Submissions go through a web form and a moderation queue, not pull requests.

## Users

1. **Estimators.** Finance, ops, and technology leaders building a business case. They want a defensible cost range for "process 10,000 invoices a month with AI" before procurement.
2. **Contributors.** Practitioners who have run AI tasks in production and can share measured token counts. Developers, analysts, consultants.
3. **Researchers and tool builders.** People who pull the dataset via API or export to build calculators, reports, or academic work.

## Core jobs

- Search the index by task pattern, industry, and model.
- See token costs per task unit (per invoice, per contract clause, per support ticket).
- Convert any entry to dollars at current model pricing, and reprice against a different model.
- Submit a new entry through a validated form.
- Pull the full approved dataset as JSON via public API or versioned export.

## Scope: v1

- Public index page: searchable, filterable table of approved entries.
- Cost calculator: select a model, see every entry repriced in USD. Volume input (units per month) for monthly cost projection.
- Entry detail page: full methodology, sample size, variance (median and p90), source link.
- Submission form: authenticated (GitHub OAuth or magic link), client and server validated against the schema.
- Moderation: entries land as pending. Review and approve via Supabase Studio. No admin UI in v1.
- Public read API: Supabase PostgREST endpoint exposing approved entries only.
- Versioned dataset export: nightly GitHub Action commits a JSON snapshot to the repo.
- Seed data: 20 to 30 entries before launch. Sources: Avi's own projects (anonymised), published benchmarks with citations, cohort contributions.

## Scope: v2 and later

- Admin review UI with diff-style approval queue.
- Contributor profiles and entry attribution.
- Aggregate views: cost ranges per task pattern, trend over time as models get cheaper.
- CSV export, embeddable calculator widget.
- Flagging and correction workflow for stale or disputed entries.

## Non-goals

- Model quality benchmarking. This index measures cost, not accuracy.
- Live token counting or SDK instrumentation. Entries are self-reported with methodology.
- Hosting per-company private data. Everything submitted is public.

## Data model

One core table: `entries`. See `supabase/migrations/001_initial.sql` for the source of truth and `schema/entry.schema.json` for the export format.

Key design decisions, do not change without discussion:

- **Store tokens, never dollars.** Prices change monthly. Dollar conversion happens at display time using `data/model-pricing.json`.
- **Task unit is explicit.** Every entry declares its unit (per invoice, per clause). Costs are meaningless without it.
- **Median and p90.** Median alone hides variance. p90 is optional but encouraged.
- **`calls_per_unit`.** Agentic workflows make one task equal many API calls. This multiplier keeps entries honest.
- **Minimum sample size of 10.** Single-run anecdotes are noise. Enforced by a database check constraint.
- **Methodology is required text.** Free-text description of how tokens were measured. This is the trust mechanism.
- **Index by task pattern first, industry second.** Patterns (extraction, classification, reconciliation) generalise across industries. Industries are tags.

## Submission flow

1. Contributor signs in (GitHub OAuth preferred, magic link fallback).
2. Form validates client-side with zod against the schema. Server enforces the same constraints via Postgres checks and RLS.
3. Entry inserts with `status = 'pending'`.
4. Moderator reviews in Supabase Studio, sets status to `approved` or `rejected`.
5. Approved entries appear on the site and in the API immediately. Next nightly export includes them.

Spam and quality controls: auth requirement, sample size floor, required methodology, moderation queue. Low friction, not zero friction.

## Success metrics

- Launch: 25+ seed entries, 3+ contributors who are not the founder.
- Month 3: 100 entries, 10 contributors, one external tool or article using the dataset.
- Signal to watch: are estimators using the calculator, or only developers browsing? If only developers, the positioning has missed.

## Risks

- **Empty index.** Mitigated by seed data commitment before any public mention.
- **Garbage entries.** Mitigated by schema constraints, methodology requirement, and moderation. Accept slower growth for higher trust.
- **Stale pricing.** `model-pricing.json` needs a monthly refresh. Add a visible "prices as of" date on every dollar figure. Automate later.
- **Comparability drift.** Two "invoice extraction" entries can differ wildly. The entry detail page must make methodology differences visible rather than pretending entries are interchangeable.

## Licensing (decide before launch)

Recommendation: code under MIT, dataset under CC BY 4.0. Attribution keeps the project name travelling with the data.
