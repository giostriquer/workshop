---
name: verification-before-completion
description: Use when about to claim work is complete, fixed, or passing.
---

# Verification Before Completion

## Overview

**Core principle:** Evidence before claims, always.

**Violating the letter of this rule is violating the spirit of this rule.**

In the workbench flow, this skill defines **"deemed ready"**: an implementation may
proceed to its adversarial review only once the claims about it carry fresh
verification evidence. When the change has a runnable surface (an API, MCP tool,
or app a real client can drive), `empirical-proof` is an optional deeper check, not an automatic step. Offer it, and run it only on the
user's explicit ask or a standing authorization. This gate itself is the
always-on floor.

## The Iron Law

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

Evidence stays fresh while its relevant revision, inputs, dependencies, configuration, and runtime state remain unchanged. Reuse it across messages and unrelated edits. Rerun affected checks when that state changes, and bind the claim to what was actually checked.

## The Gate Function

```
BEFORE claiming completion, correctness, or a passing check:

1. IDENTIFY: What check or observation substantiates this claim?
2. RUN or REUSE: Run the complete relevant check, or reuse valid evidence for unchanged relevant state
3. READ: Full output, check exit code, count failures
4. VERIFY: Does output confirm the claim?
   - If NO: State actual status with evidence
   - If YES: State claim WITH evidence
5. ONLY THEN: Make the claim

Skip any step = lying, not verifying
```

Use focused local checks and required local gates. Full suites normally run in PR CI; expand locally for an explicit requirement or a specific unresolved risk. A failed check does not end an already-authorized repair: fix the in-scope defect and verify it.

## Common Failures

| Claim | Requires | Not Sufficient |
|-------|----------|----------------|
| Tests pass | Applicable test output: 0 failures | Stale result, "should pass", broader claim than coverage |
| Linter clean | Linter output: 0 errors | Partial check, extrapolation |
| Build succeeds | Build command: exit 0 | Linter passing, logs look good |
| Bug fixed | Test original symptom: passes | Code changed, assumed fixed |
| Regression test works | Red-green cycle verified | Test passes once |
| Agent completed | Inspect VCS diff and corroborate acceptance evidence | Agent reports "success" |
| Requirements met | Line-by-line checklist | Tests passing |

## Red Flags - STOP

- Using "should", "probably", "seems to"
- Expressing satisfaction before verification ("Great!", "Perfect!", "Done!", etc.)
- About to commit/push/PR without verification
- Trusting agent success reports
- Relying on partial verification
- Thinking "just this once"
- Tired and wanting work over
- **ANY wording implying success without having run verification**

## Rationalization Prevention

| Excuse | Reality |
|--------|---------|
| "Should work now" | RUN the verification |
| "I'm confident" | Confidence ≠ evidence |
| "Just this once" | No exceptions |
| "Linter passed" | Linter ≠ compiler |
| "Agent said success" | Verify independently |
| "I'm tired" | Exhaustion ≠ excuse |
| "Partial check is enough" | A focused check supports its covered scope, not a full-suite or whole-app claim |
| "Different words so rule doesn't apply" | Spirit over letter |

## Key Patterns

**Tests:**
```
✅ [Run test command] [See: 34/34 pass] "All tests pass"
❌ "Should pass now" / "Looks correct"
```

**Regression tests (TDD Red-Green):**
```
✅ In a disposable checkout: preserve test → remove only fix → intended assertion fails → restore fix → passes
   Never mutate an active/dirty worktree for this comparison
❌ "I've written a regression test" (without red-green verification)
```

**Build:**
```
✅ [Run build] [See: exit 0] "Build passes"
❌ "Linter passed" (linter doesn't check compilation)
```

**Requirements:**
```
✅ Re-read plan → Create checklist → Verify each → Report gaps or completion
❌ "Tests pass, phase complete"
```

**Agent delegation:**
```
✅ Agent reports success → Check VCS diff → Verify changes → Report actual state
❌ Trust agent report
```

## When To Apply

**ALWAYS before:**
- ANY variation of success/completion claims
- Statements that imply verified correctness or completion
- Committing, PR creation, task completion
- Moving to next task
- Accepting an agent's completion report

**Rule applies to:**
- Exact phrases
- Paraphrases and synonyms
- Implications of success
- ANY communication suggesting completion/correctness
