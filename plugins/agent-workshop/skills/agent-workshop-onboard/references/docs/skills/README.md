# Skills

Origin docs for the fifteen skills the scaffold ships (across the `toolkit` and `agent-workshop` plugins). Each doc covers:

- **Origin** — the pressure that created the skill.
- **Problem** — what specifically it solves.
- **Solution shape** — how it works.
- **Real invocation snippet** — example use.
- **Pitfalls** — observed mistakes.
- **Adaptation notes** — fit to your project.

Each skill's canonical `SKILL.md` lives in the plugin that ships it — `plugins/toolkit/skills/<name>/` for the direct-use skills, the onboarding bundle (`plugins/agent-workshop/.../references/skills/<name>.md`) for the adoptable ones. These docs explain the *why*.

## Roster

| Skill | One-line role |
|---|---|
| [`change-log`](change-log.md) | Compact entry rules for `docs/change-log.md`; spec/plan landing lifecycle. |
| [`doc-audit`](doc-audit.md) | Proactive 14-check audit across mechanical, threshold, judgment, and code-arch tiers. Report-only. |
| [`agent-audit`](agent-audit.md) | Orchestrates `vigil` for governance audits. Deterministic pre-checks plus advisory review. |
| [`push`](push.md) | Branch-aware commit and push; pulls before staging; uses `change-log` as message source when relevant. |
| [`research`](research.md) | Forward-looking research orchestration; thin skill, heavy `research` agent. |
| [`visual-advisor`](visual-advisor.md) | Visual taste advisor; mode-aware (refinement / exploration / rebaseline) prompt shaping. |
| [`handoff-review`](handoff-review.md) | Produces a self-contained brief for a separate agent/session to independently verify a branch (task-vs-code, rules, info-leak, correctness) and, in `continue` mode, continue it from a verified foundation; spawns a reviewer or writes a scratch file. |
| [`handoff-pr`](handoff-pr.md) | Produces a structured PR handoff artifact for a separately-authorized session; derives the body from the repo's own PR template when one exists, keeping opener-only fields (validation, review, the `gh` command) out of the public body; never opens the PR. |
| [`handoff-goal`](handoff-goal.md) | Produces a self-contained goal contract directory — `goal.md`, the frozen contract (outcome, baseline, real-surface primary verifier, integrity rules, approval gates, operating rules), plus `plan.md`, the living route the pursuer maintains — for a new session on any runtime (incl. Codex goal mode) to pursue autonomously across compactions; also critiques existing contracts; never pursues the goal itself. |
| [`doc-to-html`](doc-to-html.md) | Renders a markdown report as a standalone dark HTML page; design defaults are adaptable, editing process rules (rewrite-on-direction-change, renumbering, pre-finish checks) are rigid. |
| [`claim-check`](claim-check.md) | Runs an unbiased, evidence-grounded investigation of a premise (ticket / hunch / question) against the current repo; returns a validity verdict with evidence plus a readiness dossier, and never implements the work. |
| [`qa-sweep`](qa-sweep.md) | Runs a team-scale QA pass over a decomposable surface; fans out one agent per slice against the real running artifact, reproduces every verdict-moving finding firsthand before it counts, separates regressions from pre-existing bugs, and returns a verdict-first, confidence-tagged report. Never fixes what it finds. |
| [`empirical-proof`](empirical-proof.md) | Proves a just-finished change at the running software — gates on the app genuinely running, fans probe scenarios out to subagents under a raw-evidence contract (real MCP client connections and real HTTP only), corroborates firsthand, and returns a verdict-first `verified` / `broken` / `blocked`. Never fixes local setup or the bugs it finds. |
| [`code-quality-review`](code-quality-review.md) | Runs an unusually strict, structure-first maintainability review over a branch's diff; hunts for "code judo" reframes that delete complexity, treats file-size explosions, spaghetti-branch growth, boundary leaks, and unearned abstractions as presumptive blockers, and prefers a few high-conviction structural findings over cosmetic nits. |
| [`get-pr-comments`](get-pr-comments.md) | Fetches conversation, review, and inline comments on the active PR via `gh` and returns a severity-grouped, prioritized action list plus the open questions; read-only — never replies to, resolves, or reacts to a comment unless explicitly asked. |

## Composition

Skills here pair naturally with agents:

- `change-log` is preloaded into `wiki-maintainer` and `visual-implementer` via the `skills:` frontmatter.
- `doc-audit` orchestrates `doc-indexer` for its mechanical tier.
- `agent-audit` orchestrates `vigil`.
- `research` (skill) orchestrates `research` (agent).
- `visual-advisor` is the advisor counterpart to `visual-implementer`.
- `push` stands alone — it's a workflow primitive, not a multi-stage orchestration.
- `doc-to-html` stands alone — a rendering and page-maintenance primitive; it pairs with `visual-advisor` only when the page needs art direction beyond its defaults.
- `handoff-review`, `handoff-pr`, and `handoff-goal` are handoff primitives — each emits a self-contained artifact a *different* session consumes; they stand alone, not orchestrating other skills. `handoff-pr` packages a finished branch into a PR; `handoff-goal` hands work forward (a goal to pursue); `handoff-review` hands a branch to a fresh session to verify unbiased and — in `continue` mode — continue from a verified foundation, escalating substantial forward work to `handoff-goal`.
- `claim-check` is an investigation primitive — it runs the search itself, fanning out to subagents rather than orchestrating other skills. It pairs forward with `handoff-goal`: a `confirmed`, ready-to-work verdict feeds its dossier straight into a goal handoff.
- `qa-sweep` is a verification primitive — it runs the sweep itself, fanning a QA team over a decomposable surface and corroborating their findings firsthand rather than orchestrating other skills. It is the team-scale, runtime sibling of `claim-check`'s single-premise investigation; it pairs forward with `handoff-pr` / `handoff-goal` (a ship verdict or a blocker list feeds the next session's work).
- `empirical-proof` is a verification primitive one notch below `qa-sweep`: a single just-finished change instead of a decomposable surface, with the same corroboration DNA. It closes the implementation loop — "done" claims become runtime evidence; a `broken` verdict feeds the operator's fix step, a `blocked` verdict hands the environment gap back rather than fabricating around it. It pairs forward with `handoff-pr` (proof in hand before the PR).
- `code-quality-review` is a strict review primitive — a deep, structure-first maintainability pass the main session runs directly over a diff. It is the maintainability counterpart to `pattern-reviewer` (pattern conformance) and the correctness-focused review path: it owns structural ambition and codebase-health specifically. It pairs forward with `handoff-pr` (a clean structural verdict before a PR) and naturally precedes `qa-sweep`'s runtime pass — design first, behavior second.
- `get-pr-comments` is a read-only PR-feedback triage primitive — it summarizes conversation, review, and inline comments into a prioritized action list and never responds to them unless asked. It stands alone (no orchestration); it pairs forward with the implementation-review and fix loop, and sits naturally alongside the `ci-watcher` agent (comments vs. CI) for working a PR.

## Adoption

Same discipline as agents: copy what you'll use, drop what doesn't earn its keep, sanitize project-specific paths, document the adaptation in your project's docs.
