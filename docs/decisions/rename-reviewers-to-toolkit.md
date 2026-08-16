# Decision: rename the `reviewers` plugin to `toolkit`

**Date:** 2026-06-16

## Status

Implemented. `validate-native-plugin.ps1` passes.

## Context

The direct-use plugin shipped as `reviewers` because it began as four review /
governance agents. It has since accumulated five direct-use skills: `handoff-review`,
`handoff-pr`, `handoff-goal`, `doc-to-html`, and `claim-check`: of which only
`handoff-review` is review-adjacent. The name now describes the agents accurately
but mislabels the skills.

The plugin's real identity is **direct-use, no-setup, runs in any repo**: the
contrast to the `agent-workshop` onboarding plugin, which adopts the whole
scaffold into a project. `toolkit` names that identity and pairs cleanly with the
`agent-workshop` *workshop* metaphor: adopt the workshop, or grab a ready tool.

The rename was weighed against its cost: a plugin name is an install identifier,
so a rename breaks existing installs and changes the `reviewers:<agent>`
namespace. The operator confirmed the install base is their own machines only, so
the switching cost is ~zero and the change is cheap while the plugin is young
(`0.6.3`).

## The decision

Rename `reviewers` → `toolkit`. Scope and contents are unchanged: same four
agents, same five skills, same read-only / direct-use posture. Only the name,
directory, namespace, and version change.

- Agents are now namespaced `toolkit:<agent>` (e.g. `toolkit:spec-reviewer`).
- Install: `/plugin install toolkit@agent-workshop` (Claude),
  `codex plugin add toolkit@agent-workshop` (Codex).
- Version bumped `0.6.3` → `0.7.0` to mark the rename.

## Packaging

- Directory moved with `git mv plugins/reviewers` → `plugins/toolkit` (history
  preserved); skill and agent payloads inside are unchanged byte-identical
  mirrors.
- Both plugin manifests (`name`, Codex `interface.displayName` and
  `longDescription`) updated to `toolkit`; version `0.7.0`.
- Both marketplace files updated: the entry `name` and `source` path
  (`./plugins/toolkit`); the Claude marketplace version matches the manifest.
- `scripts/validate-native-plugin.ps1` updated throughout (paths, name
  assertions, source checks, the `Assert-ToolkitPlugin` /
  `Assert-CodexToolkitPlugin` helpers). The agent filenames it asserts
  (`*-reviewer.md`) are untouched: singular `-reviewer` is the agent, plural
  `reviewers` was the plugin.
- Root `README.md`, the `toolkit` plugin README, and the marketplace docs
  (`docs/marketplace/*`, plus both onboarding reference mirrors) updated.
- `agent-workshop` bumped `0.1.8` → `0.1.9`: the marketplace docs are mirrored
  into the onboarding payload, so a changed payload carries a changed version.

## Non-goals

- Not a content or scope change: no agent or skill added, removed, or altered.
- Historical decision docs and change-log entries that reference the old name are
  left as dated records; they were accurate when written and this doc explains
  the transition.
- Not a split. Keeping the agents and skills in one plugin (rather than separate
  review / workflow plugins) was reaffirmed: a split means two installs and
  defeats the in-place-update reason the skills were bundled here.

## Acceptance criteria

- `/plugin install toolkit@agent-workshop` installs the plugin; agents resolve as
  `toolkit:<agent>`; the five skills are available by name.
- No active file (README, validator, manifests, marketplaces, marketplace docs,
  plugin README) references the old plugin name; `validate-native-plugin.ps1`
  passes.
- `toolkit` is `0.7.0` and `agent-workshop` `0.1.9`, consistent across every
  manifest and the Claude marketplace entry.
