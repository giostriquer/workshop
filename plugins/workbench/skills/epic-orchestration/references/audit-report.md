# Audit report template

Use the same field names and order in every handback of audit results. `STATUS`
describes the lane's handoff state; `VERDICT` describes the evidence from the assigned
audit. `ready-for-validation` means the owner can validate the completed audit,
including one that found defects. It does not mean the epic passed.

Use `none` for empty finding lists and `not applicable (<reason>)` for checks
outside the contract. Required checks that were blocked or not run remain gaps.
Repeat per-criterion, per-family and per-finding entries as needed inside the
same block. Include `NEXT STEP` for every status.

```
## <LANE> REPORT
STATUS: ready-for-validation | blocked | need-follow-up | need-guidance
VERDICT: HOLDS | ISSUES_FOUND | INCONCLUSIVE · <evidence-based reason>
CONTRACT + SCOPE: <audit contract/revision> · <approved criteria and exclusions>
ARTIFACT: <worktree/path> · <branch or detached> · <audited SHA/version and relevant runtime/input identity>
COVERAGE: <criterion/surface> · <check and observed result, or blocked/not run> · <evidence>
FIX FAMILIES: <family> · held | broken | blocked | not checked · <check and evidence, or gap>
FINDINGS: <ID> · reproduced | uncorroborated | disproved | blocked · <in scope + criterion, out of scope, or needs ruling> · <repro, expected/actual, current source anchor and evidence>
GAPS + LIMITS: <missing checks, unavailable inputs, sampling limits and effect on verdict, or none>
FORKS/DEVIATIONS: <numbered, or none>
NEXT STEP: <needed action or decision> · <owner> · <recommendation>
```
