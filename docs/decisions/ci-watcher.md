# Decision: add the `ci-watcher` agent (toolkit-only)

**Date:** 2026-06-29

## Status

Implemented (2026-06-29). `validate-native-plugin.ps1` passes.

## Context

Waiting on CI is a recurring session tax: you push, then either babysit the PR
checks or context-switch and forget to return, and on a failure, digging the
actual failing log out of a multi-job workflow is its own chore. `ci-watcher` is a
small, self-contained agent that absorbs that wait: dispatch it (ideally in the
background) and it watches the current branch's PR checks via `gh`, then returns a
pass/fail verdict with the failing-log excerpt or the check link already in hand.

It is the first toolkit agent that is **neither review nor governance**: a utility
monitor, so the toolkit's identity was broadened from "review and governance
agents" to "review, governance, and CI-monitoring agents."

## Adaptations from the supplied spec

The spec was operator-provided in another host's agent format; the scaffold version
keeps its identity and changes what doesn't port to Claude Code:

- **`is_background: true` dropped.** This is not a Claude Code agent frontmatter field. The
  background intent moved into the description/body (it's `git`+`gh` only, so a
  parent can run it in the background and read the report when it returns).
- **`model: fast` dropped → `model: inherit`**: the scaffold never names a specific
  model (more portable, and clearer for adopters and other plugins); every other
  agent inherits. A CI monitor is light enough that the session model is fine.
- **`tools` added**: `Bash, Read` (the spec had no tools field). Bash runs `git`/`gh`;
  Read is for glancing at a workflow file when suggesting a next step. Read-only.
- A **Boundaries** section was added (read-only; no nested subagents; report plainly
  when there's no branch / no PR / unauthenticated `gh`).

## Placement: toolkit-only

`ci-watcher` is **self-contained** and needs no project profile, convention docs,
or adaptation; it works in any repo with a GitHub PR and an authenticated `gh`. So
under the decoupled-plugins model it ships **direct-use in the `toolkit` plugin**
(one canonical copy at `plugins/toolkit/agents/ci-watcher.md`) and is **not** part of
the onboarding adoption set. It is not in the `marketplace`-style catalog or bundled as a
copy-and-adapt template, no host wrappers. Adopters who want it install the toolkit
plugin.

## What changed

- Canonical `plugins/toolkit/agents/ci-watcher.md` (the only spec copy). Origin doc
  `docs/agents/ci-watcher.md`.
- `scripts/validate-native-plugin.ps1`: toolkit-agents expected list widened to six.
- `plugins/toolkit/README.md` (count `five` → `six`, broadened identity, agents table
  with an `Inspects` column, tool note), root `README.md` (agent list), and the agent
  roster `docs/agents/README.md` (count `nine` → `ten`, new row, compose bullet). The
  roster also fixed a stale value left by the decouple: `code-quality-reviewer`'s
  Pack column now reads `toolkit` (it was removed from the `review-core` pack), and a
  note explains that `toolkit` in the Pack column means direct-use, not an onboarding
  pack. Roster re-mirrored to the onboarding bundle.
- Version bumps: `toolkit` `0.9.0` → `0.10.0` (new agent), `agent-workshop` `0.1.16` →
  `0.1.17` (the bundled roster doc grew), consistent across both manifests and the
  Claude marketplace.

## Non-goals

- Not a fixer. Read-only; it reports; re-running, fixing, or pushing is the caller's
  job.
- Not GitHub-agnostic out of the box: it assumes `gh`. Other CI hosts swap the `gh`
  calls for their CLI; the resolve → watch → report shape is host-agnostic.

## Acceptance criteria

- Dispatchable as `toolkit:ci-watcher`; resolves the current branch's PR, watches its
  checks, and returns a pass/fail verdict with the failing-log excerpt or check link,
  read-only.
- `toolkit` at `0.10.0`, `agent-workshop` at `0.1.17`, consistent across manifests and
  the marketplace; `scripts/validate-native-plugin.ps1` passes.
