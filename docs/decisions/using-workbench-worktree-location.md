# Decision: `using-workbench` carries a worktree-location convention

**Date:** 2026-08-12

## Status

Implemented.

## Context

Lived failure: a session created a git worktree inside the system temp
directory. A worktree is a repository checkout — parking it in scratch space
mixes the repo's working state into a directory that gets treated as
disposable, and ignores whatever location convention the repo already has.

The operator wants standing guidance, deliberately **not too specific** (no
ticket-naming scheme, no per-host paths): follow the repo/user convention
when one exists; otherwise a stable in-repo default.

## The shape

A new `## Worktree location` section in `using-workbench` — the skill that
already carries the session-conduct conventions (disposable flow artifacts):

- Placement is a convention, not a per-task choice: inspect
  `git worktree list` and any repo/user rule first, follow the established
  pattern.
- Absent one: `<repo>/.worktrees/<task-name>`, verifying the directory is
  ignored (`git check-ignore`) before the worktree exists — `.gitignore` it
  first if not.
- Never the system temp directory or any path outside the repository unless
  the user explicitly asks — temp space is for disposable non-repository
  artifacts (logs, screenshots, evidence), not a repository checkout.

Upstream comparison (checked on request): obra/superpowers solves this with a
dedicated ~1,500-word `using-git-worktrees` skill workbench never adopted —
same placement shape (declared preference → detect `.worktrees/`/`worktrees/`
→ default `.worktrees/` at root) plus a mandatory `git check-ignore` gate,
native-tools-first guidance, isolation detection, dependency setup, and a
clean-baseline test run. Adoption was considered and declined (operator
question, same day): the lived evidence is one placement failure, which the
section covers; native harness tooling (e.g. Claude Code's worktree isolation)
already owns placement and cleanup when used; and the setup/baseline half
solves problems not yet hit — below the scaffold's lived-in-proof bar. The two
high-value ideas are borrowed instead: the `git check-ignore` gate and
prefer-the-native-mechanism. Revisit adoption if worktree-heavy workflows
surface a second failure class (setup, baseline, nesting).

## Non-goals

- No prescribed naming scheme beyond `<task-name>`, no tooling, no hook —
  informational orientation, consistent with the skill's no-compulsion
  stance.
- Other skills are untouched; engines that use worktree isolation inherit
  the convention through orientation, not through per-skill text.

## Packaging

Canonical `plugins/workbench/skills/using-workbench/SKILL.md` edited; origin
doc `docs/skills/using-workbench.md` updated. Ships as `workbench 0.20.5`.
