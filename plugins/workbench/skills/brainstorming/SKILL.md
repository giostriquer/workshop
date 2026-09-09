---
name: brainstorming
description: Use when designing a feature or a refactor and when an idea carries questions the codebase can't answer (intent, preference, trade-offs). Not for confirmed small fixes or work whose design is already settled.
---

# Brainstorming Ideas Into Designs

Help turn ideas into fully formed designs through natural collaborative dialogue.

Start by classifying how much process the request actually needs, then work that
path: understand the context, refine the idea, present a design, get the user's
approval, and hand them the route decision.

**Rule:** resolve outcome-changing design choices before dependent implementation.
Existing approval or a request that already settles the design remains valid; do
not ask again merely because this skill was loaded. Continue independent work
while a needed decision is pending.

## Three paths

Before the first question, classify the request and say the classification out
loud: "this looks bounded, so I'll present a short design here rather than write
one up", so the user can override it.

- **Spike**: an explicit feasibility investigation ("is this feasible?", "quick and
  dirty is fine") whose output is an answer, not code you keep. Present the
  question and what you'll try in two or three sentences, confirm any unresolved scope, then find
  out as cheaply as correctness allows. No design doc. Report findings as a
  recommendation, and label anything you built throwaway.
- **Bounded**: a well-scoped change to code that already exists here: a new
  flag, a small endpoint, a one-file fix. Understanding the *kind* of app is not
  enough: ground the change in actual constraints and interfaces. A small new
  project can also be bounded when those choices are settled. Ask the
  clarifying questions that matter, present a short design **in chat** (a few
  sentences to a few short paragraphs), and ask only for unresolved decisions. No design doc.
- **Architectural**: projects or subsystems with substantial unresolved structure, changes that restructure how
  components fit together or alter interfaces others depend on. The full process
  below: questions, approaches, sectioned design, a written design, self-review.

**Reassess the path from evidence.** Increase or reduce the process when the
actual scope warrants it. Explain a material change in classification; uncertainty
is a reason to inspect the relevant boundary, not automatically choose the heaviest path.

## Where this sits in the workbench flow

- **Scope:** features and refactors with unsettled design choices get this treatment. Confirmed small
  fixes (e.g. a bug an audit already pinned down) skip it; work whose design was
  already settled elsewhere skips it. Entering does not mean the full ceremony:
  the path classification above decides how much, and most bounded work is a few
  questions and a short design in chat.
- **Entering from an idea:** ground the idea first: a couple of questions, most
  answerable from the codebase itself. Brainstorming owns the rest: the
  questions only the user can answer (intent, priorities, taste, constraints the
  code doesn't record).
- **Entering from an audit:** the findings and the user's confirmed flags are
  your context: don't re-derive them.
- **Resolve the route under existing authorization:** **direct** implements from
  session context; **plan** uses the user's planning mechanism (plugin/repo skill,
  repository convention, or harness plan mode); **handoff-goal** packages long-running
  work for a fresh session only when the user invokes it. Follow an already chosen
  route. Otherwise recommend the fit and ask if the choice materially changes
  delivery, cost, or ownership; a routine direct implementation needs no new gate.
- **A spike is the exception**: its terminal state is a reported recommendation,
  not a route pick. There is nothing to route until the user turns the answer
  into work, and that is a fresh pass through this skill.

## Red flags

| Thought | Reality |
|---------|---------|
| "This is too simple to need a design" | Settle any missing behavior or interface choice in a short design; an already settled design can proceed. |
| "I'll call it bounded and skip the write-up" | Justify the scope from actual interfaces and constraints; do not use a label to evade unresolved design. |
| "It's bounded and the design is obvious: I'll start while they read it" | Pause work that depends on an unanswered design decision. Existing settled authorization permits progress. |
| "I understand this kind of app, so it's bounded" | Assess its actual dependencies and choices; familiarity or a new repository alone does not establish complexity. |
| "The spike works, so I'll keep the code" | A spike's output is an answer. Keeping the code is a new request: classify it. |
| "It grew, but I'm almost done: no need to re-classify" | Hidden complexity upgrades the path mid-task. Stop and say so. |
| "They approved the spike, so the follow-up is approved too" | Each task gets its own classification and its own approval. |

## Process

Classify first, announce the path, then work the checklist for that path in
order.

**Spike:** explore just enough to frame the probe → present the question and
probe plan in two or three sentences → resolve missing scope if any → investigate as cheaply as
correctness allows → report a recommendation, labelling anything built
throwaway.

**Bounded:** explore project context (files, docs, recent commits) → ask the
clarifying questions that matter, batching independent ones → present a short
design in chat covering approach, files touched, and testing → resolve any
unanswered outcome-changing decision → follow the authorized route.

**Architectural:** the full sequence below.

```dot
digraph brainstorming {
    "Classify: spike / bounded / architectural" [shape=diamond];
    "Present question + probe" [shape=box];
    "Investigate; report recommendation" [shape=doublecircle];
    "Present short design in chat" [shape=box];
    "Explore project context" [shape=box];
    "Ask clarifying questions" [shape=box];
    "Propose 2-3 approaches" [shape=box];
    "Present design sections" [shape=box];
    "Material choices approved?" [shape=diamond];
    "Write design doc (if repo keeps specs)" [shape=box];
    "Design self-review\n(fix inline)" [shape=box];
    "Further material review needed?" [shape=diamond];
    "Follow authorized route\nask only for a missing choice" [shape=doublecircle];

    "Classify: spike / bounded / architectural" -> "Present question + probe" [label="spike"];
    "Classify: spike / bounded / architectural" -> "Present short design in chat" [label="bounded"];
    "Classify: spike / bounded / architectural" -> "Explore project context" [label="architectural"];
    "Present question + probe" -> "Investigate; report recommendation" [label="approved"];
    "Present short design in chat" -> "Follow authorized route\nask only for a missing choice" [label="approved"];
    "Explore project context" -> "Ask clarifying questions";
    "Ask clarifying questions" -> "Propose 2-3 approaches";
    "Propose 2-3 approaches" -> "Present design sections";
    "Present design sections" -> "Material choices approved?";
    "Material choices approved?" -> "Present design sections" [label="no, revise"];
    "Material choices approved?" -> "Write design doc (if repo keeps specs)" [label="yes"];
    "Write design doc (if repo keeps specs)" -> "Design self-review\n(fix inline)";
    "Design self-review\n(fix inline)" -> "Further material review needed?";
    "Further material review needed?" -> "Write design doc (if repo keeps specs)" [label="changes requested"];
    "Further material review needed?" -> "Follow authorized route\nask only for a missing choice" [label="approved"];
}
```

The subsections below serve the bounded and architectural paths; a spike stops
at "present the probe, resolve missing scope." Everything from **Exploring approaches**
onward adds architectural depth. For bounded work, context plus a few questions
plus a short in-chat design is the whole process.

**Understanding the idea:**

- Check out the current project state first (files, docs, recent commits)
- Before asking detailed questions, assess scope: if the request describes
  multiple independent subsystems (e.g., "build a platform with chat, file
  storage, billing, and analytics"), flag this immediately. Don't spend
  questions refining details of a project that needs to be decomposed first.
- If the project is too large for a single design, help the user decompose into
  sub-projects: what are the independent pieces, how do they relate, what order
  should they be built? Then brainstorm the first sub-project through the
  normal flow. Each sub-project gets its own design → route → implementation
  cycle.
- **Batch independent questions** in one structured prompt. Ask sequentially
  when a later question depends on an earlier answer. Answer from the codebase
  what it can establish; spend the user's attention on missing decisions.
- Prefer multiple choice questions when possible, but open-ended is fine too
- Focus on understanding: purpose, constraints, success criteria

**Exploring approaches:**

- Propose 2-3 different approaches with trade-offs
- Present options conversationally with your recommendation and reasoning
- Lead with your recommended option and explain why
- YAGNI ruthlessly: remove unnecessary features from every approach and design

**Presenting the design:**

- Once you believe you understand what you're building, present the design
- Scale each section to its complexity: a few sentences if straightforward, up
  to 200-300 words if nuanced
- Present related sections together for coherent review; check separately only when later design depends on that answer
- Cover: architecture, components, data flow, error handling, testing
- Be ready to go back and clarify if something doesn't make sense

**Design for isolation and clarity:**

- Break the system into smaller units that each have one clear purpose,
  communicate through well-defined interfaces, and can be understood and tested
  independently
- For each unit, you should be able to answer: what does it do, how do you use
  it, and what does it depend on?
- Can someone understand what a unit does without reading its internals? Can
  you change the internals without breaking consumers? If not, the boundaries
  need work.
- Smaller, well-bounded units are also easier for you to work with; you reason
  better about code you can hold in context at once, and your edits are more
  reliable when files are focused. When a file grows large, that's often a
  signal that it's doing too much.

**Working in existing codebases:**

- Explore the current structure before proposing changes. Follow existing
  patterns.
- Where existing code has problems that affect the work (e.g., a file that's
  grown too large, unclear boundaries, tangled responsibilities), include
  targeted improvements as part of the design: the way a good developer
  improves code they're working in.
- Don't propose unrelated refactoring. Stay focused on what serves the current
  goal.

## After the Design

This section is the **architectural** path. Bounded work has no written design
to document, self-review, or re-approve; it goes from the in-chat design's
approval straight to the route gate at the end.

**Documentation:** the written design is **disposable working material**: save
it under `.workbench/<work_scope>/` (or `.tmp/workbench/<work_scope>/`), where
it endures only for the duration of the work. It becomes a durable, committed
doc only when the user explicitly asks, or when the repo has an established
design-doc convention (then write it where that convention says). Never quietly
promote it.

**Design self-review**: look at the written design with fresh eyes:

1. **Placeholder scan:** any "TBD", "TODO", incomplete sections, or vague
   requirements? Fix them.
2. **Internal consistency:** do any sections contradict each other? Does the
   architecture match the feature descriptions?
3. **Scope check:** is this focused enough for a single route, or does it need
   decomposition?
4. **Ambiguity check:** could any requirement be interpreted two different
   ways? If so, pick one and make it explicit.

Fix any issues inline. No need to re-review: just fix and move on.

**User review:** ask about unresolved material choices before dependent work.
If the user requests changes, apply them and repeat the affected self-review.
Do not re-request approval of an unchanged design already authorized.

**Then follow the authorized route.** When a route decision is still needed,
present the three routes with a one-line recommendation and let the user pick. Ask with a
structured question tool (`AskUserQuestion` or the host's equivalent) when one
is available: user-facing labels, not skill names: **Direct**, **Plan**,
**Long-running goal**, each with a one-line description, the recommended route
first and marked "(Recommended)". Otherwise present the same options as a
numbered list and wait for that needed pick. Once design and route are settled,
continue the implementation already requested.
