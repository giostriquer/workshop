# Decision: scope guard removed from using-workbench

**Date:** 2026-08-25

## Status

Implemented. Reverses Q16 (`scope-guards-q15-q16.md`). Q15 is unchanged.

## Context

Field feedback: sessions read the guard's "the accepted work defines the
boundary" as a limit on what they may read, refused to trace causes into
subsystems the ticket never named, and never reached the root cause. A
rewrite that stated the predicate (diff, not reads) tested clean in 8/8
pressure reps but added interpretation on top of interpretation: what
counts as an owner area, what "well past" means, when a read becomes an
edit. Every clause was another surface for a session to misread under
pressure.

The operator's call: scope is the user's to define in the ask and the
task's to delegate. A high-level guard on scope-following cannot be stated
precisely enough to avoid downgrading model behavior, so it goes.

## The shape

- `using-workbench` loses the "Scope guard" section entirely.
- `code-quality-review`'s findings classification (Q15: in-scope blocking,
  out-of-scope follow-up) stays: it labels findings, it does not bound the
  session.
- `test-driven-development`'s scope boundary section stays for now; it
  speaks of which behaviors get tests, not of what the session may read.

## Non-goals

- No replacement heuristic. A repo or user that wants a size or spread rule
  states it in its own rules or in the ask.

## Packaging

Ships as `workbench 0.32.0`. `docs/skills/using-workbench.md` updated in step.
