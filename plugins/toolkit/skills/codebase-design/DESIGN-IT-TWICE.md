# Design It Twice

When the user wants to explore alternative interfaces for a chosen deepening candidate, use this parallel sub-agent pattern. Based on "Design It Twice" (Ousterhout): your first idea is unlikely to be the best.

Uses the vocabulary in [SKILL.md](SKILL.md): **module**, **interface**, **seam**, **adapter**, **leverage**.

## Process

### 1. Frame the problem space

Before dispatching sub-agents, write a user-facing explanation of the problem space for the chosen candidate:

- The constraints any new interface would need to satisfy
- The dependencies it would rely on, and which category they fall into (see [DEEPENING.md](DEEPENING.md))
- A rough illustrative code sketch to ground the constraints, not a proposal, just a way to make the constraints concrete

Show this to the user, then immediately proceed to Step 2. The user reads and thinks while the sub-agents work in parallel.

### 2. Dispatch sub-agents

Dispatch 3+ sub-agents in parallel. Each must produce a **radically different** interface for the deepened module. On a host without sub-agents, write the designs yourself one after another, each against its own constraint, and don't revise an earlier design to look like a later one.

Prompt each sub-agent with a separate technical brief (file paths, coupling details, dependency category from [DEEPENING.md](DEEPENING.md), what sits behind the seam). The brief is independent of the user-facing problem-space explanation in Step 1. Give each agent a different design constraint:

- Agent 1: "Minimize the interface: aim for 1–3 entry points max. Maximise leverage per entry point."
- Agent 2: "Maximise flexibility: support many use cases and extension."
- Agent 3: "Optimise for the most common caller: make the default case trivial."
- Agent 4 (if applicable): "Design around ports & adapters for cross-seam dependencies."

Include both [SKILL.md](SKILL.md) vocabulary and the project's domain vocabulary
in each brief. Reuse the glossary path already resolved by the caller; otherwise
follow the shared [glossary lookup](../domain-modeling/CONTEXT-FORMAT.md#locate-the-glossary).
Pass the exact selected path, or its absence, so each sub-agent uses the same
`GLOSSARY.md`, legacy `CONTEXT.md`, or repo-specific location. A design exercise
does not create a glossary. Tell each agent to produce the strongest design its
constraint allows and not to hedge toward the others: the differences between
designs are what the comparison runs on, and a second flavour of one shape adds
nothing.

Each sub-agent outputs:

1. Usage first: two or three realistic call sites showing how callers use the module, written before the interface
2. Interface (types, methods, params, plus invariants, ordering, error modes), derived from that usage; where the two disagree, change the interface, not the usage
3. What the implementation hides behind the seam
4. Dependency strategy and adapters (see [DEEPENING.md](DEEPENING.md))
5. Trade-offs: where leverage is high, where it's thin
6. One plausible mistaken local edit, the ownership/interface/check that prevents it, and how to verify rejection while preserving valid callers; label proposed checks as unrun

### 3. Present and compare

Present designs sequentially so the user can absorb each one, then compare them in prose. Contrast by **depth** (leverage at the interface), **locality** (where change concentrates), **seam placement**, and whether a contributor with partial context can preserve the contract. Apply the four checks in `codebase-design`'s partial-context section; preserve required compatibility and distinct adapters.

After comparing, give your own recommendation: which design you think is strongest and why. If elements from different designs would combine well, propose a hybrid. Be opinionated: the user wants a strong read, not a menu.
