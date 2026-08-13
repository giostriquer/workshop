# AGENTS.md - Workshop

Workflow rules for non-Claude hosts (Codex, Gemini, OpenCode) working **inside `workshop`** — maintaining the scaffold itself.

This file is the host-agnostic counterpart to `CLAUDE.md`. The two files are intentionally parallel; rules that fire during a session live in both, because each host loads only one file at the start of a session and forwarding to the other is unreliable under context pressure.

## Re-grounding order

When a session starts in this repo:

1. `README.md` — what this repo is and is not.
2. This file (or `CLAUDE.md` for Claude sessions).
3. `README.md`'s install section if the question involves adoption flow (the `workbench` plugin is the adoption path; `toolkit` is optional).
4. The canonical spec — `plugins/workbench/…` or `plugins/toolkit/…` for shipped pieces, `.claude/` for the repo's own working set (see `CLAUDE.md` § "Source-of-truth boundaries") — if the question is about a specific agent or skill. The spec is the whole artifact; rationale lives in `docs/decisions/`.

Do not load the full docs tree. Do not load all agent specs unless doing a cross-cutting audit.

## Maintenance stance

See `CLAUDE.md` § "Maintenance stance" — same content, mirrored here so non-Claude sessions see it inline.

The scaffold's value is its fitness for adoption. Every change should make a piece more portable, more correct, or more honest about its origin. Changes that drift the scaffold toward a specific project's domain are the failure mode.

## Standard maintenance workflow

The full **Spec → Plan → Execute → Review → Critique → Final-Docs** loop applies to **adopting projects**, not to this scaffold. For scaffold maintenance, the lighter loop is:

1. **Identify the change.** Mechanical (typo, link, formatting), substantive (new agent/skill, behavior change, convention shift), or structural (layout reorganization).
2. **Mechanical changes** apply directly. No spec, no review, no change-log.
3. **Substantive changes** get a short note in `docs/decisions/<name>.md` describing what's changing and why, then apply.
4. **Structural changes** require updating `README.md` and any cross-references. Pause and ask the user before applying — structural changes affect every adopter.

## No rationale doc layer

Agents and skills are self-contained: the spec (agent `.md` / SKILL.md) is the whole artifact, and rationale lives in `docs/decisions/`.

The one per-skill layer is `docs/skills/` — **usage** pages for shipped skills: what each does, when to reach for it, common questions, how to tell it worked. Reader-facing only. Do not let a page drift into rationale, origin story, or release history; that is the layer that was deleted before. Update a skill's page in the same change that alters its behavior, and when page and spec disagree, the spec wins. Agents get no doc layer (no `docs/agents/`).

## Cross-host parity

Canonical definitions live in the shipped plugins (`workbench` for the process core, `toolkit` for optional utilities; see `CLAUDE.md` § "Source-of-truth boundaries"). This repo's own host dirs — `.claude/`, `.codex/`, `.opencode/` — carry only the small set the repo runs (`change-log`, `push`, `workbench-drift`, `wiki-maintainer`); `.claude/` is canonical for those. Parked pieces live in `attic/` (see `attic/README.md`): in the repo, shipped by no plugin, discovered by no host. Two tiers — `attic/skills/` and `attic/agents/` for in-progress pieces still intended to ship; `attic/deprecated/` for retired pieces kept as history.

The portable conventions adopters apply in *their* repos are unchanged: **thin wrappers for agents** (each non-Claude wrapper points at the adopter's `.claude/agents/<name>.md`) and **full mirroring for skills** (each host carries its own SKILL.md). Antigravity, Gemini, and OpenCode remain supported **adoption** targets (onboarding generates their wrappers); this repo simply doesn't keep its own `.gemini/` instance.

## Source priority

When a question involves both this scaffold and an adopting project's specifics:

1. The user's current question and explicit context.
2. The relevant agent or skill canonical spec (in its shipping plugin).
3. The relevant `docs/decisions/` note.
4. `README.md`, this file, `CLAUDE.md`.

When this scaffold and an adopting project disagree, the adopting project's `CLAUDE.md` / `AGENTS.md` wins for that project's work. The scaffold provides defaults; adopters can override.

## Reviewer sessions

When dispatching a reviewer agent for a substantive scaffold change, continue the same reviewer session across revision rounds; dispatch fresh for unrelated tasks.

## Skill self-application

The scaffold's own skills (`change-log`, `push`, etc.) apply to this repo too. When a change ships in a plugin version bump, use the `change-log` skill to record it in `docs/change-log.md` — the plugins' release notes (plugin releases only, bounded at 15 sections). Repo-only work is recorded in `docs/decisions/`, not the release notes.

## What NOT to do

- Do not add agents or skills speculatively. Inclusion bar: lived-in proof from at least one substantial project.
- Do not introduce domain-specific examples (game design, web app, particular product) inline in canonical specs. Keep specs generic; domain-specific rationale goes in `docs/decisions/`.
- Do not commit private domain content (specific project decisions, real internal paths beyond generic placeholders).
- Do not turn the scaffold into a methodology with claims. The scaffold is artifacts + origin notes.

## Scope discipline

This repo is *agent definitions + skills + decision records*. Adding domain-specific tooling, hosts, or product features is out-of-scope.

## When in doubt

Read the piece's canonical spec and the relevant `docs/decisions/` note. If a maintenance question can't be resolved from those, ask the user before guessing.
