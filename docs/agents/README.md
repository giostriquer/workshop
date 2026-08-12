# Agents

Origin docs for the agents this repo keeps live — the five shipped in the
`workbench` plugin plus the repo-local `wiki-maintainer`. Each doc covers origin
pressure, problem, solution shape, a real workflow snippet, observed pitfalls,
and adaptation notes.

Canonical specs: `plugins/workbench/agents/<name>.md` for shipped agents;
`.claude/agents/` for the repo's own working set.

## Roster

| Agent | Where | One-line role |
|---|---|---|
| [`spec-reviewer`](spec-reviewer.md) | workbench | Pre-implementation gate for design specs and implementation plans. |
| [`code-quality-reviewer`](code-quality-reviewer.md) | workbench | Strict, structure-first code-quality audit over a diff; loads the `code-quality-review` skill's rubric. |
| [`pattern-reviewer`](pattern-reviewer.md) | workbench | Diff-driven implementation-pattern compliance check after code-quality review. |
| [`test-quality-reviewer`](test-quality-reviewer.md) | workbench | Test-code trustworthiness, risk coverage, and test-strategy review; the workbench flow's test-quality stage. |
| [`ci-watcher`](ci-watcher.md) | workbench | Watches the current branch's PR CI and reports; read-only, `fix-ci`'s background wait-absorber. |
| [`wiki-maintainer`](wiki-maintainer.md) | repo-local | Repo documentation owner; diff-driven by default, audit-mode on request. |

Parked 2026-08-11 (docs under [`deprecated/`](deprecated/), specs in
`attic/agents/`): [`doc-indexer`](deprecated/doc-indexer.md),
[`research`](deprecated/research.md),
[`visual-implementer`](deprecated/visual-implementer.md), and
[`vigil`](deprecated/vigil.md) (retired from the process plugin and the repo working set
by operator call).

## Roles that compose

- **Pre-implementation review:** `spec-reviewer` (specs and plans, before code).
- **Implementation review:** `code-quality-reviewer` (maintainability and structure), then `pattern-reviewer` (pattern conformance), then `test-quality-reviewer` (test trustworthiness).
- **CI:** `ci-watcher` watches; the `fix-ci` skill fixes.
- **Documentation:** `wiki-maintainer` owns this repo's docs.

## Adoption

Read the doc for each agent before adopting. If a problem doesn't exist in your
project, the agent is probably not earning its keep — leave it out. Copy what
you'll actually use, sanitize project-specific paths, document the adaptation in
your project's `CLAUDE.md` / `AGENTS.md`.
