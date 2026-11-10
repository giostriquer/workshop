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
live only in the canonical skill. Its scores are the operator's illustrative
grades, last revised 2026-11-05 with no recorded task set or method: they rank
rows against each other and are not a basis for a routing rule. A row showing
`n/a` is ungraded. A row counts as calibrated once it has a date, a task set with
an outcome check per task, a method run at two or three effort levels, and the
observed score against spend. Until then, use available host capabilities and
the session's model under standing rules.

Cost means subscription-limit burn, speed means turnaround on the same task,
code means implementation quality, and taste covers user-facing work. The
`effort` column records the level each row is graded at. Changing a model's
effort means re-grading its row and updating that column, not adding a second
row.

## The invariants

These hold for any fleet ([decision](../decisions/model-reference.md#routing-stays-inside-the-running-harness-2026-09-17)).

| Invariant | In practice |
| --- | --- |
| **Orchestration stays home** | Decomposing, dispatching, and judging run on the session's own model (or what the operator's rules file specifies), never a weaker subagent |
| **Standing escalation permission** | Output that misses the bar climbs without asking: a self-check first; then one effort level when below `high`, or the next tier at a lower effort when at `high` or above; as a fresh dispatch |
| **Cost and speed are tie-breakers only** | For anything that ships: intelligence, then the axis the work loads (code or taste), then cost, then speed |
| **Route inside your harness** | Pick from the models your host exposes. If the fitting row is unreachable, take the best reachable one and name the one you could not reach; crossing harnesses is the operator's move |
| **Local policy wins** | Repo-local model policies override this table |

## Common questions

**Doesn't this skill ban Haiku? Doesn't it set a model floor?**

Not as fleet policy. A floor or ban list belongs in your own always-injected
rules file; `adopt-global-rules` ships one example, `model-floor.md`. The skill
names models in four exceptions, for separate agents whose model is
selected explicitly on at least one host:

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
- **Code-quality and spec review:** `code-quality-reviewer` and `spec-reviewer`
  use Opus 5.5 at `xhigh` on Claude Code, whatever the parent runs. Codex and
  other harnesses use the parent's model and effort; Muse dispatch overrides
  the shared definition's Claude settings with the parent's values.

**The table lists models I don't have.**

Expected. Keep the axes, reading notes, and invariants; replace the rows with
your own calibrated grades.

**Will it recommend a route for my task?**

No. You read the table and make the call ([decision](../decisions/model-reference.md)).

**What effort should I run these at?**

The effort in the row's `effort` column. If you change a model's habitual
effort, re-grade its row and update the column rather than adding a second row.

**The output missed the bar. Do I jump to a bigger model?**

Not first. Give the work a way to check itself if it has none. Then, below
`high`, raise effort one level. At `high` or above, rerun on the next tier at a
lower effort than the current one.

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
gate, `audit`'s sizing step, or a fan-out. `using-workbench` says which
piece owns the moment; this says what to run it on.
