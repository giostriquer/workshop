# Decision: handoff-goal is user-invoked only

**Date:** 2026-08-25

## Status

Implemented.

## Context

Whether work should outlive the session is the operator's call, not a
judgment a session makes from the shape of the work. A session that
decides on its own that a task "looks long-running" and packages a goal
contract has taken a routing decision that belongs to the user, and the
contract it writes freezes that decision for a fresh session.

## The shape

`handoff-goal` gains `disable-model-invocation: true` (the same shape as
`self-audit`). It runs only on an explicit `/handoff-goal` call. The
description is unchanged; the route pick after brainstorming still offers
"long-running goal" as an option, and picking it is the user invoking the
skill.

## Packaging

Ships as `workbench 0.34.0`. `docs/skills/handoff-goal.md` updated in step.
