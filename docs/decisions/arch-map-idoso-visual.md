# Decision: arch-map visual language → deep-dark glass

**Date:** 2026-08-07
**Amended:** 2026-08-07 (package self-containment)

## Status

Shipped into `plugins/toolkit/skills/arch-map/` (`toolkit` `0.16.3`).

## Context

After shipping arch-map on a Cursor-dark specimen, operator iteration produced
a final visual pattern (deep near-black gradient, glass cards, Inter +
JetBrains Mono, sky accent, scarce emerald/rose). Early skill text pointed at
workshop-local `tmp/*.html` specimens and private nicknames — those paths and
names do **not** ship with the plugin, so an adopting install would treat the
style guidance as a no-op.

## Decision

1. Encode **deep-dark glass** as the rigid fallback visual language in
   `arch-map` (tokens unchanged: `#020408`→`#050811`, glass panels, Inter +
   JetBrains Mono, sky accent, scarce green/red).
2. Ship sanitized worked specimens **inside the skill package**:
   - `references/subsystem-specimen.html`
   - `references/refactor-specimen.html`
3. Skill text is the complete contract (tokens, scraps, fit rules). Do **not**
   ship a layout harness with the plugin — fit is enforced by construction and
   checklist spot-checks. Workshop-only harness tooling may live under
   `scripts/arch-map-harness/` for skill maintenance.
4. Step 0: match an adopting project's house-style sibling if present;
   otherwise copy structure/tokens from the shipped specimens.
5. Skill text must not reference workshop-only `tmp/` paths or private domain
   project names.

Pipeline / traceability / provenance / view economy unchanged.

## Artifacts

- Canonical skill: `plugins/toolkit/skills/arch-map/SKILL.md`
- Specimens: `plugins/toolkit/skills/arch-map/references/*.html`
- Prior visual decision (superseded for chrome): `arch-map-rename-and-visual.md`
