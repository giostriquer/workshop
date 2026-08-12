# AGENTS.md - Agent Workshop

Workflow rules for non-Claude hosts (Codex, Gemini, OpenCode) working **inside `agent-workshop`** — maintaining the scaffold itself.

This file is the host-agnostic counterpart to `CLAUDE.md`. The two files are intentionally parallel; rules that fire during a session live in both, because each host loads only one file at the start of a session and forwarding to the other is unreliable under context pressure.

## Re-grounding order

When a session starts in this repo:

1. `README.md` — what this repo is and is not.
2. This file (or `CLAUDE.md` for Claude sessions).
3. `README.md`'s install section if the question involves adoption flow (the `workbench` plugin is the adoption path; `toolkit` is optional).
4. The relevant `docs/agents/<name>.md` or `docs/skills/<name>.md` if the question is about a specific piece.
5. The canonical spec — `plugins/workbench/…` or `plugins/toolkit/…` for shipped pieces, `.claude/` for the repo's own working set (see `CLAUDE.md` § "Source-of-truth boundaries") — only when verifying or modifying the spec itself.

Do not load the full docs tree. Do not load all agent specs unless doing a cross-cutting audit.

## Maintenance stance

See `CLAUDE.md` § "Maintenance stance" — same content, mirrored here so non-Claude sessions see it inline.

The scaffold's value is its fitness for adoption. Every change should make a piece more portable, more correct, or more honest about its origin. Changes that drift the scaffold toward a specific project's domain are the failure mode.

## Standard maintenance workflow

The full loop documented in `docs/examples/spec-driven-development.md` applies to **adopting projects**, not to this scaffold. For scaffold maintenance, the lighter loop is:

1. **Identify the change.** Mechanical (typo, link, formatting), substantive (new agent/skill, behavior change, convention shift), or structural (layout reorganization).
2. **Mechanical changes** apply directly. No spec, no review, no change-log.
3. **Substantive changes** get a short note in `docs/decisions/<name>.md` describing what's changing and why. Apply, then verify origin-doc parity.
4. **Structural changes** require updating `README.md` and any cross-references. Pause and ask the user before applying — structural changes affect every adopter.

## Origin-doc parity

Every agent has a matching `docs/agents/<name>.md`. Every skill has a matching `docs/skills/<name>.md`. When changing a canonical spec (in the plugin that ships it):

1. Apply the spec change.
2. Read the origin doc.
3. If the origin-doc claims contradict the new spec — fix the origin doc.
4. If the origin doc is still accurate — leave it alone.

The spec is the contract. The origin doc is the explanation. They must not drift.

## Cross-host parity

Canonical definitions live in the shipped plugins (`workbench` for the process core, `toolkit` for optional utilities; see `CLAUDE.md` § "Source-of-truth boundaries"). This repo's own host dirs — `.claude/`, `.codex/`, `.opencode/` — carry only the small set the repo runs (`change-log`, `push`, `workbench-drift`, `wiki-maintainer`); `.claude/` is canonical for those. Parked pieces — in-progress drafts, deprecated skills, and the former onboarding set (agents included) — live in `attic/` (see `attic/README.md`): in the repo, shipped by no plugin, discovered by no host, exempt from the docs symmetry until promoted.

The portable conventions adopters apply in *their* repos are unchanged: **thin wrappers for agents** (each non-Claude wrapper points at the adopter's `.claude/agents/<name>.md`) and **full mirroring for skills** (each host carries its own SKILL.md). Gemini and OpenCode remain supported **adoption** targets (onboarding generates their wrappers); this repo simply doesn't keep its own `.gemini/` instance.

## Source priority

When a question involves both this scaffold and an adopting project's specifics:

1. The user's current question and explicit context.
2. The relevant agent or skill canonical spec (in its shipping plugin).
3. The origin doc (`docs/agents/` or `docs/skills/`).
4. `README.md`, this file, `CLAUDE.md`.

When this scaffold and an adopting project disagree, the adopting project's `CLAUDE.md` / `AGENTS.md` wins for that project's work. The scaffold provides defaults; adopters can override.

## Reviewer sessions

When dispatching a reviewer agent for a substantive scaffold change, continue the same reviewer session across revision rounds; dispatch fresh for unrelated tasks.

## Skill self-application

The scaffold's own skills (`change-log`, `doc-audit`, etc.) apply to this repo too. When a meaningful scaffold change lands, use the `change-log` skill to record it under `docs/change-log.md` (create the file if needed). Trivial maintenance does not need a log entry.

## What NOT to do

- Do not modify agent specs without checking origin-doc parity.
- Do not add agents or skills speculatively. Inclusion bar: lived-in proof from at least one substantial project.
- Do not introduce domain-specific examples (game design, web app, particular product) inline in canonical specs. Domain examples go in `docs/examples/` or origin docs.
- Do not commit private domain content (specific project decisions, real internal paths beyond generic placeholders).
- Do not turn the scaffold into a methodology with claims. The scaffold is artifacts + origin notes.

## Scope discipline

This repo is *agent definitions + skills + origin docs*. Adding domain-specific tooling, hosts, or product features is out-of-scope.

## When in doubt

Read the matching origin doc (`docs/agents/<name>.md` or `docs/skills/<name>.md`). The origin docs explain why each piece exists and what it's responding to. If a maintenance question can't be resolved from the origin doc, ask the user before guessing.
