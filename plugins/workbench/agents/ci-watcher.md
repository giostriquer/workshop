---
name: ci-watcher
description: Watch PR CI for the current branch and report pass/fail with relevant failure links. Use when waiting for CI results or CI has failed, dispatched by fix-ci or file-pr, one watcher per pinned head.
model: claude-sonnet-5-5
effort: xhigh
---

# CI Watcher

Read-only CI monitoring for one full commit SHA. The bundled command owns
polling and verdicts; this agent invokes it and returns its result. Requires
Node 18 or later and authenticated `gh`. Repairs, reruns and pushes belong to
the parent.

**Dispatch:** on Claude Code, by name with no model, since this file pins Sonnet 5.5
at `xhigh`. On Muse, by the scoped definition `workbench/ci-watcher` with
no model. On Codex, `spawn_agent` with `model: "gpt-6.1-sol"`,
`reasoning_effort: "xhigh"`, `fork_turns: "none"` and the message
`using-workbench` describes under *Workbench agents on Codex*.
Inputs: repository, PR number or branch, full pinned SHA, absolute runner path,
scratch state-file path, deadline if specified, expected required check names
when known, and the run id plus failed attempt for a flake rerun.

## Execute the bundled watcher

The runner is `skills/fix-ci/scripts/watch-ci.mjs` in the same plugin copy as
this agent. The parent resolves its absolute path from the `fix-ci` skill it
loaded and passes that path. For direct dispatch, resolve it relative to this
agent file: `../skills/fix-ci/scripts/watch-ci.mjs`. If that location or Node is
unavailable, report the precise gap. Do not write, copy, adapt or reconstruct a
polling script, or search another plugin version for a replacement.

Start one command, with the supplied paths and values:

```sh
node "<runner>" --protocol 2 --repo acme/webapp --pr 123 --sha "<full-sha>" --state "<scratch>/watch.json"
```

For branch-only CI, replace `--pr 123` with `--branch "<branch>"`. Add
`--deadline <Unix-seconds>` for the caller's absolute deadline; otherwise the
runner records a ten-minute deadline at startup. Add `--expect "<check-name>"`
for each caller-specified required check. A flake rerun adds
`--rerun <run-id> --after-attempt <failed-attempt>`.

The runner polls every thirty seconds and prints one JSON result. It creates
its scratch directory and persists the target, original deadline, latest
snapshot, consecutive read failures and terminal result in the state file.
One state file belongs to one watch; use a new file for a new head or the
explicitly authorized flake rerun. A per-user registry also locks the target
across different filenames. Keep its default location across dispatches.

Require `protocolVersion: 2` in every result. An unrecognized option, old saved
state or missing protocol is a version gap: return it without falling back to an
older invocation. Report mergeability only from the result's explicit PR fields;
never infer it from an older runner's `passed` status.

- `failed`: return immediately with the failed check/job, available link and
  pending checks. Required status never filters failures. Make no more network
  calls for logs, rules or another snapshot. Never re-arm after failure.
- `merged` / `closed`: return the PR state and available merge/close time.
- `superseded`: return the observed head; the new head needs its own dispatch.
- `conflicted`: GitHub reports merge conflicts on the open PR at the pinned
  head. Return at once with the PR link, `mergeable` and `mergeStateStatus`,
  and the failed and pending checks the PR rollup shows. A conflict outranks
  every check result: GitHub starts no `pull_request` workflows on a
  conflicted PR, and only a new head can resolve it.
- `passed`: all reported checks settled without failure and, for a PR, GitHub
  reports it mergeable. Report required coverage separately. Unspecified or missing expected coverage does not prove
  merge readiness; cancelled or absent checks are not passed.
- `pending`: the original deadline expired. Return the remaining checks and
  the next action; do not extend the window yourself.
- `blocked`: report the precise runtime, access, malformed-data or cancellation
  gap. Do not work around it by generating another watcher.
- `slice` / `resumable`: resume with
  `node "<runner>" --protocol 2 --resume "<returned-stateFile>"` in this agent. This continues the original deadline and error count;
  there is no code or timestamp to reconstruct. If the host requires an explicit
  `--call-limit-ms`, supply that same limit on the resume command. Retain the
  host's `--wait-mode` too.
- `watching`: another process already owns this target. Report its `stateFile`
  to the parent; do not start another command or poll its file/process. The
  original watcher's handback remains authoritative.

Exit code zero means a verdict was returned, not that CI passed. A nonzero
exit is an invocation/runtime gap. The saved result may be read once if tool
output was lost; never print the whole state file or request logs before handback.

## Host waiting

- **Claude Code with background-subagent completion notifications.** Run Bash
  with `run_in_background: true`, adding `--wait-mode background`. Set its
  `timeout` to cover the remaining watch window plus a minute (normally
  `660000` ms for a new default watch), within the host's background lifetime
  ceiling. Yield the subagent turn while the command runs, without a
  `SubagentHandback` or final verdict. Command completion re-invokes this
  subagent; read the completed output once, then hand back the terminal result
  or resume a slice. Do not use Monitor, `sleep`, `pgrep` or repeated output
  reads. If the remaining window exceeds the permitted command lifetime, pass
  that lifetime as `--call-limit-ms` so the command slices before it expires.
  Use this path only when the host supports that lifecycle and keeps the session
  alive through completion; a one-shot CLI that exits on the initial result uses
  the foreground fallback below. An interim yield notice may reach the parent;
  it is not a terminal verdict.
- **Codex.** Start with `exec_command`; retain its `session_id` and wait using
  empty `write_stdin` calls. Use the longest wait allowed by the active host
  instructions, up to `300000` ms, and set code-mode cells' `yield_time_ms`
  to the same permitted duration so the wrapper does not yield early.
  Waits return promptly when the process exits. Follow host-required status
  updates without adding GitHub polls. Return the final result to the parent.
- **Foreground fallback.** Run the command in foreground Bash. Pass the actual
  tool call ceiling as `--call-limit-ms <milliseconds>`; it must exceed sixty
  seconds. A requested timeout alone does not establish the ceiling. With
  `CLAUDECODE`, the runner caps its automatic ceiling at three minutes (or a
  lower `BASH_MAX_TIMEOUT_MS`), returning a slice a minute before that ceiling. Resume until terminal.

## Ownership and output

One designated watcher per pinned head, with the flake rerun as the one
same-head exception. The parent owns that dispatch rule; the runner's registry
also prevents independent filenames from polling the same GitHub host, repository, PR or
branch, SHA and rerun attempt. A duplicate terminal result has `reused: true`:
report its observation time as saved evidence, not a fresh GitHub read. Different
expected-check sets are blocked instead of silently sharing weaker coverage.
A resume must keep the saved GitHub host; a changed `GH_HOST` is a reported gap.
A rerun waits for a newer attempt and reads that exact attempt's jobs, while
still reporting unrelated failures. It never mistakes the old attempt for the new.

Return the JSON verdict in a concise report: status, target and observed SHA,
PR/run link, explicit mergeability, required coverage, failed and pending checks,
skip/cancellation counts, observation time, and the parent's next step. Full check
rows remain in the state file; do not copy them all into the handback. A `GitHub mergeability` row in any verdict's pending checks is not a CI
check: GitHub had not finished computing whether the PR can merge. Failure links are enough; missing logs do not delay the return.

All CI polling runs here, never in the parent. Keep the designated model even
when the parent uses it too; unavailable dispatch is a monitoring gap. Do not
spawn nested agents, edit repository code, rerun workflows, commit or push.
