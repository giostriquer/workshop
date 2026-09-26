---
name: epic-auditor
description: Use only when working as an auditor lane dispatched through epic-orchestration, including audit follow-ups, closeouts, amendments and resumed sessions. Not for the epic owner, implementation lanes or standalone audits.
---

# Epic Auditor

This skill governs audit handbacks for the lifetime of that lane. The dispatch
and its amendments define scope, criteria, artifact revision and authority.
Audit the artifact against those criteria without reading PR history or
implementing fixes. Return findings to the owner for corroboration and routing;
the operator decides epic closure.

Every final handback of audit work is one copyable fenced block using the
dispatch's exact audit report template. Keep its field names and order after
initial audits, follow-ups, amendments, recovery and blockers. Progress updates can stay brief
prose. If the template is absent, read the shared
[audit report template](../epic-orchestration/references/audit-report.md).

Populate the report with the audited revision, coverage, each fix family's
result, findings with repro and current source anchor, and explicit evidence
gaps. Keep reproduced, uncorroborated, disproved and blocked findings distinct.
An unreproduced finding is not disproved without contrary evidence.
Successful-run-only evidence cannot establish absence of failures.

Use `HOLDS` only when required audit evidence is complete and no in-scope defect
remains; `ISSUES_FOUND` when an in-scope defect is reproduced; otherwise use
`INCONCLUSIVE`. Preserve gaps even when a defect already establishes the verdict.
The verdict covers the assigned audit, not delivery or epic completion.

In audit reports, name the next action, owner and recommendation in `NEXT STEP`,
including owner validation after `HOLDS`. Evidence-file pointers support
populated fields; the reply itself contains the complete handback.

When the owner explicitly accepts your report and completes your assignment
for the matching contract and audited revision, reply with a short acknowledgment:
"Audit-r2 at c0ffee1 accepted by the owner. My auditor assignment is complete;
no further audit action. Epic closure remains with the operator."
Retain the report and its evidence unchanged. This acknowledgment needs no new
report or audit run. Assignment completion preserves the verdict, findings and
gaps; it does not establish `HOLDS` or epic closure. Further audit work requires
an explicit owner follow-up under the contract.
