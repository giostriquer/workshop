# Decision: the `docs/skills/` layer is removed — skills are self-contained

**Date:** 2026-08-12

## Status

Implemented.

## Context

Operator call, escalating from a repeated correction: shipped skill text and
its surrounding docs kept accumulating repo bookkeeping — decision-ledger
numbers (Q13…Q17), decision-note links, dates, authoring narrative. The
operator forbade it ("the skill should always be concise and only carry
information relevant for itself or combined processes"); minutes later a
decision link was written into a `docs/skills/` page again. The origin-doc
layer itself was the trap: a per-skill doc invites restating rationale and
history next to the skill, and its "parity" upkeep multiplied every skill
edit into doc edits that re-leaked bookkeeping.

## The shape

- **`docs/skills/` deleted** (per-skill pages and the roster README — git
  history preserves the texts). The seven `deprecated/` pages — the former
  origin docs of already-retired skills — are **parked under
  `attic/docs/skills/`** (operator call), consistent with the attic's role
  as the home for retired material.
- **The model going forward:** a SKILL.md is the whole artifact — concise,
  carrying only what the skill itself or its composed processes need.
  Rationale, history, and field-feedback stories live in `docs/decisions/`
  only, and are never linked or cited from skill text. Agents keep their
  origin docs (`docs/agents/<name>.md`) — they are reference material about
  reviewers, not process text loaded into sessions.
- **Governance updated to current-state rules** (no historical narration):
  `CLAUDE.md` — source-of-truth boundary, add-a-piece steps, removal steps,
  the symmetry bullet (agents-only now), plus a new explicit prohibition on
  repo bookkeeping (Q-refs, decision links, dates) in any skill or agent
  body; `AGENTS.md` — re-grounding order, origin-doc parity, source
  priority, when-in-doubt; `README.md` — the docs map line.

## Non-goals

- `docs/agents/` stays — the agent origin docs are working reference for the
  review agents and are not loaded into sessions.
- Historical mentions of `docs/skills/` inside `docs/decisions/` stay as
  history.

## Packaging

Repo-structure change, no plugin release. The in-flight description re-trims
(shipped text) ride the next workbench release.
