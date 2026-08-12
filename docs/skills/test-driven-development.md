# test-driven-development

## What it does

This skill governs the *order* in which you write code and tests while implementing a feature or a bugfix: write the failing test first, watch it fail, write the minimal code that passes, refactor. Its core principle is stated as a claim about knowledge, not virtue — "If you didn't watch the test fail, you don't know if it tests the right thing." Everything else in the skill exists to keep that one property true.

It is a discipline, not a tool. It produces no artifact, emits no report, and runs no command you wouldn't have run anyway. It does not scaffold a test harness: where the repo has none, the instruction is to "skip silently — this discipline conditions on infrastructure that exists; scaffolding a harness is its own decision for the user, not a TDD side effect." It does not judge tests after they exist (that is the `test-quality-reviewer` agent), and it is not the completion gate (that is `verification-before-completion`).

Most importantly, it is **a default rather than a mandate**. The skill carries a hard enforcement register — an Iron Law, MANDATORY labels, a rationalization table — and a `Precedence` section at the top that ranks all of it *below* the repo's own conventions. That precedence is the thing people most often get wrong about this skill, so it gets its own section below.

## When to reach for it

It activates when you are implementing a feature or bugfix in a repo that has a test harness. In the workbench flow it sits in the IMPLEMENTATION band as the default discipline there. It fires on relevance, not compulsion — it is not one of the two default-on gates (`verification-before-completion` and the adversarial `code-quality-review` are).

**Default for, wherever the repo has a test harness:** new features, bug fixes, refactoring, behavior changes.

**Exceptions the skill says to ask the user about:** throwaway prototypes, generated code, configuration files.

**Where the repo has no test harness:** skip, and skip quietly. Don't announce the skip as a ceremony, and don't add a harness to satisfy the skill.

| The problem | The skill |
| --- | --- |
| Implementing a feature or bugfix, harness exists | `test-driven-development` |
| A bug, test failure, or unexpected behavior you don't yet understand | `systematic-debugging`, before proposing fixes |
| Tests already written; are they any good? | `test-quality-reviewer` (agent) |
| About to claim done / fixed / passing | `verification-before-completion` |
| The one adversarial pass at work-stream completion | `code-quality-review` |
| Repo has no test harness | none — skip without ceremony |

## Precedence: a default, not a mandate

The rule, in the skill's own words:

- **"A stated repo or user convention that conflicts with a step wins."** The skill's example is a rule like "no test runs before manual validation" — that displaces Verify RED/GREEN, and "this skill's MANDATORY labels do not override it."
- **"Announce the conflict, don't absorb it silently."** One line naming the repo rule and the step it displaces, then follow the repo. Apply whatever of the cycle remains compatible — the test is still written first.
- **"Only a stated rule displaces a step. Your own convenience never does"** — "just this once" with no repo rule behind it is exactly what the rationalization table catches.

The Final Rule closes the loop: "No exceptions without the user's permission — a stated repo or user convention is that permission in standing form."

This layer exists because of a specific field failure. A repo's instructions said tests must not run before manual Desktop validation; a session followed the skill's "Verify RED / Verify GREEN — MANDATORY. Never skip." and ran a focused regression anyway, then correctly diagnosed afterward that the repo instruction had higher priority and the right move was to announce the conflict, write the test and the change, and pause for the manual gate. The root cause was skill text: the adopted discipline kept its enforcement register with nothing saying where that register ranked against the repo's own rules ([decision](../decisions/tdd-default-not-mandate.md)).

Absent a conflicting repo pattern, everything in the cycle applies as written.

## The cycle

| Step | What you do | Move on when |
| --- | --- | --- |
| **RED** | One minimal test showing what should happen. One behavior, clear name, real code (no mocks unless unavoidable). | The test is written and names a single behavior. |
| **Verify RED** | Run it. Marked MANDATORY. | The test **fails** (not errors), the failure message is the one you expected, and it fails because the feature is missing — not because of a typo. |
| **GREEN** | The simplest code that passes. No extra options, no YAGNI parameters, no "improving" neighboring code. | — |
| **Verify GREEN** | Run it. Marked MANDATORY. | The test passes, other tests still pass, and output is pristine — no errors, no warnings. |
| **REFACTOR** | After green only: remove duplication, improve names, extract helpers. | Tests stay green. No behavior added. |

Two failure branches are named explicitly. If the test **passes** at Verify RED, "You're testing existing behavior. Fix test." If it **errors**, fix the error and re-run until it fails correctly. At Verify GREEN, if the test fails you "Fix code, not test."

The Iron Law is the cycle's non-negotiable half:

> NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST

Wrote code before the test? Delete it and start over — and the skill closes the usual escape hatches by name: don't keep it as "reference," don't "adapt" it while writing tests, don't look at it. "Delete means delete."

The skill also ships a verification checklist to run before marking work complete (every new function has a test; you watched each fail; each failed for the expected reason; minimal code to pass; all tests pass; pristine output; real code over mocks; edge cases covered) and a **When Stuck** table that reads test pain as design feedback — "Must mock everything" means the code is too coupled, "Test too complicated" means the design is.

## The scope boundary

TDD turns the **accepted work's** behaviors into tests. It "is not a license to grow the diff." Edge cases *of the behavior being implemented* get tests; defects discovered in *adjacent* code get recorded as follow-up work — not a failing test and a fix here — unless the change under implementation is unsafe or incorrect without them, in which case say so before expanding.

This boundary was added after a workbench-governed session grew a one-ticket persistence change into a 52-file workset across six subsystems, through exactly the loop the skill now names: implement the ticket, find an adjacent defect, treat it as required, add a failing test and a fix, review the larger implementation, find more defects, repeat ([decision](../decisions/scope-guards-q15-q16.md)). Breaking out of that loop is a question for the user, not a unilateral push forward.

## The bundled test-writing reference

`writing-good-tests.md` sits in the same folder and loads **on demand** — "when writing or changing tests, adding mocks, or adding cleanup/helper methods for tests." Two principles govern it: "Every test names the break it catches" and "Every test exercises the real thing."

What it will change about your tests:

| Habit | The rule |
| --- | --- |
| Building the expected value with the code under test | Derive it by hand. A mirror assertion "passes no matter what that code does." |
| Asserting a constant's value or exact message wording | Change detector — "it fires on redesign and sleeps through bugs." Test the behavior that depends on the decision. |
| Grepping a script or skill's source text | Run the artifact and assert outputs, side effects, or exit codes. |
| Testing the framework's mechanics | Test the contract your code makes at its boundaries. |
| Asserting on a mock | "The mock earns no assertions." Test the real component or unmock it. |
| Mocking a method wholesale | Learn its side effects first; mock the slow or external level below them. |
| A `destroy()` only tests call | Test utility, not the production class. |

Before finishing a test file it prescribes a **mutation check**: mentally mutate the production code — wrong constant, wrong branch, missing side effect, empty return, missing validation — and confirm at least one test fails for each. "A mutation nothing catches marks the behavior as unprotected — or the test as tautological."

## Common questions

**The repo says tests must not run before a manual validation gate. Do I run them?**
No. Announce the conflict in one line, write the test first anyway, and defer the run to the repo's gate. The MANDATORY labels do not outrank a stated repo rule.

**There's no test harness in this repo. Should I add one?**
No. Skip TDD silently. A harness is infrastructure the user decides on, not something this discipline drags in.

**I already wrote the implementation. Can I keep it as reference while I write the tests?**
No — that is the escape hatch the skill closes hardest. Delete it, then implement fresh from the tests. Keeping it means you will adapt it, which is testing after.

**My new test passed on its first run. Is that fine?**
No, and it is a specific diagnosis rather than a nuisance: you are testing behavior that already exists. Fix the test until it fails for the right reason.

**Aren't tests-after equivalent if the coverage ends up the same?**
The skill answers this head-on: "Tests-after answer 'what does this do?'; tests-first answer 'what should this do?'" Tests written after are biased by the code you already wrote — you verify the cases you remembered, not the ones you'd have discovered — and you never watched them fail, so you never proved they can catch the bug.

**I found a real bug in code next to what I'm changing. Write a failing test for it?**
Not here. Record it as follow-up work. The exception is narrow: your change is unsafe or incorrect without the fix — and then you say so before expanding.

**Does every function need a test?**
The bundled reference draws the line: constructors, getters, constants, and trivial forwarding earn tests "only when they validate, normalize, default, derive, enforce, or cause side effects." Otherwise assert the first consumer-visible result that depends on them. Prose written for humans earns no test at all.

**Where does this skill come from?**
It is derived from [obra/superpowers](https://github.com/obra/superpowers) (MIT, © Jesse Vincent) and adapted for the workbench system. The repo tracks it against upstream, and the precedence layer is recorded as a deliberate workbench divergence so an upstream sync doesn't re-tighten it back into a mandate.

## It's working if

- You can name, for every test you wrote, the production change that would make it fail — and that change is a bug, not a decision.
- You saw a red before every green, and each red failed for the reason you predicted.
- The diff stays inside the accepted work. Defects found in the neighborhood show up as follow-up items, not as new tests and fixes.
- When the repo's rules collided with a step, there is a one-line announcement in the session output and the repo's rule won.

Signs of misapplication:

- Tests that passed the first time they ran, kept anyway.
- A test harness appearing in a repo that had none, because "TDD needs one."
- The session citing "MANDATORY. Never skip." to override a repo convention it just read. That is the exact failure the precedence section exists to prevent.
- Test files accumulating for subsystems the ticket never named.

## Where it fits

`test-driven-development` occupies the implementation moment of the workbench flow, next to `systematic-debugging` (which owns bugs before fixes). It receives whatever the scoping stage produced — a plan, a goal contract, or nothing at all — and hands its output forward to completion: test-quality review, then `verification-before-completion` as the deemed-ready gate, then the single adversarial `code-quality-review` right before the PR-or-merge ask. It never claims done itself; it only makes the claim provable.
