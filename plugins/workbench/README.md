# workbench

A direct-use plugin from [Workshop](https://github.com/giostriquer/workshop):
five read-only review agents, nine everyday skills, and the seven-skill **workbench**
process layer. No setup: works in any repo. Optional artifact-making utilities
(doc pages, demo videos, architecture maps, skill authoring) live in the sibling
[`toolkit`](../toolkit/README.md) plugin: install it only if you want them.

## Install

**Claude Code**: in a session:

```
/plugin marketplace add giostriquer/workshop
/plugin install workbench@workshop
```

(Terminal equivalent for the first step: `claude plugin marketplace add giostriquer/workshop`.)

**Codex:**

```powershell
codex plugin marketplace add giostriquer/workshop --ref main
codex plugin add workbench@workshop
```

**Cursor**: Team Marketplace (Teams/Enterprise, admin): **Dashboard → Settings →
Plugins → Team Marketplaces → Add Marketplace → Import from Repo**
(`giostriquer/workshop`), then install `workbench` from **Customize**.

**Google Antigravity:** Copy or link this folder into your workspace's `.agents/plugins/workbench/` (that workspace only) or into `~/.gemini/config/plugins/workbench/` (every workspace). Antigravity scans both; there is no registry file to edit. All seventeen skills are discovered and loaded on demand; the review agents are not: Antigravity's plugin format covers skills, rules, MCP servers, and hooks.

After install: agents resolve as `workbench:<agent>`; skills are invoked by name.
Codex exposes all sixteen skills; the agent files ride inertly (Codex custom
agents need repo-local `.codex/agents/` wrappers). Antigravity discovers and progressively loads the skills from `skills/`.

## Agents: read-only reviewers

They inspect and report; none can edit your files (reviewers use
`Read, Grep, Glob, Bash`; `ci-watcher` uses `Bash, Read`).

| Agent | Reviews |
| --- | --- |
| `spec-reviewer` | a design spec or implementation plan, before you build |
| `code-quality-reviewer` | a diff's maintainability and structure; loads the `code-quality-review` rubric |
| `test-quality-reviewer` | test code for trustworthiness and risk coverage |
| `pattern-reviewer` | a diff's conformance to the project's implementation patterns |
| `ci-watcher` | the branch's PR CI: watch and report; `fix-ci`'s background wait-absorber |

## Everyday skills

| Skill | Does |
| --- | --- |
| `file-pr` | files the branch's PR from the repo's own template, then tends it to green-and-mergeable; never merges |
| `fix-ci` | watch-and-fix loop on the branch's CI: diagnose the failing log, minimal fix, push, re-watch; two attempts max |
| `handoff-goal` | emits a goal contract a fresh session pursues autonomously; never pursues it itself |
| `claim-check` | evidence-graded investigation of a ticket / hunch / question: verdict + readiness dossier; never implements |
| `qa-sweep` | fans a QA team over independent slices, corroborates every verdict-moving finding firsthand |
| `empirical-proof` | proves a finished change at the running app: real calls, raw evidence; verified / broken / blocked |
| `code-quality-review` | strict, structure-first maintainability review of a diff |
| `get-pr-comments` | triages the PR's conversation, review, and inline comments into a prioritized action list; read-only |
| `route-work` | reference table for the model fleet: model × effort scores plus the hard routing invariants; a lookup, not a dispatch step |

## Workbench: the process layer

How work starts, gets designed, and gets finished: implementing
[the workbench flow](https://github.com/giostriquer/workshop/blob/main/docs/workbench-flow.md).
Its signature: **three user gates**
(size the workload · pick the route · PR or merge); everything else the session
drives. No hooks, no dispatcher: skill descriptions are the entire activation
surface, and `using-workbench` answers "how does this flow work?" on demand.

| Skill | Does |
| --- | --- |
| `audit` | sizes an investigation with you (quick · deep · sweep), runs the engine, confirms flagged uncertainty, routes the exit |
| `brainstorming` | design dialogue for features and refactors, ending at your route pick: direct / plan / handoff-goal |
| `test-driven-development` | RED-GREEN-REFACTOR, default where a test harness exists; repo conventions take precedence |
| `systematic-debugging` | four-phase root-cause discipline before any fix |
| `verification-before-completion` | the "deemed ready" gate: fresh evidence before any done / fixed / passing claim |
| `receiving-code-review` | verify feedback against the codebase before implementing; reasoned pushback, no performative agreement |
| `using-workbench` | session-start + on-demand orientation map of the flow; orients, never coerces |
| `self-audit` | retrospective on the process that ran the session: trace, classify, propose; reports, never edits a skill |


> **Attribution:** five of the workbench skills (`brainstorming`, `test-driven-development`, `systematic-debugging`, `verification-before-completion`, `receiving-code-review`) are derived from [obra/superpowers](https://github.com/obra/superpowers) by **Jesse Vincent** (MIT): adapted per the [workbench-system decision](https://github.com/giostriquer/workshop/blob/main/docs/decisions/workbench-system.md): descriptions rewritten as honest triggers, pipeline coupling removed, no hooks. A sixth derived skill, `writing-skills`, ships in the `toolkit` plugin. The lineage of every piece, including what was deliberately dropped and why, lives in the [workbench manifest](https://github.com/giostriquer/workshop/blob/main/.claude/skills/workbench-drift/manifest.json).

## Not included

No MCP servers, no hooks, no dispatchers: skills activate on their own
triggers or your invocation, never at session start.
