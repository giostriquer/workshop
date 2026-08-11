# change-log

## Origin

Early in the originating project's life, every model session that landed meaningful work would write its own informal change-log entry — different formats, different levels of detail, different placement in the file. Some entries inlined manual user-side TODOs as if they had landed; others restated critique findings that lived in their own dedicated surface.

The skill formalized the rules: what belongs, what doesn't, how to format, how to handle idempotency, how to flip spec/plan lifecycle when work lands.

## Problem

Three failure modes appeared in pre-skill change-log writing:

1. **What-vs-what-might-belong-elsewhere drift.** Critique findings, calibration narratives, ADR-worthy rationale, and follow-up TODOs all leaked into change-log entries that should have been short factual landings.
2. **Tense / audience drift.** Entries described what *needed to happen next* rather than what *had landed*. Re-grounding readers couldn't tell shipped from planned.
3. **Duplicate entries.** Multiple model sessions in one day produced parallel entries for the same work, fragmenting the log.

The skill enforces structure (one paragraph + optional bullets, idempotent within a date section) and routes overflow content to its proper home (critique, research, ADR, follow-up).

## Solution shape

Workflow: read the diff, identify meaningful changes, read the change-log, decide whether log-worthy, add or amend an entry under the correct section, link to stronger source-of-truth docs when relevant.

**Section keying is repo-dependent** (added 2026-08-11, from this scaffold's own log refactor): a repo whose primary deliverable is a versioned artifact (a plugin, package, extension) keys sections by the **release that ships the change** (`## <artifact> <X.Y.Z> — date`, with `## repo — date` for work no release ships); other repos key by date. A versioned product's log is release notes — "what did 0.18.0 change?" — not a diary.

**Idempotency** is load-bearing: if the target section already contains an entry for the same change, amend it; do not duplicate. This matters most when an agent invokes the skill multiple times during one workflow.

**Spec / plan lifecycle update on landing:** when an entry records a feature shipping, also flip the corresponding spec / plan frontmatter from `status: active` to `status: landed` and `git mv` it to `landed/`. The active spec / plan directories stay scoped to in-flight work.

**Skill-mirror update reminder:** if the change includes editing a skill in `.claude/skills/`, also update the corresponding `.codex/skills/` and `.gemini/skills/` mirrors so all hosts stay in sync.

## Real invocation snippet

Example `CLAUDE.md` line:

```markdown
After meaningful changes, invoke the `change-log` skill to update `docs/change-log.md` (do not edit directly — the skill's "what does NOT belong" guardrails should run on every entry).
```

The skill is also preloaded into `wiki-maintainer` and `visual-implementer` via `skills:` frontmatter, so those agents apply it without an explicit invocation.

## Pitfalls observed

- **Treating the change-log as a session log.** It is not. Critique findings, calibration narratives, multi-paragraph caveats — all have stronger homes elsewhere.
- **Inlining manual user-side TODOs.** "User must wire the prefab; user must import the asset." These belong in `docs/superpowers/followups/<date>-...md`, linked from the entry, not in the entry. The change-log records what *landed*.
- **Forcing entries.** A trivial change does not need an entry. The skill explicitly allows "no entry needed" outcomes.
- **Forgetting idempotency.** Two passes on the same change produce two parallel entries. The skill's idempotency rule says: amend, don't duplicate.
- **Skipping the spec / plan lifecycle update.** Landed work leaves stale `status: active` frontmatter and the active directory keeps growing. The skill folds the lifecycle flip into the same operation.

## Adaptation notes

- The "What does NOT belong here" list is heavily project-specific (mentions critique, research, ADR, follow-ups, agent-audit-log). Adapt to your project's surfaces; the principle is "if the content has a stronger home elsewhere, link to it."
- The spec / plan lifecycle flip is project-specific to projects using a `docs/superpowers/specs/` + `landed/` convention. If your project doesn't track specs and plans this way, drop the section.
- The skill-mirror update reminder applies only to projects that mirror skills across hosts (Codex / Gemini / etc.). Single-host projects can drop the reminder.
- The "Parent wiki impact" note convention is for projects with an upstream wiki layer. If your project doesn't have one, drop it.
- The format (one paragraph + optional bullets, reverse-chronological sections) is the durable shape. Do not let entries grow into tables or subheadings — that's the signal that the content belongs elsewhere.
- Pick the section key by what the repo ships: version-keyed for a versioned deliverable (this scaffold switched 2026-08-11, re-keying its whole history by plugin release), date-keyed otherwise.
