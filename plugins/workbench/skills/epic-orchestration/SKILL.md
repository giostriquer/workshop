---
name: epic-orchestration
description: Use when running a multi-ticket epic whose implementation you delegate to other sessions the operator dispatches by hand, and when closing such an epic on a blind re-audit rather than an empty ticket list. This session owns the epic and never implements, commits, or opens the PR itself. Not for implementing a change yourself, and not for a single ticket.
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
| **Orchestrator** (you) | tickets, dispatches, independent validation, rulings, authorization | Never implements, commits, pushes, opens PRs or merges. |
| **Implementer lane** | one worktree, implementation, completion review and report | Publishes only under delivery authorization. |
| **Auditor** | blind empirical audit of the artifact, findings with repro and source anchor | Does not read the PR list or implement fixes. |
| **Operator** | lane dispatch, merges, product decisions and epic closure | Grants scope and authority. |

## When this is the right seat

Use this for an epic too large for one session, with implementation in other
sessions dispatched by hand. For one goal use `handoff-goal`; for one premise or
ticket use `claim-check`; for broad verification use `qa-sweep`; for one finished
change at a running artifact use `empirical-proof`. To implement yourself, have
the operator recast the role first.

You may use subagents for bounded support when saved context or time justifies
the overhead. Helpers inherit the assigned workset's scope and your role
boundaries; you retain synthesis and decisions. Reuse helpers for related work.
Use the inherited model, or a smaller model in the same harness only for trivial,
mechanical work with cheaply verifiable results. Evidence assessment and lane
acceptance are not trivial. Work owned by another skill follows its routing.

## The loop

Establish scope → refresh and revalidate → dispatch ready lanes → independently
validate reports → correct or authorize delivery → verify delivery → blind
audit → resolve findings or propose closure to the operator.

## Revalidate before delegation

Before a new implementation workset, reopened work or scope-changing amendment:

1. **Establish membership.** Read the operator-approved objective, acceptance
   criteria, exclusions and explicit amendments from the ledger's governing
   sources. Bind each assignment to the criterion it serves and why it is
   necessary. Owner-written tickets, dispatches, reports and summaries cannot
   grant scope. Conditional criteria stay conditional; permission to use a
   resource does not add a deliverable. Missing or conflicting authority holds
   the affected assignment until its source or the operator's ruling resolves it.
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

A lane report and its completion review do not replace owner acceptance. Inspect
the reported base/head, diff and relevant evidence, then choose checks that can
confirm or refute consequential claims against the acceptance criteria. Record
what you independently verified, what remains reported and what is unverified.

Match evidence to the claim:

- **Regression fix:** establish sensitivity to the intended defect using the old
  implementation or a controlled mutation, then confirm the fixed behavior.
  Preserve tests and expectations. A missing import, dependency or setup failure
  is not valid RED. Reverting the entire production diff is useful only when it
  recreates the defect without breaking the test setup.
- **Behavior preservation:** use equivalence, characterization and affected
  consumer checks. Correct baseline behavior may remain green; do not invent a
  regression or a failing test for it.
- **New behavior or interfaces:** exercise the required observable contract and
  relevant boundaries. **Docs or configuration:** check the actual consumers,
  examples or constraints affected. Apply repository and owning-skill gates.
- **Gates and infrastructure:** inspect the design and exercise what it accepts
  and rejects, including legitimate work the fix might now refuse.
- **Artifact acceptance or derived authority:** use output from the actual
  producer, including disposable copies of saved versions covered by
  compatibility requirements.
  Distinguish expected refusals from crashes and verify recovery is available.
  A handwritten fixture alone does not prove the product supplies the input.

Investigate source-anchor mismatches; a fix elsewhere may leave another live
instance. Enforce applicable diff rules, including bans on comments or skipped
tests. Independently reproduce findings that would change a decision, reverse a
prior fix or establish a regression. Unavailable evidence remains a named gap.

Use explicit worktree directories for every command. Run mutation or revert
probes only in disposable validation checkouts after checking the resolved path.
Preserve the lane's staged, unstaged and untracked work, tests and fixtures; stop
probe processes and restore or discard only probe-owned state. Never broadly
restore the implementer's checkout. Keep injected defects and probe artifacts
out of delivery.

Use focused local checks and mandatory local gates. Completion evidence covers
affected test files and identified shared consumers, not only an iteration's
name filter. Full suites normally run in PR CI; broader local checks require an
explicit repository/user gate or a named unresolved integration risk. Choose
the smallest check that addresses it and disclose unavailable coverage.

## Write the lane contract

Group lanes by file ownership so concurrent work does not compete over a shared
contract. Name affected producers, fixture builders and consumer checks for
shared-interface changes. Parallel lanes must have neither conflicting file
ownership nor unmet producer/consumer dependencies; record readiness conditions.
Coordinate an ownership overlap before concurrent edits and record the agreement
under `FORKS/DEVIATIONS`. Coordination cannot override epic exclusions.

The initial dispatch is a complete brief that works without tracker access:

- **Scope:** governing epic source and amendments, assigned criteria, ticket
  objectives and source anchors, finish line, exclusions, and decisions the
  lane can make or must return.
- **Setup:** validated integration ref/SHA, worktree and branch, repository setup
  and toolchain, applicable repository rules and existing publication authority.
- **Inputs:** contract revision and smallest complete reading set, including
  exact required sections. Separate supporting evidence from startup reading;
  state which checks need it. Resolve conflicting contracts before dispatch.
- **Outcomes and evidence:** affected contracts, required behavior and checks,
  compatibility obligations and handback evidence. Let the lane choose design,
  sequencing and test techniques within repository and owning-skill rules.
- **Coordination and handback:** other lanes' ownership/dependencies, required
  completion gates, and `workbench:epic-implementation` for the complete
  [lane report](references/lane-report.md).

Name required skills by host name, task inputs, outcome and evidence. Do not
copy their procedures or model routing, pin plugin versions/cache paths, or add
method mandates unrelated to this work. Link the shared report template or
include it once in the initial contract; every final handback must still contain
the populated copyable report.

**Amendments carry deltas.** Reference the active contract and revision, state
what changes, its scope basis, refreshed base/evidence where required, and any
changed gates or authority. Retain unchanged terms by reference instead of
repeating setup, standing rules, review instructions and the report template.
Name `workbench:epic-implementation` in each amendment and delivery authorization.
For a recovered session, make the current contract and amendments directly
readable; reconcile conflicting revisions before continuing.

## Dispatching

Write each ready lane prompt, amendment, audit brief or authorization to its own
file in the epic's scope folder, indexed by the ledger. Do not issue work whose
trigger has not fired. Every handed-over file is executable now.

Provide one paste-ready pointer per destination:

```
Paste this into <LANE>:

<Role, what is authorized, fresh or existing session>. Read and execute:
<absolute dispatch path>
<lines governing instructions require verbatim, if any>
```

The pointer contains no repeated brief. Put operator decisions outside it.
Implementation sessions still go through the operator; helpers do not replace
that handoff.

## Completion review and delivery

When the full agreed work set is verified and ready to ship, the lane uses
`trim-comments`, then `code-quality-review` over the trimmed range, plus
`test-quality-review` when production logic or tests changed. Trim edits belong
in RANGE as `trim-comments`' *Who runs it* requires. Intermediate validation
reports and requests for rulings do not trigger review.

Retain the reviewed revision and the review record: finding IDs, dispositions,
reviewer confirmations, evidence for rejections and correction pass number.
Use `code-quality-review`'s correction rules; focused follow-ups run within the
lane until review stops converging. Review completed correction batches before
resuming delivery. A pending required review or unconfirmed blocking disposition
holds delivery unless the operator explicitly waives it or repository rules
supersede the gate.

Authorize delivery only within existing operator authority. The authorization
references the active contract, scopes the tickets and range, and states which
gates are satisfied with evidence or still pending. Require the actual
integration branch to be merged, never rebased, affected checks/local gates to
run, and `file-pr` to prepare the PR and tend it to green and mergeable.

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

- **Corrections:** return confirmed in-scope defects to the owning lane. Routine
  fixes within its contract proceed there. If review stops converging under
  `code-quality-review`, record the next-step decision and reason, then dispatch
  it. Unless that decision ends review, lane follow-ups resume autonomously.
  Keep unresolved delivery holds visible.
- **Mutation evidence:** the test reviewer bounds its own run. Partial runs or
  timeouts are not findings. Return requests to waive, scope or diagnose them
  to the lane under that rubric; only repository rules or the operator remove
  a run. This does not waive required sensitivity evidence for regression claims.
- **External findings:** technical validity and reachability do not establish
  epic membership. Route unrelated findings to separate follow-ups under
  existing write authority. If an external defect blocks an epic criterion,
  record the criterion, evidence, external owner and unblock; advance independent
  work. Do not absorb its repair or waive the criterion. Scope expansion needs
  an explicit operator amendment.
- **Unsettled decisions:** resolve coordination within your authority; recommend
  product/policy choices and let the operator rule. Record the operative
  decision and source. A fix that refuses required legitimate work is itself
  an in-scope defect, not a reason to narrow acceptance silently.

## Keep a local epic ledger

Reuse the epic scope folder's README or CURRENT entry point; otherwise create
`LEDGER.md`. Other indexes point there. This is disposable working state under
`using-workbench`, not a second tracker or committed documentation layer.

Keep the approved goal, closure bar, exclusions and scope sources distinct from
discovered follow-ups. Track active lanes and contract revisions, worktrees,
dependencies, holds, decisions and their sources, owners and next actions.
Index briefs, evidence, recovery material and the tracker backlog; governing
scope sources determine membership.
Distinguish reported claims from verified results and bind evidence to revisions.

Start from the ledger and load sources needed for the next decision. Refresh
volatile facts before relying on them. After meaningful handbacks, rulings or
state changes, replace affected entries in place. Before compaction or handoff,
ensure a successor can recover the next action, authority, constraints and
proof without the conversation. Keep detailed reports beside the ledger instead
of copying them into a growing session history.

Confirmed in-scope work needing separate assignment gets a deduplicated ticket
under existing write authority. Never modify tickets the operator does not own;
reference them as context. Active-lane corrections remain in that contract.
Uncorroborated, disproved or scoped-out claims retain evidence and disposition.
Before wave closeout, give every finding and debt item a destination or explicit
disposition. Close fixed tickets with the fixing PR and resulting behavior.

Shared tracker updates carry what readers need: objective, behavioral bar,
owner, dependencies, delivery and a concise evidence summary. Local recovery
alone does not authorize publication; references must work for their readers.
Without write authority, retain the item locally with an owner and pending action.

Retain active contracts; accepted revisions and validation/review evidence while
delivery is pending; and final evidence, limits and durable follow-ups after
closure. Retire superseded instructions from startup only when active lanes,
dependent consumers and held delivery no longer need them. Preserve stable
references, frozen audit inputs and required recovery material. Retirement grants
no ticket, worktree, publication or deletion authority. Archive or delete only
under applicable retention and cleanup authority; epic closure is not a cleanup
request.

## Close every handoff with a next step

State verified results, revision and remaining gates. Distinguish validation,
PR readiness, merge and epic completion. Give a concrete immediate next action:
continue authorized work or dispatch a revalidated workset; advance pending
delivery; issue the closing audit; propose closure; or name a blocker, owner and
unblock while advancing independent work. Do not ask the operator to select a
routine next lane already determined by the plan.

## Closing the epic

Closure requires acceptance evidence, regression checks for relevant fix
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
