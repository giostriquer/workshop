# Release Notes

Release notes for the shipped plugins (`workbench` and `toolkit`) newest
first, one section per released version. Strictly plugin releases: repo-only
work (structure, docs, tooling) lives in `docs/decisions/` and the git log,
not here. **Bounded:** at most 15 release sections: adding one past the cap
deletes the oldest (git history keeps everything). Sections from before the
2026-08-11 plugin split (`reviewers`, pre-split `toolkit`) were dropped in the
2026-08-12 reformat.

## toolkit 0.11.0: 2026-09-22

- **Use one HTML artifact skill.** `html-artifact` replaces `html-report` and `arch-map` as the manual entry point for reports, plans, architecture explanations, and interactive product targets. Diagram and product-mockup techniques load when needed; usage pages and host discovery metadata follow the new name. ([decision](decisions/html-artifact.md))
- **Choose the design for the reader.** The skill preserves evidence and claim status while letting the model choose typography, palette, composition, navigation, and useful interaction. Fixed dark/glass templates and one-pass editing rules give way to rendered inspection, defect correction, and coherent revisions. ([decision](decisions/html-artifact.md))

## workbench 0.41.0: 2026-09-22

- **Clean up a finished epic on request.** Add manual-only `epic-cleanup` to remove obsolete temporary artifacts and account for every epic-owned worktree, including validation and audit checkouts. It preserves useful evidence and unfinished work, proceeds with verified safe removals, and reports any blockers. ([decision](decisions/epic-cleanup.md))

## workbench 0.40.10: 2026-09-22

- **Run cargo-mutants in place inside the copy.** `test-quality-review` runs `cargo mutants --in-place` in the disposable copy as a single job, with `--copy-target` and `--jobs` unset, so the clone's build cache serves every mutant instead of the tool's cold temporary copy; a clone of a linked worktree has its `.git` pointer deleted before any git command runs there. ([decision](decisions/mutation-scope-and-budget.md#cargo-mutants-runs-in-place-inside-the-copy-2026-09-22))

## workbench 0.40.9: 2026-09-22

- **Mutate the subject of a changed test, not its whole file.** Behind a changed test file, `test-quality-review` scopes mutation to the production functions its added, changed or removed cases call, plus the lines a removed or relaxed assertion pinned. A survivor on a line the diff did not change is a pre-existing gap under Strategy notes, not an Issue. ([decision](decisions/mutation-scope-and-budget.md#the-scope-behind-a-changed-test-is-its-subject-a-follow-up-reruns-the-delta-2026-09-22))
- **Follow-up rounds rerun the delta in the same copy.** A follow-up brings the initial round's disposable copy to the new revision, keeps its build caches, reruns the initial tool over the correction's lines and the lines behind each finding it claims to close, and has a 15-minute lane. ([decision](decisions/mutation-scope-and-budget.md#the-scope-behind-a-changed-test-is-its-subject-a-follow-up-reruns-the-delta-2026-09-22))
- **One cheap copy, sequential hand defects, no slow tests under the tool.** The disposable copy is a filesystem clone or detached worktree with the author's dependencies linked; hand-applied defects in any language run one at a time in it, at most five per changed file per round; a test slower than 60 seconds stays out of the tool's test set and gets one hand-applied defect instead. The Mutation run line records the lane's elapsed time against its budget, and the setup text names the macOS `timeout` and chained-`sleep` traps. ([decision](decisions/mutation-scope-and-budget.md#the-scope-behind-a-changed-test-is-its-subject-a-follow-up-reruns-the-delta-2026-09-22))

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
