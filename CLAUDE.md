# CLAUDE.md - Agent Workshop

## What this repo is

This is `agent-workshop` — a scaffolding repo holding agent definitions, skills, and the operational conventions that make them useful in practice. The agents and skills here are extracted from real lived-in projects, sanitized for portable adoption.

This file (`CLAUDE.md`) governs Claude's behavior **when working inside `agent-workshop` itself** — maintaining, extending, sanitizing, or refining the scaffold. It is **not** the file you copy into adopting projects; those projects write their own `CLAUDE.md` describing their domain.

If you're looking for the file that adopting projects' Claude sessions should read, you're in the wrong place — see `README.md`'s install section (the `workbench` plugin is the adoption path; `toolkit` is optional).

## Maintenance stance

The scaffold's value is its **fitness for adoption**. Every change should ask:

1. Does this make a piece more portable, more correct, or more honest about its origin?
2. Could a new adopter copy this in without inheriting domain coupling they don't want?
3. Does the origin doc still tell the truth about what pressure created the piece?

Changes that drift the scaffold toward a specific project's domain are the failure mode. If you find yourself adding "for example, in the [specific gameplay loop / web app / payment flow] case..." into a sanitized agent spec, stop and either generalize or move that example into a project-specific overlay doc.

## Workflow expectations

This repo follows a lighter version of the **Spec → Plan → Execute → Review → Critique → Final-Docs** loop that the scaffold itself documents. For most maintenance work, only Spec and Execute apply:

- **Spec.** When changing an agent or skill substantively, write a short note in `docs/decisions/` (create the folder if it doesn't exist) describing what's changing and why. Mechanical edits (typo fixes, link updates, formatting) skip this step.
- **Execute.** Apply the change. Touch only the files involved.
- **Origin-doc parity.** Every change to an agent definition (`.claude/agents/<name>.md`) must check whether the matching `docs/agents/<name>.md` is still accurate. Same for skills.

If a change ships in a plugin version bump, record it with the `change-log` skill — `docs/change-log.md` is the plugins' **release notes** (plugin releases only, bounded at 15 sections; repo-only work is recorded in `docs/decisions/`, not there). The scaffold's own skill applies to itself — eat your own dogfood.

## Source-of-truth boundaries

The marketplace ships **two plugins**: `workbench` (the process core — review
agents, everyday skills, and the workbench flow layer) and `toolkit` (optional
artifact-making utilities). (The onboarding `agent-workshop` plugin was deleted
2026-08-11 — its worthwhile pieces are parked in the attic.)

- `plugins/workbench/…` and `plugins/toolkit/…` — canonical for everything
  shipped. **Shipped text may reference only what an installed environment can
  reach**: public URLs, never repo-relative paths or repo-local tooling.
- `.claude/`, `.codex/`, `.opencode/` hold **only the small set this repo itself
  runs** — `change-log`, `push`, `workbench-drift` (skills) and `wiki-maintainer`
  (agent). **`.claude/` is canonical for these**; they ship in no plugin and
  mirror nowhere. Do not expect every scaffold piece to appear here.
- `attic/skills/<name>/`, `attic/agents/<name>.md` — parked pieces: in-progress
  drafts, deprecated pieces, and the former onboarding set. Shipped by no plugin,
  run by no host, ignored by the validator; exempt from the docs symmetry until
  promoted (a retired piece's doc lives under `docs/*/deprecated/`).
  See `attic/README.md`.
- `docs/agents/<name>.md`, `docs/skills/<name>.md` — the doc for **every** live
  piece. Reference, not adopted.
- `README.md` — repo intro and install entry point. `AGENTS.md` — the non-Claude
  sibling of this file.

`scripts/validate-native-plugin.ps1` enforces this: the toolkit plugin is
internally consistent and all three host marketplaces list exactly it. The agent
and skill **definitions** are working code; the **docs** describe them. If they
diverge, fix the doc.

## When adding a new agent or skill

1. Decide it earns inclusion. The bar: *did this agent or skill prove its value in real lived-in use across at least one substantial project?* If not, leave it out — speculative additions dilute the scaffold.
2. Write the canonical spec where it belongs: `plugins/workbench/…` (process) or `plugins/toolkit/…` (optional utility) for a shipped piece; `.claude/` (and `.codex/`/`.opencode/` if the repo runs it on those hosts) for repo-only tooling. Shipped text references only what an installed environment can reach.
3. Sanitize. Strip project-specific names, paths, and domain references. Replace with generic placeholders or named-example callouts.
4. Write the doc. **Agents** (`docs/agents/<name>.md`): origin story — origin pressure, problem, solution shape, real workflow snippet, observed pitfalls, adaptation notes. **Skills** (`docs/skills/<name>.md`): small and usage-first — a one-or-two-line what-it-is (with lineage where derived), a **Use it** section (triggers, the load-bearing patterns, a compact example), and a **Don't** section (anti-patterns and boundaries). Rationale and history belong in `docs/decisions/`, linked, not restated in the skill doc.
5. Update `README.md` if the piece introduces a new top-level capability worth flagging.

## When removing or deprecating

The scaffold should not accumulate. If a piece stops earning its keep in real use:

1. Move its origin doc to `docs/agents/deprecated/<name>.md` (or skills equivalent), not delete. The history is part of the lesson.
2. Move the canonical spec out of the plugin(s) that ship it and into `attic/skills/<name>/` (removing it from `.claude/`/`.codex/`/`.opencode/` if the repo ran it). The attic keeps the spec versioned without shipping it; delete outright only when the text has no residual value.
3. Add a short note in the deprecated origin doc explaining what changed, what replaced it (if anything), and why.
4. Update `README.md` to reflect the current set.

## What NOT to do here

- Do not add agents or skills speculatively because they "might be useful." Inclusion bar: lived-in proof.
- Do not turn `CLAUDE.md` or `AGENTS.md` (root files) into copies of an adopting project's instructions. They govern the scaffold; they are not the scaffold's product.
- Do not introduce domain-specific examples inline in agent specs. Domain-specific worked examples belong in `docs/examples/` or in the origin doc.
- Do not break the symmetry: every agent has a matching `docs/agents/<name>.md`; every skill has `docs/skills/<name>.md`.
- Do not commit private domain content (specific project decisions, real codebase paths beyond generic placeholders) into the scaffold.

## Scope discipline

This repo is intentionally narrow. It is *agent definitions and skills* + *origin docs*. It is not a host (no application server, no test harness, no domain-specific tooling). Adding scope beyond that is out-of-scope; route to a separate project.

## On adopting from this repo into another project

If a Claude session is working in an adopting project (not in `agent-workshop` itself), it should not read this `CLAUDE.md`. The adopting project writes its own. The scaffold provides the templates; the adopting project owns what it does with them.

That separation matters: the scaffold's `CLAUDE.md` is about *maintaining the scaffold*; the adopting project's `CLAUDE.md` is about *the project's domain and workflow*. Mixing them defeats the point.

See `README.md` for the adoption flow (install `workbench`, optionally `toolkit`).
