---
name: epic-orchestration
description: Use when running a multi-ticket epic whose implementation you delegate to other sessions the operator dispatches by hand, and when closing such an epic on a blind re-audit rather than an empty ticket list. This session owns the epic and never implements deliverables, commits, or opens the PR itself. Not for implementing a change yourself, and not for a single ticket.
disable-model-invocation: true
---

# Epic Orchestration

You own the epic's scope, independent acceptance and coordination. The operator,
or tooling acting for them, carries your dispatches to implementation sessions
and their reports back.
Within the agreed scope and authority, lanes choose implementation and
verification methods under repository rules and the skills that own the work.
A lane returns for a ruling when the existing contract does not settle a decision.

| Role | Owns | Boundary |
| --- | --- | --- |
| **Orchestrator** (you) | tickets, dispatches, independent validation, rulings, lane publication authorization | Never implements deliverables, commits, pushes, opens PRs or merges. |
| **Implementer lane** | one worktree, implementation, completion review and report | Never pushes or opens a PR before your delivery authorization. |
| **Auditor** | blind empirical audit of the artifact, findings with repro and source anchor | Does not read the PR list or implement fixes. |
| **Operator** | lane dispatch, merges, product decisions and epic closure | Grants scope and authority. |

## When this is the right seat

For one premise or ticket use `claim-check`; for broad verification use
`qa-sweep`; for one finished change at a running artifact use `empirical-proof`. To implement yourself, have
the operator recast the role first.

You may use subagents for bounded support when saved context or time justifies
the overhead. Helpers inherit the assigned workset's scope and your role
boundaries; you retain synthesis and decisions. Reuse helpers for related work.
Use the inherited model, or a smaller model in the same harness only for trivial,
mechanical work with cheaply verifiable results. Evidence assessment and lane
acceptance are not trivial. Work owned by another skill follows its routing.

## The loop

Reconcile lanes → establish scope and the primary journey → refresh and
revalidate → dispatch every ready lane → independently validate reports →
correct or authorize delivery → verify delivery → close finished lanes out →
blind audit → resolve findings or propose closure to the operator.

## Reconcile lanes every turn

At the start of every owner turn, and before writing that the epic is idle or
waiting, compare each active lane with the ledger:

- the lane's highest-numbered report file under the scope folder's `reports/`;
- the lane worktree's HEAD and working-tree fingerprint;
- whether its session is live, where the host can list sessions.

The check is done when the ledger holds this turn's observation for every active
lane: `current`, `unrelayed handback` or `silent since <last activity>`. Validate
an unrelayed handback now, as if it had been relayed. `silent` means two
reconciliations in a row found no new handback, no HEAD change and the same
fingerprint, and the session list does not show the lane running; that lane
gets a HOLD line asking the operator to resume it or reassign its workset.

## Plan the primary journey

Before the first implementation workset, or on resume when the ledger has none,
read [Primary journey](references/primary-journey.md) and write the epic's
numbered end-to-end steps from its acceptance criteria at the top of the ledger.
Read it again when a delivery leaves its ticket open. The journey orders approved
scope and adds none. Complete the thinnest end-to-end path first, then widen it,
unless the operator has set another order. Each implementation dispatch names
the journey step it moves and the tickets its delivery closes.

Before dispatching a workset, or folding a finding into an active one, name the
step it moves. A finding, however valid, takes one of three dispositions:

- It blocks the next step on the current path: it enters a workset.
- It serves a later step: record it against that step for when the step is worked.
- It moves no step: it goes to the ledger's follow-up list for the operator and
  is not dispatched.

A defect in a lane's own change is a correction under **Rulings and findings**,
not a finding to place.

## Keep coordination and verification tooling local

Coordination and verification harnesses and their outputs are local support,
kept in the ignored epic scope folder. Before creating, using or proposing to
publish them, read [Local tooling](references/local-tooling.md) for placement,
consumer and publication checks. Ordinary product regression tests remain part
of delivery. Shipping a support harness requires explicit approved scope naming
it as a maintained deliverable; routine epic publication authority, a green
check or a ticket cannot promote it. Local creation needs no extra approval.

## Revalidate before delegation

Before a new implementation workset, reopened work or scope-changing amendment:

1. **Establish membership.** Read the operator-approved objective, acceptance
   criteria, exclusions and explicit amendments from the ledger's governing
   sources. Bind each assignment to the journey step it moves and the criterion
   it serves; citing a criterion without moving a step does not admit work.
   Owner-written tickets, dispatches, reports and summaries cannot grant scope.
   Conditional criteria stay conditional; permission to use a resource does not
   add a deliverable. Missing or conflicting authority holds the step that needs
   it, under **Holds stop one step**.
   Helpers and audits inherit this boundary; a helper does not need a separate
   scope argument for every check within its assigned workset.
2. **Refresh the base.** Resolve the integration branch from the operator's
   instruction, else repository rules, else the remote's default branch, and
   record it in the ledger. In a clean checkout of that branch, pull fast-forward-only
   and verify HEAD equals the refreshed remote SHA. Otherwise fetch the target
   and inspect that exact SHA in an isolated checkout under repository and
   `using-workbench` worktree rules. A local branch ahead of the remote is not
   that snapshot. Preserve active lanes and user changes: never pull into a
   feature branch, reset or stash work to pass this gate. Missing targets or
   failed refreshes hold dispatch; cached refs do not prove freshness.
3. **Revalidate at that SHA.** Check each ticket's objective, source anchor,
   completion bar and dependencies against current implementation and tests.
   Reproduce disputed claims as needed. Remove fixed or obsolete work, narrow
   partially resolved work and hold unresolved claims. Record evidence and
   disposition; tracker status proves neither validity nor completion.
4. **Bind the handoff.** Record the ref, SHA, remaining scope and evidence in the
   ledger and dispatch. A simultaneous independent batch may share a refresh.
   Refresh again for a later batch, postponed handoff or intervening merge.
   A lane whose setup finds a different integration head returns it for owner
   revalidation before implementing against that base.

Routine work continues without a new packet under an active contract whose
assignment traces to operator-approved scope. Refreshing is inspection, not an
automatic merge into active lanes.
Integrate and recheck when a relevant change invalidates work or evidence, or a
repository/delivery rule requires it. Unrelated churn creates no qualification
work. Reuse valid evidence with its original revision and input attribution.

## Validate the claim independently

Owner acceptance requires your own checks of consequential lane claims against
approved criteria at the reported revision. Separate independently verified,
reported and unverified evidence; a lane report or green review is not acceptance.
Before accepting or refuting a claim, read
[Owner validation](references/owner-validation.md) for checks by claim type,
running-app evidence, focused scope and safe probes. Mutations belong only in a
disposable validation checkout; preserve the lane's work and name evidence gaps.

## Write the lane contract

Before assigning or amending work, read
[Lane contracts](references/lane-contracts.md) for readiness, identity, complete
initial briefs, delta amendments and blind-auditor inputs. Choose by current
ownership, dependencies and capacity. Continue the same session for unfinished
work, corrections, delivery and recovery; completed work reserves no future lane.
Keep one canonical lane name across ledger, contracts and every handoff. Record
any inherited-label mapping without replacing the session or artifact paths.

Every assignment traces to approved scope and a primary-journey step. Coordinate
ownership overlaps before concurrent edits; dependencies and epic exclusions
still govern. Require `workbench:epic-implementation` for implementation handbacks
and delivery authorizations, and `workbench:epic-auditor` for every auditor return.
Auditors start from approved criteria and the artifact, without implementer
conclusions or PR history.

## Dispatching

Every lane-facing prompt, amendment, acceptance, ruling, audit brief or
authorization is a file plus a labeled pointer in your reply. A saved file,
ledger update or prose recap alone is not a handoff. Helpers do not replace
that handoff.

1. Write the file under the scope folder's `dispatches/`. Its first line is
   `Lane: <LANE>`, the ledger's canonical name; the brief follows.
2. Give each destination its own label directly above its own fenced pointer:

`Paste this into <LANE>:`

```
Lane <LANE>. <Role, what is authorized, fresh or existing session>. Read and execute:
<absolute dispatch path>
<lines governing instructions require verbatim, if any>
```

The label, the pointer and the `Lane:` line are read as written by the tooling
that carries handoffs. The path is absolute: the lane reads it from its own
worktree. The pointer repeats no brief and carries no operator decision.

**Closeout.** When nothing remains assigned to a lane, because its delivery is
verified merged, its audit report is accepted, or its remaining work was
withdrawn or reassigned, release it in that reply:

```
Lane <LANE>, existing session. <Delivery at <sha> accepted | Audit at <sha> accepted | No further lane work is assigned>; your <implementation | audit> assignment is complete. Acknowledge only. Use <reporting skill>. Read and execute:
<absolute dispatch path>
```

A closeout assigns and removes nothing: later work needs a new assignment, and
removing the worktree needs the operator's separate approval. Before writing an
acceptance, hold or closeout file, read [Dispatching](references/dispatching.md)
for what each records.

**Holds stop one step.** Missing authority, a dependency or unfinished review
holds only the step that consumes it. Name that step, its release owner and its
governing source, quoting its exact words; a wider reading is your own ruling.
Re-observe the release condition in every turn that repeats a hold; one that no
longer holds is released in that reply. Advance independent authorized work. A
later operator review is a gate only when the operator says so. Resolve your own
delivery gate, preserve operator-reserved decisions, and do not infer merge
authority or issue work whose trigger has not fired.

## Completion review and delivery

A lane publishes nothing before you accept its work. The order is fixed:

1. **Completion round.** With the full agreed work set verified, the lane runs
   the comment trim, the applicable reviews and one `scope-review` attempt,
   then hands back `ready-for-validation` with its branch unpushed and no PR.
   Intermediate reports and requests for rulings do not trigger review.
2. **Acceptance.** You validate that head. A pending required review or
   unconfirmed blocking disposition holds delivery unless the operator
   explicitly waives it or repository rules supersede the gate.
3. **Delivery authorization.** A separate dispatch naming the accepted revision
   lets the lane push, open or update its PR, and monitor/fix CI. A brief,
   amendment or correction never carries it.
4. **Delivery check.** At green CI, read each commit added since the accepted
   revision that is not a clean integration-branch merge, and verify terminal
   CI and delivery state. A watcher's promise or an opened PR is not a
   completed delivery.

Before accepting a delivery range or writing an authorization, read
[Delivery](references/delivery.md) for the range inspection, reviewer inputs,
review record, authorization contents, lane latitude and delivery check.

**You decide routine lane delivery authorization within the approved epic.**
Issue it once step 2 is satisfied. A dispatch's "not yet authorized" or "await
delivery authorization" is your staged gate to release, not a request for
another operator approval. Ask the operator only when a governing instruction
explicitly reserves that publication decision or the action exceeds delegated
scope or authority; identify that source or boundary. Your own dispatch, ledger
or recovery note cannot create such a reservation. Merge decisions remain with
the operator.

## Rulings and findings

- **Corrections:** return confirmed defects in a lane's own change to the owning
  lane. Routine fixes within its contract proceed there. A pre-existing or
  adjacent finding is not a correction; place it under **Plan the primary
  journey**. If a review stops converging under
  its own discipline's rules, record the next-step decision and reason, then dispatch
  it. Unless that decision ends review, lane follow-ups resume autonomously.
  Keep unresolved delivery holds visible.
- **Mutation evidence:** the test reviewer bounds its own run. Partial runs or
  timeouts are not findings. Return requests to waive, scope or diagnose them
  to the lane under that rubric; only repository rules or the operator remove
  a run. This does not waive required sensitivity evidence for regression claims.
- **External findings:** technical validity, reachability and a cited criterion
  do not establish epic membership. Route unrelated findings to separate follow-ups under
  existing write authority. If an external defect blocks an epic criterion,
  record the criterion, evidence, external owner and unblock; advance independent
  work. Do not absorb its repair or waive the criterion. Scope expansion needs
  an explicit operator amendment.
- **Unsettled decisions:** resolve coordination within your authority; recommend
  product/policy choices and let the operator rule. Record the operative
  decision and source. A fix that refuses required legitimate work is itself
  an in-scope defect, not a reason to narrow acceptance silently.

## Keep tracker status current

You own status synchronization for the epic and its tickets. When a tracker is
available and writes are authorized, reconcile status on start or resume, when
work begins, after meaningful handbacks or rulings, and at delivery and closure.
Use existing authority without asking the operator to repeat it. Before a
tracker write, or when the tracker, write authority or a suitable state is
unavailable, read [Tracker sync](references/tracker-sync.md) for the state
mapping, read-back and how an unavailable or failed update stays pending.

Mark a ticket **Done** only after independent acceptance and required delivery
are verified; close the epic only after its closure gates and the operator's
decision.

## Keep a local epic ledger

Recover from the epic's existing README/CURRENT entrypoint, otherwise `LEDGER.md`,
in the ignored scope folder. Before establishing, updating or recovering that
ledger, read [Ledger and recovery](references/ledger.md). Keep the primary journey,
approved scope sources, contract revisions, lane readiness, holds and next
owners directly recoverable. Refresh volatile facts before decisions and update
state after meaningful handbacks. Distinguish reported and verified results with
revision-bound evidence; record Tracker sync and pending transitions.

The ledger is local working state, not new scope or publication authority.
Preserve active contracts, stable references and required recovery material.
Retirement and epic closure grant no deletion, worktree or tracker authority.

## Close every handoff with a next step

A reply that ends an owner turn has these parts, in order:

1. **Active holds:** one line for each hold that the operator releases or that
   stops more than one lane or workset; any other hold stays out of this slot:
   `HOLD: <lanes or worksets stopped, n of m> · since <date> · ordered by <operator | epic owner> · source: "<exact words>" · released by <owner and condition> · rechecked <date, evidence> · operator action: <exact ask, or none>`
   Name the operator as orderer only when the quoted words cover everything
   stopped.
   A wider reading, or a hold nobody ordered such as a dependency or missing
   access, is `epic owner`'s: its source quotes the observed blocker and
   `operator action` asks to confirm, narrow or supply it. A lane's `NEXT STEP`
   owned by the operator is such a hold, its ask verbatim in `operator action`.
2. **Progress:** criteria closed and remaining, the journey step in work and the
   count of open follow-ups.
3. **Lane reconciliation:** each unrelayed handback or silent lane found this
   turn, or `all lanes current`.
4. **Verified disposition:** results, revision and remaining gates, keeping
   validation, PR readiness, merge and epic completion distinct. Include
   **Tracker sync**: confirmed statuses and pending updates with owner and reason.
5. **Lane handoffs:** the label and fenced pointer from **Dispatching** for each
   affected lane, when accepting or rejecting a report, returning a correction
   or ruling, authorizing delivery or closing a lane out, including when no
   implementation remains. A lane waiting only on an operator decision gets its
   disposition and that hold.
6. **Next actions:** every workset that is neither done nor active has its
   dispatch in part 5 or a hold naming its release owner. A step named without
   its dispatch file and pointer is not a next action. With no workset open,
   the reply carries the closing audit's brief, the closure proposal, or a hold
   naming what stops both and who releases it. Operator decisions go
   here, outside the paste blocks; dispatch a routine next lane the plan already
   determines instead of asking.

Before sending, check that every lane-facing disposition has its file, label and
pointer under one canonical name, and that part 6 accounts for every open
workset. An answer or progress update with no lane disposition still gives parts
1 to 3 and 6; messages inside a turn stay brief prose. Before a session's first
owner return and before each audit return, read
[Owner returns](references/owner-returns.md): a worked return and the three
dispositions an audit return states separately.

## Closing the epic

Closure requires every journey step verified end to end, acceptance evidence,
regression checks for relevant fix families, dispositioned findings, verified
required delivery and a **blind audit** whose verdict-moving claims you
corroborated yourself. Before briefing the closing audit or proposing closure,
read [Closing](references/closing.md) for the audit's required evidence and the
proposal's contents.

Propose closure only when every open follow-up and debt item is listed on its
own line with the operator's disposition: `do before close`, `separate ticket
accepted` or `drop`. An item without one goes to the operator for a ruling
first. Only the operator closes the epic; accepting an audit does not authorize
fixes or close it.
