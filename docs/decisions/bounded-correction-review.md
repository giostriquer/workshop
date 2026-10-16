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
