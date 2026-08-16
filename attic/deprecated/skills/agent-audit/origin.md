# agent-audit

> **Parked 2026-08-11**: the onboarding `agent-workshop` plugin was deleted; the spec sits alongside this doc in [`SKILL.md`](SKILL.md). See `docs/decisions/drop-onboarding-plugin.md`.

## Origin

The originating project's agent / skill / wrapper / workflow-instruction layer became complex enough that ad hoc "let me check whether this looks right" reviews stopped scaling. Multiple hosts (Claude / Codex / Gemini / OpenCode) with mirrored skills and cross-host wrappers, plus workflow rules that fire during sessions, plus a project-local `vigil` agent for governance review.

`agent-audit` was introduced as the **skill-side orchestrator** that routes governance audits through `vigil` consistently: running the right deterministic pre-checks for the mode, building a brief, dispatching `vigil`, and presenting the consolidated report.

## Problem

Governance audits over the agent layer have specific requirements:

- **Deterministic pre-checks before judgment.** Listing agent / skill folders, scanning for stale references, and computing skill-mirror parity are mechanical and should not burn `vigil`'s judgment cycles.
- **Consistent brief shape.** `vigil` is more accurate when given a structured brief than when invoked freeform. Skill formalizes the brief.
- **Mode discipline.** Full / target / consult / wrappers / skills / record have different evidence requirements. The skill encodes the requirements.

Without the skill, every governance audit re-invented the same pre-check sequence.

## Solution shape

Six modes:

- `full`: whole agent / skill surface
- `target`: one named file or role
- `consult`: review a proposed change before implementation
- `wrappers`: canonical-spec-to-wrapper parity
- `skills`: skill mirror parity (consumes a deterministic mechanical drift report)
- `record`: full audit plus a written audit-log entry

**Deterministic pre-checks** run before `vigil` dispatch: `Get-ChildItem` over agent / skill folders, regex scans for stale references, skill-parity script execution. The pre-check summary becomes part of `vigil`'s brief.

**External-declaration safety.** If the host or pre-check finds a user/global or upstream `vigil` declaration competing with the repo-local wrapper, the skill reports but does not change. The skill never edits files outside the repo.

**Record mode** is the only mode that writes to `docs/agents/agent-audit-log.md`. All other modes present the audit-log entry block and wait for user confirmation.

## Real invocation snippet

Example `CLAUDE.md` block on agent governance audits:

```markdown
For advisory reviews of the project's agent, skill, wrapper, or workflow-instruction layer, use the `agent-audit` skill or dispatch `vigil` directly when the target is already clear.

When dispatching directly, use the repo-local Vigil wrapper; if a host resolves `vigil` to a user/global or upstream declaration outside this repo, stop and report the resolved path.
```

Example invocations:

> /agent-audit consult `docs/decisions/draft-merge-doc-roles.md`

> /agent-audit wrappers

> /agent-audit skills

## Pitfalls observed

- **Treating `agent-audit` as a hard gate.** It is advisory. Routine agent / skill edits don't need an audit. Reserve for material changes.
- **Skipping pre-checks for `consult` mode.** Even consult-mode dispatches benefit from a pre-check sweep because it catches obvious issues before `vigil` reads.
- **Auto-applying audit findings.** The skill is report-only; the user / orchestrator decides what to act on.
- **Cross-task SendMessage-resume on `vigil`.** Each new audit target / scope / mode is a fresh `vigil` dispatch.
- **External `vigil` resolving instead of repo-local.** Observable when a host's `vigil` invocation lands on a user/global wrapper. The skill detects this and runs in fallback mode (orchestrator runs `vigil`'s spec inline): the skill does not silently use the wrong `vigil`.

## Adaptation notes

- The pre-check command set is **project-specific**. Adapt the `rg` regex line to scan for stale references that exist in your project (renamed agents, retired skills, deprecated dispatch shapes).
- **Skill parity mode** depends on a deterministic mechanical drift script (typically `scripts/skill-parity.ps1`). Set up a similar script for your project; without it, skill-parity mode produces softer findings.
- The audit-log file at `docs/agents/agent-audit-log.md` is a project convention. If your project doesn't track an audit log, the audit-log entry from `record` mode can simply be returned without writing: the operator handles persistence.
- The `.opencode` host is wrapper-only by convention in the originating project; it has no skills/ folder. If your project mirrors skills to OpenCode too, adapt.
- The skill assumes `vigil` is dispatched via the project's local agent infrastructure. If you only have one host, the skill is still useful; it just runs the inline fallback path (orchestrator runs `vigil`'s spec).
