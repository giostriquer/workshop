---
name: fix-ci
description: Use when the current branch's CI is failing ("CI is failing, take a look"), after a push to see the checks through to green, or when a red check needs diagnosing and fixing.
---

# Fix CI

## Trigger

Use when the current branch's CI is red and should be fixed, or right after a push
when the checks should be seen through to green. This is the invocable form of the
recurring one-liner "CI is failing, take a look."

## Who waits, and where

The wait is one shell loop that polls the PR state and its checks every thirty
seconds and exits on the first terminal state: a failed check, the PR merged or
closed, no check pending, a moved head, or its own deadline. The `ci-watcher`
agent carries that loop on every host, even when the parent is idle: every
parent turn spent waiting costs the parent model's tokens, and a Fable or
Astra parent is the expensive one. Dispatch `ci-watcher` by name with no model
(on Codex, paste the agent file, `agents/ci-watcher.md` two directories above
this `SKILL.md`, and use its Dispatch line, per `using-workbench`'s *Workbench
agents on Codex*), with the PR, the pinned head SHA and the deadline. Never
watch inside the parent's own turns, and never route the watcher to Haiku or
Sonnet. If the host cannot dispatch the agent, report the monitoring gap rather
than polling in the parent. The parent owns diagnosis and repairs; the watcher
only gathers CI evidence.

Host notes, of which only the first is Claude Code behavior:

- **Claude Code only.** The dispatch runs in the background and the parent is
  re-invoked by the watcher's handback notification, so the parent ends its
  turn after dispatching and runs no `gh pr checks`, `gh run view`, Monitor or
  read of the watcher's output file in the meantime. Inside the watcher, the
  loop runs in foreground Bash calls that each end before the tool's
  ten-minute limit, so the watcher's turn never ends early and the parent is
  re-invoked once, by the handback. A host that raises the limit with
  `BASH_MAX_TIMEOUT_MS` (to eleven minutes or more for the default window)
  lets one call cover the whole window.
- **Codex.** After `spawn_agent`, call `wait_agent` with `timeout_ms: 600000`
  and repeat until the watcher's final answer. Do not end the turn meanwhile:
  a finished child does not wake the parent. Run no `gh` read or `sleep`
  between waits, and do not ask the watcher for progress updates. A
  follow-up to a returned watcher follows `using-workbench`'s *Workbench
  agents on Codex*: a new pinned head and nothing else. The flake rerun's
  watcher is therefore a fresh spawn, since its head is not new, and the fix,
  the commit and the push stay in this session.
- **Other hosts.** The parent dispatches the watcher and waits for its return
  through the host's mechanism; it does not poll `gh` itself.

**One watcher per pinned head.** Reading the state and watching it are one
dispatch, not two. Never dispatch a second watcher on a head whose watcher is
still running or has returned red; the checks it listed as pending are not
watched further, since they rerun on the next head. A re-watch after a push is
a new head and therefore a new watcher. The flake rerun is the one same-head
re-watch: step 5 dispatches one watcher for the head, naming the rerun's run
id and the attempt that failed, and that watcher waits for the new attempt,
then watches every check on the head. No other second watcher on a red head.
The rule covers polling and watching; a single `gh pr checks` or `gh run view`
read, such as the pre-push snapshot in step 8 or the attempt read in step 5,
is not polling and the parent runs it itself.

## Workflow

1. **Resolve the target.** `git branch --show-current`, then `gh pr view --json
   number,url,headRefName`. If the branch has a PR, work its checks. If it has no PR
   but CI runs on push (e.g. a direct-to-main workflow), work the branch's runs
   instead: `gh run list --branch <branch> --commit <sha> --limit 5`. Pin the
   target SHA with `git rev-parse HEAD`, compare it with the remote PR/run head,
   and identify the required checks. No branch, no CI, or unavailable access
   gets a precise report; missing checks are not green.
2. **Dispatch one designated watcher to read and then watch the state.** PR: `gh pr checks --json name,bucket,state,workflow,link`.
   Runs: `gh run list` / `gh run view <run-id>`.
   - All required checks green for the target SHA → report green; done.
   - Merged or closed (`gh pr view --json state,mergedAt,closedAt`) → the
     watcher reports `merged` or `closed` at once and the loop ends: a closed
     PR has nothing to fix, and a merged head's remaining checks belong to the
     base branch.
   - Pending → the watcher's loop polls the PR state and its checks every
     thirty seconds (branch-only CI: `gh run view <run-id> --json jobs`),
     within its bounded window. **The watcher returns at the first failed required
     check, or the moment the PR merges or closes**, naming the check or the
     state and listing the checks still pending. Neither the watcher nor the parent waits for the
     remaining checks: any check still running when the fix is pushed reruns
     on the new head anyway, so waiting buys nothing and a failure visible in
     the first minute is acted on in the first minute.
   - Old-head, missing, cancelled, or superseded checks → report that state,
     not green. A new push requires a newly pinned target SHA.
3. **Red → collect evidence first.** GitHub Actions: `gh run view <run-id>
   --log-failed` and read the failing step's actual output. External checks: surface
   the link; if the cause isn't reachable from the repo, report rather than guess.
4. **Diagnose in repo context.** The branch's own recent commits are the prime
   suspects: check `git log` and the diff against the base branch before suspecting
   infrastructure.
5. **Flake or fault?** An infra failure with no plausible code cause (runner died,
   network timeout, unrelated job) → read its attempt (`gh run view <run-id> --json
   attempt`), `gh run rerun <run-id> --failed` once, note the flake, and dispatch
   the head's flake watcher with the run id and that attempt. A real fault → continue.
6. **Reproduce locally when feasible.** Read the failing workflow command and
   run the relevant focused case before the fix and again after it. Keep mandatory
   local gates. Full suites run in PR CI by default; a wider local run needs an
   explicit repo/user requirement or a named unresolved integration risk.
7. **Fix in-session.** Address the cause of the red check; do not bundle
   unrelated changes into the fix.
8. **Commit and push per the repo's conventions**: pull first, use the repo's own
   push skill if it ships one, and stage only the files the fix touched. Right
   before pushing, the parent runs one `gh pr checks` read of the old head (a
   single read, not a watcher dispatch): a further
   check that failed while the fix was being written is diagnosed from its log
   and folded into the same push when its cause is in scope; otherwise it is
   named in the report. Carry
   existing authority forward and honor no-commit/no-push instructions. If delivery
   is unavailable, finish the authorized local repair and name the remaining step.
9. **Re-watch** (step 2, a new watcher for the new head). Hard cap: **two fix attempts per failing cause** (plus
   the single flake rerun). Acting at the first failure means a later check on
   the new head can surface a different cause; that is a new cause with its own
   two attempts, not a third attempt on the first. The same check failing after
   its second fix ends the loop: stop and report the diagnosis and recommended
   next step instead of thrashing.

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
- Two fix attempts per cause maximum; a repeating failure is a finding, not an
  invitation to iterate blindly.
- The fix stays in the implementing session. The designated `ci-watcher` agent
  always owns watching; it never fixes, reruns workflows, commits, or pushes.
- When a step goes off this workflow's path (GitHub refuses `gh run rerun --failed`
  until the whole run completes, a watcher verdict the parent cannot trust, a race
  the loop cannot see), the main session decides the next step and tells the user
  plainly what happened and what it chose.
