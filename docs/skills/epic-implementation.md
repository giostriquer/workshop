# epic-implementation

[Canonical skill](../../plugins/workbench/skills/epic-implementation/SKILL.md)

## What it does

Keeps an implementation lane's final handbacks in the exact report format
provided by [epic-orchestration](epic-orchestration.md). Each final reply ends
with one copyable report block, including after amendments, session recovery,
blockers and authorized delivery. Progress updates can remain brief prose, and a
dispatch that asks only for acknowledgment gets one line.

## When to reach for it

Use it when executing an implementation dispatch from `epic-orchestration`.
The coordinator names `workbench:epic-implementation` in each implementation
dispatch, including corrections and delivery authorizations. It is not for
standalone implementation, the epic owner or a blind auditor.

## Common questions

**Does it add another implementation process?**

No. The dispatch and its amendments govern scope, outcomes and authority.
The lane chooses implementation and verification methods under repository rules
and the skills that own the work. This skill carries the reporting contract
through the lane's lifetime.

**Who answers a lane's questions?**

Questions or approvals unresolved by the active contract go to the orchestrator
in the normal `need-guidance` report, including when another skill calls for user
input. `NEXT STEP` names the orchestrator as owner and gives the question,
evidence and recommendation. The orchestrator rules within delegated authority
or escalates to the operator. Continue independent authorized work while the
dependent action awaits a ruling.

**What if only I can approve something?**

A permission the session was refused, a machine or account setting, or an
external authorization goes in the same `need-guidance` report, with `operator`
as the owner in `NEXT STEP` and the exact ask written so you can act on it
unchanged. The lane first finishes the authorized work that does not need the
grant, then ends its turn with that report. It does not open a question dialog,
which would stop the lane until someone answered it.

**Where is the template?**

The initial contract includes or links the shared
[lane report template](../../plugins/workbench/skills/epic-orchestration/references/lane-report.md).
Amendments reference the active contract without copying its template. If a
dispatch omits it, the lane reads that reference directly.

**Does every change need RED evidence?**

Regression fixes need evidence that a check detects the intended defect.
Behavior-preserving work may use passing characterization or equivalence checks;
mark RED `not applicable` with the reason. Applicable checks that were not run
remain explicit evidence gaps.

**Can the lane just link its report file?**

No. The reply ends with the populated report block. When the contract also
wants the handback saved, the file holds the same block, and a path to it
supports the reply without replacing it. Evidence links support the populated
fields. Missing checks or evidence are marked explicitly; delivery state (PR,
CI and merge) goes in `CHECKS`. `REVIEW` and `REVIEW CLOSURE` retain separate
code, test, and behavior/contract verdicts when applicable.
For `blocked`, `need-follow-up` and `need-guidance`, `NEXT STEP` names the needed
action or decision, owner and recommendation. Omit it for `ready-for-validation`.

**Does every dispatch need a full report back?**

No. When a dispatch asks for acknowledgment only, the lane replies with one
line and no report. For an accepted report or ruling with work still assigned:
"<Disposition> at <revision> acknowledged. Lane <LANE> continues under its
contract." For a closeout: "Closeout at <revision> acknowledged. My
implementation assignment is complete; no further lane action." Work after a
closeout needs a new assignment from the coordinator.

**What does the lane do at the completion round?**

It reads the coordinator skill's delivery reference for the reviewer
dispatches, the trim's commit and the one scope-review attempt, then runs the
round. The contract supplies the epic goal, the journey step and the trim's
commit subject.

**Where does the scope review go?**

In the `REVIEW` field's `scope` slot: `REVIEWED` with the lane's triage,
`SKIPPED` with the reason, or `not run` before the completion round.

## It's working if

The operator can paste each complete handback directly to the coordinator,
with the same fields after multiple rounds and no need to open another file
to discover the current state. Acknowledge-only dispatches come back as one
line, and an approval only you can give reaches you as an exact ask while the
lane keeps working.
