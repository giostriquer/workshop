# toolkit

A direct-use Claude Code plugin from [Agent Workshop](https://github.com/giostriquer/agent-workshop):
six curated agents (code review, governance, and CI monitoring) plus eleven direct-use skills you can run in any repo with **no setup**.
The agents read your code, specs, tests, and CI and report findings — they never modify your files.
Two skills produce structured handoff artifacts (PR opens and goal documents
for a new session to pursue); `doc-to-html` renders a markdown report as a standalone dark HTML page;
`claim-check` runs an unbiased, evidence-grounded investigation of a premise and returns a verdict plus a readiness dossier;
`qa-sweep` fans a QA team over a broad surface and corroborates every finding firsthand before it counts;
`empirical-proof` proves a just-finished change at the running software — real MCP/HTTP calls, probe scenarios, raw evidence — and reports verified / broken / blocked without fixing anything;
`code-quality-review` runs an unusually strict, structure-first maintainability review over a branch's diff and pushes for restructurings that delete complexity rather than rearrange it;
`get-pr-comments` fetches and triages the active PR's review comments into a prioritized action list (read-only — it never replies unless you ask);
`ui-demo-video` records a Playwright walkthrough of the running app after UI work — per-scene PNG frames the model reads to verify the UI, plus a shareable mp4 for the PR;
`route-work` grades a task about to be dispatched and returns a model + effort + process-pattern route, carrying the canonical model × effort table as its single source of truth;
`arch-map` derives a visual architecture map when no source doc exists — subsystem maps, refactor before/afters, proposed designs — mental-model SVG first, every box and edge traced to real code.

## Install

In a Claude Code session, add this repo as a marketplace, then install the plugin:

```
/plugin marketplace add giostriquer/agent-workshop
/plugin install toolkit@agent-workshop
```

(Terminal equivalent for the first step: `claude plugin marketplace add giostriquer/agent-workshop`.)

For Codex, use the skill-based counterpart:

```powershell
codex plugin marketplace add giostriquer/agent-workshop --ref main
codex plugin add toolkit@agent-workshop
```

Codex plugins do not currently expose standalone custom agents from plugin
manifests. The Codex `toolkit` package exposes `handoff-pr`, `handoff-goal`,
`doc-to-html`, `claim-check`, `qa-sweep`, `empirical-proof`, `code-quality-review`, `get-pr-comments`, `ui-demo-video`, `route-work`, and `arch-map` as skills and bundles the agent files inertly; use the
`agent-workshop` onboarding plugin when you want to copy true `.codex/agents/`
wrappers into a target repo.

For Cursor, import this repo as a **Team Marketplace** (Teams/Enterprise, admin) —
**Dashboard → Settings → Plugins → Team Marketplaces → Add Marketplace → Import from
Repo** (`giostriquer/agent-workshop`) — then install `toolkit` from **Customize** in
the sidebar.

After install, the six agents are available, namespaced `toolkit:<agent>` —
e.g. `toolkit:spec-reviewer`. The eleven skills are available as `handoff-pr`,
`handoff-goal`, `doc-to-html`, `claim-check`, `qa-sweep`, `empirical-proof`, `code-quality-review`, `get-pr-comments`, `ui-demo-video`, `route-work`, and `arch-map` (skills are invoked by name, not namespaced). The same marketplace also
hosts the `agent-workshop` onboarding plugin (`/plugin install agent-workshop@agent-workshop`)
for the full scaffold-adoption flow.

## Agents

| Agent | Inspects |
| --- | --- |
| `spec-reviewer` | a design spec or implementation plan for gaps, before you build |
| `code-quality-reviewer` | a code diff for maintainability and structure — the 1k-line rule, spaghetti growth, code-judo simplification; loads the `code-quality-review` skill's rubric and runs before `pattern-reviewer` |
| `test-quality-reviewer` | a test diff (or existing tests) for trustworthiness and risk coverage |
| `pattern-reviewer` | a code diff for implementation-pattern conformance; with no documented conventions it infers patterns from sibling files and labels findings lower-confidence |
| `vigil` | a repo's agent / skill / workflow layer for governance drift |
| `ci-watcher` | the current branch's PR CI — watches the checks and reports pass/fail with the failing-log excerpt or check link; read-only, background-friendly |

All six are advisory and read-only (no `Edit`/`Write`) — the reviewers use `Read, Grep, Glob, Bash`; `ci-watcher` uses `Bash, Read`.

## Skills

| Skill | Produces |
| --- | --- |
| `handoff-pr` | a structured PR handoff artifact (title, body, ticket links, status) for a separately-authorized session to open — never opens the PR itself |
| `handoff-goal` | a self-contained goal contract directory — `goal.md` (frozen: outcome, baseline, acceptance checks with a real-surface primary verifier, integrity rules, approval gates, operating rules) plus `plan.md` (status-tracked phases the pursuer advances by status flips only — evidence lives in git, never in contract files) — for a new session to pursue autonomously across compactions; activatable directly by Codex goal mode; never pursues the goal itself |
| `doc-to-html` | a standalone dark-themed HTML page rendered from a markdown report / audit / findings doc (TOC, keyboard nav, evidence appendix, print stylesheet), with a rigid editing discipline for later revisions |
| `claim-check` | an unbiased, evidence-grounded investigation of a premise (ticket / hunch / question) against the current repo — a validity verdict with evidence plus a readiness dossier (or exactly what's missing); never implements the work |
| `qa-sweep` | a team-scale QA pass over a decomposable surface — fans one agent per slice against the real running artifact, reproduces every verdict-moving finding firsthand before it counts, separates regressions from pre-existing bugs, and returns a verdict-first, confidence-tagged report; never fixes what it finds |
| `empirical-proof` | a runtime proof of a just-finished change — gates on the app genuinely running (health-checked, right build), fans probe scenarios out to subagents under a raw-evidence contract (real MCP client connections and real HTTP only, never mocks or in-process harnesses), corroborates firsthand, and returns a verdict-first `verified` / `broken` / `blocked` report; never fixes local setup or the bugs it finds |
| `code-quality-review` | an unusually strict, structure-first maintainability review over a branch's diff — hunts for "code judo" reframes that delete complexity, treats file-size explosions, spaghetti-branch growth, boundary leaks, and unearned abstractions as presumptive blockers, and prefers a few high-conviction structural findings over cosmetic nits |
| `get-pr-comments` | a severity-grouped, prioritized action list from the active PR's conversation / review / inline comments, plus the open questions — read-only; never replies to, resolves, or reacts to a comment unless you explicitly ask |
| `ui-demo-video` | a Playwright-driven video walkthrough of the running app after UI work — a PNG frame per scene the model reads to verify the UI itself (fix and re-record until the frames show the expected result), plus a webm/mp4 for the PR description; bundles the recording harness (`scripts/harness.mjs`, copied into the project) |
| `route-work` | a three-line routing recommendation (`route:` / `why:` / `grades:`) for a task about to be dispatched — grades it on repo precedent, ambiguity, failure visibility, taste surface, and blast radius against the canonical model × effort table (kept in the skill as its single source of truth), and names the process pattern (direct dispatch / plan-review checkpoint / judge loop / taste pass); recommends only, never dispatches |
| `arch-map` | a self-contained HTML architecture map derived when no source doc exists — subsystem (mental-model SVG + layers), refactor in flight (before/after or delta, with the invariant stated), or proposed design (dashed) — Cursor-dark high contrast, scarce color, every box and edge traceable to a real file / symbol / diff hunk; ephemeral-first in `tmp/`, with a promote-to-durable pass on request |

## Not included

No MCP servers or hooks. The `agent-workshop-onboard` skill and the
profile-dependent or edit-capable agents (`doc-indexer`, `wiki-maintainer`,
`visual-implementer`, `research`) live in the separate `agent-workshop` plugin,
which adopts the full scaffold into a project.
