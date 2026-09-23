# fix-ci and ci-watcher: decisions in force

This note is the rationale for the `fix-ci` skill and the `ci-watcher` agent it dispatches, both shipped in the `workbench` plugin; superseded choices are omitted and git history keeps the originals.

## ci-watcher absorbs the wait on CI (2026-06-29)

Waiting on CI was a recurring session tax: babysit the checks or forget to return, then dig the failing log out of a multi-job workflow. `ci-watcher` is a self-contained agent, needing only `git` and `gh`, that watches the requested revision's checks and returns a verdict with the failing-log excerpt or check link in hand. It is read-only by design, with `Bash` and `Read` as its only tools and no nested subagents; re-running, fixing and pushing belong to the caller. Background dispatch is described in its body rather than a frontmatter flag, since Claude Code agents have no such field. When there is no branch, no applicable CI or no `gh` access, it reports that gap precisely; other CI hosts would swap out the `gh` calls.

## fix-ci is a skill that composes the watcher (2026-08-11)

The recurring "CI is failing, take a look" was manual prompting on top of a watcher that only reports, so the fix half needed an invocable home. Giving `ci-watcher` edit tools was rejected: the plugin's agents are read-only, the session that pushed the breaking commit has the context to fix it fast, and a skill runs in the main session under the user's own permissions, the right authority for edits and pushes. `fix-ci` owns the loop (resolve the target, watch, collect evidence, triage flake from fault, fix minimally in-session, push per repo conventions, re-watch) and dispatches `ci-watcher` for the waiting. Its guardrails are part of the spec: a cap of two fix attempts per failing cause plus one flake rerun, no force-push or history rewrite, staging only what the fix touched, and never weakening a failing check to reach green. It goes beyond the watcher by working branches with no PR through their push-triggered runs and by rerunning a failed job once when the evidence says flake, and it neither merges nor manages PR state.

## The watcher returns when the PR merges or closes (2026-09-22)

The watcher resolved the PR once, then handed the wait to `gh pr checks
--watch --fail-fast`, which sees checks and nothing else. On 2026-09-22 three
watchers kept watching heads whose PRs auto-merge had already merged, for two,
three and six minutes, and reported the merge only in their final line; one
sat in a single blocking watch for twenty-three minutes. The watcher now reads
the PR state with the checks: a `MERGED` or `CLOSED` PR at dispatch gets no
watch and an immediate `merged` or `closed` report, and the watch itself is a
thirty-second poll of PR state plus checks, returning the moment the state
changes, since a blocking watch cannot observe it. Checks still running on a
merged head belong to the base branch and a closed PR has nothing to fix, so
`fix-ci` ends its loop on either report. A plan-only micro-test, three fresh
watcher contexts per arm on a dispatch whose PR had merged one minute earlier
with two required checks still running, is recorded below.

| Question | Current spec | This spec |
|---|---|---|
| Watches the running checks of a PR already merged at dispatch | 3 of 3 (up to the ten-minute window) | 0 of 3 |
| Reports `merged` at once | 0 of 3 (no such status; merge noted in the final line at best) | 3 of 3 |
| Notices a merge four minutes into the watch | 0 of 3 (`gh pr checks --watch` sees only checks) | 3 of 3 (within one thirty-second poll) |

Two control plans also flagged that the resolve step's field list lacked
`state` and `headRefOid`; both are in the field list now. Three reps per arm is
regression evidence for this dispatch shape, not a reliability estimate.

## The watcher's wait is one background loop; the parent never waits in its own turns (2026-09-22)

Eleven Claude Code watchers on 2026-09-22 spent 9 to 31 model turns each on
watches of 5 to 24 minutes: the spec described polling, and an Opus turn per
poll is what the agents did. Three ran `gh pr checks --watch` in the foreground
at the Bash tool's ten-minute cap, were moved to the background at exactly the
window's end, and re-ran the watch, so the "ten-minute window" became twenty to
thirty minutes; three probed for `timeout` or `gtimeout` first. The one watcher
that armed the watch with `run_in_background`, ended its turn and was woken by
the task notification finished in nine minutes with one read. Parents, meanwhile,
polled `gh pr checks` or `gh run view` 4 to 21 times per session alongside their
watchers, and two armed Monitor loops on CI jobs.

The watcher's wait is now one shell loop armed once in the background, polling
every thirty seconds and exiting on the first terminal state (a failed check,
the PR merged or closed, no check pending, a moved head, or its own deadline),
with the deadline inside the loop so no `timeout` wrapper is needed; the agent
ends its turn and acts once when the host reports the loop finished. Host
behavior is labeled: on Claude Code the loop runs through the Bash tool's
`run_in_background` and the task notification wakes the agent; on Codex the
exec tool's yield means re-reading the loop's file; elsewhere the loop runs in
foreground calls within the tool's limit. The wait stays in the agent on every
host, including Claude Code where the parent could arm the same loop or a
Monitor: every parent turn spent waiting, and every Monitor output line, is
billed at the parent's model, and a Fable or Astra parent is the expensive one,
while the watcher's Opus turns are the cheap ones. The parent therefore ends its
turn after dispatching and runs no poll, Monitor or output-file read of its own,
and passes no model, since the agent file pins it. A plan-only micro-test, three
fresh contexts per arm on the watcher and on the parent, is recorded below.

| Question | 0.41.2 wording | This wording |
|---|---|---|
| Watcher: the wait is one background loop, the turn ends, the notification wakes it | 1 of 3 | 3 of 3 |
| Watcher: a foreground loop at the Bash tool's 600-second cap (spills to the background at the window's end) | 2 of 3 | 0 of 3 |
| Watcher: probes for `timeout` or `gtimeout` | 0 of 3 | 0 of 3 |
| Parent: dispatches `ci-watcher`, ends its turn, runs no poll, Monitor or output-file read | 3 of 3 | 3 of 3 |
| Parent: passes `model: opus` explicitly | 3 of 3 | 0 of 3 |

The prompts stated the host's tool limits, which the transcripts' watchers had
to discover, so both arms plan fewer turns than the recorded runs; the
difference between arms is the wait's shape. Two candidate watcher plans
caught that the loop template compared a full `headRefOid` with the caller's
SHA as given, and fifteen of thirty-three dispatches today passed a short SHA,
so the template's head check is a prefix match. Three reps per arm is
regression evidence for these dispatch shapes, not a reliability estimate.
