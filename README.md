# Workshop

Ready-to-use AI agents and skills for Claude Code, Codex, Cursor, Google Antigravity, and OpenCode, extracted from real projects and packaged as installable plugins. You get review agents that catch problems in specs, tests, and code, plus workflow skills for handoffs and reports.

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

For OpenCode there is no marketplace or manifest to register: opencode loads skills by scanning directories. Clone this repo and point your global config at the two skill folders:

```jsonc
// ~/.config/opencode/opencode.jsonc
{ "skills": { "paths": ["<clone>/plugins/workbench/skills", "<clone>/plugins/toolkit/skills"] } }
```

or copy individual `plugins/<plugin>/skills/<skill>/` folders into `~/.config/opencode/skill/`. The five review agents are not carried on this surface (opencode's agent format differs; see [the decision note](docs/decisions/plugin-surfaces.md)).

### Global Rules Adoption - Optional

To install the workshop's shipped global agent configuration (its CLAUDE.md, AGENTS.md, rules, and Claude output styles) on a machine, additively, without overwriting what
is already there: run `/adopt-global-rules` after installing `toolkit`. On a machine
with no plugin installed, the same installer runs standalone:

```powershell
npx github:giostriquer/workshop --dry-run   # plan; drop --dry-run to apply
```

## The plugins

### `workbench`: use right away

Five read-only review agents, twelve everyday skills, and the eight-skill **workbench**
process layer: ready immediately after install, nothing to configure.

**Agents**: they inspect and report, never edit your files:

| Agent | Reviews |
| --- | --- |
| `spec-reviewer` | design specs and plans |
| `code-quality-reviewer` | a diff's maintainability and structure |
| `test-quality-reviewer` | test code; loads the `test-quality-review` rubric |
| `pattern-reviewer` | code-pattern conformance |
| `ci-watcher` | the branch's PR CI |

**Everyday skills:**

| Skill | Does |
| --- | --- |
| `file-pr` | files the branch's PR, tends it to green-and-mergeable |
| `fix-ci` | delegates CI watching to Opus (Claude) or Sol (Codex), fixes red in-session |
| `handoff-goal` | hands a long-running goal to a fresh autonomous session |
| `claim-check` | deep verdict on a ticket / hunch / premise |
| `qa-sweep` | team-scale QA over a broad surface, corroborated |
| `empirical-proof` | proves a finished change at the running app |
| `code-quality-review` | strict structure-first review of a diff |
| `test-quality-review` | whether a diff's tests protect behavior, backed by a mutation run |
| `model-reference` | the model fleet reference table + hard routing invariants |
| `epic-orchestration` | owns a multi-ticket epic whose lanes other sessions implement (user-invoked only) |
| `epic-implementation` | uses the shared [lane report template](plugins/workbench/skills/epic-orchestration/references/lane-report.md) in lanes dispatched through epic-orchestration |
| `epic-cleanup` | on your explicit ask: lists a repo's stale worktrees, branches, caches and stray processes for you to pick from, or removes an epic's leftovers; keeps active worktrees |

**Workbench**: the process layer, implementing [the workbench flow](docs/workbench-flow.md):

| Skill | Does |
| --- | --- |
| `audit` | investigations scoped from the request; ask only for unresolved scope or intent |
| `brainstorming` | design dialogue ending at your route pick |
| `test-driven-development` | TDD, default where a test harness exists; repo conventions take precedence |
| `systematic-debugging` | four-phase investigation for persistent or unclear failures |
| `verification-before-completion` | evidence before any "done" claim |
| `receiving-code-review` | rigor on arriving review feedback |
| `using-workbench` | on-demand flow orientation |
| `self-audit` | on your explicit ask: retrospective on the process that ran the session, read from its transcript, ending in a paste-ready defect note |

Five workbench skills derive from [obra/superpowers](https://github.com/obra/superpowers)
by Jesse Vincent (MIT), adapted per
[`docs/decisions/workbench-system.md`](docs/decisions/workbench-system.md): no hooks,
no dispatcher, descriptions as honest triggers. Upstream drift tracking
(`workbench-drift`, `.claude/skills/`) is repo-local maintenance tooling, not
shipped in the plugin.

`code-quality-review`, `code-quality-reviewer` and `ci-watcher` derive from
Cursor's [cursor/plugins](https://github.com/cursor/plugins) (`thermos` and
`cursor-team-kit`, MIT), adapted per
[`docs/decisions/code-quality-review.md`](docs/decisions/code-quality-review.md)
and [`docs/decisions/fix-ci.md`](docs/decisions/fix-ci.md).

Details in [`plugins/workbench/README.md`](plugins/workbench/README.md).

### `toolkit`: optional, install when you want it

Utilities kept out of `workbench` so integrators control token load: every
installed skill's listing rides in each session's context:

| Skill | Does |
| --- | --- |
| `html-artifact` | HTML reports, plans, architecture explanations, and interactive product targets (user-invoked only) |
| `ui-demo-video` | Playwright walkthrough video + verification frames |
| `get-pr-comments` | triages PR feedback into an action list |
| `adopt-global-rules` | installs the workshop's shipped global CLAUDE.md / AGENTS.md, rules, and Claude output styles onto a machine, additively (user-invoked only) |
| `me-human` | dogfood a system from a human user's perspective (user-invoked only) |
| `test-audit` | gates a test before it lands, and audits or prunes low-value, duplicative, or implementation-coupled tests (user-invoked only) |
| `trim-comments` | removes comment slop from the branch diff before review and offers encodings for constraint comments (user-invoked only) |
| `grill-me` | interviews you about a plan or idea until every branch is settled (user-invoked only) |
| `grilling` | the round-based interview behind `grill-me` and `improve-codebase-architecture` |
| `improve-codebase-architecture` | surveys a codebase for deepening opportunities, then grills the one you pick (user-invoked only) |
| `codebase-design` | the deep-module design vocabulary |
| `domain-modeling` | keeps a project's `CONTEXT.md` glossary and ADRs current |

`get-pr-comments` derives from `cursor-team-kit` in Cursor's
[cursor/plugins](https://github.com/cursor/plugins) (MIT), adapted per
[`docs/decisions/get-pr-comments.md`](docs/decisions/get-pr-comments.md).

`test-audit` derives from OpenClaw's
[openclaw/openclaw](https://github.com/openclaw/openclaw)
(`.agents/skills/test-audit`, MIT, Copyright (c) 2026 OpenClaw Foundation),
adapted per [`docs/decisions/test-audit.md`](docs/decisions/test-audit.md).

`trim-comments` derives from OpenClaw's
[openclaw/openclaw](https://github.com/openclaw/openclaw)
(`.agents/skills/deslop`, MIT, Copyright (c) 2026 OpenClaw Foundation), with
its comment keep-list and its constraint-comment and suppression rules from the
`pstack` plugin in Cursor's [cursor/plugins](https://github.com/cursor/plugins)
(`no-comments` and `comment-sicko`, MIT, Copyright (c) 2026 Lauren Tan),
adapted per
[`docs/decisions/trim-comments.md`](docs/decisions/trim-comments.md).

`grill-me`, `grilling`, `improve-codebase-architecture`, `codebase-design` and
`domain-modeling` derive from Matt Pocock's
[mattpocock/skills](https://github.com/mattpocock/skills) (MIT, Copyright (c)
2026 Matt Pocock), with improvements from the `pstack` plugin in Cursor's
[cursor/plugins](https://github.com/cursor/plugins) (MIT, Copyright (c) 2026
Lauren Tan), adapted per
[`docs/decisions/mattpocock-skills.md`](docs/decisions/mattpocock-skills.md).

Details in [`plugins/toolkit/README.md`](plugins/toolkit/README.md).

## Going deeper

- [`docs/workbench-flow.md`](docs/workbench-flow.md): the workbench system's canonical mental model (with an [HTML rendering](docs/workbench-flow.html)).
- [`docs/skills/`](docs/skills/) is the usage handbook, with one page per shipped skill covering what it does, when to reach for it, and the questions people actually hit. Start at its [index](docs/skills/README.md).
- [`docs/decisions/`](docs/decisions/) is the rationale layer, explaining why each agent and skill exists and the calls made along the way. The specs themselves are self-contained.
