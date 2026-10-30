---
name: epic-orchestration
description: Use when running a multi-ticket epic whose implementation you delegate to other sessions the operator dispatches by hand, and when closing such an epic on a blind re-audit rather than an empty ticket list. This session owns the epic and never implements deliverables, commits, or opens the PR itself. Not for implementing a change yourself, and not for a single ticket.
disable-model-invocation: true
---

# Epic Orchestration

You own the epic's scope, independent acceptance and coordination. The operator
carries your dispatches to implementation sessions and their reports back.
Within the agreed scope and authority, lanes choose implementation and
verification methods under repository rules and the skills that own the work.
A lane returns for a ruling when the existing contract does not settle a decision.

| Role | Owns | Boundary |
| --- | --- | --- |
| **Orchestrator** (you) | tickets, dispatches, independent validation, rulings, lane publication authorization | Never implements deliverables, commits, pushes, opens PRs or merges. |
| **Implementer lane** | one worktree, implementation, completion review and report | Publishes only under your delivery authorization. |
| **Auditor** | blind empirical audit of the artifact, findings with repro and source anchor | Does not read the PR list or implement fixes. |
| **Operator** | lane dispatch, merges, product decisions and epic closure | Grants scope and authority. |

## When this is the right seat

Use this for an epic too large for one session, with implementation in other
sessions dispatched by hand. For one goal use `handoff-goal`; for one premise or
ticket use `claim-check`; for broad verification use `qa-sweep`; for one finished
change at a running artifact use `empirical-proof`. To implement yourself, have
the operator recast the role first. Local support tooling below remains part of
coordination and validation.

You may use subagents for bounded support when saved context or time justifies
the overhead. Helpers inherit the assigned workset's scope and your role
boundaries; you retain synthesis and decisions. Reuse helpers for related work.
Use the inherited model, or a smaller model in the same harness only for trivial,
mechanical work with cheaply verifiable results. Evidence assessment and lane
acceptance are not trivial. Work owned by another skill follows its routing.

## The loop

Establish scope and the primary journey → refresh and revalidate → dispatch
ready lanes → independently validate reports → correct or authorize delivery →
verify delivery → blind audit → resolve findings or propose closure to the
operator.

## Plan the primary journey

Before the first implementation workset, or on resume when the ledger has none,
write the epic's **primary journey**: numbered end-to-end steps from its
acceptance criteria, from the user's first action to the goal holding. For an
epic with no user-facing flow, the steps are the ordered outcomes that complete
it. Every acceptance criterion belongs to a step; criteria outside the user
path, such as docs or migration, are steps after it. Record the journey at the
top of the ledger with each step's state, tickets and criteria. It orders
approved scope and adds none.

Complete the thinnest end-to-end path first, then widen it, unless the operator
has set another order. Each implementation dispatch names the journey step it
moves and the tickets its delivery closes. A delivery that leaves its ticket
open records what remains and the workset that closes it. A second partial
delivery on one ticket without that closing workset triggers a re-plan of the
ticket before more work is dispatched against it.

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
2. **Refresh the base.** Use `origin/dev` unless the repository or operator names
   another target. In a clean checkout of that branch, pull fast-forward-only
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

Before every lane-facing prompt, ruling, acceptance or authorization, read
[Dispatching](references/dispatching.md) for the dispatch file and complete
paste-ready label/pointer pair. Reread after compaction or resume before the next
handoff. The file, label and pointer use the ledger's same canonical lane name;
a saved file or prose recap alone does not complete a handoff. Implementation
sessions go through the operator; helpers do not replace that handoff.

**Holds stop one step.** Missing authority, a dependency or unfinished review
holds only the step that consumes it. Name that step, its release owner and its
governing source. Advance independent authorized work. A later operator review
is a gate only when the operator says so. Resolve your own delivery gate, preserve
operator-reserved decisions, and do not infer merge authority or issue work whose
trigger has not fired.

## Completion review and delivery

Before accepting a delivery range, inspect its full diff and proposed new files
for local support tooling and its integration changes, not only the current
working tree. Return accidental inclusion to the lane to separate from delivery
while preserving the tools and evidence locally. Required verification still
runs; excluding its harness does not waive the evidence.

When the full agreed work set is verified and ready to ship, the lane uses
`trim-comments`, then `code-quality-review` over the trimmed range, plus
`test-quality-review` when production logic or tests changed and `contract-review`
when observable behavior, consumer contracts or cross-component wiring changed.
Give the behavior reviewer the accepted outcomes, approved design and exclusions,
range and revision, and verification evidence; follow its Dispatch line. Applicable
reviews run in parallel. Trim edits belong
in RANGE as `trim-comments`' *Who runs it* requires. Intermediate validation
reports and requests for rulings do not trigger review.

Alongside that round, attempt `scope-review` once through its Muse-only runner.
Include the original epic goal, the accepted lane increment and exclusions, and
the claimed versus verified journey. Record its report or `SKIPPED`; invocation
problems never trigger fallback, setup repair or a delivery hold. The parent
triages its advisory findings without requiring another Muse pass.

Retain the reviewed revision and the review record: finding IDs, dispositions,
reviewer confirmations, evidence for rejections and correction pass number.
Return findings to their owning reviewer under that discipline's follow-up
rules; preserve unaffected reviews' results. A pending required review or
unconfirmed blocking disposition holds delivery unless the operator explicitly
waives it or repository rules supersede the gate.

**You decide routine lane delivery authorization within the approved epic.**
Once independent acceptance and required pre-publication gates are satisfied,
authorize the lane to push its branch, open or update its PR, and monitor/fix CI.
A dispatch's "not yet authorized" or "await delivery authorization" is your
staged gate to release, not a request for another operator approval. Ask the
operator only when a governing instruction explicitly reserves that publication
decision or the action exceeds delegated scope or authority; identify that
source or boundary. Your own dispatch, ledger or recovery note cannot create
such a reservation. Merge decisions remain with the operator.

Issue the authorization file and copyable pointer now. Reference the active
contract, scope the tickets and range, and state which gates are satisfied with
evidence or still pending. Require the actual integration branch to be merged,
never rebased, affected checks/local gates to run, and `file-pr` to prepare the
PR and tend it to green and mergeable.

The lane chooses a title under repository conventions and `file-pr`. It may
resolve merge conflicts within settled contracts; a new scope, product, policy
or authority choice returns for a ruling. Conflict resolution that changes
behavior requires affected validation and review before delivery. Reuse still
valid review evidence instead of restarting a satisfied gate.

Present open encoding offers from `REVIEW` to the operator with authorization;
an approved offer returns to the lane as a correction. PR text describes the
change and its stakes, with ticket links in the repository's template fields;
omit lane names and process history. Verify terminal CI and delivery state
before calling the wave done. A watcher's promise or an opened PR is not a
completed delivery.

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
Use existing authority without asking the operator to repeat it.

Read current statuses and the available workflow states for both tickets and
the parent epic or project. Map the work's actual phase to those states:

- When work begins, move the active tickets and their epic to **In Progress**
  or the workflow's equivalent. Leave unstarted, queued tickets unchanged.
- Reflect review, blockers and resumed work as they occur. Keep an accurate
  review or blocked state instead of resetting every open item to In Progress.
  One blocked ticket does not block an epic whose other work can advance.
- Mark a ticket **Done** only after independent acceptance and required
  delivery are verified. A lane report, open PR or green CI alone is insufficient.
  Close the epic only after its closure gates and the operator's decision.

Apply only needed transitions to operator-owned items, then read back the result.
On recovery, repair stale statuses against verified work; preserve accurate
terminal states unless the work has been explicitly reopened within scope.
If the tracker, write authority or a suitable state is unavailable, or an update
fails, record the intended transition, reason and responsible owner as pending
in the ledger. Continue independent authorized work and retry when the blocker
clears; report confirmed tracker state separately from intended state.

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

Before an owner return, read [Owner returns](references/owner-returns.md) for its
ordered output and audit-closeout wording. Report progress, verified disposition
and Tracker sync, each required lane's complete file/label/pointer handoff, and
the immediate next authorized action or a named blocker and owner. Check that
every lane-facing disposition has its own populated handoff with the same
canonical name. Routine progress with no lane disposition can stay brief prose.

Keep audit-report acceptance, auditor-assignment completion and epic closure
separate. When no assigned audit work remains, explicitly release the auditor
with acknowledgment only. Only the operator closes the epic; accepting an audit
does not authorize fixes or close it.

## Closing the epic

Closure requires every journey step verified end to end, acceptance evidence,
regression checks for relevant fix
families, dispositioned findings, verified required delivery and a **blind audit**.
The auditor starts from the artifact, not PR history, probes declared epic
surfaces against approved criteria and attacks prior fixes. Require each fix
family's held/broken result with evidence, and each finding's repro and current
source anchor. An unreproduced finding stays uncorroborated or blocked; calling
it disproved requires contrary evidence. Successful-run-only corpora cannot
establish absence of failures.

Corroborate the audit's verdict-moving claims yourself. A HOLDS label does not
replace missing required evidence. When the conditions above are met, summarize
coverage, accepted limits and remaining dispositions, and propose closure to
the operator. Another round needs an unresolved finding, changed behavior or an
evidence gap; round count is not a closure criterion. Preserve the audit report
locally, publish a concise verdict under existing authority, and retire working
instructions only when their ledger obligations are satisfied.
