# research

> **Parked 2026-08-11** — the onboarding `agent-workshop` plugin was deleted; the spec is preserved at `attic/skills/`. See `docs/decisions/drop-onboarding-plugin.md`.

## Origin

The originating project produced a steady stream of forward-looking notes — half-formed "we should think about X" ideas that didn't fit critique (which evaluates validated checkpoints) or specs (which design committed work). They accumulated in scattered places with inconsistent shape, making cross-comparison and triage hard.

The skill-and-agent pair was introduced to **standardize forward-looking research**: consistent inputs per category, a shared scoring framework, and an output structure stable enough to triage across runs.

The pattern: **thin skill, heavy agent**. The skill owns invocation parsing, per-category recipes, and validation. The `research` agent does the actual reading, drafting, and scoring. Mirrors the `doc-audit` → `doc-indexer` orchestration pattern.

## Problem

Three failure modes in pre-skill forward-looking research:

1. **Inconsistent shape.** One note had findings, another had only narrative; cross-comparing was hard.
2. **Post-hoc rationalization.** Findings drafted first, then questions reverse-engineered to match conclusions.
3. **No scoring → no triage.** Without scored axes, every finding looked equally important. Promotion decisions stalled.

The skill enforces shape; the agent applies the framework; the user gets a stable triage surface.

## Solution shape

**Five-axis scoring plus Horizon flag:**

- Direction fit (low / medium / high)
- Impact (low / medium / high)
- Effort / feasibility (low / medium / high)
- Confidence (low / medium / high)
- Urgency (now / next / later / deferred)
- Horizon (current / near-term / vision) — non-scored categorical

**Required output structure:** `# Title` with metadata → `## Purpose anchor` → `## Questions` → `## Findings` (with `### Existing surface review` and `### Net-new candidates`) → `## Gaps and risks` → `## Promotion candidates` → `## Conclusion` → `## Sources`.

**Per-category recipes** define the per-category brief inputs (purpose anchor, internal sources, external sources). Adopting projects start with one or two high-frequency recipes and add more as the pattern earns its keep.

**Validation lifecycle:** the skill validates the agent's draft. First pass passes → skill applies the index update. First pass fails → one revision pass. Second pass also fails → malformed file stays on disk; user decides.

The agent never updates the research index `## Contents` itself — that's held until the skill validates.

## Real invocation snippet

Example `CLAUDE.md` block:

```markdown
For forward-looking research across the categories your project defines, use the `research` skill (`.claude/skills/research/SKILL.md`). It produces `docs/research/`-conforming notes with consistent inputs, scoring axes, and Horizon flag. Reassesses existing category-tagged seeds and surfaces net-new candidates. Backward-looking doc-surface gaps remain `doc-audit` territory; this skill is for "what should we consider building or changing next."
```

Example invocations:

> /research architecture

> /research other "How should we evolve the test surface as the system grows?"

## Pitfalls observed

- **Post-hoc questions.** Drafting findings first, then writing questions to match. The questions stop anchoring the work. Write Questions before Findings.
- **Suppressing low-confidence findings.** A `Confidence: low` finding is honest disclosure, not a discard signal.
- **Auto-promoting findings.** The skill never auto-promotes. The user triages using the paste-ready rows in `Promotion candidates`.
- **Cadence runs.** Invocation-only. There is no "weekly research" cadence.
- **Cleaning failed studies into the research note.** Rejected ideas belong in scratch space, not in the note. The note is the durable triage surface.

## Adaptation notes

- The **category list** is project-specific. Pick a small set that maps to recurring research questions in your work — common shapes include `architecture`, `tests`, `code-quality`, `ui-ux`, `project-org`, plus a domain-specific one or two for your area. Start with one or two; add as needed.
- A **lens** dimension orthogonal to category (e.g., `inventory` / `prioritization` / `regression` / `ops-health`) is a useful layering when one category needs multiple shapes of pass. This is **advanced layering** — adopt only after the simple category framework has earned its value over several runs. The scaffold ships only the category framework.
- **Per-category recipes** are the binding between category and inputs. Document them in the skill file or in a sibling reference doc.
- **External lookup integration** (Context7 for library docs, WebSearch for design patterns) is opt-in per category. Some categories don't benefit; declare `external_sources: none` so the agent skips the lookup phase.
- The validation lifecycle is load-bearing — without it, malformed notes get indexed before being noticed. Adopt the held-until-PASS index update.
