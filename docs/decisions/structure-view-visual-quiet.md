# Decision: structure-view visual — quiet change language

**Date:** 2026-08-05 (supersedes dual-grammar color-heavy pass same day)

## Status

**Superseded 2026-08-05** by
[`arch-map-rename-and-visual.md`](arch-map-rename-and-visual.md) (Cursor-dark
mental-model specimen `tmp/architecture-overview.html`). Kept as the
intermediate step that killed the role rainbow: layout + good/bad only.
Preferred reference at the time:
`tmp/example-architectural-view-work.html`.

## What worked in the preferred example

- **Binary change signal** — good / bad (and dim for background). Not four
  role colors plus three change colors fighting on every card.
- **Layout is the structure** — side-by-side Today|Target panels, vertical
  stacks, HTML connectors (line + label + arrow), boxes of chips.
- **Dense names as chips** — monospace atoms; the eye compares sets, not
  painted modules.
- **One quiet chrome accent** — eyebrows / stage numbers only.

## What failed in the dual-grammar pass

- Role rails (entry/domain/infra/ext) + change fills + wire colors =
  noise. Organization and change both got harder to read.
- SVG edge overlays on already-dense canvases competed with content.

## New rules (quiet)

1. Neutral surfaces only for structure (bg / surface / raised / line).
2. Color is reserved for **change or verdict**: good, bad, optionally move
   (one amber). No architectural-role palette on modules.
3. Prefer HTML flow connectors over SVG graphs. SVG only when a flow view
   truly needs cross-lane wires — and then one wire color, hot on focus.
4. Compare panes for refactors; stacked boxes for subsystem maps.
5. Taste = spacing, type, and hierarchy — not more hues.

## Artifacts

- Polished reference + restyled real pages land under `tmp/2026-08-05-*-quiet.html`
  (or overwrite the earlier same-day dual-grammar files once accepted).
