---
name: agent-audit
description: Run an advisory agent-governance audit or vigil consulting pass. Use when asked to audit project agents, review agent/skill/wrapper drift, check cross-host wrapper parity, review a proposed agent change, or decide whether a recurring workflow needs an agent, skill, or rule update.
---

# Agent Audit

## Purpose

Run focused governance audits over the project's agent, skill, wrapper, and workflow-instruction layer.

This skill orchestrates source selection and `vigil` dispatch. `vigil` performs the judgment. The skill does not make `vigil` a hard gate and does not run during every agent invocation.

## Scope

Operate inside the current repository.

Read:

- `.claude/agents/`
- `.codex/agents/` (if Codex is supported)
- `.gemini/agents/` (if Gemini is supported)
- `.opencode/agents/` (if OpenCode is supported)
- `.claude/skills/`
- `.codex/skills/` (if applicable)
- `.gemini/skills/` (if applicable)
- `AGENTS.md`
- `CLAUDE.md`
- `docs/agents/` (if it exists)
- workflow ADRs, change-log entries, and conventions when relevant

Do not edit files outside the project repo. If a host or pre-check finds a user/global or upstream `vigil` declaration competing with the repo-local wrapper, report it but do not change it.

## Invocation forms

- `/agent-audit` — full project agent / skill governance sweep
- `/agent-audit target PATH` — review one agent, skill, wrapper, or workflow doc
- `/agent-audit consult SUMMARY_OR_PATH` — review a proposed agent or skill change before implementation
- `/agent-audit wrappers` — check canonical-agent to wrapper parity
- `/agent-audit skills` — check Claude/Codex/Gemini repo-local skill parity and stale workflow instructions
- `/agent-audit record` — run the full audit and write an accepted audit-log entry

Plain-language triggers include:

- audit project agents
- review this agent change with vigil
- check agent drift
- check wrapper parity
- check skill mirror drift
- does this workflow need an agent or skill?

## Modes

- `full` — audit the whole agent and skill surface
- `target` — audit one agent, skill, wrapper, or workflow doc
- `consult` — review a proposed change before implementation
- `wrappers` — canonical-to-wrapper parity check
- `skills` — Claude/Codex/Gemini skill parity check
- `record` — full audit plus a written audit-log entry

If no mode is provided, infer the narrowest useful mode and state it.

## Deterministic pre-checks

Run the checks that match the mode before invoking `vigil`:

```powershell
Get-ChildItem -Name .claude/agents
Get-ChildItem -Name .codex/agents
Get-ChildItem -Name .gemini/agents
Get-ChildItem -Name .opencode/agents
Get-ChildItem -Name .claude/skills
Get-ChildItem -Name .codex/skills
Get-ChildItem -Name .gemini/skills
rg -n "<previously-used-but-removed-agent-name>|<deprecated-skill-pattern>" AGENTS.md CLAUDE.md docs/agents .claude .codex .gemini .opencode
```

Adapt the regex line to scan for stale-reference patterns specific to your project (renamed agents, retired skills, deprecated dispatch shapes).

For wrapper mode, compare agent basenames across host folders and note missing wrappers before dispatch.

For skills mode, run a deterministic mechanical drift report (typically `scripts/skill-parity.ps1`) that classifies each skill as `IDENTICAL`, `ALLOWED_DRIFT` (against the project's allow-list of intentional divergences), or `UNEXPECTED_DRIFT`. Pass the report into `vigil`'s brief — `vigil` judges whether each `ALLOWED_DRIFT` reason still holds and whether `UNEXPECTED_DRIFT` entries are stale mirrors or newly intentional divergences.

## Dispatch flow

1. Build a brief with:
   - mode
   - target path or scope
   - deterministic pre-check summary
   - relevant source paths
   - whether an audit-log entry is requested
2. Confirm `vigil` resolves to the repo-local declaration. If it resolves to a user/global or upstream declaration outside this repo, do not dispatch; read `.claude/agents/vigil.md` and run the review in the main session.
3. Dispatch the local `vigil` agent with the brief, naming the session when possible so same-audit re-review can continue it.
4. For re-review of the same target / scope / mode, continue the same `vigil` session when the host supports it.
5. If dispatch is unavailable, read `.claude/agents/vigil.md` and run the review in the main session. Label the output `orchestrator-run fallback`.

## Output

Return one report:

```markdown
# Agent Audit Report — YYYY-MM-DD

Mode: full | target | consult | wrappers | skills | record
Scope reviewed: ...

## Deterministic pre-checks

- Wrapper parity:
- Skill parity:
- Stale-reference scan:

## Vigil findings

[Vigil output]

## Recommended next actions

- Apply now:
- Ask user:
- Defer:

## Audit-log entry

[Ready-to-apply entry, or "Not requested."]
```

In `record` mode, write the accepted audit-log entry to `docs/agents/agent-audit-log.md` (create the file if it does not exist). In all other modes, present the entry block and wait for confirmation before writing.

## Boundaries

- Do not patch agent or skill files during the audit.
- Do not edit global declarations outside the repo.
- Do not commit or push.
- Do not replace `wiki-maintainer`, `doc-indexer`, `pattern-reviewer`, `spec-reviewer`, or `research`.
- Do not manufacture findings for a clean pass.
