---
name: route-work
description: Reference table for the model fleet — cost / intelligence / taste / code per model and effort tier, plus the hard routing invariants. Use when a model or effort choice needs grounding and isn't already settled. A lookup, not a process — not a step before every dispatch, and it never dispatches anything.
---

# Route Work

The model × effort reference table: consult it when picking a model or an
effort tier, update it when the fleet changes. The canonical copy lives here
and nowhere else; the operator's always-injected rules file carries only the
hard invariants and points here.

## The table

Scores are 1–10, higher is better. **Cost is subscription-limit burn plus
wall-clock, not dollars** — both sides run on subscriptions, so a low cost
score means "slow and eats the weekly limit," not "expensive per token."
Intelligence is how hard a problem the model can carry unsupervised. Code is
coding craft — how correct and well-built the implementation comes out when
the work is code. Taste covers user-facing surfaces only — UI/UX, copy, API
shape, docs voice.

| model + effort | cost | intelligence | taste | code |
|---|---|---|---|---|
| gpt-5.6-sol low/medium | 8 | 6.5 | 7 | 7.5 |
| gpt-5.6-sol xhigh | 6 | 8.5 | 8.5 | 9 |
| gpt-5.6-luna (default: max) | 10 | 5 | 5 | 5 |
| opus-5 | 5 | 8 | 8 | 8 |
| fable-5 | 2 | 9 | 9.5 | 9 |

The values are the operator's own calibration — adopters swap the rows for
their fleet and re-grade. One cross-ladder caveat: the GPT and Claude rows
burn **different subscriptions**, so a row another dominates on paper is not
retired — when one pool's weekly limit is the constraint, the other ladder
is the relief valve.

## Hard invariants

These carry the *shape* of each rule. The concrete policy — which models are
in, which are out, where the floor sits — belongs to the operator's
always-injected rules file, not to this skill; a plugin that hard-codes one
operator's fleet ships a policy its adopters never chose.

- **Set a model floor and enforce it upward.** Decide the weakest model
  allowed to touch real work and write it into the rules file that loads
  every session. Then override anything that would select below it — agent
  definitions, tool defaults, `--model` flags, SDK calls — without asking.
  Where the floor sits is the operator's call; having one, and never
  silently dropping under it, is the invariant.
- **Orchestration stays home.** Decomposing, dispatching, and judging a set
  of work always run on the session's own model — never a weaker-model
  subagent.
- **Standing escalation permission.** When output misses the bar, rerun or
  redo on a smarter tier without asking. Judge the output, not the price
  tag — escalating costs less than shipping mediocre work.
- **Cost is a tie-breaker only.** When axes conflict for anything that
  ships, intelligence > taste > cost.
- Repo-local model policies override this table where they conflict.

## Reading the table

- Routine, well-specified work → the cheap end: sol low/medium; luna only
  for truly mechanical bulk.
- Climb effort before hopping models — sol xhigh before leaving the ladder.
- Judgment-heavy, taste-critical, or silent-failure work → the frontier:
  fable-5, or opus-5 as the Claude-side lane at lower burn. Putting
  high-tier judgment at the plan while a cheaper tier implements is often
  the better spend.
- A shipping taste surface needs taste ≥ 7 — luna is not a taste route.
