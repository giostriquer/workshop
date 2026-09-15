# Decision: a small reporting skill for epic implementation lanes

**Date:** 2026-09-15
**Release:** workbench 0.38.0

## Problem

After repeated amendments, implementation lanes return prose summaries and a
report-file pointer instead of the coordinator's report fields. The operator
needs a complete, paste-ready handback on each round. The existing report
contract already covers the information; its application drifts over time.

## Change

Add `epic-implementation` in the existing Workbench skills directory. It applies
only to implementation lanes dispatched through `epic-orchestration`, including
corrections, resumed sessions and authorized delivery. Each implementation
dispatch names it. The canonical report template lives in the shared
`epic-orchestration/references/lane-report.md` file. The coordinator includes its
block in the dispatch; the lane reads that reference if the dispatch omits it.
Both skills link directly to the reference, so retrieving the template does not
load the coordinator's instructions into the implementation lane.

The skill defines the final reply as one copyable report block, with current
evidence and explicit gaps. Detailed evidence can remain in linked local files.
Scope, implementation method and delivery authority come from the dispatch.
This adds no implementation workflow, coordinator role or publication authority.

The statuses `blocked`, `need-follow-up` and `need-guidance` share one conditional
`NEXT STEP` field naming the needed action or decision, owner and recommendation.
`ready-for-validation` omits that field. This replaces the blocked-only field so
each non-ready handback remains actionable.

## Validation

The operator's repeated-round example is the recorded failure. A fresh control
with the full existing orchestration skill retained the report fields but did
not use a copyable fenced block. This shows the existing template is useful;
the correction targets its persistence and presentation in lane handbacks.

Read-only scenario probes with the new skill produced complete report blocks
for blocked CI, a resumed amendment with missing evidence, and merged delivery.
The standalone task did not activate it. A coordinator probe named the skill
in both a correction amendment and a delivery authorization while retaining
their distinct authority. These are focused regression checks, not a measure
of reliability over long sessions.

Native plugin validation, skill validation, local reference checks and
`git diff --check` passed. Shared-reference links use file paths without heading
fragments.

A focused output probe covered all four statuses: `ready-for-validation` omitted
`NEXT STEP`; blocked, follow-up and guidance reports named the required action or
decision, owner and recommendation.
