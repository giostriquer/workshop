# Decision: mirrored pieces may carry recorded `localDeltas`

**Date:** 2026-08-12

## Status

Implemented: the `writing-skills` description delta ships in `toolkit 0.3.1`;
the manifest, script, and skill changes are repo-only.

## Context

The operator edited `writing-skills`' frontmatter description to add "auditing
existing skills" to its trigger list. That skill has `disposition: mirrored` and is
copied byte-for-byte from upstream `obra/superpowers`, exempt from the adaptation
filter, with drift handling defined as *re-mirror, not judge-and-adapt*
([decision](writing-skills-mirrored-verbatim.md)).

So the edit was not merely against policy; it was **ephemeral**. The next
re-mirror re-copies the upstream tree wholesale and the word disappears, with
nothing anywhere to say it had been deliberate.

Three ways out were considered. Reverting loses a trigger the operator wants.
Flipping the disposition to `adopted` reopens the whole adaptation filter for
this piece, precisely the fork whose partial port caused the dangling
`examples/CLAUDE_MD_TESTING.md` pointer. The third is to keep the mirror and
record the exception, which is what was chosen.

## The change

The manifest entry keeps `disposition: mirrored` and gains a **`localDeltas`**
array: one entry per deliberate divergence, each naming the file, the change,
the upstream text it departs from, and the reason.

Recording it in data alone was not sufficient. `drift-check.mjs` prints
`adaptations` only inside the *Review required* block; its **Re-mirror** section
printed nothing but paths and a changed-file count. A delta recorded there would
have been invisible at the exact moment it mattered: during the re-copy that
destroys it. The script now carries `localDeltas` into the remirror result and
prints them under the Re-mirror heading, flagged as re-apply-or-lose.

`workbench-drift` step 5 states that re-applying the deltas is part of the
re-mirror rather than a follow-up, and that a re-mirror ending without them has
silently reverted an operator decision.

## The bound

The list is a recorded exception, not a reopened fork. The skill says so
directly: keep it to a few lines, and if it grows past that, the piece wants the
`adopted` disposition instead. Without that bound `localDeltas` becomes a fork
maintained in a JSON field, which is strictly worse than an honest one.

## Verification

Driven end-to-end against a fixture upstream repo (two tagged releases, a pin on
the older one, a mirrored piece carrying one delta) via the script's `--manifest`
and `--cache` overrides. The Re-mirror section rendered the delta with its
re-apply warning. The no-delta path is guarded by `?.length` against the `null`
the mapper writes when the field is absent.
