# 3. Type checking is mandatory; no separate linter

Date: 2026-07-19
Status: accepted

## Decision

`npm run typecheck` (astro check + tsc) must pass before any commit. No
ESLint, Prettier, or Biome.

## Why

Avi chose the minimal option when offered the trade-off. Type checking
catches wrong-shape data, which is the class of silent breakage this
project fears most. Style linting adds dependencies and config for lower
value on a one-engineer codebase with a minimal-dependencies rule.

## Consequences

Fewest moving parts; formatting consistency relies on convention. Revisit
if a second human engineer ever joins.
