# ci-watcher

## Origin

Waiting on CI is a recurring tax on a working session: you push, then either babysit
the PR checks tab or context-switch away and forget to come back. The cost is worst
on failures — by the time you notice red, you've lost the thread, and digging the
actual failing log out of a multi-job workflow is its own chore. `ci-watcher` is a
small, self-contained agent that absorbs that wait: dispatch it (ideally in the
background) and it watches the current branch's PR checks, then hands back a
pass/fail verdict with the failing log excerpt or check link already in hand.

The spec was operator-provided (originating in another host's agent kit) and
**adapted** into the scaffold rather than copied verbatim — the host-specific
frontmatter (`is_background`, `model: fast`) doesn't exist in the Claude Code agent
format, so it became standard `tools` + `model: inherit` with the background intent
moved into the prose.

## Problem

A CI wait has three failure modes a quick `gh` one-liner doesn't cover on its own:

1. **Babysitting burns attention.** Polling the checks yourself, or watching a
   blocking `--watch`, ties up the main session for something that should run
   unattended.
2. **Failures arrive without context.** A red check is a starting point, not an
   answer — the useful artifact is the *failing* step's log, and `gh run view
   --log-failed` plus picking the right run id is friction in the moment.
3. **External checks aren't all GitHub Actions.** Some checks live on third-party
   services where the right move is to surface the link and a next step, not to try
   to fetch logs that aren't there.

`ci-watcher` encodes the small decision tree that handles all three.

## Solution shape

A **read-only, self-contained monitor** dispatched against the current branch:

- **Resolve → inspect → watch → report.** Find the branch's PR (`gh pr view`),
  enumerate its checks (`gh pr checks`), watch to completion if pending
  (`--watch --fail-fast`), and report the verdict.
- **Failures come with evidence.** For a failed GitHub Actions check it fetches the
  failing log (`gh run view <run-id> --log-failed`) and returns a concise excerpt;
  for an external check it returns the link and a likely next step.
- **Background-friendly.** It only touches `git` and `gh`, so a parent can run it in
  the background and pick up the report later instead of blocking on the watch.
- **Self-contained.** No project profile, no convention docs — it works in any repo
  with a GitHub PR and an authenticated `gh`. That's why it ships **direct-use in
  the `toolkit` plugin** and is not part of the onboarding adoption set.

## Real workflow snippet

Wire it into a project's post-push flow (`CLAUDE.md` / `AGENTS.md`):

> After pushing a branch with an open PR, dispatch `ci-watcher` (in the background)
> to watch the checks. Continue other work; when it returns, act on its verdict —
> if it reports a failure, it includes the failing-step excerpt or the check link
> and a likely next step.

## Pitfalls observed

- **Treating a red check as the whole answer.** The value is the *failing log
  excerpt* or the precise external link, not just "CI failed."
- **Assuming everything is GitHub Actions.** External/third-party checks have no
  `gh run` logs to fetch — surface the link instead of failing to find logs.
- **Blocking the main session on the watch.** Its whole point is to run unattended;
  dispatch it in the background rather than foregrounding a long `--watch`.
- **Acting on it.** It is read-only — it reports; re-running, fixing, or pushing is
  the caller's job. When the caller wants that loop handled too, the `fix-ci` skill
  is the tool: it dispatches this agent for the waiting and keeps the
  diagnose–fix–push cycle in the session.

## Adaptation notes

- It assumes **GitHub + `gh`**. For GitLab, Azure Pipelines, or a different CI host,
  swap the `gh` calls for that host's CLI and the same resolve → watch → report
  shape holds; the rest of the agent is host-agnostic.
- `model: inherit` — the scaffold never names a specific model (it's more portable
  and clearer for adopters and other plugins); every other agent inherits too. The
  spec's `fast` intent is dropped — a CI monitor is light enough that the session
  model is fine.
- It is read-only (`Bash, Read`). Keep it that way; a watcher that retries or pushes
  is a different, higher-authority tool — that tool now exists as the `fix-ci`
  skill, which runs the fix in the main session and uses this agent only to watch.
