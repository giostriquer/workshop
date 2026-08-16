# Decision: `handoff-goal` right-sizes review cadence: reviewers for chunks, adversarial review at phase exit

**Date:** 2026-08-09

## Status

Implemented. Complements
[`handoff-goal-status-only-plan.md`](./handoff-goal-status-only-plan.md)
(same day).

## Context

The pursuit template's "independent pass" wording ("a fresh subagent
prompted to *refute* done, or at minimum a clean re-run of the Verify
command") reads as offering a per-check choice, and in live pursuit
sessions over-chose the heavy branch: reviewer subagents dispatched for
every small task, burning wall-clock and context on work a verify re-run
already covers, while the one review that most deserves adversarial
weight, the completed phase's cumulative diff, had no mandated slot.

## The decision (operator-mandated)

Review effort scales with the size of the landed work, stated in the
`plan.md` template the pursuer re-reads at every boot:

- **Small routine tasks:** the independent pass is a clean re-run of the
  Verify command. Reviewer subagents are **not** dispatched per task.
- **Substantial chunks**: a feature, a bug fix, a risky refactor:
  get the reviewers after they land.
- **Phase completion** gets an **adversarial code-quality review** of the
  phase's cumulative diff: the `code-quality-review` skill where the
  runtime ships it, otherwise a fresh reviewer prompted to attack the
  diff's correctness and maintainability. Mechanical slot: a standing
  exit criterion in the phase template, alongside the committed-work
  criterion.

Critique mode audits the cadence both ways (per-task reviewer mandates
are a defect; a missing phase-exit adversarial review is a defect).

## Packaging

- Canonical `plugins/toolkit/skills/handoff-goal/SKILL.md`: plan-template
  preamble, phase exit criteria, critique checklist.
- Origin doc `docs/skills/handoff-goal.md`: solution-shape paragraph.
- `toolkit` `0.16.4` → `0.16.5` (patch) across all four manifests;
  validator green.
- `docs/change-log.md` entry via the `change-log` skill.
