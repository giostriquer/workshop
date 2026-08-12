---
name: research
description: Forward-looking research skill. Produces docs/research/-conforming notes across project-defined categories with consistent inputs, five-axis scoring, and a Horizon flag. Use when the user asks for a broad research pass on a category, wants to reassess existing seeds, or wants to surface net-new ideas grounded in a category's purpose anchor.
---

# Research

## Purpose

Standardize forward-looking research across recurring categories with consistent input recipes, scoring framework, and output structure. Produces research notes conforming to the project's `docs/research/` schema.

This skill is the **orchestrator**. The actual research work — file reads, external lookups, drafting, scoring — runs in the dispatched `research` agent (`model: inherit`). The skill owns invocation parsing, per-category recipes, brief assembly, and post-agent output validation.

The pattern: **thin skill, heavy agent** — invocation logic and validation here; reasoning and writing in the agent.

## When to invoke

- User explicitly asks for a research pass on one of the project's categories ("research architecture future ideas," "research how to expand our tooling," etc.).
- User wants to reassess existing category-tagged seeds against current state.
- User wants to surface net-new candidate ideas grounded in a category's purpose.
- User invokes `/research` with or without a category argument.

## Default posture

Heavy. A run reads many internal files, makes external lookups (Context7 / WebSearch / WebFetch) for categories where they help, and produces a single Markdown research note plus an index update. Not a daily skill — invocation cadence is bounded by the user.

## Invocation forms

### 1. Interactive (`/research` with no arguments)

Skill responds by listing the project's defined categories plus `other`, then asks the user to pick. If `other` is selected, the skill asks for:

- a one-paragraph **purpose anchor** for the run
- a **focus statement** (one-line scope)
- a **source list** (paths to read, external lookup intent)

### 2. Direct (`/research <category>`)

`<category>` is one of the project's defined categories. Skill assembles the brief from the per-category recipe (see "Per-category recipes" below) and dispatches.

### 3. Custom (`/research other "<focus>"`)

Skill asks the user for the purpose anchor and source list at invocation time, then assembles a custom brief.

## Per-category recipes

Each project defines its own category list. Recipes typically live in this skill file or in a sibling reference doc the skill loads. A recipe specifies:

- **purpose_anchor**: what the category surface is for, in one paragraph
- **internal_sources**: paths to read (files and folders)
- **external_sources**: opt-in flag and target shape for external lookups

A minimum recipe for a new category looks like:

```markdown
### Recipe: <category-name>

**Purpose anchor:** <one-paragraph statement of what this category is for>

**Internal sources:**
- `docs/<area>/README.md`
- `docs/<area>/<specific-file>.md`
- `docs/future-ideas/idea-seeds/README.md` (filtered to category-tagged rows)

**External sources:**
- Context7 for <library/framework> documentation
- WebSearch for <topic> design-pattern references

OR

**External sources:** none — this category does not benefit from external research.
```

Adopting projects start with one or two recipes for their highest-frequency research categories and add more as the pattern earns its keep.

## Categorization framework

Five scored axes plus one categorical flag, applied to every finding. The framework is shared across all categories; only the inputs and purpose anchor vary.

| Axis | Scale | Definition |
|---|---|---|
| Direction fit | low / medium / high | Alignment with project design direction. |
| Impact | low / medium / high | How much the finding moves the needle if it works. |
| Effort / feasibility | low / medium / high | How hard to build, including technical risk. |
| Confidence | low / medium / high | Strength of evidence and reasoning. |
| Urgency | now / next / later / deferred | When to do it if accepted. Distinct from impact. |

| Flag | Values | Definition |
|---|---|---|
| Horizon | current / near-term / vision | When the idea becomes buildable. `current` fits today's project lane. `near-term` fits within one or two scope expansions. `vision` only fits a future post-current state. |

Each finding row uses this shape:

```markdown
**<Finding title>**
- Direction fit: low | medium | high
- Impact: low | medium | high
- Effort / feasibility: low | medium | high
- Confidence: low | medium | high
- Urgency: now | next | later | deferred
- Horizon: current | near-term | vision

<Body — concrete, anchored to specific files / docs / external references. Cite sources. State the reasoning that produced the scores.>
```

## Brief shape

The skill assembles a brief and dispatches the `research` agent. Brief fields:

- `category` — the category name
- `purpose_anchor` — paragraph from the recipe
- `internal_sources` — list of files and folders
- `external_sources` — opt-in shape for external lookups
- `output_filename` — `docs/research/YYYY-MM-DD-<category>[-<short-topic>].md`
- `schema` — required schema sections, scoring axes, Horizon flag values, validation rules

The `research` agent reads its full spec at `.claude/agents/research.md` for canonical behavior.

## Output validation

After the agent writes the draft note, the skill validates it against the schema before applying any index update. Validation gates the agent honors:

1. **Required sections present in order** — `# Title` with metadata block → `## Purpose anchor` → `## Questions` → `## Findings` (with `### Existing surface review` and `### Net-new candidates` subsections) → `## Gaps and risks` → `## Promotion candidates` → `## Conclusion` → `## Sources`.
2. **All findings scored** — every finding row carries all five axes and the Horizon flag.
3. **Sources block present** — either lists external citations or carries the explicit line `No external sources consulted.`
4. **Index entry returned** — the agent returns a 2–4 clause index entry the skill will paste into `docs/research/README.md` `## Contents`.

If the first pass fails, the skill returns validation findings to the agent for one revision pass. If the second pass also fails, the skill surfaces the validation diff to the user, leaves the malformed file on disk, and explicitly states the index was not updated.

The skill applies the index-update edit only after a clean PASS.

## What the skill does NOT do

- Does not write the research note itself — that's the agent's job.
- Does not modify source-of-truth docs beyond the new note and the index update.
- Does not auto-promote findings into seeds, future-ideas, or specs.
- Does not commit or push.
- Does not run on a cadence — invocation only.

## Boundary with existing surfaces

- `doc-indexer` owns backward-looking documentation routing and audit. This skill is forward-looking.
- `wiki-maintainer` owns source-of-truth doc edits.
- `change-log` records what landed; this skill records what was *considered*.
- `pattern-reviewer` / `spec-reviewer` review specific artifacts.
