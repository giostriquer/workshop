# epic-implementation

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

No. The dispatch and its amendments govern scope, method and authority. This
skill carries the reporting contract through the lane's lifetime.

**Where is the template?**

In the lane dispatch. Both skills share one
[lane report template](../../plugins/workbench/skills/epic-orchestration/references/lane-report.md).
If the dispatch omits it, the lane reads that reference directly.

**Can the lane just link its report file?**

The reply contains the populated report fields. Evidence links support those
fields. Missing evidence is stated explicitly; delivery state goes in `CHECKS`.
For `blocked`, `need-follow-up` and `need-guidance`, `NEXT STEP` names the needed
action or decision, owner and recommendation. Omit it for `ready-for-validation`.

## It's working if

The operator can paste each complete handback directly to the coordinator,
with the same fields after multiple rounds and no need to open another file
to discover the current state.
