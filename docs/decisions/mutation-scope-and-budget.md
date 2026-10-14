# Mutation review: scope, budgets, and evidence

## Changed behavior determines scope (2026-09-22)

A byte-preserving extraction triggered mutation of the moved bodies and repeated
campaigns over pre-existing gaps. Scope therefore follows changed content, not
added-file line counts: mutate changed production lines and the functions behind
added, changed, or removed test cases. Include protection lost when an assertion
is removed or weakened. Moved bodies are excluded; changed wiring remains in.
Test files and their helpers get checklist review and bounded hand-applied
defects, not mutation-tool targeting.

A consumer-visible survivor is a test-quality finding. Equivalent mutants and
unmatched wording changes are observations. Gaps predating both the production
and test diff remain strategy notes. Mutation score alone is never a verdict.

## The scope behind a changed test is its subject; a follow-up reruns the delta (2026-09-22)

Whole-file mutation behind one changed test produced unrelated findings and
repeated expensive baselines. Select the affected production functions and the
lines an altered assertion protected. Follow-ups update the existing review
copy and cover the correction delta plus the lines behind the findings being
closed. They do not repeat the initial scope.

## One run per scope, one campaign at a time, an estimate first (2026-09-23)

A completed run supplies the round's evidence for its scope. Rerunning it under
another runner or coverage mode added cost and changed classifications under
load, so campaigns run one at a time and completed scope is not repeated.
Estimate duration before mutants execute; an estimate over ten minutes narrows
the scope. The initial round has a thirty-minute total budget including setup,
a follow-up has fifteen, and any invocation stops at fifteen. These are ceilings.
Tests over sixty seconds stay outside the tool's test set; their uniquely
covered lines get one hand-applied defect. Hand defects run sequentially in the
same copy, at most five per changed file per round.

## Mutation evidence is bounded, never negotiated (2026-09-23)

Uncovered scope after a bounded run is `partial`, with the remaining command in
strategy notes. Partial coverage and timeouts do not hold delivery, require a
waiver, or authorize another campaign. A required run that never happened after
bounded setup remains `blocked`; a superseding repository rule or explicit user
instruction can make it `waived`. Concrete behavioral gaps still become Issues.
The reviewer owns this disposition instead of asking an epic owner to diagnose
mutation output. Timeout interpretation follows the later evidence correction
below; the earlier blanket timeout-as-detection rule is superseded.

## Focused runners and isolated setup (2026-09-21)

Prefer a qualified framework runner for per-test coverage. A command runner is
a fallback when it selects bounded relevant files, propagates failures, and
runs a nonempty baseline. It reports `NoCoverage: unavailable`; zero in that
column does not establish coverage. Missing tools and broken configuration are
repaired in the disposable review copy or an authorized tool prefix, never in
the author's manifests or lockfiles. Unresolved execution stays a named gap.

Unsupported formats get `not applicable` with a reason and mutation thinking,
not a custom instrumenter. Zero mutants alone is insufficient: inspect actual
syntax and configuration. Parsed runtime behavior that a tool cannot mutate
uses the existing bounded hand-defect fallback without rewriting production
syntax. The [canonical rubric](../../plugins/workbench/skills/test-quality-review/SKILL.md)
owns recipes and status definitions.

## cargo-mutants runs in place inside the copy (2026-09-22)

Run `cargo mutants --in-place` as a single job inside the isolated review copy.
An extra tool-managed source copy discards useful build-cache identity. Remove a
linked worktree's `.git` pointer from the disposable copy so its Git commands
cannot reach the author's index. The copy persists across review rounds; it is
not the author's checkout. Artifact and preservation responsibilities are in
[the mutation boundary decision](mutation-artifact-boundary.md).

## Evidence and isolation corrections (2026-10-14)

A transcript sample exposed Rust builds broader than the selected tests and
runtime writes outside disposable source copies. A focused CLI probe confirmed
that trailing `--test` selects only the test phase. Use `--cargo-arg` for targets
both build and test need. Before the baseline, redirect supported data/config
roots or services, verify destinations, and check containment during execution.
A clean source tree alone cannot establish preservation. Unresolved external
writes from the review prevent a preservation PASS.

Keep timeout counts separate from assertion kills. Known loop or hit-limit
evidence can establish timeout detection; unexplained deadlines remain
inconclusive even without another campaign. Inspection stays within the current
budget, and uncertainty becomes `partial`, not an extension or waiver request.

An unchanged production line can lose protection when its test changes; establish
that loss from the old assertion or before/after mutant evidence. Constant
exports are classified by syntax: a focused Stryker 10 probe generated mutants
for an ordinary exported object and none for its `as const` form. Neither the
filename nor zero generated mutants proves inapplicability.

Qualify framework runners and their per-test coverage. The Bun runner 1.6 upgrade
changed coverage and result classification, so old outcomes cannot certify the
new runner. Stryker 10 partial incremental reports can preserve completed work,
but reuse requires unchanged source, tests, helpers, snapshots, configuration,
dependencies, runner and runtime. Otherwise force the affected scope. Report
fresh and reused results separately; restarting does not renew the budget.

References: [Cargo argument forwarding](https://mutants.rs/cargo-args.html),
[Bun runner upgrade notes](https://github.com/hughescr/stryker-bun-runner/blob/1.6.0/README.md#upgrading-from-14),
and [Stryker incremental limits](https://stryker-mutator.io/docs/stryker-js/incremental/).
Historical scenario matrices remain in git; they are bounded regression
evidence, not cross-model reliability estimates.
