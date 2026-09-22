# brainstorming

## What it does

`brainstorming` turns an idea into an approved design through dialogue. It
classifies how much process the request needs, reads the project, asks what
only you can answer, proposes approaches with a recommendation, presents the
design, then follows the authorized route or asks for a missing one. Design
choices that change the outcome are settled before dependent implementation;
existing approval stays valid.

## When to reach for it

Invoke `/brainstorming` when designing a feature or refactor, or when an idea
carries questions the codebase can't answer: intent, preference, trade-offs.
Skip it for confirmed small fixes (a bug an audit already pinned down) and for
work whose design is already settled.

| The problem | The skill |
| --- | --- |
| An idea to build; a feature or refactor to design | `brainstorming` |
| Something to verify, hunt, or check | `audit` |
| An unresolved failure requiring investigation | `systematic-debugging` |
| A settled design a fresh session should pursue autonomously | `handoff-goal` (user-invoked) |

## Three paths

Before the first question it classifies the request and says so out loud, so
you can override it.

| Path | What it is | What you get |
| --- | --- | --- |
| **Spike** | An explicit feasibility investigation ("quick and dirty is fine"); the output is an answer, not code | The probe in two or three sentences, then a recommendation. Anything built is throwaway. No design doc, no route pick. |
| **Bounded** | A well-scoped change to existing code (a flag, a small endpoint, a one-file fix), or a small new project with settled choices | Key questions, a short design **in chat**, then the route. No design doc. |
| **Architectural** | Substantial unresolved structure, or changes to interfaces others depend on | Questions, approaches, a sectioned and written design, self-review, your review, the route. |

Classification follows actual constraints and interfaces, not familiarity with
the kind of app. It reclassifies in either direction when evidence changes the
needed depth, and says so. Keeping a spike's code is a new request, classified
fresh.

## The dialogue

Bounded work stops at context, a few questions, and the in-chat design;
approaches onward are architectural depth.

**Understanding the idea.** It reads files, docs, and recent commits first. A
request spanning multiple independent subsystems is flagged immediately and
decomposed before any detail work; each sub-project gets its own design, route,
and implementation cycle. Independent questions are batched, dependent ones
stay sequential, and anything the codebase can establish it answers itself.

**Exploring approaches.** Two or three, with trade-offs, recommendation first.
"YAGNI ruthlessly."

**Presenting the design.** Sections scaled to complexity, related sections
together, covering architecture, components, data flow, error handling, and
testing. Units get one clear purpose and well-defined interfaces. In existing
code it follows existing patterns.

**Design self-review.** The written design is checked for placeholders,
internal consistency, scope, and ambiguity, and fixed inline with no second
pass.

**The route.** When a route decision is still needed:

| Route | What it means |
| --- | --- |
| **Direct** | Implement from this conversation |
| **Plan** | Use your planning mechanism: a plugin or repo skill, repo standards, or harness plan mode |
| **Long-running goal** | `handoff-goal`: a contract a fresh session pursues autonomously |

The recommended route comes first, marked "(Recommended)".

## Common questions

**I described a whole platform and it refused to design it.**

As intended: independent subsystems get decomposed first into pieces, their
relations, and a build order. The first sub-project then goes through the
normal flow.

**Where does the design doc go? Is it committed?**

Not by default. It is disposable working material under
`.workbench/<work_scope>/`, made durable only when you ask or the repo has a
design-doc convention.

**Does it pick the route for me?**

It follows a route you already chose. Otherwise it recommends one and asks
when the choice materially changes delivery, cost, or ownership
([decision](../decisions/workbench-operator-decisions.md)).

**I came here from an audit. Will it re-ask everything?**

No. The audit's findings and your confirmed flags are its context; it does not
re-derive them.

**Will it fold in every problem it notices in the surrounding code?**

Only what affects the work. Targeted improvements to code the change touches
are in; unrelated refactoring is out. The scope is yours to set in the ask.

**Can it start coding once I approve the design?**

Yes, when implementation is already authorized and the necessary decisions are
settled. Architectural work keeps its written design and self-review first.

## It's working if

- It announces the path before the first question.
- It reads the project before asking questions it could answer itself.
- You see two or three approaches with a recommendation, not a single option.
- The written design has no TBDs, and the self-review ran.
- Negative signal: dependent implementation starts while an outcome-changing
  decision is unresolved, or full ceremony runs for a fix an audit already
  pinned down.

## Where it fits

`brainstorming` owns the scoping stage of the workbench flow. Both entry doors
feed it: a grounded idea, or `audit` findings. It hands off at the route to
direct implementation, your plan mechanism, or `handoff-goal`, upstream of
`test-driven-development` and `systematic-debugging`.
