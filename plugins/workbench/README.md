# workbench

A direct-use plugin from [Workshop](https://github.com/giostriquer/workshop):
five read-only review agents, the `comment-trimmer`, fourteen everyday skills, and the
eight-skill **workbench** process layer. No setup: works in any repo. Optional artifact-making utilities
(doc pages, demo videos, architecture maps) live in the sibling
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

**Google Antigravity:** Copy or link this folder into your workspace's `.agents/plugins/workbench/` (that workspace only) or into `~/.gemini/config/plugins/workbench/` (every workspace). Antigravity scans both; there is no registry file to edit. All twenty-two skills are discovered and loaded on demand; the review agents are not: Antigravity's plugin format covers skills, rules, MCP servers, and hooks.

**OpenCode:** No marketplace file exists on this surface; opencode loads skills by scanning directories. Point your global config's `"skills": { "paths": [...] }` at this folder's `skills/` directory in a clone of the repo, or copy individual skill folders into `~/.config/opencode/skill/`. The agents are not carried on this surface.

After install: agents resolve as `workbench:<agent>`; skills are invoked by name.
Codex exposes all twenty-two skills but registers no plugin agents, so a Codex
parent reads an agent file from the installed plugin and pastes its body into
the spawn message (`using-workbench`, *Workbench agents on Codex*). Antigravity discovers and progressively loads the skills from `skills/`. OpenCode loads the same twenty-two from its `skills.paths` scan roots.

## Agents: read-only reviewers and the comment-trimmer

The reviewers inspect and report; none can edit your files (reviewers use
`Read, Grep, Glob, Bash`; `ci-watcher` uses `Bash, Read`). `comment-trimmer`
also has `Edit`: it edits the diff's code comments, never code, and never
commits.

| Agent | Works on |
| --- | --- |
| `spec-reviewer` | a design spec or implementation plan, before you build |
| `code-quality-reviewer` | a diff's maintainability and structure; loads the `code-quality-review` rubric |
| `test-quality-reviewer` | test code for trustworthiness and risk coverage; loads the `test-quality-review` rubric; separate Opus (Claude) or Sol (Codex) reviewer |
| `pattern-reviewer` | a diff's conformance to the project's implementation patterns |
| `ci-watcher` | the branch's PR CI: watch and report through one polling loop in long foreground calls; separate Opus (Claude) or Sol (Codex) watcher, never the parent's turns |
| `comment-trimmer` | a finished diff's code comments, trimmed before the review round; loads the `trim-comments` rubric; separate Opus (Claude) or Sol (Codex) agent; returns constraint-comment encoding offers, never applies them |

## Everyday skills

| Skill | Does |
| --- | --- |
| `file-pr` | files the branch's PR from the repo's own template, then tends it to green-and-mergeable; never merges |
| `fix-ci` | watch-and-fix loop on the branch's CI: diagnose the failing log, minimal fix, push, re-watch; two attempts max |
| `handoff-goal` | emits a goal contract a fresh session pursues autonomously; long-running work only, never pursues it itself |
| `claim-check` | evidence-graded investigation of a ticket / hunch / question: verdict + readiness dossier; preserves the result before any separately authorized repair |
| `qa-sweep` | fans a QA team over independent slices, corroborates every verdict-moving finding firsthand |
| `empirical-proof` | proves a finished change at the running app: real calls, raw evidence; verified / broken / blocked |
| `code-quality-review` | strict, structure-first maintainability review of a diff |
| `test-quality-review` | test trustworthiness review: whether tests protect the behavior they claim, backed by a mutation run over the changed code; runs with the adversarial review when logic or tests changed |
| `trim-comments` | the comment trim at completion, before the review round: removes code-comment slop (narration, banners, commented-out code, stale comments, workaround sermons) from the finished diff, keeps comments that carry what the code can't, offers encodings for constraint comments, and reports correctness-hiding suppressions; dispatched to `comment-trimmer` |
| `epic-orchestration` | owns a multi-ticket epic: writes the lane prompts the operator dispatches by hand, validates each report against the repo, authorizes the PR; never implements; user-invoked only |
| `epic-implementation` | uses the shared [lane report template](skills/epic-orchestration/references/lane-report.md) across amendments, recovery and delivery; only for lanes dispatched through epic-orchestration |
| `epic-auditor` | uses the shared [audit report template](skills/epic-orchestration/references/audit-report.md) across audit follow-ups, amendments and recovery; only for auditor lanes dispatched through epic-orchestration |
| `epic-cleanup` | on an explicit cleanup request: lists a repository's stale worktrees, merged or gone branches, caches, temp files and stray processes with evidence and removes only what you pick, or removes an epic's obsolete artifacts and owned worktrees; never removes a dirty, unmerged or in-use worktree on its own judgment |
| `model-reference` | reference table for the model fleet across cost, intelligence, taste, code, and speed, plus the hard routing invariants; a lookup, not a dispatch step |

## Workbench: the process layer

How work starts, gets designed, and gets finished: implementing
[the workbench flow](https://github.com/giostriquer/workshop/blob/main/docs/workbench-flow.md).
The user controls scope, route, and landing. Carry existing choices and authority forward; ask only when a material decision is missing. The session drives the authorized work. No hooks, no dispatcher: skill descriptions are the entire activation
surface, and `using-workbench` answers "how does this flow work?" on demand.

| Skill | Does |
| --- | --- |
| `audit` | uses the requested scope (quick · static review · deep · sweep), runs the engine, reports uncertainty, and asks only for unresolved decisions |
| `brainstorming` | design dialogue for features and refactors, ending at your route pick: direct / plan / handoff-goal |
| `test-driven-development` | RED-GREEN-REFACTOR, default where a test harness exists; repo conventions take precedence |
| `systematic-debugging` | four-phase root-cause discipline for persistent or unclear failures |
| `verification-before-completion` | the "deemed ready" gate: fresh evidence before any done / fixed / passing claim |
| `receiving-code-review` | verify feedback against the codebase before implementing; reasoned pushback, no performative agreement |
| `using-workbench` | on-demand orientation map of the flow; orients, never coerces |
| `self-audit` | retrospective on the process that ran the session, read from its transcript: trace, classify, propose, close with a paste-ready defect note; reports, never edits a skill |


> **Attribution:** five of the workbench skills (`brainstorming`, `test-driven-development`, `systematic-debugging`, `verification-before-completion`, `receiving-code-review`) are derived from [obra/superpowers](https://github.com/obra/superpowers) by **Jesse Vincent** (MIT): adapted per the [workbench-system decision](https://github.com/giostriquer/workshop/blob/main/docs/decisions/workbench-system.md): descriptions rewritten as honest triggers, pipeline coupling removed, no hooks. The lineage of every piece, including what was deliberately dropped and why, lives in the [workbench manifest](https://github.com/giostriquer/workshop/blob/main/.claude/skills/workbench-drift/manifest.json).

> **Attribution:** `code-quality-review` and the `code-quality-reviewer` and `ci-watcher` agents are derived from Cursor's [cursor/plugins](https://github.com/cursor/plugins) (the `thermos` and `cursor-team-kit` plugins, MIT, Copyright (c) 2026 Cursor): adapted per the [code-quality-review](https://github.com/giostriquer/workshop/blob/main/docs/decisions/code-quality-review.md) and [fix-ci](https://github.com/giostriquer/workshop/blob/main/docs/decisions/fix-ci.md) decisions.

> **Attribution:** `trim-comments` is derived from OpenClaw's [openclaw/openclaw](https://github.com/openclaw/openclaw) `.agents/skills/deslop` (MIT, Copyright (c) 2026 OpenClaw Foundation), with its comment keep-list and its constraint-comment and suppression rules adapted from the `pstack` plugin's `no-comments` skill and `comment-sicko` agent in Cursor's [cursor/plugins](https://github.com/cursor/plugins) (MIT, Copyright (c) 2026 Lauren Tan): adapted per the [trim-comments decision](https://github.com/giostriquer/workshop/blob/main/docs/decisions/trim-comments.md): narrowed to code comments, dispatched as a workbench delivery stage before the review round, diff scope made host- and stack-neutral.

## Not included

No MCP servers, no hooks, no dispatchers: skills activate on their own
triggers or your invocation, never at session start.
