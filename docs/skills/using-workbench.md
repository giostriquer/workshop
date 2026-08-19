# using-workbench

## What it does

`using-workbench` is the orientation map for the workbench system. It tells a
session how work enters, who owns each moment, which skill to invoke when one
applies, and where the session's working material goes. It also carries the
session-conduct conventions that belong to no single skill, including where flow
artifacts live, where worktrees go, and when a growing change should stop and
ask to be rescoped.

It is a reference, not a process. It runs no loop, produces no artifact, and
reaches no verdict. Its own Boundaries section states the stance:
"**Orientation, not compulsion, with two standing exceptions.** At session
start it maps; it never forces, and it never responds to 'how does the flow
work?' by starting the flow." Ask it how the flow works and you get an answer,
not an audit.

The two standing exceptions matter, because they are the only parts of the map
that bind. `verification-before-completion` fires at every done/fixed/passing
claim, and the adversarial `code-quality-review` fires once the work-stream's
implementation is complete. Each "runs unless **the user explicitly declines
it**, or **the repo's own process supersedes it**." Everything else on the map
is a default the user configured; it fires on relevance.

Repo precedence is a general rule on the map, and it runs in both directions.
Where the repo carries its own process document, the session follows it for
worktrees, test discipline, and completion gates instead of re-running the
flow's version of the same ceremony. A repo gate can also *invite* a tier the
flow would otherwise only offer. What survives regardless are the three user
gates and the adversarial review before PR-or-merge, and the session names which
of those it skips and why.

## When to reach for it

It fires by itself. Its description triggers at conversation start, so a
session orients before its first response. There is no hook behind this because
workbench "ships no hooks; skill descriptions and the user's own rules are the
entire activation surface." You can also invoke it on demand, and the two
questions it is built to answer are "how does the workbench flow work?" and
"which skill do I use for X?"

One carve-out sits at the top of the skill: "If you were dispatched as a
subagent to execute a specific task, skip this orientation." Dispatched agents
do not read the map.

| The problem | The skill |
| --- | --- |
| Which skill owns this moment? Where am I in the flow? | `using-workbench` |
| Something to verify, hunt, or check | `audit` |
| Designing a feature or a refactor | `brainstorming` |
| One premise, ticket, or hunch to investigate | `claim-check` |
| About to claim done, fixed, or passing | `verification-before-completion` |
| A work-stream's implementation is complete | `code-quality-review` |
| Picking a model or an effort tier | `route-work` |
| Authoring or editing a skill | `writing-skills` (ships in `toolkit`) |

## The map

**The flow, in five stages.**

- **Entry**: two optional doors. Door A is `audit`: the user sizes the
  workload, an engine runs it, the user confirms flagged points, and the exit
  is a report or revealed work. Door B is an idea: ground it against the
  codebase first, then `brainstorming` owns what the code cannot answer.
- **Scoping**: `brainstorming` always precedes feature and refactor design,
  and ends at the user's route pick: direct, plan, or handoff-goal.
- **Implementation**: `test-driven-development` where a test harness exists
  (repo conventions take precedence on conflict), `systematic-debugging` on
  any bug before fixes. Execution agency is the user's and the harness's call;
  workbench never dictates in-session versus dispatched.
- **Completion**: entered only when the work-stream's implementation is
  believed complete: test-quality review, then "deemed ready" (verified with
  evidence), then one adversarial review right before the PR-or-merge ask,
  then the user gate.
- **Feedback**: `get-pr-comments` triages, `receiving-code-review` governs
  acting on it, verified fixes re-enter implementation.

**The three user gates.** This is the system's signature: the user decides at
exactly three moments: size the workload (`audit`), pick the route (after
`brainstorming`), PR or merge (after the adversarial review, with the outline
in hand; standing rules may pre-authorize). "Everything else is the session's
to drive."

**Picking the verification piece.** Several pieces touch verification; the map
tells you to pick by the work's shape rather than read them all.

| Shape | Piece |
| --- | --- |
| Any done/fixed/passing claim | `verification-before-completion` is always on |
| One just-finished change with a drivable surface | `empirical-proof` |
| A broad decomposable surface at team scale | `qa-sweep` |
| One premise, ticket, or hunch | `claim-check` |
| Landing (assumes the gates already ran) | `file-pr` |

Two principles ride with it: "When no frame fits the work's shape, keep the
standard and drop the frame," and "The protocols are checkpoints, not reading
assignments: load one when its moment arrives, not preemptively."

**Cost and authority.** `empirical-proof` and `qa-sweep` are the expensive
tiers: "**offer them, never default to them**." They run on the user's explicit
ask, now or standing. Running one uninvited spends time and budget on ceremony
nobody ordered. A repo's own completion gate that requires driving the real
artifact for a change of this kind counts as that standing ask: the session runs
it, names the gate that invited it, and reports the run as part of satisfying
the gate.

**Artifacts are disposable.** Audit reports, brainstorm designs, route plans,
outlines: all working material. They live in `.workbench/<work_scope>/` (or
`.tmp/workbench/<work_scope>/` in repos that centralize scratch), typically
gitignored. Promotion to a committed doc is the user's call. And there is one
home per work scope: the dispatching session hands the scope folder's path to
every agent in its contract, and "agents never invent their own locations."

**Worktree location.** Prefer the harness's native worktree mechanism. Absent
a repo or user convention, create worktrees at `<repo>/.worktrees/<task-name>`,
verifying the directory is ignored (`git check-ignore .worktrees`) before the
worktree exists. "Never place a worktree in the system temp directory or any
path outside the repository unless the user explicitly asks."

**Scope guard.** Two tripwires, either of which stops the work and brings a
question instead of growing the diff: **spread** (the change starts crossing
owner areas or subsystems the ask never named) and **size** (the diff grows
well past what the accepted work implied). "Stopping to ask 'should this
split?' is flow-correct behavior; growing scope silently is the failure."

## Common questions

**It fired at the start of my session. Is it about to run a process on me?**

No. It maps and stops. The skill explicitly refuses to answer "how does the
flow work?" by starting the flow. What it does change is that a session
matching a moment on the map should invoke the owning skill and say so briefly
("Using audit to size this investigation") rather than improvising.

**Which parts are actually mandatory?**

Two, and only two: `verification-before-completion` and the adversarial
`code-quality-review`. This used to be one. The file said outright that
"`verification-before-completion` is the only always-on piece," and three other
passages generalized the no-compulsion framing over everything, so sessions
finished implementations, verified them, and went straight to the landing gate,
skipping the adversarial review entirely. All four sites were rewritten to
state the same rule, and the framing now names the non-reasons: a small diff, a
confident implementation, a tidy-looking change, time pressure, and the
session's own judgment that this one looks fine are not grounds to skip
([decision](../decisions/adversarial-review-is-default-on.md)).

**Do dispatched subagents inherit these conventions?**

No, and this caused a real failure. Subagents are told to skip the orientation,
so an audit run left its evidence spread across three per-agent system-temp
directories although all of it belonged to one work scope. The fix is not that
agents read the map; it is that the dispatching session hands the scope
folder's path to each agent in its contract
([decision](../decisions/evidence-one-home-per-scope.md)). If you are
dispatching, put the path in the contract.

**My one-ticket change turned into a sprawl. Does workbench catch that?**

Now it does, via the scope guard. A workbench-governed session grew a
one-ticket persistence change into a 52-file workset across six subsystems, by
looping through implement, find an adjacent defect, treat it as required, add
tests and a fix, review the larger implementation, find more defects. Nothing
in the flow tripped on diff size or subsystem spread. The two tripwires exist
because of that run, along with the rule that adjacent defects get recorded as
follow-up work rather than folded in
([decision](../decisions/scope-guards-q15-q16.md)). The thresholds are
deliberately qualitative because there is no numeric size limit, and a repo that
wants one sets it in its own rules.

**Should I be running `empirical-proof` or `qa-sweep`?**

Only if you ask for them, or if your repo's own process document already
requires driving the real artifact for the change in hand, which counts as the
ask. Otherwise they are offered, never automatic. The flow's earlier
wording ("empirical-proof if runnable", "the deeper sibling") read as an
instruction to run them whenever a change qualified. They are expensive due to
subagent fan-outs, booted apps, and corroboration loops, and the choice is the
user's ([decision](../decisions/expensive-verification-user-optioned.md)).

**Does it decide whether work runs in-session or gets dispatched to agents?**

No. "Workbench never dictates execution agency (in-session vs dispatched)."
That is the user's and the harness's call. The flow's only job at that moment
is handing the implementer the plan or goal when one exists.

**Does it enforce anything with hooks or an injected dispatcher?**

No. The system was built specifically to drop the hook layer it replaced;
skill descriptions and the user's own rules are the entire activation surface
([decision](../decisions/workbench-system.md)).

**Where do I put a design doc I want to keep?**

Ask for it. Working material becomes durable "only when they explicitly ask, or
when the repo has an established pattern for that artifact kind." A session
that quietly commits a brainstorm doc is misbehaving.

## It's working if

- The session names the moment and the skill before acting ("Using audit to
  size this investigation").
- You are asked exactly three times: size the workload, pick the route, PR or
  merge.
- Reports, designs, and evidence from one work-stream all land in one folder
  under `.workbench/<work_scope>/`, including anything dispatched agents
  produced.
- A change that starts crossing subsystems you never named comes back as a
  question about splitting, not as a bigger diff.
- Negative signal: you ask how the flow works and the session starts running
  it. Also negative: a session announces work is done and ready without fresh
  verification output, or skips the adversarial review because the diff looked
  small.

## Where it fits

`using-workbench` is the frame rather than a stage in it. It sits above entry,
scoping, implementation, completion, and feedback, and hands off to whichever
skill owns the moment: `audit` and `brainstorming` at the two entry doors,
`test-driven-development` and `systematic-debugging` inside implementation,
`verification-before-completion` and `code-quality-review` at the completion
gates, `file-pr` and `fix-ci` at landing. Nothing hands off *to* it; it is
already loaded when the session starts, and it is the thing you re-read when
you cannot tell which piece owns what is in front of you.
