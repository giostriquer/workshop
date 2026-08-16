# Decision: `handoff-goal` ships a commit-discipline default in every contract

**Date:** 2026-07-17

## Status

Implemented.

## Context

Live goal pursuit surfaced a failure the v2 contract doesn't defend against:
pursuing sessions were not committing between phases, accumulating 50–70k-line
uncommitted diffs across a multi-phase goal: one bad command away from losing
everything, and increasingly risky to land as a single unit.

The root cause is the skill's own doctrine colliding with its template:

- Step 6 forbids inventing "a rule the operator didn't state and the repo
  doesn't mandate." When nobody states a commit cadence (the common case)
  the producer must leave the `Commits:` operating-rule slot vague or blank.
- The pursuit loop in `plan.md` (*act → verify → record evidence → repeat*)
  has no commit step, and phase exit criteria carry no commit requirement.
- The contract gates "consequential actions" behind operator approval and
  forbids unapproved pushes. A pursuer reading a blank commit rule inside a
  gate-heavy contract concludes git is the operator's decision and avoids it.

So the contract *manufactures* the fear: every safeguard says "ask before
touching anything external," and nothing says "local commits are yours."

## The shape

Commit discipline becomes the second skill-shipped operating-rule default
(quality posture was the first), and it is made **mechanical**, not advisory.
Per the writing-skills form table, an omitted element gets a structural slot,
not a prose reminder:

- **`goal.md` → Operating rules → Commits** now carries doctrine that ships
  verbatim in every contract: default cadence when nobody states one (*commit
  at every verified checkpoint, at minimum at each completed phase*); local
  commits are routine, never consequential actions needing approval; each
  green commit is the recovery point a later failure rolls back to; never
  carry uncommitted work across a phase boundary; only Push / PR is
  separately governed.
- **`plan.md` → loop** gains the step: *act → verify → record evidence →
  **commit the checkpoint** → repeat*.
- **`plan.md` → phase template** gains a standing exit criterion: *Phase work
  committed: sha + message (a phase with uncommitted work is not complete).*
- **Ledger entries** record the checkpoint commit sha when work landed.
- **Step 6 / Rules** carve out the explicit exception. Never invent rules, except
  the two skill defaults (quality posture, commit cadence) when neither repo
  nor operator sets them.
- **Critique mode** audits commit discipline, so existing contracts get
  retro-tightened when pointed back at the skill.

Operator- or repo-stated cadence still wins; the default only fills silence.

## Validation

RED is the production observation itself: repeated 50–70k-line uncommitted
diffs in real goal pursuit rather than a synthetic run, consistent with the
goal-defense round's finding that loop failures don't reproduce in single
reflective shots.

Wording was micro-tested per writing-skills (5 control + 5 treatment
single-shot pursuers, paper simulation: phase 2/5 just verified green, 41k
uncommitted lines, operator offline):

- **Control (current template, blank Commits line): 5/5 committed, but every
  rep first derived permission from silence** ("goal.md is silent on commits
  and forbids only push/PR, so a local commit is a safe judgment call") and
  most flagged the commit as a deviation for operator review. The salient-risk
  probe makes the model reason its way there; the production failure is that
  fragile inference chain not being made under long-loop momentum.
- **Treatment (new wording): 5/5 committed as rule-following**, converging on
  one shape: verify fresh → commit (split per phase if separable, honest
  combined commit if not) → tick the exit criterion with the sha → ledger →
  next phase at per-checkpoint cadence. Several called the uncommitted backlog
  "contrary to the operating rules" and remediated it. Convergence across reps
  is the writing-skills signal that the wording binds.

## Non-goals

- No change to push/PR policy; those stay operator-gated exactly as before;
  the point is separating routine local commits from gated external actions.
- No prescribed message style; that remains operator/repo-sourced.
- The "never invent rules" doctrine stays; the default is a named skill
  exception, not a license to pad rules.

## Packaging

- Canonical `plugins/toolkit/skills/handoff-goal/SKILL.md` updated (the
  toolkit copy is the only one; the onboarding bundle does not ship this
  skill). `description` unchanged: triggering conditions didn't move.
- Origin doc `docs/skills/handoff-goal.md` updated: solution shape (defaults,
  loop, phase criterion) and a new "hoarded mega-diff" pitfall.
- `toolkit` `0.13.0` → `0.13.1` (patch: rework of an existing skill).
- `docs/change-log.md` entry via the `change-log` skill.
