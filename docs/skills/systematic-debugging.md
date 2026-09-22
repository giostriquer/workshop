# systematic-debugging

## What it does

This skill investigates an unresolved failure through four phases (root-cause investigation, pattern analysis, hypothesis testing, implementation) and carries through to the fix: a failing test, a single fix at the root cause, and verification. Its rule is **"NO ROOT-CAUSE CLAIM WITHOUT INVESTIGATION EVIDENCE."** An authorized temporary mitigation may come before diagnosis, labeled as mitigation, with the investigation still owed.

## When to reach for it

Reach for it when basic inspection has not explained a failure, the failure is intermittent, causes span components, or earlier fixes failed without a supported explanation, or when you explicitly ask. It applies to tests, production behavior, performance, builds, and integrations.

It does not activate for expected TDD RED, an obvious localized defect with a supported fix, or an unrelated bug you noticed; those stay in the ordinary task. Urgency alone does not force it.

| The problem | The skill |
| --- | --- |
| An unresolved failure needing sustained investigation | `systematic-debugging` |
| A premise you want graded before anyone acts | `claim-check` |
| Something to check that hasn't been sized yet | `audit` |
| A broad QA pass over a release or feature area | `qa-sweep` |
| Proving one just-finished change at its runtime surface | `empirical-proof` |
| Writing the Phase 4 failing test | [test-driven-development](test-driven-development.md) |
| About to say "fixed" | `verification-before-completion` |

## The four phases

**Phase 1: root cause.** Read errors and stack traces completely, reproduce consistently (if you can't, gather more data rather than guess), and check recent changes. In a multi-component system where existing evidence cannot locate the failure, add targeted, redacted instrumentation at the implicated boundaries and run once to show **where** it breaks; never dump environments or secrets, and remove the diagnostics afterwards. When the error is deep in the call stack, trace the bad value back to its source and fix it there.

**Phase 2: pattern analysis.** Find similar working code, read any reference implementation completely, and list every difference between working and broken.

**Phase 3: hypothesis.** State a single hypothesis ("I think X is the root cause because Y") and test it with the smallest change, one variable at a time. If it fails, form a new hypothesis rather than stacking fixes. If you don't understand something, say so.

**Phase 4: implementation.** Write a failing test case first (a one-off script counts when there's no framework), make one fix at the root cause with no bundled refactoring, and verify before claiming success.

If the fix doesn't work, compare the new evidence with the hypothesis and return to Phase 1 if it was falsified. Repeated failures call for reassessing assumptions, environment, and method; a count of failed attempts alone does not establish an architectural problem. Question the architecture when evidence shows each fix revealing new coupling elsewhere, needing massive refactoring, or creating new symptoms, and discuss the change when it needs a new scope or product decision.

## The bundled techniques

These load on demand from the skill's directory:

| Reference | Use it when |
| --- | --- |
| `root-cause-tracing.md` | The bug surfaces deep in the stack and you can't see where the bad value came from |
| `defense-in-depth.md` | You found the root cause and want validation at each independently reachable boundary a bypass path needs |
| `condition-based-waiting.md` | Tests are flaky, use arbitrary sleeps, or fail under load; it also covers when an arbitrary timeout is correct |
| `condition-based-waiting-example.ts` | You're implementing the polling helpers |
| `find-polluter.sh` | Something appears during a test run and you need the test that creates it |

## Red flags the skill watches for

Any of these means stop and return to Phase 1: calling a temporary mitigation a root-cause fix; "just try changing X and see"; several changes at once; skipping the test for manual verification; "it's probably X"; adapting a pattern you haven't fully read; proposing fixes before tracing data flow; "one more fix attempt" without new evidence or a testable hypothesis; each fix revealing a new problem elsewhere.

Your own redirections also send it back to Phase 1: "Is that not happening?", "Will it show us…?", "Stop guessing", "Ultra-think this", or a frustrated "We're stuck?".

## Common questions

**Does it just diagnose, or does it fix the bug?**
It fixes: Phase 4 is implementation. `claim-check`, by contrast, records a verdict before any separately authorized repair.

**My bug is a one-line typo, or I already know what's wrong. Do I need four phases?**
Not if inspection supports an obvious localized fix: proceed with focused verification. Seeing a symptom is not understanding a root cause, though; if the cause is unclear or verification contradicts the fix, enter the phases.

**What if the cause turns out to be environmental or external?**
Distinguish an evidenced external cause from an unresolved one: document what you investigated, add handling and monitoring, and record what remains unknown and the next useful observation.

**Is this a JavaScript skill?**
No. The phases name no language; the bundled examples happen to be TypeScript and shell.

## It's working if

- Evidence supports the stated root cause before a causal repair; any temporary mitigation is labeled separately.
- Where existing evidence couldn't locate a multi-component failure, boundary instrumentation showed where it breaks.
- A failing test exists before the fix and fails for the right reason.
- The fix is one change at the root cause.

**Not working:** "Here are the main problems:" followed by untraced fixes; several changes at once; a fix where the error surfaced when the bad value came from elsewhere; "verified manually" in place of a test.

## Where it fits

It lives in the implementation stage next to [test-driven-development](test-driven-development.md), which governs its Phase 4 test, and hands off to `verification-before-completion` before any "fixed" claim. Upstream, `audit` and its engines find and grade a bug; this skill understands and resolves it.
