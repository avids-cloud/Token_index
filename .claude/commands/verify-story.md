---
description: Verify a built story against its acceptance criteria and report
---

Verify the current story. You may not mark anything done. Verification
produces a report for Avi, and only Avi's confirmation completes a story.

1. Run the code-reviewer subagent (`.claude/agents/code-reviewer.md`) on
   the branch diff first. Fix what it finds before continuing; list
   anything you chose not to fix and why.
2. Run `npm run test`, `npm run build`, `npm run typecheck`, and
   `npm run test:e2e` (after a fresh build). Report each result honestly,
   including skipped tests and why they skipped.
3. Confirm every acceptance criterion on the story's GitHub issue has a
   test whose name quotes it. A criterion without a test means the story
   is not ready to verify; go back and write it.
4. Where possible, exercise the real behaviour (run the dev server, walk
   the flow the user would walk) rather than relying on tests alone.
5. For each acceptance criterion, report in plain English: what you did,
   what you observed, and whether it matches. Use "matches",
   "does not match", or "could not check because X". Never "done".
6. List anything you noticed that Avi should look at even though it is
   outside the criteria.
7. End with a click-through script for Avi: numbered steps, what to click,
   what he should see at each step (on the preview link if one exists,
   otherwise locally). Close with the question: "Do you confirm the
   acceptance criteria?" Then stop.

$ARGUMENTS
