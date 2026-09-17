# Lane report template

```
## <LANE> REPORT
STATUS: ready-for-validation | blocked | need-follow-up | need-guidance
WORKTREE + BRANCH + RANGE: <path> · <branch> · <base>..<head>
PER TICKET: <ID> · <fix in one sentence> · red: <n + test names> · green: <counts>
CHECKS: <suite> <n>/<n> · typecheck · lint · format
REVIEW: code: <n blocking / n advisory, one-line disposition each> · tests: PASS | ISSUES_FOUND (<n>, one-line disposition each) | not required · Mutation run: <line>
FORKS/DEVIATIONS: <numbered, or "none">
DEBT + FOLLOW-UPS: <numbered: what, anchor, why not now, or "none">
NEXT STEP (unless ready-for-validation): <needed action or decision, owner, recommendation>
```
