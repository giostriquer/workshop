# Behavior and contract review

## Review the agreed behavior and affected consumers (2026-10-16)

The operator chose to repurpose `pattern-reviewer` for implementation contracts.
Its former domain modes, convention-directory coverage gaps and known-drift
ledger fit an older workflow. Design now settles before the workset; structure,
test quality and comment trimming already have owners.

The operator also chose to rename the agent to `contract-reviewer`, so discovery
and dispatch describe its current purpose. The file, frontmatter, host dispatch
name, active callers and package inventory move together. No duplicate agent is
shipped under the old name; custom callers must use `contract-reviewer` (on Muse,
`workbench/contract-reviewer`). Historical notes and transcript fixtures retain
the names they describe. The review contract and correction policy do not change.

`contract-review` owns invocation, the rubric and correction rounds, matching
the existing code-quality and test-quality skill/agent pairs. The small
`contract-reviewer` agent loads that skill and keeps execution boundaries and
model dispatch. Claude Code uses Opus 5.5 at `xhigh`; Codex uses `gpt-6.1-sol` at
`xhigh`. Other harnesses use the parent's model and effort, including an explicit
override of the Claude frontmatter when the host imports it. Missing required
routing or rubric leaves the stage blocked; it never silently substitutes a model.

The reviewer checks whether the finished implementation delivers the agreed
outcome through its real entry points and preserves affected consumer contracts.
It traces compatibility, wire and storage formats, lifecycle and error behavior
only where relevant. Approved design is input; a concrete failure can reopen the
affected choice, but another preferred architecture cannot expand the workset.
No domain map, convention tree or new spec document is required. The reviewer
does not edit code or maintain a known-drift ledger.

At completion it runs in parallel with the other applicable reviewers when
observable behavior, a consumer contract or cross-component wiring changes.
Pure prose and behavior-neutral internal renames do not add this stage. It owns
its findings and the same convergence-based correction policy as the other
disciplines. Landing checks retain completed verdicts and return missing gates
to completion; `file-pr` is not an implementation or verification stage.

The relevant upstream ideas are pstack's intent-first `interrogate` prompt,
reachable-failure evidence and rejection of preference-only findings, plus
`blast-radius` tracing of consumers beyond symbol references. Reviewed source:
`cursor/plugins` at `cdb3c41c9f2f6d41f050e3dc25e15e325493d499`, manifest version
`0.15.25`. This is a scoped source review, not a full-range drift review or proof
of marketplace publication. Model ensembles, majority weighting, broad review
lenses and lead-author dismissal authority are not adopted.

The existing-contract probe observed a wire-format break and ignored public
option but left both outside its pattern verdict. The approved-design control
passed. The replacement blocked both concrete failures and passed the approved
design, with all three probes executed through their real consumer. These are
bounded scenarios, not a reliability estimate; detailed evidence and workflow
checks live in the ignored work scope.

## A built-in check with a provenance exception (2026-06-05)

The pattern reviewer normally derives findings from project-documented
conventions. Redundant comments are a built-in exception: narration, repeated
signatures, obvious control flow and prose recoverable from adjacent code can
be findings even when the project has no comment policy. Otherwise the reviewer
would miss the same noise in every newly adopted repository.

Keep rationale, warnings, invariants, public API intent, external references,
legal headers and useful TODO/FIXME markers. Project comment rules take
precedence. Other undocumented project-specific preferences remain observations,
not invented conventions.

The canonical contract is
[`plugins/workbench/agents/contract-reviewer.md`](../../plugins/workbench/agents/contract-reviewer.md).
This former comment role is superseded by the contract review above. At delivery,
[`trim-comments`](../skills/trim-comments.md) performs the separate edit pass;
code review reports the remaining concerns within its own rubric. Historical
reviewer-plugin mirrors and onboarding reference trees are no longer active.
