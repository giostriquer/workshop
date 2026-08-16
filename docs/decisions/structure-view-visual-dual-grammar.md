# Decision: structure-view visual language: dual layout grammars

**Date:** 2026-08-05

## Status

**Superseded same day** by quiet pass, then by
[`arch-map-rename-and-visual.md`](arch-map-rename-and-visual.md). Historical
specimen: `tmp/2026-08-05-structure-view-visual-specimen.html`. Role-rainbow
dual grammars rejected by operator.

## Context

The skill was withdrawn 2026-07-31 after first real use: output was not
glanceable. Operator diagnosis (2026-08-05): the major failure is
**readability of structure**: containment, edges, and change state all fail
to pop equally. Aesthetic uniqueness is secondary; pages are local
orientation artifacts. Prefer **dual mode**: containment stays nested;
flow/refactor go edge-heavy on purpose.

## Decision

Replace the single visual shell (bands + thin left accent + faint SVG) with
**four view-typed layout grammars**:

| View | Grammar |
|---|---|
| Containment / layers | A · strata: stacked bands, nest groups, no SVG by default |
| Flow | B · wires: swimlanes + thick labeled SVG (≥2.75px) |
| Before / after | C · linked panes: fill+badge delta chrome |
| Delta overlay | D · delta: one canvas, unchanged dims hard |

Shared: higher-contrast role rails + washes; change chrome outranks role;
mandatory trimmed legend; provenance; invariant on refactor pages.

## Spec / draft updates

- `docs/decisions/structure-view-skill-draft.md`: Visual language + Reference
  markup rewritten for dual grammars; specimen path cited as house-style
  fallback match target.
- Specimen HTML encodes all four grammars as the working version to open and
  critique.
- Pipeline, traceability, checklist, and packaging stay as in
  `docs/decisions/structure-view.md` (design of record unchanged except
  visual language).

## Non-goals this pass

- Re-shipping into `plugins/toolkit` (still parked until the specimen
  survives real use).
- Mermaid / auto-layout as primary path.
- Light theme.
