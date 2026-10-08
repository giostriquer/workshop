# Release Notes

Release notes for the shipped plugins (`workbench` and `toolkit`) newest
first, one section per released version. Strictly plugin releases: repo-only
work (structure, docs, tooling) lives in `docs/decisions/` and the git log,
not here. **Bounded:** at most 15 release sections: adding one past the cap
deletes the oldest (git history keeps everything). Sections from before the
2026-08-11 plugin split (`reviewers`, pre-split `toolkit`) were dropped in the
2026-08-12 reformat.


## workbench 0.48.0: 2026-10-08

- **Behavioral completion requires focused consumer proof.** `verification-before-completion` invokes `empirical-proof` by default for behavioral changes and refactors. Reuse sufficient current evidence; blocked checks remain incomplete, and explicit declines and repository rules retain precedence. Broad QA, recordings, teams, and permanent harnesses remain optional. ([decision](decisions/empirical-proof.md#focused-consumer-proof-is-the-completion-default-2026-10-08))
- **Tests state their boundary and mutation probes confirm their source change.** TDD explains what a selected test catches and misses without reopening agreed scope. Hand-applied mutants must differ from pristine source with expectations intact before their failures count as evidence. ([decision](decisions/mattpocock-skills.md#focused-upstream-refinements-2026-10-08))

## toolkit 0.15.2: 2026-10-08

- **Yes accepts the grilling recommendation.** Phrase yes/no questions so an affirmative answer selects the recommended action, while genuine multi-option decisions retain distinct choices. ([decision](decisions/mattpocock-skills.md#focused-upstream-refinements-2026-10-08))

## workbench 0.47.4: 2026-10-07

- **CI watchers execute one bundled runner.** `ci-watcher` and `fix-ci` invoke the same Node command for PR and branch monitoring, with pinned revisions, persisted deadlines and explicit rerun attempts. Failures return before diagnosis; cancelled or missing checks cannot certify a pass, and partial reruns preserve jobs that already passed. Node 18+ and authenticated `gh` are required; missing prerequisites produce a reported gap. ([decision](decisions/fix-ci.md#execute-a-bundled-watcher-instead-of-generating-loops-2026-10-07))

## toolkit 0.15.1: 2026-10-07

- **Haiku gets a narrow lane instead of a ban.** The shipped `model-floor` rule allows Haiku 5.5 for high-volume, cost-sensitive summaries, compactions, and database queries that fetch and report data. Coding, code review, auditing, profiling, debugging, planning, design, and judging another agent's output never go to Haiku; mixed or unclear tasks stay off it, and volume or budget never moves a task into the lane. ([decision](decisions/adopt-global-rules.md#haiku-gets-a-narrow-lane-2026-10-07))

## workbench 0.47.3: 2026-10-07

- **CI watching names its own Haiku exclusion.** `model-reference` and `ci-watcher` list Haiku beside Astra and Fable as models that never watch CI, instead of relying on the global Haiku ban the operator rule no longer carries. ([decision](decisions/model-reference.md#claude-ci-watching-uses-sonnet-55-2026-09-29))

## workbench 0.47.2: 2026-10-06

- **Keep synchronizing when the PR target advances.** `file-pr` and `fix-ci` continue merging and validating concurrent target or feature-head updates without a synchronization retry cap. The two-attempt limit remains scoped to fixes for the same CI failure; synchronization neither consumes nor resets it. ([decision](decisions/file-pr.md#remove-the-synchronization-retry-cap-2026-10-06))

## workbench 0.47.1: 2026-10-05

- **PR bodies explain the full impact of a change.** `file-pr` follows the behavior activated by flags and defaults, then explains workflow changes, compatibility, breaking changes, side effects, rollout, and rollback. Known failures and unverified critical workflows appear in the change description, with detailed evidence in the repository's verification field. ([decision](decisions/file-pr.md#clear-technical-prose-and-reviewer-evidence-2026-10-05))
- **PR writing uses precise technical English.** Titles, bodies, and delivery reports use ASD-STE100 Simplified Technical English as a guiding style without claiming formal compliance. Compact visuals, paired evidence, and recovery guidance adapt Matt Pocock's PR skill while preserving repository templates and delivery rules. ([decision](decisions/file-pr.md#clear-technical-prose-and-reviewer-evidence-2026-10-05))

## toolkit 0.15.0: 2026-10-04

- **Prevent recurring mistakes with `correct`.** Trace repeated repository mistakes to their cause, then use ownership, interfaces, types, checks, or behavioral tests to prevent recurrence. Plans stay read-only; authorized repairs require evidence that the check rejects the mistake and accepts valid work. ([decision](decisions/correct.md))
- **Check performance claims with `benchmark-checklist`.** Validate completed correct work, comparable configurations, repeated runs and variation before drawing conclusions. A requested one-run ballpark stays a labeled observation, and an unknown cause limits causal claims. ([decision](decisions/benchmark-checklist.md))
- **Design for contributors with partial context.** Architecture surveys and alternative designs check split ownership, equivalent competing paths, reachable internals, and hand-synchronized lists while preserving legitimate compatibility. ([decision](decisions/mattpocock-skills.md#agent-contributions-with-partial-context-2026-10-04))
- **Reuse either glossary convention.** Domain modeling, architecture surveys, and design briefs share one lookup rule for `GLOSSARY.md`, legacy `CONTEXT.md`, their maps, and repository-specific locations. Existing names remain intact; new unconfigured repos default to `GLOSSARY.md`. ([decision](decisions/mattpocock-skills.md#glossary-compatibility-and-source-tracking-2026-10-04))

## workbench 0.47.0: 2026-10-04

- **Performance claims carry comparable evidence.** Verification and empirical proof require completed correct work, comparable runs, variation, and explicit limits on causality, independently of Toolkit. ([decision](decisions/empirical-proof.md))
- **Reviews inspect enforceable contracts.** The quality rubric checks external-input validation against the whole declared type and identifies architecture that permits distant mistakes from plausible local edits. ([decision](decisions/code-quality-review.md))
- **Self-audits can propose structural prevention.** Repeated process misses can point to an owner, interface, or executable check; the retrospective remains a report with no new edit authority. ([decision](decisions/self-audit.md))

## workbench 0.46.0: 2026-10-03

- **Sessions message each other through Session Orchestrator.** The new `session-messaging` skill lets a Claude Code or Codex session ask, tell or consult another one on the machine with `so post`, find it with `so ls --live`, and answer an arrival by running the command its header names. A refused send (six messages since the operator last spoke) stops the session for the operator; in Codex, `so post` asks to leave the sandbox with the prefix rule `["so", "post"]`. ([decision](decisions/session-messaging.md))

## workbench 0.45.6: 2026-10-01

- **Every PR push includes the latest target branch.** Filing and CI repairs refresh the actual target repository and branch, merge missing commits even without conflicts, and recheck the target after validation. Sessions resolve conflicts settled by existing requirements and validate the combined result; unresolved decisions and failed synchronization leave the push pending. ([decision](decisions/file-pr.md#synchronize-the-actual-target-before-every-push-2026-10-01))

## workbench 0.45.5: 2026-09-30

- **CI failures return to the parent before diagnostics.** The watcher reports any failed check or job on the pinned revision, even when it is not listed as required or its workflow is still running. It returns with the available evidence; the parent collects logs and decides the next action. ([decision](decisions/fix-ci.md#return-failures-before-diagnostics-or-required-check-filtering-2026-09-30))

## workbench 0.45.4: 2026-09-30

- **PR titles distinguish each change's actual contribution.** Identify the affected workflow or shared subsystem from the diff and callers, then name the operation, mechanism, or condition that separates this PR from other work on the same symptom. Descriptions connect the observed problem to the implementation and its supported effect, including unresolved work. ([decision](decisions/file-pr.md#titles-and-descriptions-share-an-evidence-boundary-2026-09-30))

## workbench 0.45.3: 2026-09-30

- **PR text uses one concise contract.** Replace the drafting worksheet, repeated checks, and claim-check report with a title formula, a description sequence, and one example. Titles retain the affected feature, concrete contribution, and failure condition for fixes. ([decision](decisions/file-pr.md#titles-and-descriptions-share-an-evidence-boundary-2026-09-30))

## workbench 0.45.2: 2026-09-30

- **PR titles explain the change without opening the description.** Name the affected feature and corrected behavior, including the restart, interruption, or failure condition for retention and recovery fixes. A worked example rejects a vague title even after its scope prefix is corrected; descriptions expand the same before/after claim. ([decision](decisions/file-pr.md#titles-and-descriptions-share-an-evidence-boundary-2026-09-30))
