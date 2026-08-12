# Attic two-tier rule; docs/agents and docs/adoption removed

**Date:** 2026-08-12 · **Type:** structural (repo-only, no plugin bump)

## What changed

1. **The attic now has exactly two tiers, one rule each** (operator call):
   - `attic/skills/` and `attic/agents/` — pieces that are **in-progress or
     need fixing**, intended to ship once right. Currently: `orchestrate`,
     `codex-implement`.
   - `attic/deprecated/` — pieces with **no current function, kept as
     history**. One folder per retired piece
     (`deprecated/skills/<name>/`, `deprecated/agents/<name>/`) holding its
     spec and its parked origin doc (`origin.md`) side by side.

   The previous layout split each retired piece across two locations — spec
   under `attic/skills/` / `attic/agents/`, origin doc flat under
   `attic/deprecated/` — so every retired name appeared twice with nothing
   marking which copy was what. Moved: `agent-audit`, `doc-audit`,
   `handoff-review`, `research`, `visual-advisor` (skills, spec + origin
   doc); `handoff-pr`, `structure-view` (origin doc only — their specs
   evolved into the live `file-pr` / `arch-map`); `doc-indexer`, `research`,
   `vigil`, `visual-implementer` (agents, spec + origin doc).

2. **`docs/agents/` deleted** (operator call). The live agents' origin docs
   are gone — the doc layer followed `docs/skills/` (see
   `remove-docs-skills-layer.md`): the spec is the whole artifact, rationale
   lives in `docs/decisions/`. The four deprecated agents' origin docs were
   parked next to their specs in `attic/deprecated/agents/<name>/origin.md`
   rather than deleted, matching the retired-skill treatment. The
   origin-doc-parity workflow rule and the docs symmetry are retired with
   the layer; `CLAUDE.md`, `AGENTS.md`, `README.md`, and `attic/README.md`
   updated.

3. **`docs/adoption/` deleted** (operator call). It had been kept under a
   deprecation banner since the onboarding plugin was dropped
   (`drop-onboarding-plugin.md`); history remains in git.

4. `docs/examples/` deletion (pending in the working tree from a prior
   session) staged, and its remaining references in `AGENTS.md` /
   `CLAUDE.md` removed with the rest.

Older decision notes and change-log entries referencing the removed paths
are ledger — left as written; this note supersedes their path information.
