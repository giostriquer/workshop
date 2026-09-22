# test-quality-review

## What it does

This skill reviews implemented test code for **trustworthiness**: whether each test protects the behavior it claims to protect. It exists because **"a test that compiles, runs green, and asserts almost nothing passes every other review gate."** It reads the tests together with the production code they exercise, and it reports only on tests, test helpers, missing test strategy, and mutation-suppression comments.

It is the test half of the adversarial review. When a diff changes production logic or tests, it runs next to `code-quality-review`, in parallel and in its own test-scoped prompt. Like that review, it is **dispatched, never self-served**: the session that wrote the tests chose their inputs and assertions, so the gaps between them read as coverage. It runs through its companion `test-quality-reviewer` agent, as a separate Opus agent on Claude Code or a `gpt-6-sol` agent on Codex, and on the host's default model elsewhere. On a host without that agent type, a reviewer context loads this skill directly.

It produces a `PASS` / `ISSUES_FOUND` verdict with findings. The reviewer sets up
and repairs mutation tooling in isolation; the implementer owns test, production,
and permanent repository tooling changes.

## When to reach for it

Mostly you don't. It fires with the adversarial review whenever the diff changes production logic or tests, right before the PR-or-merge question. `file-pr` will not file a PR that changes logic or tests until it has run.

Reach for it directly to check whether existing tests protect their claimed
behavior or to recommend a testing approach. Give it the question or target in
plain language; it resolves the scope from the request.

| The problem | The skill |
| --- | --- |
| A finished diff changes logic or tests and needs its adversarial review | `code-quality-review` plus `test-quality-review`, in parallel |
| Do the tests in this folder actually catch regressions? | `test-quality-review`, with the folder and question |
| What coverage, mutation, and property-testing posture should this project adopt? | `test-quality-review`, with the project's risks and question |
| How should I write the tests in the first place? | [test-driven-development](test-driven-development.md) and its `writing-good-tests.md` reference |
| Is the production code well structured? | [code-quality-review](code-quality-review.md) |

## The rubric

**Baseline trustworthiness checklist.** Trivially-passing setup, weak or absent assertions, mock-saturated or tautological-mock tests, wrong-path testing, missing edge cases, brittle coupling, non-determinism, and test-code complexity. A finding needs a concrete way the test fails to protect the behavior it claims.

**The mutation run.** When the reviewed change set changes logic or tests, the review
uses StrykerJS for `.ts`, `.tsx`,
`.js`, and `.jsx` production code, and `cargo-mutants` for Rust. Mixed changes
need both. It mutates the production lines whose content changed and the whole
production files behind changed tests, then runs focused tests against those
defects. Content that moved without an edit has no changed lines, so a move's
scope is the wiring that now points at it. Applicable project commands can supply
the setup. Explicit user or repository overrides retain precedence.

Missing tools trigger installation; broken configuration triggers repair. Both
happen in a disposable review copy or dedicated tool prefix. The reviewer records
tool versions, setup and run commands, scope, report paths and outcome counts.
It diagnoses empty selections, baseline failures and timeouts, then reruns. The
lane has a 30-minute total budget per review round, setup included, with a
15-minute limit per invocation; scope still uncovered when the budget ends is
recorded as `partial` and handed to the implementer as a named Issue. Content the
named tool does not parse is recorded as `not applicable` and covered by mutation
thinking, not by a hand-built harness. If required execution remains blocked, the
verdict is `ISSUES_FOUND` with attempted repairs, remaining scope and the next
action. A qualitative review alone cannot clear that gap. Explicit waivers and
source-backed `not applicable` findings are recorded separately from successful
execution.

An explicitly requested mutation run over existing code follows the same setup,
isolation and evidence rules. A request for findings or testing advice does not
automatically start tooling installation or create a delivery gate.

Every surviving mutant gets a judgment, not a score:

| The survivor | Classification |
| --- | --- |
| Changes behavior a consumer relies on | Issue: the mutant plus the assertion or case that kills it |
| Changes nothing observable (an equivalent mutant) | Observation, with the reason |
| Changes only wording tests should not pin, such as a log or error message nobody matches on | Observation |
| Hidden by a `Stryker disable` comment the diff added without a checkable reason | Issue |

**Workspace preservation.** Every mutation command, including a project's custom
command, runs in isolation with the reviewed changes and tests. The reviewer
records the author's staged, unstaged, and untracked state and verifies it after
success, failure, or timeout. It preserves pre-existing work, keeps useful evidence
outside the commit set, and removes only artifacts known to belong to the run.
The report includes a `Workspace preservation` line, including after tool setup;
unresolved preservation or
cleanup produces `ISSUES_FOUND` even when no test-quality issue was found.

**Property testing.** For round trips, normalization, permission matrices, numeric and accounting invariants, and snapshot loading, the review recommends or flags missing property-style coverage, blocking only when examples plainly cannot cover the risk or project policy requires it.

**Metrics.** Coverage and CRAP data are read when the project publishes them and treated as risk evidence, never as a substitute for reading the tests.

## Common questions

**What does the caller need to provide?**
The test-quality question or target, and the base branch when known. For example:
"Review this change's tests before delivery; the base is main" or "Check whether
the parser tests catch malformed-input regressions." There is no mode to choose.

**It found no survivors the reviewer couldn't have spotted by reading. Why run the tool?**
On a strong model, reading the code often finds the same gaps. The tool turns each finding into checkable evidence, separates equivalent mutants from real gaps, and catches suppression comments. Its advantage grows on large diffs and on weaker reviewer models ([decision](../decisions/test-shape-and-mutation-review.md)).

**The diff is a pure move. Does the review mutate the moved code?**
No. Lines that moved byte-for-byte have no changed content, and the tests that
exercised them before the move still characterize them; mutating them would audit
those tests, which is a separate request. The scope is the wiring the diff
changed: the imports, exports and bindings that now point at the moved content,
plus any lines the move also edited. Moved content the tool cannot parse, such as
a text template, is recorded as `not applicable` rather than mutated through a
custom harness.

**My project has no mutation tool or config. Will the review set it up?**
Yes. It installs a compatible StrykerJS core and required runner dependencies for
JavaScript or TypeScript, or `cargo-mutants` for Rust, in isolation. It creates or
repairs a focused config, verifies a passing nonempty baseline, and runs mutation
testing. An existing config for another feature must have its mutation targets
and selected tests adapted. The author's manifest, lockfile and config remain
intact; needed permanent changes go back to the implementer. An explicit install
restriction or an unresolved environment failure is reported as a blocker, with
the evidence and action needed to continue.

**How does it scope Rust mutation testing?**
Install with `cargo install --locked cargo-mutants --root <isolated-tool-prefix>`
and add that prefix's `bin` to the run's PATH. Run `cargo mutants` in the isolated
crate or workspace, selecting source files and packages. For example,
`cargo mutants --file 'src/parser.rs' -- --test parser` runs the named integration
test target. `--in-diff <patch>` can limit changed production hunks, but a changed
test needs mutation of its whole production file. The report includes caught,
missed, timeout and unviable counts. Missed mutants need survivor review; these
outcomes do not establish line coverage.

**Can it use Bun through Stryker's command runner?**
Yes. Set `coverageAnalysis: "off"`, select explicit relevant test files, propagate
test failures, and verify a nonempty baseline against the isolated source. A bare
full-suite command does not qualify. Stryker reruns those selected tests for every
mutant and cannot distinguish unexecuted code from other surviving mutants.
Report the runner, test scope and `NoCoverage: unavailable`, even when the raw
table shows zero. Review every survivor; the mutation score is not an approval bar.

**A survivor changes an error message. Must I add a test for the exact wording?**
No. Unless a consumer matches on that message, it is an Observation. Pinning incidental wording is a change detector.

**Does every mutant need its own committed test?**
No. Strengthen an existing assertion or table case where suitable; add a case for
a distinct required behavior. One test can kill several mutants. Commit useful
regression coverage; keep injected defects, mutant copies, temporary probe tests,
and temporary run output outside the deliverable.

**Why can't one prompt ask for code quality and test quality together?**
The review refuses combined prompts. Each review stage is a separate dispatch so its verdict stays focused.

## It's working if

- Every PR that changed logic or tests had this review next to `code-quality-review`, run by a context that did not write the tests.
- The output has a `Mutation run` line with real counts and scope, or an explicit
  blocker, waiver, or source-backed reason mutation does not apply.
- The `Workspace preservation` line records verified preservation, an unresolved gap, or that no setup or mutation run occurred.
- Issues name concrete mutants and the assertions that kill them; equivalent and wording-only survivors are Observations.
- The worktree is unchanged after the review.

Signs of misapplication:

- The review ran in the session that wrote the tests.
- A command runner ran an unbounded suite, or its zero NoCoverage count was treated
  as coverage evidence; a run reported 0 mutants and was read as clean.
- Missing or broken tools produced a qualitative PASS without setup or repair.
- A mixed Rust and TypeScript change ran only one language's mutation tool.
- A pure move's moved bodies were mutated, a custom harness was built for files
  the tool does not parse, or the lane ran past its budget by opening more copies.
- A PR landed with a new `Stryker disable` comment nobody questioned.
- A mutation score was used as the pass/fail line.

## Where it fits

This review sits in the COMPLETION band. Once the full agreed work set is verified and about to ship through a PR or the repository's delivery process, the initial adversarial review fires: `code-quality-review`, plus this review when production logic or tests changed. Blocking fixes or evidence-based rejections return as a completed, verified batch before resuming delivery, not after each edit. Code and test review share at most two automatic follow-up passes under code-quality-review; unresolved blockers or unreviewed corrections then hold delivery. Record the reviewed revision, dispositions, evidence, and pass count; for a mutation finding, the fix is checked by re-running the recorded `Mutation run` command on that file. The test-writing side of the same policy, choosing integration, unit, property-based, model-based, or E2E tests before writing them, lives in [test-driven-development](test-driven-development.md).
