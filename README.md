# Workshop

Installable skills and agents for Claude Code, Codex, Cursor, Google Antigravity, OpenCode, and Muse. Workbench supplies the development workflow; Toolkit adds optional utilities. Both come from use in real projects.

## Install

This repo doubles as a **plugin marketplace**: a catalog Claude Code can install plugins from directly.

In a Claude Code session:

```
/plugin marketplace add giostriquer/workshop
/plugin install workbench@workshop
/plugin install toolkit@workshop   # optional utilities
```

Codex install:

```powershell
codex plugin marketplace add giostriquer/workshop
codex plugin add workbench@workshop
codex plugin add toolkit@workshop   # optional
```

Muse install:

```sh
muse plugins marketplace add workshop https://github.com/giostriquer/workshop
muse plugins install workbench@workshop
muse plugins install toolkit@workshop   # optional
muse plugins approve workbench          # activates the six agent definitions
```

Muse reads the same marketplace catalog and each plugin's native
`.muse-plugin/plugin.json`. Skills are active on install; agent definitions
stay inactive until approved, per Muse's review step for third-party
plugins. One parity hole: Muse's native loader does not yet honor the
user-invoked-only skill policy, so those skills are model-invocable on Muse
until it does; `muse skills user-only plugin:<plugin>:<skill> --scope plugin`
restores the policy per machine (see
[the decision note](docs/decisions/plugin-surfaces.md)).

For Cursor, the plugin ships in the Cursor plugin format (`.cursor-plugin/`). Import this repo as a **Team Marketplace** (Teams/Enterprise, admin): **Dashboard → Settings → Plugins → Team Marketplaces → Add Marketplace → Import from Repo**, point it at `giostriquer/workshop`, then install `workbench` (and optionally `toolkit`) from **Customize** in the sidebar.

For Google Antigravity, each plugin folder carries a native `plugin.json` manifest, which is what makes it installable. Antigravity discovers plugins by scanning two locations, so copy or link `plugins/workbench` (and optionally `plugins/toolkit`) into either: your workspace's `.agents/plugins/` directory, for that workspace only, or `~/.gemini/config/plugins/`, for every workspace. There is no registry file: a plugin folder is found because it sits in a scanned directory.

For OpenCode there is no marketplace or manifest to register: opencode loads skills by scanning directories. Clone this repo and point your global config at the two skill folders:

```jsonc
// ~/.config/opencode/opencode.jsonc
{ "skills": { "paths": ["<clone>/plugins/workbench/skills", "<clone>/plugins/toolkit/skills"] } }
```

Alternatively, copy an individual `plugins/<plugin>/skills/<skill>/` folder into
`~/.config/opencode/skill/`. Also copy that plugin's `LICENSE` and
`THIRD_PARTY_NOTICES.md` into the copied skill folder so its permission terms
and upstream attribution travel with it. The workbench agents are not carried
on this surface (opencode's agent format differs; see
[the decision note](docs/decisions/plugin-surfaces.md)).

### Codex submission packages

Marketplace installs use the shared plugin sources. For an OpenAI submission,
export a Codex-only directory first (requires [uv](https://docs.astral.sh/uv/)):

```sh
uv run scripts/export-codex-plugin.py plugins/workbench tmp/codex-export/workbench
uv run scripts/export-codex-plugin.py plugins/toolkit tmp/codex-export/toolkit
```

Each destination must be new. The exporter keeps skill content and Codex policies,
and removes Claude's invocation field only after checking the equivalent Codex
policy. It leaves the shared sources intact. Run the bundled `plugin-creator`
skill's `scripts/validate_plugin.py` against these exported directories before
packaging them for submission. Repository-source checks still use
`sh scripts/validate-native-plugin.sh`; the reason for the separate export is in
[plugin surfaces](docs/decisions/plugin-surfaces.md#codex-submission-export-2026-09-25).

### Global Rules Adoption - Optional

To install the workshop's shipped global agent configuration (its per-host instruction documents, rules, and Claude output styles, for Claude Code, Codex, and Muse) on a machine, additively, without overwriting what
is already there: run `/adopt-global-rules` after installing `toolkit`. On a machine
with no plugin installed, the same installer runs standalone:

```powershell
npx github:giostriquer/workshop --dry-run   # plan; drop --dry-run to apply
```

## Choose a plugin

| Plugin | Contents | Reference |
| --- | --- | --- |
| **workbench** | Investigation, brainstorming, codebase design and domain modeling, implementation, verification, review, and delivery, plus review and CI agents | [Catalog and agent contracts](plugins/workbench/README.md) |
| **toolkit** | Optional tools for artifacts, architecture surveys, dependencies, feedback, and machine setup | [Catalog](plugins/toolkit/README.md) |

Workbench operates without Toolkit. Toolkit's architecture survey requires
Workbench's design references; its correction skill uses them for unresolved
design choices. Grilling remains in Toolkit.

Use [contract-review](docs/skills/contract-review.md) to check agreed behavior and
affected consumers through the `contract-reviewer` agent.

Use [workspace-cleanup](docs/skills/workspace-cleanup.md) when you ask to reclaim
project or machine disk space from worktrees, Docker, build caches and scratch
artifacts. It replaces the former `epic-cleanup` command.

Start with [using-workbench](docs/skills/using-workbench.md) for the workflow,
or the [skills handbook](docs/skills/README.md) to choose a skill by task.
Neither plugin installs hooks or a dispatcher. Skill descriptions and explicit
invocation determine when skills load; host limitations are noted above.

## Repository map

| Location | Purpose and authority |
| --- | --- |
| `plugins/<plugin>/skills/<name>/SKILL.md` | Canonical shipped skill, with its supporting files beside it |
| `plugins/workbench/agents/` | Canonical shipped agent contracts and dispatch instructions |
| `plugins/<plugin>/` manifests | Host packaging over the same skill and agent sources |
| `.claude/skills/` | Canonical repo-only maintenance skills |
| `.codex/skills/` | Complete mirrors of those maintenance skills; Codex policy sidecars are host-specific |
| `docs/skills/` | Reader-facing usage handbook; the skill spec wins on disagreement |
| `docs/decisions/` | Rationale for current choices; amend the owning note when a choice changes |
| `docs/change-log.md` | Bounded release notes for plugin versions |
| `scripts/` | Repository validation, export, and focused test tooling |
| `attic/` | Inactive drafts and retired pieces, shipped by no plugin; see its [index](attic/README.md) |

The repo-only skills are `change-log`, `mine-transcripts`, `push`, `release`,
`workbench-drift`, and `writing-skills`. They are not installed with either
plugin. There are no repo-scoped agent definitions.

## Maintainer entry points

Follow [AGENTS.md](AGENTS.md) for maintenance rules. Read the affected canonical
spec first, its usage page when behavior changes, and its decision note for
rationale. Load supporting references when the spec's branch requires them.

- [Workflow map](docs/workbench-flow.md), with an [HTML view](docs/workbench-flow.html).
- [Repo tooling decisions](docs/decisions/repo-tooling.md): mirrors, validation, drift tracking, and releases.
- [Plugin surfaces](docs/decisions/plugin-surfaces.md): packaging and host differences.
- [Handbook contract](docs/decisions/docs-skills-returns-as-usage-handbook.md): what belongs in usage pages.
- [Decision-note convention](docs/decisions/decisions-one-note-per-piece.md): one owning note per piece.
- [Release notes](docs/change-log.md): shipped plugin changes.

Run `sh scripts/validate-native-plugin.sh` for package, mirror and entrypoint
size checks. Active `SKILL.md` files stay below 20,000 UTF-8 bytes; substantial
conditional procedures live beside them in linked references. Shared authority,
recovery and completion gates stay in the entrypoint. For the size check alone,
run `node scripts/check-skill-size.mjs`.
For an implementation change, run the affected focused tests under `scripts/`
or the owning maintenance skill. Full CI suites are not a local default.
The root and each plugin carry a standard MIT `LICENSE` and an accompanying
`THIRD_PARTY_NOTICES.md`. Keep both when redistributing either a full package
or an individual skill. Repo-only attribution is in the root
[third-party notices](THIRD_PARTY_NOTICES.md); plugin attribution is in each
plugin's notices and README.
