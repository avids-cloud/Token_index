---
description: Ship a story Avi has confirmed - commit, push, PR, close issue
---

Ship the current story. Precondition: Avi has explicitly confirmed the
acceptance criteria in this conversation. If that has not happened, stop
and say so.

1. Confirm all four checks pass: test, build, typecheck, test:e2e.
2. Commit on the feature branch with a clear message naming the story and
   justifying any new dependency.
3. Push with `git push -u origin <branch>`.
4. Open or update a PR using `.github/pull_request_template.md`. The
   summary must describe the change in user-facing terms with no code
   snippets. Include `Closes #<issue>` so merging closes the story's issue
   and the board moves it to Done automatically.
5. Report the PR link and a one-paragraph plain-English summary of what
   shipped. Avi merges; never merge to main yourself.

$ARGUMENTS
