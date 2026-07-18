# Token Cost Index

*Working name. Rename before launch.*

An open dataset of measured token costs for business AI tasks.

## The problem

Nobody can tell you what API-based AI will cost before you build it. Teams estimate by running a pilot and extrapolating. Finance wants a number before sign-off. Published benchmarks measure model quality, not cost per business task.

## What this is

A community index where each entry records how many tokens a defined business task consumed, measured from real usage. Invoice extraction, contract clause classification, PO matching, support summarisation. Entries store tokens, not dollars, so the data stays useful as prices change. A pricing layer converts to current dollars per model.

**Open data, closed write path.** Anyone can read, query, and export the dataset. Submissions go through a validated web form and a moderation queue.

## Using the data

- **Browse:** the web index with filters and a live cost calculator
- **API:** public read endpoint over approved entries (see `/api` on the site)
- **Export:** versioned JSON snapshots in `data/exports/`, refreshed nightly, validated against `schema/entry.schema.json`

## Contributing an entry

Submit through the site, not this repo. You will need:

- A defined task and unit (per invoice, per clause, per ticket)
- Measured token counts from at least 10 task units (median required, p90 encouraged)
- A methodology description: how you measured, what the inputs looked like

Entries are moderated for quality before publication. Self-reported single runs and estimates are declined.

## Repo layout

```
CLAUDE.md                    Working instructions for Claude Code
docs/PRD.md                  Product requirements
docs/BUILD_PLAN.md           Phased build plan
docs/DESIGN.md               Design direction
schema/entry.schema.json     Entry format (export and validation)
supabase/migrations/         Database schema, the source of truth
data/model-pricing.json      USD per million tokens, per model, dated
data/seed-entries.example.json  Illustrative examples of the quality bar
data/exports/                Versioned dataset snapshots (generated)
```

## Licence

Code: MIT. Dataset (`data/`): CC BY 4.0. Both pending final confirmation before launch.
