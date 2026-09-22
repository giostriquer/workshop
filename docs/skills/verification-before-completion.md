# verification-before-completion

## What it does

This skill requires evidence before any claim that work is complete, fixed, or
passing: "NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE." Identify
the check that backs the claim. Run it, or reuse a result that is still valid.
Read the full output, and claim only what the output supports. If the check
fails, report the actual status with evidence. Any repair that is in scope and
already authorized continues after that.

It is an **always-on gate**, one of the flow's two defaults alongside the
adversarial review. It turns off only for an explicit user decline or a repo
process that replaces it. A small diff, confidence, or time pressure don't
count as reasons to skip it.

## When to reach for it

You don't reach for it. It fires on the claim, not the task. That means before
any success or completion claim, commit, PR, task hand-off, or move to the next
task, and before you accept an agent's completion report. Paraphrases count
too: "that looks right now" is a claim.

| The problem | The skill |
| --- | --- |
| About to claim done, fixed, or passing | `verification-before-completion` |
| One change with a drivable surface, proven at the running app | `empirical-proof` (on your ask) |
| A release, branch, or feature area at team scale | `qa-sweep` (on your ask) |
| The branch is ready to become a PR | `file-pr` |

## The gate function

1. **Identify** the check or observation that backs the claim.
2. **Run or reuse** the complete relevant check.
3. **Read** the full output, the exit code, and the failure count.
4. **Verify** that the output confirms the claim. If it doesn't, state the
   actual status with evidence.
5. **Only then** make the claim.

Evidence stays fresh while the relevant revision, inputs, dependencies,
configuration, and runtime state stay the same. Use focused local checks and
the required local gates. Full suites normally run in PR CI.

| Claim | Requires | Not sufficient |
| --- | --- | --- |
| Tests pass | Test output, 0 failures | Stale result, "should pass", a claim broader than coverage |
| Linter clean | Linter output, 0 errors | Partial check, extrapolation |
| Build succeeds | Build exits 0 | Linter passing, logs look fine |
| Bug fixed | Original symptom retested, passing | Code changed, fix assumed |
| Regression test works | Verified red-green cycle | Test passes once |
| Agent completed | Diff inspected, acceptance evidence corroborated | Agent says "success" |
| Requirements met | Line-by-line checklist | Tests passing |

To prove a regression test, use a disposable checkout. Remove only the fix,
watch the intended assertion fail, then restore the fix and watch it pass.

## Common questions

**I ran the tests three messages ago and changed nothing. Do I rerun?**
No. Passing messages don't make evidence stale. Changing the relevant state
does, and that includes runtime configuration.

**A subagent reported success. Is that evidence?**
No. Inspect the diff and corroborate the acceptance evidence.

**Does saying "Great!" or "Done!" count?**
Yes. Showing satisfaction before verifying is a named red flag.

**Does every runnable change need `empirical-proof`?**
No. It's an expensive tier. The session offers it and runs it only on your
ask, a standing rule, or a repo gate that requires it
([decision](../decisions/workbench-operator-decisions.md)).

**What if no command can prove the claim?**
Prove the deliverable the way its real consumer would use it, and record the
evidence.

**Can I still report failures?**
Yes. "Three tests still fail, here is the output" passes the gate, and "should
be fine now" doesn't.

## It's working if

- Every completion claim cites current evidence and stays inside what that
  evidence covers.
- Failures show up as failures, with the output attached.
- Claims about agent work rest on the diff, not on the agent's summary.
- Regression tests were seen failing before anyone trusted them.
- **Not working:** the gate gets named but no evidence is cited, it's used as a
  reason to run an expensive protocol nobody asked for, or stale evidence gets
  reused.

## Where it fits

This gate opens the flow's completion block by establishing "deemed ready":
verified, with evidence. Only after that does the required adversarial review
run, once, right before the PR-or-merge question. When you ask for it,
`empirical-proof` goes deeper at the running software.
