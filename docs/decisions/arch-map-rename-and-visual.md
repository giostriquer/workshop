# Decision: structure-view → arch-map (rename + visual language)

**Date:** 2026-08-05

## Status

Shipped to the toolkit as `arch-map` (`toolkit` `0.16.0`). Canonical:
`plugins/toolkit/skills/arch-map/SKILL.md`.

## Rename

`structure-view` → **`arch-map`**.

- Easier to type.
- Purpose is obvious: produce an architecture map (HTML) of a codebase /
  refactor / proposed design.
- Old name was hard to type and did not read as "architecture overview."

## Visual language (from lived specimen)

Operator iteration on a real cadence overview page
(`tmp/architecture-overview.html`) established the defaults the skill must
encode. Prior same-day dual-grammar rainbow and "quiet light" passes are
superseded.

### Must

1. **Mental model first.** The page opens with a graphical system map
   (SVG layered bands + dependency arrows). Inventory sections come after.
   A page that is only cards/lists without a diagram fails the skill.
2. **Cursor-like dark, high contrast.** Background ~`#181818` / `#1e1e1e`;
   primary text ~`#ececec`; secondary ~`#d4d4d4`; muted only for captions
   ~`#a0a0a0`. Never mid-grey body on near-black.
3. **Typography.** Source Serif 4 (titles) + Source Sans 3 (body) +
   JetBrains Mono (paths). CDNs allowed (fonts, Lucide, Mermaid).
4. **Color is scarce.** Accent `#3794ff` for chrome/emphasis wires.
   Green/red only for ✓/✕ rules and refactor good/bad. No architectural
   role rainbow (entry/domain/infra/ext paints).
5. **Organization via layout.** Stacked bands, sticky TOC, facts grid,
   HTML flow connectors, optional Mermaid for import-rule graphs.
6. **Traceability + provenance** unchanged from the original design of
   record (every box/edge traces to a real path; live `git rev-parse`).

### Reference specimen

`tmp/architecture-overview.html` — match this when no house-style sibling
exists.

## Artifacts

- Canonical: `plugins/toolkit/skills/arch-map/SKILL.md`
- Draft (archaeology): `docs/decisions/arch-map-skill-draft.md`
- Origin: `docs/skills/arch-map.md`
- Former origin → `docs/skills/deprecated/structure-view.md`
- Spec of record (pipeline history): `docs/decisions/structure-view.md`
  + this decision (visual + rename)
