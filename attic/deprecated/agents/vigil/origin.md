# vigil

> **Parked 2026-08-11**: retired from the `toolkit` plugin and the repo working set (operator call); the spec sits alongside this doc in this folder.

## Origin

The originating project's agent layer grew across multiple hosts (Claude, Codex, Gemini, OpenCode), with mirrored skills, cross-host agent wrappers, and project-specific workflow rules. After several "the Codex wrapper says one thing while the Claude canonical says another" incidents (and one case where a workflow-rule edit landed in `AGENTS.md` but not `CLAUDE.md`, causing a Claude session to skip a mandatory review gate) it became clear the agent / skill / workflow-instruction layer itself needed governance review.

`vigil` was introduced as an **advisory** governance reviewer. It is not a hard gate and does not run on every agent edit, but remains available when something material changes in the role / dispatch / wrapper / workflow surface.

## Problem

The agent layer fails in different ways than code or docs:

- **Cross-host wrapper drift.** Canonical `.claude/agents/X.md` updates without the matching `.codex/agents/X.toml` / `.gemini/agents/X.md` updates.
- **Skill mirror drift.** `.claude/skills/X/SKILL.md` evolves while the mirrors `.codex/skills/X/SKILL.md` and `.gemini/skills/X/SKILL.md` stay frozen at an older version.
- **Workflow contradictions.** A rule lands in `AGENTS.md` that contradicts an existing rule in `CLAUDE.md`, or a deprecated agent is referenced in newer docs.
- **Unparalleled workflow-rule edits.** A workflow rule that fires during a session is edited in one host file but not the others. Each host loads only the file it auto-loads; the other host keeps the old behavior.

Standard code review and doc review don't catch these. `vigil` is the dedicated reviewer for the layer.

## Solution shape

Six modes:

- `full`: audit the whole agent and skill surface.
- `target`: audit one named file or role.
- `consult`: review a proposed change before implementation.
- `wrappers`: canonical-spec to wrapper parity.
- `skills`: skill parity across hosts (consumes a deterministic mechanical drift report).
- `record`: full audit plus a written audit-log entry.

**Advisory only.** Reports findings and suggested changes. Does not patch agent files, skill files, workflow docs, audit logs, or global declarations. Implementation belongs to the main session or an assigned worker.

**External declaration safety.** If a host or pre-check finds a user/global or upstream `vigil` declaration competing with the repo-local wrapper, it reports but does not change. The agent never edits files outside the project repo.

**Severity scale:** High / Medium / Low, with structured findings-first output.

## Real workflow snippet

Example `CLAUDE.md` block on agent governance audit support:

```markdown
## Agent governance audit support

For advisory reviews of the project's agent, skill, wrapper, or workflow-instruction layer, use the `agent-audit` skill or dispatch `vigil` directly when the target is already clear.

Recommend `vigil` when a change materially affects:

- agent role boundaries or ownership
- escalation behavior
- source-priority rules
- output expectations
- cross-host wrappers
- repo-local skill mirroring
- introduction, removal, or renaming of recurring workflow roles

Vigil is advisory. It is not a hard gate for routine edits and does not run inside every agent invocation.
```

Example dispatch shape:

> Dispatch `vigil` in `consult` mode. I'm proposing to merge `doc-indexer` and `wiki-maintainer` into one agent. Brief: see `docs/decisions/draft-merge-doc-roles.md`. Review whether this preserves the role boundaries currently relied on by the SDD review loop.

## Pitfalls observed

- **Treating `vigil` as a hard gate.** It is advisory. Routine agent / skill edits do not need a Vigil review. Use it for material changes: role boundaries, dispatch behavior, workflow rules.
- **Running it during normal feature work.** The agent layer doesn't change during normal feature work; running `vigil` then is wasted dispatch cost.
- **Patching during the audit.** `vigil` is not allowed to edit files. The main session or an assigned worker patches based on the report.
- **Cross-task SendMessage-resume.** Each new audit target / scope / mode is a fresh dispatch. Continuation applies only to revision rounds on the same audit.
- **External declaration competing.** A user / global Vigil declaration on the operator's machine sometimes resolves before the repo-local wrapper. The audit reports this but cannot fix it. The operator handles the resolution path.

## Adaptation notes

- The "Current agent system" section in the canonical spec is an instruction to Vigil to **reason from the active local set unless current files prove otherwise**. Keep that framing: Vigil should not invent agents from generic guidance.
- Skill parity mode depends on a deterministic mechanical drift report (the originating project uses `scripts/skill-parity.ps1`). If your project has multi-host skills, set up a similar parity script. If you only target one host, drop the mode.
- The "Required source model" reading order is unusually load-bearing. Vigil reads target → AGENTS.md → CLAUDE.md → docs/agents/ → canonical specs → wrappers: in that order. Reordering produces shallower findings.
- The audit-log writing pattern (`record` mode writes to `docs/agents/agent-audit-log.md`) is a project convention. If your project doesn't have such a log, the audit-log entry in the report can simply be returned without writing: the operator handles persistence.
