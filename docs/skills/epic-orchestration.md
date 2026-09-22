# epic-orchestration

## What it does

`epic-orchestration` makes the session the **epic owner**: it holds the tickets,
writes the prompts other sessions execute, verifies what comes back against the
repository, rules on open questions, and decides whether a PR may be opened. It
never implements, commits, pushes, or merges. You carry prompts out and
reports back.

| Role | Owns |
| --- | --- |
| Orchestrator (this session) | tickets, lane prompts, independent validation, rulings, authorization |
| Implementer lane | one worktree, one report, its completion review |
| Auditor | a blind empirical audit, with repro and anchor per finding |
| Operator (you) | lane dispatch, merges, product rulings |

It is **user-invoked only**.

## When to reach for it

Type `/epic-orchestration` when an epic spans more tickets than one session can
carry and you dispatch the implementation sessions by hand, or to close such an
epic on evidence rather than an empty ticket list.

| The problem | The skill |
| --- | --- |
| A multi-ticket epic, lanes dispatched by hand | `epic-orchestration` |
| One goal for one fresh session | [handoff-goal](handoff-goal.md) |
| A broad surface to cover at team scale | [qa-sweep](qa-sweep.md) |
| One premise, ticket, or hunch | [claim-check](claim-check.md) |
| One finished change to prove | [empirical-proof](empirical-proof.md) |

Not for implementing a change yourself, and not for a single ticket.

## Common questions

**What does it produce?**

Dispatch files and paste-ready pointer blocks. Each lane prompt, audit brief, or
authorization is its own file under the epic's scope folder. A lane prompt
carries setup, tickets with anchors and behavioral bars, required reading,
evidence, method, standing rules, required checks, and the report format. You
paste a short `Paste this into <LANE>:` block naming the role, authority, and
file path.

Everything is dispatchable the moment it is written. A prompt whose trigger has
not fired is not written yet; the session watches for the trigger.

**Does it check that a ticket is still valid before assigning it?**

Yes. Before any implementation dispatch, including reopened work, it refreshes
the integration branch (`origin/dev` unless another target is configured)
without disturbing active lanes or your changes, then checks each ticket at that
SHA. Fixed or obsolete work leaves the dispatch,
partly resolved work is narrowed, and unresolved claims or a failed refresh
hold it.

**How does it group work into lanes?**

By **file ownership, not topic**: all changes to a hot file go in one lane.
Lanes go out together only when they share no files and none waits on another
in-flight lane's output.

**How does it connect to the rest of the workbench?**

Every implementation dispatch names [epic-implementation](epic-implementation.md),
which keeps handbacks in the shared
[lane report template](../../plugins/workbench/skills/epic-orchestration/references/lane-report.md).
When the full agreed work set is ready to ship, the lane runs
[code-quality-review](code-quality-review.md), plus `test-quality-review` when
production logic or tests changed. Authorization sends the lane to
[file-pr](file-pr.md) and states whether that review has run.

**Does the review limit stop the owner returning corrections to a lane?**

No. Corrections and owner validation use no review passes. Once the lane's two
automatic follow-ups are spent, the owner decides and records the next bounded
review step; delivery waits until independent reviewers close the blockers.

**Can it use subagents?**

Yes, for bounded support such as checking evidence. Helpers inherit the
session's model; a smaller one in the same harness takes only trivial, cheaply
verifiable work.

**Does it trust the reports?**

No. In a disposable checkout of the reported commit, it reverts only the
production changes, requires the focused regression tests to fail on the
intended assertion, then restores the fix and requires them to pass. Where
relevant it greps for banned content, design-reads infrastructure, and tests
what a gate accepts. The lane's code review does not replace this: review asks
whether the code is well built, validation whether the claim is true.

It cannot reproduce every finding and says so, but it reproduces anything that
would alter scope, reverse a prior fix, or claim a regression.

**Where do debt, follow-ups, and validation details go?**

Into a local epic ledger, with detailed records beside it.
`DEBT + FOLLOW-UPS` is a required report slot, so a lane cannot silently skip
it. Separately assignable work gets a deduplicated ticket; corrections stay in
the lane's contract; unconfirmed claims keep their evidence and disposition.

**What should a new coordinator read?**

The ledger: the epic's existing README or CURRENT entry point, or `LEDGER.md` if
none exists. It holds the goal and closure bar, lanes and revisions,
dependencies, holds, decisions, owners, and next actions. Read it, then the
brief for the next action. Finished instructions leave that path once no active
lane, held delivery, or outstanding work needs them
([using-workbench's artifact guidance](using-workbench.md)); evidence stays
addressable.

**How does each reply end?**

With what was verified and exactly one next step: dispatch ready
lanes, name a pending delivery gate, dispatch the closing audit, propose
closure, or name a blocker.

**When is the epic done?**

On a **blind re-audit**, not an empty ticket list. The auditor starts from the
artifact, never the PR list, probes the surfaces, and attacks the fixes the last
round provoked.
Expect several rounds. The owner corroborates a passing audit and proposes
closure; you decide.

**Will the PR mention the process?**

No. PR text describes the change and its stakes, never lanes, the epic, or
review mechanics.

## It's working if

- Every prompt you receive is dispatchable as-is.
- Every implementation dispatch names a freshly validated revision and only work
  remaining at it.
- Reports come back validated against the repo, with unverified parts stated.
- Lanes that touch the same file arrive in the same prompt.
- Negative signal: a lane report accepted because it looked complete.

## Where it fits

Above the workbench flow, and made of it: it coordinates several sessions across
an epic and owns the judgment none can make alone. Its closest neighbor is
[handoff-goal](handoff-goal.md), which packages one goal for one fresh session.
