---
name: fix-ci
description: Use when the current branch's CI is failing ("CI is failing, take a look"), after a push to see the checks through to green, or when a red check needs diagnosing and fixing.
---

# Fix CI

## Trigger

Use when the current branch's CI is red and should be fixed, or right after a push
when the checks should be seen through to green. This is the invocable form of the
recurring one-liner "CI is failing, take a look."

## CI watcher routing

All CI polling and watch commands run in a separate read-only agent, even when
the parent is idle: **Opus (`opus`) on Claude; `gpt-5.6-sol` on Codex**. Never
use Astra or Fable for watching, and never inherit those models into the watcher.
An Opus/Sol parent still dispatches a separate designated-model agent. If the
host cannot dispatch it, report the monitoring gap rather than polling in the
parent or choosing a prohibited fallback. Haiku and Sonnet remain prohibited.
The parent owns diagnosis and repairs; the watcher only gathers CI evidence.

## Workflow

1. **Resolve the target.** `git branch --show-current`, then `gh pr view --json
   number,url,headRefName`. If the branch has a PR, work its checks. If it has no PR
   but CI runs on push (e.g. a direct-to-main workflow), work the branch's runs
   instead: `gh run list --branch <branch> --commit <sha> --limit 5`. Pin the
   target SHA with `git rev-parse HEAD`, compare it with the remote PR/run head,
   and identify the required checks. No branch, no CI, or unavailable access
   gets a precise report; missing checks are not green.
2. **Have the designated watcher read and watch the state.** PR: `gh pr checks --json name,bucket,state,workflow,link`.
   Runs: `gh run list` / `gh run view <run-id>`.
   - All required checks green for the target SHA → report green; done.
   - Pending → the watcher runs `gh pr checks --watch --fail-fast` or
     `gh run watch <run-id>`, within its bounded watch window.
   - Old-head, missing, cancelled, or superseded checks → report that state,
     not green. A new push requires a newly pinned target SHA.
3. **Red → collect evidence first.** GitHub Actions: `gh run view <run-id>
   --log-failed` and read the failing step's actual output. External checks: surface
   the link; if the cause isn't reachable from the repo, report rather than guess.
4. **Diagnose in repo context.** The branch's own recent commits are the prime
   suspects: check `git log` and the diff against the base branch before suspecting
   infrastructure.
5. **Flake or fault?** An infra failure with no plausible code cause (runner died,
   network timeout, unrelated job) → `gh run rerun <run-id> --failed` once, note the
   flake, and return to watching. A real fault → continue.
6. **Reproduce locally when feasible.** Read the failing workflow command and
   run the relevant focused case before the fix and again after it. Keep mandatory
   local gates. Full suites run in PR CI by default; a wider local run needs an
   explicit repo/user requirement or a named unresolved integration risk.
7. **Fix in-session.** Address the cause of the red check; do not bundle
   unrelated changes into the fix.
8. **Commit and push per the repo's conventions**: pull first, use the repo's own
   push skill if it ships one, and stage only the files the fix touched. Carry
   existing authority forward and honor no-commit/no-push instructions. If delivery
   is unavailable, finish the authorized local repair and name the remaining step.
9. **Re-watch** (step 2). Hard cap: **two fix attempts** (plus the single flake
   rerun). Still red after that → stop and report the diagnosis and recommended next
   step instead of thrashing.

## Output

- Final CI verdict (green / still red / pending / superseded / blocked), target
  SHA, expected checks, watcher model, and PR/run link. Name the immediate next step.
- Per attempt: what failed, the root cause, and what changed (files + commit).
- If not fixed: the diagnosis, the failing-log excerpt or check link, and the
  recommended next step.

## Boundaries

- Never force-push, amend, or rewrite published history; fixes land as ordinary
  commits on the current branch.
- Fix only the cause of the red check. Unrelated failures and pre-existing dirty-tree
  changes are reported, never swept into the fix commit.
- Never delete, skip, or weaken a failing test or check to get to green: a red check
  that encodes an intended-behavior question is reported as a decision for the user,
  not worked around.
- Two fix attempts maximum; a repeating failure is a finding, not an invitation to
  iterate blindly.
- The fix stays in the implementing session. The designated `ci-watcher` agent
  always owns watching; it never fixes, reruns workflows, commits, or pushes.
