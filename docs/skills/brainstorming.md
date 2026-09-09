# brainstorming

## What it does

`brainstorming` turns an idea into a design you have approved, through
dialogue that batches independent questions. It explores the current project state, asks
what only you can answer, proposes two or three approaches with a
recommendation, presents the design section by section, self-reviews the
written result, and follows the authorized route or asks for a missing material route choice.

The protocol resolves outcome-changing design decisions before dependent implementation. Existing approval remains valid. A settled design can proceed, while unanswered choices pause only work that depends on them.

The user owns material design and delivery choices. The session presents the design, performs its self-review, and asks for genuinely missing decisions; it does not request the same approval once per section or reopen a settled route.

## When to reach for it

Invoke `/brainstorming` for unresolved feature or refactor design. Ground questions in the repository, and ask for intent, priorities, trade-offs, and constraints that the code cannot establish.

Skip it for confirmed small fixes (a bug an audit already pinned down) and for
work whose design was settled elsewhere.

| The problem | The skill |
| --- | --- |
| An idea to build; a feature or refactor to design | `brainstorming` |
| Something to verify, hunt, or check | `audit` |
| A premise or ticket to prove before acting on it | `claim-check` |
| An unresolved failure requiring investigation | `systematic-debugging` |
| The design is settled; a fresh session should pursue it autonomously | `handoff-goal` (the route gate's third option) |
| Implementing with a test harness | `test-driven-development` |

## Three paths

Before the first question the skill classifies the request and says the
classification out loud, so you can override it. The path decides how much
ceremony follows.

| Path | What it is | What you get |
| --- | --- | --- |
| **Spike** | An explicit feasibility investigation where "quick and dirty is fine" and the output is an answer, not code you keep | The question and probe plan in two or three sentences, resolve any missing probe scope, then findings as a recommendation. Anything built is labelled throwaway. No design doc, no route pick. |
| **Bounded** | A well-scoped change to a flow that already exists in the repo: a new flag, a small endpoint, a one-file fix | The questions that matter, then a short design **in chat**, then resolution of missing material choices, then the authorized route. No design doc. |
| **Architectural** | Substantial unresolved projects/subsystems, changes that restructure how components fit or alter interfaces others depend on | The full sequence: questions, approaches, sectioned design, a written design, self-review, your review, route gate. |

Classification follows actual constraints and interfaces. A small new project can be bounded; a familiar project can be architectural. Reclassify in either direction when evidence changes the required depth.

An explicit implementation request can already settle the design and route. Ask only when a remaining choice would materially change the result, scope, cost, or ownership.

## The dialogue

The subsections below serve the bounded and architectural paths; a spike stops
at the probe. Everything from *Exploring approaches* onward is architectural
depth.

**Understanding the idea.** Check the project state first: files, docs, recent
commits. Then assess scope before spending questions: if the request describes
multiple independent subsystems, that is flagged immediately and the project
gets decomposed into sub-projects before any detail work. Each sub-project then
gets its own design, route, and implementation cycle.

Batch independent questions in one structured prompt. Ask sequentially when a later answer depends on an earlier one. The session answers repository questions itself and uses the user's attention for missing decisions.

**Exploring approaches.** Two or three approaches with trade-offs, presented
conversationally, recommendation first with reasoning. "YAGNI ruthlessly:
remove unnecessary features from every approach and design."

**Presenting the design.** Section by section, each scaled to its complexity:
a few sentences when straightforward, up to 200-300 words when nuanced, with related sections presented together unless a later choice depends on an earlier answer. Coverage:
architecture, components, data flow, error handling, testing.

**Design for isolation.** Units with one clear purpose, well-defined
interfaces, independently testable. The test for a boundary: "Can someone
understand what a unit does without reading its internals? Can you change the
internals without breaking consumers? If not, the boundaries need work."

**In existing codebases.** Follow existing patterns. Where existing code has
problems that affect the work: a file grown too large, tangled
responsibilities: targeted improvements belong in the design, "the way a good
developer improves code they're working in." Unrelated refactoring does not.

**Design self-review**, run on the written design with fresh eyes, four checks,
fixed inline with no second pass:

| Check | Looking for |
| --- | --- |
| Placeholder scan | "TBD", "TODO", incomplete sections, vague requirements |
| Internal consistency | Sections that contradict each other; architecture that doesn't match the feature descriptions |
| Scope check | Focused enough for a single route, or needs decomposition |
| Ambiguity check | Requirements readable two ways: pick one and make it explicit |

**Follow the authorized route, or resolve a missing route choice.** Three routes, presented with a one-line read on
which fits and why:

| Route (user-facing label) | What it means |
| --- | --- |
| **Direct** | Implement straight from this conversation |
| **Plan** | Write one, using your own plan mechanism: a plugin or repo skill, the repo's planning standards, or the harness's plan mode as fallback |
| **Long-running goal** | A contract for a fresh session to pursue autonomously (`handoff-goal`) |

The ask uses a structured question tool (`AskUserQuestion` or the host's
equivalent) when one is available, with the recommended route first and marked
"(Recommended)"; a numbered list otherwise.

## Common questions

**Can independent questions be asked together?**

Yes. Independent questions can share a prompt. Keep dependent questions sequential, and do not ask the user for facts already established by the repository.

**I described a whole platform and it refused to design it.**

Working as intended. "Before asking detailed questions, assess scope: if the
request describes multiple independent subsystems ... flag this immediately.
Don't spend questions refining details of a project that needs to be decomposed
first." You get a decomposition: the independent pieces, how they relate, what
order to build them, and then the first sub-project goes through the normal
flow.

**Where does the design doc go? Is it committed?**

Not by default. "The written design is **disposable working material**: save it
under `.workbench/<work_scope>/` (or `.tmp/workbench/<work_scope>/`), where it
endures only for the duration of the work." It becomes durable only when you
ask, or when the repo has an established design-doc convention, in which case
it goes where that convention says. "Never quietly promote it."

**Does it pick the route for me?**

It follows your authorized route. If a material route choice is missing, it recommends one and asks; it does not ask you to repeat a settled decision.

**The labels and the skill names don't match.**

Deliberate. The gate shows the user-facing labels Direct, Plan, and Long-running goal,
while the third option's skill keeps the name `handoff-goal`. If you find
older material naming the first route something else, that name was replaced by
`direct`; the route's meaning did not change
([decision](../decisions/route-rename-direct-and-structured-gate.md)).

**I came here from an audit. Will it re-ask everything?**

It should not. "Entering from an audit: the findings and the user's confirmed
flags are your context: don't re-derive them." `audit` hands feature- or
refactor-shaped findings into `brainstorming` precisely so the design starts
from settled ground.

**Will it fold in every problem it notices in the surrounding code?**

Only what affects the work. Targeted improvements to code the change touches
are in; unrelated refactoring is out. The wider guard lives in
`using-workbench`: a change that starts crossing owner areas the ask never named
stops and comes back as a rescope question, and adjacent defects get recorded as
follow-up work rather than folded in
([decision](../decisions/scope-guards-q15-q16.md)).

**Can it start coding once I approve the design?**

Yes, after the applicable design steps and necessary decisions are settled, when implementation is already authorized. Architectural work retains its written design and self-review; a bounded change does not acquire those steps just to repeat approval.

## It's working if

- The first thing that happens is the session reading the project, not asking
  you questions it could have answered itself.
- Independent questions are batched; dependent questions remain sequential.
- You see two or three approaches with trade-offs and a stated recommendation,
  not a single proposal presented as the only option.
- Related design sections arrive together; questions identify material unresolved choices.
- The written design has no TBDs, and the session says it ran the self-review.
- Design and necessary decisions are settled before dependent implementation; existing approval and route authorization carry forward.
- Negative signal: dependent implementation starts while an outcome-changing design decision remains unresolved. Also negative: it runs for a confirmed one-line fix that an audit
  already pinned down; that work follows the authorized route.

## Where it fits

`brainstorming` owns the scoping stage of the workbench flow. Both entry doors
feed it: an idea arrives grounded against the codebase, or `audit` hands it
findings and confirmed flags from door A. It hands off at the route gate to
direct implementation, to whatever plan mechanism your stack provides, or to
`handoff-goal` for a contract a fresh session pursues. Downstream of the route
pick sit the implementation disciplines, `test-driven-development` and
`systematic-debugging`; `brainstorming` never reaches them itself.
