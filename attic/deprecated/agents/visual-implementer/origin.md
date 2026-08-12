# visual-implementer

> **Parked 2026-08-11** — the onboarding `agent-workshop` plugin was deleted; the spec sits alongside this doc in this folder. See `docs/decisions/drop-onboarding-plugin.md`.

## Origin

The originating project added AI-generated visual asset workflows — characters or actors, environmental art, UI mockups, animation pipeline work. Initial passes had the advisor (a model in advisor mode) doing both the taste critique *and* the asset implementation. Two failure modes appeared:

1. **Self-blessing.** When the same agent generates a candidate and then judges it, the gate collapses. "Looks good to me" — but no one independent has read it.
2. **Drift from the prompt.** The implementer would notice an issue with a candidate and start "improving" it, expanding scope into redesign. The original visual question got lost.

`visual-implementer` was extracted to be the **execution-only** counterpart to a separate advisor (the `visual-advisor` skill). The advisor defines the visual question, prompt, rejection criteria, and promotion gate. The implementer translates approved prompts into narrow implementation steps.

## Problem

AI-generated visual workflows have specific failure modes that don't appear in code workflows:

- **Self-bless gate collapse.** Without role separation, candidate → approval becomes a single agent's self-judgment.
- **Scope expansion from rejection.** "This doesn't quite work, let me adjust the prompt and try again" widens scope from the original question.
- **Stale baseline drift.** Without a retrieval-first rule, candidates get judged against the agent's memory of the baseline rather than the current canonical baseline doc.
- **Mode confusion.** Refinement-mode prompts ("under the current visual thesis, refine X") and exploration-mode prompts ("the current direction feels stuck, broaden") need different anchoring. Mixing them produces fifty variants of the same look.

`visual-implementer` enforces role separation and retrieval-first; the paired `visual-advisor` skill enforces the mode discipline.

## Solution shape

The agent has clear **scope rules**:

- It implements approved prompts. It does not arbitrate taste.
- It retrieves the current canonical visual baseline at the start of every task — does not rely on prior chat memory.
- If a candidate drifts from the prompt, it stops after evidence and recommends `reject` / `regenerate` rather than widening scope to redesign.

**Six-step primary workflow:** bound the task → prepare or generate the asset → import and wire in the host environment → runtime / harness proof → visual evaluation → documentation.

**Output recommendations are bounded:** `approve v0` / `approve as pipeline proof` / `adjust import/scale/pivot/timing` / `future art simplification` / `regenerate` / `pending runtime proof`. No free-form verdicts.

**Mode awareness:** when the prompt is exploration-mode (study-only divergence under `visual-advisor`), treat the prompt's stated divergence direction as the live baseline — do not re-anchor on the current thesis.

## Real workflow snippet

Example `CLAUDE.md` block on visual implementation flow:

```markdown
## Visual implementation flow

When dispatching `visual-implementer` for an approved AI-generated visual asset, animation, or presentation task, apply the same continuation discipline that governs reviewers — the artifact is the visual asset slot or presentation surface being worked on, not the agent's role.

- **Same visual task across iterations** (advisor asked for `adjust import/scale/pivot/timing`, requested `regenerate` with a corrected prompt for the same slot, the agent reported `pending runtime proof` and the next round adds the harness scenario or screenshot, or the agent landed a candidate and is now promoting it to canonical via the same prompt's path) — continue the same `visual-implementer` session by SendMessage. Spawn the agent with an explicit `name` so subsequent rounds can address it cleanly.
- **New visual task** (different actor sprite family, different presentation surface, a new approved prompt that does not narratively continue the prior task, or a scope expansion the prior session was explicitly told not to widen into) — dispatch a fresh `visual-implementer` session.
```

Example dispatch shape:

> Dispatch `visual-implementer` with the approved prompt at `docs/architecture/visuals/2026-05-10-landing-illustration-prompt.md`. Implement as canonical v0 and validate in the host runtime. Name the session `visual-implementer-landing-illustration` so iteration rounds can continue it.

## Pitfalls observed

- **Cross-task SendMessage-resume.** Each new asset slot or surface is a fresh dispatch. Resuming a prior task's session for a different surface inherits stale baseline context. The harness response `"Agent X had no active task; resumed from transcript"` is the cross-artifact-mistake signal.
- **Self-bless gate collapse.** Without paired advisor review of actual images and runtime proof, the implementer's own verdict drifts toward "looks good." The advisor must inspect actual images, not just worker summaries.
- **Scope expansion from rejection.** A candidate fails the visual question; the implementer starts "improving" it through prompt iteration. Stop after evidence and route to `regenerate` instead.
- **Stale baseline reliance.** Without retrieval-first at task start, the agent's memory of the baseline diverges from the canonical doc. The retrieval-first rule guards this.
- **Promoting without runtime proof.** Flat candidate previews are insufficient — the visual must be evaluated at runtime scale beside adjacent assets. `pending runtime proof` is the right verdict when validation is blocked.
- **Reverting unrelated dirty worktree changes.** The agent operates on a narrow task; preserving unrelated work-in-progress is part of the contract.

## Adaptation notes

- The originating project's visual stack involved a specific visual thesis, layering contract, and runtime-validation harness. Sanitize the canonical spec to your project's specifics — the *shape* (advisor / implementer split, retrieval-first, runtime proof, narrow recommendations) is portable across visual-asset domains: game art, web UI, document mockups, marketing visuals, illustrations.
- The agent uses `permissionMode: acceptEdits` because visual work involves many small file changes. Adjust to your project's permission needs.
- The default visual re-grounding targets in the canonical spec reference docs under `docs/architecture/visuals/...` (or your project's equivalent). Adapt to your visual-stack docs.
- Pair the agent with the `visual-advisor` skill. Without the advisor side, role separation collapses.
- If your project doesn't have AI-generated visuals as a recurring workflow, this agent and the paired skill probably don't earn their keep. Leave them out.
