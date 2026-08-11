# Model routing — hard invariants

Full table + routing rubric: invoke `toolkit:route-work` (agent-workshop
toolkit) with the task description before dispatching non-trivial work. The
canonical model × effort table lives in that skill and only there — this file
deliberately carries no table, so it cannot go stale.

The invariants (mirrored in the skill; change both places or neither):

- **Never use Haiku or Sonnet — any task, no exceptions.** Bulk/mechanical
  work routes to the GPT ladder via `codex exec`; anything that must be
  Claude runs on opus-5 or fable-5.
- **Orchestration stays home.** Decomposing, dispatching, and judging a set
  of work always run on the session's own model — the strongest available —
  never a weaker-model subagent; the `orchestrate` skill carries the
  doctrine and discovers `codex-implement` for dispatch mechanics.
- **Standing permission to escalate.** If a cheaper model's output doesn't
  meet the bar, rerun or redo the work with a smarter model without asking.
  Judge the output, not the price tag — escalating costs less than shipping
  mediocre work.
- **Cost is a tie-breaker only.** When axes conflict for anything that
  ships, intelligence > taste > cost.
- Repo-local model policies (e.g. conosterm's CLAUDE.md) override this file
  where they conflict.
