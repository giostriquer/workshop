# Agent Workshop

Ready-to-use AI agents and skills for Claude Code and Codex, extracted from real projects and packaged as installable plugins. You get review agents that catch problems in specs, tests, and code, plus workflow skills for handoffs and reports.

## Install

This repo doubles as a **plugin marketplace** — a catalog Claude Code can install plugins from directly. In a Claude Code session, add it once:

```
/plugin marketplace add giostriquer/agent-workshop
```

Then install one (or both) of the plugins:

```
/plugin install toolkit@agent-workshop
/plugin install agent-workshop@agent-workshop
```

Using Codex instead:

```powershell
codex plugin marketplace add giostriquer/agent-workshop
codex plugin add toolkit@agent-workshop
codex plugin add agent-workshop@agent-workshop
```

For Cursor, the plugins ship in the Cursor plugin format (`.cursor-plugin/`). Import this repo as a **Team Marketplace** (Teams/Enterprise, admin): **Dashboard → Settings → Plugins → Team Marketplaces → Add Marketplace → Import from Repo**, point it at `giostriquer/agent-workshop`, then install `toolkit` / `agent-workshop` from **Customize** in the sidebar. (Plugins published to the official [cursor.com/marketplace](https://cursor.com/marketplace) install with `/add-plugin` or the **Add to Cursor** button.)

## The plugins

### `toolkit` — use right away

Review agents and direct-use skills, ready immediately after install with nothing to configure:

- **Agents:** `spec-reviewer` (design specs and plans), `code-quality-reviewer` (maintainability and structure of a diff), `test-quality-reviewer` (test code), `pattern-reviewer` (code-pattern conformance), `vigil` (your agent/skill setup itself), and `ci-watcher` (your branch's PR CI). All read-only — they inspect and report, never edit your files.
- **Skills:** `handoff-pr` and `handoff-goal` hand in-flight work to a fresh session or agent; `doc-to-html` turns a markdown report into a polished dark-themed HTML page; `claim-check` runs an unbiased investigation of a premise (ticket, hunch, or question) and returns a verdict plus a readiness dossier; `qa-sweep` fans a QA team over a broad surface and corroborates every finding firsthand before it counts; `empirical-proof` proves a just-finished change at the running software — real MCP/HTTP calls, probe scenarios, raw evidence — and reports verified / broken / blocked without fixing anything; `code-quality-review` runs an unusually strict, structure-first maintainability review over a branch's diff and pushes for restructurings that delete complexity; `get-pr-comments` triages the active PR's review comments into a prioritized action list (read-only); `ui-demo-video` records a Playwright walkthrough of the running app after UI work — per-scene PNG frames the model reads to verify the UI itself, plus a shareable mp4 for the PR; `route-work` grades a task about to be dispatched and returns a model + effort + process-pattern route from its canonical model × effort table; `arch-map` derives a visual architecture map when no source doc exists — subsystem maps, refactor before/afters, proposed designs — with every box traced to real code.

Details in [`plugins/toolkit/README.md`](plugins/toolkit/README.md).

### `agent-workshop` — adopt the full scaffold

One guided skill, `agent-workshop-onboard`, for adopting the **project-coupled** scaffolding into your own repo — the agents that need adapting to your project (profile slots, conventions) and the workflow skills meant to live in-repo, plus the conventions that tie them together. It inspects the target, produces a read-only adoption plan, and only copies files after you approve. The direct-use review agents and self-contained skills don't need this — install `toolkit` for those.

## Going deeper

- [`docs/agents/`](docs/agents/) and [`docs/skills/`](docs/skills/) — the origin story of every agent and skill: what problem it solved and how it's used in practice.
- [`docs/conventions/`](docs/conventions/) — the portable working rules the agents rely on.
- [`docs/adoption/README.md`](docs/adoption/README.md) — the pack catalog, maturity labels, and host support.
