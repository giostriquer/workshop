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

The limit counts revised-change submissions to independent reviewers. Lane
corrections, handbacks and owner validation remain within the existing task
authority. At the limit, the epic owner decides the next bounded review submission
for its lanes, records the correction scope and authorized extension, and returns
a dispatch through the operator. A standalone implementer takes that decision to
the user. Existing authorization carries forward; a product or scope decision
outside it still belongs to the operator.

Delivery remains held until independent reviewers confirm blocking dispositions
against the corrected revision. An extension retains the cumulative pass count
and does not waive review, establish missing evidence or authorize publication.

This clarifies the authority boundary in
[bounded correction review](bounded-correction-review.md). It preserves the
shipping checkpoint and the two automatic follow-ups.
