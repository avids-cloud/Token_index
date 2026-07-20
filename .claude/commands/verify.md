---
description: Verify a built story against its acceptance criteria and report
---

Verify the current story. You may not mark anything done. Verification
produces a report for Avi, and only Avi's confirmation completes a story.

1. Run `npm run test`, `npm run build`, `npm run typecheck`. Report each
   result honestly, including skipped tests and why they skipped.
2. Where possible, exercise the real behaviour (run the dev server, walk the
   flow the user would walk) rather than relying on tests alone.
3. For each acceptance criterion in the spec, report in plain English: what
   you did, what you observed, and whether it matches. Use "matches",
   "does not match", or "could not check because X". Never "done".
4. List anything you noticed that Avi should look at even though it is
   outside the criteria.
5. End with instructions for how Avi can see the behaviour (what to
   click, what to look for) and the question: "Do you confirm the acceptance
   criteria?" Then stop.

$ARGUMENTS
