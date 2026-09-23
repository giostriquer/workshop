# fix-ci

## What it does

`fix-ci` sees the current branch's CI through to a verdict and fixes what
breaks: it pulls the failing log, decides flake or fault, fixes in-session,
pushes, and re-watches. It is the invocable form of "CI is failing, take a
look."

The fix happens in your session, with the context of the commits that broke the
build. The waiting happens in the read-only `ci-watcher` agent, which never
fixes, reruns, commits or pushes.

Fixes land as ordinary commits: no force-push, amend or history rewrite. It
fixes only the cause of the red check and reports unrelated failures and
dirty-tree changes rather than sweeping them in. It never deletes, skips or
weakens a check. It stops after **two fix attempts per failing cause**.

## When to reach for it

When the branch's CI is red and should be fixed, or right after a push when the
checks should be seen through to green.

| The problem | The skill |
| --- | --- |
| CI is red on this branch and should be fixed | `fix-ci` |
| You want a pass/fail verdict and nothing edited | the `ci-watcher` agent |
| A finished branch should become a PR and be tended to green | `file-pr` (it runs this loop) |
| A persistent or unclear bug in the code itself | `systematic-debugging` |
| A failing check is really a question about intended behavior | `fix-ci` reports it as a decision for you |

## The loop

1. **Resolve the target.** Find the branch's PR, or its push-triggered runs if it
   has none. Pin the target SHA with `git rev-parse HEAD`, confirm it matches the
   remote head, and identify the required checks. No branch, no CI or no access
   gets a precise report.
2. **Dispatch one watcher** for that SHA: a separate `ci-watcher` (its agent
   file pins Opus on Claude Code and gpt-6-sol on Codex; pass no model), even
   when your session is idle. Inside it the wait is one background shell loop
   that exits on the first terminal state. It returns at the **first failed
   required check**, listing those still pending, or the moment the PR **merges
   or closes**. Green means every required check passed on the pinned SHA;
   missing, cancelled or superseded checks are not green.
3. **Collect evidence.** `gh run view <run-id> --log-failed`, then read the
   failing step's output. For an external check, surface the link; if the cause
   isn't reachable from the repo, report rather than guess.
4. **Diagnose in repo context.** The branch's own recent commits are the prime
   suspects, ahead of infrastructure.
5. **Flake or fault?** An infra failure with no plausible code cause gets one
   `gh run rerun <run-id> --failed`, noted as a flake. A real fault continues.
6. **Reproduce locally when feasible.** Run the focused failing case before and
   after the fix, plus mandatory local gates; full suites run in PR CI.
7. **Fix in-session**, addressing only the cause.
8. **Commit and push** per the repo's conventions, staging only the fix's files.
   Just before pushing, your session reads the old head's checks once and folds
   any new in-scope failure into the same push. No-commit or no-push
   instructions hold; the report then names the remaining step.
9. **Re-watch** with a new watcher for the new head. A different check failing
   there is a new cause with its own two attempts; the same check failing after
   its second fix ends the loop.

## Common questions

**It re-ran the job instead of fixing anything.** That is the flake path, and it
fires once. If the rerun comes back red, the loop treats it as a fault.

**It stopped after two attempts and left CI red.** That is the cap. Instead of a
third attempt you get the diagnosis, the failing-log excerpt or check link, and a
recommended next step.

**Why won't it just skip the flaky test?** A red check that encodes an
intended-behavior question is reported as a decision for you, not worked around.

**Why did it start fixing while other checks were still running?** The watcher
returns at the first failure. Checks still running when the fix is pushed rerun
on the new head anyway.

**My branch has no PR.** It works the branch's push-triggered runs, pinned to the
target commit. ([decision](../decisions/fix-ci.md))

**Can I keep working while it waits?** Yes. The watcher runs separately; your
session picks up its report and owns the fix. If no watcher can be dispatched, it
reports the monitoring gap rather than polling in your session.

**Why not a Monitor or a background loop in my own session?** *(Claude Code
only.)* Every turn your session spends is billed at its own model, and a Fable
or Astra session is the expensive one; a Monitor also wakes you once per output
line. The watcher's Opus turns are the cheap ones, so the loop lives there. After
dispatching, end your turn: the harness re-invokes you with the watcher's report,
so you do not poll `gh`, arm a Monitor, or read the watcher's output file in the
meantime.

**The watcher came back with checks still pending.** Its watch window is bounded
(ten minutes unless set otherwise). Pending is reported as pending, with the next
action, never as green.

**The PR merged while the watcher was running.** It returns right then with
`merged`, the merge time and the checks' state at that moment; it does not wait
for checks still running on the merged head. A closed PR returns `closed` the
same way, and the loop ends.

**My unrelated changes didn't get committed.** Correct: it stages only files the
fix touched and reports the rest.

**Non-GitHub CI?** It assumes `gh`.

## It's working if

- The diagnosis quotes the failing step's output. **Negative signal:** a
  diagnosis offered before any log was pulled.
- Each attempt reports what failed, the root cause, and what changed (files and
  commit).
- The final report names the verdict, target SHA, expected checks, watcher model,
  and PR or run link.
- The fix commit touches only what the failure required.
- The first fix lands while other checks from the same run are still running.
- **Negative signal:** a force-push, an amended commit, a skipped test, a third
  attempt on one cause, or a second watcher on the same head.

## Where it fits

`fix-ci` tends the checks in the landing stage, after `file-pr`, a merge, or a
push. `file-pr` runs this loop rather than duplicating it. The `ci-watcher` agent
is its read-only watch half.
