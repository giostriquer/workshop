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
Intelligence is how hard a problem the model can carry unsupervised. Code is
coding craft — how correct and how well-built the implementation comes out
when the work is code. Taste covers the user-facing surfaces only — UI/UX,
copy, API shape, docs voice.

| model + effort | cost | intelligence | taste | code |
|---|---|---|---|---|
| gpt-5.6-sol low/medium | 8 | 6.5 | 8.5 | 7.5 |
| gpt-5.6-sol high | 7 | 7 | 8.5 | 7.5 |
| gpt-5.6-sol xhigh | 5 | 7.5 | 8.5 | 8 |
| gpt-5.6-sol ultra/max | 4 | 8 | 8.5 | 8 |
| gpt-5.6-terra (default: xhigh) | 9 | 6 | 6 | 7 |
| opus-5 | 5 | 8.5 | 8.5 | 9 |
| fable-5 | 2 | 9 | 9.5 | 9 |

Calibration notes (operator-lived, benchmark-anchored 2026-07, revised at
the Opus 5 launch): the frontier is now a band of two. fable-5 keeps the
intelligence and taste ceilings — in lived use it still carries the hardest
problems unsupervised, whatever the index says (AA Intelligence Index 60 to
opus-5's nominal 61) — and remains the voice-and-polish pass (Frontend
Arena 1631). opus-5 joins as the Claude-side near-frontier lane: it ties
fable on code (SWE-bench Pro ~79% vs 80.0%, both far above sol's 64.6%) at
a fraction of the burn, and inherits every role opus-4.8 held — Claude-side
implementer, Agent/Workflow fan-outs, courier duty. opus-4.8 leaves the
table: with opus-5 in the fleet the operator routes nothing to it. sol
remains the all-rounder ladder — taste just under fable's (Frontend Arena
1618), code 8 at xhigh and above — and terra the cheapest dispatch going.
One cross-ladder caveat: the GPT and Claude rows burn **different
subscriptions**, so a row that dominates on paper does not retire its
counterpart — when one pool's weekly limit is the constraint, the other
ladder is the relief valve. The values are the operator's calibration:
adopters swap rows for their own fleet and re-grade — the rubric below
survives any fleet.

Dispatch mechanics:

- **GPT rows** run through Codex CLI (`codex exec`) — the `codex-implement`
  skill wraps it. Config default is sol at high; override per dispatch with
  `-c model_reasoning_effort=<tier>` and `-c model="gpt-5.6-terra"`.
- **Claude rows** run via the Agent/Workflow `model` (and `effort`) params —
  `opus` resolves to the newest Opus the harness ships (opus-5 on current
  builds); pin a full model ID in agent frontmatter when an older harness
  still maps it elsewhere.
- **GPT inside an Agent/Workflow fan-out** (the model param takes Claude
  models only): a thin opus courier wrapper whose prompt writes a
  self-contained codex brief, runs the codex wrapper via Bash, and returns
  codex's final message verbatim — a courier, not a reviewer.

## Hard invariants

Mirrored in the operator's always-injected rules file; change them in both
places or not at all.

- **Never Haiku or Sonnet — any task, no exceptions.** Bulk work routes to
  the sol ladder; anything that must be Claude runs on opus-5 or fable-5.
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
   A shipping taste surface needs taste ≥ 7 — that rules out terra (6); sol
   and opus-5 (8.5) carry most surfaces, and flagship voice-and-polish work
   gets a fable-5 pass before ship.
5. **Blast radius** — `contained`, or `wide` (later work builds on this
   being right; a wrong foundation outcosts any routing savings)?

## From grades to a route

- **Cool across the board** → cheapest capable tier at modest effort:
  **sol high** is the workhorse; drop to low/medium — or terra — only for
  truly mechanical bulk (clear-spec migrations, data grinding, log
  crunching).
- **One axis warm** (novel-ish, a few open decisions, medium blast) → climb
  the sol ladder (xhigh, then ultra/max) before leaving it — effort is
  cheaper than a model hop. When the warm axis is the *code itself* (a hard
  implementation, correctness under complexity), the step after the ladder
  is **opus-5** (code 9), not more sol effort.
- **High ambiguity or silent failure** → the frontier band — **fable-5** for
  judgment- and taste-critical work, **opus-5** when the hard part is the
  implementation (it ties fable on code at far lower burn) — or the
  **leverage pattern**: a cheap implementer plus a high-tier plan-review
  checkpoint *before* implementation proceeds. Top-tier judgment at the plan
  costs a fraction of top-tier tokens on every line.
- **Taste surface, problem not hard** → stay on sol — at taste 8.5 it
  carries most user-facing surfaces; reserve **fable-5** (direct, or as a
  taste pass) for flagship surfaces where voice and polish are the point.
  terra is not a taste route.
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
