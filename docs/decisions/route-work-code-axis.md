# Decision: route-work: fourth axis (code), Opus 5 row, Opus 4.8 retired

**Date:** 2026-07-31

## Status

Implemented.

## Context

Opus 5 launched 2026-07-24 ($5/$25 per MTok: half of fable-5's sticker; AA
Intelligence Index 61 to fable's 60; SWE-bench Pro ~79% vs fable's 80.0% and
sol's 64.6%). The operator's positioning: sol-ultra-class intelligence, near-
fable coding, taste a point under fable, burn a point better than sol at
ultra/max.

Under the three-axis table that row is inexpressible: opus-5 would land at
intelligence 8 / taste 8.5: numerically identical to gpt-5.6-sol ultra/max
except cost, with its actual distinguishing strength (a ~15-point SWE-bench
Pro gap over sol) invisible. The new row also exposed a latent conflation:
the *taste* column claimed to cover "UI/UX, code quality, API design, and
copy" while the rubric's taste-surface axis is explicitly user-facing only.

## Decision

1. **Add a fourth axis, `code`**: coding craft, SWE-bench-anchored. Most
   dispatches are implementation work, so this is arguably the most
   load-bearing column.
2. **Narrow `taste` to user-facing surfaces** (UI/UX, copy, API shape, docs
   voice), resolving the conflation and aligning the column with the
   rubric's taste-surface axis.
3. **Add the `opus-5` row** at cost 5 / intelligence 8.5 / taste 8.5 /
   code 9. It becomes the Claude-side lane for everything opus-4.8 held
   (implementer, Agent/Workflow fan-outs, courier duty) plus the
   near-frontier code route.
4. **Remove the `opus-4.8` row.** Operator's call: with opus-5 in the fleet,
   nothing routes to it. Dead lanes leave the table rather than lingering
   "for reference": a stale row is the failure the skill exists to kill.
5. **Note the cross-ladder subscription caveat** in the calibration notes:
   GPT and Claude rows burn different subscription pools, so a row that
   dominates on paper does not retire its counterpart.

Values were operator-confirmed per the skill's own rule (proposal → operator
corrections → freeze). The correction round: opus-5 intelligence 8 → 8.5;
fable-5 code 9.5 → 9 (the two tie on code); sol xhigh and ultra/max code
7.5 → 8; opus-4.8 removed entirely.

## Ripple

- Rubric taste-surface line drops the opus-4.8 borderline case; sol and
  opus-5 (8.5) carry most surfaces.
- *From grades to a route*: "one axis warm" gains the code-warm branch (the
  step after the sol ladder is opus-5, not more sol effort); "high ambiguity
  or silent failure" routes to the frontier *band*: fable-5 for judgment
  and taste, opus-5 when the hard part is the implementation.
- Dispatch mechanics note that the Agent/Workflow `opus` param resolves to
  the newest Opus the harness ships; pin a full model ID on older harnesses.
- Hard-invariant sentence "anything that must be Claude runs on opus-4.8 or
  fable-5" becomes "opus-5 or fable-5": updated in **both** mirrors (the
  skill and the operator's always-injected rules file), per the invariants'
  own change-both-or-neither rule.
- Origin doc `docs/skills/route-work.md` updated: four axes, the
  taste-conflation lesson, and the rows-leave-the-table principle.

## Packaging

- Canonical (only) copy at `plugins/toolkit/skills/route-work/SKILL.md`.
- `toolkit` `0.14.0` → `0.14.1` (content change = patch bump) in the three
  plugin manifests and the Claude marketplace entry.

## Non-goals

- No sixth rubric axis for code: the rubric grades the *task*; the code
  column is weighed at route-selection time (implementation work reads the
  code column the way user-facing work reads taste). The three-line output
  contract is unchanged.
- No portable "correct" values: as ever, adopters swap rows for their own
  fleet and re-grade.
