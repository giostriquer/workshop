# Decision: the first route is `direct`, and the route gate asks like the sizing question

**Date:** 2026-08-12

## Status

Implemented.

## Context

Two operator calls on the route gate (the user pick that ends `brainstorming`
and the confirmed-fix exit of `audit`):

1. **The first route's original name, "rawdog", is removed.** The term is
   borrowed slang with a sexual origin that survived sanitization by
   oversight ("I forgot to remove"). It named the implement-straight-from-
   session route across skills, manifests, READMEs, flow diagrams, and the
   doctrine snippet. Candidates considered: freehand, direct, freestyle,
   straight-shot — operator picked **`direct`**.
2. **The route gate gets the same ask mechanics the audit sizing question got
   in 0.20.3**: a structured question tool (`AskUserQuestion` or host
   equivalent) when available, numbered-list fallback — with **user-facing
   labels, not skill names**: Direct, Plan, Long-running goal (the
   `handoff-goal` skill keeps its name; only its option label is friendly),
   recommendation first and marked.

An earlier same-day patch making the audit sizing ask conditional was
reverted before landing — the operator judged the mandatory ask and the
tier offer fine as shipped in 0.20.3; only the route-gate items above stand.

## The shape

- Rename swept everywhere the term appeared (15 occurrences): `brainstorming`,
  `audit`, `using-workbench` skill texts; all four manifests' descriptions;
  the workbench README; `docs/skills/` pages; the flow diagram (`.md` mermaid
  and `.html`); the doctrine snippet; the `workbench-system.md` ledger.
- Collision fix riding along: "implementation agency (direct vs agentic)"
  phrasing became "in-session vs dispatched" in the three places it appeared,
  so the route name `direct` stays unambiguous.
- Route-gate mechanics added at both gates: `brainstorming`'s "Then the route
  gate — and stop" carries the full text; `audit`'s confirmed-fix exit
  references the same shape.

## Non-goals

- `handoff-goal` (skill and route id) is not renamed — "Long-running goal" is
  presentation only.
- No behavior change to what the routes mean or when the gate fires.

## Packaging

Ships as `workbench 0.20.4`. Origin docs updated in step
(`docs/skills/brainstorming.md`); git history necessarily retains the old
term, the working tree does not.
