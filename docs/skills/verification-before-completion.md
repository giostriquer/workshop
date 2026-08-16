# verification-before-completion

## What it does

This skill stops you from saying work is done until you have run the thing that proves it. Its core principle is one line: **"Evidence before claims, always."** Before any statement that something is complete, fixed, passing, or working, you identify the command that would prove the claim, run it fresh and in full, read the output including the exit code, and only then speak, with the evidence attached.

It is an **always-on gate**, not a tool you pick up when it seems relevant. In the workbench flow it is one of only two pieces that fire by default rather than on relevance (the other is `code-quality-review`). It runs unless the user explicitly declines it or the repo's own process supersedes it. A small diff, a confident implementation, or time pressure are not exits, and neither is the session's own judgment that this particular claim is safe. The skill anticipates the argument and closes it: **"Violating the letter of this rule is violating the spirit of this rule."**

It is a gate on language, not a repair step. It fixes nothing. When verification fails, the skill's instruction is to **"State actual status with evidence"**: reporting the failure honestly satisfies the gate exactly as well as reporting success does. It also does not decide *how deep* verification should go. Running the test suite satisfies it; driving the running app is the deeper sibling `empirical-proof`, which is offered, never automatic. This gate is the cheap floor underneath all of it.

## When to reach for it

You do not reach for it. It fires on the claim, not on the task. The skill lists what it precedes: **"ANY variation of success/completion claims"**, any expression of satisfaction, any positive statement about work state, committing, PR creation, task completion, moving to the next task, and delegating to agents. It applies to exact phrases, paraphrases, synonyms, implications of success, and "ANY communication suggesting completion/correctness", so rephrasing "tests pass" as "that looks right now" does not route around it.

In the workbench flow this gate is what "deemed ready" means. An implementation may not proceed to its adversarial review until the claims about it carry fresh verification evidence.

| The problem | The skill |
| --- | --- |
| You are about to claim done, fixed, or passing | `verification-before-completion` |
| One just-finished change touched a surface a real client can drive, and you want proof at the running app | `empirical-proof` (expensive; run only on your explicit ask or standing rule) |
| A whole release, branch, or feature area needs a broad verification pass at team scale | `qa-sweep` (expensive; same authority rule) |
| A premise, ticket, or hunch needs investigating before you act on it | `claim-check` |
| The branch is ready and needs to become a PR | `file-pr` assumes the gates already ran |

## The gate function

Five steps, in order, before any status claim or expression of satisfaction:

1. **Identify** what command proves this claim.
2. **Run** the full command, fresh and complete.
3. **Read** the full output, check the exit code, count failures.
4. **Verify** that the output actually confirms the claim. If it does not, state the real status with evidence. If it does, state the claim with the evidence.
5. **Only then** make the claim.

The skill's summary of what happens when you compress this: **"Skip any step = lying, not verifying."** And the Iron Law that governs freshness: **"If you haven't run the verification command in this message, you cannot claim it passes."**

What each common claim actually requires:

| Claim | Requires | Not sufficient |
| --- | --- | --- |
| Tests pass | Test command output, 0 failures | A previous run, "should pass" |
| Linter clean | Linter output, 0 errors | A partial check, extrapolation |
| Build succeeds | Build command, exit 0 | Linter passing, logs looking good |
| Bug fixed | The original symptom retested, passing | Code changed, fix assumed |
| Regression test works | A verified red-green cycle | The test passing once |
| Agent completed | A VCS diff showing the changes | The agent reporting "success" |
| Requirements met | A line-by-line checklist | Tests passing |

The regression-test row is the one people underestimate. The pattern the skill wants is write the test, run it green, revert the fix, run it and watch it **fail**, restore the fix, run it green again. Writing the test and seeing it pass once proves nothing about whether it would have caught the bug.

The skill also carries a rationalization table naming the excuses it expects to hear: "should work now", "I'm confident", "just this once", "linter passed", "agent said success", "I'm tired", "partial check is enough", and the meta-dodge, "different words so the rule doesn't apply". The answers are terse: confidence is not evidence, a linter is not a compiler, partial proves nothing, spirit over letter.

## Common questions

**I ran the tests three messages ago and haven't touched the code since. Do I really re-run?**
Yes. The Iron Law is scoped to the message you are writing in: if you have not run the command *in this message*, you cannot claim it passes. This is the rule most often negotiated away, which is why it is stated as an absolute rather than a heuristic.

**A subagent reported success. Is that evidence?**
No. "Agent completed" requires a VCS diff showing the changes; "agent reports success" is explicitly listed as not sufficient, and "trusting agent success reports" appears in the red-flags list. Verify independently. The same applies in the other direction: the gate is listed as applying *before* delegating to agents too.

**Does saying "Great!" or "Perfect!" really count as a claim?**
The skill says yes: "expressing satisfaction before verification" is a red flag in its own right, and the rule covers implications of success, not just declarations of it.

**Does this mean every runnable change needs `empirical-proof`?**
No, and this was corrected after field feedback. The flow's earlier wording (`empirical-proof` described as "the deeper sibling", offered "if runnable") read to sessions as an instruction to run it whenever a change qualified. `empirical-proof` and `qa-sweep` are expensive workflows involving subagent fan-outs, booted apps, and corroboration loops. The rule now is that this gate is the only always-on verification piece, and the expensive tiers are offered and run only on the user's explicit ask or a standing rule ([decision](../decisions/expensive-verification-user-optioned.md)).

**What if there is no command that proves the claim?**
The skill itself does not answer this. The flow's standing answer does: when no frame fits the work's shape, keep the standard and drop the frame: prove the deliverable the way its real consumer would exercise it, and record the evidence.

**Does the gate stop me from reporting bad news?**
No. Step 4's failure branch is to state the actual status with evidence. A verified "three tests still fail, here is the output" clears the gate; an unverified "should be fine now" does not.

**Is this expensive?**
It is the cheap one, deliberately. A field round flagged verification ceremony as an attention tax and asked which pieces earn their cost; the answer preserved this gate untouched and made the heavyweight protocols user-optioned instead ([decision](../decisions/verification-shape-feedback.md)).

## It's working if

- Every completion claim in the transcript has command output sitting next to it, in the same message.
- Failures get reported as failures, with output, instead of being softened into "should work now".
- Claims about agent work cite a diff, not the agent's own summary.
- Regression tests were watched failing before they were trusted.

Negative signals: the skill is being misapplied if:

- The session announces the gate and then makes the claim without running anything. Naming the skill is not evidence.
- The gate is used as a reason to launch an expensive verification protocol nobody asked for. This gate asks for the verification command, not for a booted app and a subagent fan-out.
- Verification output is quoted from an earlier run rather than a fresh one.

## Where it fits

This is the entry point to the flow's COMPLETION block. Once a work-stream's implementation is believed complete, the test-quality review runs, then this gate establishes "deemed ready": verified, with evidence. Only then does the required adversarial `code-quality-review` fire, once, right before the PR-or-merge question. If the change has a drivable surface and you want proof at the running software, `empirical-proof` deepens this gate, but you have to ask for it.
