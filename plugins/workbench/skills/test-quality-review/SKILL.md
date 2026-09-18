---
name: test-quality-review
description: Use when a diff changes production logic or tests and the adversarial review is due, or when asked to audit whether existing tests protect behavior or to propose a test-quality strategy.
---

# Test Quality Review

## Purpose

Review implemented test code for trustworthiness: whether tests actually protect the
behavior they claim to protect, especially where weak tests would create false
confidence around high-impact code.

This review is code-first. It reads test code, the production code under test, and any
published test-risk evidence the project provides. It exists because a test that compiles,
runs green, and asserts almost nothing passes every other review gate.

The test surface, risk profile, coverage target, and metrics artifact locations are
project-defined. The canonical default is portable; adopting projects should name their
test directories, high-impact surfaces, and metric targets in `AGENTS.md`, `CLAUDE.md`, or
their testing conventions.

## Who runs it: a reviewer that did not write the tests

This review is **dispatched, never self-served.** The session that wrote the tests chose
their inputs and assertions, so the gaps between them read as coverage.

- **When:** as part of the initial adversarial review, whenever the diff changes production
  logic or tests, next to `code-quality-review` and in parallel with it; and on request
  for `mode: audit` or `mode: strategy`.
- **Who:** the `test-quality-reviewer` agent, or on a host without that agent type, a
  reviewer context that loads this skill. Give it a separate, test-scoped prompt with the
  mode and the base branch.
- **Model:** a separate **Opus (`opus`) agent on Claude Code** or **`gpt-5.6-sol` agent on
  Codex**, and the host's default model on any other host. Select it explicitly; do not
  inherit the parent's model. The reviewer never dispatches another agent.

## Role boundary

This review is distinct from every other review stage:

- `spec-reviewer` reviews specs and plans before code exists.
- the code-quality review stage reviews production code for bugs and regressions.
- `pattern-reviewer` reviews implementation-pattern conformance and explicitly defers
  test quality and test design to this review.
- this review covers test code for trustworthiness, risk coverage, and test strategy.

It reads production code to judge whether tests are meaningful, but it reports only on
test files, test helpers, missing test strategy, and mutation-suppression comments. It
does not emit production-code quality, implementation-pattern, or spec findings.

## Modes

Every review runs in one of these modes. The mode is passed as plain text in the dispatch
prompt, for example `mode: diff`.

- `mode: diff` - in-loop review stage. Reviews the task's change set (Diff mode workflow,
  step 1).
- `mode: audit` - on-demand sweep of existing tests for a file, folder, or full suite.
- `mode: strategy` - advisory pass over a project, subsystem, or risk surface to propose
  metrics, property-test candidates, mutation-test candidates, and audit cadence.

If no mode is provided, infer it: a task diff implies `diff`; a named test target implies
`audit`; a question about thresholds, project risk, or future testing approach implies
`strategy`. State the inferred mode.

## Invocation protocol

In normal use this review is dispatched by an orchestrator, not an end user.

- `diff` mode: the orchestrator provides the mode and the base branch when it knows it;
  the change set comes from step 1 of the Diff mode workflow.
- `audit` mode: the orchestrator provides the mode and target.
- `strategy` mode: the orchestrator provides the project or subsystem and any existing
  metrics, risk profile, or test-policy notes.

Keep the invocation minimal. Do not inherit the orchestrator's assessment of the tests;
review the test code and evidence yourself.

## Diff mode workflow

On the first turn, run this workflow in full. On a revision-round turn, use the
Revision-round protocol below.

1. Get the change set against a base: the base the dispatch names, otherwise the remote
   default branch (`git symbolic-ref --short refs/remotes/origin/HEAD`). Run
   `git diff $(git merge-base <base> HEAD)` for committed, staged, and unstaged changes,
   and `git ls-files --others --exclude-standard` for new untracked files.
2. Identify changed test files, test helpers, and production files.
3. For each changed test file, read it and read the production code it exercises.
4. Apply the Baseline trustworthiness checklist.
5. For changed production logic, check whether new or changed behavior has trustworthy
   tests. Flag uncovered behavior using judgment; behavior-neutral refactors may need no
   new test.
6. If metrics artifacts are already present, apply the Metrics lane.
7. If the diff changes production logic or tests, perform the Mutation run from the
   Mutation-testing lane.
8. If the changed behavior is invariant-rich, state-machine-like, parser/serializer-like,
   permission-sensitive, or safety/high-impact, apply the Property-testing lane.
9. Emit a `PASS` / `ISSUES_FOUND` verdict.

If the diff changes production logic but adds or changes no tests, flag the missing test
coverage unless the behavior is demonstrably unchanged. If the diff contains neither test
files nor production logic, emit `PASS - no test surface in this diff`.

## Audit mode workflow

1. Resolve the target: a file, folder, subsystem, or whole test suite.
2. Read project testing conventions and any declared risk profile or metric targets.
3. Read available metrics artifacts. If absent, say so and continue qualitatively.
4. Walk the target test files and apply all relevant capability lanes.
5. Emit a prioritized findings report. Audit mode does not produce a binary verdict.

Order findings by severity, then by metric-prioritized hotspot when valid metrics exist,
then by declared high-impact surface.

## Strategy mode workflow

Use this mode when the project needs a better test-quality posture rather than a review of
one diff.

1. Identify the project's high-impact surfaces and its current test framework.
2. Read existing coverage, complexity, mutation, property-testing, or acceptance-test
   policy if present.
3. Propose a narrow test-quality profile:
   - coverage target, project-defined
   - CRAP target, default recommended ceiling `<= 6` when valid CRAP data exists
   - high-impact audit cadence
   - property-test candidate classes
   - mutation-test candidate classes
   - what remains qualitative because tooling is absent or structurally unavailable
4. Emit recommendations only. Do not claim missing tooling as a test failure unless the
   project has already made that tooling part of its gate.

## Revision rounds

Per the reviewer-session-continuation rule, the orchestrator continues the same reviewer
session across revision rounds for the same task. Keep prior findings in-session and build
on them.

### Detecting a revision round

You are in a revision round if this session already contains a prior review of the same
task's diff. Trust your own context.

### Revision-round protocol

For `mode: diff`, apply `code-quality-review`'s Bounded correction review: every
blocking disposition returns to its reviewer, and code/test stages share at most
two automatic follow-up passes per work-stream. Record the reviewed revision and
finding IDs. Hold delivery on unresolved findings or unreviewed corrections when
the budget is exhausted. Audit and strategy requests keep their agreed scope.

1. Re-run step 1 of the Diff mode workflow. Always inspect the current change set, not a
   cached view.
2. Re-read only the test and production files that changed between rounds, unless a prior
   finding requires wider context. Repeat the Mutation run when production files or their
   tests changed between rounds.
3. Delta walk prior findings by stable ID. Classify each as Resolved, Partially
   resolved, Not resolved, or Rejected with evidence. Cite the test location or
   contrary evidence that supports the disposition.
4. Check the correction delta and its effects on test adequacy. New blockers need
   a demonstrated consequence; unrelated cleanup and preferences do not extend the loop.
5. Emit the standard output with a Delta walk subsection.

### Anti-closure rule

The `PASS` bar is constant across rounds. At the follow-up limit, unresolved
findings or unreviewed corrections hold delivery; the limit never converts an
unresolved finding into PASS. A clean second follow-up can pass.

## Capability lanes

### Baseline trustworthiness checklist

Flag test code exhibiting:

- **Trivially-passing setup** - the test configures a degenerate case or triggers a guard's
  early return, so the claimed behavior never executes.
- **Weak or absent assertions** - the test asserts only existence, truthiness, broad
  snapshots, or "no exception thrown" when the behavior has an observable result.
- **Mock-saturated / tautological-mock tests** - the test mocks the behavior it claims to
  verify, reasserts configured mock returns, or over-mocks same-domain collaborators that
  real setup or shared fixtures could exercise.
- **Wrong-path / adjacent testing** - the name claims behavior X but the body exercises
  behavior Y, or setup skips the state transition needed to reach X.
- **Missing edge cases** - boundary values, malformed inputs, failure paths, optional
  fields, stale records, permission variants, concurrency/coincidence cases, or host
  variants that production code supports but tests omit.
- **Brittle / over-coupled tests** - assertions depend on incidental implementation detail
  when a stable observable contract exists.
- **Non-deterministic / order-dependent tests** - reliance on wall clock, random data,
  uncontrolled filesystem state, shared mutable state, or unspecified ordering.
- **Test-code complexity** - duplicated setup that should use an existing fixture, or
  complex test control flow that hides what behavior is actually asserted.

The checklist is judgment-driven. Flag an issue only when you can name a concrete way the
test fails to protect the behavior it claims to protect.

### Metrics lane

Metrics are risk evidence, not a substitute for reading tests.

- Coverage targets are project-defined. Do not impose a universal coverage percentage.
- CRAP target: the default recommended ceiling is `<= 6` for changed or audited
  production methods when valid per-method CRAP data exists. A project may override this.
- Valid CRAP requires both meaningful coverage and meaningful cyclomatic complexity for
  the same method. If complexity is missing, zeroed, `NaN`, or clearly synthetic, report
  CRAP as unavailable instead of deriving a score.
- A method above the CRAP target is a scrutiny priority. In `diff` mode, it is blocking
  only when the diff changes that method or its tests and the test suite does not
  adequately cover the risky behavior, or when the project explicitly makes the target
  gating.
- Cyclomatic complexity of test methods is a smell when it makes assertions hard to
  understand or lets multiple paths hide inside one test.
- Metrics may be partial. Tests outside the metric surface still receive qualitative
  review.
- Do not run a full coverage or complexity pass in `diff` mode. In `audit` or `strategy`
  mode, recommend the command if the project documents one.
- Read metrics from the artifacts the project publishes. This review does not own
  coverage tooling.

### Property-testing lane

Property testing is a candidate strategy when behavior has stable invariants across many
inputs. Recommend or flag missing property-style coverage when a realistic regression
would evade example tests and the code has one of these shapes:

- parser / formatter / serializer / deserializer round trips
- normalization, canonicalization, sorting, grouping, deduplication, or idempotence
- permission matrices, state transitions, or host/protocol compatibility matrices
- numeric boundaries, allocation/accounting invariants, pricing/cost attribution, or
  resource totals
- persisted data migrations and backwards-compatible snapshot loading

Do not demand property tests for every behavior. If a small example-based test covers the
contract better, say that. In `diff` mode, missing property tests are blocking only when
the project policy requires them or when examples plainly cannot cover the risk surface.

### Mutation-testing lane

Use mutation thinking on every review: ask which obvious mutant would survive the tests.
Examples: invert a predicate, remove a guard, change a threshold, skip a branch, return an
empty result, ignore a permission check, or no-op a state mutation.

A test that would obviously survive a relevant mutant is a test-quality issue.

**Mutation run (`diff` mode).** When the diff changes production logic or tests, mutate the
production code those changes touch or exercise: the changed hunks of changed production
files (`path:startLine-endLine`), and the whole production file behind a changed test.

- Use the project's documented mutation command when it has one.
- Otherwise, for JavaScript or TypeScript, use StrykerJS when the project has a Stryker
  config file, or when the runner plugin for the project's test framework is installed
  and can be named with `--testRunner`. Never use Stryker's `command` runner: it reruns
  the whole suite for every mutant and cannot report `NoCoverage`. Run from the directory
  that holds the config or `package.json`, with paths relative to it, and keep the
  sandbox outside the worktree:

  ```
  stryker run --mutate <path:start-end,...> --reporters clear-text --cleanTempDir always --tempDirName <new directory outside the worktree>
  ```

- Record `unavailable: <reason>` on the output's Mutation run line and continue with
  mutation thinking when no tool qualifies, or when the run reports a glob that matched
  no files, instruments 0 mutants, fails its initial test run, or passes 15 minutes (stop
  it). Do not install tooling.
- Judge every surviving and `NoCoverage` mutant in that code and classify it:
  - It changes behavior a consumer relies on: an Issue that gives the mutant and the
    assertion or case that kills it.
  - It changes nothing observable (an equivalent mutant): an Observation that says why.
  - It changes only wording that tests should not pin, such as a log or error message
    nobody matches on: an Observation that names it.
- A mutation-suppression comment the diff adds (`Stryker disable` or the tool's
  equivalent) is an Issue unless the comment states a reason a reader can check.
- The mutation score is not a pass/fail threshold.

In `audit` or `strategy` mode, recommend targeted mutation checks for high-impact code,
complex branches, permission gates, parsing, persistence, cost/accounting, and
concurrency-sensitive behavior.

Acceptance mutation testing belongs here as a targeted strategy: mutate a behavior that an
acceptance or integration test claims to protect and verify the acceptance test fails.

### High-impact project lane

If the project declares a subsystem high-impact, or the context makes risk obvious, apply
stricter scrutiny:

- Treat weak assertions and tautological mocks as higher severity.
- Prefer negative, boundary, malformed-input, and backwards-compatibility coverage over
  more happy-path examples.
- Expect periodic `audit` or `strategy` reviews with metrics, property-test candidates,
  and mutation-test candidates.
- Call out where the current project policy is missing targets. Recommend targets without
  inventing them as mandatory gates.

## Output format

### diff mode

```
## Verdict: PASS | ISSUES_FOUND

Reviewed revision: [commit; include diff fingerprint for uncommitted changes]
Follow-up pass: [0 initial / 1 / 2; explicit extension if authorized]

### Metrics
- Coverage target: [project target or "not declared"]
- CRAP target: [project target or "default <= 6"] / availability: [artifact summary]
- Notes: [short metric caveat, or "metrics absent; qualitative review performed"]
- Mutation run: [command, then killed / timeout / survived / no coverage / errors from the
  clear-text table; or "unavailable: <reason>"; or "not applicable: no production logic or
  tests changed"]

### Delta walk
[On revision rounds: prior finding ID, disposition, and supporting evidence.]

### Issues
1. **[Stable finding ID] [Category]** Brief description
   - Test: `path::TestName`, or `missing`
   - Mutant: `file:line` original → replacement (mutation findings only)
   - Problem: concrete way the test fails to protect behavior
   - Suggested fix: specific test-strengthening change

### Strategy notes
- Property-test candidates, mutation-test candidates, or high-impact audit notes that do
  not block this diff.

### Observations
- Non-blocking notes.
```

- `PASS` - no test-trustworthiness issue found that would let a weak or misleading test
  merge.
- `ISSUES_FOUND` - at least one such issue.
- Observations and Strategy notes are non-blocking unless explicitly tied to an Issue.

### audit mode

Emit a prioritized findings report, not a binary verdict. Include:

- target reviewed
- project risk profile and declared targets if found
- metrics artifacts read and whether they were valid
- findings ordered by severity and risk hotspot
- recommended property-test and mutation-test candidates

### strategy mode

Emit a test-quality profile proposal:

- high-impact surfaces
- default and project-specific targets
- metric artifact expectations
- property-test candidate classes
- mutation-test candidate classes
- review cadence recommendation
- explicit non-goals and tooling gaps

## Refuse combined-review dispatches

This review covers test quality only. If a dispatch prompt also asks for spec-compliance,
production code-quality, pattern review, documentation review, or a combined verdict,
refuse on the first turn. Do not read the diff. Emit:

```
## Verdict: REFUSED - out-of-scope dispatch

This review's scope is test-code quality, risk coverage, and test strategy only. The
dispatch prompt requested:

- [list each out-of-scope review]

Each review stage is a separate dispatch. Re-dispatch the test-quality review with a
test-scoped prompt.
```

A prompt is in scope when it asks for test trustworthiness, test design, risk coverage,
property-test candidates, mutation-test candidates, or test-quality metrics and does not
also ask for another review domain's verdict.

## Source priority

Use these in order:

1. Current test code and the production code it exercises.
2. Project testing conventions and risk-profile docs.
3. Metrics artifacts the project publishes.
4. Project workflow guides (`AGENTS.md`, `CLAUDE.md`, equivalent).

## Scope rules

This review covers test code and test strategy. It does not:

- review production-code quality - the code-quality review stage owns that
- review implementation patterns - `pattern-reviewer` owns that
- review specs or plans - `spec-reviewer` owns that
- patch test or production code - the implementer owns fixes unless a project-local fork
  explicitly grants patch authority
- install or introduce test tooling dependencies
- turn metric targets, property testing, or a mutation score into universal gates

## Suggested invocation

- Review the test code in the current task's diff (`mode: diff`).
- Audit a high-impact test folder for false confidence (`mode: audit`).
- Propose a test-quality profile for a high-impact project (`mode: strategy`).
