# Workshop

Ready-to-use AI agents and skills for Claude Code, Codex, Cursor, and Google Antigravity, extracted from real projects and packaged as installable plugins. You get review agents that catch problems in specs, tests, and code, plus workflow skills for handoffs and reports.

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

For Cursor, the plugin ships in the Cursor plugin format (`.cursor-plugin/`). Import this repo as a **Team Marketplace** (Teams/Enterprise, admin): **Dashboard → Settings → Plugins → Team Marketplaces → Add Marketplace → Import from Repo**, point it at `giostriquer/workshop`, then install `workbench` (and optionally `toolkit`) from **Customize** in the sidebar.

For Google Antigravity, each plugin folder carries a native `plugin.json` manifest, which is what makes it installable. Antigravity discovers plugins by scanning two locations, so copy or link `plugins/workbench` (and optionally `plugins/toolkit`) into either: your workspace's `.agents/plugins/` directory, for that workspace only, or `~/.gemini/config/plugins/`, for every workspace. There is no registry file: a plugin folder is found because it sits in a scanned directory.

### Global Rules Adoption - Optional

To install the workshop's shipped global agent configuration (its CLAUDE.md, AGENTS.md, rules, and Claude output styles) on a machine, additively, without overwriting what
is already there: run `/adopt-global-rules` after installing `toolkit`. On a machine
with no plugin installed, the same installer runs standalone:

```powershell
npx github:giostriquer/workshop --dry-run   # plan; drop --dry-run to apply
```

## The plugins

### `workbench`: use right away

Five read-only review agents, nine everyday skills, and the seven-skill **workbench**
process layer: ready immediately after install, nothing to configure.

**Agents**: they inspect and report, never edit your files:

| Agent | Reviews |
| --- | --- |
| `spec-reviewer` | design specs and plans |
| `code-quality-reviewer` | a diff's maintainability and structure |
| `test-quality-reviewer` | test code |
| `pattern-reviewer` | code-pattern conformance |
| `ci-watcher` | the branch's PR CI |

**Everyday skills:**

| Skill | Does |
| --- | --- |
| `file-pr` | files the branch's PR, tends it to green-and-mergeable |
| `fix-ci` | watches CI, fixes red in-session |
| `handoff-goal` | hands a long-running goal to a fresh autonomous session |
| `claim-check` | deep verdict on a ticket / hunch / premise |
| `qa-sweep` | team-scale QA over a broad surface, corroborated |
| `empirical-proof` | proves a finished change at the running app |
| `code-quality-review` | strict structure-first review of a diff |
| `model-reference` | the model fleet reference table + hard routing invariants |

**Workbench**: the process layer, implementing [the workbench flow](docs/workbench-flow.md):

| Skill | Does |
| --- | --- |
| `audit` | user-sized investigations, confirm-the-flags gate |
| `brainstorming` | design dialogue ending at your route pick |
| `test-driven-development` | TDD, default where a test harness exists; repo conventions take precedence |
| `systematic-debugging` | root cause before fixes |
| `verification-before-completion` | evidence before any "done" claim |
| `receiving-code-review` | rigor on arriving review feedback |
| `using-workbench` | session-start flow orientation + on-demand map |
| `self-audit` | retrospective on the process that ran the session (user-invoked only) |

Five workbench skills derive from [obra/superpowers](https://github.com/obra/superpowers)
by Jesse Vincent (MIT), adapted per
[`docs/decisions/workbench-system.md`](docs/decisions/workbench-system.md): no hooks,
no dispatcher, descriptions as honest triggers. Upstream drift tracking
(`workbench-drift`, `.claude/skills/`) is repo-local maintenance tooling, not
shipped in the plugin.

Details in [`plugins/workbench/README.md`](plugins/workbench/README.md).

### `toolkit`: optional, install when you want it

Utilities kept out of `workbench` so integrators control token load: every
installed skill's listing rides in each session's context:

| Skill | Does |
| --- | --- |
| `html-report` | report → polished dark HTML page (from a doc, or from session findings) |
| `arch-map` | visual architecture map when no doc exists |
| `ui-demo-video` | Playwright walkthrough video + verification frames |
| `get-pr-comments` | triages PR feedback into an action list |
| `writing-skills` | TDD applied to authoring skills (derived from obra/superpowers, MIT) |
| `adopt-global-rules` | installs the workshop's shipped global CLAUDE.md / AGENTS.md, rules, and Claude output styles onto a machine, additively (user-invoked only) |
| `me-human` | act as a human user dogfooding a system for real work (user-invoked only) |

Details in [`plugins/toolkit/README.md`](plugins/toolkit/README.md).

## Going deeper

- [`docs/workbench-flow.md`](docs/workbench-flow.md): the workbench system's canonical mental model (with an [arch-map rendering](docs/workbench-flow.html)).
- [`docs/skills/`](docs/skills/) is the usage handbook, with one page per shipped skill covering what it does, when to reach for it, and the questions people actually hit. Start at its [index](docs/skills/README.md).
- [`docs/decisions/`](docs/decisions/) is the rationale layer, explaining why each agent and skill exists and the calls made along the way. The specs themselves are self-contained.
