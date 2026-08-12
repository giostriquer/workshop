# doc-audit

> **Parked 2026-08-11** — the onboarding `agent-workshop` plugin was deleted; the spec is preserved at `attic/skills/`. See `docs/decisions/drop-onboarding-plugin.md`.

## Origin

The originating project's `wiki-maintainer` agent is **diff-driven by default** — it patches docs after code changes. By construction, it can't catch what *isn't* there: missing pages, undefined terms, orphaned files, missing decision records. After a few months, drift accumulated in those gaps that no diff-driven pass would have surfaced.

`doc-audit` was introduced as the **proactive** complement to diff-driven maintenance. It surfaces gaps; it doesn't fix them. Confirmed fixes route back to `wiki-maintainer`.

## Problem

Diff-driven documentation maintenance has a structural blindspot: it only sees what the current diff touches. After several months of activity, drift signals accumulate that no diff-driven pass produced:

- Section READMEs that advertise pages no longer existing on disk.
- Terminology that became prominent across docs but is never defined in the project's terminology source-of-truth.
- Decision records missing for landed durable decisions.
- Orphaned pages not linked from any routing surface.
- Code-architecture notes that have drifted against the source they describe.

A periodic proactive audit is the only way to surface these.

## Solution shape

Fourteen checks across four tiers:

- **Tier 1 (mechanical, fully automatable).** Section-README coverage, orphaned pages, link integrity, frontmatter compliance, asset-pointer existence. Delegated to `doc-indexer` in audit mode.
- **Tier 2 (threshold-based, user triages).** Terminology candidates by prominence, change-log coverage from git log.
- **Tier 3 (judgment-level, user reviews).** Architecture-doc rhetorical shape, ADR gap from change-log.
- **Tier 4 (code architecture).** Missing notes, script-path accuracy, index completeness, link-syntax compliance, code-arch content drift.

The skill is **report-only**. Confirmed fixes route to `wiki-maintainer` (writes), `change-log` (entries), or main session (ADR drafts).

Invocation forms: `/doc-audit` (full), `quick` (Tier 1), `deep` (Tiers 2–3), `code-arch` (Tier 4).

## Real invocation snippet

Example `CLAUDE.md` block on proactive doc-surface audits:

```markdown
For proactive audits that go beyond routing and vault-health — section-README coverage, terminology-candidate scans, change-log coverage, architecture-doc rhetorical-shape checks, ADR gap detection — invoke the `doc-audit` skill.

The skill wraps `doc-indexer` Audit mode for the mechanical tier and adds threshold-based and judgment-level checks on top. It is report-only; it never edits docs directly.

Use the skill when the user asks for a doc audit, a coverage check, a drift sweep, or "what's missing in our docs." Skip for small targeted changes — that stays diff-driven `wiki-maintainer` territory.
```

Example invocation:

> /doc-audit deep

## Pitfalls observed

- **Invoking for small targeted changes.** Diff-driven `wiki-maintainer` is faster and more focused. Reserve `doc-audit` for explicit "what's missing in our docs" requests.
- **Auto-applying findings.** The skill is propose-before-apply. Findings are candidates for the user to triage; some terminology candidates aren't worth defining, some change-log gaps are intentional, some ADR candidates don't deserve promotion.
- **Treating Tier 3 findings as obligatory ADRs.** The check flags ADR *candidates*. The user judges which deserve promotion; not every "decision-with-rationale" doc needs a paired ADR.
- **Running on a cadence.** This is invocation-only. Cadence runs dilute the surface and produce findings nobody acts on.

## Adaptation notes

- **Tier 4 (code architecture)** is the most project-specific tier. The originating project's code-architecture notes follow a specific shape (per-system note + dependency graph + design links). If your project doesn't have this surface, drop Tier 4 entirely.
- **Tier 1 Check 4 (frontmatter compliance)** depends on the project having a frontmatter-tags table somewhere (the originating project keeps it in `wiki-maintainer.md`). Adapt to your project's tag conventions or drop the check.
- **Check 13 (link-syntax compliance)** is for projects that ban specific link syntaxes (e.g., Obsidian `[[...]]` for portability reasons). Drop if your project doesn't have such a ban.
- The **threshold for terminology candidates** (5+ docs) is adjustable. Tune to your project's volume.
- The skill **delegates Tier 1 to `doc-indexer`**. If you don't ship `doc-indexer`, the skill can run Tier 1 inline — but the delegation is cheaper for context.
