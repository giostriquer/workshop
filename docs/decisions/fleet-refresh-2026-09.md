# Decision: model-reference fleet refresh (Opus 5.5, Fable 5.1, gpt-6 sol/luna, grok-4.7)

**Date:** 2026-09-22

## Status

Implemented.

## Context

The fleet moved under the table: Opus 5 became Opus 5.5, Fable 5 became
Fable 5.1, gpt-5.6 sol and luna became gpt-6, and grok-4.6 became grok-4.7.
`model-reference` still named the retired versions, and so did every Codex
reviewer and watcher assignment (`fix-ci`, `file-pr`, `using-workbench`,
`test-quality-review`, the `ci-watcher` and `test-quality-reviewer` agents).
The usage page's table had also drifted from the spec: no astra row and
different sol and luna grades.

## Decision

1. **Rename every live model name to the current fleet.** Retired names stay
   where they are history: decision notes and the release notes.
2. **Re-grade the rows the operator measured.** opus-5.5 moves to
   6 / 9.5 / 9.5 / 9 / 8.5, luna's speed to 9, grok-4.7 to flat 6s. fable-5.1
   is renamed without re-grading, so the legacy caveat now names it as the
   renamed-not-measured row instead of the pre-rename "do not transfer
   fable-5's grade" wording. The table stays marked legacy: per
   [skill-wording-hardening](skill-wording-hardening.md), a new name is not a
   new measurement, and no dated method accompanies these grades.
3. **Reading notes follow the numbers.** opus-5.5 is level with fable-5.1 on
   taste and code at a fraction of the burn, so under the skill's own
   tie-break rule it is the default frontier lane; fable-5.1 only where the
   work loads intelligence past what opus-5.5 carries. grok-4.7 at taste 6
   joins luna below the taste floor of 7.
4. **Re-sync the usage page's table to the spec**, row for row.
