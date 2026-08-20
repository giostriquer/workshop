# model-reference

## What it does

`model-reference` is a reference table for the model fleet: one row per model,
graded on cost, intelligence, taste, code, and speed, plus the routing
invariants that hold regardless of which models you run. You consult it when a
model choice needs grounding and is not already settled.

It is a lookup, and nothing else. Its own description draws the line: "a
lookup, not a step before every dispatch, and it never dispatches anything."
There is no rubric to grade your task against, no output contract to fill in,
no process pattern to select, and no dispatch mechanics. It does not decide for
you; it gives you the numbers and the invariants and leaves the call where it
was.

It also does not ship a fleet policy. The rows are a worked example for
adopters to swap and re-grade, and the invariants carry the *shape* of each
rule rather than its content: "the concrete policy, which models are in, which
are out, where the floor sits" belongs to the operator's always-injected rules
file.

## When to reach for it

Invoke `/model-reference` when you are about to make a model choice that you cannot
already justify, or when the fleet changes and the table needs updating. The canonical copy "lives here and nowhere else": an operator's
always-injected rules file carries only the hard invariants and points at this
skill, so the table has exactly one place to go stale.

Do not invoke it before every dispatch. That is the misuse the skill names in
its own description.

| The problem | The skill |
| --- | --- |
| Which model to run this on | `model-reference` |
| Which skill owns this moment in the flow | `using-workbench` |
| How big an investigation should be (quick look / deep / sweep) | `audit` |
| Which implementation route the work takes (direct / plan / long-running goal) | `brainstorming`'s route gate |
| Handing a defined goal to a fresh autonomous session | `handoff-goal` |

## The table

Scores are 1-10, higher is better.

| model | cost | intelligence | taste | code | speed |
|---|---|---|---|---|---|
| gpt-5.6-sol | 6 | 9 | 8.5 | 9 | 6 |
| gpt-5.6-luna | 10 | 5 | 4 | 4 | 8 |
| opus-5 | 5 | 8 | 8 | 8 | 8 |
| fable-5 | 1 | 10 | 9.5 | 9 | 5 |
| grok-4.6 | 5 | 8 | 8 | 8 | 7 |

There is **one row per model**, "graded at the effort that model is actually
run at." Effort is not a separate axis, if you change the effort you
habitually run a model at, you re-grade its row rather than adding one.

The axes are defined precisely, and two of them are easy to misread:

- **Cost** is "subscription-limit burn, not dollars": the fleet runs on
  subscriptions, so a low cost score means "eats the weekly limit fast," not
  "expensive per token." Higher is cheaper.
- **Speed** is wall-clock turnaround on the same task. It is scored apart from
  cost "because a model that thinks for ten minutes and one that drains the
  weekly limit fail in different ways and constrain different work." Higher is
  faster.
- **Intelligence** is how hard a problem the model can carry unsupervised.
- **Taste** covers user-facing surfaces only: UI/UX, copy, API shape, docs,
  research, audits.
- **Code** is coding craft: how correct and well-built the implementation comes
  out when the work is code.

**Reading notes**, straight from the skill:

- Routine, well-specified work goes to the cheap end: "luna only for truly
  mechanical bulk, sol for routine work that still needs judgment."
- Judgment-heavy, taste-critical, or silent-failure work goes to the frontier.
  "Putting high-tier judgment at the plan while a cheaper tier implements is
  often the better spend."
- "A shipping taste surface needs taste >= 7: luna is not a taste route."
- "Speed breaks ties, never quality": level rows go to the faster one, but speed
  "does not buy a drop on intelligence, taste, or code."

## The invariants

These are the portable half. The table is a worked example; these survive any
fleet.

| Invariant | What it means in practice |
| --- | --- |
| **Orchestration stays home** | Decomposing, dispatching, and judging a set of work always run on the session's own model, or on whatever the operator's rules file specifies, never a weaker-model subagent |
| **Standing escalation permission** | When output misses the bar, rerun or redo on a smarter tier without asking. "Judge the output, not the price tag" |
| **Cost and speed are tie-breakers only** | When axes conflict for anything that ships: intelligence > taste > cost > speed. Neither of the last two buys a drop on the first two |
| **Local policy wins** | Repo-local model policies override this table where they conflict |

## Common questions

**Doesn't this skill ban Haiku and Sonnet? Doesn't it set a model floor?**

Neither. An earlier invariant read "**Never Haiku or Sonnet: any task, no
exceptions**," naming specific models from one operator's subscription mix.
That was replaced by a portable "set a model floor" invariant
([decision](../decisions/route-work-model-floor-portable.md)), and the floor
invariant has since been dropped as well: a floor is fleet policy, and this
skill carries none. Where the floor sits, and which models are banned, belong
in your own always-injected rules file. `adopt-global-rules` ships one such
file (`model-floor.md`) if you want a worked example.

**The table lists models I don't have.**

Expected. The rows are a worked example, not a recommendation. What you keep is
the axis definitions, the reading notes, and the invariants; what you replace
is every row.

**Will it recommend a route for my task?**

No. It used to: earlier versions carried a five-axis grading rubric, four named
process patterns, a three-line `route:` / `why:` / `grades:` output contract,
worked examples, and dispatch mechanics. All of it was cut: the skill read as a
dispatch procedure and was being treated as a step before every subagent
dispatch ([decision](../decisions/route-work-recalibration-and-trim.md)). What
remains is the table, the invariants, and four reading notes. You do the
grading.

**Why does the cheapest model have the highest cost score?**

Because cost is scored like every other axis: higher is better. A 10 means
lowest burn: fast and light on the weekly limit. Read the column as "cheapness,"
not "price."

**What effort should I run these at?**

Whatever effort you graded the row at. The table has one row per model, "graded
at the effort that model is actually run at," so the numbers already assume your
habitual setting. If you start running a model at a different effort and its
behaviour moves, re-grade that row. Do not add a second row for the new tier.

**Two models tie on intelligence. Which do I pick?**

Look at which axis the work actually loads. Implementation work reads the code
column the way user-facing work reads taste. If the axes genuinely conflict for
something that ships, the order is intelligence, then taste, then cost, then
speed: neither cost nor speed breaks a tie in its own favor when quality is at
stake. Between rows that are genuinely level on the axis the work loads, take
the faster one.

**Can I dispatch orchestration work to a cheap tier to save budget?**

No. That is an invariant, not a preference: decomposing, dispatching, and
judging run on the session's own model. The cheap tiers are for the work being
dispatched, not the dispatching.

**My repo has its own model policy. Which wins?**

The repo's. "Repo-local model policies override this table where they
conflict."

**When do I edit the table?**

When the fleet changes: a model launches, a tier is retired, a calibration
proves wrong in use. Dead rows leave rather than lingering for reference; a
stale row is the exact failure the skill exists to prevent, since an
always-injected copy of a table has no update trigger
([decision](../decisions/route-work.md)).

## It's working if

- A model choice can be pointed at a row and an axis, not at a habit.
- A row that stops matching how a model actually behaves gets re-graded, rather
  than worked around in the moment.
- Output that misses the bar gets rerun a tier up rather than shipped.
- Negative signal: the skill is being invoked before every subagent dispatch,
  or a session is producing a formatted "route recommendation" from it. It is a
  table you read, not a procedure you run.

## Where it fits

`model-reference` sits off the workbench spine. Nothing in the flow requires
it, and no stage hands off to it; it is consulted from wherever a model
decision happens to land: a dispatch, an agent definition, a rules file being
written. Its closest neighbor in kind is `using-workbench`, the other pure
reference in the set: one tells you which piece owns the moment, the other tells
you what to run it on. Its closest neighbors in practice are the moments that
spend model budget: the route gate at the end of `brainstorming`, `audit`'s
sizing question, and any fan-out a session is about to launch.
