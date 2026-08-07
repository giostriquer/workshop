# Decision: arch-map visual language → idoso

**Date:** 2026-08-07

## Status

Shipped into `plugins/toolkit/skills/arch-map/SKILL.md` (`toolkit` `0.16.1`).

## Context

After shipping arch-map on the Cursor-dark specimen
(`tmp/architecture-overview.html`), operator iteration produced a final
visual pattern nicknamed **idoso**: deep near-black gradient, glass cards,
Inter + JetBrains Mono, sky accent, scarce emerald/rose. Lived specimens:

- `tmp/cadence-overview-idoso.html` (subsystem + SVG mental model)
- `tmp/forge-architecture-cadence-idoso.html` (refactor Today|Target graph)

These supersede the Cursor `#181818` / Source Serif defaults encoded at
ship time (`arch-map-rename-and-visual.md`).

## Decision

Encode **idoso** as the rigid fallback visual language in `arch-map`:

1. Mental model / compare graph first (unchanged requirement).
2. Deep-dark gradient `#020408` → `#050811` + subtle sky neon; glass panels
   (`rgba(10,15,26,.75)`, white/7% border, heavy shadow, blur 20).
3. Inter + JetBrains Mono only (drop Source Serif).
4. Accent `#38bdf8` / protocol `#7dd3fc`; green/red only for ✓/✕ and
   refactor chrome; no role rainbow.
5. Glass hero with emerald eyebrow + discrete fact tiles.
6. Refactor pages: rose/emerald bordered panes, chips, HTML connectors.
7. English-only chrome/copy; CDNs for fonts, Lucide, Mermaid, optional Tailwind.
8. Step 0 house-style still wins when a sibling arch page exists.

Pipeline / traceability / provenance / view economy unchanged.

## Artifacts

- Canonical skill: `plugins/toolkit/skills/arch-map/SKILL.md`
- Specimens: `tmp/cadence-overview-idoso.html`,
  `tmp/forge-architecture-cadence-idoso.html`
- Prior visual decision (superseded for chrome): `arch-map-rename-and-visual.md`
