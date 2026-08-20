# AGENTS.md - Workshop

Workflow rules while maintaining the `workshop`.

## Re-grounding order

When a session starts in this repo:

1. `README.md`: what this repo is and is not.
2. The canonical spec (`plugins/workbench/…` or `plugins/toolkit/…` for shipped pieces, `.claude/` for the repo's own working set) if the question is about a specific agent or skill. The spec is the whole artifact; rationale lives in `docs/decisions/`.

Do not load the full docs tree. Do not load all agent specs unless doing a cross-cutting audit.

## Standard maintenance workflow

Always use the `writing-skills` when doing or considering doing any changes to any skills in the repository.

1. **Identify the change.** Mechanical (typo, link, formatting), substantive (new agent/skill, behavior change, convention shift), or structural (layout reorganization).
2. **Mechanical changes** apply directly. No spec, no review, no change-log.
3. **Substantive changes** get a short note in `docs/decisions/<name>.md` describing what's changing and why, then apply.
4. **Structural changes** require updating `README.md` and any cross-references. Pause and ask the user before applying: structural changes affect every adopter.

## No rationale doc layer

Agents and skills are self-contained: the spec (agent `.md` / SKILL.md) is the whole artifact, and rationale lives in `docs/decisions/`.

The one per-skill layer is `docs/skills/`, which contains **usage** pages for shipped skills. Each page explains what the skill does, when to reach for it, common questions, and how to tell it worked. Reader-facing only. Do not let a page drift into rationale, origin story, or release history; that is the layer that was deleted before. Update a skill's page in the same change that alters its behavior, and when page and spec disagree, the spec wins. Agents get no doc layer (no `docs/agents/`).

## Cross-host parity

Canonical definitions live in the shipped plugins (`workbench` for the process core, `toolkit` for optional utilities). This repo's own host dirs (`.claude/`, `.codex/`, `.opencode/`) carry only the small set the repo runs (`change-log`, `push`, `workbench-drift`, `wiki-maintainer`); `.claude/` is canonical for those. Parked pieces live in `attic/` (see `attic/README.md`): in the repo, shipped by no plugin, discovered by no host. Two tiers: `attic/skills/` and `attic/agents/` for in-progress pieces still intended to ship; `attic/deprecated/` for retired pieces kept as history.

## Reviewer sessions

When dispatching a reviewer agent for a substantive scaffold change, continue the same reviewer session across revision rounds; dispatch fresh for unrelated tasks.

## Skill self-application

Use the repo's own skills (`change-log`, `push`, etc.) when a change ships in a plugin version bump, use the `change-log` skill to record it in `docs/change-log.md`: the plugins' release notes (plugin releases only, bounded at 15 sections). Repo-only work is recorded in `docs/decisions/`, not the release notes.

## What NOT to do

- Do not add agents or skills speculatively. Inclusion bar: lived-in proof from at least one substantial project.
- Do not commit private domain content (specific project decisions, real internal paths beyond generic placeholders).

## When in doubt

Read the piece's canonical spec and the relevant `docs/decisions/` note. If a maintenance question can't be resolved from those, ask the user before guessing.
