# Attic

Skills (and, if it ever comes to that, agents) that live in the repo but ship in
**no plugin** and run on **no host**: in-progress drafts that have not yet earned
inclusion, and deprecated pieces retired from the shipped set. The attic keeps
them visible and versioned instead of deleted or stranded in a machine-local
config.

Rules:

- Nothing here is discovered by Claude Code, Codex, or Cursor — the folder is
  inert by location. Plugin manifests and `scripts/validate-native-plugin.ps1`
  must never reference it.
- Attic pieces are exempt from the docs symmetry (`docs/skills/<name>.md`) until
  promoted. A **deprecated** piece keeps its origin doc at
  `docs/skills/deprecated/<name>.md`; an **in-progress** piece may have no origin
  doc yet.
- Promote by moving the spec into the plugin that will ship it and following
  `CLAUDE.md` § "When adding a new agent or skill". Deprecate into here by
  following § "When removing or deprecating".

## Contents

| Piece | Status | Since | Notes |
| --- | --- | --- | --- |
| `skills/handoff-review` | deprecated | 2026-08-10 | Retired from the `toolkit` plugin (last shipped in 0.16.5). Origin doc: [`docs/skills/deprecated/handoff-review.md`](../docs/skills/deprecated/handoff-review.md). |
| `skills/orchestrate` | in-progress | 2026-08-10 | Pulled from the global `~/.claude/skills/` scope for rework; never shipped in a plugin. Pairs with `skills/codex-implement` below. Carries `model-selection.md` alongside its SKILL.md — the former always-injected `~/.claude/rules/model-selection.md`, parked here with the skill whose doctrine it points at (the routing invariants also live in the shipped `route-work` skill). |
| `skills/codex-implement` | in-progress | 2026-08-10 | Pulled from the global `~/.claude/skills/` scope for rework (SKILL.md + `codex-task.sh` wrapper); never shipped in a plugin. Dispatch mechanics for Codex CLI as executor — the counterpart `skills/orchestrate` discovers it. |
