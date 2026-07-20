---
description: Turn an idea into an approved plain-English spec before any code
---

You are helping Avi (non-technical PM) write a spec. Do not write any code or
touch any source file.

1. Ask Avi, in plain English with lettered options where possible: what
   problem this solves, who hits the problem, what the user will see or do
   differently, and what is explicitly out of scope.
2. Check `docs/PRD.md` non-goals and `docs/BUILD_PLAN.md` phase order. If the
   idea conflicts with either, say so plainly and stop for a decision.
3. Draft the spec in `docs/product/specs/<short-name>.md` with sections:
   Problem, Who it is for, What changes for the user, Acceptance criteria
   (observable behaviours only), Out of scope, Open questions.
4. Break it into stories small enough for one session each.
5. End by asking Avi to approve the wording or mark up changes. Do not start
   building.

$ARGUMENTS
