# 5. Main only moves via pull requests with green checks

Date: 2026-07-19
Status: accepted

## Decision

All work happens on feature branches. `main` changes only through a pull
request whose automated checks pass and whose behaviour Avi has confirmed.
Never force-push `main`. One story per change; never batch features.

## Why

Avi reviews behaviour, not code. The green tick / red cross on every
change is his independent signal that the code works, and small
single-story changes mean that when something breaks, the cause is
isolated to one change he can point at.

## Consequences

Slightly more ceremony per change; every change is traceable to a story
and reversible on its own. The PR template enforces user-facing summaries.
