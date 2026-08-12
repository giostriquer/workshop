# Decision: the change-log becomes bounded release notes

**Date:** 2026-08-12

## Status

Implemented. Supersedes the format half of
[`change-log-version-keyed.md`](change-log-version-keyed.md) (version-keyed
sections stay; everything else tightens).

## Context

Operator call: `docs/change-log.md` had grown to ~1,140 lines across 57
sections reaching back to the pre-plugin era (`reviewers`, pre-split
`toolkit`), mixing plugin releases with `## repo` sections and multi-paragraph
narratives. The requirements: strictly the plugins we ship, release-notes
style, and a hard stop on indefinite growth.

## The shape

- **Release notes, plugin releases only.** One `## <plugin> x.y.z — date`
  section per released version, newest first; inside, one bullet per change
  with a bold lead and a decision-note link for rationale. `## repo` sections
  are gone — repo-only work lives in `docs/decisions/` and the git log.
- **Retention cap: 15 sections.** Adding a section past the cap deletes the
  oldest; git history preserves everything dropped.
- **The reformat itself:** the 8 current-era sections (`workbench 0.20.0`
  through `0.20.5`, `toolkit 0.1.0`/`0.1.1`) were converted to bullets;
  everything older — the `reviewers` and pre-split `toolkit` identities plus
  all `repo` sections — was dropped (git history keeps the full text).
- **The `change-log` skill rewritten** (`.claude/` canonical, `.codex/`
  mirrored) to enforce the format: no-bump-no-entry, bullets not narrative,
  the cap enforced on every addition, repo-only asks redirected to
  `docs/decisions/`. `CLAUDE.md` / `AGENTS.md` self-application wording
  updated to match.

## Non-goals

- No file rename — `docs/change-log.md` keeps its path (the `push` skill and
  root docs reference it); only the content contract changes.
- Decision notes are unchanged as the rationale home; the release notes link
  to them.

## Packaging

Repo-structure change, no plugin release — which, under the new rules, is
exactly why this decision gets no release-notes entry.
