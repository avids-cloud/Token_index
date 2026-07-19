# Vision

*One page. What this is and who it is for. Details live in `docs/PRD.md`.*

## The problem

Businesses cannot estimate what API-based AI will cost before they build
it. The current method is guess, pilot, extrapolate. Finance teams want a
number before sign-off and nobody can give them one. Published benchmarks
measure model quality, not cost per business task.

## What we are building

Token Cost Index: an open, community-maintained index of measured token
costs for specific business tasks. Each entry records how many tokens a
defined task consumed (per invoice, per contract clause, per support
ticket), measured from real usage, with enough methodology to make entries
comparable. A pricing layer converts tokens to current dollars for any
model, always dated.

Open data, closed write path. Anyone can read, query, and export the
dataset. Submissions go through a validated form and a moderation queue,
never pull requests.

## Who it is for

1. **Estimators** building a business case: they want a defensible cost
   range for "process 10,000 invoices a month with AI" before procurement.
2. **Contributors** who have run AI tasks in production and can share
   measured token counts.
3. **Researchers and tool builders** who pull the dataset via API or
   export.

## What success looks like

Launch with 25+ seed entries and 3+ outside contributors. By month three:
100 entries, 10 contributors, one external tool or article using the
dataset. The signal to watch: are estimators using the calculator, or only
developers browsing? If only developers, the positioning has missed.

## What this is not

Not a model quality benchmark. Not live token counting or SDK
instrumentation. Not a home for private per-company data. Full non-goals
in `docs/PRD.md`.
