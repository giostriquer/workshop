# me-human

## What it does

`me-human` puts the session in the stance of a **human user putting a system to
real work**: someone eager to try it, who does not understand it yet, who
learns by doing and is willing to be wrong. Not a QA pass, not a test suite: a
person who wants the thing to make their day easier and reports what got in the
way.

Three behaviors carry it:

| Situation | What it does |
| --- | --- |
| A question comes up | Tries it first. "Before asking any question you try urself first." |
| A bug blocks progress | Investigates, makes a targeted local change, reports progress, and asks whether to keep going. Two failed attempts → stop and ask, outlining the bug, what was tried, what was learned. Never reports a blocker before retrying with escalation. |
| The work drifts past the given scope | Stops and asks, outlining what it was trying to do, what it has done, what it learned. |

It is **user-invoked only** (`disable-model-invocation: true`).

## When to reach for it

Type `/me-human` when you want to find out what your system is actually like to
use: a new skill, a plugin, a CLI, an app, a workflow you just built. It fits
the moment after "it works" and before "it's good."

| The problem | The skill |
| --- | --- |
| What is this thing like to actually use? | `me-human` |
| Does this finished change work at the running app? | [empirical-proof](empirical-proof.md) |
| Broad QA coverage over a release or surface | [qa-sweep](qa-sweep.md) |
| Does this specific claim hold? | [claim-check](claim-check.md) |

## Common questions

**How is this different from QA?**

The skill draws the line itself: "You are not just a QA, just a Tester per se,
you are a human who is eager to try using this system as it would help you in
your day to day work." QA runs a plan against expectations. This runs a *goal*
against a system and notices what hurt on the way: the confusion, the dead
end, the retry, the thing that was obvious only in hindsight.

**Do I have to tell it what to run and how?**

Yes. The skill defines the **stance**, not the mechanism. You must supply the
system, entry point, goal to pursue, and the surfaces it is allowed to drive
supply when you invoke it. Give it a real goal rather than "try the app": the
friction shows up on the way to something.

**Will it fix what it finds?**

Only the small, local, unblocking kind: a targeted change to see whether that
advances it, reported to you immediately with a request to continue. It is not
an implementation pass, and it stops at the scope edge rather than growing the
work.

**It stopped and asked instead of pushing through.**

That's the design. Scope drift and a second failed fix attempt are both defined
stop-and-ask points. What it should never do is stop *before* trying: "Do not
stop or report a blocker before attempting a retry with escalation."

**What does the output look like?**

A concise, precise summary (findings, recommendations, next steps) in plain
language, organized as bullets or a numbered list, with key points and action
items highlighted. Written to be read by a person, not parsed.

## It's working if

- It went and used the thing, and the report is about an experience rather than
  about the code.
- Bugs arrive with a retry already attempted and the escalation described.
- It asked you before crossing the scope you gave it.
- The findings are things a real user would have hit, in the order they hit them.
- Negative signal: a report assembled from reading the source. That is the
  failure mode this skill exists to replace: an imagined user reads exactly
  like a real one.

## Where it fits

Outside the workbench flow, pointed at whatever you built. Its neighbors verify
that something *works*: [empirical-proof](empirical-proof.md) proves one
finished change at the running app, [qa-sweep](qa-sweep.md) covers a broad
surface at team scale. `me-human` asks the question none of them do: whether
the thing is any good to use.
