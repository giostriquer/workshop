# Decision: add the `get-pr-comments` skill (toolkit-only)

**Date:** 2026-06-30

## Status

Implemented (2026-06-30). `validate-native-plugin.ps1` passes.

## Context

PR feedback is scattered across three GitHub surfaces: the conversation tab, review
verdicts, and inline comments pinned to diff lines, and reading them in the UI to
work out "what must I actually change" is slow and easy to do incompletely.
`get-pr-comments` collapses that into one `gh` pass: fetch all three, group by
severity and actionability, and return a prioritized action list plus the open
questions still waiting on a human.

## The load-bearing rule: read, never reply

The defining design choice is a **boundary, not a feature**: the skill **must not
reply to, resolve, react to, or otherwise respond to any PR comment unless the
operator explicitly asks** for that specific action. Summarizing feedback and
*answering* it are different acts with different stakes: auto-replying on a shared
PR is exactly the kind of outward-facing side effect that should never fall out of
"show me the comments." The rule is the first item in the skill's **Boundaries**
section and is restated in the description and the origin doc so it can't be missed.

## Adaptations from the supplied spec

The spec was clean Claude Code skill format; changes were minimal:

- **Description** gained a `Use when…` trigger (from the spec's own `## Trigger`
  line) for discoverability, the scaffold's description convention.
- **Workflow** kept the spec's four steps and made them concrete with the actual
  `gh` commands (resolve PR, fetch conversation + reviews + inline comments).
- **Boundaries** section added: the no-reply rule plus read-only (no edits, no PR
  state changes) and a plain-failure note when there's no PR / `gh` is
  unauthenticated.

## Placement: toolkit-only

`get-pr-comments` is **self-contained**: just `gh` against the current branch's PR,
no project profile or convention docs. So it ships **direct-use in the `toolkit`
plugin** (one canonical copy at `plugins/toolkit/skills/get-pr-comments/SKILL.md`)
and is **not** in the onboarding adoption set. It sits naturally alongside the
`ci-watcher` agent, giving maintainers two read-only tools for answering "what's
the state of my PR?": comments and CI.

## What changed

- Canonical `plugins/toolkit/skills/get-pr-comments/SKILL.md` (the only copy); origin
  doc `docs/skills/get-pr-comments.md`.
- `scripts/validate-native-plugin.ps1`: both toolkit-skills expected lists widened to
  eight.
- `plugins/toolkit/README.md` (count `seven` → `eight`, intro clause, two
  enumerations, skills table), root `README.md`, the Codex toolkit manifest
  (longDescription + defaultPrompt), the `docs/adoption/native-plugin.md` Codex skill
  enumeration, and the skills roster `docs/skills/README.md` updated; roster +
  native-plugin re-mirrored to the bundle.
- Versions: `toolkit` `0.10.0` → `0.11.0` (new skill), `agent-workshop` `0.1.17` →
  `0.1.18` (bundled roster/native-plugin docs grew), consistent across both manifests
  and the Claude marketplace.

## Non-goals

- Not a responder. It triages and summarizes; replying, resolving, or reacting is a
  separate, explicit instruction the operator gives per action.
- Not GitHub-agnostic out of the box: it assumes `gh`. Other review hosts swap the
  fetch commands; the group-by-severity-and-actionability shape is host-agnostic.

## Acceptance criteria

- `/get-pr-comments` resolves the branch's PR, pulls conversation + review + inline
  comments, and returns a severity-grouped, prioritized action list with open
  questions split out: **without** touching the PR.
- `toolkit` at `0.11.0`, `agent-workshop` at `0.1.18`, consistent across manifests and
  the marketplace; `scripts/validate-native-plugin.ps1` passes.
