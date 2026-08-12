# Decision: the `docs/conventions/` layer is removed

**Date:** 2026-08-12

## Status

Implemented.

## Context

Operator call: the conventions layer is no longer relevant. Its seven docs
(cross-host-wrappers, doc-routing, per-task-fresh-dispatches,
reviewer-session-continuation, scripts-discipline, skill-parity, README)
dated from the pre-plugin era — host-mirror parity, doc-routing for the
deprecated `doc-indexer`, dispatch disciplines written when the scaffold's
pieces were copied file-by-file into adopting repos. The plugin era replaced
most of what they governed: skills ship via plugins (no mirror parity to
maintain), and the workbench flow docs carry the process rules.

## The shape

- `docs/conventions/` deleted outright (git history preserves the texts; no
  attic parking — the attic is for skills/agents with residual value, and
  these texts' load-bearing content was inlined where referenced).
- Live references updated: the repo-map line in `README.md`; `CLAUDE.md`'s
  conventions-parity bullet, source-of-truth line, add-a-piece step, and
  scope sentence ("agent definitions and skills + origin docs"); the same
  four surfaces in `AGENTS.md` (with the reviewer-session discipline inlined
  in one sentence); `docs/examples/spec-driven-development.md`'s three
  convention links (discipline inlined); `docs/agents/spec-reviewer.md` and
  `docs/skills/push.md` pointers.
- Kept: the pattern-reviewer / spec-reviewer agent contracts' references to
  an **adopting project's** `docs/conventions/<domain>/` layout — that names
  where a host project typically keeps its own convention docs, independent
  of this repo's directory. Historical mentions in `docs/decisions/` and
  `attic/` stay as history.

## Packaging

Repo-structure change, no plugin release — recorded under a `repo` change-log
section.
