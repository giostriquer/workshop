# Decision: the project is renamed `agent-workshop` → `workshop`

**Date:** 2026-08-12

## Status

Implemented — ships in `toolkit 0.5.0` and `workbench 0.22.1`.

## Context

Operator call: drop the `agent-` prefix everywhere — repository, marketplace,
namespaces, marker tokens.

The name was four independent identifiers that happened to share a string, and
they carry very different costs:

| Identifier | Cost of changing |
| --- | --- |
| GitHub repository name | None — GitHub redirects the old path permanently |
| Marketplace name (`workbench@…`) | A manual settings fix on every machine |
| Marker namespace (`<!-- …:rule -->`) | Silent duplicate blocks on adopted machines |
| Local directory path | Orphans the machine-local auto-memory directory |

## What was renamed, and what deliberately was not

Everything shipped or user-facing moved: the repository, all three host
marketplaces, plugin manifests, `package.json`, both LICENSE attribution URLs,
`README`s, `CLAUDE.md`, `AGENTS.md`, the usage handbook, the change log, and the
installer's marker namespace.

Three things kept the old string, on purpose:

- **`docs/decisions/`** — a historical record. The project *was* named
  `agent-workshop` when those notes were written; rewriting them would make the
  record describe a past that did not happen. Their GitHub URLs resolve through
  the redirect.
- **`attic/`** — parked history, shipped by no plugin and ignored by the
  validator. The first pass rewrote it and was reverted: several entries read
  "the onboarding `agent-workshop` plugin was deleted", which names a **deleted
  plugin**, not the repository. Renaming that is simply false.
- **`scripts/validate-native-plugin.ps1`** — its `plugins/agent-workshop` guard
  exists to stop that deleted plugin from reappearing. The literal is the thing
  being guarded against.

The distinction throughout: `agent-workshop` as *the project* was renamed;
`agent-workshop` as *the name of a plugin that once existed* was not.

## The marker namespace

`adopt.mjs` identifies the content it owns by an HTML-comment marker. Renaming
that token without carrying its predecessor would make every block already on a
machine invisible — not reported as an orphan either, since orphan detection
keys on the same pattern — and the installer would append a second copy of
everything beside it.

So `LEGACY_NS` records retired namespaces. Matching, orphan detection, pruning,
and the "is this file ours" check all accept any namespace in the list; only the
current one is ever written. A block found under a retired namespace is
rewritten in place and reported as a migration.

At the time of the rename no machine had adopted, so the list protects against a
window of roughly one hour in which `toolkit 0.4.0` was public. It is kept
anyway: the failure it prevents is silent, and the same mechanism is what any
future rename will need. An entry may be retired only once no machine can still
be carrying it.

## Deliberately deferred

The local working directory keeps its old path. The auto-memory directory is
derived from it, so renaming the folder orphans that memory; moving both is a
separate manual step, not something to bundle into a release.

## Verification

The rename was applied by script over `git ls-files` with `docs/decisions/` and
the validator excluded, JSON parsed on write to fail loud on a broken manifest.
`attic/` was reverted after review of its diff. The namespace migration was
driven against a fixture simulating a machine that had adopted `toolkit 0.4.0`:
old-namespace blocks in both a single-file target and a rules directory migrated
in place, no duplicates, surrounding prose preserved, idempotent on re-run. The
native-plugin validator passes.
