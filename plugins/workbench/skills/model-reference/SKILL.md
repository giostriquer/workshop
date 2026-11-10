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

**Illustrative operator scores, not a measured fleet calibration.** The
operator last revised these rows on 2026-11-05 without a recorded task set or
method, and `fable-5.2` joined the fleet afterwards with no grades (`n/a`). The
rows explain the axes and rank models against each other; they do not
establish a routing rule. A new model, effort or routing rule needs its own
calibration (see Calibrating a row). Until then use available host
capabilities and the session's current model under standing routing
instructions.

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
| gpt-6-astra | 3 | 8.5 | 9 | 8.5 | 5 |
| gpt-6.1-sol | 7 | 8 | 8 | 8 | 7 |
| gpt-6-luna | 10 | 3 | 3 | 3 | 9 |
| fable-5.2 | 2 | 10 | 9.5 | 10 | 5 |
| opus-5.5 | 7 | 9 | 9.5 | 9.5 | 6 |
| sonnet-5.5 | 7.5 | 7.5 | 7.5 | 7.5 | 8 |
| haiku-5.5 | 9 | 3.5 | 3.5 | 3.5 | 8 |
| grok-4.7 | 5 | 7 | 7 | 7 | 7 |
| muse-wonder-full-1.0 | 6 | 7.5 | 7.5 | 7.5 | 7 |

**One row per model, graded at the effort that model is actually run at.**
`n/a` there means none is recorded.
Effort is not a separate axis here: if you change the effort you habitually
run a model at, re-grade its row and update the column rather than adding a
row.

## Calibrating a row

A row is calibrated when the operator has recorded four things for it: the
date; a task set of real tasks, each with an outcome check such as a passing
test or a correct row count; the method, with each candidate run at two or
three effort levels in its own session and each task's cost recorded; and the
observed trade-off as score against spend. A route that mixes models stays
only when it beats every single-model point on that plot. Past `high`, one
more effort level can cost as much as the next tier, so the comparison
includes the next model at a lower effort.

## Hard invariants

These carry the *shape* of each rule. The concrete policy, which models are
in, which are out, where the floor sits: belongs to the operator's
always-injected rules file, not to this skill; a plugin that hard-codes one
operator's fleet ships a policy its adopters never chose.

- **Orchestration stays home.** Decomposing, dispatching, and judging a set
  of work always run on the session's own model, or on whatever the operator's
  rules file specifies, never on a weaker-model subagent.
- **Standing escalation permission.** When output misses the bar, climb
  without asking. First give the work a way to check itself (a test, a build,
  a script) when it has none. Then, below `high`, raise effort one level; at
  `high` or above, rerun on the next tier at a lower effort than the current
  one. Escalate with a fresh dispatch and a written brief: a model switched
  mid-session re-pays the prompt cache and loses the earlier reasoning. Judge
  the output, not the price tag: escalating costs less than shipping mediocre
  work.
- **Cost and speed are tie-breakers only.** When axes conflict for anything
  that ships, the quality axes come first: intelligence, then the axis the
  work loads (code for implementation, taste for a user-facing surface), then
  cost, then speed. Neither cost nor speed buys a drop on a quality axis.
- **Route inside the harness you are running in.** Pick from the models your host
  exposes for dispatch. A row here says how a model performs, never that it is
  reachable from this session, and starting another provider's CLI or harness to
  reach one is not a routing move: it leaves the user's session, permissions, and
  budget behind. When the fitting row is not reachable, take the best reachable one
  and name the row you could not reach. Crossing harnesses is the operator's move.
- Repo-local model policies override this table where they conflict.

## Reading a currently calibrated table

The examples below apply only after the named models and grades have been
verified for the current fleet; the illustrative rows above do not establish that.

- Routine, well-specified work → the cheap end: luna only for truly
  mechanical bulk, sol for routine work that still needs judgment.
- Judgment-heavy, taste-critical, or silent-failure work → the frontier:
  opus-5.5 by default, graded at or above fable-5.1 on intelligence, taste
  and code at a fraction of the burn. An ungraded row (fable-5.2) is not a
  table route: it runs where the operator's rules file or the session's own
  model puts it. Putting high-tier judgment at the plan while a cheaper tier
  implements is often the better spend.
- A shipping taste surface needs taste ≥ 7: rows below it (luna and
  haiku-5.5 today) are not taste routes.
- Speed breaks ties, never quality. When two rows are level on the axis the
  work actually loads, take the faster one. It does not buy a drop on
  intelligence, taste, or code.

## CI monitoring exception

Every CI watch uses a separate **Sonnet 5.5 (`claude-sonnet-5-5`) agent at
`xhigh` effort on Claude Code** or **`gpt-6.1-sol` agent at `xhigh` reasoning
effort on Codex**, spawned
without the parent's history. On Muse, dispatch the approved
`workbench/ci-watcher` definition by its scoped id with no model override;
Muse resolves the definition's model pin on its own fleet. Never use Astra, Fable, or Haiku to watch CI.
Select the model and effort explicitly; do not inherit a more capable parent.
Parents already using Sonnet/Sol still delegate to a separate designated agent.
Missing dispatch is a reported monitoring gap, not permission for parent
polling or a prohibited fallback. See `fix-ci` for the workflow.

## Test-quality review and comment-trim exception

Every `test-quality-reviewer` and every `comment-trimmer` dispatch uses a
separate **Opus (`opus`) agent at `xhigh` effort on Claude Code** or
**`gpt-6.1-sol` agent at `xhigh` reasoning effort on Codex**, spawned without the
parent's history, and the host's default model on any other host. On Muse,
dispatch the approved `workbench/test-quality-reviewer` or
`workbench/comment-trimmer` definition by its scoped id with no model
override; Muse likewise resolves the definition's model pin on its own fleet.
Select the model and effort explicitly; do not inherit the parent's. See
`test-quality-review` and `trim-comments` for when each runs.

## Contract-review exception

`contract-review` dispatches `contract-reviewer` on **Opus 5.5 at `xhigh` on
Claude Code** and **GPT-6.1 Sol at `xhigh` on Codex**, without the author's
history. Other harnesses use the parent's model and effort. In particular, Muse
must override the shared definition's Claude settings with the parent's values.
The agent's Dispatch line is the source for exact arguments. An unavailable
required route leaves the review blocked; it does not select a fallback model.

## Code-quality and spec review exception

`code-quality-reviewer` and `spec-reviewer` run on **Opus 5.5
(`claude-opus-5-5`) at `xhigh` on Claude Code**, independently of the model the parent runs, without the author's history. On Codex and other harnesses they use the
parent's model and effort; Muse overrides the shared definition's Claude
settings with the parent's values. Each agent's Dispatch line is the source
for exact arguments.
