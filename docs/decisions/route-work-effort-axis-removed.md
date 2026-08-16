# Decision: `route-work` drops the effort axis and gains a speed axis

**Date:** 2026-08-12

## Status

Implemented: ships in `workbench 0.22.0`.

## Context

The operator re-graded the fleet table: the two `gpt-5.6-sol` rows (one for
low/medium, one for xhigh) collapsed into a single `gpt-5.6-sol` row, `grok-4.6`
was added, `fable-5` was re-graded, and a `speed` column appeared.

The table changed grain; nothing around it moved with it. That left the skill
internally contradictory in six places, and the worst of them was not cosmetic:

- The column header still read `model + effort` when no row carried an effort
  tier.
- The frontmatter description (the activation surface) still advertised
  "cost / intelligence / taste / code per model **and effort tier**", omitting
  `speed` and promising a grain the table no longer had.
- The reading notes instructed "**Climb effort before hopping models: sol
  xhigh before leaving the ladder**", naming two rows that no longer existed.
  This is the skill's central operating instruction, and it had become
  unfollowable.
- `speed` arrived undefined while every other axis carried a precise
  definition, and it **double-counted** `cost`, which was explicitly
  "subscription-limit burn **plus wall-clock**". Wall-clock was being scored
  twice.
- The cross-ladder caveat still said "the GPT and Claude rows burn different
  subscriptions", a two-ladder framing that `grok-4.6` broke.
- `docs/skills/route-work.md` still carried the entire old five-row table
  verbatim, plus effort-tier framing in four other places.

## The change

**Effort is no longer a modeled axis.** One row per model, graded at the effort
that model is actually run at. If the habitual effort changes, the row is
re-graded rather than split: stated explicitly in the skill so the grain of
the numbers is not left to inference.

**Cost and speed are separated.** `cost` is now subscription-limit burn alone;
`speed` is wall-clock turnaround. Adding a speed column is precisely the act of
factoring wall-clock out of cost, so leaving cost's old definition intact would
have scored one property on two axes.

**The escalation advice was cut, not relocated.** "Climb effort before hopping
models" depended on a ladder the table no longer has. The *Standing escalation
permission* invariant already covers rerunning a tier up when output misses the
bar, so nothing load-bearing was lost. A new reading note constrains the new
axis instead: speed breaks ties between level rows and never buys a drop on
intelligence, taste, or code.

**The cross-ladder caveat was generalized** from a named two-subscription
framing to any rows drawn from different pools.

`docs/skills/route-work.md` was updated in the same change, per this repo's rule
that a usage page which has drifted from its spec is worse than no page. Its
history-shaped "Common questions" entries were left alone; the one question
added is usage-framed ("What effort should I run these at?") rather than an
account of what changed.

## Not changed

The hard invariants. The model-floor invariant in particular is untouched: an
operator's always-injected rules file points at this skill for the fuller
doctrine, and that pointer still resolves.
