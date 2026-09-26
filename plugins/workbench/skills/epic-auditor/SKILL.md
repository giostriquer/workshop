---
name: epic-auditor
description: Use only when working as an auditor lane dispatched through epic-orchestration, including audit follow-ups, amendments and resumed sessions. Not for the epic owner, implementation lanes or standalone audits.
---

# Epic Auditor

This skill governs audit handbacks for the lifetime of that lane. The dispatch
and its amendments define scope, criteria, artifact revision and authority.
Audit the artifact against those criteria without reading PR history or
implementing fixes. Return findings to the owner for corroboration and routing;
the operator decides epic closure.

Every final handback is one copyable fenced block using the dispatch's exact
audit report template. Keep its field names and order after initial audits,
follow-ups, amendments, recovery and blockers. Progress updates can stay brief
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

Always name the next action, owner and recommendation in `NEXT STEP`, including
owner validation after `HOLDS`. Evidence-file pointers support populated fields;
the reply itself contains the complete handback.
