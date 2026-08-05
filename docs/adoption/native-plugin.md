# Native Onboarding Plugin

Agent Workshop ships a native marketplace plugin for Claude Code and Codex. The
plugin is intentionally small: it exposes one active skill,
`agent-workshop-onboard`, and bundles the scaffold files as references.

Installing the plugin does not install the scaffold agents globally. It gives the
host a guided onboarding surface that can inspect a target repo, recommend the
smallest useful pack set, and apply only an approved project-local file set.

## Marketplace Files

- Claude Code: `.claude-plugin/marketplace.json` with payload in `plugins/agent-workshop/`
- Codex: `.agents/plugins/marketplace.json` with payload in `plugins/agent-workshop/`
- Cursor: `.cursor-plugin/marketplace.json` with per-plugin `plugins/<name>/.cursor-plugin/plugin.json`

All three marketplace surfaces point to the same slim plugin payload. That payload
contains `plugins/agent-workshop/.claude-plugin/plugin.json`,
`plugins/agent-workshop/.codex-plugin/plugin.json`,
`plugins/agent-workshop/.cursor-plugin/plugin.json`, and exactly one active skill
directory: `plugins/agent-workshop/skills/agent-workshop-onboard/`. The Cursor
per-plugin manifest version is kept in lockstep with the Claude/Codex manifests by
`scripts/validate-native-plugin.ps1`.

Marketplace installs point at this slim payload, never at repo root: the repo
root also holds the scaffold's canonical `.claude/skills/` tree, and pointing an
install there would expose all of it as active skills.

## Install From A Separate Machine

For Claude Code:

```text
/plugin marketplace add giostriquer/agent-workshop
/plugin install agent-workshop@agent-workshop
```

For Codex:

```powershell
codex plugin marketplace add giostriquer/agent-workshop --ref main
codex plugin add agent-workshop@agent-workshop
codex plugin add toolkit@agent-workshop
```

Codex can also install from a local checkout while developing the marketplace:

```powershell
codex plugin marketplace add E:\dev\agent-workshop
codex plugin add agent-workshop@agent-workshop
```

Use a new Codex thread after installing or updating the plugin so the newly
installed `agent-workshop-onboard` skill is available to the session.

For Cursor, custom-repo marketplaces are a **Team Marketplace** feature
(Teams/Enterprise, admin). In the dashboard go to **Settings → Plugins → Team
Marketplaces → Add Marketplace → Import from Repo**, point it at
`giostriquer/agent-workshop`, then install `agent-workshop` / `toolkit` from
**Customize** in the sidebar. (Plugins published to the official
[cursor.com/marketplace](https://cursor.com/marketplace) install with `/add-plugin`
or the **Add to Cursor** button.)

The Cursor marketplace manifest uses `metadata.pluginRoot: "plugins"` with short
plugin `source` names (`agent-workshop`, `toolkit`). That matches Cursor's
multi-plugin convention and differs from the Claude/Codex manifests, which use
full relative paths.

Cursor loads Claude marketplace plugins through a compatibility path
(`loadClaudePlugin`). That path exposes toolkit **skills** but not the toolkit
**agents** — agents require a Cursor-native install (Team Marketplace, or a copy
under `~/.cursor/plugins/local/<name>/`) because only `.cursor-plugin/plugin.json`
declares `"agents": "./agents/"`. Opening this repo as a workspace does not
auto-install its Cursor plugins.

`toolkit` is the Codex-native counterpart to the Claude Code
`toolkit` plugin. Codex plugins distribute skills, apps, and MCP servers, so
the active Codex surface is the `handoff-review`, `handoff-pr`,
`handoff-goal`, `doc-to-html`, `claim-check`, `qa-sweep`, `empirical-proof`,
`code-quality-review`, and `get-pr-comments` skills. The
reviewer agent files are bundled in the plugin payload for Claude Code and
reference, but Codex custom agents still need repo-local `.codex/agents/`
wrappers from onboarding.

## Skill Modes

- `mode: plan` is the default. It is read-only and returns selected packs,
  classifications, required profile slots, exact proposed files, validation
  checks, risks, and omitted agents.
- `mode: apply` writes only an approved plan's exact file set. It checks git
  status, refuses ambiguous paths, preserves unrelated local content, and does
  not commit unless the approved plan explicitly asks for a commit.
- `mode: audit` checks an existing Agent Workshop adoption for drift, stale
  agents, wrapper mismatches, profile gaps, and accidental plugin-global agents.
- `mode: explain` answers questions about packs, host wrappers, profile slots,
  and agent boundaries using the bundled references.

## Bundled References

The onboarding plugin is a **self-contained bundle** — it carries everything it
adopts into a target repo, and only what it adopts (the project-coupled agents and
the workflow skills). The direct-use, self-contained skills and the
`code-quality-reviewer` agent are *not* bundled here; adopters get those by
installing the `toolkit` plugin. The bundle holds:

- `references/catalog.json` (the canonical onboarding pack catalog)
- canonical agent specs under `references/agents/<name>.md` (the bundle is the
  canonical home for the onboarding-only agents)
- host-wrapper templates under `references/wrappers/{codex,gemini,opencode}/`
- flattened skill specs under `references/skills/<name>.md` (not nested `SKILL.md`)
- origin docs for the bundled agents/skills plus the full convention and marketplace docs

These are templates for approved repo-local adoption, not active plugin skills.

The validator checks that the bundle is self-consistent (catalog mirror, cataloged
agents fully bundled, origin docs fresh against `docs/`) and that the few skills/
agents this repo itself runs stay byte-identical to their bundle templates:

```powershell
.\scripts\validate-native-plugin.ps1
```

## Manual Copy Remains Available

The native plugin is the preferred guided path when Claude Code or Codex can load
marketplace plugins. Manual copying still works and remains the fallback for
other hosts, offline workflows, or cases where the operator wants to review every
file by hand before adoption.
