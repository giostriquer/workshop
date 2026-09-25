# Lane report template

Use `not applicable (<reason>)` for checks that do not apply. In particular,
behavior-preserving work may have passing characterization evidence without
regression RED; a claimed regression fix still needs defect-sensitivity evidence.
Keep applicable checks that were not run distinct from checks that do not apply.

```
## <LANE> REPORT
STATUS: ready-for-validation | blocked | need-follow-up | need-guidance
WORKTREE + BRANCH + RANGE: <path> · <branch> · <base>..<head>
PER TICKET: <ID> · <change in one sentence> · red: <defect-sensitivity evidence, or not applicable + reason> · green: <results>
CHECKS: <suite> <n>/<n> · typecheck · lint · format
REVIEW: trim: DONE (<its comment-only commit, inside RANGE per trim-comments' Who runs it>) | NOTHING_TO_TRIM | BLOCKED | not run (<why>), encoding offers: <each, or none> · code: <n blocking / n advisory, one-line disposition each> · tests: PASS | ISSUES_FOUND (<n>, one-line disposition each) | not required · Mutation run: <line>
REVIEW CLOSURE: <reviewed revision> · <reviewer-confirmed finding IDs/dispositions + evidence> · follow-up passes: <n> · hold: <none, or the convergence condition that stopped review>
FORKS/DEVIATIONS: <numbered, or "none">
DEBT + FOLLOW-UPS: <numbered: what, anchor, why not now, or "none">
NEXT STEP (unless ready-for-validation): <needed action or decision, owner, recommendation>
```
