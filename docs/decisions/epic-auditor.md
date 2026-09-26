# Decision: a reporting skill for epic auditor lanes

**Date:** 2026-09-25
**Release:** workbench 0.44.0

## Problem

Auditor lanes do not consistently return the epic's standardized, copyable
handbacks. Implementation lanes have `epic-implementation`, whose trigger
explicitly excludes auditors. The owner defines audit evidence requirements
but gives auditors no equivalent reporting skill or shared template.

## Change

Add a small `epic-auditor` skill beside `epic-implementation`. It applies only to
auditor lanes dispatched through `epic-orchestration`, including follow-ups and
recovered sessions. The owner names the matching skill for each role and requires
`workbench:epic-auditor` in every auditor brief, amendment and continuation.

Both the owner and auditor link directly to the shared `audit-report.md`
reference. Audit reports use the same fenced handback convention and status
vocabulary as implementation reports, with fields for the audit verdict, pinned
artifact, coverage, fix families, findings, evidence gaps and next action.
Implementation-only fields such as completion review and PR delivery do not
belong in an audit report. The auditor does not need to load the owner skill.

The dispatch still owns scope and authority. The auditor inspects the artifact
without PR history, reports evidence and limits, and returns findings for owner
corroboration. This reporting contract grants no implementation, publication or
epic closure authority.

## Validation

A fresh baseline scenario used the existing audit instructions and supplied
evidence for a resumed audit with a blocked legacy-input check. The auditor
correctly preserved uncertainty but returned prose beginning "Audit audit-r2
remains incomplete" and bullets, without a fenced report. This is an output
shape failure, so the correction supplies a positive report contract.

With the new skill, that recovery scenario returned the complete fenced report
and an `INCONCLUSIVE` verdict. Two further auditor cases covered `HOLDS` with
owner validation still required, and reproduced findings alongside missing
coverage and an excluded finding. A standalone-audit case correctly declined
the lane-only skill. Three owner cases required `epic-auditor` for an initial
audit and a resumed audit amendment, while retaining `epic-implementation` for
an implementation correction. Auditor continuation retained valid evidence
and returned the complete report under its active contract.

These seven cases are instruction-consumption checks using supplied evidence,
not live audit execution or a reliability estimate.

Native plugin validation, skill validation, changed Markdown link checks,
the local leak scan and whitespace checks passed.

## Explicit audit acceptance and assignment completion (2026-09-26)

The operator reported that the owner's validation and closeout language did
not make clear what was done. The owner already distinguished audit evidence
from epic closure, but did not require a separate disposition for the auditor's
assignment. The auditor's unconditional final-report rule also had no way to
acknowledge a completed assignment without another validation handback.

Owner audit returns now state report acceptance, the auditor's remaining action
or assignment completion, and epic closure state separately. A completed audit
assignment can finish while fixes or the operator's closure decision remain.
An explicit owner closeout for the matching contract and artifact gets a short
auditor acknowledgment that preserves the existing report and verdict. Audit
work still uses the complete report; closeout does not authorize another audit,
change its evidence or close the epic.

The baseline owner scenario already produced a clear acceptance and stand-down
notice. The baseline auditor nevertheless replied with `STATUS: ready-for-validation`
after saying "Owner validation is complete and HOLDS is accepted." That
contradiction reproduced the unnecessary validation handback.

Six revised instruction-consumption cases covered owner acceptance, an unrun
required check, auditor acknowledgment, accepted findings with implementation
still pending, a blocked audit follow-up, and a closeout for the wrong revision.
All retained the applicable evidence and authority boundaries. These are small
scenario checks, including a reused-context follow-up, not live epic execution
or a reliability estimate. Native plugin validation, changed Markdown links,
the local leak scan and whitespace checks passed.
