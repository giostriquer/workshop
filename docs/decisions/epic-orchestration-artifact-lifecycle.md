# Decision: bounded epic coordination and artifact retirement

**Date:** 2026-09-10

## Problem

A sustained epic accumulated overlapping dispatches, corrections and tracker
updates. Startup instructions led through historical documents, and an old index
still presented superseded work as current. This establishes document growth and
excessive prescribed reading, not its contribution to billed token usage.

The skill contributed two gaps: it requested full ticket bodies even with a
self-contained dispatch, and required durable traceability without a retirement
step. Append-only tracker updates were coordinator execution choices, not skill
requirements. `using-workbench` already defines temporary storage and retention
authority; another general cleanup policy would duplicate it.

## Change

Amend the existing lane-prompt and persistence sections of `epic-orchestration`.
The dispatch names a complete required reading set and loads supporting material
for specific questions or validation checks. One current coordinator view replaces
changed entries in place and points to designated ticket and decision records.

Apply the existing disposable-artifact guidance at state changes, handoffs and
closeout. Distinguish active contracts, accepted work awaiting delivery, closed
lanes and retired instructions. Retirement removes temporary instructions from
default reading; it grants no deletion, publication or worktree-cleanup authority.
Preserve dependencies, holds, unresolved work, final evidence, frozen audit inputs
and explicit retention requirements. Completeness determines size; no word cap
changes the scope or validation bar.

## Verification and boundary

The recorded investigation supplies the baseline. Focused scenario checks cover
dispatch reading, active contracts, closed lanes with dependent consumers, held
delivery and audit retention. Check outcomes for work preservation, authority and
useful next steps. Small scenario samples are regression evidence, not a measured
reliability or spending improvement.

One fresh-context probe met those outcomes across four related cases. Whitespace
and local-link checks passed. The other skill sections and frontmatter remain
unchanged, including validation, review and the blind closing audit.

The usage page changes with the spec. Ships in `workbench 0.37.1`; installed
caches are updated through the host's plugin installation mechanism.
