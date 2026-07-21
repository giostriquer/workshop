---
name: route-work
description: Use when a task is about to be dispatched — to codex exec, a subagent, or a workflow stage — and the model/effort choice is not already forced, instead of defaulting every dispatch to the top tier; also when the model fleet changes and the canonical model × effort table needs updating (it lives here and only here). Invoked with a task description, the session grades it against a five-axis rubric (repo precedent, ambiguity, failure visibility, taste surface, blast radius) and returns an actionable route — model + effort + process pattern (direct dispatch / plan-review checkpoint / judge loop / taste pass) + a one-line why — directly usable in the dispatch command. Carries the hard invariants routing must never violate (no Haiku/Sonnet ever; orchestration stays on the session's model; escalate without asking when output misses the bar; intelligence > taste > cost for anything that ships). Recommends the route only — it never dispatches.
---

# Route Work

Grade a task about to be dispatched and return a **routing recommendation** —
model + effort + process pattern + a one-line why — instead of defaulting to
the top tier. The canonical model × effort table lives in this skill and
nowhere else; the operator's always-injected rules file carries only the hard
invariants and points here.

## When to use

Invoked with a task description (`/toolkit:route-work <task>`), typically just
before dispatching implementation, investigation, or analysis work via
`codex-implement`, an Agent call, or a Workflow stage. Also the place fleet
changes land: a new model, a new effort tier, a shifted limit — update the
table here, never in a copy.

Not for: work the session does inline (no dispatch, no routing); the
orchestration layer itself (decomposing, dispatching, and judging stay on the
session's own model — an invariant, not a grading outcome); picking a
session's own model (the operator's call at launch).

## The canonical table

Scores are 1–10, higher is better. **Cost is subscription-limit burn plus
wall-clock, not dollars** — both sides run on subscriptions, so a low cost
score means "slow and eats the weekly limit," not "expensive per token."
Intelligence is how hard a problem the model can carry unsupervised. Taste
covers UI/UX, code quality, API design, and copy.

| model + effort | cost | intelligence | taste |
|---|---|---|---|
| gpt-5.6-sol low/medium | 8 | 6.5 | 8.5 |
| gpt-5.6-sol high | 7 | 7 | 8.5 |
| gpt-5.6-sol xhigh | 5 | 7.5 | 8.5 |
| gpt-5.6-sol ultra/max | 4 | 8 | 8.5 |
| gpt-5.6-terra (default: xhigh) | 9 | 6 | 6 |
| opus-4.8 | 8 | 6 | 7 |
| fable-5 | 2 | 9 | 9.5 |

Calibration notes (operator-lived, benchmark-anchored 2026-07): fable-5 is
the only frontier row — one point smarter than sol at ultra/max (AA
Intelligence Index 60 vs 59), far ahead where routing actually hurts
(SWE-bench Pro 80% vs 64.6%), and the taste ceiling. sol is the all-rounder:
its taste sits just under fable's (Frontend Arena 1618 vs 1631, above
opus-4.8's 1562), so user-facing work does not automatically leave the
ladder. opus-4.8 and terra are **cost lanes, not quality lanes** — a class
below sol on both axes (DeepSWE 59.0 / 69.6 vs sol's 72.7): terra is the
cheapest dispatch going, and opus-4.8 earns its slot as the Claude-side lane
(Agent/Workflow fan-outs, courier duty) rather than on any axis. The values
are the operator's calibration: adopters swap rows for their own fleet and
re-grade — the rubric below survives any fleet.

Dispatch mechanics:

- **GPT rows** run through Codex CLI (`codex exec`) — the `codex-implement`
  skill wraps it. Config default is sol at high; override per dispatch with
  `-c model_reasoning_effort=<tier>` and `-c model="gpt-5.6-terra"`.
- **Claude rows** run via the Agent/Workflow `model` (and `effort`) params.
- **GPT inside an Agent/Workflow fan-out** (the model param takes Claude
  models only): a thin opus courier wrapper whose prompt writes a
  self-contained codex brief, runs the codex wrapper via Bash, and returns
  codex's final message verbatim — a courier, not a reviewer.

## Hard invariants

Mirrored in the operator's always-injected rules file; change them in both
places or not at all.

- **Never Haiku or Sonnet — any task, no exceptions.** Bulk work routes to
  the sol ladder; anything that must be Claude runs on opus-4.8 or fable-5.
- **Orchestration stays home.** Decomposing, dispatching, and judging a set
  of work always run on the session's own model — never a weaker-model
  subagent.
- **Standing escalation permission.** When output misses the bar, rerun or
  redo on a smarter tier without asking. Judge the output, not the price
  tag — escalating costs less than shipping mediocre work.
- **Cost is a tie-breaker only.** When axes conflict for anything that
  ships, intelligence > taste > cost.
- Repo-local model policies override this table where they conflict.

## The rubric

Grade the task on five axes — a word each is enough:

1. **Repo precedent** — `established` (the shape exists in the repo; this is
   another instance) or `novel` (first of its kind here)?
2. **Ambiguity** — `closed` (a committed plan, a frozen contract) or `open`
   (the implementer will be making decisions)?
3. **Failure visibility** — `visible` (tests, types, gates, or review will
   catch a mediocre result) or `silent` (taste, calibration, judgment calls
   no gate can see)?
4. **Taste surface** — `none`, or `user-facing` (UI, copy, API shape, docs)?
   A shipping taste surface needs taste ≥ 7 — that rules out terra (6) and
   makes opus-4.8 (7) borderline; sol (8.5) carries most surfaces, and
   flagship voice-and-polish work gets a fable-5 pass before ship.
5. **Blast radius** — `contained`, or `wide` (later work builds on this
   being right; a wrong foundation outcosts any routing savings)?

## From grades to a route

- **Cool across the board** → cheapest capable tier at modest effort:
  **sol high** is the workhorse; drop to low/medium — or terra — only for
  truly mechanical bulk (clear-spec migrations, data grinding, log
  crunching).
- **One axis warm** (novel-ish, a few open decisions, medium blast) → climb
  the sol ladder (xhigh, then ultra/max) before switching models — effort is
  cheaper than a hop to the frontier, and the mid-tier rows add nothing the
  ladder lacks.
- **High ambiguity or silent failure** → top tier (**fable-5**) — or the
  **leverage pattern**: a cheap implementer plus a high-tier plan-review
  checkpoint *before* implementation proceeds. Top-tier judgment at the plan
  costs a fraction of top-tier tokens on every line.
- **Taste surface, problem not hard** → stay on sol — at taste 8.5 it
  carries most user-facing surfaces; reserve **fable-5** (direct, or as a
  taste pass) for flagship surfaces where voice and polish are the point.
  terra and opus-4.8 are not taste routes.
- **Wide blast radius** → add a checkpoint before and a review after,
  whatever the implementer tier.
- **Output misses the bar** → escalate a tier and rerun; that permission is
  standing.

The recommendation is the **process pattern**, not just a model name:

- **Direct dispatch** — one shot, judged on return. The default.
- **Plan-review checkpoint** — the implementer proposes a plan; a high-tier
  session reviews it before any code is written. For novel ground and wide
  blast radii.
- **Judge loop** — dispatch, judge, iterate until the bar is met
  (`codex-implement`'s native loop). For gate-verifiable work.
- **Taste pass** — a higher-taste model (in practice fable-5) reviews or
  polishes the user-facing surface after cheap implementation.

Patterns compose: a novel user-facing feature can take a fable-5 plan review,
a sol-high judge loop, and a fable-5 taste pass.

## Output contract

Return exactly this — directly usable in the dispatch command:

```
route: <model> <effort> · <process pattern>
why: <one line>
grades: precedent <established|novel> · ambiguity <closed|open> · failure <visible|silent> · taste <none|user-facing> · blast <contained|wide>
```

No essay. The grading happens; the output is three lines.

## Worked example

> /toolkit:route-work integrate the new speech engine — no repo precedent,
> output quality is judged by ear

```
route: fable-5 plan-review checkpoint, then gpt-5.6-sol high · judge loop
why: novel ground with silent calibration risk — top-tier judgment belongs at
     the plan; the implementation is gate-checkable once the plan is right.
grades: precedent novel · ambiguity open · failure silent · taste none · blast wide
```

And the everyday case:

> /toolkit:route-work implement the passage generator from the committed plan

```
route: gpt-5.6-sol high · direct dispatch
why: pattern-following against a frozen plan; the plan's tests catch
     mediocrity, so paying for a higher tier buys nothing.
grades: precedent established · ambiguity closed · failure visible · taste none · blast contained
```

## Rules

- The table is the single source of truth — update it here only. A copy that
  drifts (a rules file, a repo doc) is the failure this skill exists to kill.
- Grade before routing. Never default to the top tier because it feels safe,
  and never route by price when the work ships.
- The output is the contract above — model + effort + process pattern + one
  line of why. Recommend; never dispatch from this skill.
- The hard invariants are not gradeable: no Haiku/Sonnet ever; orchestration
  on the session's own model; escalation without asking; intelligence >
  taste > cost for shipping work.
- A silent-failure or novel-ground task never goes out cheap without a
  high-tier checkpoint — the leverage pattern is the compromise, not
  skipping the judgment.
- Adopters: swap the table's rows for your own fleet and recalibrate against
  your own benchmarks and lived results; the rubric, the patterns, and the
  invariant structure ride along unchanged.
