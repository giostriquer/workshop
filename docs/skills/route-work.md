# route-work

## Origin

An always-injected rules file carried the operator's model table — cost,
intelligence, and taste per model on a 1–10 scale — plus routing doctrine
("bulk work goes to the cheap model," "user-facing surfaces need taste").
It failed in two slow, compounding ways.

First, the table went stale. The file still described a retired GPT tier
months after the Codex config had moved to a newer model family with six
effort levels. Nothing ever forces an always-injected file to track the
fleet; it just quietly diverges from reality until someone notices routing
decisions are being made against models that no longer exist.

Second — and worse — doctrine turned out not to be a decision procedure.
Knowing the models' scores did not tell a session *how to grade the task in
front of it*, so under time pressure every dispatch defaulted to the same
safe answer: top tier, max effort. The result was systematic overpayment in
wall-clock and weekly-limit burn for work — pattern-following
implementation, mechanical migrations, log crunching — that a mid-ladder
tier handles indistinguishably.

The fix inverts the structure: the always-injected file shrinks to the
invariants that must never be violated, and the table moves into a skill
that is *invoked* — which both gives it a natural update home (fleet changes
land in the skill, nowhere else) and pairs it with the thing doctrine
lacked: a rubric that grades the task before naming the model.

## Problem

1. **Stale doctrine in every context.** An always-injected table has no
   update trigger. When the fleet changes, every session keeps routing
   against the old world.
2. **No grading step.** Without a procedure, "which model?" collapses to
   "the best one, to be safe" — the top tier becomes the default for work
   that doesn't need it.
3. **Model names instead of process shapes.** The real routing decision is
   often not *which model* but *which pattern* — a cheap implementer with a
   high-tier plan review beats both "cheap and unsupervised" and "expensive
   everywhere."
4. **Unactionable output.** A routing opinion that isn't directly usable in
   the dispatch command gets re-derived (or ignored) at dispatch time.

## Solution shape

A direct-use skill with three parts and a set of carried invariants:

- **The canonical model × effort table** — the single source of truth,
  updated only in the skill. Rows are model+effort tiers (the workhorse
  model's effort levels are separate rows, so "climb the ladder before
  hopping models" is expressible). Values are the operator's lived
  calibration, anchored against public benchmarks and confirmed row by row
  before freezing. The structural insight the calibration surfaced: the
  mid-tier models are *cost lanes, not quality lanes* — a class below the
  workhorse ladder on both intelligence and taste — while the workhorse's
  own taste sits close enough to the frontier that user-facing work doesn't
  automatically escalate.
- **The grading rubric** — five axes: repo precedent, ambiguity, failure
  visibility, taste surface, blast radius. Cool across the board → cheapest
  capable tier at modest effort. High ambiguity or silent-failure risk →
  top tier, or the *leverage pattern*: cheap implementer + high-tier
  plan-review checkpoint before implementation proceeds.
- **The output contract** — three lines (`route:` / `why:` / `grades:`),
  directly usable in the dispatch command. The recommendation names a
  process pattern (direct dispatch / plan-review checkpoint / judge loop /
  taste pass), not just a model.

The hard invariants stay mirrored in the slimmed always-injected file so
they hold even when the skill is never invoked: never Haiku or Sonnet;
orchestration stays on the session's own model; standing permission to
escalate when output misses the bar; intelligence > taste > cost for
anything that ships.

## Real invocation snippet

> /toolkit:route-work implement the passage generator from the committed plan

```
route: gpt-5.6-sol high · direct dispatch
why: pattern-following against a frozen plan; the plan's tests catch
     mediocrity, so paying for a higher tier buys nothing.
grades: precedent established · ambiguity closed · failure visible · taste none · blast contained
```

> /toolkit:route-work integrate the new speech engine — no repo precedent,
> output quality is judged by ear

```
route: fable-5 plan-review checkpoint, then gpt-5.6-sol high · judge loop
why: novel ground with silent calibration risk — top-tier judgment belongs
     at the plan; the implementation is gate-checkable once the plan is right.
grades: precedent novel · ambiguity open · failure silent · taste none · blast wide
```

## Pitfalls observed

- **Table drift by copy.** The moment the table is duplicated somewhere
  convenient (a rules file, a repo doc, a prompt template), the copy starts
  aging. The skill's first rule exists for this: update here only.
- **Grading theater.** Running the rubric and concluding "top tier" every
  time reproduces the original failure with extra steps. If the grades are
  cool and the route still says frontier, the grading was decoration.
- **Skipping the called-for taste pass.** When a route includes a taste
  pass, the implementer's output reading "fine" to the model that wrote it
  is not the pass. The rubric's taste axis is only worth having if the
  higher-taste model actually runs before ship.
- **Routing the orchestrator.** The rubric tempts "this decomposition is
  mechanical, route it cheap" — but orchestration is an invariant, not a
  gradeable task. Decompose, dispatch, and judge stay on the session's own
  model.
- **Treating escalation as a failure.** The standing permission means a
  missed bar is a rerun on a smarter tier, not a negotiation. Hesitating
  there costs more than the rerun.

## Adaptation notes

- The table values are explicitly the operator's calibration — subscription
  economics, lived quality judgments, a specific fleet. Adopters swap the
  rows for their own models and re-grade against their own benchmarks and
  experience. The rubric, the process patterns, and the output contract are
  the portable half.
- The invariants are a template, not a universal truth: "never these
  models," "orchestration stays home," "escalate without asking," and the
  intelligence > taste > cost ordering encode one operator's risk posture.
  Keep the *structure* (a short non-negotiable list mirrored where it's
  always visible) even if the entries change.
- The skill assumes a dispatch boundary worth routing across (a CLI coder,
  subagents, workflow stages). A single-model setup has nothing to route —
  adopt the rubric only when a second lane exists.
- Pairs naturally with an implementation-dispatch skill (here,
  `codex-implement`) that owns mechanics and judge loops; `route-work`
  deliberately stops at the recommendation so the two never blur.
