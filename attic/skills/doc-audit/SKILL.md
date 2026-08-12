---
name: doc-audit
description: Run a proactive audit of the project documentation surface. Surfaces gaps that diff-driven wiki-maintainer passes miss by construction — missing pages, broken links, undefined terms, missing decision records, orphaned files. Report-only; never edits docs directly. Use when the user asks for a doc audit, a coverage check, a drift sweep, or "what's missing in our docs."
---

# Doc Audit

## Purpose

Surface proactive documentation gaps that diff-driven `wiki-maintainer` passes miss by construction. Everything this skill finds is about what *isn't* there — missing pages, missing terms, missing decision records, broken links — not about what just changed.

Produces one consolidated findings report in propose-before-apply shape. Never edits docs directly. Hands off confirmed fixes to `wiki-maintainer` (for writes) or to the main session (for judgment-level drafts such as ADRs).

## When to invoke

- User explicitly asks for a doc audit or coverage check
- After a major project milestone lands and the doc surface may have drifted
- Before a scope-doc refresh, to catch gaps upstream
- When the user senses doc drift and wants a sweep

Do NOT invoke for small targeted changes — that remains diff-driven `wiki-maintainer` territory.

## Scope

- Operates only within the current repository.
- Reads docs, change-log, source files, and git log.
- Does not commit, push, or edit any doc.
- Does not dispatch agents automatically — the report lists findings and recommended next actions; the user decides which to act on.

## Invocation forms

- `/doc-audit` — runs all checks across all tiers
- `/doc-audit quick` — runs only Tier 1 (mechanical checks)
- `/doc-audit deep` — runs Tiers 2–3 (judgment-level checks)
- `/doc-audit code-arch` — runs Tier 4 (code-architecture-specific checks)

## Checks

### Tier 1 — Mechanical (fully automatable)

**Check 1: Section-README coverage.** For each section README that advertises pages or topics, verify every advertised topic resolves to a linked page that exists on disk. Finding shape: README path → advertised topic → expected page path → status.

**Check 2: Orphaned pages.** Build a link graph of all docs under `docs/` plus root-level `AGENTS.md`, `CLAUDE.md`, and `README.md`. Flag pages not reachable by link from any routing doc. Exempt files with `obsidian-only: true` (or equivalent project marker) in frontmatter.

**Check 3: Link integrity.** Scan all `.md` files under `docs/` plus root-level workflow files for links to local files. Validate both standard `[label](path.md)` and any host-specific syntax the project uses. Report broken links.

**Check 4: Frontmatter compliance.** For each file whose path matches a required-tag pattern (defined in your project's wiki-maintainer doc or convention doc), verify it carries the expected `tags:` frontmatter.

**Check 5: Asset-pointer existence.** For each page that references concrete asset paths (e.g., math pages referencing data files, mockup catalogs referencing images), verify each referenced asset exists on disk.

Tier 1 can be delegated to `doc-indexer` in Audit mode; the skill consolidates its output into the final report.

### Tier 2 — Threshold-based candidates (user triages)

**Check 6: Terminology candidates by prominence.** Grep for capitalized or `PascalCase` / namespace-like noun phrases that appear in 5 or more non-terminology docs (threshold adjustable). For each candidate, check whether it is defined in the project's terminology source-of-truth doc. Report candidates sorted by occurrence count, with top 3 docs each appears in.

**Check 7: Change-log coverage.** Scan `git log` for commits since the most recent `docs/change-log.md` date section. Flag commits whose message prefix suggests meaningful change (`feat:`, `add`, `introduce`, `remove`, scope-affecting keywords) but whose effect does not appear to be covered by an existing change-log entry.

### Tier 3 — Judgment-level (user reviews)

**Check 8: Architecture-doc rhetorical shape.** Read each doc in `docs/architecture/` (or your project's equivalent) and classify:

- `structural-description` — describes *how* a system works; no rationale framing
- `decision-with-rationale` — describes *why* a decision was made; frames alternatives
- `both` — covers structure and rationale in the same page

For any doc classed `structural-description` without a corresponding ADR in `docs/decisions/`, flag as an ADR candidate. Include specific quoted prose from the doc that reads like a stated decision without recorded rationale.

**Check 9: ADR gap from recent change-log.** Read the last 30 days of `docs/change-log.md` entries. Flag entries whose prose suggests a durable decision (`decided to`, `chose X over Y`, `will now`, `the rule is`, `from now on`) and check whether a corresponding ADR exists.

### Tier 4 — Code architecture (project-domain-focused)

Tier 4 targets the project's code-architecture documentation surface (typically `docs/architecture/code/`) and its relationship to the actual source tree. Adopting projects can omit this tier if their docs don't carry per-system architecture notes.

**Check 10: Missing notes.** Scan the project's source tree for significant public classes that represent logical system groups (state holders, orchestrators, state machines). For each candidate, check whether a corresponding note exists. Apply project-specific bundle rules (e.g., wrappers bundled into one note, similar UI views bundled together).

**Check 11: Script-path accuracy.** For each note, extract its `> **Script:** path` line (or equivalent) and verify the file exists. Catches renames, moves, and deletions.

**Check 12: Index completeness.** Verify every code-arch note is linked from the index page.

**Check 13: Link-syntax compliance.** If the project bans tool-specific link syntax (e.g., Obsidian `[[...]]`) in portable docs, grep for violations and report. Exempt files marked as host-specific in frontmatter.

**Check 14: Code-arch content drift.** For each note, read the referenced source and compare the note's claims (state owned, key values, responsibilities) against the source's current public surface. Flag items that exist in code but are missing from the note, and items mentioned in the note that no longer exist.

## Output format

One consolidated findings report:

```markdown
# Doc Audit Report — <date>

Mode: full | quick | deep | code-arch
Docs scanned: <count>
Total findings: <count>

## Tier 1 — Mechanical findings

### Check 1: Section-README coverage
- <finding>

### Check 2: Orphaned pages
- <finding>

(continue for checks 3–5)

## Tier 2 — Candidates for user triage

### Check 6: Terminology candidates
- <finding>

### Check 7: Change-log coverage
- <finding>

## Tier 3 — Judgment-level flags

### Check 8: Architecture-doc rhetorical shape
- <finding>

### Check 9: ADR gap from change-log
- <finding>

## Tier 4 — Code architecture (if run)

### Check 10–14: <findings>

## Recommended next actions

- Tier 1 fixes → dispatch `wiki-maintainer` with the confirmed list
- Tier 2 terminology candidates → user picks which to define; `wiki-maintainer` applies
- Tier 2 change-log gaps → user picks which to log; invoke `change-log` skill
- Tier 3 ADR candidates → user picks which to promote; draft in main session
- Tier 4 missing notes / content drift → user picks which to patch; dispatch `wiki-maintainer`

No action is taken until the user confirms which items to pursue.
```

If a tier has no findings, report the tier header with "No findings." rather than omitting it.

## What the skill does NOT do

- Does not edit any doc.
- Does not commit, push, or modify git state.
- Does not dispatch `wiki-maintainer` or any other agent automatically.
- Does not judge whether a term is durable, whether a decision is ADR-worthy, or whether a doc needs updating — proposes candidates only.
- Does not run on a cadence. Invocation-only.
- Does not replace `doc-indexer` Audit mode. Delegates Tier 1 to it and adds Tiers 2–4 on top.

## Interaction flow

1. User invokes `/doc-audit` (full), `quick`, `deep`, or `code-arch`.
2. For Tier 1 checks, dispatch `doc-indexer` in Audit mode and consume its findings.
3. For Tiers 2–4, run inline using Grep, Glob, Read, and git log.
4. Consolidate findings into one report.
5. Present the report to the user; end with the Recommended next actions block.
6. Wait for user triage. Do not proceed to fixes.
7. On user confirmation of specific items, hand off to `wiki-maintainer`, `change-log`, or main-session ADR drafts.

## Boundary with existing agents and skills

- `doc-indexer` owns mechanical vault-health auditing. Tier 1 delegates to it.
- `wiki-maintainer` owns doc-writing. This skill never writes; it hands off confirmed fixes.
- `change-log` owns change-log entry formatting.
- `spec-reviewer` and `pattern-reviewer` operate on code, not docs — unrelated.

## Scope creep guard

If audit findings start implying structural refactor proposals (new doc sections, moving ownership between agents, changing the doc architecture), those belong to `wiki-maintainer` or a durable decision record, not to this skill. The skill surfaces gaps; it does not redesign the surface.
