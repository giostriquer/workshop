# using-workbench

Orientation map of the workbench flow — the doors, gates, and completion chain, and
which skill owns each moment. **Workbench-native**; the anti-`using-superpowers`:
it explains on request instead of enforcing at session start. Rationale:
[`workbench-system.md`](../decisions/workbench-system.md).

## Use it

- Trigger: "how does method work?", "what's the flow here?", "which skill do I
  use for X?" — or any session needing orientation before picking a piece.
- It answers three things: the flow at a glance, the moment→skill ownership
  table, and the three user gates (size the workload · pick the route · PR or
  merge).
- It also ships the flow map *inside the plugin payload* — an installed machine
  has the map without cloning agent-workshop.
- Pairs with the rules-layer doctrine snippet
  ([`workbench-doctrine.md`](../workbench-doctrine.md)): the standing rule makes the
  flow exist at session start; this skill carries the detail on demand.

## Don't

- Don't let it act — answering "how does the flow work?" by *starting* the flow
  is the failure mode it exists to avoid.
- Don't wire it to a hook or inject it at session start; that's the
  superpowers dispatcher pattern method deliberately dropped.
- Don't treat it as the canonical model — that's `docs/workbench-flow.md` +
  `.html` in agent-workshop; this is the shipped digest.
