# arch-map: decisions in force

This note is the rationale for the `arch-map` skill, shipped in the `toolkit` plugin; superseded choices are omitted and git history keeps the originals.

## A sibling that derives rather than renders (2026-07-31)

The operator repeatedly wanted to see structure, most often a refactor in flight, and the report renderer (now `html-report`) could not take that job without dissolving its never-invent contract. `arch-map` authors the representation itself from an existing subsystem, a refactor diff or a proposed design, and renders one self-contained HTML page. The line between the two siblings is who authors the content, and each description points at the other.

## Traceability and provenance carry the page (2026-07-31)

Every observed box and edge traces to a real file, symbol or diff hunk; proposed elements trace to the plan, render dashed and never mix silently with observed structure. This is the architectural form of never inventing a number. Each view is footed with what it was derived from and the commit, read live at generation time, because orientation pages go stale and the stamp says stale as of what.

## Economy keeps it glanceable (2026-07-31)

A page shows at most three supporting views, each opening with the question it answers, and about thirty boxes per view, grouped beyond that. Every refactor page states its invariant, what does not change, as the most orienting fact. Process rules come from the report renderer: one pass, a direction change is a clean rewrite, one knob at a time. Pages are orientation aids first and are promoted to a durable location only when asked or conventional, after provenance is rechecked.

## Renamed arch-map, mental model first (2026-08-05)

`structure-view` was hard to type and did not read as an architecture overview; `arch-map` names what it produces. Iterating on a real page settled that it opens with a graphical mental model, a layered system map or a Today|Target graph for refactors, before any inventory; a page of only cards and lists fails. Color is scarce: an accent for chrome and emphasis wires, green and red only for rule verdicts and refactor good or bad, and no palette by architectural role, because role colors on top of change colors made both harder to read. Layout carries organization through stacked bands, a sticky contents nav, fact tiles and HTML flow connectors.

## Deep-dark glass, shipped inside the package (2026-08-07)

The visual language is a near-black gradient canvas, translucent glass panels and a sky accent, with bright body text and muted grey kept for captions. Earlier skill text pointed at workshop-local specimens and private names that never ship, so on an adopting install the style guidance was a no-op. The skill text is now the complete contract (tokens, markup scraps, fit rules), and sanitized subsystem and refactor specimens ship in its `references/` folder. Step 0 matches the adopting project's own architecture page when one exists, otherwise the specimens. Fit is enforced by construction and checklist spot-checks; the layout harness stays workshop-only.
