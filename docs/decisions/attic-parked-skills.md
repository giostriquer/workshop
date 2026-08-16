# attic/: a home for parked (in-progress or deprecated) skills

**Date:** 2026-08-10 · **Status:** landed

## What's changing

1. **New top-level `attic/` folder.** Skills that should live in the repo but
   ship in no plugin and run on no host: in-progress drafts that haven't earned
   inclusion yet, and deprecated pieces retired from the shipped set. Inert by
   location: no host discovers it, no manifest references it, the validator
   ignores it. Semantics in `attic/README.md`; `CLAUDE.md` / `AGENTS.md` updated
   to name it.

2. **`handoff-review` deprecated** (operator call). Removed from the `toolkit`
   plugin (toolkit bumps `0.16.5 → 0.17.0`) with the spec parked verbatim at
   `attic/skills/handoff-review/SKILL.md` and the origin doc moved to
   `docs/skills/deprecated/handoff-review.md` with a deprecation banner.
   Cross-references scrubbed: `handoff-goal` no longer offers a
   "handoff-review continue brief" as the lighter alternative (a plain task is),
   `handoff-pr`'s Review field generalizes to "pre-PR review", and the READMEs /
   adoption docs / manifests list eleven skills. The Codex-surface lists in
   `docs/adoption/` were also three skills stale (missing `ui-demo-video`,
   `route-work`, `arch-map`); fixed while touching them.

3. **`orchestrate` and `codex-implement` parked as in-progress** (same-day
   follow-up widened this from `orchestrate` alone). Both previously lived only
   in the global `~/.claude/skills/` scope (never shipped in a plugin; nothing
   to remove from Codex or Cursor global configs: verified absent). Moved to
   `attic/skills/orchestrate/` and `attic/skills/codex-implement/` (SKILL.md +
   `codex-task.sh`) and removed from the global scope so they can be reworked
   under version control. Note: `~/.claude/rules/model-selection.md` still
   references the doctrine the pair carries; the rule file keeps working, but
   neither skill is invocable until promoted somewhere a host discovers.

4. **Global-scope cleanup:** the empty `~/.codex/skills/codex-primary-runtime/`
   directory (no SKILL.md, no files: a dead remnant) was deleted outright;
   nothing to park. The always-injected `~/.claude/rules/model-selection.md`
   was parked at `attic/skills/orchestrate/model-selection.md`, next to the
   skill whose doctrine it references: the routing invariants stay live via
   the shipped `route-work` skill, but no rule file is injected globally
   anymore. Separately (their own repos, not this one), `conoswiki-feed` and
   `loom-feed` were relocated from the global scopes to their canonical homes
   (`wiki` and `commonplace` repos, `.claude/skills/`), leaving `context7-mcp`
   as the only global standalone skill.

## Why

Deleting a retired spec loses text that took rounds to harden; leaving a
draft in a machine-local global config strands it outside version control and
review. The attic is the middle state: versioned, visible, explicitly not
shipped. Precedent: `docs/skills/deprecated/structure-view.md` already
established "deprecated origin docs are kept"; this extends the same courtesy
to the spec files themselves.

## Rules encoded

- Attic pieces are exempt from the docs symmetry until promoted; deprecated
  pieces keep `docs/skills/deprecated/<name>.md`.
- `CLAUDE.md` § "When removing or deprecating" step 2 now parks specs in the
  attic instead of deleting them.
