# test-driven-development

## What it does

This skill governs the order of code and tests while you implement a feature or bugfix: write the failing test, watch it fail, write the minimal code that passes, refactor. Its core principle: **"A regression test must fail for the intended defect. Characterization of correct existing behavior may pass immediately."**

It is a discipline, not a tool: no artifact, no report, no harness scaffolding. It is **a default, not a mandate**: its MANDATORY labels rank below the repo's own conventions.

## When to reach for it

It is the default whenever you implement in a repo with a test harness.

- **Default for:** new features, bug fixes, behavior changes, and refactoring that changes behavior. Behavior-preserving refactors use existing or characterization tests.
- **Proportionate verification** under existing repo or user instructions for throwaway prototypes, generated code, and configuration files.
- **No test harness:** skip silently. Scaffolding one is the user's decision.

| The problem | The skill |
| --- | --- |
| Implementing a feature or bugfix, harness exists | `test-driven-development` |
| A failure that resists inspection, recurs, or survived earlier fixes | [systematic-debugging](systematic-debugging.md) |
| Tests already written; are they any good? | [test-quality-review](test-quality-review.md) |
| About to claim done, fixed, or passing | `verification-before-completion` |

## Precedence: a default, not a mandate

The skill applies where the repo is silent and never overrides the repo's own rules ([decision](../decisions/workbench-operator-decisions.md)):

- **A stated repo or user convention that conflicts with a step wins.** A rule like "no test runs before manual validation" displaces Verify RED and GREEN.
- **Announce the conflict in one line**, naming the rule and the step it displaces, then follow the repo. The test is still written first.
- **Only stated repo or user rules and the skill's existing-code and characterization cases displace a step.** "Just this once" with no rule behind it is a rationalization.

## The cycle

| Step | What you do | Move on when |
| --- | --- | --- |
| **RED** | One minimal test: one behavior, clear name, real code with doubles only at external or slow boundaries. | It is written. |
| **Verify RED** | Run it with the repo's focused-test command. MANDATORY. | It fails (not errors) with the expected message, because the behavior is missing. |
| **GREEN** | The simplest code that passes. | The code is written. |
| **Verify GREEN** | Run it. MANDATORY. | It passes, affected tests and required local gates pass, new warnings are resolved, and baseline failures are recorded. |
| **REFACTOR** | After green only: remove duplication, improve names, extract helpers. | Tests stay green; no behavior added. |

If a test errors, fix setup until the intended assertion fails; at Verify GREEN, fix the code, not the test. If valid implementation already exists, including code written this session, preserve it: derive expectations from the requirement, and for a regression claim demonstrate the failure against the old implementation or a controlled mutation in a disposable checkout.

## The bundled test-writing reference

`writing-good-tests.md` loads when you write or change tests, mocks, or test helpers. Its two principles: **every test names the break it catches, and every test exercises the real thing.** Derive expected values by hand, test the behavior behind a decision rather than a constant or incidental wording, run scripts instead of grepping them, assert behavior or a contractual interaction rather than a mock's presence, and keep test-only helpers in test utilities.

It also has you choose the **test shape**: integration tests through the public entry point for behavior crossing your modules (most of a suite), table-driven unit tests for pure logic, property-based tests for invariants, model-based tests for stateful sequences, and E2E only for release-blocking journeys. A property-testing library is proposed, not installed. Before finishing a test file, run the **mutation check**: mentally mutate the production code and confirm a test fails for each realistic mutation.

## Common questions

**My new test passed on its first run. Is that fine?**
It can be valid characterization of correct existing behavior. For a regression or missing feature, establish sensitivity against old code or an isolated mutation; do not break valid code to manufacture RED.

**I already wrote the code. Do I delete it and start over?**
No. Preserve valid work, derive expectations from the requirement, and show the test detects the intended defect.

**I found a bug next to what I'm changing. Write a failing test for it?**
Only if it is in scope. An adjacent bug becomes follow-up work unless your change is unsafe or incorrect without the fix.

**Does every function need a test?**
No. Constructors, getters, constants, and trivial forwarding earn tests only when they validate, normalize, default, derive, enforce, or cause side effects.

**Which parts of mutation probing should I commit?**
The valid implementation and reusable behavior tests. Run probes in a disposable checkout, verify the author's staged, unstaged, and untracked state afterwards, and keep injected defects, mutant copies, and probe tests out of the commit.

**How do I prove a fix for a test-quality finding?**
Apply that finding's mutant by hand, watch the focused test fail, revert, watch it pass. A probe is one named defect and one test run; mutation-tool sweeps belong to the test-quality review, not to the implementer.

## It's working if

- For every test, you can name the production change that would make it fail, and that change is a bug, not a decision.
- Changed behavior has an intended RED → GREEN check; characterization cases are identified.
- The commit holds regression coverage without temporary mutation artifacts, and the diff stays inside the accepted work.
- A repo rule that collided with a step got a one-line announcement and won.

It's misapplied if a passing test is claimed as regression proof without sensitivity evidence, a harness appears in a repo that had none, or "MANDATORY" is cited to override a repo convention.

## Where it fits

It occupies the implementation stage next to [systematic-debugging](systematic-debugging.md) and hands off to `verification-before-completion`, then the comment trim and the initial adversarial review round. Focused local tests and required gates are the default; full suites normally run in PR CI. Expected RED does not activate systematic-debugging.
