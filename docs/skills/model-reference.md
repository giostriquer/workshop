# model-reference

[Canonical skill](../../plugins/workbench/skills/model-reference/SKILL.md)

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

## Reading the reference

The [table and axis definitions](../../plugins/workbench/skills/model-reference/SKILL.md#the-table)
live only in the canonical skill. Its scores are legacy illustrations without
dated calibration, not a basis for current routing. A new or regraded row needs
an operator-supplied date, task set, method, and observed trade-offs. Until then,
use available host capabilities and the session's model under standing rules.

Cost means subscription-limit burn, speed means turnaround on the same task,
code means implementation quality, and taste covers user-facing work. Changing
a model's effort requires recalibration rather than a second score row.

## The invariants

These hold for any fleet ([decision](../decisions/model-reference.md#routing-stays-inside-the-running-harness-2026-09-17)).

| Invariant | In practice |
| --- | --- |
| **Orchestration stays home** | Decomposing, dispatching, and judging run on the session's own model (or what the operator's rules file specifies), never a weaker subagent |
| **Standing escalation permission** | Output that misses the bar gets rerun on a smarter tier without asking |
| **Cost and speed are tie-breakers only** | For anything that ships: intelligence > taste > cost > speed |
| **Route inside your harness** | Pick from the models your host exposes. If the fitting row is unreachable, take the best reachable one and name the one you could not reach; crossing harnesses is the operator's move |
| **Local policy wins** | Repo-local model policies override this table |

## Common questions

**Doesn't this skill ban Haiku? Doesn't it set a model floor?**

Not as fleet policy. A floor or ban list belongs in your own always-injected
rules file; `adopt-global-rules` ships one example, `model-floor.md`. The skill
names models in three exceptions, for separate agents whose model is
selected explicitly, not inherited:

- **CI watching:** Sonnet 5.5 (`claude-sonnet-5-5`) on Claude Code or
  gpt-6.1-sol on Codex, both at `xhigh`
  effort and spawned without the parent's history. Never use Astra, Fable,
  or Haiku, and never poll in the parent. See `fix-ci`.
- **Test-quality review and the comment trim:** the `test-quality-reviewer`
  and `comment-trimmer` agents, at the same tier: Opus on Claude Code or
  gpt-6.1-sol on Codex, both at `xhigh` effort and spawned without the parent's
  history; the host's default model elsewhere.

On Muse these two exceptions dispatch the agent's approved scoped definition
(`workbench/<name>`) with no model override; Muse resolves the definition's
model pin on its own fleet.

- **Contract review:** `contract-reviewer` uses Opus 5.5 on Claude Code and
  GPT-6.1 Sol on Codex, both at `xhigh` and without the author's history.
  Other harnesses use the parent's model and effort. Muse dispatch explicitly
  overrides the shared definition's Claude settings with the parent's values.
  See [contract-review](contract-review.md); the agent owns exact dispatch settings.

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

- A model choice follows current host availability and standing rules; any
  score-based comparison has dated calibration.
- A row that stops matching behavior gets re-graded, not worked around.
- Output that misses the bar gets rerun a tier up rather than shipped.
- Negative signal: the skill runs before every dispatch, or produces a
  formatted "route recommendation".

## Where it fits

Off the workbench spine: nothing requires it and no stage hands off to it.
Consult it wherever a model decision lands, such as `brainstorming`'s route
gate, `audit`'s sizing question, or a fan-out. `using-workbench` says which
piece owns the moment; this says what to run it on.
