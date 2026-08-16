# Decision: add the `route-work` skill

**Date:** 2026-07-20

## Status

Implemented.

## Context

The operator's always-injected model-selection rules file carried a full
model table (cost / intelligence / taste on a 1–10 scale) plus routing
doctrine. Two failures accumulated in lived use:

1. **The table went stale.** The file still listed a retired GPT tier while
   the actual Codex config had moved on to a newer family with six effort
   levels. An always-injected copy has no update trigger: nothing forces it
   to track the fleet.
2. **Doctrine is not a decision procedure.** The file said *what the models
   are* but not *how to grade a task*, so in practice every dispatched task
   defaulted to the top GPT tier at max effort: overpaying in wall-clock
   and weekly-limit burn for work that a mid-ladder tier handles.

## The shape

`route-work` lands in `toolkit` as a direct-use skill: invoked with a task
description, the session grades it against a five-axis rubric and returns an
actionable route. Three parts:

- **The canonical model × effort table**: the single source of truth,
  updated only in the skill. Values are the operator's calibration
  (confirmed row by row before freezing, anchored against public benchmarks
 (AA Intelligence Index, DeepSWE, SWE-bench Pro, Frontend Arena) as of
  2026-07). The key calls: the workhorse model's effort tiers are graded as
  separate rows so "climb the ladder before hopping models" is expressible;
  the workhorse's taste sits just under the frontier's, so user-facing work
  doesn't automatically escalate; and the mid-tier Claude and GPT models
  are *cost lanes, not quality lanes*: a class below the workhorse on both
  axes, kept for the cheapest bulk and for Claude-side dispatch necessity.
- **The grading rubric**: repo precedent, ambiguity, failure visibility,
  taste surface, blast radius. Cool across the board routes to the cheapest
  capable tier at modest effort; high ambiguity or silent-failure risk
  routes to the top tier *or* the leverage pattern (cheap implementer +
  high-tier plan-review checkpoint). The recommendation is a **process
  pattern** (direct dispatch / plan-review checkpoint / judge loop / taste
  pass), not just a model name.
- **The output contract**: `route:` / `why:` / `grades:`, three lines,
  directly usable in the dispatch command.

The hard invariants from the rules file ride along in the skill and remain
mirrored in the (now slimmed) always-injected file. Never use Haiku or Sonnet;
orchestration stays on the session's own model; standing permission to
escalate when output misses the bar; intelligence > taste > cost for
anything that ships.

**Companion change (outside this repo):** the operator's always-injected
rules file is slimmed to just those invariants plus a pointer to this skill,
so the injected copy stops carrying a table that goes stale.

## Packaging

- Canonical (only) copy at `plugins/toolkit/skills/route-work/SKILL.md`. Not
  mirrored to `.claude/` and not in the onboarding bundle: like
  `ui-demo-video`, it is a direct-use piece.
- Origin doc at `docs/skills/route-work.md`; roster entry in
  `docs/skills/README.md` (seventeen skills), bundle copy re-synced.
- Root `README.md` and `plugins/toolkit/README.md` skill lists gain the new
  name; Codex manifest prose and default prompts updated.
- `scripts/validate-native-plugin.ps1` `$expectedSkills` widens to include
  `route-work` in both the Claude and Codex assertions.
- `toolkit` `0.13.2` → `0.14.0` (new skill = minor bump) in the three plugin
  manifests and the Claude marketplace entry; `agent-workshop` `0.1.19` →
  `0.1.20` (bundled roster copy changed).

## Validation

- `scripts/validate-native-plugin.ps1` passes with the new skill directory.
- Table values confirmed by the operator row by row (three rounds: draft →
  relational corrections → freeze) before being written; per the skill's own
  rule, they are never edited without that confirmation.
- GREEN test: two fresh subagents given only the SKILL.md and a task
  description each produced the exact three-line contract, and graded
  differentially: a mechanical migration routed to sol *medium* · direct
  dispatch (the cheap route the old doctrine never picked), while a
  silent-failure copy task escalated to fable-5 with a reasoned rationale.

## Non-goals

- The skill recommends; it never dispatches. Dispatch mechanics belong to
  `codex-implement` and the Agent/Workflow params.
- No portable "correct" table: the values are explicitly the operator's
  calibration; adopters swap rows for their own fleet and keep the rubric.
- Orchestration-level decisions (decompose / dispatch / judge) are out of
  scope by invariant and never route to a weaker model.
