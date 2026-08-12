# Decision: `route-work` ships the shape of a model floor, not one operator's

**Date:** 2026-08-12

## Status

Implemented.

## Context

`route-work`'s Hard invariants opened with:

> **Never Haiku or Sonnet — any task, no exceptions.** Bulk work routes to the
> sol ladder; anything that must be Claude runs on opus-5 or fable-5.

That is the operator's own policy, and it is correct *for the operator* — it
lives in their always-injected rules file and should. The problem is that
`route-work` ships inside the `workbench` plugin. Every adopter who installs
workbench inherited a ban on two models they may have perfectly good reasons
to use, expressed as an absolute with named fleet members from someone else's
subscription mix.

This is the failure mode `CLAUDE.md` names directly: shipped text drifting
toward one environment's specifics. A skill that hard-codes a fleet policy
ships a decision its adopters never made.

The trigger was a token audit that flagged Haiku/Sonnet guidance in a
*different* file (`writing-skills/anthropic-best-practices.md`) as a defect
for contradicting the operator's rule. That reading was backwards: the
portable auxiliary was fine, and the shipped skill was the one over-reaching.

## The change

The invariant now carries the **shape** of the rule and leaves the policy to
the operator:

> **Set a model floor and enforce it upward.** Decide the weakest model
> allowed to touch real work and write it into the rules file that loads every
> session. Then override anything that would select below it — agent
> definitions, tool defaults, `--model` flags, SDK calls — without asking.
> Where the floor sits is the operator's call; having one, and never silently
> dropping under it, is the invariant.

The section preamble now says why: a plugin that hard-codes one operator's
fleet ships a policy its adopters never chose.

What is deliberately kept: the discipline itself. "Have a floor" and "escalate
rather than silently drop below it" are genuinely portable — they survive any
fleet. The model × effort table also stays, since it was already marked as the
operator's own calibration for adopters to swap and re-grade; a worked example
is useful where an absolute prohibition is not.

## Consequence for the audit

The finding that `anthropic-best-practices.md` violates the model floor is
**withdrawn**. Its Haiku/Sonnet testing advice is appropriate portable guidance
for a plugin. The genuine defects in that file — it contradicts
`writing-skills/SKILL.md` on the `description` field, and is a raw docs scrape
roughly 15% useful — stand on their own.

## Packaging

`workbench` `0.20.7` → `0.20.8` across all three plugin manifests.
