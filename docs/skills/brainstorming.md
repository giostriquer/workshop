# brainstorming

Collaborative design dialogue that turns an idea into an approved design, ending
at the user's route pick. Derived from
[obra/superpowers](https://github.com/obra/superpowers) (MIT, Jesse Vincent);
adapted per [`workbench-system.md`](../decisions/workbench-system.md) — pipeline exit
replaced by the route gate, visual-companion subsystem not carried.

## Use it

- Trigger: before designing any feature or refactor (method runs it always
  there), and when an idea carries questions the codebase can't answer.
- The load-bearing patterns: ground against the codebase first and spend the
  user's attention only on what the code can't answer · one question per
  message · 2–3 approaches with a recommendation · YAGNI ruthlessly · present
  the design in sections, approval per section · design self-review, then user
  review gate.
- It ends at the route gate: direct / plan / handoff-goal — recommended in one
  line, picked by the user via `AskUserQuestion` when available (numbered list
  otherwise), with user-facing labels: **Direct**, **Plan**, **Long-running
  goal** — the recommended route first and marked.
- Example: "let's add per-project rate limiting" → grounds in middleware code,
  asks the four unanswerable questions, two approaches, sectioned design,
  approval → route gate: Direct / Plan (Recommended) / Long-running goal.

## Don't

- Don't implement, scaffold, or invoke implementation skills mid-brainstorm —
  no code before an approved design.
- Don't drag confirmed small fixes or pre-settled designs through it — those
  skip straight to the route.
- Don't re-derive audit findings when entering from door A; they arrive as
  context.
- Don't ask what a grep would answer.
- Don't pick the route for the user or start the work after they pick.
