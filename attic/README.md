# Attic

Skills and agents that live in the repo but ship in **no plugin** and run on
**no host**: in-progress drafts that have not yet earned inclusion, deprecated
pieces retired from the shipped set, and the former onboarding set parked when
the `agent-workshop` plugin was deleted (2026-08-11). The attic keeps them
visible and versioned instead of deleted or stranded in a machine-local config.

Rules:

- Nothing here is discovered by Claude Code, Codex, or Cursor — the folder is
  inert by location. Plugin manifests and `scripts/validate-native-plugin.ps1`
  must never reference it.
- Attic pieces are exempt from the docs symmetry (`docs/agents/<name>.md`)
  until promoted. A **deprecated agent** keeps its origin doc at
  `docs/agents/deprecated/<name>.md`; live skills carry no doc layer — a
  retired skill's record is its `docs/decisions/` note, and the former
  origin docs of already-retired skills are parked under `attic/docs/skills/`.
- Promote by moving the spec into the plugin that will ship it and following
  `CLAUDE.md` § "When adding a new agent or skill". Deprecate into here by
  following § "When removing or deprecating".

## Contents

| Piece | Status | Since | Notes |
| --- | --- | --- | --- |
| `skills/handoff-review` | deprecated | 2026-08-10 | Retired from the `toolkit` plugin (last shipped in 0.16.5). Origin doc: [`docs/skills/handoff-review.md`](docs/skills/handoff-review.md) (parked here). |
| `skills/orchestrate` | in-progress | 2026-08-10 | Pulled from the global `~/.claude/skills/` scope for rework; never shipped in a plugin. Pairs with `skills/codex-implement` below. Carries `model-selection.md` alongside its SKILL.md — the former always-injected `~/.claude/rules/model-selection.md`, parked here with the skill whose doctrine it points at (the routing invariants also live in the shipped `route-work` skill). |
| `skills/codex-implement` | in-progress | 2026-08-10 | Pulled from the global `~/.claude/skills/` scope for rework (SKILL.md + `codex-task.sh` wrapper); never shipped in a plugin. Dispatch mechanics for Codex CLI as executor — the counterpart `skills/orchestrate` discovers it. |
| `skills/workbench-drift` | promoted | 2026-08-11 | Drafted here same-day, then promoted to the repo working set (`.claude/skills/workbench-drift/` — repo-only fork tooling) after its initial-pin and drift-mode runs both came back clean. See [`docs/decisions/workbench-system.md`](../docs/decisions/workbench-system.md). |
| `skills/agent-audit` | parked | 2026-08-11 | Onboarding plugin deleted; spec preserved. Orchestrated `vigil` for governance audits. |
| `skills/doc-audit` | parked | 2026-08-11 | Onboarding plugin deleted; spec preserved. 14-check documentation audit. |
| `skills/research` | parked | 2026-08-11 | Onboarding plugin deleted; spec preserved. Thin orchestrator for the `research` agent (also parked). |
| `skills/visual-advisor` | parked | 2026-08-11 | Onboarding plugin deleted; spec preserved. Visual taste advisor, counterpart to `visual-implementer` (also parked). |
| `agents/doc-indexer` | parked | 2026-08-11 | Onboarding plugin deleted; spec preserved. Docs routing/audit helper for `wiki-maintainer`. |
| `agents/research` | parked | 2026-08-11 | Onboarding plugin deleted; spec preserved. Forward-looking research notes with structured scoring. |
| `agents/visual-implementer` | parked | 2026-08-11 | Onboarding plugin deleted; spec preserved. Execution agent for approved visual assets. |
| `agents/vigil` | parked | 2026-08-11 | Retired from the process plugin (now `workbench`) and the repo working set (operator call); governance-review spec preserved. |
| `docs/skills/*` | parked | 2026-08-12 | The former origin docs of retired skills (agent-audit, doc-audit, handoff-pr, handoff-review, research, structure-view, visual-advisor) — parked when the live `docs/skills/` layer was removed. |
