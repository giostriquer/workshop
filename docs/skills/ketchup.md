# ketchup

Use `ketchup` when you return to a long-running task and want the meaningful
changes, current status, and decisions that actually need you. Invoke
`/toolkit:ketchup` in Claude Code, or select Ketchup with `$` or `/skills` in
Codex. It is user-invoked only on both hosts; ordinary status questions work
without it.

By default it covers the conversation since your preceding message. You can
give a different range, such as "catch me up since the review started."
Older unresolved decisions still appear. Agent notifications do not reset the
range.

The update opens with the number of human decisions or steps pending, then
gives meaningful results and their consequences. Each decision includes the
options, a recommendation, and what can proceed without your answer. Tests,
retries, and other work the agent can do are kept with the agent.

Current observations, agent reports, running work, and older evidence are
distinguished. A report that tests passed is not a verified result, and checks
on an old PR revision do not prove the new revision. If a state refresh fails,
the update says what remains unknown. Relevant existing visuals may help;
creating a visual is not required.

## Does catching up stop the work?

A standalone catch-up is read-only and ends with the report. During an already
authorized task, the agent gives its update and continues the next permitted
action. A pending decision blocks only work that depends on it. Ask explicitly
to pause or stop when that is what you want. The skill does not interrupt other
agents, post messages, publish changes, or grant new implementation authority.

For a transfer to a new session, use
[`handoff-goal`](handoff-goal.md). For a retrospective on the process, use
[`self-audit`](self-audit.md). Ketchup keeps ownership and scope where they are.

**It's working if:** you can distinguish what is confirmed from what is merely
reported, understand each decision without digging through the transcript,
and see who owns the next step.

**Spec:** [`SKILL.md`](../../plugins/toolkit/skills/ketchup/SKILL.md).
