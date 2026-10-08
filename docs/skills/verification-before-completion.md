# verification-before-completion

## What it does

This skill requires evidence before any claim that work is complete, fixed, or
passing: "NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE." Identify
the check that backs the claim. Run it, or reuse a result that is still valid.
Read the full output, and claim only what the output supports. If the check
fails, report the actual status with evidence. Any repair that is in scope and
already authorized continues after that.

For behavioral completion, it uses `empirical-proof` by default to exercise
the affected user or consumer boundary on the changed artifact. Existing
checks count when they already establish that result.

It is an **always-on gate**, one of the flow's two defaults alongside the
adversarial review. It turns off only for an explicit user decline or a repo
process that replaces it. A small diff, confidence, or time pressure don't
count as reasons to skip it.

## When to reach for it

It applies while finishing a change and before its completion claim. That means before
any success or completion claim, commit, PR, task hand-off, or move to the next
task, and before you accept an agent's completion report. Paraphrases count
too: "that looks right now" is a claim.

| The problem | The skill |
| --- | --- |
| About to claim done, fixed, or passing | `verification-before-completion` |
| Completing one behavioral change through its real consumer | `empirical-proof` (default; reuse adequate evidence) |
| A release, branch, or feature area at team scale | `qa-sweep` (on your ask) |
| The branch is ready to become a PR | `file-pr` |

## The gate function

1. **Identify** the claimed outcome and the boundary or artifact that demonstrates it.
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
| Bug fixed | Original symptom checked through the affected consumer boundary on the changed artifact, passing | Green tests that bypass the failing path |
| App or UI state ("the button appears") | Seen in the changed running build, naming the flow and observation; images inspected for visual claims | Tests, mocks, an old installed build, or an unchecked-app disclosure treated as completion |
| Regression test works | Verified red-green cycle | Test passes once |
| Agent completed | Diff inspected, acceptance evidence corroborated | Agent says "success" |
| Requirements met | Line-by-line checklist | Tests passing |
| Measured performance comparison | Revision, workload/configuration, completed correct work, errors, repetitions/spread, limiter or uncertainty | Fast errors, scheduling-only timing, unequal tuning, or a micro result claimed for the whole operation |

Confounded or incomplete comparisons are inconclusive. An explicitly requested
one-run ballpark can report a validated observation labeled as one run. Missing
evidence limits the claim; it does not require a benchmark campaign or Toolkit.

To prove a regression test, use a disposable checkout. Remove only the fix,
inspect the diff against pristine source to confirm the change landed, watch
the intended assertion fail, then restore the fix and watch it pass.

## Common questions

**I ran the tests three messages ago and changed nothing. Do I rerun?**
No. Passing messages don't make evidence stale. Changing the relevant state
does, and that includes runtime configuration.

**A subagent reported success. Is that evidence?**
No. Inspect the diff and corroborate the acceptance evidence.

**Does saying "Great!" or "Done!" count?**
Yes. Showing satisfaction before verifying is a named red flag.

**Does a behavioral change need `empirical-proof`?**
Yes, by default, including a refactor's preserved behavior. This can reuse an
existing real-boundary check; it does not add an automatic video, team, full
suite, or permanent harness. A public-interface library test can suffice.
Explicit user declines and superseding repo rules retain precedence.

**A UI fix was checked only with tests and a mock screen. What happens next?**
The session drives the affected flow in the changed app before claiming it
complete. If documented setup cannot make the route available, it reports
verification incomplete, naming what ran, the attempted setup, the concrete
blocker, and the remaining check. Independent work continues. It does not
use an unauthorized account or restart your session to obtain a pass.

**I explicitly asked to skip runtime verification.**
That instruction wins. The report names the skipped check and unverified
behavior; it does not label the check passed.

**Does a spelling fix or a linter status need an app launch?**
No. Research and documents use relevant source or artifact checks, with a
render for visual claims. Behavioral skill changes use consuming-agent
scenarios. A claim limited to a linter, test, or build uses that check's
output and makes no claim that the unfinished feature is complete.

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
- Behavioral completion rests on the affected real consumer path on the
  changed artifact; blocked checks remain explicitly incomplete.
- Regression tests were seen failing before anyone trusted them.
- **Not working:** the gate gets named but no evidence is cited, it triggers broad QA or
  duplicate checks without cause, or stale evidence gets
  reused.

## Where it fits

This gate opens the flow's completion block by establishing "deemed ready":
verified, with evidence. Only after that do the comment trim and the required
adversarial review run, once, right before the PR-or-merge question.
`empirical-proof` supplies focused consumer proof for behavioral completion.
