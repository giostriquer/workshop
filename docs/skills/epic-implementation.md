# epic-implementation

[Canonical skill](../../plugins/workbench/skills/epic-implementation/SKILL.md)

## What it does

Keeps an implementation lane's final handbacks in the exact report format
provided by [epic-orchestration](epic-orchestration.md). Each reply contains one
copyable report block, including after amendments, session recovery, blockers
and authorized delivery. Progress updates can remain brief prose.

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

The reply contains the populated report fields. Evidence links support those
fields. Missing checks or evidence are marked explicitly; delivery state (PR,
CI and merge) goes in `CHECKS`. `REVIEW` and `REVIEW CLOSURE` retain separate
code, test, and behavior/contract verdicts when applicable.
For `blocked`, `need-follow-up` and `need-guidance`, `NEXT STEP` names the needed
action or decision, owner and recommendation. Omit it for `ready-for-validation`.

## It's working if

The operator can paste each complete handback directly to the coordinator,
with the same fields after multiple rounds and no need to open another file
to discover the current state.
