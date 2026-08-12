# Decision: scope guards — review timing + findings classification (Q15) and stop-and-rescope (Q16)

**Date:** 2026-08-12

## Status

Implemented. Joins the operator decisions ledger as **Q15** (refining Q3) and
**Q16**.

## Context

Second field-feedback round, operator-endorsed. A workbench-governed session
grew a one-ticket persistence change into a **52-file workset across six
subsystems** through this loop: implement the ticket → find an adjacent
defect → treat it as required → add tests and a fix (TDD pressure: every
discovered edge case becomes a failing test) → review the larger
implementation → find more defects → repeat. Two design weaknesses fed it:

1. The adversarial review's strictness carried no scope classification —
   nothing distinguished ticket-blocking findings from adjacent defects —
   and nothing pinned its **timing**, so review ran as an ongoing
   implementation-discovery engine rather than a completion gate.
2. Nothing in the flow tripped on diff size or subsystem spread.

The session's own retrospective proposed both rules; the operator agreed and
added the timing sharpening: the adversarial review fires **only when the
model believes the work-stream's implementation is complete, right before
the PR-or-merge evaluation**.

## The shape

- **Q15 — review timing and findings classification.** `code-quality-review`
  gains a "Scope Boundary — strict inside, follow-up outside" section: the
  strictness applies within the accepted work's boundary; out-of-scope
  findings (adjacent defects, pre-existing mess the diff didn't worsen) are
  labeled **follow-up** and recorded, not fixed in this change — the one
  exception is a finding that proves the change unsafe or incorrect as
  shipped. Every finding is labeled in-scope (blocking) or out-of-scope
  (follow-up); unlabeled reads as blocking. The pass fires once, at
  believed-complete, immediately before the PR-or-merge gate — never
  mid-implementation. The description and the flow's COMPLETION block carry
  the timing.
- **Q16 — stop and rescope.** `using-workbench` gains a "Scope guard"
  section with two tripwires — **spread** (crossing owner areas the ask
  never named) and **size** (a diff well past the sized expectation) —
  either of which stops the work and brings a split/rescope question to the
  user. `test-driven-development` gains the matching "Scope boundary"
  section: tests for the accepted work's behaviors; adjacent defects are
  recorded as follow-up, not tested-and-fixed in place.

## Non-goals

- No softening of the review's strictness inside the boundary — the
  intensity is the skill's value; the boundary directs it.
- No numeric size threshold — "well past the sized expectation" stays
  qualitative; repos that want a number can set one in their own rules.

## Packaging

Ships as `workbench 0.20.6`. Origin docs updated in step
(`code-quality-review`, `test-driven-development`, `using-workbench`);
Q15/Q16 added to both flow-doc ledgers and inline in
`workbench-system.md`.
