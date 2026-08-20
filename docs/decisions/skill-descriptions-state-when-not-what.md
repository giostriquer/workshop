# Decision: skill descriptions state when to fire, never what the skill does

## The rule and where it comes from

`writing-skills` carries an SDO rule with a tested rationale behind it: a
description that summarizes the skill's workflow creates a shortcut the agent
takes instead of reading the body. Their reported case was a two-stage review
collapsing to one stage, because the description mentioned "code review
between tasks" and the agent stopped there.

An audit of all sixteen workbench skills found six descriptions carrying
post-fire protocol.

## What changed

| Skill | What left the trigger |
| --- | --- |
| `test-driven-development` | "Write the failing test first, watch it fail, write minimal code to pass, and refactor", plus the default-not-a-mandate precedence stance |
| `fix-ci` | An imperative opener and the full loop ("pulls the failing log, diagnoses in-session, applies a minimal fix, pushes, re-watches") |
| `self-audit` | The entire description, which described the retrospective and never stated a trigger |
| `brainstorming` | "Explores user intent, requirements, and design through collaborative dialogue, ending at the user's route pick" |
| `claim-check` | "Builds a repro to prove or break a code claim but never implements the fix" and the inconclusive-is-valid note |
| `model-reference` | The table's contents |

`test-driven-development` is the one worth naming: `writing-skills` lists that
exact shape as its worked bad example (`Use for TDD - write test first, watch
it fail, write minimal code, refactor`), and the shipped description was
almost word for word that.

Nothing was deleted. Every clause already existed in its skill's body, except
`model-reference`'s "a lookup, not a step before every dispatch", which was
added to its opening. Exclusions stayed in the triggers: they route between
near-neighbour skills and are firing conditions, not protocol.

## What was left alone

`empirical-proof` and `qa-sweep` remain long. Their bulk is `NOT for X, that
is Y` routing, which is trigger work, and `empirical-proof`'s
offer-never-run-uninvited clause is itself a firing condition.

## What this audit did not do

`writing-skills` requires a RED phase before any edit: run each skill's
pressure scenario without it, capture the baseline rationalizations verbatim,
then write against them. That was not run. This pass is static conformance
against the skill's stated rules, and the six rewrites are untested in the
sense the Iron Law means.

Two findings from the same audit are recorded and not acted on:

- **`file-pr` has no rationalization table.** Its MUST gate carries two
  exemptions ("trivial, non-code, or documentation-only" and "already ran for
  this work-stream") with nothing countering the obvious stretch of either.
  This is a behavior gap rather than a wording one, and it is the finding most
  deserving of a real pressure test.
- **`metadata: system: workbench` is on eight skills and missing from eight**,
  with no pattern separating the two halves.
