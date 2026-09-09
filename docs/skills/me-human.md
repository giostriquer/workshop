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
| A question comes up | Tries it first. "Try the task yourself before asking questions the system can answer." |
| A bug blocks progress | Try a supported correction only under existing repair authority, report the result, and continue within scope. Escalate concrete access/sandbox failures under governing rules, not every app bug. |
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

The skill follows a real user task and reports friction instead of aiming for a QA coverage plan. It adopts an end-user perspective without denying assistant identity or claiming to be human.

**Do I have to tell it what to run and how?**

Yes. The skill defines the **stance**, not the mechanism. You must supply the
system, entry point, goal to pursue, and the surfaces it is allowed to drive when you invoke it. Give it a real goal rather than "try the app": the
friction shows up on the way to something.

**Will it fix what it finds?**

Only under existing repair authority. A supported local correction can unblock the task; report its result and continue within scope. Dogfooding alone does not authorize code changes or require a fresh permission question after every supported step.

**It stopped and asked instead of pushing through.**

Try a supported correction within already-authorized repair scope, report the result, and continue. Escalation is for a concrete access/sandbox restriction under governing rules, not every application bug. A dogfooding-only request does not authorize code changes.

**What does the output look like?**

A concise, precise summary (findings, recommendations, next steps) in plain
language, organized as bullets or a numbered list, with key points and action
items highlighted. Written to be read by a person, not parsed.

## It's working if

- It went and used the thing, and the report is about an experience rather than
  about the code.
- Failures report supported attempts and concrete missing capabilities; privilege escalation is used only when applicable.
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
