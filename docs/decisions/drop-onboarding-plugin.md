# Decision: delete the onboarding `agent-workshop` plugin; single-plugin marketplace

**Date:** 2026-08-11

## Status

Implemented (2026-08-11). `validate-native-plugin.ps1` (rewritten single-plugin)
passes. Rides the uncommitted `toolkit 0.20.0` batch.

## Context

The onboarding plugin carried the copy-and-adapt scaffold: one guided skill
(`agent-workshop-onboard`) wrapping a reference bundle of agent specs, flattened
skill specs, host wrappers, a pack catalog, and mirrored docs. In practice the
operator's adoption path converged on the `toolkit` plugin: direct-use,
no-setup, and the onboarding machinery became maintenance surface: every doc
change re-mirrored into the bundle, every roster edit bumped a plugin nobody
installed. Operator call: delete it.

## Decision

**The marketplace ships one plugin: `toolkit`.**

- **Parked to the attic** (specs preserved, run nowhere): agents `doc-indexer`,
  `research`, `visual-implementer` (→ `attic/agents/`); skills `agent-audit`,
  `doc-audit`, `research`, `visual-advisor` (→ `attic/skills/<name>/SKILL.md`).
  Their docs moved under `docs/{agents,skills}/deprecated/` with parked notes.
- **Dropped with the plugin**: the onboarding skill, `references/` bundle
  (wrappers, catalog.json, mirrored docs), and the plugin's three host
  manifests. Bundle copies of pieces canonical elsewhere (reviewers → toolkit;
  `change-log`, `push`, `wiki-maintainer`, `vigil` → `.claude/`) were
  duplicates and simply died.
- **`.claude/` is now canonical for the repo's working set** (`change-log`,
  `push`, `workbench-drift`, `wiki-maintainer`, `vigil`): no bundle templates
  remain to sync against.
- **All three marketplaces** (Claude, Codex `.agents/plugins/`, Cursor) list
  exactly `toolkit`; the validator was rewritten to the single-plugin shape and
  guards against `plugins/agent-workshop` reappearing.
- `docs/adoption/` kept for history under a deprecation banner.

## Shipped-text rule (same operator message)

**Shipped skill text may reference only what an installed environment can
reach**: public URLs, never repo-relative paths or repo-local tooling. Applied
as a sweep: all method provenance footers now point at the GitHub blob URL of
the decision doc; `using-workbench` lost its `workbench-drift` mention and points at
the published flow model URL; the toolkit README and LICENSE attribution links
became absolute GitHub URLs. The rule is recorded in `CLAUDE.md` § boundaries.

## Non-goals

- Not a deletion of the parked content: the attic keeps it versioned; any
  piece can promote back through the normal inclusion bar.
- No toolkit version bump beyond the in-flight `0.20.0` (nothing shipped
  changed identity; the deleted plugin was never part of toolkit).

## Acceptance criteria

- `plugins/agent-workshop/` gone; seven pieces parked with docs under
  `deprecated/`; marketplaces single-plugin; validator green; no shipped file
  references a repo-relative path or repo-local tooling.
