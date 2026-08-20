---
name: fix-ci
description: Use when the current branch's CI is failing ("CI is failing, take a look"), after a push to see the checks through to green, or when a red check needs diagnosing and fixing.
---

# Fix CI

## Trigger

Use when the current branch's CI is red and should be fixed, or right after a push
when the checks should be seen through to green. This is the invocable form of the
recurring one-liner "CI is failing, take a look."

## Workflow

1. **Resolve the target.** `git branch --show-current`, then `gh pr view --json
   number,url,headRefName`. If the branch has a PR, work its checks. If it has no PR
   but CI runs on push (e.g. a direct-to-main workflow), work the branch's runs
   instead: `gh run list --branch <branch> --limit 5`. No branch, no CI, or
   unauthenticated `gh` → report that plainly and stop.
2. **Read the state.** PR: `gh pr checks --json name,bucket,state,workflow,link`.
   Runs: `gh run list` / `gh run view <run-id>`.
   - All green → report green; done.
   - Pending → watch it: `gh pr checks --watch --fail-fast` (or `gh run watch
     <run-id>`) when the session is otherwise idle; if other work should continue,
     dispatch the `ci-watcher` agent in the background and pick up its report.
3. **Red → collect evidence first.** GitHub Actions: `gh run view <run-id>
   --log-failed` and read the failing step's actual output. External checks: surface
   the link; if the cause isn't reachable from the repo, report rather than guess.
4. **Diagnose in repo context.** The branch's own recent commits are the prime
   suspects: check `git log` and the diff against the base branch before suspecting
   infrastructure.
5. **Flake or fault?** An infra failure with no plausible code cause (runner died,
   network timeout, unrelated job) → `gh run rerun <run-id> --failed` once, note the
   flake, and return to watching. A real fault → continue.
6. **Reproduce locally when feasible.** Run the failing step's local equivalent
   (read the workflow file for the command) before the fix and again after it.
7. **Fix minimally, in-session.** Address the cause of the red check and nothing
   broader.
8. **Commit and push per the repo's conventions**: pull first, use the repo's own
   push skill if it ships one, and stage only the files the fix touched.
9. **Re-watch** (step 2). Hard cap: **two fix attempts** (plus the single flake
   rerun). Still red after that → stop and report the diagnosis and recommended next
   step instead of thrashing.

## Output

- Final CI verdict (green / still red / blocked), with the PR or run link.
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
- The fix itself stays in this session. The `ci-watcher` agent may be dispatched for
  the waiting, never for the fixing.
