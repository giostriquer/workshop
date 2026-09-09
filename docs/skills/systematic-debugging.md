# systematic-debugging

## What it does

`systematic-debugging` investigates an unresolved failure through four phases: root-cause investigation, pattern analysis, hypothesis testing, and implementation. It keeps the concrete reproduction, comparison, instrumentation, and verification procedures. A temporary authorized mitigation is labeled as such; it is not a claimed causal repair.

Unlike the flow's other investigation engines, this one **carries through to the
fix**. `claim-check` and `qa-sweep` record a verdict before any separately authorized repair; `systematic-debugging`
ends with Phase 4: a failing test case, a single fix at the root cause, and
verification that the bug is actually resolved. What it refuses to do is fix
first and claim understanding later. The Iron Law is **NO ROOT-CAUSE CLAIM WITHOUT INVESTIGATION EVIDENCE**. An authorized temporary mitigation may precede diagnosis when labeled as such and followed by investigation.

Repeated failed attempts require reassessing the hypothesis, environment, and method. Their count does not establish an architectural defect. The architecture questions apply when evidence shows recurring coupling or invalid boundaries.

The skill is derived from [obra/superpowers](https://github.com/obra/superpowers)
(MIT, © Jesse Vincent) and adapted for the workbench system; the repo's own
provenance manifest records the adaptations as description defanging and
scrubbing cross-references to pieces workbench dropped
([decision](../decisions/workbench-split.md)).

## When to reach for it

Invoke it for unresolved failures after basic inspection, intermittent behavior, unclear cross-component causes, or unsuccessful fixes without explanation. Explicit invocation also applies. Expected TDD RED, obvious localized fixes, and incidental out-of-scope bugs stay in the ordinary task.

The protocol applies across tests, production, performance, builds, and integrations when the problem meets those investigation triggers. Surface type or urgency alone does not activate it.

- Under time pressure: "emergencies make guessing tempting"
- When "just one quick fix" seems obvious
- When you've already tried multiple fixes
- When the previous fix didn't work
- When you don't fully understand the issue

A direct supported fix can proceed without loading the full protocol. If verification contradicts it or the cause remains unclear, enter the phases.

| The problem | The skill |
| --- | --- |
| An unresolved failure needing sustained investigation | `systematic-debugging` |
| A premise about the code you want graded before anyone acts | `claim-check` investigates first; an authorized repair can follow |
| Something to check that hasn't been sized yet | `audit` |
| A broad QA pass over a release or feature area | `qa-sweep` |
| Proving one just-finished change at its runtime surface | `empirical-proof` |
| Writing the failing test in Phase 4 | This skill hands off to `test-driven-development` |
| About to say "fixed" | This skill hands off to `verification-before-completion` |

## The four phases

**Phase 1: root cause investigation.** Read error messages completely
(stack traces, line numbers, file paths, error codes: "they often contain the
exact solution"). Reproduce consistently; if you can't, "gather more data, don't
guess." Check recent changes: git diff, recent commits, new dependencies, config
changes, environmental differences.

Two techniques get named here:

- **Evidence in multi-component systems.** When the system has multiple
  components (CI → build → signing, API → service → database), add diagnostic
  instrumentation *before* proposing fixes. At implicated boundaries, record selected redacted fields, types, sizes, and presence, plus relevant config propagation and state. Never dump whole environments or secret values. Run once to gather evidence showing **where** it breaks,
  then investigate that component. The skill carries a worked shell example that
  walks four layers.
- **Trace data flow.** When the error is deep in the call stack, trace backward:
  where did the bad value originate, what called this with it, keep going until
  you find the source. "Fix at source, not at symptom."

**Phase 2: pattern analysis.** Find working examples of similar code in the same
codebase. Compare against references: "read reference implementation COMPLETELY.
Don't skim - read every line." List every difference between working and broken,
"however small. Don't assume 'that can't matter'." Understand what dependencies,
settings, and assumptions the code needs.

**Phase 3: hypothesis and testing.** Form a **single** hypothesis, stated
specifically: "I think X is the root cause because Y." Test it with the smallest
possible change, one variable at a time. If it worked, go to Phase 4. If it
didn't, form a **new** hypothesis: "DON'T add more fixes on top." And when you
don't know: "Say 'I don't understand X'. Don't pretend to know."

**Phase 4: implementation.** Create a failing test case first: "Simplest
possible reproduction … MUST have before fixing": using
`test-driven-development` to write it properly. Then implement a single fix at
the root cause: "ONE change at a time. No 'while I'm here' improvements. No
bundled refactoring." Verify with `verification-before-completion` before
claiming success.

If the fix does not work, the next step depends on evidence:

| Failed fixes | What happens |
| --- | --- |
| Hypothesis falsified | Return to Phase 1 and reassess using the new evidence |
| Repeated failures | Reassess assumptions and environment; examine architecture when recurring coupling or broken invariants explain the failures |

The pattern that indicates an architectural problem, rather than a bad
hypothesis: each fix reveals new shared state or coupling somewhere else, fixes
require "massive refactoring" to implement, and each fix creates new symptoms
elsewhere.

## The bundled techniques

The skill's directory carries three reference files plus two runnable helpers.
They are **not loaded up front**: the SKILL.md points at them and they get read
when the situation calls for one ("See `root-cause-tracing.md` in this directory
for the complete backward tracing technique"). That is why the skill reads short
relative to what it covers: the depth is one hop away, paid for only when needed.

| Reference | Use it when | What it gives you |
| --- | --- | --- |
| `root-cause-tracing.md` | The bug appears deep in the stack and you can't see where the bad value came from | The backward-tracing process, how to add stack-trace instrumentation (`new Error().stack`, `console.error` in tests because loggers may be suppressed), and a worked five-level trace |
| `defense-in-depth.md` | You've found the root cause and want the bug to be structurally impossible | Entry, business, and environment safeguards for independently reachable boundaries, plus diagnostic instrumentation; each retained check needs a distinct invariant or bypass path |
| `condition-based-waiting.md` | Tests are flaky, use `setTimeout`/`sleep`, or fail under load and in CI | The `waitFor` polling pattern, a table of scenario-to-pattern mappings, and the narrow case where an arbitrary timeout **is** correct (wait for the triggering condition first, base the delay on known timing, comment why) |
| `find-polluter.sh` | Something appears during a test run and you don't know which test does it | A bisection script that runs tests one by one and stops at the first polluter |
| `condition-based-waiting-example.ts` | You're implementing the polling helpers | A complete implementation with domain-specific helpers |

## Red flags the skill watches for

If any of these thoughts show up, the instruction is "STOP. Return to Phase 1":

"Quick fix for now, investigate later" · "Just try changing X and see if it
works" · "Add multiple changes, run tests" · "Skip the test, I'll manually
verify" · "It's probably X, let me fix that" · "I don't fully understand but this
might work" · "Pattern says X but I'll adapt it differently" · "Here are the main
problems: [lists fixes without investigation]" · proposing solutions before
tracing data flow · "One more fix attempt" when 2+ have already failed · each fix
revealing a new problem somewhere else.

The skill also lists redirections **from you** that mean it is off the rails and
should restart at Phase 1: "Is that not happening?" (it assumed without
verifying), "Will it show us…?" (it should have added evidence gathering), "Stop
guessing", "Ultra-think this" (question fundamentals, not symptoms), and a
frustrated "We're stuck?". Saying any of these is a legitimate way to reset a
debugging session that has started guessing.

## Common questions

**Why is the skill so short? Where are the actual techniques?**
They're in the bundled reference files next to the SKILL.md, loaded on demand
rather than up front. The skill body carries the phases and the gates; tracing,
defense-in-depth, and condition-based waiting are each one file away and get read
when the bug calls for them.

**Does it just diagnose, or does it fix the bug?**
It fixes. Phase 4 is implementation: failing test, single fix at the root cause,
verification. This is the main structural difference from `claim-check`, which
investigates a premise and records its verdict before any separately authorized implementation.

**My bug is a one-line typo. Do I really need four phases?**
An obvious localized fix supported by inspection can proceed directly with focused verification. Enter the four phases if the cause remains unclear or verification contradicts the explanation.

**Three fixes have failed. What does it do?**
Repeated failures require reassessing assumptions, environment, and method before another patch. Examine architecture when evidence identifies recurring coupling or broken boundaries; a count alone does not establish that diagnosis.

A claimed external cause needs evidence. If the cause remains unresolved, report the tested hypotheses, missing evidence, and next useful observation; no unsupported percentage determines the diagnosis.

**Does it write the test itself?**
Phase 4 requires a failing test case before the fix and points at
`test-driven-development` for writing it properly. A one-off test script counts
when there's no framework.

**The examples are TypeScript and shell. Is this a JavaScript skill?**
No. The phases, the Iron Law, and the escalation rule name no language. The
worked examples in the bundled references come from the debugging sessions the
techniques were extracted from, and happen to be TypeScript and bash.

**Is it kept in sync with upstream superpowers?**
The repo tracks it against upstream and reviews each upstream change against
recorded dispositions rather than auto-applying anything. Adopting upstream text
is "never a copy"; it passes an adaptation filter that defangs coercive
descriptions and scrubs cross-references to pieces workbench dropped
([decision](../decisions/workbench-split.md)).

**Can I skip it because I already know what's wrong?**
That belief has its own row in the skill's rationalization table: "Seeing
symptoms ≠ understanding root cause." Phase 1 is usually short when you're right,
and it is the only thing that catches you when you aren't.

## It's working if

- Evidence supports the stated root cause before choosing a causal repair in this investigation; a temporary authorized mitigation is labeled separately.
- The bug reproduces consistently, or the session says it can't and gathers more
  data instead of guessing.
- In a multi-component system, instrumentation was added at boundaries and run
  to show **where** it breaks before choosing a causal repair; instrument only implicated boundaries.
- A failing test exists before the fix, and it fails for the right reason.
- The fix is one change at the root cause: no bundled refactoring, no "while I'm
  here" improvements.
- Repeated failures prompt reassessment of the hypothesis, environment, and method. Architecture is examined when recurring coupling or broken boundaries are evidenced.
- **Not working:** a message that opens "Here are the main problems:" followed by
  a list of fixes with no traced data flow; several changes applied at once and
  the test suite run to see what happens; a fix at the line where the error
  surfaced when the bad value came from somewhere else; "verified manually" in
  place of a test.

## Where it fits

`systematic-debugging` lives in the workbench flow's **implementation** stage,
sitting alongside `test-driven-development`: TDD is the default discipline where
a test harness exists, and this skill handles persistent or unclear failures requiring investigation, not expected RED or obvious localized fixes.
It hands off in both directions, to `test-driven-development` for writing the
Phase 4 failing test, and to `verification-before-completion` before any "fixed"
claim leaves the session. Upstream of it, `audit` and its engines (`claim-check`,
`qa-sweep`) are how a bug gets *found* and graded; `systematic-debugging` is how
one gets understood and resolved.
