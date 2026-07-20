---
description: Ship a story Avi has confirmed - commit, push, summary
---

Ship the current story. Precondition: Avi has explicitly confirmed the
acceptance criteria in this conversation. If that has not happened, stop and
say so.

1. Confirm all three checks pass: test, build, typecheck.
2. Commit on the feature branch with a clear message naming the story and
   justifying any new dependency.
3. Push with `git push -u origin <branch>`.
4. Open or update a PR using `.github/pull_request_template.md`. The summary
   must describe the change in user-facing terms with no code snippets.
5. Update `docs/TASKS.md`: move the story to Done with the date and commit.
6. Report the PR link and a one-paragraph plain-English summary of what
   shipped.

$ARGUMENTS
