# How work flows in this project

This project has one engineer (Claude) and one product manager (Avi). Avi
directs by behaviour, not by code. This page describes the only route by
which an idea becomes shipped software.

## The flow

Idea, then Spec, then Story, then Build, then Verify, then Ship.

1. **Idea.** Anything either of us wants. Ideas cost nothing and commit us to
   nothing. Out-of-scope ideas go to GitHub issues or the "v2 / parked" list
   in `docs/TASKS.md`.

2. **Spec** (`/new-spec`). A short plain-English document in
   `docs/product/specs/` describing the problem, who it is for, what changes
   for the user, and what is explicitly out of scope. Claude drafts it by
   asking Avi questions; Avi approves the words before any build starts.

3. **Story** (part of the spec). Each spec is broken into stories small
   enough to build and check in one session. Every story has acceptance
   criteria written as things Avi can observe: "when I submit the form
   without a task name, I see a message telling me what to fix", never "the
   zod schema validates task_name".

4. **Build** (`/build-story`). Claude enters plan mode, presents the plan in
   plain English, and only after approval writes code and tests on a feature
   branch. A story is not buildable if its acceptance criteria are not
   observable.

5. **Verify** (`/verify`). Claude runs every automated check, then walks
   through each acceptance criterion and reports, in plain English, what it
   observed. This report is a claim, not a conclusion. Only Avi's
   confirmation makes it done.

6. **Ship** (`/ship`). After Avi confirms, the change is pushed with a
   summary written from the user's point of view (see the PR template).
   `docs/TASKS.md` is updated with the date and commit.

## Rules that keep the flow honest

- Nothing is built without a spec it can be traced to.
- Nothing is done until the tests pass AND Avi has confirmed the behaviour.
- If Claude and a spec disagree, the spec wins; if the spec is ambiguous,
  Claude stops and asks with lettered options.
- One story in progress at a time.
