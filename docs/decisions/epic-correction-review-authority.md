# Epic correction review authority

Date: 2026-09-21
Status: accepted for workbench 0.40.5

## Problem

An epic owner interpreted the two automatic review follow-ups as a requirement
to ask the operator before returning confirmed defects to an implementation lane.
The review skill held delivery and requested a decision without naming who owned
that decision. This conflicted with the epic owner's existing authority over lane
corrections and authorization.

## Decision

Review passes are revised-change submissions to independent reviewers. Lane
corrections, handbacks and owner validation remain within the existing task
authority. When a lane's review stops converging, the epic owner decides the next
step for its lanes, records it and its reason, and returns a dispatch through the
operator. A standalone implementer takes that decision to the user. Existing
authorization carries forward; a product or scope decision outside it still
belongs to the operator.

Delivery remains held until independent reviewers confirm blocking dispositions
against the corrected revision. The owner's decision does not waive review,
establish missing evidence or authorize publication.

This clarifies the authority boundary in
[bounded correction review](bounded-correction-review.md). It preserves the
shipping checkpoint.

## The owner decides only when review stops converging (2026-09-24)

The two automatic follow-ups this note first preserved are gone: follow-up passes
now run without a count until review stops converging
([bounded correction review](bounded-correction-review.md#convergence-replaces-the-follow-up-pass-count-2026-09-24)).
A lane's focused follow-ups therefore never wait for the owner, and the owner no
longer authorizes review extensions or counts submissions. It rules only when a
lane reports that review stopped converging, under the same authority boundary as
above; unless its decision ends review, the lane's automatic passes resume
without it, and delivery waits for reviewer confirmation or the user's explicit
waiver. The owner's ledger and dispatches carry the lane's review record
(finding IDs, dispositions, rejections with evidence, pass number) rather than a
follow-up count. The lane report's `REVIEW CLOSURE` slot records the follow-up pass number
and which convergence condition, if any, stopped review, in place of the
authorized extension.
