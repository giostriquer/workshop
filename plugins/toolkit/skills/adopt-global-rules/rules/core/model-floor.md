# Model floor: Haiku's lane

Haiku (currently Haiku 5.5, `claude-haiku-5-5`) has one narrow lane: tasks that
are high-volume and cost-sensitive, and whose output condenses or looks up
something that already exists.

- **Summaries** of existing text.
- **Compactions** of a context, transcript, or log.
- **Database queries** that fetch and report data.

Never route complex work to Haiku: coding, code review, auditing, profiling,
debugging, planning, design, or judging another agent's output. Schema,
migration, and query-performance work is coding or profiling, not a database
query. A task that mixes the lane with complex work is complex: summarizing a
diff *and* flagging its bugs is a review. Volume and budget never move a task
into the lane: a mechanical edit across 400 files is still coding. When the fit
is unclear, the task is outside the lane.

This applies everywhere a model can be chosen: subagent `model:` fields,
Agent/Workflow model overrides, `--model` flags, SDK calls, background tasks,
and dispatched executors.

- Anything that must run on Claude inherits the session model unless an
  explicit model is selected. Haiku is only ever selected explicitly, for a
  task in its lane.
- If existing config, an agent definition, or a tool default would select
  Haiku for work outside its lane, override it upward without asking.
- Cheapness justifies Haiku inside its lane and nowhere else. If output quality
  from any model misses the bar, escalate to a stronger model without asking.

The fuller routing doctrine (the fleet table and the routing invariants)
lives in the `workbench:model-reference` skill. This file exists to keep
Haiku's lane always-injected.
