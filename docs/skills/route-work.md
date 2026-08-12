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

A reference skill — three parts, nothing procedural:

- **The canonical model × effort table** — the single source of truth,
  updated only in the skill. Rows are model+effort tiers (the workhorse
  model's effort levels are separate rows, so "climb the ladder before
  hopping models" is expressible). Values are the operator's lived
  calibration; adopters swap rows and re-grade. Rows leave the table when
  the fleet retires their niche — a dead lane kept "for reference" is the
  same staleness the skill exists to kill.
- **The hard invariants** — never Haiku or Sonnet; orchestration stays on
  the session's own model; standing permission to escalate when output
  misses the bar; intelligence > taste > cost for anything that ships.
  Mirrored in the slimmed always-injected file so they hold even when the
  skill is never opened.
- **Reading notes** — four bullets on how the operator reads the table
  (cheap end for routine work, effort before model hops, frontier for
  judgment/taste/silent-failure work, the taste floor).

**Reduced 2026-08-12.** The first version also carried a five-axis grading
rubric, four named process patterns, a three-line output contract, worked
examples, and an embedded calibration-history narrative. The operator cut
all of it: the procedure read as a step to run before every dispatch —
never the intent — and the history belonged in the docs. What survived is
what the skill was for: the table, the invariants, and how to read them.
Along the way the axes story played out in the table itself: *taste* had
been covering both user-facing polish and coding craft until a
near-frontier Claude coder made the conflation visible, and the table grew
the fourth **code** axis, with taste narrowed to user-facing surfaces only.

## Pitfalls observed

- **Table drift by copy.** The moment the table is duplicated somewhere
  convenient (a rules file, a repo doc, a prompt template), the copy starts
  aging. The skill's rule exists for this: update here only.
- **Proceduralizing the lookup.** The removed rubric is the lesson: any
  protocol attached to the table invites running it before every dispatch,
  which is overhead the table was built to avoid. If guidance grows back
  beyond reading notes, trim it.
- **Routing the orchestrator.** "This decomposition is mechanical, route it
  cheap" — but orchestration is an invariant, not a choice. Decompose,
  dispatch, and judge stay on the session's own model.
- **Treating escalation as a failure.** The standing permission means a
  missed bar is a rerun on a smarter tier, not a negotiation. Hesitating
  there costs more than the rerun.

## Adaptation notes

- The table values are explicitly the operator's calibration — subscription
  economics, lived quality judgments, a specific fleet. Adopters swap the
  rows for their own models and re-grade against their own benchmarks and
  experience. The axis set and the invariants structure are the portable
  half.
- The invariants are a template, not a universal truth: "never these
  models," "orchestration stays home," "escalate without asking," and the
  intelligence > taste > cost ordering encode one operator's risk posture.
  Keep the *structure* (a short non-negotiable list mirrored where it's
  always visible) even if the entries change.
- The skill assumes more than one lane worth choosing between. A
  single-model setup has nothing to look up.
