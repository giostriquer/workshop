# handoff-goal

## What it does

`handoff-goal` packages a goal into a **self-contained goal contract**: a
directory holding `goal.md` (the frozen contract) and `plan.md` (the
status-tracked route). A fresh session picks it up and pursues the goal
autonomously, with no access to the session that wrote it.

It writes the contract and stops: "Do not begin pursuing the goal here." In
**critique mode**, pointed at an existing goal directory, it audits that contract
and proposes corrections, editing only on request.

## When to reach for it

Only for **long-running work**: a defined goal a fresh session must pursue over
many turns of attempts, waiting and recovery. Work this session could finish is a
plain task, however well-defined. You invoke it with `/handoff-goal`; a session
never invokes it on its own. `brainstorming`'s route gate offers it as
**Long-running goal**, beside Direct and Plan.

Its **fit check** wants a loop: done measurable by checks that can fail, and a
pursuer that can pick its next move after a failure without asking you. Failing
that, it recommends a plain task unless you insist.

| The problem | The skill |
| --- | --- |
| A stateable outcome, verified by checks that can fail, pursued over a long loop | `handoff-goal` |
| Work this session could finish, or "look into X" research | a plain task |
| A design with questions the codebase can't answer | `brainstorming` |
| One premise, ticket or hunch to verify | `claim-check` |

## The contract

It lands in the repo's scope-folder convention, otherwise
`.workbench/<work_scope>/goal-contract/`. Two files, nothing else: no ledger, log
or evidence file, and pursuit never creates one.

| File | After handoff | Contents |
| --- | --- | --- |
| `goal.md` | Frozen; the pursuer may not edit it | Goal, baseline, acceptance checks, integrity rules, operating rules, when to stop |
| `plan.md` | Status flips and checkbox ticks only | Current-state snapshot, then phases with status, verification and exit criteria |

The pursuer re-reads both files at every boot and after every compaction, so
they stay small. Because it never edits `goal.md`, an urge to edit it is the
redefinition tripwire firing.

### The always-on four

Every contract carries:

- **Verifiable acceptance checks**: a checklist the pursuer can run.
- **Integrity rules**: no weakening tests, moving goalposts, claiming without
  evidence, or hiding failures.
- **Independent verification**: done is confirmed by a pass the pursuer didn't
  make itself.
- **The redefinition tripwire**: temptation to change the contract, checks or
  scope is a stop-and-ask.

Approval gates, Delegation lanes, Invariants and Non-goals scale with stakes: "A
trivial goal carries the four; a high-stakes one carries all of it."

## The steps

| # | Step |
| --- | --- |
| 1 | Check fit |
| 2 | Resolve the goal, confirming it if inferred |
| 3 | Turn done into acceptance checks, each with a command and, for behavior changes, a mutation that turns it red |
| 4 | Name the primary verifier on the real surface |
| 5 | Capture baseline and state from the repo, not memory |
| 6 | Gather operating rules as concrete values |
| 7 | Size the apparatus to the stakes |
| 8 | Assemble `goal.md` and `plan.md` |
| 9 | Red-team the draft |
| 10 | Deliver the directory path |

**Where the goal comes from.** With no argument, it infers the goal from the
session and asks you to confirm; a reference to a plan, spec or branch scopes it
to exactly that. The goal is an outcome with a definition of done, not a step
list.

**What you supply.** Step 6 asks for what the repo and session leave open:
branch, commit cadence, push and PR policy, validation gates, stop-and-ask
triggers, quality posture. It never invents a rule, except two defaults:
reliability over speed, and a commit at every verified checkpoint.

## Common questions

**Where does the history live?** In git: each verified checkpoint is a commit
whose message carries the evidence. If commits are prohibited, the contract names
a record outside the two files.

**Why does my contract have a commit rule I never asked for?** Without one, the
pursuer hoards a huge uncommitted diff across phases. An explicit no-commit
instruction overrides the default, and the contract names where checkpoints go.
([decision](../decisions/handoff-goal.md))

**Is repointing a test at a fixed module a forbidden dodge?** No. Relocating a
test so the runner stops collecting it is; "pointing the test at the corrected
module or a proper new seam is a fix, not a dodge."

**Should the pursuer dispatch reviewers for every task?** No. A small task's
independent pass is a clean re-run of its Verify command. Reviewers come in after
substantial chunks, and every phase exits through an adversarial code-quality
review of its cumulative diff.

**What if the primary verifier needs a browser, credentials or a device the
pursuer won't have?** `goal.md` names it as a blocked item with the exact manual
test and evidence you must supply, never a silently weaker check.

**What if the phases turn out to be wrong?** The pursuer stops and asks you to
revise the route; rewriting phases is not a permitted write.

## It's working if

- A fresh session on `goal.md` can state the goal and its first action without
  asking you.
- After handoff, `goal.md` has no diff; `plan.md` diffs are only status lines and
  ticks.
- Each phase closes with a verified checkpoint under the Commits rule.

Signs of misapplication: prose or command output in `plan.md`; a contract for
"look into X"; acceptance checks with no command; a one-file utility wrapped in
every optional section; `goal.md` edited during pursuit.

## Where it fits

`handoff-goal` is the one route out of `brainstorming` that leaves the session.
Everything upstream is compressed into the contract; downstream, the pursuer
still verifies, records checkpoints, and reviews each phase.
