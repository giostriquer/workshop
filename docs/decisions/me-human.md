# Decision: `me-human`: dogfood a system as a real user, not as QA

**Date:** 2026-08-13

## Status

Implemented. Ships as `toolkit 0.6.0`.

## Context

The toolkit and workbench pieces all verify that something **works**:
`empirical-proof` proves one finished change at the running app, `qa-sweep`
covers a broad surface at team scale, `claim-check` settles a premise. None of
them asks whether the thing is any **good to use**: whether a person arriving
without context can get where they were going.

Doing that ad hoc has a dominant failure mode: told to "use the app like a
user," a session reads the source, reasons about what a user *would*
experience, and writes a confident report about a session it never had. The
imagined user reads identically to the real one, which makes it worse than no
dogfooding at all.

## The shape

A user-invoked persona skill. The session adopts a human's stance: eager to
try the system without understanding it first, learning by doing, willing to be
wrong, and reports the experience.

Three behaviors carry it:

- **Try before asking.** "Before asking any question you try urself first."
- **Escalate before declaring a blocker.** A bug means investigate, make a
  targeted local change, report progress, ask whether to continue. Two failed
  attempts → stop and ask, outlining the bug, what was tried, what was learned.
  Reporting a blocker without a retry is explicitly barred.
- **Stop at the scope edge.** Advancing past the given scope is a stop-and-ask,
  not a judgment call.

Output is human-legible by mandate: a concise, precise summary of findings,
recommendations, and next steps, in plain language.

## Non-goals

- **Not QA.** The skill says so directly: a plan run against expectations is a
  different activity from a person pursuing a goal and noticing what hurt.
- **Not an implementation pass.** Local unblocking changes only, each reported
  immediately.
- **No tooling in the skill.** It states the stance; the operator supplies the
  target system, the entry point, the goal, and the driving mechanism at
  invocation. Naming a concrete mechanism (browser automation, computer use)
  would couple a portable stance skill to one modality and break it on hosts
  that lack it: the same line `empirical-proof` holds when it says "boot it,
  hit its endpoints" without naming a tool.

## Open thread

The modality question is deliberately unresolved rather than settled. Two
candidates for the skill text, both portable and neither yet written:

- A **front-door rule**: reach the system the way a user has to (its UI, its
  CLI, its documented entry), never through internals or test harnesses. Told
  to "use the app," a session will otherwise satisfy that by calling the app's
  internals.
- A **reach-the-system ladder**: prefer the project's own documented way to
  run it, then the ecosystem default for that project type, then ask.

Both are behavioral invariants rather than tooling, so they would not cost the
portability the non-goal protects. Left out of the first release pending real
runs.

## Packaging

`toolkit 0.6.0`. Usage page: `docs/skills/me-human.md`.
