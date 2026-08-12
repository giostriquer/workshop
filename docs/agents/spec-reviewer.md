# spec-reviewer

## Origin

In the originating project, several implementation tasks shipped where the *implementation* was correct against what the implementer thought the spec said but *wrong* against what the spec author intended. The semantics looked obvious in the spec to the author but were ambiguous on a fresh read. The bug was caught in code review or critique — late, expensive, sometimes after a wrong feature shipped.

`spec-reviewer` was introduced as a **pre-implementation gate**: a fresh-eyes pass on the spec and plan before any code is written, owned by an agent that doesn't share the author's context.

## Problem

Specs and plans suffer from the **author's-blind-spot** problem:

- The author knows what they meant; the prose looks unambiguous to them.
- An implementer reading the spec fresh will hit interpretation choices the author never noticed.
- Reasonable implementers can land working code that diverges from the author's intent — without anyone realizing until much later.

Code review catches *implementation* mistakes. Spec review catches *specification* mistakes. The two are different gates.

## Solution shape

Two modes, one agent:

- **Spec review mode.** Read the spec fresh; check for ambiguous tick / event ordering, ownership of new state, lifecycle questions, missing edge cases, terminology consistency, scope clarity, testability, implicit constraints. Output a verdict (`PASS` or `ISSUES_FOUND`) with concrete findings.
- **Plan review mode.** Cross-reference the plan's code sketches against the source spec and the current codebase. Check signature matches, parameter order, call-site coverage, body-sketch coverage, defensive-guard purpose, layer consistency for config changes, requirement mapping, scope creep, test existence (literal walk).

The agent is **fresh-eyes by contract.** The invoker passes only file paths — never their own analysis or assessment. Inheriting author context defeats the gate.

**Anti-closure rule:** PASS bar is constant across revision rounds. Round 5 PASS meets the same standard as round 1 PASS. The temptation to soften because "the author has addressed most issues" is exactly what the rule guards against.

**Layer rules — what belongs in spec vs plan:** spec specifies *semantics, contracts, invariants*; plan specifies *code shape* (signatures, bodies, field layouts, call-site lists). Don't flag a spec for missing canonical method bodies or wrapper field enumerations — those belong in plan review. Revision rounds drift toward "show me the body" / "explain why this guard exists" — re-read the layer rule when you feel that pull.

## Real workflow snippet

Example `AGENTS.md` block on the SDD authoring flow:

```markdown
## Spec and plan authoring flow

When writing a design spec or implementation plan, route through `spec-reviewer` **before** asking the user for validation.

1. Generate the artifact.
2. Self-review and address issues.
3. Dispatch `spec-reviewer` (spec mode for specs, plan mode for plans) — do not ask the user for validation yet.
4. Continue the same `spec-reviewer` session across revision rounds until verdict is `PASS`.
5. Only after `PASS`, ask the user whether to proceed.

`spec-reviewer` is a pre-implementation gate, not an SDD-loop reviewer. It runs once on the spec (one session, multi-round until PASS) and **once on the plan as a separate fresh dispatch** — different artifact, even though the same agent definition. Do not SendMessage-resume the spec-mode session for plan review; that carries spec-mode context as context rot.
```

Example dispatch shape:

> Dispatch `spec-reviewer` in spec review mode against `docs/superpowers/specs/2026-05-10-feature-x.md`. Do not pass any analysis from this session — the agent reads fresh.

## Pitfalls observed

- **Inheriting author context.** The invoker (often the author themselves) summarizes their concerns into the dispatch prompt. The agent then reviews against the summary, not the spec. Fresh-eyes contract violated. Pass file paths only.
- **Lowering the PASS bar across rounds.** Round 5 has remaining concerns; the reviewer rationalizes that they're "minor after iteration"; PASS lands; the implementer hits the unresolved gap. Anti-closure rule exists for exactly this drift.
- **SendMessage-resuming the spec-mode session for plan review.** Same agent definition, different artifact. Spec-mode context becomes context rot in the plan-mode review. Dispatch fresh for the plan.
- **Cross-task SendMessage-resume.** Each new task's spec / plan review is a fresh dispatch. Reusing a prior task's reviewer is the same cross-artifact mistake.
- **Treating it as a code reviewer.** It does not review implementation code. The in-loop implementation review is a different gate.

## Adaptation notes

- The spec review checklist (tick ordering, ownership, lifecycle, completeness, boundary behavior, etc.) is the durable shape. The specific examples in the canonical spec reference project-specific concerns — sanitize freely.
- Plan review's **layer consistency** check (Core struct + host wrapper + authored asset) reflects the originating project's three-layer config pattern. If your project has a different layering, generalize the check accordingly.
- The **test existence (literal walk)** rule is unusually load-bearing — adopt it verbatim. Spec → plan test-coverage drift is a common pre-implementation bug; the literal walk catches it.
- Pre-commit guard coupling (introducing a file matching a guarded pattern means landing all coupled artifacts in the same commit) is project-specific to the originating project's `convention-guard.ps1`. If your project doesn't have similar guards, omit.
- The agent runs **once per artifact, multi-round until PASS**. Reviewer-session continuation matters — keep revision rounds of the same artifact in the same reviewer session; dispatch fresh for a new artifact.
