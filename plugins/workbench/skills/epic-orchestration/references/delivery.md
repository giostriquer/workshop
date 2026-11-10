## Completion review and delivery

**Inspect the range.** Before accepting a delivery range, inspect its full diff
and proposed new files for local support tooling and its integration changes,
not only the current working tree. Return accidental inclusion to the lane to
separate from delivery while preserving the tools and evidence locally. Required
verification still runs; excluding its harness does not waive the evidence.

**The lane's completion round.** The lane uses `trim-comments`, then
`code-quality-review` over the trimmed range, plus `test-quality-review` when
production logic or tests changed and `contract-review` when observable
behavior, consumer contracts or cross-component wiring changed. Applicable
reviews run in parallel. Dispatch each reviewer with the labelled lines its
description names. The trim's dispatch carries `Commit subject:`, so the
trimmer's comment-only commit lands in RANGE.

The lane, not the owner, attempts `scope-review`, once, through that skill's
Muse-only invocation directions for the current host. It supplies the epic goal
and journey step from its dispatch, the accepted increment and exclusions, and
what it claims against what it verified. It records `REVIEWED` with its triage,
or `SKIPPED` with the reason, in the report's `REVIEW` scope slot, and triages
advisory findings without another Muse pass. Invocation problems never trigger
fallback, setup repair or a delivery hold.

The round ends with a `ready-for-validation` handback at the reviewed head. The
lane has pushed nothing and opened no PR, its `CHECKS` field reads
`delivery: unpublished`, and it holds there until the authorization arrives.

**The review record.** Retain the reviewed revision and the review record:
finding IDs, dispositions, reviewer confirmations, evidence for rejections and
correction pass number. Return findings to their owning reviewer under the
**Completion-review findings** section of `receiving-code-review`; preserve
unaffected reviews' results.

**The authorization.** Write it after you accepted an unpublished handback, and
name that accepted revision in it. A correction moves the head, so the corrected
head is validated before any authorization names it. Reference the active
contract, scope the tickets and range, and state which gates are satisfied with
evidence or still pending. Require the actual integration branch to be merged,
never rebased, affected checks/local gates to run, and `file-pr` to prepare the
PR and tend it to green and mergeable. The authorization covers that PR until it
merges: conflict resolutions, CI fixes and corrections push under it. Require
the delivery handback to list every commit added after the accepted revision.

**The lane's latitude.** The lane chooses a title under repository conventions
and `file-pr`. It may resolve merge conflicts within settled contracts; a new
scope, product, policy or authority choice returns for a ruling. Conflict
resolution that changes behavior requires affected validation and review before
delivery. Reuse still valid review evidence instead of restarting a satisfied
gate.

**The delivery check.** When the lane reports green CI, compare the PR head with
the accepted revision. The delivery handback lists each commit added since,
with its kind: integration merge, conflict resolution, CI fix or correction.
Read every commit that is not a clean merge of the integration branch, and
confirm the terminal CI result on that head yourself. A commit that changes
behavior gets affected validation and its owning review, as **The lane's
latitude** requires. The accepted range needs no second full validation. Report
the PR ready for the operator's merge only after this check.

**A PR you did not authorize.** When a lane reports a PR at a head you have not
accepted, validate that head now as you would an unpublished handback. Until
you report the result, the return carries a HOLD line asking the operator not
to merge that PR.

**Offers and PR text.** Present open encoding offers from `REVIEW` to the
operator with authorization; an approved offer returns to the lane as a
correction. PR text describes the change and its stakes, with ticket links in
the repository's template fields; omit lane names and process history.
