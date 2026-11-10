# Bounded correction review

## Independent confirmation closes blocking findings (2026-09-18)

The original one-review rule let authors close blockers with their own fixes and
passing tests. Repeating broad reviews encouraged unrelated scope growth. Use
one initial review followed by focused verification by the reviewer that owns
each finding. Return fixes and evidence-based rejections with revisions and
supporting checks; passing tests alone do not close a blocker.

Follow-ups inspect open blockers, the correction delta, and affected callers or
contracts. Outside findings are follow-ups unless they prove the change unsafe
or incorrect as shipped. A broader invalidation requires review of the affected
scope, not a reset of the review record.

## Completion boundary clarified, 2026-09-19

The gate runs when the full agreed work is implemented, verified, and ready for
delivery. Intermediate edits, checkpoints, and validation handbacks do not
trigger it. A completed review reopens for material new scope or redesign that
invalidates its conclusions, not merely another edit or commit. Explicit user
waivers and superseding repository processes retain precedence.

## Convergence replaces the follow-up pass count (2026-09-24)

A two-pass cap stopped routine verified corrections while failing to identify
review churn. Follow-ups now run automatically while converging. Each discipline
holds delivery and asks its owning authority for the next step when:

- A pass sent open blockers closes or narrows none of them.
- An evidence-based rejection returns without new evidence.
- Two consecutive follow-ups each raise a new blocker and finish with at least
  as many blockers as they received. Narrowing-only passes neither count toward
  nor break that sequence.

Narrowing is progress; one caught regression is not a convergence failure.
A pass sent no open blockers does not fail the first condition. Once all
blockers are confirmed closed, the loop ends. After a hold, the authority's
next-step decision restarts automatic passes and the churn count unless it ends
review; corrections made while held wait for that decision.

A hold is never PASS. The epic owner rules for its lanes, while a standalone
implementer asks the user. Only reviewer confirmation or an explicit user
waiver closes a blocker; a handoff or new reviewer preserves the record.
Number passes for traceability, not as a limit. Historical scenario probes
covered routine third passes, no-progress holds, churn, and restart behavior;
they were bounded regression checks, not reliability estimates.

## CI repairs do not reopen completed review (2026-09-25)

Once review has completed, `fix-ci` owns bounded repairs: focused verification,
authorized push, and a new watch. A repair alone does not restart code review,
test review, or mutation. Open reviewer findings remain open, and integration
or redesign that invalidates prior coverage gets affected review. New scope or
an unresolved design needs a decision under the ordinary ownership rules.

## Discipline ownership (2026-09-25)

Code, test, and behavior/contract review each own their rules, findings, convergence decisions and
pass records. Delivery callers combine their verdicts; neither discipline
loads or dispatches the other. See
[independent stages](completion-review-stages.md#independent-disciplines-2026-09-25).
Since 2026-11-09 each review skill carries the reviewer's half of the
correction loop and `receiving-code-review` carries the dispatching session's
half, as the next section records.

## The dispatching session's half moves to receiving-code-review (2026-11-09)

A transcript audit of 2026-11-02 to 2026-11-09 covered 438 Claude Code reviewer
threads and 159 Codex subagent threads. Over 30 days, Claude Code main sessions
loaded `trim-comments` in 1 of 216 uses, `code-quality-review` in 1 of 155,
`test-quality-review` in 1 of 153 and `contract-review` in 1 of 137: the
reviewer loads its rubric, and the session that dispatches it sees only the
agent's frontmatter description. The same sessions loaded
`receiving-code-review` in 49 of 49 uses. Every rule the review skills
addressed to the dispatcher (what to return, when to submit again, when to
hold) was therefore unread where it applied, and 6 of 26 sessions that received
`ISSUES_FOUND` never loaded `receiving-code-review` either, whose text framed it
as a stage after landing.

`receiving-code-review` now owns acting on completion-review findings before
landing as well as feedback after it, and holds the dispatching session's
half: read the verdict line, correct as one verified batch, return it once to
the reviewer that raised it in a fixed follow-up message, hold when review
stops converging, and act on the test-quality report lines that need the
session. "One item at a time" now means each fix gets its own focused check;
the batch goes back once. Each review skill keeps the reviewer's half and one
pointer. The reviewer still names a convergence hold in its report, so a
session that has not loaded the receiving skill still sees it.

## A passed reviewer sees a later delta only when its ground changes (2026-11-09)

The stop rule read "all blocking dispositions are confirmed and the current
revision is covered", beside "a new SHA alone does not reopen it". Sessions
read the first as "every reviewer must have seen HEAD". Follow-up rounds sent
after that reviewer had already returned `PASS` were 123 of 208 for code
quality, 91 of 154 for contract and 43 of 165 for test quality, about fifteen
hours of reviewer time, and 28 of those 257 rounds returned a new blocker. A
hand-read sample of 34 was about 45% confirmations of applied advisory
findings, 30% another discipline's correction delta and 15% new work sets.
Test quality, the one rubric without the "revision is covered" clause, had the
lowest share.

The clause is gone. A reviewer that passed gets a later delta only when the
delta changes that discipline's ground: production logic or tests for test
quality; observable behavior, a consumer contract or cross-component wiring for
contract; structure outside the lines its findings named (a file, function,
type or module added, moved or renamed, a changed signature, or new control
flow) for code quality. Applied advisory findings are recorded and never
resubmitted. The dispatcher's table is in `receiving-code-review`; each rubric
tells its reviewer to answer a delta outside its ground in one line, so a
dispatch that ignores the table costs one short reply. The 28 late blockers
are the cost side of this rule: the predicates were chosen to keep the deltas
that plausibly produced them, and that has not been measured. One scenario probe covered
the dispatcher's routing: with code quality and contract passed, a test-only
correction and an applied code-quality advisory went to the test-quality
reviewer in one follow-up, and to neither reviewer that had passed. Each scenario ran once, in a fresh context on Opus 5.5, before the last round of review corrections: regression evidence for that scenario, not a reliability estimate.

## Corrections from the independent review of the 2026-11-09 change (2026-11-09)

A review of that change found paths it had opened. An applied advisory finding
and a rebase that resolved conflicts were declared to change no reviewer's
ground, though either can change production logic; they are now deltas for
every reviewer except the one that raised the advisory. The fixed follow-up
message had no slot for an uncovered mutation scope, forwarded mutation
results, a waiver or a hold decision, which the same section required; it now
has one optional line for each. Three rules had dropped out without a record
and are restored: a delta the user explicitly asks a reviewer to see is
reviewed whatever its ground, a replacement for a reviewer that never returned
gets the same unchanged submission, and the authority's decision on a hold is
recorded. `file-pr` still described the old dispatch inputs and now points at
the lines each agent's description names.
