# Decision: the adversarial review is dispatched, never self-served

**Date:** 2026-08-19

## Status

Implemented. Ships as `workbench 0.25.0`.

## Context

Field report from the operator: sessions that reach the required adversarial
review are not dispatching the `code-quality-reviewer` agent. They run the
rubric themselves, over their own diff, and report the result as the gate.

Nothing in the shipped text told them otherwise, and two places told them it
was fine:

- `using-workbench`'s Boundaries carried a flat "Workbench never dictates
  execution agency (in-session vs dispatched)". The ownership table pointed at
  the skill, not the agent, so a session had no reason to look for one.
- `docs/skills/code-quality-review.md` asked "Should I run the skill inline or
  dispatch the agent?" and answered **"Either."**

The skill itself is written as a rubric addressed to a reviewer and never says
who that reviewer is. Only the agent file describes the dispatch, under a "How
a parent invokes this agent" heading a session reading the skill never reaches.

An author reviewing their own diff is the failure the gate exists to prevent,
and it is worse here than for most reviews. The implementing context holds
every justification that produced the code, so the structure reads as
inevitable rather than as a choice someone made, which is exactly the blindness
the code-judo rule is aimed at. A self-served pass returns "nothing blocking"
on diffs a fresh reviewer takes apart. This compounds
[`adversarial-review-is-default-on.md`](adversarial-review-is-default-on.md):
that note made the gate fire, and a gate that fires into the author's own
context produces a green light either way.

## The shape

Agency stays the user's call everywhere except this one moment.

- **`code-quality-review`** gains a *Who runs it* section ahead of the rubric:
  dispatched to a fresh reviewer context handed the diff and the changed files'
  contents, being the `code-quality-reviewer` agent or the host's equivalent.
  It names why the implementing session is the one context that cannot run it,
  and gives the no-subagent-mechanism route: hand the diff to a fresh session
  and name that route in the report. An author's pass over their own work is
  reported as what it is, never as this gate.
- **`using-workbench`** carves the exception into the agency boundary rather
  than weakening it, and splits the hooks claim into its own bullet so the
  exception cannot be misread as covering activation. The flow diagram and the
  ownership row both say dispatched, and the row now names the agent.
- **Usage pages** follow: "Either" becomes "Dispatch it", with the reason
  stated rather than asserted.

## Non-goals

- **No change to the rubric, the timing, or the two outs.** The review still
  fires once, when implementation is believed complete, right before the
  PR-or-merge ask, and still stops only for an explicit user decline or a
  superseding repo process.
- **Not a general dispatch mandate.** `pattern-reviewer` and
  `test-quality-reviewer` remain agents a session may use as the host and the
  user prefer. This exception exists because this review is adversarial by
  definition, not because dispatch is better in general.
- **No hook, no dispatcher.** The requirement lives in the text, which remains
  workbench's entire enforcement surface.

## Packaging

`workbench 0.25.0`. Usage pages updated in step:
`docs/skills/code-quality-review.md`, `docs/skills/using-workbench.md`.
