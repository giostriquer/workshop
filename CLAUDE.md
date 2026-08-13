# CLAUDE.md - Workshop

## What this repo is

This is `workshop` — a scaffolding repo holding agent definitions, skills, and the operational conventions that make them useful in practice. The agents and skills here are extracted from real lived-in projects, sanitized for portable adoption.

This file (`CLAUDE.md`) governs Claude's behavior **when working inside `workshop` itself** — maintaining, extending, sanitizing, or refining the scaffold. It is **not** the file you copy into adopting projects; those projects write their own `CLAUDE.md` describing their domain.

If you're looking for the file that adopting projects' Claude sessions should read, you're in the wrong place — see `README.md`'s install section (the `workbench` plugin is the adoption path; `toolkit` is optional).

## Maintenance stance

The scaffold's value is its **fitness for adoption**. Every change should ask:

1. Does this make a piece more portable, more correct, or more honest about its origin?
2. Could a new adopter copy this in without inheriting domain coupling they don't want?
3. Does the piece's `docs/decisions/` record still tell the truth about what pressure created it?

Changes that drift the scaffold toward a specific project's domain are the failure mode. If you find yourself adding "for example, in the [specific gameplay loop / web app / payment flow] case..." into a sanitized agent spec, stop and either generalize or move that example into a project-specific overlay doc.

## Workflow expectations

This repo follows a lighter version of the **Spec → Plan → Execute → Review → Critique → Final-Docs** loop that the scaffold itself documents. For most maintenance work, only Spec and Execute apply:

- **Spec.** When changing an agent or skill substantively, write a short note in `docs/decisions/` (create the folder if it doesn't exist) describing what's changing and why. Mechanical edits (typo fixes, link updates, formatting) skip this step.
- **Execute.** Apply the change. Touch only the files involved.
- **No rationale doc layer.** Agents and skills are self-contained: the spec (agent `.md` / SKILL.md) is the whole artifact, and rationale lives in `docs/decisions/` only. The one per-skill layer that exists is `docs/skills/` — **usage** pages for shipped skills (what it does, when to reach for it, common questions, how to tell it worked). When a shipped skill's behavior changes, update its page in the same change: a usage page that has drifted from its spec is worse than no page. If the two ever disagree, the spec is right.

If a change ships in a plugin version bump, record it with the `change-log` skill — `docs/change-log.md` is the plugins' **release notes** (plugin releases only, bounded at 15 sections; repo-only work is recorded in `docs/decisions/`, not there). The scaffold's own skill applies to itself — eat your own dogfood.

## Source-of-truth boundaries

The marketplace ships **two plugins**: `workbench` (the process core — review
agents, everyday skills, and the workbench flow layer) and `toolkit` (optional
artifact-making utilities). (The onboarding `workshop` plugin was deleted
2026-08-11 — its worthwhile pieces are parked in the attic.)

- `plugins/workbench/…` and `plugins/toolkit/…` — canonical for everything
  shipped. **Shipped text may reference only what an installed environment can
  reach**: public URLs, never repo-relative paths or repo-local tooling.
- `.claude/`, `.codex/`, `.opencode/` hold **only the small set this repo itself
  runs** — `change-log`, `push`, `workbench-drift` (skills) and `wiki-maintainer`
  (agent). **`.claude/` is canonical for these**; they ship in no plugin and
  mirror nowhere. Do not expect every scaffold piece to appear here.
- `attic/` — parked pieces, shipped by no plugin, run by no host, ignored by
  the validator. Two tiers: `attic/skills/` and `attic/agents/` hold pieces
  that are **in-progress or need fixing** (intended to ship once right);
  `attic/deprecated/` holds pieces with **no current function, kept as
  history** (a folder per retired piece: spec plus any parked origin doc).
  See `attic/README.md`.
- `docs/skills/` — **usage** pages for every skill shipped in a plugin: what it
  does, when to reach for it, common questions, how to tell it worked. Reader-
  facing, never rationale, history, or release notes — those stay in
  `docs/decisions/` and `docs/change-log.md`. Agents carry no such layer, and
  the specs themselves remain self-contained.
- `README.md` — repo intro and install entry point. `AGENTS.md` — the non-Claude
  sibling of this file.

`scripts/validate-native-plugin.ps1` enforces this: the workbench and toolkit
plugins are internally consistent across all four host packaging surfaces (Claude,
Codex, Cursor, Antigravity). The agent and skill **definitions** are working
code; `docs/decisions/` records why they exist. If prose and definition diverge,
fix the prose.

## When adding a new agent or skill

1. Decide it earns inclusion. The bar: *did this agent or skill prove its value in real lived-in use across at least one substantial project?* If not, leave it out — speculative additions dilute the scaffold.
2. Write the canonical spec where it belongs: `plugins/workbench/…` (process) or `plugins/toolkit/…` (optional utility) for a shipped piece; `.claude/` (and `.codex/`/`.opencode/` if the repo runs it on those hosts) for repo-only tooling. Shipped text references only what an installed environment can reach — **and never repo bookkeeping**: no decision-ledger numbers, decision-note links, dates, or authoring narrative in any skill or agent body. A skill carries only what the skill itself (or the processes it composes with) needs; rationale goes in `docs/decisions/`, full stop.
3. Sanitize. Strip project-specific names, paths, and domain references. Replace with generic placeholders or named-example callouts.
4. Write a `docs/decisions/` note for the rationale. For a **shipped skill**, also add its `docs/skills/<name>.md` usage page and list it in `docs/skills/README.md` — usage only, never a restatement of the rationale note. Agents get no page; their spec is the whole artifact.
5. Update `README.md` if the piece introduces a new top-level capability worth flagging.

## When removing or deprecating

The scaffold should not accumulate. If a piece stops earning its keep in real use:

1. Move the canonical spec out of the plugin(s) that ship it (removing it from `.claude/`/`.codex/`/`.opencode/` if the repo ran it) and into `attic/deprecated/skills/<name>/` or `attic/deprecated/agents/<name>/` — history, not deleted; the history is part of the lesson. Delete outright only when the text has no residual value. (`attic/skills/` and `attic/agents/` are **not** for retirement — they hold only in-progress pieces still intended to ship.)
2. A short `docs/decisions/` note records the retirement: what changed, what replaced it (if anything), and why.
3. Update `README.md` and `attic/README.md` to reflect the current set.

## What NOT to do here

- Do not add agents or skills speculatively because they "might be useful." Inclusion bar: lived-in proof.
- Do not turn `CLAUDE.md` or `AGENTS.md` (root files) into copies of an adopting project's instructions. They govern the scaffold; they are not the scaffold's product.
- Do not introduce domain-specific examples inline in agent specs. Keep specs generic (placeholders or named-example callouts); domain-specific rationale goes in `docs/decisions/`.
- Do not turn `docs/skills/` back into an origin-doc layer. Those pages are **usage** documentation. The moment one starts restating why a skill exists, what pressure created it, or what changed in which release, it has become the layer that was deleted before — rationale belongs in `docs/decisions/`, history in git. Agents get no doc layer at all.
- Do not leak repo bookkeeping into skill or agent text: no decision-ledger numbers (Q-refs), no decision-note links, no dates or authoring narrative. Rationale lives in `docs/decisions/` only.
- Do not commit private domain content (specific project decisions, real codebase paths beyond generic placeholders) into the scaffold.

## Scope discipline

This repo is intentionally narrow. It is *agent definitions and skills* + *decision records* + *usage docs for the shipped skills*. It is not a host (no application server, no test harness, no domain-specific tooling). Adding scope beyond that is out-of-scope; route to a separate project.

## On adopting from this repo into another project

If a Claude session is working in an adopting project (not in `workshop` itself), it should not read this `CLAUDE.md`. The adopting project writes its own. The scaffold provides the templates; the adopting project owns what it does with them.

That separation matters: the scaffold's `CLAUDE.md` is about *maintaining the scaffold*; the adopting project's `CLAUDE.md` is about *the project's domain and workflow*. Mixing them defeats the point.

See `README.md` for the adoption flow (install `workbench`, optionally `toolkit`).
