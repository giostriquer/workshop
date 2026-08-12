# Attic

Skills and agents that live in the repo but ship in **no plugin** and run on
**no host**. The folder is inert by location: nothing here is discovered by
Claude Code, Codex, or Cursor, and plugin manifests and
`scripts/validate-native-plugin.ps1` must never reference it.

Two tiers, one rule each:

- **`skills/` and `agents/`** — pieces that are **in-progress or need fixing**:
  drafts and pulled-for-rework specs the operator intends to ship once they're
  right. Promote by moving the spec into the plugin that will ship it and
  following `CLAUDE.md` § "When adding a new agent or skill".
- **`deprecated/`** — pieces with **no current function, kept as history**:
  retired skills and agents preserved so the record survives. Each retired
  piece gets one folder — `deprecated/skills/<name>/` or
  `deprecated/agents/<name>/` — holding its spec (`SKILL.md` / `<name>.md`,
  plus any support files) and its parked origin doc (`origin.md`). A retired
  skill whose spec evolved into a live skill keeps only `origin.md`.

Live agents and skills carry no doc layer (rationale lives in
`docs/decisions/`); the `origin.md` files here are the parked historical
origin docs of retired pieces, kept with their specs.

## Contents

### In progress

| Piece | Since | Notes |
| --- | --- | --- |
| `skills/orchestrate` | 2026-08-10 | Pulled from the global `~/.claude/skills/` scope for rework; never shipped in a plugin. Pairs with `skills/codex-implement` below. Carries `model-selection.md` alongside its SKILL.md — the former always-injected `~/.claude/rules/model-selection.md`, parked here with the skill whose doctrine it points at (the routing invariants also live in the shipped `route-work` skill). |
| `skills/codex-implement` | 2026-08-10 | Pulled from the global `~/.claude/skills/` scope for rework (SKILL.md + `codex-task.sh` wrapper); never shipped in a plugin. Dispatch mechanics for Codex CLI as executor — the counterpart `skills/orchestrate` discovers it. |

### Deprecated (history)

| Piece | Since | Notes |
| --- | --- | --- |
| `deprecated/skills/agent-audit` | 2026-08-11 | Onboarding plugin deleted; spec + origin doc preserved. Orchestrated `vigil` for governance audits. |
| `deprecated/skills/doc-audit` | 2026-08-11 | Onboarding plugin deleted; spec + origin doc preserved. 14-check documentation audit. |
| `deprecated/skills/handoff-pr` | 2026-08-11 | Evolved into the shipped `file-pr` skill; origin doc only — the pre-evolution spec lives in git history (`plugins/toolkit/skills/handoff-pr/`, pre-2026-08-11). |
| `deprecated/skills/handoff-review` | 2026-08-10 | Retired from the `toolkit` plugin (last shipped in 0.16.5); spec + origin doc preserved. |
| `deprecated/skills/research` | 2026-08-11 | Onboarding plugin deleted; spec + origin doc preserved. Thin orchestrator for the `research` agent (also parked below). |
| `deprecated/skills/structure-view` | 2026-08-05 | Renamed to the shipped `arch-map` skill; origin doc only — the design-first birth and Round 1 field notes under the old name. |
| `deprecated/skills/visual-advisor` | 2026-08-11 | Onboarding plugin deleted; spec + origin doc preserved. Visual taste advisor, counterpart to `visual-implementer` (also parked below). |
| `deprecated/agents/doc-indexer` | 2026-08-11 | Onboarding plugin deleted; spec + origin doc preserved. Docs routing/audit helper for `wiki-maintainer`. |
| `deprecated/agents/research` | 2026-08-11 | Onboarding plugin deleted; spec + origin doc preserved. Forward-looking research notes with structured scoring. |
| `deprecated/agents/vigil` | 2026-08-11 | Retired from the process plugin (now `workbench`) and the repo working set (operator call); spec + origin doc preserved. |
| `deprecated/agents/visual-implementer` | 2026-08-11 | Onboarding plugin deleted; spec + origin doc preserved. Execution agent for approved visual assets. |

### Passed through

| Piece | Notes |
| --- | --- |
| `skills/workbench-drift` | Drafted here 2026-08-11, then promoted same-day to the repo working set (`.claude/skills/workbench-drift/` — repo-only fork tooling) after its initial-pin and drift-mode runs both came back clean. See [`docs/decisions/workbench-system.md`](../docs/decisions/workbench-system.md). |
