# grill-me

## What it does

`grill-me` interviews you about a plan, design, decision, or idea until you and
the agent share one understanding of it. It runs the [grilling](grilling.md)
interview: rounds of numbered questions, each with the agent's recommended
answer, and each round asking only what your earlier answers have unblocked.
It writes no files and produces no plan. What it leaves is a sharper version of
the idea, and the decisions you made along the way.

It is **user-invoked only** (`disable-model-invocation: true`, plus
`allow_implicit_invocation: false` for Codex): the agent never starts one on
its own.

## When to reach for it

Type `/grill-me` (`/toolkit:grill-me` in Claude Code, `$toolkit:grill-me` in
Codex, when another plugin also ships a `grill-me`) followed by the idea. You
do not need a worked-out plan: a loose idea is what the session is for. The
subject does not have to be code: a product direction, a hiring call, or a
piece of writing grills just as well.

It sits next to [brainstorming](brainstorming.md), which also asks you
questions. The difference is who ends up holding the design:

| What you have | Reach for |
| --- | --- |
| A plan or idea of your own you want pressure-tested before you commit to it | `grill-me` |
| A feature or refactor to design, ending in an approved design and an implementation route | [brainstorming](brainstorming.md) |
| A codebase whose structure you want surveyed for refactors | [improve-codebase-architecture](improve-codebase-architecture.md) |
| A settled design a fresh session should carry out alone | [handoff-goal](handoff-goal.md) |

Brainstorming drives toward its own proposal: it sizes the process, reads the
project, offers approaches with a recommendation, presents a design and asks
for the route. Grilling never proposes the design as a deliverable. It keeps
asking until every branch of your decision tree is visited, you make every
decision, and it stops when you confirm the understanding is shared.

## Common questions

**How many questions should I expect?**
Count rounds, not questions. Dozens of questions across three or four rounds
is an ordinary session. It ends when nothing is left silently assumed and you
say the understanding is shared.

**Can I go back to one question at a time?**
Yes. Say so in the session, or add a line such as "When grilling, ask one
question at a time." to your own instructions file.

**It asked me something it could have looked up.**
That is a miss. Facts about files, tools, and docs are the agent's job; only
decisions are yours. Tell it to look.

**It started building after the last round.**
It should not: the session waits for your confirmation before acting on
anything. Say "not yet" and it goes back to the open branches.

**What if I don't know the answer?**
Say so. "I don't know" is a real answer. A question you cannot settle by
talking (how a screen should feel, which layout reads better) usually needs a
throwaway prototype rather than another round.

**I also have the `mattpocock-skills` plugin installed.**
Both plugins ship `grill-me` and `grilling`. Claude Code and Codex prefix
plugin skills with the plugin name, so the two sets coexist, and the toolkit
entry point loads `toolkit:grilling`. OpenCode requires skill names to be
unique across every directory it scans, so point it at one set, not both.

## It's working if

- Each round arrives as numbered questions, each with its recommendation on a
  separate `➡️` line, and you can answer the whole round by number.
- Nothing in a round needs another question in the same round answered first,
  and later rounds ask things the first could not have.
- It looks facts up instead of asking you for them.
- You disagreed with at least one recommendation.
- It stops at the end and asks you to confirm, instead of starting work.

## Where it fits

A standalone you can run anywhere, outside the workbench flow. What you grilled
can feed [brainstorming](brainstorming.md) or a spec afterward, in the same
conversation, so the context you built carries over.

`grill-me` ships in the optional **toolkit** plugin. Its
[canonical skill](../../plugins/toolkit/skills/grill-me/SKILL.md) is the
authority for behavior.
