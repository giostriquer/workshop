# using-workbench

Session-start orientation map of the workbench flow — doors, the three user
gates, moment→skill ownership — and the on-demand answer to "how does this flow
work?". Surfaces at conversation start for discoverability (the description is
the trigger; no hook); **orients, never coerces**. **Workbench-native**;
rationale: [`workbench-system.md`](../decisions/workbench-system.md).

## Use it

- Triggers: conversation start (skim the map, invoke the owning skill when the
  task matches a moment), and direct questions — "how does the workbench flow
  work?", "which skill do I use for X?".
- It answers three things: the flow at a glance, the moment→skill ownership
  table, and the three user gates (size the workload · pick the route · PR or
  merge).
- It also carries the session-conduct conventions: flow artifacts are
  disposable, and worktrees follow the repo/user convention — absent one,
  `<repo>/.worktrees/<task-name>`, never the system temp directory.
- And the verification picker: one line per verification-adjacent piece
  (always-on gate · single change · broad sweep · premise · landing), chosen
  by the work's shape — plus the principle for work no frame fits: keep the
  evidence standard, drop the frame. Checkpoints, not reading assignments.
- Cost/authority rule (Q14): `verification-before-completion` is the only
  always-on piece; `empirical-proof` and `qa-sweep` are expensive tiers —
  offered, never defaulted to; they run on explicit ask or standing
  authorization.
- Session-start behavior is orientation with an opt-out built in: skills fire
  on relevance; a skill that turns out wrong for the situation isn't followed.
- Pairs with the rules-layer doctrine snippet
  ([`workbench-doctrine.md`](../workbench-doctrine.md)): the standing rule and
  this skill carry the same map at different depths.

## Don't

- Don't let it act — answering "how does the flow work?" by *starting* the flow
  is the failure mode it exists to avoid.
- Don't reintroduce compulsion language (MUST-invoke, no-choice framing) — the
  session-start trigger is the discoverability mechanism; relevance is the
  invocation mechanism.
- Don't treat it as the canonical model — that's `docs/workbench-flow.md` +
  `.html`; this is the shipped digest.
