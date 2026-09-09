---
name: systematic-debugging
description: Use for an unresolved failure requiring sustained investigation, such as intermittent behavior, unclear cross-component causes, or unsuccessful fixes, or when explicitly requested. Skip expected TDD RED, obvious localized fixes, and incidental out-of-scope bugs.
---

# Systematic Debugging

## Overview

**Core principle:** Diagnose the cause of an unresolved failure before claiming a repair. An authorized temporary mitigation may precede diagnosis; label it as mitigation and retain the investigation gap.

**Violating the letter of this process is violating the spirit of debugging.**

## The Iron Law

```
NO ROOT-CAUSE CLAIM WITHOUT INVESTIGATION EVIDENCE
```

For failures that meet the trigger below, complete Phase 1 before choosing a causal repair. Ordinary inspection and an obvious supported fix do not need this full protocol.

## When to Use

Use when basic inspection has not explained the failure, it is intermittent,
causes span components, or earlier fixes failed without a supported explanation.
An explicit request also invokes the protocol. Applicable surfaces include tests,
production behavior, performance, builds, and integrations.

Expected TDD RED, an obvious localized defect with a supported fix, or noticing an
unrelated bug does not activate this skill. Handle those in the ordinary task.
Escalate into the phases if the cause remains unclear or verification contradicts
the direct fix. Urgency alone does not force the protocol.

## The Four Phases

You MUST complete each phase before proceeding to the next.

### Phase 1: Root Cause Investigation

**Before choosing a causal repair in this investigation** (an explicitly authorized temporary mitigation remains the labeled exception):

1. **Read Error Messages Carefully**
   - Don't skip past errors or warnings
   - They often contain the exact solution
   - Read stack traces completely
   - Note line numbers, file paths, error codes

2. **Reproduce Consistently**
   - Can you trigger it reliably?
   - What are the exact steps?
   - Does it happen every time?
   - If not reproducible → gather more data, don't guess

3. **Check Recent Changes**
   - What changed that could cause this?
   - Git diff, recent commits
   - New dependencies, config changes
   - Environmental differences

4. **Gather Evidence in Multi-Component Systems**

   **WHEN system has multiple components (CI → build → signing, API → service → database):**

   **When existing evidence cannot locate the failure, add targeted instrumentation:**
   ```
   For each implicated boundary needed to locate the failure:
     - Record selected redacted input fields, types, sizes, or presence
     - Record the relevant output/state transition without secret values
     - Verify environment/config propagation
     - Check state at each layer

   Run once to gather evidence showing WHERE it breaks
   THEN analyze evidence to identify failing component
   THEN investigate that specific component
   ```

   Do not dump whole environments, secrets, or request bodies. Remove temporary
   diagnostics after verification. The commands below illustrate a macOS signing
   pipeline; use the actual repository tools and redact identifying output.

   **Example (multi-layer system):**
   ```bash
   # Layer 1: Workflow
   echo "=== Secrets available in workflow: ==="
   if [ -n "${IDENTITY:-}" ]; then echo 'IDENTITY: SET'; else echo 'IDENTITY: UNSET'; fi

   # Layer 2: Build script
   echo "=== Env vars in build script: ==="
   if [ -n "${IDENTITY:-}" ]; then echo 'IDENTITY: SET'; else echo 'IDENTITY: UNSET'; fi

   # Layer 3: Signing script
   echo "=== Keychain state: ==="
   security list-keychains
   security find-identity -v

   # Layer 4: Actual signing
   codesign --sign "$IDENTITY" --verbose=4 "$APP"
   ```

   **This reveals:** Which layer fails (secrets → workflow ✓, workflow → build ✗)

5. **Trace Data Flow**

   **WHEN error is deep in call stack:**

   See `root-cause-tracing.md` in this directory for the complete backward tracing technique.

   **Quick version:**
   - Where does bad value originate?
   - What called this with bad value?
   - Keep tracing up until you find the source
   - Fix at source, not at symptom

### Phase 2: Pattern Analysis

**Find the pattern before fixing:**

1. **Find Working Examples**
   - Locate similar working code in same codebase
   - What works that's similar to what's broken?

2. **Compare Against References**
   - If implementing pattern, read reference implementation COMPLETELY
   - Don't skim - read every line
   - Understand the pattern fully before applying

3. **Identify Differences**
   - What's different between working and broken?
   - List every difference, however small
   - Don't assume "that can't matter"

4. **Understand Dependencies**
   - What other components does this need?
   - What settings, config, environment?
   - What assumptions does it make?

### Phase 3: Hypothesis and Testing

**Scientific method:**

1. **Form Single Hypothesis**
   - State clearly: "I think X is the root cause because Y"
   - Write it down
   - Be specific, not vague

2. **Test Minimally**
   - Make the SMALLEST possible change to test hypothesis
   - One variable at a time
   - Don't fix multiple things at once

3. **Verify Before Continuing**
   - Did it work? Yes → Phase 4
   - Didn't work? Form NEW hypothesis
   - DON'T add more fixes on top

4. **When You Don't Know**
   - Say "I don't understand X"
   - Don't pretend to know
   - Ask for help
   - Research more

### Phase 4: Implementation

**Fix the root cause, not the symptom:**

1. **Create Failing Test Case**
   - Simplest possible reproduction
   - Automated test if possible
   - One-off test script if no framework
   - MUST have before fixing
   - Use the `test-driven-development` skill for writing proper failing tests

2. **Implement Single Fix**
   - Address the root cause identified
   - ONE change at a time
   - No "while I'm here" improvements
   - No bundled refactoring

3. **Verify Fix**
   - Test passes now?
   - No other tests broken?
   - Issue actually resolved?
   - Use the `verification-before-completion` skill before claiming success

4. **If Fix Doesn't Work**
   - STOP
   - Compare the new evidence with the hypothesis; return to Phase 1 if it was falsified
   - Repeated failures require reassessing assumptions, environment, and method
   - If recurring coupling or invalid boundaries explain the failures, examine step 5
   - Do not repeat unsupported attempts; continue when a new evidenced hypothesis exists

5. **If Evidence Implicates Architecture: Question It**

   **Pattern indicating architectural problem:**
   - Each fix reveals new shared state/coupling/problem in different place
   - Fixes require "massive refactoring" to implement
   - Each fix creates new symptoms elsewhere

   **STOP and question fundamentals:**
   - Is this pattern fundamentally sound?
   - Are we "sticking with it through sheer inertia"?
   - Should we refactor architecture vs. continue fixing symptoms?

   Discuss an architectural change when it needs a new scope or product decision.
   A count of failed attempts alone does not establish a wrong architecture.

## Red Flags - STOP and Follow Process

If you catch yourself thinking:
- "I will call a temporary mitigation a root-cause fix"
- "Just try changing X and see if it works"
- "Add multiple changes, run tests"
- "Skip the test, I'll manually verify"
- "It's probably X, let me fix that"
- "I don't fully understand but this might work"
- "Pattern says X but I'll adapt it differently"
- "Here are the main problems: [lists fixes without investigation]"
- Proposing solutions before tracing data flow
- **"One more fix attempt" without new evidence or a testable hypothesis**
- **Each fix reveals new problem in different place**

**ALL of these mean: STOP. Return to Phase 1.**

If failures implicate recurring coupling, inspect architecture (Phase 4, step 5); otherwise investigate the supported alternatives.

## User Signals You're Missing Evidence

**Watch for these redirections:**
- "Is that not happening?" - You assumed without verifying
- "Will it show us...?" - You should have added evidence gathering
- "Stop guessing" - You're proposing fixes without understanding
- "Ultra-think this" - Question fundamentals, not just symptoms
- "We're stuck?" (frustrated) - Your approach isn't working

**When you see these:** STOP. Return to Phase 1.

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "Issue is simple, don't need process" | An obvious supported fix can proceed directly. An unexplained failure still needs investigation. |
| "Emergency, no time for process" | Systematic debugging is FASTER than guess-and-check thrashing. |
| "Just try this first, then investigate" | First fix sets the pattern. Do it right from the start. |
| "I'll write test after confirming fix works" | Untested fixes don't stick. Test first proves it. |
| "Multiple fixes at once saves time" | Can't isolate what worked. Causes new bugs. |
| "Reference too long, I'll adapt the pattern" | Partial understanding guarantees bugs. Read it completely. |
| "I see the problem, let me fix it" | Seeing symptoms ≠ understanding root cause. |
| "One more fix attempt" | New attempts need evidence and a testable hypothesis. Investigate architecture when the failure pattern implicates it. |

## Quick Reference

| Phase | Key Activities | Success Criteria |
|-------|---------------|------------------|
| **1. Root Cause** | Read errors, reproduce, check changes, gather evidence | Understand WHAT and WHY |
| **2. Pattern** | Find working examples, compare | Identify differences |
| **3. Hypothesis** | Form theory, test minimally | Confirmed or new hypothesis |
| **4. Implementation** | Create test, fix, verify | Bug resolved, tests pass |

## When Process Reveals "No Root Cause"

If systematic investigation reveals issue is truly environmental, timing-dependent, or external:

1. You've completed the process
2. Document what you investigated
3. Implement appropriate handling (retry, timeout, error message)
4. Add monitoring/logging for future investigation

Distinguish an evidenced external cause from an unresolved cause. Record what was tested, what remains unknown, and the next useful observation.

## Supporting Techniques

These techniques are part of systematic debugging and available in this directory:

- **`root-cause-tracing.md`** - Trace bugs backward through call stack to find original trigger
- **`defense-in-depth.md`** - Add validation at multiple layers after finding root cause
- **`condition-based-waiting.md`** - Replace arbitrary timeouts with condition polling
