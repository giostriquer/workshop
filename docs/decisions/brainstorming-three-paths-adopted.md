# Decision: adopt upstream's three-path classifier into `brainstorming`

**Date:** 2026-08-12

## Status

Implemented. Completes the v6.2.0+1 → v6.3.0 drift review.

## Context

The first release-boundary drift review reported one adopted piece changed
upstream: `skills/brainstorming/`. Reading the diff rather than the commit
messages (the workflow's own rule) showed a change that is easy to
misclassify.

Upstream added a **three-path classifier**. Before the first question, the skill
sorts the request into *spike* (a feasibility question whose output is an answer,
not code), *bounded* (a well-scoped change to a flow already in the repo), or
*architectural* (new subsystems, restructuring, interface changes others depend
on). Each path carries its own checklist and its own terminal state. Alongside it
came a one-way ratchet rule, a red-flags table aimed at the classifier's failure
modes, and per-path checklists.

The reflex classification for a superpowers change is "pressure tuning: ignore."
That would have been wrong here. This change makes the skill **lighter**: it
exists so a one-file fix stops receiving the ceremony designed for a new
subsystem. Our local copy applied the architectural path to everything, which is
exactly the over-ceremony complaint the workbench fork otherwise guards against.
Adopting it serves the fork's own purpose.

## What was adopted, and what was adapted on the way in

Adopted: the three paths, the one-way ratchet ("when torn, take the heavier one;
hidden complexity upgrades mid-task; nothing downgrades"), the red-flags table,
the per-path checklists, and the reframed anti-pattern: the artifact scales with
simplicity, the approval never does.

Adapted, per the filter:

- **Terminal states retargeted.** Upstream ends the architectural path at
  `writing-plans` and the bounded path at "implement directly, no plan document."
  `writing-plans` is a dropped piece here, and "implement directly" would bypass
  the route gate: one of workbench's three user gates. Both bounded and
  architectural paths now terminate at the **route gate**; the path shapes only
  the recommendation (bounded usually wants *direct*, architectural usually wants
  *plan* or *handoff-goal*).
- **Spike given an honest exit.** A spike produces an answer, so there is nothing
  to route. Its terminal state is a reported recommendation; turning the answer
  into work is a fresh pass through the skill.
- **After-the-Design scoped to the architectural path**, so bounded work is not
  dragged into writing a design doc, self-reviewing it, and re-approving it.
- **Voice**: "your human partner" → "the user", matching the rest of the file.

Ignored:

- **The upstream description**, still `"You MUST use this before any creative
  work"`. That is the compulsion framing the fork exists to remove, and it
  contradicts `using-workbench`'s "skills fire on relevance, never on
  compulsion." Ours stays defanged.
- **`visual-companion.md`** changed upstream but was never carried here. We ship
  `SKILL.md` alone, so the change is irrelevant to our copy.

## Cost

`brainstorming` grows 1,197 → ~1,950 words. That is a real increase, and the
capability is the justification. One duplication introduced by the adoption was
cleaned up in place: "one question at a time" briefly appeared four times, and
the redundant pair in *Understanding the idea* was collapsed. The standing audit
finding that this file carries ~250 further trimmable words was **not** actioned,
that remains a follow-up, not part of a behavioral adoption.

## The pin

Advanced to **v6.3.0** (`b36e0829`): the first pin to land on a release
boundary. The assertion is now true across the whole range: brainstorming
reviewed and adopted, `writing-skills` re-mirrored, the other four adopted pieces
unchanged upstream in the range, dropped-piece churn reviewed as FYI with every
disposition standing, zero unmapped entries. A re-run reports "up to date."

## Packaging

`workbench` `0.20.12` → `0.21.0`: a minor bump rather than a patch, since the
classifier changes how the skill behaves on every invocation. The docs page
`docs/skills/brainstorming.md` was updated in the same change, per the parity
rule.
