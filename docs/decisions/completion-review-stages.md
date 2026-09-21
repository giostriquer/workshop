# Completion review rounds and stages

Date: 2026-09-21
Status: accepted

## Problem

A reported session treated "exactly one adversarial code-quality review" as
excluding the separate test-quality review, despite a diff that required both.
The shipped skills require both, but describe one initial review without always
distinguishing the round from its reviewer stages. Transcript inspection traced
the quoted sentence to an incoming task instruction. The session had also read
the explicit pairing requirement in both code-quality-review and file-pr before
omitting test review. This was an interpretation failure despite available
instructions; the quoted sentence was not a shipped skill rule.

## Decision

Name one initial review round containing code-quality review and, when production
logic or tests changed, a separate test-quality review. Counting code reviews does
not waive the required test stage. The dispatching session records each required
stage's verdict for the same change set and revision before declaring the gate
complete. A missing stage keeps the gate pending; run it without repeating valid
completed reviews or charging a follow-up for an unchanged submission.

Preserve the shipping checkpoint, independent reviewer roles, explicit user
waivers, repository precedence and cumulative correction-review budget. This
clarifies the pairing introduced by
[test shape and mutation review](test-shape-and-mutation-review.md); it adds no
review stage or intermediate review trigger.

The focused baseline probe followed the existing pairing correctly. The reported
failure motivates clearer wording; the probe does not establish that the current
wording always fails or that the correction guarantees future compliance.
