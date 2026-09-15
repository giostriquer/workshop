# Decision: epic delegation respects skill ownership

**Date:** 2026-09-14

**Release:** workbench 0.37.6

## Problem

An orchestrator copied a CI watcher's model requirement into a lane dispatch,
turning a skill-specific rule into a provider assumption. Another interpreted
the operator's role as the cross-session link as forbidding local subagents and
struggled to process simultaneous reports.

## Change

Lane dispatches name required skills, task inputs, outcomes and evidence. The
lane applies each skill's own procedure and routing; the orchestrator does not
restate or expand them. Remove the epic skill's CI instruction and duplicate
review procedure. CI workflow detail stays in its owning skills. Keep the task's
review evidence and authorization gates.

Distinguish operator-dispatched lanes from helpers inside the owner session.
Helpers are optional when they save context or elapsed time after dispatch and
verification overhead. They inherit the owner's model by default. A smaller
model in the same provider/harness may do trivial work: explicit inputs,
mechanical steps and an objective result the owner can check cheaply. Evidence
judgment and policy conflicts are not trivial. The owner retains synthesis,
rulings and authorization; dependent skills retain their routing requirements.

Update the usage page with the same boundaries. No new roles or workflow stages.

## Focused checks

One baseline probe reproduced named watcher models in a provider-unknown lane
authorization and operator relay of local helper tasks. Two fresh-context probes
with the revised skill covered eight scenarios: provider-agnostic handoffs,
parallel evidence checks, direct handling of quick checks, smaller-model bulk
extraction, owner-held authority decisions and dependency-owned CI routing. The
responses met those contracts before the final removal of the epic's CI
instruction. These are bounded regression checks, not a cross-model reliability
estimate. Native plugin validation also passed.
