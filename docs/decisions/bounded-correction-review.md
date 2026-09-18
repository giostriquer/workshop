# Bounded correction review

Date: 2026-09-18
Status: accepted for workbench 0.40.1

## Problem

The initial-review limit allowed authors to close blocking findings after direct
corrections and passing tests, without independent verification of the correction.
A baseline scenario reproduced that interpretation in both code-quality-review
and file-pr. Repeating broad reviews indefinitely would instead encourage scope
expansion and low-value changes.

## Decision

Use one initial review followed by focused correction verification. Return every
blocking finding's fix or evidence-based rejection to its reviewer. Preserve the
reviewer session when available. Review unresolved findings, correction deltas,
and affected behavior; new blockers need a demonstrated consequence. Advisory
preferences and unrelated cleanup do not extend the loop.

Allow at most two automatic follow-up passes per work-stream, shared by required
review stages. A pass may include both reviewers. At the limit, unresolved
blockers or unreviewed corrections stop delivery and require a concrete next-step
decision. The limit never lowers the approval bar. Broader invalidation requires
a full review within the same budget, not a reset.

Bind closure to the reviewed revision, finding dispositions, and evidence. Later
behavior changes receive delta review; formatting-only changes receive ordinary
verification. Existing explicit user waivers and superseding repository processes
retain precedence.

This refines the initial-review-only language in earlier workbench decisions.
Ships in workbench 0.40.1 with synchronized host manifests and release notes.
Installed plugin copies update through their host's normal update mechanism.
