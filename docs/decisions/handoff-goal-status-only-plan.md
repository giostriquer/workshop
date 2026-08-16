# Decision: `handoff-goal` plan becomes status-only: no evidence written to contract files

**Date:** 2026-08-09

## Status

Implemented. Supersedes
[`handoff-goal-bounded-plan.md`](./handoff-goal-bounded-plan.md) (the
`ledger.md` bounded-plan design, toolkit `0.13.2`).

## Context

The bounded-plan fix moved history out of the boot path into an append-only
`ledger.md` and respecified the in-plan ledger as one-line entries with
phase rollups. Live pursuit shows that defense failing anyway: an operator
report captured a goal session with a **450,388-character `plan.md`** that
the pursuer treated as "the authoritative append-only ledger," spending its
entire post-compaction budget reading the file in 40k-character chunks,
narrating progress at 100k, 140k, 180k, 220k, 260k, 280k characters while
doing no goal work at all, and explicitly refusing to skip to the tail
because "the plan makes that ledger authoritative after compaction."

The failure mechanism: as long as *any* evidence recording into contract
files is sanctioned, a pursuer under pressure inflates it: entries grow,
rollups get deferred, and "the ledger outranks recollection" converts the
bloat into a mandatory full re-read after every compaction. The 0.13.2 fix
bounded the *shape* of the record but kept the record itself in files the
contract calls authoritative; that was the residual hole.

## The decision (operator-mandated)

Pursuit-side writes to `plan.md` are **status flips only**:

- set a phase's `Status:` line: at most one `in progress`; `done` for
  completed phases; `blocked` as it occurs;
- tick implementation / verification / exit-criteria checkboxes whose
  condition verifiably holds.

Nothing else is ever written into the contract directory by the pursuer: no
prose entries, no evidence, no command output, no history. Consequences:

- **`ledger.md` is eliminated.** The contract is two files again: frozen
  `goal.md`, status-tracked `plan.md`.
- **Git is the durable record.** Each verified checkpoint is a commit; the
  commit message carries what a ledger entry would have carried. The
  skill-shipped commit-cadence default (every verified checkpoint) becomes
  the evidence mechanism, not just hygiene.
- **Resumption is by status, not by history replay.** After boot or
  compaction: re-read `goal.md`, then `plan.md`, continue at the
  `in progress` phase's first unchecked box. Where a check stands is
  confirmed by re-running its Verify command, not by consulting a log.
- **A failed verification changes no status**: the box stays unchecked;
  repeated failure is a stop condition (`goal.md` → When to stop), not log
  material.
- **Route changes escalate.** The pursuer cannot rewrite phases (that is
  prose editing). If the phases no longer match reality, stop and ask. This is
  the plan-side mirror of the `goal.md` redefinition tripwire.
- **Critique mode migrates legacy contracts** by cutting accumulated
  history (git already holds it), re-deriving statuses from the repo and
  `git log`, and deleting any `ledger.md`. The 0.13.2 rule "never delete
  evidence" is reversed for contract files: evidence does not belong in
  them.

## Trade-off accepted

Mid-phase, sub-commit state (a failed attempt not worth a commit, a
half-decision) no longer survives compaction in files. Accepted: the
observed cost of sanctioned file evidence: boot-path bloat that consumes
whole sessions: outweighs the occasional cost of re-running a Verify
command or re-deriving a dead end. Statuses plus git plus re-runnable
checks are the recovery mechanism.

## Non-goals

- No change to `goal.md`'s freeze, the redefinition tripwire, the always-on
  four, or the commit cadence default (which this change leans on harder).
- No change to producer-side steps (fit check, baseline, red-team).
- Delegation lanes still return evidence: in session output, not files.

## Packaging

- Canonical `plugins/toolkit/skills/handoff-goal/SKILL.md` rewritten (the
  toolkit copy is the only one; the onboarding bundle does not ship this
  skill): description, both core rules, steps 5/8, both templates, critique
  mode, and the Rules block.
- Origin doc `docs/skills/handoff-goal.md` updated: contract tree, rule 1,
  solution shape, and the "40k-line plan" pitfall extended with the 450k
  recurrence and the status-only resolution.
- `plugins/toolkit/README.md` skill-table entry updated.
- `toolkit` `0.16.3` → `0.16.4` (patch: rework of an existing skill)
  across all four manifests; validator green.
- `docs/change-log.md` entry via the `change-log` skill.
