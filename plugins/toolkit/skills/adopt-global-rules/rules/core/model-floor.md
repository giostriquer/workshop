# Model floor — hard invariant

**Never route any work to Haiku or Sonnet — any task, any context, no
exceptions.** This applies everywhere a model can be chosen: subagent `model:`
fields, Agent/Workflow model overrides, `--model` flags, SDK calls, background
tasks, and dispatched executors.

- Anything that must run on Claude uses the session's own model or Opus —
  default to inheriting the session model unless explicitly told otherwise.
- If existing config, an agent definition, or a tool default would select
  Haiku or Sonnet, override it upward without asking.
- Cheapness is never a justification. If output quality from any model misses
  the bar, escalate to a stronger model without asking.

The fuller routing doctrine — the fleet table and the routing invariants —
lives in the `workbench:route-work` skill. This file exists only to make the
Haiku/Sonnet ban unconditional and always-injected.
