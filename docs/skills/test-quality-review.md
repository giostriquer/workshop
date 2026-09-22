# test-quality-review

## What it does

This skill reviews implemented test code for **trustworthiness**: whether each test protects the behavior it claims to protect. It reads the tests with the production code they exercise, because **"a test that compiles, runs green, and asserts almost nothing passes every other review gate."**

It is the test half of the adversarial review, **dispatched, never self-served**: the `test-quality-reviewer` agent runs it as a separate Opus agent on Claude Code or `gpt-6-sol` on Codex (the host's default model elsewhere). A change review returns `PASS` or `ISSUES_FOUND`; other requests get prioritized findings or a testing recommendation. The implementer owns fixes and permanent tooling changes.

## When to reach for it

Mostly you don't. When a diff changes production logic or tests, it fires in parallel with `code-quality-review` at completion, in its own test-scoped prompt; `file-pr` will not file the PR until it has run. Reach for it directly to audit existing tests or get a testing recommendation: give it the question or target, plus the base branch when known.

| The problem | The skill |
| --- | --- |
| A finished diff changes logic or tests | `code-quality-review` plus `test-quality-review`, in parallel |
| Do the tests in this folder catch regressions? | `test-quality-review`, with the folder and question |
| What testing posture should this project adopt? | `test-quality-review`, with the project's risks |
| How should I write the tests in the first place? | [test-driven-development](test-driven-development.md) |

## The rubric

**Checklist.** Trivially-passing setup, weak or absent assertions, tautological or saturated mocks, wrong-path testing, missing edge cases, brittle coupling, non-determinism, and test-code complexity. A finding names a concrete way the test fails to protect its claimed behavior.

**Mutation scope** ([decision](../decisions/mutation-scope-and-budget.md)). When the change set changes logic or tests, the reviewer runs StrykerJS for `.ts`, `.tsx`, `.js`, and `.jsx` production code and `cargo-mutants` for Rust (both for mixed changes). The scope is the production lines whose content changed, plus the whole production file behind a changed test. Moved content is out of scope: content that moved without an edit has no changed lines, so a move's scope is the wiring the diff changed (the references, exports, and bindings that now point at it) plus any lines the move also edited.

**Setup and budget.** Missing tools are installed and broken config repaired in isolation, never in the author's manifests, lockfiles, or config. The mutation lane has a 30-minute total budget per review round, setup included; a single invocation stops at 15 minutes. If the budget ends with in-scope lines uncovered, the reviewer records `partial: <covered scope> / <uncovered scope>`, names the uncovered scope in an Issue for the implementer to run, and opens no further copy.

**Not applicable.** Files the named tool does not parse (a template, a fixture, a generated artifact) are recorded as `not applicable: <files and reason>` on the Mutation run line and covered by mutation thinking, not a hand-built harness. Zero mutants over parsed content is a config defect to repair, unless the lines hold nothing the tool mutates (an import, a member access). Blocked required execution means `ISSUES_FOUND`, and a waiver is recorded as `waived`, never as a successful run.

**Workspace preservation.** The reviewer records the author's staged, unstaged, and untracked state before mutating and verifies it afterwards, even after failure or timeout. An unresolved gap is `ISSUES_FOUND`.

**Survivors.** Every surviving and `NoCoverage` mutant gets a judgment. One that changes behavior a consumer relies on is an Issue naming the assertion that kills it; an equivalent mutant or a wording-only change nobody matches on is an Observation; a new `Stryker disable` comment without a checkable reason is an Issue. The mutation score is never the pass/fail line.

**Property testing and metrics.** Missing property-style coverage is flagged where invariants span many inputs, blocking only when examples plainly cannot cover the risk or policy requires it. Published coverage and CRAP data are risk evidence, never a substitute for reading the tests.

## Common questions

**The diff is a pure move. Does the review mutate the moved code?**
No. The tests that exercised it before the move still characterize it; only the changed wiring and edited lines are in scope.

**My project has no mutation tool or config. Will the review set it up?**
Yes, in isolation, with a focused config and a passing, nonempty baseline. For Rust, a changed test needs its whole production file mutated, not just diff hunks. Permanent changes go back to the implementer; an install restriction or unresolved environment failure is reported as a blocker.

**Can it use Bun through Stryker's command runner?**
Yes, with `coverageAnalysis: "off"` and an explicit command that selects the relevant test files and propagates failures; a bare full-suite command does not qualify. The report shows `NoCoverage: unavailable`.

**Does every mutant need its own committed test?**
No. One strengthened assertion or table case can kill several. Injected defects, mutant copies, and probe tests stay out of the deliverable.

**Can one prompt ask for code and test quality together?**
No. The reviewer answers `## Verdict: REFUSED - out-of-scope dispatch`; each stage is a separate dispatch.

## It's working if

- Every PR that changed logic or tests had this review, run by a context that did not write the tests.
- The report has a `Mutation run` line with scope and real counts, or an explicit `partial`, `blocked`, `waived`, or `not applicable` record.
- The `Workspace preservation` line is present, and the author's checkout is unchanged.
- Issues name concrete mutants and the assertions that kill them.

It's misapplied if the author's session ran it, missing tools produced a qualitative PASS, a pure move's bodies were mutated, a custom harness was built for unparsed files, or the lane ran past its budget.

## Where it fits

It runs at completion alongside `code-quality-review`. Corrections return as a verified batch; both stages share that skill's two automatic follow-up passes, and a mutation run repeats when its production files or tests changed between rounds.
