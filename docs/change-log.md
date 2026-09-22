# Release Notes

Release notes for the shipped plugins (`workbench` and `toolkit`) newest
first, one section per released version. Strictly plugin releases: repo-only
work (structure, docs, tooling) lives in `docs/decisions/` and the git log,
not here. **Bounded:** at most 15 release sections: adding one past the cap
deletes the oldest (git history keeps everything). Sections from before the
2026-08-11 plugin split (`reviewers`, pre-split `toolkit`) were dropped in the
2026-08-12 reformat.

## workbench 0.40.8: 2026-09-22

- **Mutate only the lines that changed.** `test-quality-review` resolves the mutation scope with rename detection and a byte comparison of removed and added text. Content that moved without an edit has no changed lines; a move's scope is the wiring that now points at it. Mutating moved bodies audits the existing suite, which stays a separate request. ([decision](decisions/mutation-scope-and-budget.md))
- **Give the mutation lane a total budget.** One review round gets 30 minutes of wall clock for mutation work, setup included, with the 15-minute limit per invocation kept, on one disposable copy. Scope left uncovered when the budget ends is recorded as `partial` on the Mutation run line and handed to the implementer as a named Issue instead of continuing on more copies or lanes. ([decision](decisions/mutation-scope-and-budget.md))
- **Setup covers the named tools' own inputs.** In-scope files a tool does not parse are recorded as `not applicable` and reviewed with mutation thinking, not through a hand-built harness. Zero mutants over unparsed content is not a repair target, and the fallback for languages without a project tool is a small hand-picked injection set. ([decision](decisions/mutation-scope-and-budget.md))

## workbench 0.40.7: 2026-09-22

- **Name the current fleet.** `model-reference`, `fix-ci`, `file-pr`, `using-workbench`, `test-quality-review` and the `ci-watcher` and `test-quality-reviewer` agents name opus-5.5, fable-5.1, gpt-6-sol, gpt-6-luna and grok-4.7 in place of their retired predecessors; the Codex watcher and reviewer assignments now read `gpt-6-sol`. ([decision](decisions/fleet-refresh-2026-09.md))
- **Re-grade the table.** opus-5.5, luna and grok-4.7 carry new grades; fable-5.1 keeps fable-5's row and the legacy caveat says so. The reading notes follow the numbers: opus-5.5 is the default frontier lane, and grok joins luna below the taste floor. The usage page's table matches the spec again. ([decision](decisions/fleet-refresh-2026-09.md))

## workbench 0.40.6: 2026-09-21

- **Complete both review stages in one round.** An initial code-quality review also includes the separate test-quality review when logic or tests changed. A missing stage keeps the gate pending and completes the same unchanged submission without repeating a valid completed stage. ([decision](decisions/completion-review-stages.md))
- **Repair tooling and run focused mutation checks.** Test review installs or repairs tooling in isolation, using StrykerJS for JavaScript and TypeScript, including JSX and TSX, and cargo-mutants for Rust. Focused command runners are supported with their coverage limitation disclosed; incomplete required execution holds the review instead of receiving a qualitative PASS. ([decision](decisions/focused-command-mutation-runner.md))
- **Infer test-review scope from the request.** One workflow replaces the three modes, and callers provide a question or target without a mode parameter. Change reviews retain mutation requirements, existing-test inspections and advice keep their requested scope, and stale references to unrelated reviewers are removed. ([decision](decisions/test-review-request-scope.md))

## workbench 0.40.5: 2026-09-21

- **Keep epic correction decisions with the owner.** The epic owner can return in-scope corrections to a lane and authorize a bounded review extension after the two automatic follow-ups. Correction dispatches, lane handbacks and owner validation do not consume review passes; cumulative counts, independent blocker closure and delivery holds remain. Standalone review extensions still require user authorization. ([decision](decisions/epic-correction-review-authority.md))

## workbench 0.40.4: 2026-09-21

- **Revalidate epic work before delegation.** The epic owner refreshes the integration branch locally and checks each ticket against its current implementation and tests before issuing a lane or workset. Dispatches name the validated revision and remaining scope; already-resolved work is excluded, and failed refreshes or unresolved claims hold the affected handoff. Active lane worktrees remain intact. ([decision](decisions/epic-dispatch-freshness.md))

## workbench 0.40.3: 2026-09-21

- **Keep mutation probes out of commits.** TDD retains useful behavior tests and strengthens existing cases where suitable instead of adding a test per mutant. Every mutation command runs in isolation and verifies preservation after success, failure, or timeout; the test-quality report records workspace preservation and holds delivery on unresolved cleanup. Before committing, inspect staged changes and new files for temporary mutation artifacts. ([decision](decisions/mutation-artifact-boundary.md))

## workbench 0.40.2: 2026-09-19

- **Review at the shipping checkpoint.** Completion means the full agreed work set is implemented, verified, and about to ship through a PR or the repository's delivery process. Individual edits, subtasks, local checkpoints, and validation handbacks do not trigger reviews; correction rounds wait for a complete, verified batch before delivery resumes. ([decision](decisions/bounded-correction-review.md#completion-boundary-clarified-2026-09-19))

## workbench 0.40.1: 2026-09-18

- **Verify blocking corrections with the reviewer.** One initial review is followed by focused verification of every blocking fix or evidence-based rejection. Code and test reviewers share at most two automatic follow-up passes; unresolved findings or unreviewed corrections then hold delivery. Revision-bound closure and the pass count carry through PR preparation and epic handoffs, while advisory preferences and unrelated cleanup do not extend the loop. ([decision](decisions/bounded-correction-review.md))

## workbench 0.40.0: 2026-09-17

- **A code-quality review opens with its verdict.** `code-quality-review` requires the report to start with `## Verdict: PASS | ISSUES_FOUND`, the line `test-quality-review` already emits, where `PASS` is no in-scope (blocking) finding and a report that omits the line reads as `ISSUES_FOUND`. One rule now reads the outcome of either review stage, by a session or by a tool counting reviews off a transcript. ([decision](decisions/a-code-quality-review-states-its-verdict.md))

## workbench 0.39.0: 2026-09-17

- **Run the test-quality review with the adversarial review.** `file-pr`, `code-quality-review`, `using-workbench` and `epic-orchestration` require `test-quality-reviewer` (`mode: diff`, given the base branch, in its own prompt) next to `code-quality-review` whenever the diff changes production logic or tests; the two can run in parallel. The epic lane report records both verdicts. ([decision](decisions/test-shape-and-mutation-review.md))
- **Back test review with a mutation run.** `test-quality-reviewer` runs the project's mutation command, or StrykerJS for JavaScript and TypeScript when the project has a config or runner plugin, over the changed code and reports it on a required `Mutation run` line. Survivors that change consumer-visible behavior and unexplained suppression comments are Issues; the score is not a threshold, the `command` runner is never used, and a missing tool is reported rather than installed. ([decision](decisions/test-shape-and-mutation-review.md))
- **Pin the test-quality reviewer's model.** `test-quality-reviewer` runs as a separate Opus agent on Claude Code or a `gpt-5.6-sol` agent on Codex, and on the host's default model elsewhere; `model-reference` records the exception. ([decision](decisions/test-shape-and-mutation-review.md))
- **Add the `test-quality-review` skill.** The test-quality rubric moves from the `test-quality-reviewer` agent into a skill the agent loads, like `code-quality-review`, so hosts that expose skills but not agent files (Codex) can run the review. ([decision](decisions/test-shape-and-mutation-review.md))
- **Route inside your own harness.** `model-reference` gains a hard invariant: pick from the models the host exposes, treat a table row as performance data rather than reachability, and leave crossing to another provider's CLI or harness to the operator. ([decision](decisions/model-routing-stays-in-harness.md))
- **Choose the test shape before writing the test.** `writing-good-tests.md` maps behavior to shape: integration tests with real in-process collaborators for cross-module behavior, table-driven unit tests for pure logic, property-based and model-based tests with `fast-check` for invariants and operation sequences, and E2E only for release-blocking journeys. ([decision](decisions/test-shape-and-mutation-review.md))

## workbench 0.38.2: 2026-09-16

- **Attach screenshots of UI changes to the PR body.** `file-pr` adds a conditional `## Screenshots` section when the diff changes rendered UI, captured from the running branch head and uploaded with `gh`'s native `--attach`. It reuses a template's screenshots-style section in place, otherwise sits right after `## Architecture`, and otherwise takes the Architecture position. The body references each file so `gh` rewrites it in place rather than appending it. Non-visual diffs get no section. ([decision](decisions/file-pr-screenshots-section.md))

## workbench 0.38.1: 2026-09-15

- **Clarify epic lane readiness.** Dispatches identify shared-contract producers, fixture builders and consumer checks, respect producer/consumer dependencies, and separate local static/build gates from focused tests. Validation uses actual producer output and supported saved artifacts. Completion review runs over the finished implementation; earlier blocked reports do not trigger it. ([decision](decisions/epic-lane-readiness.md))
- **Preserve delivery state and report formats.** `file-pr` checks for merged PRs before pushing and routes authorized remaining work to a new branch and PR. Its delivery details fit the session's required handback format, with verdict-first output only when no format is required. ([decision](decisions/epic-lane-readiness.md))

## workbench 0.38.0: 2026-09-15

- **Keep epic lane handbacks consistent.** Add `epic-implementation` for implementation lanes dispatched through `epic-orchestration`, including amendments, recovery and delivery rounds. Both skills share one report reference, and each final handback contains a complete copyable report. Blocked, follow-up and guidance states include a `NEXT STEP` with the action or decision, owner and recommendation. ([decision](decisions/epic-implementation.md))

## workbench 0.37.6: 2026-09-14

- **Keep epic delegation provider agnostic.** Lane prompts name required skills, inputs, outcomes and evidence without restating their procedures or model routing. Optional local helpers inherit the owner's model; smaller models in the same provider/harness may handle mechanical work with cheaply verifiable results. The owner retains synthesis, rulings and authorization. ([decision](decisions/epic-orchestration-delegation.md))

## workbench 0.37.5: 2026-09-11

- **One CI watcher per pinned head.** `fix-ci` and `ci-watcher` state that reading and watching are one dispatch, that a head whose watcher returned red gets no second watcher for its pending checks, that the pre-push snapshot is a single read the parent runs itself, and that a re-watch is a new head with a new watcher. The watcher's description no longer asks hosts to dispatch it proactively. ([decision](decisions/fix-ci-act-on-first-failure.md))
