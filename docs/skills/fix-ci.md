# fix-ci

## Origin

The operator kept typing the same message every time a check went red: *"CI is
failing, take a look."* The `ci-watcher` agent had already absorbed the *wait* —
dispatch it in the background, get a verdict with the failing log in hand — but it
deliberately stops at reporting: it is read-only, like every toolkit agent, and its
own origin doc said a watcher that retries or pushes is "a different, higher-authority
tool." The fix half of the loop always ran in-session anyway, prompted by hand each
time. `fix-ci` is that different tool: the standing habit turned into one invocable
skill.

## Problem

1. **The invocation tax.** A red check has one obvious next step, and it cost a
   human round-trip every single time. Watch-then-report leaves the last mile —
   diagnose, fix, push, re-watch — as manual prompting.
2. **The fix needs session context.** The session that just pushed knows what
   changed and why; the branch's own recent commits are almost always the cause. A
   fresh subagent starts from zero and re-derives what the session already knows.
3. **Unbounded fixing is dangerous.** "Just make CI green" has well-known failure
   modes: thrash loops that push attempt after attempt, force-pushes, sweeping
   unrelated dirty-tree changes into the fix commit, and the worst one — weakening
   or skipping the failing check to get the color to change.

## Solution shape

A **skill, not an agent** — that is the load-bearing decision:

- **Skills run in the main session, under the user's own permissions.** The toolkit's
  invariant ("the agents never modify your files") survives intact; the authority to
  edit and push comes from the session, not from a widened agent.
- **`ci-watcher` stays the read-only wait-absorber.** `fix-ci` dispatches it for
  background watching when other work should continue; the diagnose–fix–push cycle
  never leaves the session.
- **The loop is bounded and evidence-first.** Resolve the target (PR checks, or push
  runs for direct-to-main workflows) → read the failing log before touching anything
  → separate flake from fault (one `gh run rerun --failed` for flakes) → reproduce
  locally when feasible → minimal fix → conventional push (pull first, repo's own
  push skill if present, stage only what the fix touched) → re-watch. Hard cap of two
  fix attempts; after that the repeating failure is reported as a finding.

## Real invocation snippet

> **User:** ci is failing, take a look
>
> **Session (fix-ci):** resolves the branch's PR, `gh run view --log-failed` shows a
> type error in a file the branch's last commit touched, reproduces it with the
> workflow's own check command, fixes the type, re-runs the check locally, commits
> and pushes per the repo's push conventions, re-watches to green, and reports:
> verdict, root cause, the one-file diff, one attempt used.

## Pitfalls observed

- **Thrash.** Without the two-attempt cap, a wrong theory gets pushed repeatedly.
  A repeating failure is a diagnosis problem, not a retry problem.
- **Sweeping the tree.** A dirty working tree plus an eager `git add .` puts
  unrelated work into the "fix CI" commit. Stage only the files the fix touched.
- **Misreading flakes.** Treating an infra flake as a code fault burns an attempt on
  a phantom; treating a real fault as a flake burns a rerun and the wait. Read the
  log before deciding.
- **Green at any cost.** Deleting or skipping the failing test changes the color,
  not the truth. A check that encodes an intended-behavior question is a decision
  for the user, reported plainly.

## Adaptation notes

- **GitHub + `gh` assumed**, same as `ci-watcher`. Other CI hosts swap the `gh`
  calls for their CLI; the watch → evidence → triage → fix → push → re-watch shape
  is host-agnostic.
- **Direct-to-main workflows work** — when the branch has no PR, the skill watches
  the branch's push-triggered runs (`gh run list` / `gh run watch`) instead of PR
  checks.
- **Push conventions delegate.** If the repo ships its own push skill or commit
  conventions, the fix lands through them; the skill only insists on no force-push
  and no history rewriting.
