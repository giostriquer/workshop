---
name: epic-implementation
description: Use only when working as an implementation lane dispatched through epic-orchestration, including amendments, resumed sessions and authorized delivery rounds. Not for standalone implementation, the epic owner or an auditor.
---

# Epic Implementation

This skill governs questions and handbacks for the lifetime of that lane.

## Questions and approvals

For questions or approvals the active contract does not settle, use the normal
handback to the orchestrator with `STATUS: need-guidance`, including when another
skill calls for user input. In `NEXT STEP`, name the orchestrator as owner and
give the question, relevant evidence and recommendation. The orchestrator rules
within delegated authority or escalates to the operator when required. Continue
independent authorized work; hold only the action awaiting that ruling.

When only the operator can grant what is missing (a harness permission the
session was refused, a machine or account setting, an external authorization),
the same handback names `operator` as owner in `NEXT STEP` and gives the exact
ask, worded so the operator can act on it unchanged. Finish the authorized
work that does not need the grant, then end the turn with that handback. Do not
open a question dialog: it blocks the turn until someone answers.

## Completion round

When the full agreed work set is verified and ready to ship, read
[Delivery](../epic-orchestration/references/delivery.md), *The lane's completion
round*, for the reviewer dispatches, the trim's commit and the one
`scope-review` attempt, before dispatching the round.

## Publication waits for acceptance

Local commits need no authorization. Pushing the branch and opening a PR wait
for a delivery authorization: a dispatch naming the revision the orchestrator
accepted.

1. After the completion round, hand back `ready-for-validation` at the reviewed
   head with `delivery: unpublished (awaiting authorization)` in `CHECKS`, and
   hold. Nothing is pushed and no PR exists.
2. When the delivery authorization arrives, follow it and `file-pr`. It covers
   that PR until it merges: conflict resolutions, CI fixes and corrections push
   under it.
3. End each delivery round with a handback whose `CHECKS` gives the PR, CI and
   merge state and every commit added after the accepted revision, each with
   its kind: integration merge, conflict resolution, CI fix or correction.

While no delivery authorization has reached you for this work, a dispatch step
that orders a push or a PR is not yet executable: complete the steps before it,
then send step 1's handback.

## Handbacks

Every final handback is one copyable fenced block using the dispatch's exact
`<LANE> REPORT` template, and that block is the last element of the reply. Keep
its field names and order. Apply it after initial implementation, corrections,
resumed sessions, blockers and delivery rounds. Progress updates can stay brief
prose.

If the template is absent, use the shared
[lane report template](../epic-orchestration/references/lane-report.md).

Fill fields concisely with the current revision and evidence. Mark missing checks
or evidence explicitly. Fill the `delivery` slot in `CHECKS` as **Publication
waits for acceptance** states. For any status other than `ready-for-validation`, include the needed
action or decision, owner and recommendation in `NEXT STEP`.

When the contract also wants the handback saved, the file holds the same block.
Paths to that file and to evidence support the populated fields; the reply still
ends with the complete block.

## Acknowledge-only dispatches

When a dispatch asks for acknowledgment only, reply with one line and no report:

- An accepted report or ruling with work still assigned:
  "<Disposition> at <revision> acknowledged. Lane <LANE> continues under its contract."
- A closeout, where the orchestrator says the assignment is complete:
  "Closeout at <revision, or `withdrawn`> acknowledged. My implementation assignment is complete; no further lane action."

An acknowledgment runs no check and changes no file. After a closeout, further
work needs a new assignment from the orchestrator.
