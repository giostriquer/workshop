# Decision: `audit` sizing asks via a structured question and carries a runtime-modality flag

**Date:** 2026-08-12

## Status

Implemented.

## Context

Two gaps in `audit`'s sizing step (step 1), found in an operator review of how
`audit` interacts with `qa-sweep`:

1. **The ask had no mechanics.** "Ask the user to size the workload" left the
   form open: free prose, easy to bury the three tiers or skip the explicit
   pick. Hosts with a structured question tool (Claude Code's
   `AskUserQuestion`) render options far better than prose.
2. **Sizing was breadth-only; modality leaked.** The tier axis (quick look /
   deep / sweep) says nothing about *where the evidence must come from*.
   Runtime verification arrived only by accident of tier: `qa-sweep` is
   runtime by construction, but a runtime-demanding request sized as quick
   look silently became greps, and a deep audit could satisfy `claim-check`'s
   evidence ladder with an in-process repro that never touched the running
   app. Nothing in the protocol detected "this needs the booted app" or asked
   the user about it. The exposed shape: "check whether existing behavior X
   actually works": single-surface, runtime-demanding, too narrow for
   `qa-sweep`'s gate, out of scope for `empirical-proof` (just-finished
   changes only).

## The shape

Both fixes land in `audit` step 1; the engines are untouched (operator
directive: `claim-check` stays as-is).

- **Ask mechanics:** use a structured question tool (`AskUserQuestion` or the
  host's equivalent) when available: one option per tier, the recommended
  tier first and marked; otherwise a numbered list, wait for the pick. The
  recommendation-plus-user-pick rule is unchanged.
- **Runtime modality flag:** when the thing to check is behavior a real
  client can drive (an endpoint, a running-app flow, a CLI), the
  recommendation says so and the same sizing question confirms whether the
  check should drive the booted app. A confirmed runtime check is part of
  the workload handed to the engine: audit passes the modality along as
  scope, it does not add rigor on top (the division-of-labor stance holds).
- Output section now reports the runtime modality alongside the sized tier
  when it was flagged.

## Non-goals

- No change to `claim-check`: the modality confirmation reaches it as
  investigation context, not as new skill text.
- No new tier and no change to the tier→engine mapping.
- The `description` (when to reach for `audit`) is unchanged.

## Packaging

Canonical `plugins/workbench/skills/audit/SKILL.md` edited; origin doc
`docs/skills/audit.md` updated. Ships as `workbench 0.20.3`.
