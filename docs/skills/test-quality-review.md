# test-quality-review

## What it does

This skill reviews implemented test code for **trustworthiness**: whether each test protects the behavior it claims to protect. It reads the tests with the production code they exercise, because **"a test that compiles, runs green, and asserts almost nothing passes every other review gate."**

It is the test half of the adversarial review, **dispatched, never self-served**: the `test-quality-reviewer` agent runs it as a separate Opus agent at `xhigh` effort on Claude Code or `gpt-6-sol` at `xhigh` reasoning effort on Codex, spawned without your session's history (the host's default model elsewhere). A change review returns `PASS` or `ISSUES_FOUND`; other requests get prioritized findings or a testing recommendation. The implementer owns fixes and permanent tooling changes.

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

**Mutation scope** ([decision](../decisions/mutation-scope-and-budget.md)). When the change set changes logic or tests, the reviewer runs StrykerJS for `.ts`, `.tsx`, `.js`, and `.jsx` production code and `cargo-mutants` for Rust (both for mixed changes; a language with nothing in scope gets no run and no setup). The scope is the production lines whose content changed plus, behind a changed test file, the production functions its added, changed or removed cases call, not the whole file; a test file and its helpers are never a mutation target, whatever a dispatch names (gate or parser logic inside a test file gets the checklist and at most five hand-applied defects); when the diff removes or relaxes an assertion, the lines it pinned join the scope. A survivor on a line the diff did not change is a pre-existing gap and lands under Strategy notes, not as an Issue. Moved content is out of scope: content that moved without an edit has no changed lines, so a move's scope is the wiring the diff changed (the references, exports, and bindings that now point at it) plus any lines the move also edited.

**Setup and budget.** Missing tools are installed and broken config repaired in isolation, never in the author's manifests, lockfiles, or config. The disposable copy is the cheapest the host offers (a filesystem clone or a detached worktree with the author's dependencies linked, its `.git` pointer removed), and one copy holds every run of a round, tool runs and hand-applied defects alike; `cargo mutants` runs `--in-place` inside it as a single job, never through its own temporary copy. The mutation lane has a 30-minute total budget for the initial round, setup included, and 15 minutes for a follow-up round; a single invocation stops at 15 minutes. Those are ceilings, not targets: every run is estimated first (mutants × baseline ÷ concurrency, from the counts the tool prints before mutants execute), and an estimate over 10 minutes ends the run and narrows the scope. A completed run is the round's evidence for its scope: the same scope never runs again under another runner, coverage setting or test set, campaigns run one at a time on the host, and a survivor re-checked by hand is one hand-applied defect. A test that takes longer than 60 seconds on its own stays out of the tool's test set, and the lines only it reaches get one hand-applied defect run against it. Hand-applied defects run one at a time in that copy, at most five per changed file per round. If the budget ends with in-scope lines uncovered, the reviewer records `partial: <covered scope> / <uncovered scope>`, puts the exact command for the uncovered scope under Strategy notes, and opens no further copy; a partial run never holds delivery.

**Not applicable.** Files the named tool does not parse (a template, a fixture, a generated artifact) are recorded as `not applicable: <files and reason>` on the Mutation run line and covered by mutation thinking, not a hand-built harness. Zero mutants over parsed content is a config defect to repair, unless the lines hold nothing the tool mutates (an import, a member access). A per-mutant timeout from a run that had the host to itself is a detected mutant, never an unknown; timeouts from a run that shared the host with another campaign are load, recorded as `partial` for their lines. Only a required run that never happened over parsed in-scope content (`blocked`) means `ISSUES_FOUND`; `waived` records a run a repository rule or the user removed in advance, never a decision the reviewer, a caller or an epic owner makes, and the reviewer never asks anyone to waive, scope or diagnose a run.

**Workspace preservation.** The reviewer records the author's staged, unstaged, and untracked state before mutating and verifies it afterwards, even after failure or timeout. An unresolved gap is `ISSUES_FOUND`.

**Survivors.** Every surviving and `NoCoverage` mutant gets a judgment. One that changes behavior a consumer relies on is an Issue naming the assertion that kills it; an equivalent mutant or a wording-only change nobody matches on is an Observation; a new `Stryker disable` comment without a checkable reason is an Issue. The mutation score is never the pass/fail line.

**Property testing and metrics.** Missing property-style coverage is flagged where invariants span many inputs, blocking only when examples plainly cannot cover the risk or policy requires it. Published coverage and CRAP data are risk evidence, never a substitute for reading the tests.

## Common questions

**The diff is a pure move. Does the review mutate the moved code?**
No. The tests that exercised it before the move still characterize it; only the changed wiring and edited lines are in scope.

**My project has no mutation tool or config. Will the review set it up?**
Yes, in isolation, with a focused config and a passing, nonempty baseline. For Rust the run is `cargo mutants --in-place` inside the reviewer's clone, so the clone's build cache serves every mutant. Permanent changes go back to the implementer; an install restriction or unresolved environment failure is reported as a blocker.

**A test file changed but the production file did not. What gets mutated?**
The functions the changed test cases call, selected by name or line range, not the whole file. Survivors on lines the diff never touched are reported as pre-existing gaps under Strategy notes.

**What does a follow-up round rerun?**
Only the delta: the lines the correction changed and the lines behind each finding it claims to close, in the initial round's copy brought to the new revision, within 15 minutes.

**Can it use Bun through Stryker's command runner?**
Yes, as the fallback when no framework runner works in the copy, with `coverageAnalysis: "off"` and an explicit command that selects the relevant test files and propagates failures; a bare full-suite command does not qualify. The report shows `NoCoverage: unavailable`. It is never a second pass over a scope a framework runner already completed.

**Some mutants timed out, or the lane's budget ended with scope uncovered. Who decides what happens?**
Nobody. Timeouts from a run that had the host to itself count as detected, exactly as Stryker and cargo-mutants score them. Uncovered scope is recorded as `partial` with the command under Strategy notes. Neither is an Issue, holds delivery, consumes a follow-up pass, or goes to the caller or an epic owner for a waiver; what the lane ran within its budget is the evidence.

**Does every mutant need its own committed test?**
No. One strengthened assertion or table case can kill several. Injected defects, mutant copies, and probe tests stay out of the deliverable.

**Why does the Codex spawn name the effort and fork no history?**
A spawn that names a model but no effort runs at that model's default effort, and a forked history hands the reviewer the author's reasoning about the tests. The `test-quality-reviewer` agent file's Dispatch line names the spawn's model, effort and `fork_turns: "none"`, and since Codex registers no plugin agents, the spawn message pastes that file's body ahead of the question or target and the base branch. On Claude Code the agent file pins the model and effort, so pass no model. Which model and effort, and why, is `model-reference`'s test-quality review exception.

**Can one prompt ask for code and test quality together?**
No. The reviewer answers `## Verdict: REFUSED - out-of-scope dispatch`; each stage is a separate dispatch.

## It's working if

- Every PR that changed logic or tests had this review, run by a context that did not write the tests.
- The report has a `Mutation run` line with scope, its estimate, real counts and the lane's elapsed time against its budget, or an explicit `partial`, `blocked`, `waived`, or `not applicable` record.
- The `Workspace preservation` line is present, and the author's checkout is unchanged.
- Issues name concrete mutants and the assertions that kill them.

It's misapplied if the author's session ran it, missing tools produced a qualitative PASS, a pure move's bodies were mutated, a whole file was swept because one of its tests changed, a test file was mutated, a completed campaign was rerun under another runner, two campaigns ran at once, a follow-up round rebuilt the copy and reran the initial scope, a custom harness was built for unparsed files, the lane ran past its budget, or a mutation decision was sent to the caller or an epic owner.

## Where it fits

It runs at completion alongside `code-quality-review`. Corrections return as a verified batch; both stages share that skill's two automatic follow-up passes, and a mutation run repeats over the round's delta when its production files or tests changed between rounds.
