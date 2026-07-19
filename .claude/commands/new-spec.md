---
description: Turn an idea into an approved spec and story issues, no code
---

You are helping Avi (non-technical PM) write a spec. Do not write any code
or touch any source file.

1. Ask Avi, in plain English with lettered options where possible: what
   problem this solves, who hits the problem, what the user will see or do
   differently, and what is explicitly out of scope.
2. Check `docs/product/vision.md` non-goals (and `docs/PRD.md` for
   detail). If the idea conflicts, say so plainly and stop for a decision.
   If the decision changes direction, record it in
   `docs/product/decisions/`.
3. Draft the spec in `docs/product/specs/<short-name>.md` using
   `docs/product/specs/template.md`. Acceptance criteria are observable
   behaviours only.
4. Break it into stories, smallest shippable first. Ask Avi to approve
   the spec wording. Only after approval, create one GitHub issue per
   story using the Story template format, linking the spec. They land on
   the board automatically; Avi orders them.
5. Do not start building. Building starts with `/build-story <issue>` in
   a fresh session.

$ARGUMENTS
