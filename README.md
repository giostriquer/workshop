# Agent Workshop

Ready-to-use AI agents and skills for Claude Code and Codex, extracted from real projects and packaged as installable plugins. You get review agents that catch problems in specs, tests, and code, plus workflow skills for handoffs and reports.

## Install

This repo doubles as a **plugin marketplace** — a catalog Claude Code can install plugins from directly. In a Claude Code session:

```
/plugin marketplace add giostriquer/agent-workshop
/plugin install workbench@agent-workshop
/plugin install toolkit@agent-workshop   # optional artifact-making utilities
```

Using Codex instead:

```powershell
codex plugin marketplace add giostriquer/agent-workshop
codex plugin add workbench@agent-workshop
codex plugin add toolkit@agent-workshop   # optional
```

For Cursor, the plugin ships in the Cursor plugin format (`.cursor-plugin/`). Import this repo as a **Team Marketplace** (Teams/Enterprise, admin): **Dashboard → Settings → Plugins → Team Marketplaces → Add Marketplace → Import from Repo**, point it at `giostriquer/agent-workshop`, then install `workbench` (and optionally `toolkit`) from **Customize** in the sidebar.

## The plugins

### `workbench` — use right away

Five read-only review agents, nine everyday skills, and the seven-skill **workbench**
process layer — ready immediately after install, nothing to configure.

**Agents** — they inspect and report, never edit your files:

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
| `handoff-goal` | hands a defined goal to a fresh autonomous session |
| `claim-check` | deep verdict on a ticket / hunch / premise |
| `qa-sweep` | team-scale QA over a broad surface, corroborated |
| `empirical-proof` | proves a finished change at the running app |
| `code-quality-review` | strict structure-first review of a diff |
| `get-pr-comments` | triages PR feedback into an action list |
| `route-work` | the model × effort reference table + hard routing invariants |

**Workbench** — the process layer, implementing [the workbench flow](docs/workbench-flow.md):

| Skill | Does |
| --- | --- |
| `audit` | user-sized investigations, confirm-the-flags gate |
| `brainstorming` | design dialogue ending at your route pick |
| `test-driven-development` | TDD, default where a test harness exists; repo conventions take precedence |
| `systematic-debugging` | root cause before fixes |
| `verification-before-completion` | evidence before any "done" claim |
| `receiving-code-review` | rigor on arriving review feedback |
| `using-workbench` | session-start flow orientation + on-demand map |

Five workbench skills derive from [obra/superpowers](https://github.com/obra/superpowers)
by Jesse Vincent (MIT), adapted per
[`docs/decisions/workbench-system.md`](docs/decisions/workbench-system.md) — no hooks,
no dispatcher, descriptions as honest triggers. Upstream drift tracking
(`workbench-drift`, `.claude/skills/`) is repo-local maintenance tooling, not
shipped in the plugin.

Details in [`plugins/workbench/README.md`](plugins/workbench/README.md).

### `toolkit` — optional, install when you want it

Artifact-making utilities kept out of `workbench` so integrators control token
load — every installed skill's listing rides in each session's context:

| Skill | Does |
| --- | --- |
| `doc-to-html` | markdown report → polished dark HTML page |
| `arch-map` | visual architecture map when no doc exists |
| `ui-demo-video` | Playwright walkthrough video + verification frames |
| `writing-skills` | TDD applied to authoring skills (derived from obra/superpowers, MIT) |

Details in [`plugins/toolkit/README.md`](plugins/toolkit/README.md).

## Going deeper

- [`docs/workbench-flow.md`](docs/workbench-flow.md) — the workbench system's canonical mental model (with an [arch-map rendering](docs/workbench-flow.html)).
- [`docs/agents/`](docs/agents/) and [`docs/skills/`](docs/skills/) — a doc per agent and skill: how to use it and how not to.
