# Decision: TDD is a default, not a mandate: repo conventions take precedence (Q13)

**Date:** 2026-08-12

## Status

Implemented. Joins the operator decisions ledger as **Q13**.

## Context

Lived failure: a repo's instructions said tests must not run before manual
Desktop validation. The session, following the TDD skill's "Verify RED /
Verify GREEN: MANDATORY. Never skip." discipline, ran a focused regression
anyway: then correctly self-diagnosed afterward: the repo instruction had
higher priority; the right workflow was to announce the conflict, write the
test and the change, and pause for the manual gate without executing the
suite.

The root cause is skill text: the adopted TDD skill kept upstream's
enforcement register (Iron Law, MANDATORY labels, rationalization tables)
with nothing saying where that register ranks against the repo's own rules. A
session weighing "MANDATORY. Never skip." against a repo convention had no
instruction that the repo wins.

Operator directive: **TDD must not be enforced: implementation inherits repo
patterns; where there are none, TDD is the default.**

## The shape

A `## Precedence: a default, not a mandate` section at the top of the TDD
skill:

- A stated repo or user convention that conflicts with a step **wins**: e.g.
  "no test runs before manual validation" displaces Verify RED/GREEN; the
  MANDATORY labels do not override it.
- **Announce the conflict** in one line (the repo rule, the step it
  displaces), then follow the repo: applying whatever of the cycle remains
  compatible (the test is still written first).
- **Only a stated rule displaces a step**: self-negotiated "just this once"
  remains exactly what the rationalization armor catches. The armor is
  untouched; it now has a boundary: it targets self-serving skips, never the
  repo's own rules.

Supporting edits: the description carries "a default rather than a mandate";
the Final Rule notes a stated convention is standing user permission; the
flow surfaces (`using-workbench`, both READMEs, both flow docs, the
`workbench-system.md` ledger) state the precedence; Q13 added to the
decisions ledger; the drift manifest's TDD entry records the layer so
upstream reviews don't re-tighten it.

## Non-goals

- No softening of the internal rigor when TDD applies: RED/GREEN/REFACTOR,
  the deletion rule, and the rationalization tables are unchanged.
- No change to harness-conditioning (Q2: silent skip where no harness).
- Upstream is untouched; this is a workbench divergence, recorded in the
  manifest.

## Packaging

Ships as `workbench 0.20.5` (same release step as the worktree-location
section). Origin doc `docs/skills/test-driven-development.md` updated.
