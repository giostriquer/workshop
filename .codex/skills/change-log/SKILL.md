---
name: change-log
description: Use when a change ships in a plugin version bump (workbench, toolkit) and needs its release-notes entry in docs/change-log.md. Not for repo-only work (structure, docs, decisions — those live in docs/decisions/ and git history), formatting edits, or scratch work.
---

# Change Log — the plugins' release notes

`docs/change-log.md` is a **release-notes file** for the shipped plugins:
one section per released version, newest first, bounded length. It is not a
repository history — `docs/decisions/` and the git log own that.

## Rules

- **Plugin releases only.** A section exists because a plugin version
  shipped (`## workbench x.y.z — YYYY-MM-DD`, `## toolkit x.y.z — …`).
  Repo-only work gets no section, ever. If asked to log repo-only work,
  say the release notes don't record it and point to `docs/decisions/`.
- **Release-notes style.** Inside a section: one bullet per change, opening
  with a **bold lead phrase**, 1–4 tight sentences. Link the decision note
  for rationale — never restate it. No TODOs, no next-steps, no authoring
  narrative.
- **One section per version.** Several changes shipping under one bump are
  bullets in the same section. If the section already covers the change,
  amend the bullet instead of adding a duplicate.
- **Retention cap: 15 sections.** After adding a section, count the `## `
  sections; delete the oldest beyond 15. Git history preserves everything —
  the file must not grow indefinitely.
- Ground every bullet in the actual diff at landing time.

## Workflow

1. Identify the version shipping the change (the bumped version in the
   plugin manifests). No bump → no entry.
2. Read `docs/change-log.md`.
3. Add the version section at the top (or amend it if this version's
   section already exists), one bullet per change.
4. Enforce the retention cap.

## When invoked by another agent

Trust the caller's pre-read diff context; still read the file before
editing. Return a short confirmation: the section touched, the bullet
added or amended — or that no entry was needed (no version shipped).

## Scope

- Operates on this repo's `docs/change-log.md` only.
- Does not commit or push unless explicitly asked.
