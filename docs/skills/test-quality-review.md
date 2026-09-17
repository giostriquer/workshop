# test-quality-review

## What it does

This skill reviews implemented test code for **trustworthiness**: whether each test protects the behavior it claims to protect. It exists because **"a test that compiles, runs green, and asserts almost nothing passes every other review gate."** It reads the tests together with the production code they exercise, and it reports only on tests, test helpers, missing test strategy, and mutation-suppression comments.

It is the test half of the adversarial review. When a diff changes production logic or tests, it runs next to `code-quality-review`, in parallel and in its own test-scoped prompt. Like that review, it is **dispatched, never self-served**: the session that wrote the tests chose their inputs and assertions, so the gaps between them read as coverage. It runs through its companion `test-quality-reviewer` agent, as a separate Opus agent on Claude Code or a `gpt-5.6-sol` agent on Codex, and on the host's default model elsewhere. On a host without that agent type, a reviewer context loads this skill directly.

It is review-only. It produces a `PASS` / `ISSUES_FOUND` verdict with findings; the implementer owns the fixes.

## When to reach for it

Mostly you don't. It fires with the adversarial review whenever the diff changes production logic or tests, right before the PR-or-merge question. `file-pr` will not file a PR that changes logic or tests until it has run.

Reach for it directly when you want to know whether an existing suite deserves the confidence people place in it (`mode: audit`), or when a high-impact project needs a test-quality profile (`mode: strategy`).

| The problem | The skill |
| --- | --- |
| A finished diff changes logic or tests and needs its adversarial review | `code-quality-review` plus `test-quality-review`, in parallel |
| Do the tests in this folder actually catch regressions? | `test-quality-review`, `mode: audit` |
| What coverage, mutation, and property-testing posture should this project adopt? | `test-quality-review`, `mode: strategy` |
| How should I write the tests in the first place? | [test-driven-development](test-driven-development.md) and its `writing-good-tests.md` reference |
| Is the production code well structured? | [code-quality-review](code-quality-review.md) |

## The rubric

**Baseline trustworthiness checklist.** Trivially-passing setup, weak or absent assertions, mock-saturated or tautological-mock tests, wrong-path testing, missing edge cases, brittle coupling, non-determinism, and test-code complexity. A finding needs a concrete way the test fails to protect the behavior it claims.

**The mutation run.** In `diff` mode, the review runs a mutation tool over the changed code: the project's documented command, or StrykerJS for JavaScript and TypeScript when the project has a Stryker config or an installed runner plugin. It mutates the changed hunks and the production files behind changed tests, never uses Stryker's `command` runner, and keeps Stryker's sandbox outside the worktree. The output always carries a `Mutation run` line with the command and counts, or `unavailable: <reason>` when no tool qualifies or the run matched no files, instrumented nothing, failed its initial test run, or passed 15 minutes. The review never installs tooling.

Every surviving mutant gets a judgment, not a score:

| The survivor | Classification |
| --- | --- |
| Changes behavior a consumer relies on | Issue: the mutant plus the assertion or case that kills it |
| Changes nothing observable (an equivalent mutant) | Observation, with the reason |
| Changes only wording tests should not pin, such as a log or error message nobody matches on | Observation |
| Hidden by a `Stryker disable` comment the diff added without a checkable reason | Issue |

**Property testing.** For round trips, normalization, permission matrices, numeric and accounting invariants, and snapshot loading, the review recommends or flags missing property-style coverage, blocking only when examples plainly cannot cover the risk or project policy requires it.

**Metrics.** Coverage and CRAP data are read when the project publishes them and treated as risk evidence, never as a substitute for reading the tests.

## Common questions

**It found no survivors the reviewer couldn't have spotted by reading. Why run the tool?**
On a strong model, reading the code often finds the same gaps. The tool turns each finding into checkable evidence, separates equivalent mutants from real gaps, and catches suppression comments. Its advantage grows on large diffs and on weaker reviewer models ([decision](../decisions/test-shape-and-mutation-review.md)).

**My project has Stryker installed but no config. Will the review run it?**
Only if the runner plugin for your test framework is installed and can be named with `--testRunner`. Without either, stock Stryker falls back to the `command` runner, which reruns the whole suite for every mutant, so the review reports `unavailable` instead.

**A survivor changes an error message. Must I add a test for the exact wording?**
No. Unless a consumer matches on that message, it is an Observation. Pinning incidental wording is a change detector.

**Why can't one prompt ask for code quality and test quality together?**
The review refuses combined prompts. Each review stage is a separate dispatch so its verdict stays focused.

## It's working if

- Every PR that changed logic or tests had this review next to `code-quality-review`, run by a context that did not write the tests.
- The output has a `Mutation run` line with real counts, or a specific `unavailable` reason.
- Issues name concrete mutants and the assertions that kill them; equivalent and wording-only survivors are Observations.
- The worktree is unchanged after the review.

Signs of misapplication:

- The review ran in the session that wrote the tests.
- A Stryker run used the `command` runner, or reported 0 mutants and was read as clean.
- A PR landed with a new `Stryker disable` comment nobody questioned.
- A mutation score was used as the pass/fail line.

## Where it fits

This review sits in the COMPLETION band. Once `verification-before-completion` establishes "deemed ready", the one adversarial review fires: `code-quality-review`, plus this review when production logic or tests changed. Blocking findings are fixed and re-verified; for a mutation finding, the fix is checked by re-running the recorded `Mutation run` command on that file. The test-writing side of the same policy, choosing integration, unit, property-based, model-based, or E2E tests before writing them, lives in [test-driven-development](test-driven-development.md).
