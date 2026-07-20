---
description: Build one approved story from a spec, plan mode first
---

Build exactly one story. The story must come from an approved spec in
`docs/product/specs/` and be listed in `docs/TASKS.md`.

1. Read the spec, `CLAUDE.md`, and `docs/TASKS.md`. Confirm the story's
   acceptance criteria are observable behaviours. If not, stop and send it
   back to `/new-spec`.
2. Enter plan mode. Present the plan in plain English: what will change for
   the user, what will be tested, what could go wrong. Wait for approval.
3. Build on a feature branch. Every story gets at least one automated test
   that fails without the change and passes with it.
4. Run `npm run test`, `npm run build`, `npm run typecheck`. All must pass.
5. Update `docs/TASKS.md` to mark the story in progress.
6. Finish by handing over to `/verify`. Never call the story done yourself.

$ARGUMENTS
