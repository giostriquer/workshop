# fix-ci and ci-watcher: decisions in force

This note is the rationale for the `fix-ci` skill and the `ci-watcher` agent it dispatches, both shipped in the `workbench` plugin; superseded choices are omitted and git history keeps the originals.

## Let the host own waiting and the runner own evidence (2026-10-29)

Recent watcher transcripts exposed foreground commands moved to the background
after three minutes despite a ten-minute requested timeout. Agents then built
sleep and process-discovery loops around the runner. They also interpreted old
runner results using newer mergeability guarantees. The model assignments were
correct and remain unchanged.

Claude Code's current background-subagent lifecycle delivers a background
command's completion to its subagent even after that subagent yields. Use that
notification, and hand back only a terminal verdict. Hosts without that lifecycle
retain bounded foreground slices or process waits. The foreground fallback must
use the actual call ceiling; a requested timeout is not proof of the ceiling.
See the [host contract](https://code.claude.com/docs/en/sub-agents#tools-permissions-and-results-of-background-subagents).

Protocol 2 binds invocation and interpretation: the caller requests it explicitly,
the result identifies it, and mergeability comes from the reported PR fields.
Old runners reject the new invocation instead of lending an old `passed` result
new guarantees. Old saved states are not promoted to the new protocol.

A per-user target registry identifies GitHub host, repository, PR or branch, SHA and rerun
attempt independently of caller-selected state filenames. One process owns a
target; another caller receives its state location or saved result, preserving
the original deadline. Incompatible expected-check sets are reported rather
than silently sharing weaker coverage. Terminal results are evidence from their
recorded observation time, not a fresh read. New heads and explicit rerun
attempts have distinct identities. The host is persisted with the target, and
resuming under a changed `GH_HOST` is rejected before any GitHub read.

Completed job details are reused only while fresh run metadata confirms the
same revision, run, attempt, status and conclusion. Running jobs are still read
on every poll, so child failures remain visible. Rate limits pause reads within
the original deadline without consuming the ordinary read-error budget. The
polling interval remains thirty seconds; no model or effort setting changes.

## Merge conflicts end the watch (2026-10-21)

The runner read only check results, never mergeability. GitHub starts no
`pull_request` workflows on a conflicted PR, so a conflicted head showed no
checks and the watcher waited out its ten-minute window as `pending`. When the
base moved during a watch, the checks of the earlier merge ref kept running and
the watcher could return `passed` for a PR that cannot merge. Standalone
`fix-ci` then reported green; `file-pr` learned about the conflict only from a
later read.

PR snapshots now include `mergeable` and `mergeStateStatus`. A conflicting open
PR at the pinned head returns `conflicted` on that poll, ahead of every check
result; merged, closed and superseded still take precedence. The verdict carries
the failed and pending checks the PR rollup shows, without the run-detail reads
a check verdict makes: the next head reruns everything, and the parent's
pre-push read of the old head still catches later failures. During a flake
rerun, the rerun's stale rows are dropped before the conflict check, so an old
attempt never reads as a live failure. `passed` needs GitHub to report the PR
mergeable. Unknown mergeability adds a pending `GitHub mergeability` row, so the
watch keeps polling and a deadline result names what it waited on. A missing or
unrecognized value is a read error. The parent fixes real faults among the
listed failures, does not rerun a flake on a head about to be replaced, and then
resolves the conflict through its existing synchronization step, which uses no
CI fix attempt. `mergeStateStatus` is reported, not judged: a `BEHIND` or
`BLOCKED` PR is still governed by the existing synchronization and delivery
rules. Branch-only watches have no mergeability and are unchanged.

The focused harness covers an immediate conflict with no checks, a conflict
outranking failed, pending and passing checks, a conflict that appears
mid-watch, a conflict during a flake rerun, merged, closed and superseded
outranking a conflict, passing checks waiting on unknown mergeability, unknown
mergeability at the deadline without read errors, a reported but unjudged
merge state, and malformed values. Two new mutants (ignoring the conflict,
passing on unknown mergeability) are killed. Live read-only runs against public
PRs reproduced both defects on the previous runner (a false `passed` on a
conflicted PR with settled green checks; a full-window `pending` on a conflicted
PR with no checks) and returned `conflicted` within a second on this one.

## Execute a bundled watcher instead of generating loops (2026-10-07)

An instruction template still asks each watcher to construct executable code.
That repeats quoting, CLI field selection, timeout handling and verdict logic;
the branch-only path had no executable implementation at all. The existing
template also treated cancelled checks as settled. A focused scenario reproduced
that result before this change.

The existing `fix-ci` skill now bundles `scripts/watch-ci.mjs`. The designated
agent invokes it through Node 18 or later and reports its JSON result. This is
one implementation for PR and branch watches, with fixed polling, bounded CLI
calls, pinned revisions, persisted deadlines and resumable host slices. GitHub
access stays read-only. Repair, rerun and delivery authority stay with the parent.
Missing runtimes or missing bundled files produce a reported gap, not a replacement
script. Packaging the runner inside the skill also carries it in Codex exports.

PR check snapshots come from the PR's structured head/rollup response. Rerun
retried jobs use the named run's newer, explicitly selected attempt, preserving
other jobs from the latest job snapshot after a failed-only rerun. Waiting one
arbitrary interval is not evidence that old check results vanished.
Unrelated failures still return while a rerun is waiting. Cancelled, malformed
and absent evidence cannot become a passing verdict. A passing result describes
reported checks; required coverage is explicit through the caller's expected
check names, and unspecified coverage remains a gap.

The focused harness exercises the shipped runner through its read-only command
interface and controlled GitHub responses. Historical shell-template measurements remain in git and do not describe the
runner's current verification.

## Synchronize the PR target on every repair push (2026-10-01)

"Pull first" could update only the feature branch, leaving clean target-branch
updates out of a CI repair. Before each push, the parent now refreshes the open
PR's actual target, incorporates both remote head and target, resolves conflicts
within the accepted requirements, and validates the combined result. This also
covers standalone `fix-ci` sessions and retargeted PRs. Branch-only CI keeps its
ordinary upstream pull without inventing a PR target.

The final target fetch and synchronization procedure follow the
[file-pr decision](file-pr.md#synchronize-the-actual-target-before-every-push-2026-10-01).
The [synchronization correction](file-pr.md#remove-the-synchronization-retry-cap-2026-10-06)
removes the per-push cap: concurrent updates require continued integration and
validation. Synchronization neither consumes nor resets the two CI fix attempts
per cause.
Completed reviews stay valid for a bounded repair; integration changes receive
affected review when they invalidate that coverage. The watcher remains read-only.

## Return failures before diagnostics or required-check filtering (2026-09-30)

A reported watcher run detected a failed check and exited its shell loop while
other checks were pending. It then gathered logs, inspected branch rules, and
restarted a required-only watch instead of returning. The parent remained
unaware of the failure until the user intervened. The agent explicitly permitted
re-arming after optional failures and requested a failure excerpt before its
final report. The latest model-routing change did not introduce those rules.

Any failed check or job on the verified pinned revision now ends the watcher's
turn. Required status is coverage information, not a failure-notification filter;
a failed child job also returns while its workflow or aggregate gate is pending.
The watcher reports observed facts and available links without further network
reads after the loop's failed exit. The parent collects logs and decides relevance
and repairs. Merged/closed state, superseded heads, and the rerun attempt guard
retain precedence. Normal bounded polling and the host's final-answer handback
remain unchanged.

Verification used seven invented terminal-state scenarios in fresh agent
contexts. The old contract re-armed after a non-required failure and requested
logs before reporting three other failures. The revised contract returned all
four failures without further commands and preserved superseded, rerun, and
merged handling. These were plan-only probes, not live delivery timing tests.
The unchanged shell template passed all 52 focused harness tests.

## Claude watcher pinned to Sonnet 5.5 (2026-09-29)

The operator assigned Claude Code CI watching to Sonnet 5.5 instead of Opus
and removed the Sonnet ban. The agent pins `model: claude-sonnet-5-5` with
`effort: xhigh`; dispatch by name without a model override preserves that
exact version. The watcher remains separate and read-only. Its loop, host
waiting rules, and Codex model pin stay the same. Earlier Opus results below
remain historical evidence for the model that ran them.

## ci-watcher absorbs the wait on CI (2026-06-29)

Waiting on CI was a recurring session tax: babysit the checks or forget to return, then dig the failing log out of a multi-job workflow. `ci-watcher`, adapted from the agent of the same name in Cursor's MIT-licensed `cursor-team-kit` plugin ([cursor/plugins](https://github.com/cursor/plugins)), is a self-contained agent, needing only `git` and `gh`, that watches the requested revision's checks and returns a verdict with the failing-log excerpt or check link in hand. It is read-only by design, with `Bash` and `Read` as its only tools and no nested subagents; re-running, fixing and pushing belong to the caller. Background dispatch is described in its body rather than a frontmatter flag, since Claude Code agents have no such field. When there is no branch, no applicable CI or no `gh` access, it reports that gap precisely; other CI hosts would swap out the `gh` calls.

## fix-ci is a skill that composes the watcher (2026-08-11)

The recurring "CI is failing, take a look" was manual prompting on top of a watcher that only reports, so the fix half needed an invocable home. Giving `ci-watcher` edit tools was rejected: the plugin's agents are read-only, the session that pushed the breaking commit has the context to fix it fast, and a skill runs in the main session under the user's own permissions, the right authority for edits and pushes. `fix-ci` owns the loop (resolve the target, watch, collect evidence, triage flake from fault, fix minimally in-session, push per repo conventions, re-watch) and dispatches `ci-watcher` for the waiting. Its guardrails are part of the spec: a cap of two fix attempts per failing cause plus one flake rerun, no force-push or history rewrite, staging only what the fix touched, and never weakening a failing check to reach green. It goes beyond the watcher by working branches with no PR through their push-triggered runs and by rerunning a failed job once when the evidence says flake, and it neither merges nor manages PR state.

## Bounded watch, explicit identity (2026-10-07)

The runner distinguishes passing checks from merged, closed, superseded, failed,
pending-at-deadline, and blocked states. It verifies the pinned head before
crediting evidence. Known required checks must be present and passing; missing
or cancelled checks and unspecified required coverage cannot certify green.
A flake rerun is identified by the named run and failed attempt, so its old
failure cannot terminate the new watch.

Persist one deadline and state file across host call slices. On Claude Code,
foreground calls keep the watcher turn open; on Codex, tool waits resume the
running process. The parent uses the host's wait mechanism without duplicating
GitHub polling. The dispatch uses the agent contract's current host route and
supplies the runner path, state path, pinned revision, deadline, and expected
checks. Unavailable tools or dispatch remain reported gaps.

The focused harness at `scripts/ci-watcher-harness/` now exercises the shipped
Node runner. Older shell-loop templates, timings, and scenario matrices are
historical; they are not instructions for reconstructing a watcher. The harness
source loader retains its `template.mjs` filename.

## Off-path steps are the main session's call (2026-09-24)

The parent handles diagnosis, repair and rerun decisions after a watcher returns.
An unavailable log or a rerun rejected while a workflow is active is reported
with the chosen next action; the watcher does not invent a recovery loop.

## One watcher per pinned head (2026-09-11)

The parent acts when the watcher reports a failed check, without waiting for
pending work. It reads the old head once before a repair push to incorporate
new in-scope failures. That snapshot is a parent read, not another watcher.
A failed head gets no second watcher for its pending checks, except the explicit
flake-rerun path. A new head gets a new watch. The two fix attempts are per
failing cause, and target synchronization neither consumes nor resets them.
The later first-failure rule covers every check, not only required checks.
