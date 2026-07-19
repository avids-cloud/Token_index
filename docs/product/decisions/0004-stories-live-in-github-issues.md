# 4. Stories live in GitHub issues on the Project board, not in files

Date: 2026-07-19
Status: accepted

## Decision

Stories are GitHub issues created from the Story template, tracked on
Avi's GitHub Project board. The board's columns (Now / Next / Later /
Done) are the roadmap. Vision, specs, and this decision log stay as
markdown in the repo. `docs/TASKS.md` is retired to a pointer.

## Why

Stories and prioritisation are the PM's artifact: a board gives Avi
browser editing, a fill-in story form, and drag-and-drop ordering with no
git skills required. Specs and decisions are the engineer's context:
markdown in the repo is read automatically every session and versioned
with the code. Two surfaces, each owned by the person who works there,
and exactly one place tracks status.

## Consequences

Claude creates, updates, and closes issues via the GitHub API but cannot
move board cards; the board's Auto-add workflow (one-time setup by Avi)
places new issues automatically, and closing an issue moves it to Done.
Prioritisation between Now/Next/Later is drag-and-drop that only Avi does.
