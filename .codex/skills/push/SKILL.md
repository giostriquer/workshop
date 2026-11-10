---
name: push
description: Use when the user asks to commit and push this repository's changes to the branch currently checked out, or another repo-local skill hands off its commit and push.
---

# Push

Commit and push changes to the current branch.

This skill is not restricted to a particular branch; it always operates on the branch currently checked out.

## Quick start

1. Detect the current branch with `git branch --show-current`.
2. If there is no current branch name, stop and surface the error.
3. Pull the latest `origin/<current-branch>` with `git pull --ff-only origin <current-branch>`. If this fails, stop and surface the error.
4. Inspect `git status --short -uall`, `git status --short --ignored -uall -- .codex/skills` and the diff before staging. The first expands new directories to their files; the second shows new mirror files a local exclude rule hides. An ignored path joins the list only as the twin of a listed `.claude/skills` path. Sort every changed path: it belongs to this change, or it is another session's or the user's work.
5. Prefer the newest meaningful update in `docs/change-log.md` as the commit message source when relevant.
6. If no change-log update is the real source of the change, derive the message from the primary changed area in the diff.
7. Write the paths that belong to this change, one per line, to a list file in the session's scratch directory. Name files, not directories. Paths that belong to someone else stay out of the list.
8. Stage and commit from that list: `git --literal-pathspecs add -f --pathspec-from-file=<list>`, then `git --literal-pathspecs commit --pathspec-from-file=<list>` with a multiline message. The list file keeps paths out of shell word splitting, `--literal-pathspecs` keeps a path with glob characters from matching other files, `-f` stages a `.codex/` mirror path that a local exclude rule ignores, and the pathspec commit leaves files another session staged out of the commit. No trailer: this repository's history carries none.
9. Check that `git show --name-only --format= HEAD` lists exactly the listed paths.
10. Push with `git push origin <current-branch>`.
11. Report the branch, commit hash, and subject in one sentence, then any changed paths left out of the commit.

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
