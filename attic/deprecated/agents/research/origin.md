# research

> **Parked 2026-08-11**: the onboarding `agent-workshop` plugin was deleted; the spec sits alongside this doc in this folder. See `docs/decisions/drop-onboarding-plugin.md`.

## Origin

The originating project produced a steady stream of "we should think about X" notes: half-formed forward-looking ideas that didn't fit critique (which evaluates validated checkpoints) or specs (which design committed work). They accumulated as scattered bullets in chat, occasional README appendices, or one-off `docs/research-X.md` files with inconsistent shape.

The skill-and-agent pair was introduced to **standardize forward-looking research**: consistent inputs per category, a shared scoring framework, and an output structure stable enough to triage across runs and across categories.

The pattern that emerged: **thin skill, heavy agent**. The skill owns invocation parsing, per-category recipes, and validation. The agent does the actual reading, drafting, and scoring. Mirrors the `doc-audit` → `doc-indexer` orchestration pattern.

## Problem

Three failure modes appeared in pre-skill research:

1. **Inconsistent shape.** One research note had findings, another had only narrative; cross-comparing was hard.
2. **Post-hoc rationalization.** Findings were drafted first, then questions reverse-engineered to match conclusions. The Questions section was not actually anchoring the research.
3. **No scoring → no triage.** Without scored axes, every finding looked equally important. Promotion decisions stalled.

The skill enforces shape; the agent applies the framework; the user gets a stable triage surface.

## Solution shape

Five-axis scoring plus Horizon flag, applied to every finding:

- Direction fit (low / medium / high)
- Impact (low / medium / high)
- Effort / feasibility (low / medium / high)
- Confidence (low / medium / high)
- Urgency (now / next / later / deferred)
- Horizon (current / near-term / vision)

Horizon is intentionally non-scored: a `Direction fit: high` + `Horizon: vision` finding is preserved-with-flag, not silently suppressed.

Required output structure: `# Title` with metadata → `## Purpose anchor` → `## Questions` → `## Findings` (with `### Existing surface review` and `### Net-new candidates`) → `## Gaps and risks` → `## Promotion candidates` → `## Conclusion` → `## Sources`.

The skill validates the agent's draft. If the first pass fails, the agent gets one revision pass. If the second pass also fails, the malformed file stays on disk and the user decides whether to delete, hand-edit, or rerun.

## Real workflow snippet

Example `CLAUDE.md` line:

```markdown
For forward-looking research across the recurring categories your project defines, use the `research` skill (`.claude/skills/research/SKILL.md`). It produces `docs/research/`-conforming notes with consistent inputs, scoring axes, and Horizon flag. Reassesses existing category-tagged seeds and surfaces net-new candidates. Backward-looking doc-surface gaps are `doc-audit` territory; this skill is for "what should we consider building or changing next."
```

Example invocation:

> /research architecture

Or, for a custom one-off run:

> /research other "How should we evolve the test harness's metric coverage as the system surface grows?"

## Pitfalls observed

- **Post-hoc questions.** Drafting findings first, then writing the Questions section to match. The questions stop anchoring the work and become decorative. Write Questions before Findings.
- **Suppressing low-confidence findings.** A finding with `Confidence: low` is not invalid; it is a transparency disclosure. Surface it; don't omit. The scoring framework treats `Confidence: low` as honest, not as a discard signal.
- **Suppressing vision-horizon findings.** A `Direction fit: high` + `Horizon: vision` finding is information about a future state. Preserve with the Horizon flag; don't silently filter.
- **Cleaning failed studies.** Rejected variants and exploration outputs belong in scratch space (`.temp` or equivalent), not in the research note. Clean output keeps the surface readable.
- **Auto-promoting findings.** The skill never auto-promotes. The user triages using the paste-ready rows in `Promotion candidates`. Auto-promotion erodes the gate the structure exists to provide.
- **Cadence runs.** This is invocation-only. There is no "run research weekly" cadence because that would dilute the surface. Each run should give weeks of triage material.

## Adaptation notes

- The category list is **project-specific**. Pick a small set that maps to recurring research questions in your work: common shapes include `architecture`, `tests`, `code-quality`, `ui-ux`, `project-org`, plus a domain-specific one or two for your area. Start with one or two high-frequency categories; add more as the pattern earns its keep.
- A **lens** dimension orthogonal to category (e.g., `inventory` / `prioritization` / `regression` / `ops-health`) is a useful layering when one category needs multiple shapes of pass. This is **advanced layering**: adopt only after the simple category framework has earned its value over several runs. The scaffold ships only the category framework.
- Per-category recipes are the project-specific binding between category and inputs. Document them in the skill file or in a sibling reference doc. The agent reads the brief; the skill assembles it from the recipe.
- External lookup integration (Context7 for library docs, WebSearch for design patterns) is opt-in per category. Some categories don't benefit from external research and should declare `external_sources: none` so the agent skips the lookup phase.
- The contents-block update is held until validation passes: the agent never updates the index itself. This separation is load-bearing; without it, malformed notes get indexed before being noticed.
