# Decision: trim six toolkit skill descriptions to trigger-only (SDO pass)

**Date:** 2026-08-11

## Status

Implemented (2026-08-11). Routing probe 8/8; `validate-native-plugin.ps1` passes.
Ships in the unreleased `toolkit 0.20.0` batch — no separate bump.

## Context

A boot-context analysis of the toolkit plugin measured what a fresh session pays
for the skill/agent listing: ≈ 3,166 tokens, of which six legacy skills with
paragraph-length descriptions carried ≈ 1,447 — `handoff-goal` (1,364 chars!),
`route-work`, `qa-sweep`, `empirical-proof`, `arch-map`, `claim-check`. The
workbench port had just adopted `writing-skills`, whose SDO section names this
exact pattern as a defect, not just a cost: descriptions that summarize workflow
get *followed instead of the body being read* (upstream observed an agent doing
one review because the description said so, when the body required two), and
should state triggering conditions only, under ~500 chars.

## Decision

Rewrite the six descriptions to **triggers + disambiguation only**: every "use
when" condition and NOT-for sibling pointer kept (qa-sweep ↔ empirical-proof ↔
claim-check; arch-map ↔ doc-to-html), every workflow summary cut (fan-out
mechanics, output shapes, file paths, delivery modes, visual-style detail — the
bodies carry all of it). Key one-line boundaries kept where they gate invocation
("never dispatches", "never pursues the goal itself", "never implements the
fix"). Result: 299–429 chars each.

**Verification:** a fresh-context routing probe — the six new descriptions (+
`doc-to-html` for the disambiguation pair) against eight scenarios including
both traps (a markdown report must route to doc-to-html, not arch-map; an
exploratory "look into X" must route to *none*, not handoff-goal) — scored 8/8.

## Effect

Boot cost of the six: ≈ 1,447 → ≈ 535 tokens. Plugin listing total: ≈ 3,166 →
≈ 2,254 tokens (−29%), paid per session per machine. `ui-demo-video` (570
chars) was left as the next-largest and is within tolerance; trim later if it
grows.

## Non-goals

- No body changes — this pass touched frontmatter descriptions only.
- No method-set changes — those descriptions were written trigger-only from
  birth.
