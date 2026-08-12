# Decision: `docs/skills/` returns — as a usage handbook, not origin docs

**Date:** 2026-08-12

## Status

Implemented. Partially reverses
[`remove-docs-skills-layer.md`](remove-docs-skills-layer.md), which stays as
the record of why the previous layer had to go.

## Context

Operator call: build a documentation page for every skill shipped in a plugin,
covering what it does, when to reach for it, the questions people actually hit,
and how to tell it worked — with a worked example supplied as the template.

The previous `docs/skills/` was deleted the same week, so this needed care
rather than compliance. Reading the removal note first was the important step:
the layer was not deleted because per-skill pages are a bad idea. It was
deleted because of what those particular pages *were*.

Three failures are recorded there:

1. **They were origin docs.** Per-skill pages sitting next to the spec invited
   restating rationale and history — the same material `docs/decisions/`
   already held.
2. **Parity upkeep multiplied every edit.** A skill change became a doc change,
   and the doc changes kept re-leaking repo bookkeeping (decision-ledger
   numbers, decision links, dates) back toward shipped text.
3. **The prohibition kept being violated minutes after it was stated**, which
   is what escalated it to a structural deletion.

Only the first is inherent to the genre being asked for now. The new pages are
**reader-facing usage documentation** — a different artifact from a rationale
record, aimed at someone deciding whether to invoke a skill, not at a
maintainer reconstructing why it exists. Failure 3 does not apply at all:
bookkeeping was forbidden in *shipped* text, and `docs/` is not shipped.

Failure 2 is real and survives the genre change. It is addressed by rule rather
than hoped away.

## The shape

- **`docs/skills/<name>.md`** — one page per skill shipped in `workbench` or
  `toolkit` (20 pages), plus `docs/skills/README.md` as the index and router.
  Repo-only skills (`change-log`, `push`, `workbench-drift`) get no page; they
  ship in no plugin and adopters never see them. Agents get no page.
- **Fixed section shape**: what it does · when to reach for it (with a routing
  table against real sibling skills) · how it works · common questions · it's
  working if · where it fits.
- **The genre line, stated in governance**: usage only. The moment a page
  starts explaining why a skill exists, what pressure created it, or what
  changed in which release, it has become the deleted layer again. Rationale
  stays in `docs/decisions/`, history in git, releases in
  `docs/change-log.md`.
- **The parity rule, stated explicitly**: when a shipped skill's behavior
  changes, its page changes in the same commit. When page and spec disagree,
  the spec wins and the page is the bug. This is what keeps failure 2 from
  recurring — the burden is acknowledged rather than discovered later.

## Grounding constraint on the content

The supplied template drew much of its value from citing a real public issue
tracker — numbered issues, quoted maintainer replies, named beta-channel
skills. This repo has no such corpus, and imitating one would mean inventing
it. The pages therefore ground their "Common questions" sections in
`docs/decisions/` instead, which is the authentic equivalent: those notes
record real field failures, real pushback, and the amendments that followed.
Writers were instructed to invent no issue numbers, URLs, quotes, or names, and
to write less rather than pad a section they had no material for.

## Governance updated

`CLAUDE.md` (four sites: workflow expectations, source-of-truth boundaries,
add-a-piece steps, and the what-NOT-to-do list), `AGENTS.md` (the "no doc
layer" section, rewritten as "no rationale doc layer"), and `README.md`'s docs
map. Each now draws the same line: usage pages permitted, origin docs still
prohibited, parity obligatory.

## Non-goals

- Not reviving the deprecated origin docs parked in `attic/deprecated/` — those
  stay parked as history.
- Not documenting agents. The review agents' specs remain the whole artifact.
- Not a substitute for `README.md`'s install path or `using-workbench`'s
  in-session orientation. The handbook is for reading, not for loading into a
  session.

## Packaging

Repo-structure and docs change. No plugin payload is touched, so no version
bump and no release-notes entry.
