# fix-ci

## What it does

`fix-ci` watches the current branch's CI through to a verdict and fixes what
breaks. It resolves the target, reads the check state, pulls the actual
failing log, decides whether the failure is a flake or a real fault,
reproduces it locally when feasible, applies a minimal fix in-session,
commits and pushes per the repo's conventions, and re-watches. It is the
invocable form of the recurring one-liner "CI is failing, take a look."

It is a skill, not an agent, and that distinction is load-bearing. The fix
happens in your session, under your permissions, with the context of the
commits that broke the build. The read-only designated `ci-watcher` agent is always
dispatched for the *waiting*, never for the fixing.

Its boundaries are what keep it safe to run unattended. It never force-pushes,
amends, or rewrites published history; fixes land as ordinary commits on the
current branch. It fixes only the cause of the red check: unrelated failures
and pre-existing dirty-tree changes are reported, never swept into the fix
commit. It never deletes, skips, or weakens a failing test or check to get to
green. And it stops: **two fix attempts maximum**, because "a repeating
failure is a finding, not an invitation to iterate blindly."

## When to reach for it

Reach for it when the current branch's CI is red and should be fixed, or right
after a push when the checks should be seen through to green. It activates on
phrasings like "CI is failing, take a look," and can be invoked directly.

| The problem | The skill |
| --- | --- |
| CI is red on this branch and should be fixed | `fix-ci` |
| You want a pass/fail verdict and nothing edited | the `ci-watcher` agent |
| A finished branch should become a PR and be tended to green | `file-pr` (it runs `fix-ci`'s loop internally) |
| A persistent or unclear bug in the code itself | `systematic-debugging`; obvious localized fixes use focused reproduction and verification |
| A failing check is really a question about intended behavior | `fix-ci` reports it as a decision for you to answer |

## The loop

1. **Resolve the target.** `git branch --show-current`, then `gh pr view
   --json number,url,headRefName,headRefOid`. Pin the target SHA and expected required checks. A branch with a PR → work its checks. A
   branch with no PR but CI on push → work the branch's runs via `gh run list
   --branch <branch> --commit <target-sha> --limit 5`. No branch, no CI, or unauthenticated `gh` →
   report plainly and stop.
2. **Read the state through a separate watcher.** Always dispatch `ci-watcher`: Opus on Claude, `gpt-5.6-sol` on Codex, never Astra or Fable. This holds even when the parent is idle or already uses Opus/Sol. Give it the target SHA and expected checks. Green requires complete required-check coverage for that revision; missing, pending, or superseded checks are not success.
3. **Red → collect evidence first.** `gh run view <run-id> --log-failed` and
   read the failing step's actual output. External checks: surface the link;
   if the cause isn't reachable from the repo, report rather than guess.
4. **Diagnose in repo context.** "The branch's own recent commits are the
   prime suspects": check `git log` and the diff against the base before
   suspecting infrastructure.
5. **Flake or fault?** An infra failure with no plausible code cause → `gh run
   rerun <run-id> --failed` **once**, note the flake, return to watching. A
   real fault → continue.
6. **Reproduce locally when feasible**: read the workflow, select the focused affected case, and run it before the fix and again after. Run mandatory local gates too; full suites normally run in PR CI unless an explicit requirement or named integration risk calls for them locally.
7. **Fix in-session.** The cause of the red check; unrelated changes are not
   bundled into the fix.
8. **Deliver under existing authority and repo conventions**: pull first when committing/pushing, use the repo's own push skill if it ships one, and stage only files the fix touched. Explicit no-commit/no-push instructions override these defaults; complete the local fix and report the remaining delivery step.
9. **Re-watch.** Hard cap: two fix attempts, plus the single flake rerun.
   Still red → stop and report the diagnosis and recommended next step.

## Common questions

**It re-ran the job instead of fixing anything.** That is the flake path, and
it fires once. A failure with no plausible code cause: runner died, network
timeout, an unrelated job: gets one `--failed` rerun, noted as a flake. If it
comes back red, the loop treats it as a fault.

**It stopped after two attempts and left CI red.** That is the cap working.
What you get instead of a third attempt is the diagnosis, the failing-log
excerpt or check link, and a recommended next step. Two consecutive failed
fixes usually means the diagnosis is wrong, and more iterations spend budget
without improving it.

**Why won't it just skip the flaky test?** Because "a red check that encodes
an intended-behavior question is reported as a decision for the user, not
worked around." Deleting, skipping, or weakening a check is out of the skill's
rules regardless of how obviously convenient it looks.

**My branch has no PR.** It still works. Push-triggered runs on a branch (a
direct-to-main workflow, for instance) are handled through `gh run list` and
`gh run view` through the designated watcher, pinned to the target commit. The watcher remains read-only; the parent owns any authorized flake rerun.
([decision](../decisions/fix-ci.md))

**Why not just give `ci-watcher` the ability to fix things?** That was
considered and rejected for three recorded reasons: the plugin's agents are
advisory and read-only, and widening the watcher would break that identity for
one convenience; fix quality lives in the session that pushed the breaking
commit, whereas a background subagent editing the working tree starts from
zero and can collide with in-flight work; and the watcher's own design already
said a tool that retries or pushes is "a different, higher-authority tool."
`fix-ci` is that tool. ([decision](../decisions/fix-ci.md))

**Can I keep working while it waits?** Yes. All polling runs through a separate Opus (Claude) or Sol (Codex) watcher, regardless of whether the parent has other work. The parent picks up its report and owns any fixes. If designated dispatch is unavailable, report that capability gap instead of polling in the parent.

**My working tree had unrelated changes and they didn't get committed.**
Correct. It stages only the files the fix touched, and reports the rest rather
than folding them in.

**Does it manage the PR?** No. It fixes the red check and reports; PR state is
the caller's business. It is not an auto-merger.

**Non-GitHub CI?** It assumes `gh`. The resolve → watch → evidence → fix →
re-watch shape is host-agnostic, but the commands are not.

## It's working if

- The diagnosis quotes the failing step's actual output. A diagnosis offered
  without a log having been pulled is the **negative signal**: evidence comes
  before the fix, every time.
- Each attempt is reported with what failed, the root cause, and what changed
  (files plus commit).
- The fix commit touches only what the failure required.
- **Negative signal:** a force-push, an amended commit, a deleted or skipped
  test, or a third fix attempt. Any of those means the loop's guardrails were
  not followed.
- With complete green required-check coverage for the pinned target SHA, it reports green and stops, without inventing work.

## Where it fits

`fix-ci` sits in the landing stage of the workbench flow: the flow map lists
it as the piece that "tends the checks" after `file-pr`, a merge, or a push.
`file-pr` composes it rather than duplicating it: when a freshly filed PR goes
red, this loop is what runs. It pairs with the `ci-watcher` agent, which is
its read-only watch half.

All polling belongs to that separate watcher, even if the parent is idle or already uses Opus/Sol. Never Astra/Fable. If designated dispatch is unavailable, report the gap instead of polling in the parent. Preserve before/after local reproduction with focused tests and mandatory gates; full suites normally run in PR CI. Existing no-commit/no-push instructions remain binding.
