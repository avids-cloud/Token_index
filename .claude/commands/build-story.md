---
description: Build one approved story from its GitHub issue, plan mode first
---

Build exactly one story. Usage: `/build-story 12` where 12 is the GitHub
issue number. The issue must use the Story template and sit in the board's
Now column (confirm with Avi if unsure).

1. Read the issue via the GitHub tools, plus `CLAUDE.md` and the spec the
   issue links. Confirm every acceptance criterion is observable in the
   running product. If any is not, stop and ask Avi to sharpen it on the
   issue; do not build against criteria you cannot demonstrate.
2. Enter plan mode. Present the plan in plain English: what will change
   for the user, what will be tested, what could go wrong. Wait for
   approval.
3. Comment on the issue that the story is in progress, with the branch
   name.
4. **Write the tests first, from the acceptance criteria, before the
   feature code.** E2E test names quote the criteria word for word where
   possible. Watch them fail, then build until they pass.
5. Run `npm run test`, `npm run build`, `npm run typecheck`,
   `npm run test:e2e`. All must pass.
6. Commit on the feature branch. One story per branch; never batch
   stories.
7. Finish by handing over to `/verify-story`. Never call the story done
   yourself.

$ARGUMENTS
