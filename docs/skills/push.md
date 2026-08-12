# push

## Origin

In the originating project, every meaningful change-log entry was followed by a manual commit + push step. The procedure was the same every time but had several footguns: forgetting to pull before commit, force-pushing to recover from a bad rebase, derived commit messages drifting from what the change-log entry said, missing co-author trailer.

`push` was formalized to make the procedure deterministic, branch-aware, and consistent with the `change-log` entry as the message source.

## Problem

Three failure modes appeared in pre-skill commit / push flow:

1. **Branch confusion.** Commit landed on the wrong branch because the operator forgot what was checked out.
2. **Skipped pull.** Local commits piled up against a stale remote, then merge conflicts on push.
3. **Drifted commit message.** The `change-log` entry described one thing; the commit message described another.

The skill enforces branch detection, fail-loud pull, and `change-log`-derived messages when applicable.

## Solution shape

Ten-step quick-start procedure:

1. Detect current branch via `git branch --show-current`. Stop if no branch.
2. `git pull --ff-only origin <current-branch>`. Stop on failure.
3. Inspect the diff before staging.
4. Prefer the newest meaningful `docs/change-log.md` entry as the commit message source.
5. If no change-log update is the real source, derive from the diff.
6. `git add -A`.
7. Commit with multiline message and project-standard trailer.
8. `git push origin <current-branch>`.
9. Report branch + commit hash + subject.

**Hard rules:** no `--force`, no `--force-with-lease`, no `--no-verify`. Fail loud on any step.

**Conventional-style subjects:** `docs:`, `feat:`, `fix:`, `refactor:`, `test:`, `chore:`. Body summarizes major changed areas, one line each.

## Real invocation snippet

```markdown
Use the `push` skill to commit and push: it detects the current branch, pulls origin first, prefers the newest `change-log.md` entry as the message source, stages all changes, commits with the project's trailer, and pushes.
```

Example invocation:

> /push

The skill is invocation-only; no agent dispatches it.

## Pitfalls observed

- **Forcing a change-log-derived message when the change-log update was incidental.** The skill explicitly warns against this. If the change-log update isn't the real source of the change, derive from the diff instead.
- **Asking the user for the commit message instead of guessing on ambiguous diffs.** The skill prefers asking over guessing — better to pause for clarity than to land a misleading message.
- **Force-pushing to "recover" from a bad rebase.** The skill bans this. Use the right git workflow (revert, fix-up commits) instead.
- **Bypassing pre-commit hooks with `--no-verify`.** Banned. If a hook fails, fix the underlying issue.

## Adaptation notes

- The **co-author trailer** is project-specific (model attribution differs per host: Claude / Codex / Gemini). Adapt step 7 to your project's trailer convention. The originating project has Claude/Codex/Gemini variants of this skill with different model trailers.
- The **conventional-style subject prefixes** (`docs:`, `feat:`, etc.) are widely portable. Adopt as-is or extend with project-specific prefixes.
- The skill operates on the project repo only — does not touch upstream / parent wikis or unrelated repos. If your project has linked sibling repos, write a separate skill per repo rather than generalizing.
- The "prefer change-log as message source" rule pairs with the `change-log` skill. If your project doesn't use a change-log convention, fall back to "always derive from the diff."
