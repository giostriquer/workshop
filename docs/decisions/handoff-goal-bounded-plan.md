# Decision: `handoff-goal` bounds `plan.md` — history archives to a third contract file

**Date:** 2026-07-19

## Status

Implemented; **superseded** by
[`handoff-goal-status-only-plan.md`](./handoff-goal-status-only-plan.md)
(2026-08-09) — live pursuit showed the bounded ledger still bloating the
boot path, so pursuit-side plan writes became status flips only and
`ledger.md` was eliminated.

## Context

Live goal pursuit surfaced a failure the v2 split contract doesn't defend
against: pursuing sessions dutifully update `plan.md` after every step — as the
template instructs — and on long-running goals the file grew to ~40k lines.
Because the contract tells the pursuer to re-read `plan.md` at every boot and
after every compaction, every boot paid the token cost of the goal's entire
history, visibly slowing the loop the contract exists to steer.

The root cause is the template's own ledger specification:

- The **Progress ledger** was declared *append-only*, with rich entries
  ("the verification run (command + result) · … · any decision + why") and
  no bound on entry size or count. Growth was by design; nothing ever shed.
- The plan-update triggers fire constantly (every failed verification, every
  completed phase), so the unbounded section is also the hottest one.
- "Record failed checks without erasing evidence" made pruning read as an
  integrity violation — the pursuer had no sanctioned way to shrink the file.

Per-step recording is not the bug — it is the crash-recovery mechanism. The
bug is that the record lived permanently in the boot path.

## The shape

Per the writing-skills form table this is a wrong-shaped-output failure, so the
fix is a positive size contract plus structural slots, not prohibitions:

- **A third contract file.** `tmp/<date>-<slug>/` now holds `goal.md`,
  `plan.md`, and `ledger.md` — an append-only history archive, created as a
  one-line stub at assembly, explicitly **never re-read at boot**. The
  "append-only, never erase evidence" property moves to the archive, so
  shrinking `plan.md` stops conflicting with integrity.
- **`plan.md` → new preamble paragraph** (ships verbatim): the file is re-read
  at every boot/compaction and stays small — steering state, not history; a
  ledger entry is one line; command output is never pasted (the checkpoint sha
  is the evidence pointer); dozens of entries in one phase means the phase is
  too big — split it.
- **Progress ledger respecified:** one summary line per completed phase, then
  one-line entries for the phase in progress — nothing else. The format
  guidance ships verbatim as a parenthetical under the heading so it survives
  compaction.
- **Phase template gains a standing exit criterion:** *Ledger rolled up —
  phase entries appended to `ledger.md`, collapsed here to one summary line.*
  The rollup is mechanical, like the committed-work criterion.
- **Critique mode audits boot-size** and fixes a bloated existing contract by
  performing the overdue rollups into `ledger.md` — never by deleting
  evidence. This is the retrofit path for contracts already in flight.

Recovery properties preserved: per-step entries still land (for the in-progress
phase), the ledger still outranks post-compaction recollection, and full
history remains reachable on demand in `ledger.md` and git.

## Validation

RED is the production observation itself — ~40k-line `plan.md` files in real
long-running goal pursuit.

Wording was micro-tested per writing-skills (5 control + 5 treatment
single-shot pursuers, paper simulation: phase 3/4 just verified green with a
15-line pytest output in hand, checkpoint committed, operator offline):

- **Control (current template): 5/5 grew the file with no shedding.** Every
  rep appended another multi-line prose entry (5–10 lines: quoted counts,
  skip-justification, tripwire narration, scope decision) and several also
  bloated Current state with the same material. No rep pasted the raw output
  block, but none had any mechanism to shed history — monotonic growth is the
  template-mandated behavior, matching production.
- **Treatment (new wording): 5/5 complied and converged** on one shape:
  one-line entry for the new step, phase-3 entries appended to `ledger.md`
  under a phase heading, collapsed to a single summary line in `plan.md`,
  rollup exit criterion ticked, no pasted output — and `plan.md` came back
  *smaller* than it went in. Convergence across reps is the writing-skills
  signal that the wording binds.

## Non-goals

- No change to update frequency — per-step recording stays; it is the
  recovery mechanism. Only the record's shape and location changed.
- No change to `goal.md`'s freeze or the redefinition tripwire; `ledger.md`
  joins `plan.md` as the pursuer's writable surface.
- The Activation objective still names only `goal.md` and `plan.md` as the
  re-read set — keeping `ledger.md` out of the boot path is the point.

## Packaging

- Canonical `plugins/toolkit/skills/handoff-goal/SKILL.md` updated (the
  toolkit copy is the only one; the onboarding bundle does not ship this
  skill). `description` updated minimally — the contract directory now names
  a bounded ledger and the `ledger.md` archive.
- Origin doc `docs/skills/handoff-goal.md` updated: contract tree, rule 1,
  solution shape (bounded ledger + rollup), and a new "40k-line plan" pitfall.
- `toolkit` `0.13.1` → `0.13.2` (patch — rework of an existing skill) across
  all four manifests (`.claude-plugin`, `.codex-plugin`, `.cursor-plugin`,
  marketplace catalog); validator green.
- `docs/change-log.md` entry via the `change-log` skill.
