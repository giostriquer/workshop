# Decision: the plugin validator becomes POSIX sh

**Date:** 2026-09-04

## Status

Implemented. Repo tooling only: no plugin version ships because of it, so it
gets no release-notes section.

## Context

`scripts/validate-native-plugin.ps1` needed PowerShell. That was fine when the
repo was maintained from Windows, but a session on macOS cannot run it at all:
`pwsh` is not installed, so the validator was skipped rather than run. A gate
that silently does not execute on half the machines that maintain the repo is
not a gate.

The trigger was concrete. Adding `epic-orchestration` to `toolkit` left the
validator red, because it asserts an exact match between each plugin's expected
skill list and its `skills/` directory. Nobody found out, because nobody could
run it.

## Decision

Port to `scripts/validate-native-plugin.sh`: POSIX `sh` with `awk` for the
frontmatter grammar and `node` for JSON.

- **`node`, not `jq`.** The repo already depends on node for five `.mjs`
  scripts, so it costs nothing new. `jq` would: it is absent from Git Bash on
  Windows, which is exactly the surface this port is meant to keep working.
- **`sh`, not `bash`.** macOS ships bash 3.2, so any bash 4 idiom (associative
  arrays, `mapfile`) would be a portability trap. Nothing here needs one.
- **The `.ps1` is deleted, not kept alongside.** Two implementations of one
  gate drift, and the drift is invisible until the day they disagree.

## What changed beyond a literal port

- **Runnable from any working directory** (`cd "$(dirname "$0")/.."`). The old
  script assumed the repo root as cwd; this was a known wish, recorded as the
  toy goal in `handoff-goal-split-contract-implementation-plan.md`.
- **`epic-orchestration` added to the toolkit expected-skills list**, which is
  what the port immediately caught.
- **One error line per failure.** The awk frontmatter checker called `exit`
  from inside a rule, which still runs `END`, so every frontmatter failure also
  printed a spurious "frontmatter never closes with ---". An `aborted` flag
  suppresses the END block on an already-reported failure.

Every check, message string, and the `native plugin validation ok` success line
are otherwise preserved, because roughly a hundred `docs/decisions/` notes cite
that exact string as their verification evidence.

## Verification

A seeded-fault harness copies the working tree, introduces one defect, and
requires a non-zero exit: 18 faults across skill lists, missing `SKILL.md`,
skill-name/folder parity, frontmatter grammar, manifest version drift,
forbidden `mcpServers` / `apps` / `.opencode-plugin` / `agent-workshop`, and
all three marketplace surfaces. All 18 caught, identical under `sh` and `bash`,
with an unmutated control passing.

The first version of that harness was itself the lesson: it copied the tree
with `git ls-files`, which excluded the new untracked script, so all 18 runs
failed on "No such file or directory" and scored a perfect 18/18 without ever
invoking the validator. A gate is only proven by what it accepts, and a harness
is only proven by its control.

## Non-goals

- **The ~100 `docs/decisions/` references to the `.ps1` are left alone.** They
  are dated records of what was run at the time. Only `attic/README.md`, which
  states a live rule, was updated.
- **No CI wiring.** The repo has no workflows; running the validator stays a
  manual step, as it was.
