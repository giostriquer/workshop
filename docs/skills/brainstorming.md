# brainstorming

## What it does

`brainstorming` turns an idea into a design you have approved, through
one-question-at-a-time dialogue. It explores the current project state, asks
what only you can answer, proposes two or three approaches with a
recommendation, presents the design section by section, self-reviews the
written result, and stops at a gate where you pick how the work gets
implemented.

It is a dialogue protocol with a hard stop at both ends. The rule at the top is
unambiguous: "no implementation before the design is presented and approved.
Don't write code, scaffold projects, or invoke implementation skills
mid-brainstorm." And the far end is a gate, not a launch: "Brainstorming never
starts the implementation itself."

The skill does not decide anything for you at the boundary moments. The design
needs your approval before it is written up, the written design needs your
review before it proceeds, and the route — direct, plan, or long-running goal —
is "theirs, not yours."

## When to reach for it

Type `/brainstorming`, or let it fire on the situation: designing a feature or
a refactor. In the workbench flow this is not optional — "features and refactors
get this treatment — always." It also fires when an idea carries questions the
codebase cannot answer: intent, priorities, taste, constraints the code does not
record.

Skip it for confirmed small fixes (a bug an audit already pinned down) and for
work whose design was settled elsewhere.

| The problem | The skill |
| --- | --- |
| An idea to build; a feature or refactor to design | `brainstorming` |
| Something to verify, hunt, or check | `audit` |
| A premise or ticket to prove before acting on it | `claim-check` |
| A bug in front of you, before proposing fixes | `systematic-debugging` |
| The design is settled; a fresh session should pursue it autonomously | `handoff-goal` (the route gate's third option) |
| Implementing with a test harness | `test-driven-development` |

## Three paths

Before the first question the skill classifies the request and says the
classification out loud, so you can override it. The path decides how much
ceremony follows.

| Path | What it is | What you get |
| --- | --- | --- |
| **Spike** | A feasibility question — "can we…", "quick and dirty is fine" — whose output is an answer, not code you keep | The question and probe plan in two or three sentences, a nod, then findings as a recommendation. Anything built is labelled throwaway. No design doc, no route pick. |
| **Bounded** | A well-scoped change to a flow that already exists in the repo: a new flag, a small endpoint, a one-file fix | The questions that matter, then a short design **in chat**, then a stop for approval, then the route gate. No design doc. |
| **Architectural** | New projects, new subsystems, changes that restructure how components fit or alter interfaces others depend on | The full sequence: questions, approaches, sectioned design, a written design, self-review, your review, route gate. |

Two rules keep the classifier honest. **Bounded measures the repo, not your
familiarity** — understanding the *kind* of app is not enough; if there is no
existing flow to change, the task is architectural. And **the ratchet is
one-way**: when torn, take the heavier path; hidden complexity found mid-task
upgrades it; nothing downgrades mid-task.

What never scales is the approval. "The ceremony scales with the task; the
approval gate never does" — a two-sentence design still gets presented and
still waits for a yes.

## The dialogue

The subsections below serve the bounded and architectural paths; a spike stops
at the probe. Everything from *Exploring approaches* onward is architectural
depth.

**Understanding the idea.** Check the project state first — files, docs, recent
commits. Then assess scope before spending questions: if the request describes
multiple independent subsystems, that is flagged immediately and the project
gets decomposed into sub-projects before any detail work. Each sub-project then
gets its own design, route, and implementation cycle.

Questions come **one per message** — "if a topic needs more exploration, break
it into several" — and the skill answers from the codebase itself whatever the
codebase can answer, spending your attention only on what it can't. Multiple
choice is preferred where it fits.

**Exploring approaches.** Two or three approaches with trade-offs, presented
conversationally, recommendation first with reasoning. "YAGNI ruthlessly —
remove unnecessary features from every approach and design."

**Presenting the design.** Section by section, each scaled to its complexity —
a few sentences when straightforward, up to 200-300 words when nuanced — with a
check after each section on whether it still looks right. Coverage:
architecture, components, data flow, error handling, testing.

**Design for isolation.** Units with one clear purpose, well-defined
interfaces, independently testable. The test for a boundary: "Can someone
understand what a unit does without reading its internals? Can you change the
internals without breaking consumers? If not, the boundaries need work."

**In existing codebases.** Follow existing patterns. Where existing code has
problems that affect the work — a file grown too large, tangled
responsibilities — targeted improvements belong in the design, "the way a good
developer improves code they're working in." Unrelated refactoring does not.

**Design self-review**, run on the written design with fresh eyes, four checks,
fixed inline with no second pass:

| Check | Looking for |
| --- | --- |
| Placeholder scan | "TBD", "TODO", incomplete sections, vague requirements |
| Internal consistency | Sections that contradict each other; architecture that doesn't match the feature descriptions |
| Scope check | Focused enough for a single route, or needs decomposition |
| Ambiguity check | Requirements readable two ways — pick one and make it explicit |

**The route gate — and stop.** Three routes, presented with a one-line read on
which fits and why:

| Route (user-facing label) | What it means |
| --- | --- |
| **Direct** | Implement straight from this conversation |
| **Plan** | Write one, using your own plan mechanism — a plugin or repo skill, the repo's planning standards, or the harness's plan mode as fallback |
| **Long-running goal** | A contract for a fresh session to pursue autonomously (`handoff-goal`) |

The ask uses a structured question tool (`AskUserQuestion` or the host's
equivalent) when one is available, with the recommended route first and marked
"(Recommended)"; a numbered list otherwise.

## Common questions

**Why one question at a time? It's slow.**

That is the rule, and it comes with a companion that makes it cheaper than it
sounds: the session answers from the codebase whatever the codebase can answer,
so the questions you actually see are the ones only you can settle. If you are
being asked things the repo already records, the skill is being applied badly.

**I described a whole platform and it refused to design it.**

Working as intended. "Before asking detailed questions, assess scope: if the
request describes multiple independent subsystems ... flag this immediately.
Don't spend questions refining details of a project that needs to be decomposed
first." You get a decomposition — the independent pieces, how they relate, what
order to build them — and then the first sub-project goes through the normal
flow.

**Where does the design doc go? Is it committed?**

Not by default. "The written design is **disposable working material** — save it
under `.workbench/<work_scope>/` (or `.tmp/workbench/<work_scope>/`), where it
endures only for the duration of the work." It becomes durable only when you
ask, or when the repo has an established design-doc convention, in which case
it goes where that convention says. "Never quietly promote it."

**Does it pick the route for me?**

No. It recommends one and marks it, then waits. The gate is one of the three
moments in the workbench flow that belong to the user — size the workload, pick
the route, PR or merge.

**The labels and the skill names don't match.**

Deliberate. The gate shows user-facing labels — Direct, Plan, Long-running goal
— while the third option's skill keeps the name `handoff-goal`. If you find
older material naming the first route something else, that name was replaced by
`direct`; the route's meaning did not change
([decision](../decisions/route-rename-direct-and-structured-gate.md)).

**I came here from an audit. Will it re-ask everything?**

It should not. "Entering from an audit: the findings and the user's confirmed
flags are your context — don't re-derive them." `audit` hands feature- or
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

Not from inside the skill. Approval leads to the written design, the
self-review, your review, then the route gate — and there it stops. What
happens next depends on which route you pick.

## It's working if

- The first thing that happens is the session reading the project, not asking
  you questions it could have answered itself.
- Questions arrive one per message.
- You see two or three approaches with trade-offs and a stated recommendation,
  not a single proposal presented as the only option.
- The design arrives in sections, each with a "does this look right so far?"
- The written design has no TBDs, and the session says it ran the self-review.
- The last message is a route question with three options, and nothing has been
  implemented.
- Negative signal: code, scaffolding, or file edits appear before you approved
  the design. Also negative: it runs for a confirmed one-line fix that an audit
  already pinned down — that work skips straight to the route gate.

## Where it fits

`brainstorming` owns the scoping stage of the workbench flow. Both entry doors
feed it: an idea arrives grounded against the codebase, or `audit` hands it
findings and confirmed flags from door A. It hands off at the route gate — to
direct implementation, to whatever plan mechanism your stack provides, or to
`handoff-goal` for a contract a fresh session pursues. Downstream of the route
pick sit the implementation disciplines, `test-driven-development` and
`systematic-debugging`; `brainstorming` never reaches them itself.
