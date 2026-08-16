---
name: push
description: Use when committing and pushing changes in the project repository; detect the current branch, pull origin for that branch before committing, prefer the newest meaningful update in docs/change-log.md as the commit message source when available, otherwise derive the message from the primary diff, then stage all changes, commit, and push to the same current branch.
---

# Push

Commit and push changes to the current branch.

This skill is not restricted to a particular branch; it always operates on the branch currently checked out. Adapt the trailer line in step 8 below to your project's commit-attribution preference.

## Quick start

1. Detect the current branch with `git branch --show-current`.
2. If there is no current branch name, stop and surface the error.
3. Pull the latest `origin/<current-branch>` with `git pull --ff-only origin <current-branch>`. If this fails, stop and surface the error.
4. Inspect the diff before staging.
5. Prefer the newest meaningful update in `docs/change-log.md` as the commit message source when relevant.
6. If no change-log update is the real source of the change, derive the message from the primary changed area in the diff.
7. Stage all changes with `git add -A`.
8. Commit with a multiline message and append the project's standard trailer (typically a `Co-Authored-By:` line or similar attribution; project-specific).
9. Push with `git push origin <current-branch>`.
10. Report the branch, commit hash, and subject in one sentence.

## Commit message guidance

Use a concise conventional-style subject such as:

- `docs:` for documentation or routing updates
- `feat:` for new capabilities, systems, or content
- `fix:` for behavioral corrections
- `refactor:` for structural changes without major behavior change
- `test:` for meaningful test-surface additions or revisions
- `chore:` for maintenance work that does not fit better elsewhere

For the body:

- summarize the most meaningful changed areas
- prefer 1 line per major change
- keep it grounded in the actual diff

When using `docs/change-log.md` as the source:

- prefer the newest meaningful section or entry that actually describes the core change
- do not force a change-log-derived message when the log update is incidental

When not using the change log as the source:

- derive the subject from the most important changed area in the diff
- if the diff is too ambiguous to summarize confidently, ask the user for the commit message instead of guessing

## Rules

- Always use the current checked-out branch.
- Never use `--force` or `--force-with-lease`.
- Never use `--no-verify`.
- Fail loud: if a step fails, stop and surface the error.
