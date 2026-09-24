---
name: model-reference
description: Use when a model choice needs grounding and is not already settled, or when the fleet changes. Not a step before every dispatch.
---

# Model Reference

The model reference table: consult it when picking a model, update it when the
fleet changes. The canonical copy lives here and nowhere else; the operator's
always-injected rules file carries only the hard invariants and points here.

This is a lookup, not a step before every dispatch, and it never dispatches
anything.

## The table

**Legacy illustrative scores, not a current fleet calibration.** These entries
lack dated evaluation provenance and are retained only to explain the axes. Do
not route current work from these numbers: the fable-5.1 row was renamed from
fable-5 without re-grading. A new model/effort needs its own operator-supplied
calibration: date, task set, method, and observed trade-offs. Otherwise use
available host capabilities and the session's current model under standing
routing instructions.

Scores are 1–10, higher is better.

- **Cost** is subscription-limit burn, not dollars. The fleet runs on
  subscriptions, so a low cost score means "eats the weekly limit fast," not
  "expensive per token."
- **Speed** is wall-clock turnaround on the same task.
- **Intelligence** is how hard a problem the model can carry unsupervised.
- **Code** is coding craft: how correct and well-built the implementation
  comes out when the work is code.
- **Taste** covers user-facing surfaces only: UI/UX, copy, API shape, docs,
  research, audits.

| model | cost | intelligence | taste | code | speed |
|---|---|---|---|---|---|
| gpt-6-astra | 3 | 10 | 9 | 8.5 | 6 |
| gpt-6-sol | 7 | 6.5 | 7 | 7 | 7 |
| gpt-6-luna | 10 | 3 | 3 | 3 | 9 |
| fable-5.1 | 1 | 10 | 9.5 | 9 | 5 |
| opus-5.5 | 6 | 9.5 | 9.5 | 9 | 7 |
| grok-4.7 | 5 | 7.5 | 7.5 | 7.5 | 7 |

**One row per model, graded at the effort that model is actually run at.**
Effort is not a separate axis here, if you change the effort you habitually
run a model at, re-grade its row rather than adding one.

## Hard invariants

These carry the *shape* of each rule. The concrete policy, which models are
in, which are out, where the floor sits: belongs to the operator's
always-injected rules file, not to this skill; a plugin that hard-codes one
operator's fleet ships a policy its adopters never chose.

- **Orchestration stays home.** Decomposing, dispatching, and judging a set
  of work always run on the session's own model, or on whatever the operator's
  rules file specifies, never on a weaker-model subagent.
- **Standing escalation permission.** When output misses the bar, rerun or
  redo on a smarter tier without asking. Judge the output, not the price
  tag: escalating costs less than shipping mediocre work.
- **Cost and speed are tie-breakers only.** When axes conflict for anything
  that ships, intelligence > taste > cost > speed. Neither of the last two
  buys a drop on the first two.
- **Route inside the harness you are running in.** Pick from the models your host
  exposes for dispatch. A row here says how a model performs, never that it is
  reachable from this session, and starting another provider's CLI or harness to
  reach one is not a routing move: it leaves the user's session, permissions, and
  budget behind. When the fitting row is not reachable, take the best reachable one
  and name the row you could not reach. Crossing harnesses is the operator's move.
- Repo-local model policies override this table where they conflict.

## Reading a currently calibrated table

The examples below apply only after the named models and grades have been
verified for the current fleet; the legacy rows above do not establish that.

- Routine, well-specified work → the cheap end: luna only for truly
  mechanical bulk, sol for routine work that still needs judgment.
- Judgment-heavy, taste-critical, or silent-failure work → the frontier:
  opus-5.5 by default, level with fable-5.1 on taste and code at a fraction
  of the burn; fable-5.1 only where the work loads intelligence past what
  opus-5.5 carries. Putting high-tier judgment at the plan while a cheaper
  tier implements is often the better spend.
- A shipping taste surface needs taste ≥ 7: luna and grok are not taste routes.
- Speed breaks ties, never quality. When two rows are level on the axis the
  work actually loads, take the faster one. It does not buy a drop on
  intelligence, taste, or code.

## CI monitoring exception

Every CI watch uses a separate **Opus (`opus`) agent on Claude** or
**`gpt-6-sol` agent on Codex**. Never use Astra or Fable to watch CI. Select the
model explicitly; do not inherit a more capable parent. Parents already using
Opus/Sol still delegate to a separate designated agent. Missing dispatch is a
reported monitoring gap, not permission for parent polling or a prohibited
fallback. Haiku and Sonnet remain prohibited. See `fix-ci` for the workflow.

## Test-quality review exception

Every `test-quality-review` dispatch uses a separate **Opus (`opus`) agent on Claude
Code** or **`gpt-6-sol` agent on Codex**, and the host's default model on any other
host. Select the model explicitly; do not inherit the parent's model. See
`test-quality-review` for when it runs.
