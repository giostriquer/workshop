# verification-before-completion

## What it does

This skill requires evidence before completion claims. Identify the relevant check or observation, run it or reuse a still-valid result, read the complete result and exit status where applicable, and state the claim within that scope. Freshness depends on the relevant revision, inputs, dependencies, configuration, and runtime state.

It is an **always-on gate**, not a tool you pick up when it seems relevant. In the workbench flow it is one of only two pieces that fire by default rather than on relevance (the other is `code-quality-review`). It runs unless the user explicitly declines it or the repo's own process supersedes it. A small diff, a confident implementation, or time pressure are not exits, and neither is the session's own judgment that this particular claim is safe. The skill anticipates the argument and closes it: **"Violating the letter of this rule is violating the spirit of this rule."**

The gate requires an honest result when verification fails. Preserve that evidence, then continue an already-authorized in-scope repair and recheck the affected result. Focused checks support focused claims; runtime proof is offered unless requested or required by a standing gate.

## When to reach for it

You do not reach for it. It fires on the claim, not on the task. The skill lists what it precedes: **"ANY variation of success/completion claims"**, statements that imply correctness or completion, committing, PR creation, task completion, moving to the next task, and accepting agents' completion reports. It applies to exact phrases, paraphrases, synonyms, implications of success, and "ANY communication suggesting completion/correctness", so rephrasing "tests pass" as "that looks right now" does not route around it.

In the workbench flow this gate is what "deemed ready" means. An implementation may not proceed to its adversarial review until the claims about it carry fresh verification evidence.

| The problem | The skill |
| --- | --- |
| You are about to claim done, fixed, or passing | `verification-before-completion` |
| One just-finished change touched a surface a real client can drive, and you want proof at the running app | `empirical-proof` (expensive; run only on your explicit ask or standing rule) |
| A whole release, branch, or feature area needs a broad verification pass at team scale | `qa-sweep` (expensive; same authority rule) |
| A premise, ticket, or hunch needs investigating before you act on it | `claim-check` |
| The branch is ready and needs to become a PR | `file-pr` assumes the other gates ran and explicitly checks that the adversarial review covers the current change |

## The gate function

Five steps, in order, before a claim implying correctness or completion:

1. **Identify** what check or observation substantiates this claim.
2. **Run or reuse** the complete relevant check, reusing evidence while its relevant state remains unchanged.
3. **Read** the full output, check the exit code, count failures.
4. **Verify** that the output actually confirms the claim. If it does not, state the real status with evidence. If it does, state the claim with the evidence.
5. **Only then** make the claim.

The gate function preserves identify, run/reuse, read, verify, and claim. A new message or unrelated edit does not invalidate evidence; a changed runtime configuration can invalidate it without any source edit.

What each common claim actually requires:

| Claim | Requires | Not sufficient |
| --- | --- | --- |
| Tests pass | Test command output, 0 failures | A stale result, "should pass", a claim broader than coverage |
| Linter clean | Linter output, 0 errors | A partial check, extrapolation |
| Build succeeds | Build command, exit 0 | Linter passing, logs looking good |
| Bug fixed | The original symptom retested, passing | Code changed, fix assumed |
| Regression test works | A verified red-green cycle | The test passing once |
| Agent completed | Inspect the diff and corroborate acceptance evidence | The agent reporting "success" |
| Requirements met | A line-by-line checklist | Tests passing |

The regression-test row is the one people underestimate. The pattern the skill wants is preserve the test in a disposable checkout, remove only the fix, require the intended assertion to **fail**, restore the fix there, and run it green again. Writing the test and seeing it pass once proves nothing about whether it would have caught the bug.

The skill also carries a rationalization table naming the excuses it expects to hear: "should work now", "I'm confident", "just this once", "linter passed", "agent said success", "I'm tired", "partial check is enough", and the meta-dodge, "different words so the rule doesn't apply". The answers are terse: confidence is not evidence, a linter is not a compiler, partial evidence supports only its covered claim, spirit over letter.

## Common questions

**I ran the tests three messages ago and haven't touched the code since. Do I really re-run?**
No, if the relevant revision, inputs, dependencies, configuration, and runtime state remain unchanged. Cite that evidence accurately and rerun after relevant invalidation, not after a message boundary.

**A subagent reported success. Is that evidence?**
A summary alone is insufficient. Inspect the actual diff and corroborate the task's acceptance evidence. Dispatching work does not itself require completion verification; accepting a returned completion claim does.

**Does saying "Great!" or "Perfect!" really count as a claim?**
Only when it implies correctness or completion of the work. Ordinary courtesy or satisfaction without that implication is not a verification claim.

**Does this mean every runnable change needs `empirical-proof`?**
No, and this was corrected after field feedback. The flow's earlier wording (`empirical-proof` described as "the deeper sibling", offered "if runnable") read to sessions as an instruction to run it whenever a change qualified. `empirical-proof` and `qa-sweep` are expensive workflows involving subagent fan-outs, booted apps, and corroboration loops. The rule now is that this gate is the only always-on verification piece, and the expensive tiers are offered and run only on the user's explicit ask or a standing rule ([decision](../decisions/expensive-verification-user-optioned.md)).

**What if there is no command that proves the claim?**
Use the relevant check or observation; command output is not the only form of evidence. The flow's standing answer also applies: when no frame fits the work's shape, keep the standard and drop the frame: prove the deliverable the way its real consumer would exercise it, and record the evidence.

**Does the gate stop me from reporting bad news?**
No. Step 4's failure branch is to state the actual status with evidence. A verified "three tests still fail, here is the output" clears the gate; an unverified "should be fine now" does not.

**Is this expensive?**
It is the cheap one, deliberately. A field round flagged verification ceremony as an attention tax and asked which pieces earn their cost; the answer preserved this gate untouched and made the heavyweight protocols user-optioned instead ([decision](../decisions/verification-shape-feedback.md)).

## It's working if

- Every completion claim cites applicable evidence for the relevant unchanged state and stays within its coverage.
- Failures get reported as failures, with output, instead of being softened into "should work now".
- Claims about agent work reflect diff inspection and corroborated acceptance evidence, not only the agent's summary.
- Regression tests were watched failing before they were trusted.

Negative signals: the skill is being misapplied if:

- The session names the gate but neither runs an applicable check nor cites still-current evidence. Naming the skill is not evidence.
- The gate is used as a reason to launch an expensive verification protocol nobody asked for. This gate asks for the verification command, not for a booted app and a subagent fan-out.
- Verification output is reused after relevant changes invalidated it.

## Where it fits

This is the entry point to the flow's COMPLETION block. Once a work-stream's implementation is believed complete, the test-quality review runs, then this gate establishes "deemed ready": verified, with evidence. Only then does the required adversarial `code-quality-review` fire, once, right before the PR-or-merge question. If the change has a drivable surface and you want proof at the running software, `empirical-proof` deepens this gate, but you have to ask for it.
