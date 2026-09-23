# Release Notes

Release notes for the shipped plugins (`workbench` and `toolkit`) newest
first, one section per released version. Strictly plugin releases: repo-only
work (structure, docs, tooling) lives in `docs/decisions/` and the git log,
not here. **Bounded:** at most 15 release sections: adding one past the cap
deletes the oldest (git history keeps everything). Sections from before the
2026-08-11 plugin split (`reviewers`, pre-split `toolkit`) were dropped in the
2026-08-12 reformat.

## workbench 0.41.3: 2026-09-22

- **The watcher waits with one background loop.** `ci-watcher` arms one shell loop that polls every thirty seconds and exits on the first terminal state, with the deadline inside the loop, then ends its turn and reports once the host wakes it; host behavior is labeled (Claude Code: Bash `run_in_background` and the task notification; Codex: re-read the loop's file; elsewhere: foreground calls within the tool's limit). ([decision](decisions/fix-ci.md#the-watchers-wait-is-one-background-loop-the-parent-never-waits-in-its-own-turns-2026-09-22))
- **The parent never waits in its own turns.** `fix-ci` says why the wait lives in the watcher on every host (parent turns and Monitor lines are billed at the parent's model), that the agent file pins the watcher's model so the parent passes none, and that after dispatching the parent ends its turn and runs no `gh` poll, Monitor or output-file read of its own; `file-pr` and the usage page match. ([decision](decisions/fix-ci.md#the-watchers-wait-is-one-background-loop-the-parent-never-waits-in-its-own-turns-2026-09-22))

## workbench 0.41.2: 2026-09-22

- **The watcher stops when the PR merges or closes.** `ci-watcher` reads the PR state with its checks: a merged or closed PR at dispatch gets an immediate `merged` or `closed` report instead of a watch, and the watch is a thirty-second poll of state plus checks that returns the moment the PR merges or closes; `fix-ci` and `file-pr` end their loop on that report. ([decision](decisions/fix-ci.md#the-watcher-returns-when-the-pr-merges-or-closes-2026-09-22))

## workbench 0.41.1: 2026-09-22

- **A probe is one hand-applied defect.** `test-driven-development` defines a mutation probe as one named defect applied by hand and one focused test run, the way a test-quality finding's fix is proved; mutation-tool sweeps belong to the test-quality review, never to the implementer. ([decision](decisions/mutation-artifact-boundary.md#a-probe-is-one-hand-applied-defect-never-a-tool-sweep-2026-09-22))
- **No scope, no run.** `test-quality-review` states that a language with no production line and no test in scope gets no mutation run and no tool setup. ([decision](decisions/mutation-artifact-boundary.md#a-probe-is-one-hand-applied-defect-never-a-tool-sweep-2026-09-22))

## toolkit 0.11.1: 2026-09-22

- **Open HTML artifacts in dark mode.** `html-artifact` starts with dark colors on the first render, including on systems set to light. Light mode is optional; embedded product UI retains its source appearance and print can use paper-friendly colors. ([decision](decisions/html-artifact.md#dark-initial-theme--2026-09-22))

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

