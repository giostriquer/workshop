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
completed reviews or counting a new follow-up pass for an unchanged submission.

Preserve the shipping checkpoint, independent reviewer roles, explicit user
waivers, repository precedence and the cumulative correction-review record. This
clarifies the pairing introduced by
[test shape and mutation review](test-shape-and-mutation-review.md); it adds no
review stage or intermediate review trigger.

The focused baseline probe followed the existing pairing correctly. The reported
failure motivates clearer wording; the probe does not establish that the current
wording always fails or that the correction guarantees future compliance.

## Independent disciplines (2026-09-25)

The delivery workflow owns pairing. `using-workbench` and `file-pr` dispatch the
required reviews against the same scope and revision, retain each verdict, and
run a missing stage without repeating a completed one. Neither discipline
loads, dispatches, or defines the other. Each skill and its companion agent
are self-contained for their own rubric, scope, findings, and follow-ups.

Previously the code-quality skill dispatched test review and supplied its
correction rules; the test-quality skill imported that policy. Each now owns
its review record and convergence decisions. Equivalent stop conditions are
stated locally, without a shared runtime policy or a new coordinator skill.
Callers return findings to the owning discipline rather than treating one
review skill as the authority over all reviews. The initial delivery gate and
bounded CI repair behavior remain in force.

Validation used fresh contexts with only one discipline's skill and agent:
six code-review cases and nine test-review cases retained scope, closure, and
convergence behavior. Seven delivery cases retained pairing, missing-stage
completion, separate pass records, and bounded CI repair without reopening
review. Static checks found no peer-discipline references in either skill or
companion agent. These are bounded planning probes, not a reliability estimate.
