# How work flows in this project

This project has one engineer (Claude) and one product manager (Avi). Avi
directs by behaviour, not by code. This page describes the only route by
which an idea becomes shipped software.

## Where things live

- **Stories and status: GitHub issues on the Project board.** Avi writes
  stories with the Story issue form, and orders them by dragging cards
  between Now / Next / Later. The board is the roadmap; there is no
  separate roadmap file. Closing an issue moves its card to Done.
- **Context: markdown in this folder.** `vision.md` (what and who for),
  `specs/` (one file per feature), `decisions/` (numbered log of choices
  and why). Claude reads these automatically every session.
- `docs/PRD.md`, `docs/BUILD_PLAN.md`, `docs/DESIGN.md` remain as detailed
  reference.

## The flow

Idea, then Spec, then Story, then Build, then Verify, then Ship.

1. **Idea.** Anything either of us wants. Out-of-scope ideas become `v2`
   issues, parked on the board, not built.

2. **Spec** (`/new-spec`). A short plain-English document in
   `docs/product/specs/` from the template. Claude drafts it by asking Avi
   questions; Avi approves the words before any build starts. Direction
   changes get an entry in `decisions/`.

3. **Story.** Each spec breaks into stories small enough to build and
   check in one session, smallest shippable first. Every story is a
   GitHub issue in this format, which Avi can write or edit himself:

   > As a [user], I want [thing], so that [outcome].
   >
   > Acceptance criteria
   > - Given [state], when [action], then [observable result]
   > - Edge case: ...
   > - Out of scope: ...
   >
   > Done when: all criteria demonstrated to me in the running product.

   Criteria must be observable in a browser, never "the code does X".

4. **Build** (`/build-story <issue number>`). Claude enters plan mode,
   presents the plan in plain English, and only after approval builds on a
   feature branch. **Tests are written from the acceptance criteria before
   the feature code**, with end-to-end test names quoting the criteria.
   One story per session; never batch features.

5. **Verify** (`/verify-story`). A code-reviewer agent critiques the work
   first. Then Claude runs every automated check and gives Avi a numbered
   click-through script to check the behaviour himself. The report is a
   claim, not a conclusion.

6. **Ship** (`/ship`). After Avi confirms, the change goes up as a PR
   whose summary is user-facing with no code, marked `Closes #<issue>`.
   Avi merges; the board card moves to Done on its own.

## Rules that keep the flow honest

- Nothing is built without a story it can be traced to.
- Nothing is done until the tests pass AND Avi has confirmed the
  behaviour in the running product.
- Every session ends with a commit and an updated issue status.
- If Claude and a spec disagree, the spec wins; if the spec is ambiguous,
  Claude stops and asks with lettered options.
- One story in progress at a time.
