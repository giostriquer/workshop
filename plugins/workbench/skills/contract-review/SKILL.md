---
name: contract-review
description: Use when a verified workset changes observable behavior, consumer contracts or cross-component wiring and is ready for delivery, or when explicitly asked to review implementation against agreed behavior and compatibility requirements.
---

# Contract Review

Review whether the finished implementation delivers the agreed behavior and
preserves affected consumer contracts. Approved architecture is input; the
implementer owns fixes.

## Who runs it

This review is dispatched, never self-served. The parent loads this skill and
invokes `contract-reviewer` in a context without the author's history, following
that agent's Dispatch line for its host. Give it the accepted scope, diff/base,
revision and verification evidence described below, plus the shared work-scope
folder. Name this skill in the dispatch; the reviewer loads the installed
`contract-review` skill as its complete rubric. Do not pin a plugin version or
cache path. On Codex, paste the agent body as `using-workbench` describes.

Loading this skill as the dispatched reviewer means perform the review below,
not dispatch another reviewer. If independent dispatch, the required model or
this rubric is unavailable, report `BLOCKED`; the author cannot supply the pass.

## Inputs and timing

Receive the accepted scope, base or diff range, current revision, and relevant
verification evidence. Scope includes intended outcomes, approved design choices,
compatibility requirements and exclusions; existing task text or document paths
are sufficient. Do not require a new spec, convention tree, or domain map.

At completion, run after verification and comment trimming, alongside the other
applicable reviews on the same revision. Trigger when the workset changes
observable behavior, a consumer contract, or cross-component wiring. Pure prose,
formatting and internal renames with no such effect do not trigger it. An explicit
review request keeps its requested scope. User waivers and repository process
take precedence. Do not run after each edit or subtask.

If no diff is supplied, use the working tree against the base's merge base
(default: the remote default branch), including committed, staged, unstaged and
untracked files. Record the commit and a diff fingerprint for uncommitted work.
Resolve unclear intent from the request and repository first; a missing decision
that prevents review is `BLOCKED`, not permission to invent a requirement.

## Review

1. **Connect the outcome to the implementation.** Identify the promised behavior
   and find its actual entry point, callers, state transitions and observable
   result. Check that the new path is reached with the real inputs; an implemented
   helper, passing helper test or author summary does not establish integration.
2. **Trace affected contracts beyond symbol references.** Follow relevant public
   interfaces, wire formats, persisted data, configuration, generated artifacts
   and other hosts or languages. Check units, defaults, error behavior, ownership,
   ordering and lifecycle where this change affects them. Preserve compatibility
   the accepted scope requires; do not invent callers or require support for an
   obsolete path the user explicitly authorized removing.
3. **Challenge the fact that makes the change safe.** Name the consequential
   assumption, then inspect its real caller or dependency implementation. Trace
   relevant failure, retry, cancellation and concurrent paths. A blocker needs a
   reachable counterexample or a violated accepted requirement, not a hypothetical
   input the system already excludes.
4. **Use evidence proportionate to the claim.** Reuse adequate verification on the
   current artifact and state. When a consequential uncertainty remains, run the
   smallest safe check through the real interface, within existing authority and
   repository test rules. Keep temporary probes in the parent's scope folder and
   preserve the author's checkout and runtime data. Report an unavailable required
   check as a concrete gap; do not substitute a mock, unrelated green suite, or
   broader test campaign. Source reasoning and executed proof stay distinguishable.

## Boundaries

- Accepted architecture is an input. Reopen only the affected choice when a
  reachable failure or violated constraint demonstrates it cannot deliver the
  contract. A preferred abstraction, folder layout or sibling convention alone
  is not a finding. Cite repository rules when they establish an actual contract;
  never turn inferred patterns into requirements.
- Code-quality review owns structure and maintainability; test-quality review
  owns assertions, coverage strategy and mutation. This review owns whether the
  behavior and its integration fulfill the accepted contract. It does not grade
  those other disciplines, run their checklists or replace consumer verification.
- Cosmetic comments belong to comment trimming. Do not maintain convention docs
  or `known-drift.md`, patch source, commit, push, or publish findings externally.
- Separate **blocking** contract failures from **advisory** improvements and
  **out-of-scope follow-ups**. Unrelated defects do not expand the workset. A defect
  outside changed lines blocks only if it makes this change unsafe or incorrect
  as shipped. Missing optional tooling or documentation is not a blocker.

## Correction rounds

Own this discipline's findings and pass record. Start at pass 0. Reuse this
reviewer session for verified corrections, receiving finding IDs, previous and
current revisions, correction delta and evidence, including reasoned rejections.
A replacement receives the existing record. Passing tests or author assertions
alone do not close blockers.

On follow-up, refresh the diff and inspect open blockers, the correction delta
and affected contracts. Broader invalidation requires the full affected scope.
Walk prior findings as resolved, partially resolved, unresolved or rejected with
evidence. Findings outside that focus are follow-ups unless they prove the change
unsafe or incorrect as shipped; they never prolong the loop otherwise.

Submit focused passes automatically while converging, without a pass-count cap.
Advisory-only findings trigger no pass. Hold further submissions and delivery when:

- a pass sent open blockers closes or narrows none;
- an evidence-based rejection returns without new evidence; or
- two consecutive follow-ups each add a blocker and end with at least as many
  open blockers as they received. A narrowing-only pass neither counts toward
  nor breaks that sequence.

Report the open findings, both sides' evidence and a recommendation to the epic
owner for a delegated lane, otherwise the user. Corrections may continue under
existing authority, but submission waits for their decision. Unless that decision
ends review, automatic passes restart with the churn count reset. A hold is never
PASS; only reviewer confirmation or an explicit user waiver closes a blocker.

Finish when all blocking dispositions are confirmed and the current revision is
covered. New commits, PR preparation or handoffs do not reset review. New scope or
a material redesign that invalidates coverage needs review of the affected delta;
preserve unaffected review results.

## Report

Open with `## Verdict: PASS | ISSUES_FOUND | BLOCKED`, then:

- **Reviewed revision and pass:** commit, diff fingerprint when needed, pass number.
- **Contract coverage:** intended outcomes and affected consumers inspected;
  source-traced versus executed checks, existing evidence reused, and concrete gaps.
- **Findings:** stable ID, blocking/advisory/follow-up label, location, reachable
  scenario, expected versus actual behavior, and supporting evidence. Recommend the
  smallest correction within scope, or name the unresolved decision.
- **Delta walk:** on follow-ups, each prior finding's disposition and evidence;
  name any convergence hold and the decision needed.

PASS means the scoped review is complete with no blocking findings. ISSUES_FOUND
means a demonstrated blocker remains. BLOCKED means a necessary input, check or
convergence decision is missing; retain any established findings. A missing
verdict or an unexplained unreviewed contract leaves the stage pending. An empty
findings list is valid. Do not manufacture nits to fill the report.
