# doc-indexer

> **Parked 2026-08-11** — the onboarding `agent-workshop` plugin was deleted; the spec is preserved at `attic/agents/`. See `docs/decisions/drop-onboarding-plugin.md`.

## Origin

`wiki-maintainer` was the originating project's first local agent and was doing two distinct jobs: (1) maintaining source-of-truth docs, and (2) answering routing / retrieval questions. The retrieval job didn't need edit tools, didn't need the heavy maintainer context, and was happening often enough that loading `wiki-maintainer` for it was wasteful.

`doc-indexer` was extracted to handle retrieval, routing, and lightweight audit work — explicitly without edit tools. The naming is deliberate: it's the local repo-specific implementation of the broader `wiki-indexer` concept.

## Problem

Documentation systems with any depth produce two failure modes:

1. **Over-loading the maintainer.** Routing questions ("where does X live?") and quick audits ("are there orphaned docs?") burn context on the maintainer agent without producing edits. Pulling in a heavy maintainer for a 30-second routing question is wasteful.
2. **Routing drift after reorganizations.** Section READMEs claim pages that don't exist; routing pages link to renamed files; orphaned docs accumulate. These are mechanical checks that don't need the maintainer's full context.

`doc-indexer` solves both: it's a lightweight retrieval / audit agent that flags drift but doesn't fix it. Fixes route back to `wiki-maintainer`.

## Solution shape

Two workflows:

- **Retrieval.** "Which docs matter for X?" / "Where is the source of truth for Y?" — read the minimum relevant docs, answer concisely, flag any obvious drift signals along the way.
- **Audit.** Routing integrity, portability checks, vault-hygiene checks. Reports findings and recommends `wiki-maintainer` follow-up. Does not edit.

The agent **lacks edit tools at the frontmatter level** — the boundary is enforced at the tool layer, not just by policy. If a caller asks for a fix, the agent recommends `wiki-maintainer` dispatch in its report.

**Reference-only surfaces** are tracked: research notes, idea seeds, plans, specs as historical reference. The agent does not surface these as primary routing answers for current-state questions; those go to architecture, systems, decisions, scope, or project-brief docs.

## Real workflow snippet

Example `CLAUDE.md` block on documentation routing support:

```markdown
## Documentation routing support

`doc-indexer` purpose, dispatch rules, and the read-direct-vs-dispatch decision live in `docs/conventions/docs/doc-routing.md`. Read that file when a routing question comes up.

Use `doc-indexer` when:
- a user asks which docs matter for a topic
- a model needs fast re-grounding on a local subject
- a larger docs pass needs a routing or vault-hygiene audit

Read directly (skip dispatch) for:
- specific content questions (formulas, config values, decision rationale) — direct reading is the correct path
- normal diff-driven documentation updates — those belong to `wiki-maintainer`
- doc edits — `doc-indexer` lacks edit tools by design
```

Example dispatch shape:

> Dispatch `doc-indexer`. Tell me which docs are relevant for understanding the auth middleware before I write the spec.

Or, for an audit:

> Dispatch `doc-indexer` for a routing / portability audit. Recent doc reorganization may have orphaned pages or broken cross-links.

## Pitfalls observed

- **Dispatching for content questions.** "What's the formula for X?" — the answer comes from reading the formula doc directly, not from a routing agent that summarizes it. Routing introduces summary fidelity risk; direct reading is the right path.
- **Expecting it to fix things.** It surfaces drift but cannot patch. The orchestrator (the model that dispatched it) must dispatch `wiki-maintainer` based on the recommendations.
- **Subagents trying to spawn `wiki-maintainer`.** Subagents can't spawn other subagents. The orchestrator is the actor.
- **Using it as a second `wiki-maintainer`.** Edit tools are intentionally absent. Don't try to work around the boundary.
- **Audit-mode invocations for narrow questions.** Audit mode is heavier; use it only for explicit routing / portability / vault-hygiene audits.

## Adaptation notes

- The reference-only surfaces list is project-specific. Sanitize the canonical spec to match your project's directories: research, idea-seeds, plans, specs, future-ideas trackers, etc.
- The Obsidian-specific checks (frontmatter tags table, wiki-link compliance, code-architecture note format) reflect the originating project's Obsidian-vault dual-purpose. Drop these if your project doesn't use Obsidian.
- The "Recommended orchestrator action" line in audit-mode output is unusually load-bearing. Without it, the orchestrator often forgets that it has to dispatch `wiki-maintainer` itself — the audit findings just sit unaddressed. Adopt the convention.
- This agent runs on `model: sonnet` because most of its work is mechanical retrieval and auditing — Opus reasoning isn't needed. Keep that frontmatter unless your project's audit needs heavier judgment.
