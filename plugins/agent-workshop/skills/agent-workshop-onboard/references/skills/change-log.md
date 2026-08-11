---
name: change-log
description: Use when meaningful changes have been made to the repository and should be recorded in docs/change-log.md — covers architecture decisions, implementation milestones, durable direction changes, workflow or agent setup, and meaningful test surface changes. Not for formatting edits, trivial refactors, or scratch work that did not land.
---

# Change Log

Update `docs/change-log.md` with concise, durable entries for meaningful repository changes.

## Workflow

1. Read the current diff or otherwise identify the meaningful changes to record.
2. Read `docs/change-log.md` before editing.
3. Read only the minimum supporting docs needed to summarize the change accurately.
4. Decide whether the change is log-worthy (see below).
5. If it is, add or update an entry under the correct date section.
6. Keep the entry short, factual, and link-oriented.

## What belongs in the log

Add entries for changes that materially affect:

- project scope or framing
- repo structure or documentation routing
- architecture direction
- durable product / domain direction
- major implementation milestones
- meaningful test surface changes
- local agent or workflow setup that affects future work

Usually skip:

- formatting-only edits
- tiny refactors with no durable consequence
- import shuffles
- local scratch work that did not land meaningfully

## Entry rules

- Prefer one grouped entry for related work over many tiny entries.
- Keep entries concise.
- Use concrete names from the repo.
- Link to stronger source-of-truth docs when relevant.
- If the change may matter to an upstream / parent wiki, add a brief `Parent wiki impact:` note inside the entry.
- If there is nothing meaningful to log, say so instead of forcing an entry.

## Spec / plan lifecycle update on landing

When the change-log entry records a feature landing (work shipped), also move the corresponding spec and plan to their `landed/` subfolders so the active spec / plan directories stay scoped to in-flight work.

For each spec or plan referenced in the new change-log entry:

1. **Update its frontmatter `status:` field** from `active` to `landed`. Use the Edit tool on the file.
2. **Move the file** from `docs/superpowers/specs/<date>-<slug>.md` to `docs/superpowers/specs/landed/<date>-<slug>.md` (or plans equivalent) using `git mv` to preserve history.
3. **Update the change-log entry's links** so they point at the new `landed/` paths.

If the entry is a **partial landing**, keep the spec / plan in active and note "partial landing — spec/plan stays active pending followup completion." The status flips to `landed` only when all in-scope followups close.

If the entry covers **work that has no associated spec / plan** (diagnostics-only, agent governance, doc-routing fixes), this section does not apply.

If you encounter an old spec / plan still in active that should have been moved, it is acceptable to opportunistically update its frontmatter and move it as part of the current entry's pass. Do not force a sweep — only fix what the current entry naturally touches.

## Skill mirror update reminder

If the change being recorded includes an edit to `.claude/skills/<name>/SKILL.md`, also update `.codex/skills/<name>/SKILL.md` and `.gemini/skills/<name>/SKILL.md` (and any other host mirrors the project supports) so all skill-supporting hosts stay in sync. The project's skill-parity convention should describe how to verify mirroring (e.g., a `scripts/skill-parity.ps1` script).

## What does NOT belong here

Some content has a stronger home elsewhere. Link to it from the entry instead of restating it:

- Critique findings, manual outcomes, and next-step proposals → `docs/critique/<date>-...md`
- Calibration journeys, multi-run probe narratives, directional studies → `docs/research/<date>-...md`
- Per-run snapshots, anomaly rates, and aggregate tables → `docs/diagnostics/<tool>/` or the equivalent diagnostics surface
- Decision rationale and alternatives considered → `docs/decisions/NNN-...md` (ADR)
- Spec design intent and success-criteria text → `docs/superpowers/specs/<date>-...md`
- Deferred ideas and lifecycle status → `docs/future-ideas/<theme>.md`
- Manual scene wiring, asset imports, or any "do this next" checklist for the user → `docs/superpowers/followups/<date>-...md`. The change-log records what *landed*; sentences describing what the user must still do belong in a follow-up file linked from the entry.
- Pure agent governance changes with no implementation-process consequence → `docs/agents/agent-audit-log.md`. Workflow-rule changes that affect day-to-day implementation work still belong in the change-log because re-grounding readers need to see them; in those cases write both an audit-log entry and a brief change-log entry pointing at it.

A typical change-log entry is one short summary paragraph plus optional bullets. If an entry needs subheadings, tables, or multi-paragraph caveats, the detail probably belongs in a linked surface — link to it instead.

Before saving an entry, sanity-check tense and audience: every sentence should describe what shipped at landing time, not what remains to be done. If a sentence describes a TODO, an authoring step, or a wiring instruction, extract it to a follow-up file and link instead.

## When invoked by another agent

When this skill is called by a repo-local agent (such as `wiki-maintainer`) rather than directly by the user, the caller has typically already identified the meaningful changes:

- Trust the caller's pre-read diff context if provided. Still read `docs/change-log.md` itself before editing.
- Skip re-classifying the change if the caller has already flagged it as meaningful. If the change turns out to be trivial after all, still return a no-entry-needed outcome — do not force an entry.
- Return a short confirmation to the caller when done: the date section touched, the entry title, and a one-line note on what was added or amended. If no entry was needed, say so explicitly.

## Format

Sections run newest-first. How they are keyed depends on what the repository ships:

- **Versioned-product repos** — the primary deliverable is a versioned artifact (a
  plugin, package, or extension): key each section by the **release that ships the
  change** — `## <artifact> <X.Y.Z> — YYYY-MM-DD` — one section per released
  version, entries as `###` titles inside it. When the change being recorded bumps
  a version, create that version's section at the top and put the entry there.
  Work that ships in no release (packaging, repo structure, docs-only) goes under
  a `## repo — YYYY-MM-DD` section in chronological position. Companion-artifact
  bumps that merely ride the release (mirror re-syncs) are noted inside the entry,
  not given their own section.
- **Date-keyed repos** (everything else): key sections by date — `## YYYY-MM-DD`.
  If today's section exists, append a new titled entry there; if not, create it
  near the top.

**Idempotency:** if the target section already contains an entry with the same title or covering the same change, amend that entry rather than adding a duplicate.

```md
## toolkit 1.4.0 — YYYY-MM-DD    (versioned-product repo)
## YYYY-MM-DD                    (date-keyed repo)

### Short title

One short summary paragraph.

- Optional supporting bullet
- Optional supporting bullet

Parent wiki impact:
- Optional note if cross-project relevance
```

## Scope

- Operates on the current project repo only.
- Does not update upstream / parent wikis — flag impact with the `Parent wiki impact:` note and let the user decide when to escalate.
- Does not commit or push unless explicitly asked.
