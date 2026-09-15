---
name: epic-implementation
description: Use only when working as an implementation lane dispatched through epic-orchestration, including amendments, resumed sessions and authorized delivery rounds. Not for standalone implementation, the epic owner or an auditor.
---

# Epic Implementation

This skill governs its handbacks for the lifetime of that lane.

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
