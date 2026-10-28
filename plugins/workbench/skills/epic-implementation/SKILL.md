---
name: epic-implementation
description: Use only when working as an implementation lane dispatched through epic-orchestration, including amendments, resumed sessions and authorized delivery rounds. Not for standalone implementation, the epic owner or an auditor.
---

# Epic Implementation

This skill governs questions and handbacks for the lifetime of that lane.

For questions or approvals the active contract does not settle, use the normal
handback to the orchestrator with `STATUS: need-guidance`, including when another
skill calls for user input. In `NEXT STEP`, name the orchestrator as owner and
give the question, relevant evidence and recommendation. The orchestrator rules
within delegated authority or escalates to the operator when required. Continue
independent authorized work; hold only the action awaiting that ruling.

Every final handback is one copyable fenced block using the dispatch's exact
`<LANE> REPORT` template. Keep its field names and order. Apply it after initial
implementation, corrections, resumed sessions, blockers and delivery rounds.
Progress updates can stay brief prose.

If the template is absent, use the shared
[lane report template](../epic-orchestration/references/lane-report.md).

Fill fields concisely with the current revision and evidence. Mark missing checks
or evidence explicitly. For delivery, include the PR, CI and merge state in
`CHECKS`. For any status other than `ready-for-validation`, include the needed
action or decision, owner and recommendation in `NEXT STEP`.
Evidence-file pointers support the populated fields; the reply
itself contains the complete handback.
