# CLAUDE.md - Agent Workshop

## What this repo is

This is `agent-workshop` — a scaffolding repo holding agent definitions, skills, and the operational conventions that make them useful in practice. The agents and skills here are extracted from real lived-in projects, sanitized for portable adoption.

This file (`CLAUDE.md`) governs Claude's behavior **when working inside `agent-workshop` itself** — maintaining, extending, sanitizing, or refining the scaffold. It is **not** the file you copy into adopting projects; those projects write their own `CLAUDE.md` describing their domain.

If you're looking for the file that adopting projects' Claude sessions should read, you're in the wrong place — see `README.md`'s install section and the `agent-workshop-onboard` onboarding plugin.

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
- **Conventions parity.** When changing a convention doc (`docs/conventions/`), check whether the agents and skills referencing it need updating.

If a change is meaningful enough to land a `change-log.md` entry, use the `change-log` skill (the scaffold's own skill applies to itself — eat your own dogfood).

## Source-of-truth boundaries

Each piece's canonical definition lives in the plugin that ships it. The two plugins
are **independent** — they need not carry the same set, and there is no universal
`.claude/` master.

- `plugins/toolkit/skills/<name>/SKILL.md`, `plugins/toolkit/agents/<name>.md` —
  canonical for the **toolkit** (direct-use, self-contained) set.
- `plugins/agent-workshop/skills/agent-workshop-onboard/references/…` — canonical for
  the **onboarding** (project-coupled, copy-and-adapt) set: agent specs under
  `references/agents/`, host-wrapper templates under `references/wrappers/<host>/`,
  flattened skill specs under `references/skills/`, and the canonical pack catalog at
  `references/catalog.json`.
- A piece that serves both roles (the reviewers) ships a copy in each plugin; the
  copies are allowed to diverge.
- `.claude/`, `.codex/`, `.opencode/` hold **only the small set this repo itself
  runs** — currently `change-log`, `push` (skills) and `wiki-maintainer`, `vigil`
  (agents) — kept byte-identical to their onboarding-bundle templates. Do not expect
  every scaffold piece to appear here.
- `attic/skills/<name>/` — parked pieces: in-progress drafts not yet earning
  inclusion, and deprecated pieces retired from the plugins. Shipped by no plugin,
  run by no host, ignored by the validator; exempt from the docs symmetry until
  promoted (a deprecated piece's origin doc lives at `docs/skills/deprecated/`).
  See `attic/README.md`.
- `docs/agents/<name>.md`, `docs/skills/<name>.md` — origin story for **every** piece.
  Reference, not adopted.
- `docs/conventions/<name>.md` — portable rules. Adopting projects pick which to include.
- `plugins/agent-workshop/skills/agent-workshop-onboard/references/catalog.json` —
  the onboarding pack catalog (the only copy; no top-level `marketplace/` master).
  Its `canonicalPath` / `wrapperPaths` describe where a piece **lands in an adopting project**
  (`.claude/agents/<name>.md`, `.codex/agents/<name>.toml`, …), not where it lives here.
- `README.md` — repo intro and adoption entry point. `AGENTS.md` — the non-Claude
  sibling of this file.

`scripts/validate-native-plugin.ps1` enforces this: each plugin is internally
consistent, the onboarding bundle is self-contained, and the repo's own working set
stays in sync with its bundle templates. The agent and skill **definitions** are
working code; the **docs** describe them. If they diverge, fix the doc.

## When adding a new agent or skill

1. Decide it earns inclusion. The bar: *did this agent or skill prove its value in real lived-in use across at least one substantial project?* If not, leave it out — speculative additions dilute the scaffold.
2. Write the canonical spec into the plugin that ships it: `plugins/toolkit/…` for a direct-use, self-contained piece, or the onboarding bundle (`plugins/agent-workshop/.../references/…` plus a `references/catalog.json` entry) for a project-coupled piece that needs adaptation. A piece that is both ships a copy in each. Only add it to `.claude/` (and `.codex/`/`.opencode/`) if this repo will itself run it.
3. Sanitize. Strip project-specific names, paths, and domain references. Replace with generic placeholders or named-example callouts.
4. Write the origin doc at `docs/agents/<name>.md` or `docs/skills/<name>.md`. Cover: origin pressure, problem, solution shape, real workflow snippet, observed pitfalls, adaptation notes.
5. If the new piece relies on a convention not yet in `docs/conventions/`, add or update that convention.
6. Update `README.md` if the piece introduces a new top-level capability worth flagging.

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

This repo is intentionally narrow. It is *agent definitions and skills* + *origin docs* + *portable conventions*. It is not a host (no application server, no test harness, no domain-specific tooling). Adding scope beyond that is out-of-scope; route to a separate project.

## On adopting from this repo into another project

If a Claude session is working in an adopting project (not in `agent-workshop` itself), it should not read this `CLAUDE.md`. The adopting project writes its own. The scaffold provides the templates; the adopting project owns what it does with them.

That separation matters: the scaffold's `CLAUDE.md` is about *maintaining the scaffold*; the adopting project's `CLAUDE.md` is about *the project's domain and workflow*. Mixing them defeats the point.

See `README.md` and the `agent-workshop-onboard` onboarding plugin for the adoption flow.
