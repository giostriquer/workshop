# model-reference

## What it does

`model-reference` is a lookup for the model fleet: a table grading each model on
cost, intelligence, taste, code, and speed, plus the routing invariants that
hold whatever models you run. It has no rubric, output contract, or dispatch
procedure, and "it never dispatches anything"; the call stays with you.

It ships no general fleet policy: which models are in or out, and where a floor
sits, belong to the operator's always-injected rules file.

## When to reach for it

Invoke `/model-reference` when a model choice needs grounding and is not already
settled, or when the fleet changes. The table lives only in this skill; a rules
file carries the hard invariants and points here. Do not invoke it before every
dispatch.

| The problem | The skill |
| --- | --- |
| Which model to run this on | `model-reference` |
| Which skill owns this moment | `using-workbench` |
| How big an investigation should be | `audit` |
| Which implementation route the work takes | `brainstorming`'s route gate |
| Handing a defined goal to a fresh session | `handoff-goal` |

## The table

The scores are legacy illustrations without dated calibration, kept to explain
the axes. Do not route current work from them; the fable-5.1 row has not been
re-graded. Edit the table when the fleet changes; each new or re-graded row
needs an operator-supplied calibration: date, task set, method, and observed
trade-offs. Until then, use the host's available capabilities and the session's
current model under your standing rules.

Scores are 1-10, higher is better.

| model | cost | intelligence | taste | code | speed |
|---|---|---|---|---|---|
| gpt-6-astra | 3 | 10 | 9 | 8.5 | 6 |
| gpt-6-sol | 7 | 6 | 6 | 6 | 7 |
| gpt-6-luna | 10 | 3 | 3 | 3 | 9 |
| fable-5.1 | 1 | 10 | 9.5 | 9 | 5 |
| opus-5.5 | 6 | 9.5 | 9.5 | 9 | 7 |
| grok-4.7 | 5 | 7.5 | 7.5 | 7.5 | 7 |

One row per model, graded at the effort you actually run it at.

- **Cost** is subscription-limit burn, not dollars. Higher is cheaper: a 10
  barely touches the weekly limit.
- **Speed** is wall-clock turnaround on the same task.
- **Intelligence** is how hard a problem the model can carry unsupervised.
- **Taste** covers user-facing surfaces only: UI/UX, copy, API shape, docs,
  research, audits.
- **Code** is how correct and well-built the implementation comes out.

**Reading a calibrated table** (only after the rows are verified for your
fleet):

- Routine work goes to the cheap end: luna for truly mechanical bulk, sol when
  it still needs judgment.
- Judgment-heavy, taste-critical, or silent-failure work goes to opus-5.5 by
  default; fable-5.1 only where the work needs more intelligence than opus-5.5
  carries.
- A shipping taste surface needs taste of 7 or more.
- Speed breaks ties, never quality.

## The invariants

These hold for any fleet ([decision](../decisions/model-routing-stays-in-harness.md)).

| Invariant | In practice |
| --- | --- |
| **Orchestration stays home** | Decomposing, dispatching, and judging run on the session's own model (or what the operator's rules file specifies), never a weaker subagent |
| **Standing escalation permission** | Output that misses the bar gets rerun on a smarter tier without asking |
| **Cost and speed are tie-breakers only** | For anything that ships: intelligence > taste > cost > speed |
| **Route inside your harness** | Pick from the models your host exposes. If the fitting row is unreachable, take the best reachable one and name the one you could not reach; crossing harnesses is the operator's move |
| **Local policy wins** | Repo-local model policies override this table |

## Common questions

**Doesn't this skill ban Haiku and Sonnet? Doesn't it set a model floor?**

Not as fleet policy. A floor or ban list belongs in your own always-injected
rules file; `adopt-global-rules` ships one example, `model-floor.md`. The skill
names models only in two exceptions, for separate agents whose model is
selected explicitly, not inherited:

- **CI watching:** Opus on Claude or gpt-6-sol on Codex, both at `xhigh`
  effort and spawned without the parent's history. Never Astra, Fable, Haiku,
  or Sonnet, and never parent polling. See `fix-ci`.
- **Test-quality review and the comment trim:** the `test-quality-reviewer`
  and `comment-trimmer` agents, at the same tier: Opus on Claude Code or
  gpt-6-sol on Codex, both at `xhigh` effort and spawned without the parent's
  history; the host's default model elsewhere.

**The table lists models I don't have.**

Expected. Keep the axes, reading notes, and invariants; replace the rows with
your own calibrated grades.

**Will it recommend a route for my task?**

No. You read the table and make the call ([decision](../decisions/model-reference.md)).

**What effort should I run these at?**

The effort the row was graded at. If you change a model's habitual effort,
re-grade its row rather than adding a second one.

**Two models tie on intelligence. Which do I pick?**

Look at the axis the work loads: code for implementation, taste for user-facing
work. Between rows level on that axis, take the faster one.

## It's working if

- A model choice points at a row and an axis, not a habit.
- A row that stops matching behavior gets re-graded, not worked around.
- Output that misses the bar gets rerun a tier up rather than shipped.
- Negative signal: the skill runs before every dispatch, or produces a
  formatted "route recommendation".

## Where it fits

Off the workbench spine: nothing requires it and no stage hands off to it.
Consult it wherever a model decision lands, such as `brainstorming`'s route
gate, `audit`'s sizing question, or a fan-out. `using-workbench` says which
piece owns the moment; this says what to run it on.
