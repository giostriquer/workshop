# fix-ci and ci-watcher: decisions in force

This note is the rationale for the `fix-ci` skill and the `ci-watcher` agent it dispatches, both shipped in the `workbench` plugin; superseded choices are omitted and git history keeps the originals.

## ci-watcher absorbs the wait on CI (2026-06-29)

Waiting on CI was a recurring session tax: babysit the checks or forget to return, then dig the failing log out of a multi-job workflow. `ci-watcher`, adapted from the agent of the same name in Cursor's MIT-licensed `cursor-team-kit` plugin ([cursor/plugins](https://github.com/cursor/plugins)), is a self-contained agent, needing only `git` and `gh`, that watches the requested revision's checks and returns a verdict with the failing-log excerpt or check link in hand. It is read-only by design, with `Bash` and `Read` as its only tools and no nested subagents; re-running, fixing and pushing belong to the caller. Background dispatch is described in its body rather than a frontmatter flag, since Claude Code agents have no such field. When there is no branch, no applicable CI or no `gh` access, it reports that gap precisely; other CI hosts would swap out the `gh` calls.

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

## The watcher's dispatch is pinned per host (2026-09-24)

`fix-ci` said "The agent file pins the watcher's model, so the parent passes
none". That holds on Claude Code and is false on Codex, which registers no
plugin agents. In a 30-day audit of Codex sessions, all nine watchers of the
first two weeks ran on the parent's model; later spawns named the model but no
`reasoning_effort`, and Codex resolves that to the model's default effort, so
27 of the 53 watcher spawns ran at low or medium effort. The operator set the
watcher to `xhigh` on both hosts. On Claude Code the agent file pins Opus with
`effort: xhigh`, a frontmatter field Claude Code honors for plugin agents, and
the parent passes no model. On Codex the parent spawns with `model:
"gpt-6-sol"`, `reasoning_effort: "xhigh"`, `fork_turns: "none"` and a message
pointing at the `ci-watcher` file from the installed plugin, which is how the
audit's Codex watchers already found their instructions. The rest of the watch
is unchanged; a separate study of CI watching is under way. A plan-only probe,
two fresh Codex-parent contexts per arm dispatching the watcher after a push,
is recorded below.

| Question | 0.41.6 wording | This wording |
|---|---|---|
| Spawn names `model: "gpt-6-sol"` and `fork_turns: "none"` | 2 of 2 | 2 of 2 |
| Spawn names `reasoning_effort: "xhigh"` | 0 of 2 (one omitted it, one chose `medium`) | 2 of 2 |
| Message points the watcher at the `ci-watcher` file | 1 of 2 (the other restated the workflow) | 2 of 2 |

One current-wording parent noted in its rationale that the agent file's pin
"never applies" on Codex and named the model itself, which is the correction
this wording makes explicit. Two reps per arm is bounded regression evidence
for this dispatch shape, not a reliability estimate.

The pointer did not hold: the Codex spawn now pastes the watcher's contract,
a follow-up to a returned watcher carries only a new pinned head, and the
spawn's model, effort and `fork_turns` live in the agent file's Dispatch line
rather than at each call site
([plugin-surfaces](plugin-surfaces.md#codex-agents-the-parent-pastes-the-contract-2026-09-24)).

## The watcher waits in long foreground calls, the parent in long waits (2026-09-24)

A 30-day study of `ci-watcher` runs on both hosts found the wait still billing
the parent. On Claude Code, all three runs on the 0.41.3 wording woke their
idle parent with an interim notice ("stopped with background work of its own
still running … result may be interim"): from Claude Code 2.1.274 the parent
is notified when a background subagent's turn ends, and the 2026-09-22
background loop ends the watcher's turn by design. Each wake re-read 627k to
779k parent tokens, more than the whole watcher run (322k to 627k); the
2026-09-22 section counted only the handback. The loop now runs in foreground
Bash calls at `timeout: 600000`. The template computes each call's slice from
the call's start, the earlier of the deadline and a minute before the tool's
limit, checks it before each thirty-second sleep, and prints a `slice` line
that hands the deadline to the next call, so the watcher's turn stays open and
the parent wakes once, at the handback. The slice applies only where the tool
limits a call: the template takes the limit from `BASH_MAX_TIMEOUT_MS`
(default 600000) when `CLAUDECODE`, which Claude Code sets in its shells, is
present, so a Claude Code host that raises the limit gets one call per window,
and a Codex exec session, which has no per-call limit, runs the loop in one
call. Other hosts set `lim` by hand. A Codex session started from a Claude
Code shell, or from an IDE terminal where the Claude Code extension sets
`CLAUDECODE`, slices anyway, which costs calls but not correctness. The
template, not the model, computes the slice because in an earlier micro-test
two of three plans set it at the tool's cap and spilled into the background
again.

On Codex, watchers still took a model turn about every thirty seconds, before
and after 0.41.3 (153 of 170 empty polls used a 30000 ms yield), because the
note said to re-read the file at the interval. Codex caps an `exec_command`
yield at 30 seconds, but an empty `write_stdin` waits up to the
background-terminal maximum (300 seconds by default) and returns when the
process exits. A local probe on Codex CLI 0.155.1 confirmed both, and found
that in code mode the `exec` cell making the call yields after about 30
seconds unless its first line sets a longer yield:

| Probe (code mode) | Loop | Empty `write_stdin` returned | Model turns in the wait |
|---|---|---|---|
| `yield_time_ms: 300000`, no pragma | 90 s | at exit, 85.7 s, `exit_code: 0` | 2 (cell yielded at 31 s, then `wait`) |
| `yield_time_ms: 600000`, no pragma | 330 s | at 300.0 s, no exit (clamped) | 3 (31 s, then two `wait` calls) |
| `// @exec: {"yield_time_ms": 300000}` pragma | 90 s | at exit, 86.1 s, `exit_code: 0` | 1 |
| `// @exec: {"yield_time_ms": 600000}` pragma | 330 s | at 300.0 s, no exit (clamped) | 1 |

The watcher now starts the loop with `exec_command` and waits in empty
`write_stdin` calls at `yield_time_ms: 300000`, each cell opened with that
pragma. Watchers also sent 371 `send_message` calls to parents (a median of 3
to 4 per head), and `wait_agent` ends on any mailbox update, so each cost a
parent request at about 125k to 130k tokens of context. The watcher now sends
nothing before its final answer, and `fix-ci` tells the parent not to ask for
progress. Parents themselves waited in 30- or 60-second slices after 09-23:
87 waits, 78 of them timed out, and a median of 14 parent requests per head
(p90 34). Local sessions honored `timeout_ms` up to 600000, and a child's
final answer never started a parent turn (0 of 79), so the Codex parent now
waits in `wait_agent` calls at 600000 ms until the final answer, without
ending its turn and with no `gh` read or `sleep` between.

Two smaller fixes ride along. `fix-ci`'s flake step said to "return to
watching", which the one-watcher-per-head rule forbids on a head that returned
red; 21 sessions improvised a second watcher, and two real duplicates ran on
09-23. The flake rerun is now the one same-head re-watch. The parent reads
the failed run's attempt before `gh run rerun --failed` and hands the watcher
the run id and that attempt, and the loop reads no check until the poll after
`gh run view` first shows a newer attempt, because until GitHub re-queues the
jobs the old failure still shows. On Codex that watcher is a fresh spawn, since a
follow-up to a returned watcher carries only a new head. And 0.41.3 runs took 8 to 14 turns: about four calls before
arming and three to eight after exit, eight of them in the failed run spent
fetching and grepping job logs and the PR diff, while 11 of 271 runs hit
persisted-output truncation (40 KB to 1.4 MB) by printing whole poll logs or
`gh` JSON. One call now resolves the PR, snapshots the checks with the
required ones, and arms the loop; the exit line names each failed check and
its link; after exit the watcher takes at most one read, one snapshot and
`--log-failed | tail -n 150`, and leaves the diff and the diagnosis to the
parent. The probes below surfaced two template gaps, fixed in the same change:
an empty poll (a failed `gh` call, or checks not yet reported after a push)
ended the loop as `superseded` or `settled`, and a loop re-armed after an
optional failure exited again on that same failure. An empty checks list now
counts as pending, as it is right after a push, a poll whose `gh pr view`
failed reaches no verdict, and the re-armed loop polls with `--required`. Four
failed `gh pr view` polls in a row end the loop `blocked` with the last `gh`
error, so an expired login reports the access gap within two minutes instead
of `pending` at the deadline. The template creates the scratch folder, since without it every
`2>"$err"` redirect fails, `gh` never runs, and the loop would end `blocked`.

Plan-only probes in fresh contexts, recorded below: Claude Code watchers and
flake-path parents as subagents given the agent file or skill text, Codex
watchers and parents through `codex exec` given the same text.

| Question | 0.41.6 wording | This wording |
|---|---|---|
| Claude watcher: loop in the foreground at `timeout: 600000`, slice from the template | 0 of 3 (all `run_in_background`, turn ended) | 3 of 3 |
| Claude watcher: resolve, snapshot and loop in one call | 0 of 3 (a snapshot call, then the arm) | 3 of 3 |
| Claude watcher: re-runs the loop alone with the printed deadline after `slice` | n/a | 3 of 3 |
| Claude watcher: calls between a failed exit and the handback | 3, 3, 3 | 1, 1, 1 |
| Codex watcher: waits in `write_stdin` at 300000 ms with the pragma | 0 of 1 (re-read the file every 30 s) | 2 of 2 (six calls for a ten-minute window, from the first draft's slice; three after the correction below) |
| Codex parent: `wait_agent` at `timeout_ms: 600000`, repeated, nothing between | 0 of 2 (60000 and 300000) | 3 of 3 |
| Flake path: rerun once, then exactly one watcher on the new attempt | 3 of 3 | 3 of 3, then 4 of 4 |
| Flake path: that watcher also covers the head's other pending checks | 3 of 3 | 2 of 3, then 4 of 4 |
| Flake path: names a conflict between step 5 and the one-watcher rule | 3 of 3 | 0 of 3, then 0 of 4 |

The flake rows cover two drafts. The first said only "pinned to that run's
new attempt", and one of three parents scoped its watcher to the rerun alone,
leaving `integration` and `build-docs` unwatched on a head that allows no
further watcher; the wording now says the watcher also covers the head's other
pending checks, and four fresh parents all did. Those four were told the
failed run had completed, since GitHub reruns only a finished run, and two saw
a lost-runner log in place of a shutdown signal. Three flake-path probes
stopped at a safety classifier before answering and are not counted.

No Codex watcher in either arm planned a `send_message`, so the probe does
not reproduce the progress messages; that change rests on the transcript
evidence. The current-wording flake parents reached the right action but each
named the conflict between step 5 and the one-watcher rule, the ambiguity
behind the 21 improvised watchers. Four reps per arm or fewer is bounded
regression evidence for these dispatch shapes, not a reliability estimate.

A code-quality review of the first draft found four gaps, fixed in the same
change. The slice read `BASH_MAX_TIMEOUT_MS` alone, which Codex never sets, so
Codex watchers also stopped at nine minutes and re-armed: the six calls in the
table above. The slice was computed after the snapshot and checked before the
thirty-second sleep, which could leave as little as thirty seconds before the
tool's limit, less `gh` latency, where the text promised a minute. "Pinned to the run's new
attempt" had nothing behind it in the template, so a flake watcher whose first
poll came before GitHub re-queued the jobs saw the old failure and exited
`failed` at once. And a persistent `gh` failure, such as an expired login,
ran to the deadline and reported `pending`.

An independent review of the fixed template found two more, fixed in the same
change. A poll whose `gh pr view` failed still judged the checks, and `gh pr
checks` reports the PR's current head, so a transient failure with every check
passing ended the loop `settled` at once on a head it never confirmed was the
pinned one, while the text said such a poll counts as pending. The verdicts now
run only on a poll that read the PR, and four such failures in a row still end
it `blocked`. In flake mode the loop read the checks before the attempt, so a
rerun that started between the two reads cleared the gate while the checks
still held the old failure: the loop ended `failed` and spent the one
same-head re-watch on the previous attempt. The loop now reads the attempt
first and no check while it waits. An earlier reviewer had noted that GitHub
may show the new attempt before its check runs replace the old ones, so the
first checks read comes from the poll after the one that first shows the new
attempt, at least thirty seconds later. That covers a lag of up to one poll
interval at the cost of one poll, which delays a verdict only when the rerun's
checks finish inside it; each later call's first poll waits again, since the
call sets `run` and `att` afresh. A longer lag would still end the loop on the
old failure, and whether GitHub lags at all was not measured, since that takes
a real rerun. A gate on `gh run view --json attempt,status` was not taken: it
rests on the same unmeasured ordering, and a rerun that completes between two
polls shows `completed` and would never open it.

The loop was then run against a fake `gh`, with `date` and `sleep` on a
virtual clock that each `gh` call advances two seconds, under `bash --norc` and
`zsh -f`, with the template text taken verbatim from the agent file. The flake
rows the review added serve GitHub's state from that clock, so each call sees
it as of the moment it runs, and the two-call row re-runs the loop lines after
the `slice` line as the watcher does. Every row below held on both shells, and
each named mutant of the template fails at least one row:

| Exit path | Fake `gh` scenario | Result, bash and zsh | Mutant this row kills |
|---|---|---|---|
| Merged | merged at poll 2 | `exit: MERGED` at poll 2 | |
| Merged at dispatch | merged at poll 1 | `exit: MERGED` at poll 1, no sleep | |
| Closed | closed at poll 2 | `exit: CLOSED` | |
| Superseded | head moves at poll 2 | `exit: superseded <new sha>` | |
| Failed, with links | a check fails at poll 2 | `exit: failed`, then the check's name and link | |
| Settled | all pass at poll 2 | `exit: settled` | |
| Deadline, Codex | pending, no `CLAUDECODE` | one call, `exit: deadline` at 588 s, no `slice` | `lim` keyed on `BASH_MAX_TIMEOUT_MS` alone: `slice` at 520 s |
| Slice, Claude Code | pending, `CLAUDECODE=1` | `slice: deadline=…` at 520 s of the 600 s limit | check before the sleep without `+ 30`: 554 s |
| Second call | re-armed 525 s in with the printed deadline | `exit: deadline` 72 s later, before the deadline | |
| Raised limit | `BASH_MAX_TIMEOUT_MS=900000` | one call, `exit: deadline` | |
| Other host | `lim=300000` set by hand | `slice` at 214 s | slice from after the snapshot: 248 s |
| Empty poll continues | `gh pr view` fails at polls 1 and 2 | continues, `exit: settled` at poll 4 | no empty-view gate: `exit: superseded` at poll 1 |
| No checks yet | checks list empty at polls 1 to 3 | continues, `exit: settled` at poll 4 | the `\|"  "` pending case dropped: `exit: settled` at poll 1 |
| Empty polls reach blocked | every `gh` call fails with the auth error | `exit: blocked` at poll 4, with the error | no counter: runs to the deadline |
| Counter resets | `gh pr view` fails at polls 1 to 3 and 5 to 7 | `exit: settled` at poll 9 | |
| Empty poll, checks passing | `gh pr view` fails at every poll, every check passes | `exit: blocked` at poll 4, with the error | the earlier ungated verdicts: `exit: settled` at poll 1 |
| Empty poll, head moved | `gh pr view` fails at polls 1 and 2 while the checks show the new head passing, then shows the new head | `exit: superseded <new sha>` at poll 3 | the earlier ungated verdicts: `exit: settled` at poll 1 |
| Empty poll, check failing | `gh pr view` fails at polls 1 and 2, a check fails throughout | `exit: failed` with the link at poll 3 | the earlier ungated verdicts: `exit: failed` at poll 1 |
| Flake wait | old attempt's failure at polls 1 and 2, new attempt pending, then passing | `exit: settled` at poll 5 | no attempt gate: `exit: failed` at poll 1 |
| Flake, new attempt fails | the new attempt fails at poll 5 | `exit: failed` with the link | |
| Flake, `gh run view` errors | `gh run view` fails at polls 1 and 2 | treated as the old attempt, `exit: settled` at poll 5 | |
| Flake, attempt appears mid-poll | the new attempt appears 45 s in, between where the earlier loop read the checks and the attempt | `exit: settled` at poll 6 | checks read before the attempt: `exit: failed` at poll 2 |
| Flake, check runs trail the attempt | the new attempt appears 70 s in, its check runs replace the old failure 20 s later | `exit: settled` at poll 6 | checks read in the poll that first shows the new attempt: `exit: failed` at poll 3 |
| Flake, attempt appears between calls | `CLAUDECODE=1`; the new attempt appears in a 15 s gap after the first call's `slice`, and the second call sets `run` and `att` again | `slice`, then `exit: settled` at the second call's poll 2 | |
| Scratch folder missing | the folder does not exist | `exit: settled` at poll 2 | no `mkdir`: `exit: blocked` before any poll lands |

The first draft's template failed 16 of the 36 rows it could run, 8 on each
shell: it sliced at 554 s on Codex, left 46 s of margin on Claude Code and 52 s
on the 300 s host, polled past the deadline on the second call and with the
raised limit, ran the auth failure to its slice, and exited `failed` at poll 1
on the two flake rows that should have waited. The template the independent
review read failed 10 of the 50 rows, 5 on each shell: with no PR read it
ended `settled` at poll 1 on the passing and moved-head rows and `failed` at
poll 1 on the failing-check row, and it ended `failed` on the old failure when
the new attempt appeared mid-poll or its check runs trailed it. The harness
is committed in `scripts/ci-watcher-harness/`: `node --test
scripts/ci-watcher-harness/matrix.test.mjs` runs every row on both shells
against the template it reads from the agent file, and `node
scripts/ci-watcher-harness/mutants.mjs` re-checks the named mutants. A later
template edit re-runs the matrix. Committing it fixed one harness defect: the
"Flake, attempt appears between calls" row re-armed its second call with a
fresh ten-minute deadline instead of the printed one. With the printed
deadline the row still ends `settled`, and it now also fails the check
without `+ 30`.

Plan-only probes in fresh Opus contexts compared the first draft with this
wording: Codex watchers and flake-path parents role-playing Codex CLI 0.155.1,
and Claude Code watchers.

| Question | First draft | This wording |
|---|---|---|
| Codex flake parent: reads the failed attempt, reruns once, spawns a fresh watcher with the run id and that attempt | 0 of 2 (both spawned fresh, and pinned the new attempt in prose the template cannot act on) | 3 of 3 |
| Codex flake watcher: fills `run` and `att`, no slice, `exec_command` and two waits, ends on `exit: deadline` | 0 of 1 (five calls with a `slice` and a re-arm; wrote its own attempt check, and named the Codex slice as a contract problem) | 2 of 2 |
| Claude watcher: foreground at `timeout: 600000`, the template's `lim`, second call changes only `deadline` | 1 of 1 | 2 of 2 |

Every watcher plan in both arms added a `mkdir -p` for the scratch folder,
and two noted that without it the new redirects would end the loop `blocked`;
that is where the template's `mkdir` came from. One to three reps per arm is
bounded regression evidence for these plans, not a reliability estimate.

## Off-path steps are the main session's call (2026-09-24)

Some failures sit outside the workflow's path: GitHub refuses `gh run rerun --failed` until the whole run completes, while the watcher returns at the first failure; a verdict can rest on a race the loop cannot see, such as a push landing between its PR and checks reads. The skill does not grow a branch for each. When one happens, the main session decides the next step and tells the user plainly what happened and what it chose, the operator's standing preference.
