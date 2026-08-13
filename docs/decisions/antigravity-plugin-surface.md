# Decision: add a Google Antigravity plugin surface

**Date:** 2026-08-13

## Status

Implemented. `validate-native-plugin.ps1` passes.

## Context

The repo publishes its two plugins (`workbench`, `toolkit`) across multiple host
ecosystems:

- Claude Code — `.claude-plugin/marketplace.json`, `<plugin>/.claude-plugin/plugin.json`
- Codex — `.agents/plugins/marketplace.json`, `<plugin>/.codex-plugin/plugin.json`
- Cursor — `.cursor-plugin/marketplace.json`, `<plugin>/.cursor-plugin/plugin.json`

Google Antigravity defines its own packaging convention
([antigravity.google/docs/plugins](https://antigravity.google/docs/plugins)):

- A plugin is a **directory containing a `plugin.json` at its root**. That file
  is the marker that makes the directory a plugin; its `name` field is optional
  and defaults to the directory name.
- Supported components are `skills/<skill>/SKILL.md`, `rules/<rule>.md`,
  `mcp_config.json`, and `hooks.json`. **Agent definitions are not among them**
  on this surface.
- Discovery is **directory scanning, with no registry file**: a plugin folder
  placed in `.agents/plugins/` or `_agents/plugins/` at the workspace root is
  found for that workspace; one placed in `~/.gemini/config/plugins/` is found
  everywhere.

## What was added

- `plugins/workbench/plugin.json` and `plugins/toolkit/plugin.json` — the root
  marker manifests. They carry the same `name`, `version`, and `description` as
  the other hosts' manifests, so version parity is checkable in one place.
- `scripts/validate-native-plugin.ps1` — extended to check each root
  `plugin.json` for presence, valid JSON, matching name, and version parity
  with the Claude manifest.
- Install instructions in the root and per-plugin READMEs.

Nothing about the existing skill layout had to change: `skills/<skill>/SKILL.md`
is already exactly what Antigravity scans for.

## The registry file that isn't

The first pass also added `.agents/plugins.json`, a `{"entries": [{"path":
"plugins"}]}` pointer intended to register the repo's own `plugins/` directory
so that opening this workspace in Antigravity would discover both plugins in
place. The validator was extended to require it, and the READMEs documented it
as a third install route.

**No such mechanism exists.** Neither the IDE plugin page nor the CLI plugin
page mentions a `plugins.json`, an `entries` key, or any registry, marketplace,
or path-registration file. Discovery is directory scanning and nothing else, so
the file was inert, the documented route was fiction, and the validator was
enforcing the presence of a dead file. All three were removed.

The consequence is worth stating plainly: **this repository does not
self-register.** The plugins live at `plugins/<name>/`, which is not a scanned
location, so opening the repo in Antigravity discovers nothing. Adoption is by
copying or linking a plugin folder into a scanned directory.

Making the repo self-registering was considered and rejected. Real copies under
`.agents/plugins/` would drift from the canonical folders; Windows junctions do
not survive a clone portably; and promoting `.agents/plugins/` to the canonical
home would break the Claude marketplace's `./plugins/<name>` sources and collide
with the Codex marketplace file already living there.

## Non-goals

- **No `rules/` payload.** The `adopt-global-rules` rules pack lives inside that
  skill's own directory, not at a plugin root, so Antigravity does not load it
  as active agent rules. That is the intent: the pack is content the skill
  *installs* onto a machine, not rules that fire in every session.
- **No agent surface.** `plugins/workbench/agents/` is unused by Antigravity's
  plugin format, which covers skills, rules, MCP servers, and hooks. The
  reviewers stay a Claude Code capability.
- **No `adopt-global-rules` host target for Antigravity.** Adding
  `~/.gemini/` as a globals destination is a separate decision.

## Why no version bump

The Antigravity manifests mirror the current plugin versions
(`workbench 0.23.0` / `toolkit 0.6.0`). This is an additive packaging surface
with no behavioral change to any skill or agent.
