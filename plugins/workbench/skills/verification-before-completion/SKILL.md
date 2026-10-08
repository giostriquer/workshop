---
name: verification-before-completion
description: Use while finishing a change or before reporting it complete, fixed, ready, or passing, including when tests pass but the user-visible result has not been checked.
---

# Verification Before Completion

## Overview

**Core principle:** Evidence before claims, always.

**Violating the letter of this rule is violating the spirit of this rule.**

In the workbench flow, this skill defines **"deemed ready"**: an implementation may
proceed to its adversarial review only once the claims about it carry fresh
verification evidence. For behavioral changes, use `empirical-proof` to check
the affected user or consumer boundary before claiming completion or readiness.
This is the default, without another offer or permission exchange. Existing
checks can satisfy it when they exercise the relevant boundary and artifact.

## The Iron Law

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

Evidence stays fresh while its relevant revision, inputs, dependencies, configuration, and runtime state remain unchanged. Reuse it across messages and unrelated edits. Rerun affected checks when that state changes, and bind the claim to what was actually checked.

## The Gate Function

```
BEFORE claiming completion, correctness, or a passing check:

1. IDENTIFY: What outcome is claimed, and what boundary or artifact can demonstrate it?
2. RUN or REUSE: Run the complete relevant check, or reuse valid evidence for unchanged relevant state
3. READ: Full output, check exit code, count failures
4. VERIFY: Does output confirm the claim?
   - If NO: State actual status with evidence
   - If YES: State claim WITH evidence
5. ONLY THEN: Make the claim

Skip any step = lying, not verifying
```

Use focused local checks and required local gates. Full suites normally run in PR CI; expand locally for an explicit requirement or a specific unresolved risk. A failed check does not end an already-authorized repair: fix the in-scope defect and verify it.

## Match proof to the deliverable

For a feature or fix, exercise the affected behavior through its actual user or
consumer boundary on an artifact containing the change. For a refactor, compare
the preserved behavior at the affected boundary. Check the result and relevant
side effects. A real public-interface test can suffice for a library claim;
a mocked component test cannot establish what a running app shows. Use
`empirical-proof` for the surface-specific route and artifact identity checks.

Reuse evidence that already meets this bar. No extra run, recording, agent team,
full suite, or permanent harness is required merely to invoke the skill.
Claims limited to a test or build need that check's evidence, not an unrelated
app launch. Research and document edits use source or artifact inspection and
relevant checks; inspect a render for visual claims, and exercise behavioral
agent instructions through consuming-agent scenarios.

If required proof is unavailable, try reasonable documented setup within task
authority, continue independent checks, and report **verification incomplete**:
what was checked, what was attempted, the concrete blocker, and what remains.
Disclosing an unchecked app does not complete behavioral verification. Do not
invent integration evidence or use unauthorized accounts to get a pass.
An explicit user decline or superseding repo process changes the required
checks; name that instruction and the unverified behavior, never report a
waived check as passed. Preserve user-owned sessions and data.

## Common Failures

| Claim | Requires | Not Sufficient |
|-------|----------|----------------|
| Tests pass | Applicable test output: 0 failures | Stale result, "should pass", broader claim than coverage |
| Linter clean | Linter output: 0 errors | Partial check, extrapolation |
| Build succeeds | Build command: exit 0 | Linter passing, logs look good |
| Bug fixed | Original symptom checked through the affected consumer boundary on the changed artifact: passes | Code changed, a green test that bypasses the failing path |
| App or UI state ("the button appears", "the crash is fixed in the app") | Seen in the changed running build; name the flow and observation, inspect images for visual claims | Tests, fixtures, mock screens, an old installed build, or an unchecked-app disclosure treated as completion |
| Regression test works | Red-green cycle verified | Test passes once |
| Agent completed | Inspect VCS diff and corroborate acceptance evidence | Agent reports "success" |
| Requirements met | Line-by-line checklist | Tests passing |
| Measured performance improvement or option comparison | Revision, workload/configurations, completed correct work and error counts, repeated comparable runs with spread, and an observed limiter or explicit uncertainty | One fast run, scheduling time reported as completion, fast errors, unequal tuning, or a micro result promoted to end-to-end |

For performance claims, report only the comparison the evidence supports.
Unchecked work or correctness and confounded comparisons are inconclusive.
An unknown cause limits causal and adoption claims. A requested one-run
ballpark may report a validated observation labeled as one run. This floor
does not require Toolkit, profiling, or a benchmark campaign for unrelated work.

## Red Flags - STOP

- Using "should", "probably", "seems to"
- Expressing satisfaction before verification ("Great!", "Perfect!", "Done!", etc.)
- About to commit/push/PR without verification
- Trusting agent success reports
- Relying on partial verification
- Thinking "just this once"
- Tired and wanting work over
- **ANY wording implying success without valid verification evidence**

## Rationalization Prevention

| Excuse | Reality |
|--------|---------|
| "Should work now" | Run the relevant check or inspect valid existing evidence |
| "I'm confident" | Confidence ≠ evidence |
| "Just this once" | Convenience does not waive a required check |
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
✅ In a disposable checkout: preserve test → remove only fix → inspect diff against pristine source → intended assertion fails → restore fix → passes
   Never mutate an active/dirty worktree for this comparison
❌ "I've written a regression test" (without red-green verification)
```

**Build:**
```
✅ [Run build] [See: exit 0] "Build passes"
❌ "Linter passed" (linter doesn't check compilation)
```

**App or UI state:**
```
✅ [Drove the flow in the running build] [Screenshot: Export visible] "Seen in the running build: admins get the Export button (screenshot)"
✅ "Verification incomplete: the unit test passes, but the changed app cannot launch without the test service. Startup was attempted; the Export flow remains unchecked."
❌ "Admins now get the Export button" (from a unit test and a mock screen)
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
