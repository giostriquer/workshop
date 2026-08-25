# Decision: scope-language sweep after the guard removal

**Date:** 2026-08-25

## Status

Implemented. Follows `scope-guard-removed.md`.

## Context

After the scope guard left `using-workbench`, a cross-cutting audit read
all sixteen workbench skills and five agent specs for the same defect
class: text a session can read as bounding what it reads, traces, or
root-causes, and interpretative guards on undefined thresholds. Two high
findings, three medium ones acted on, three medium ones declined by the
operator (audit quick-look sizing, code-quality-review "chased",
receiving-code-review "can't easily verify").

## The shape

- **`test-driven-development` loses its "Scope boundary" section** (the Q16
  sibling). "Adjacent code → follow-up, not a fix here" told a session that
  had traced a bug to its source in another module to file a ticket and
  ship a symptom fix, contradicting `systematic-debugging`'s fix-at-source
  rule. Removed, same reasoning as the guard; the concrete "don't add
  features or refactor beyond the test" line stays.
- **`code-quality-reviewer` reads beyond the diff.** "Review only what they
  show" made the pasted sections the reviewer's whole reading universe;
  now the sections define what is under review and the reviewer reads
  whatever surrounding code it needs. The "trace cross-file impact when the
  change touches module boundaries" conditional becomes unconditional.
- **`pattern-reviewer`** step 9 drops the "closest reference file if
  needed" one-file cap: it reads whatever neighbouring code judging
  conformance needs.
- **`fix-ci`** step 7 drops "minimally ... nothing broader": fix the cause;
  do not bundle unrelated changes.
- **`handoff-goal`** contract placeholder "Scope / stop-and-ask" reads
  "actions that must go back to the operator", not "boundaries".

## Non-goals

- No new rule replaces any removed text.

## Packaging

Ships as `workbench 0.33.0`. Usage pages for `test-driven-development` and
`fix-ci` updated in step.
