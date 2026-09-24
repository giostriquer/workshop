# grilling

## What it does

`grilling` is the interview loop behind [grill-me](grill-me.md) and the
decision step of [improve-codebase-architecture](improve-codebase-architecture.md).
It maps the subject as a **design tree**, where every decision branches into
the decisions that hang off it, and interviews you branch by branch until
nothing is left silently assumed.

Three ideas carry it:

| Term | Meaning |
| --- | --- |
| **Frontier** | Every decision whose prerequisites are already settled: the only questions that can honestly be asked yet |
| **Round** | One frontier, asked in full, each question numbered with a recommended answer; then it waits |
| **Facts vs decisions** | Facts from the environment are the agent's to look up, through a sub-agent where the host has one; decisions are yours, and it waits for them |

The session ends when the frontier is empty and you confirm you share an
understanding. It does not act before that.

## When to reach for it

It is model-invocable: the agent reaches for it when you ask to be grilled or
to have a plan stress-tested, and the toolkit's entry points load it by name.
You rarely type it; [grill-me](grill-me.md) is the front door that the agent
never fires on its own. Type `/grilling` directly when you want the bare
interview from inside another task.

| The problem | The skill |
| --- | --- |
| Stress-test a plan, decision, or idea before acting on it | `grilling` (or [grill-me](grill-me.md)) |
| Design a feature or refactor into an approved design and a route | [brainstorming](brainstorming.md) |
| Walk the decisions on a deepening candidate you picked from an architecture survey | `grilling`, loaded by [improve-codebase-architecture](improve-codebase-architecture.md) |

[brainstorming](brainstorming.md) proposes approaches and a design of its own
and ends at a route pick. `grilling` proposes only recommended answers to your
decisions and ends at shared understanding, with no design document and no
route.

## Common questions

**Why a whole round at once instead of one question at a time?**
A round holds only questions that do not depend on each other, so no answer in
it can invalidate another question in it. Your answers then reshape the next
round. The frontier is the agent's judgement, not a computed graph: if an
answer should have changed a question in the same round, say so and that
branch reopens. One question at a time is a supported preference; ask for it.

**Why does every question carry a recommendation?**
So you can answer by number ("1 yes, 2 the second option, 3 no, because...")
and spend your attention on the answers you disagree with.

**It answered its own question and moved on.**
That is a failed run, not a liberal reading. Decisions are yours; tell it to
put the decision to you.

**Another plugin also ships a `grilling` skill.**
The toolkit entry points load `toolkit:grilling` by its plugin-prefixed name on
Claude Code and Codex. On OpenCode, skill names must be unique across scanned
directories, so load one set.

## It's working if

- Rounds are numbered, each question with a `➡️` recommendation.
- Later rounds ask things the first round could not have.
- Research running in the background does not stall the questions that do not
  depend on it.
- It stops and asks you to confirm before acting.

## Where it fits

A primitive, kept in one place so every skill that needs an interview uses the
same one. [grill-me](grill-me.md) is its user-invoked front door, and
[improve-codebase-architecture](improve-codebase-architecture.md) runs it once
you have picked a candidate.

`grilling` ships in the optional **toolkit** plugin. Its
[canonical skill](../../plugins/toolkit/skills/grilling/SKILL.md) is the
authority for behavior.
