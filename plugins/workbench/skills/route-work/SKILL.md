---
name: route-work
description: Use when a model choice needs grounding and is not already settled. Reference table for the model fleet across cost, intelligence, taste, code, and speed, plus the hard routing invariants. This is a lookup, not a step before every dispatch, and it never dispatches anything.
---

# Route Work

The model reference table: consult it when picking a model, update it when the
fleet changes. The canonical copy lives here and nowhere else; the operator's
always-injected rules file carries only the hard invariants and points here.

## The table

Scores are 1–10, higher is better. **Cost is subscription-limit burn, not
dollars**: the fleet runs on subscriptions, so a low cost score means "eats
the weekly limit fast," not "expensive per token." **Speed** is wall-clock
turnaround on the same task, scored separately from cost because a model that
thinks for ten minutes and one that drains the weekly limit fail in different
ways and constrain different work. Intelligence is how hard a problem the
model can carry unsupervised. Code is coding craft: how correct and
well-built the implementation comes out when the work is code. Taste covers
user-facing surfaces only: UI/UX, copy, API shape, docs voice.

| model | cost | intelligence | taste | code | speed |
|---|---|---|---|---|---|
| gpt-5.6-sol | 6 | 9 | 8.5 | 9 | 6 |
| gpt-5.6-luna | 10 | 5 | 5 | 5 | 8 |
| opus-5 | 5 | 8 | 8 | 8 | 8 |
| fable-5 | 1 | 10 | 9.5 | 9 | 5 |
| grok-4.6 | 5 | 8 | 8 | 8 | 7 |

**One row per model, graded at the effort that model is actually run at.**
Effort is not a separate axis here, if you change the effort you habitually
run a model at, re-grade its row rather than adding one.

The values are the operator's own calibration: adopters swap the rows for
their fleet and re-grade. One cross-ladder caveat: rows drawn from
**different subscriptions** are not comparable on cost alone, so a row another
dominates on paper is not retired, when one pool's weekly limit is the
constraint, a row on another pool is the relief valve.

## Hard invariants

These carry the *shape* of each rule. The concrete policy, which models are
in, which are out, where the floor sits: belongs to the operator's
always-injected rules file, not to this skill; a plugin that hard-codes one
operator's fleet ships a policy its adopters never chose.

- **Set a model floor and enforce it upward.** Decide the weakest model
  allowed to touch real work and write it into the rules file that loads
  every session. Then override anything that would select below it: agent
  definitions, tool defaults, `--model` flags, SDK calls, without asking.
  Where the floor sits is the operator's call; having one, and never
  silently dropping under it, is the invariant.
- **Orchestration stays home.** Decomposing, dispatching, and judging a set
  of work always run on the session's own model, never a weaker-model
  subagent.
- **Standing escalation permission.** When output misses the bar, rerun or
  redo on a smarter tier without asking. Judge the output, not the price
  tag: escalating costs less than shipping mediocre work.
- **Cost and speed are tie-breakers only.** When axes conflict for anything
  that ships, intelligence > taste > cost > speed. Neither of the last two
  buys a drop on the first two.
- Repo-local model policies override this table where they conflict.

## Reading the table

- Routine, well-specified work → the cheap end: luna only for truly
  mechanical bulk, sol for routine work that still needs judgment.
- Judgment-heavy, taste-critical, or silent-failure work → the frontier:
  fable-5, or opus-5 as the lower-burn lane. Putting high-tier judgment at
  the plan while a cheaper tier implements is often the better spend.
- A shipping taste surface needs taste ≥ 7: luna is not a taste route.
- Speed breaks ties, never quality. When two rows are level on the axis the
  work actually loads, take the faster one. It does not buy a drop on
  intelligence, taste, or code.
