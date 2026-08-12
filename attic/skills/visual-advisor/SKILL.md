---
name: visual-advisor
description: Use when visual work needs art-direction judgment, AI-image prompt shaping, candidate critique, asset / animation pass selection, promotion decisions before runtime implementation, or when the current visual direction feels stuck on the same look and needs broader exploration.
---

# Visual Advisor

## Purpose

Run the **advisor side** of visual work. This skill helps critique visual candidates, shape image-model or worker prompts, select the next pass, and decide when art is ready for runtime implementation.

The skill is advisory by default. It should not bless its own output as production-ready and should not let a worker's self-verdict become baseline approval without an independent read.

## Core rule

Keep the advisor and implementer roles separate.

- The **advisor** defines the visual question, prompt, rejection criteria, and promotion gate.
- The **implementer** (typically the `visual-implementer` agent) produces candidates, imports assets, wires them into the host environment, runs visual smokes, and reports evidence.
- The advisor reviews the actual images, runtime screenshots, and proof paths before approving promotion.

## Modes

**Mode selection is the first decision the advisor makes.** Running an exploration pass through refinement-mode prompts is how this skill produces fifty variants of the same look. Pick the mode before writing the prompt.

| Mode | When to use | Anchors | Promotion path |
|---|---|---|---|
| `refinement` | Sprite intake, animation, runtime proof, presentation wiring under a settled visual thesis | Current baselines are constraints | study-only → candidate → runtime proof → baseline promotion |
| `exploration` | The current direction feels stuck on one look. Broadening visual options. Surveying alternatives before committing. | Current baselines are context only — do NOT re-impose them on candidates | study-only outputs only; cannot promote to baseline directly |
| `rebaseline` | The user has decided a current baseline must change and a new thesis needs to be drafted | Current baselines are the thing being replaced | requires explicit thesis-ratification gate before any refinement work resumes |

Default to `refinement`. Switch to `exploration` when the user uses divergence language: "explore", "broaden", "different", "alternatives", "stuck", "same look", "diverge", "what if". Switch to `rebaseline` only when the user explicitly says a baseline needs replacing or names a different visual thesis they want adopted.

When in doubt about mode, ask the user before producing the prompt.

## Minimal context

Read only the current context needed for the surface:

- the project's visual-stack reference doc
- current visual thesis / baseline doc
- AI asset workflow doc (if one exists)
- task-specific baseline docs (for animation work, the project's animation reference contract)
- concrete proof images for the surface

If those docs conflict with the user's latest visual judgment, treat the user judgment as the live direction and update docs only after a promoted result lands.

## Workflow

1. State the target surface, current baseline, and **chosen mode**.
2. Classify the pass type (within the mode):
   - `study-only`: exploration in `.temp` or scratch space, no tracked promotion. (The only valid pass type in exploration mode.)
   - `candidate asset`: generated asset exists, not runtime-approved.
   - `runtime proof`: imported / wired in the host environment with harness or smoke-test proof.
   - `baseline promotion`: runtime proof plus advisor / user approval and docs update.
   - `thesis ratification`: rebaseline-mode only. A new visual language is approved on its own merits before refinement work resumes against it.
3. Narrow the pass to one visual question.
4. Produce a prompt or worker brief using the mode-appropriate skeleton (Refinement Skeleton or Exploration Skeleton below). For rebaseline mode, use the Exploration Skeleton until a thesis is ratified, then switch to Refinement.
5. Inspect actual images and runtime proof, not just worker summaries.
6. Give one verdict (see Verdict Ladder).
7. Document only promoted baselines, ratified theses, or durable workflow lessons. Keep failed studies and exploration outputs in `.temp` or equivalent scratch space.

## Verdict ladder

Refinement mode:

- `Reject`: core read failed; discard or revert.
- `Needs another art pass`: direction is useful but not runtime-ready.
- `Study approved`: can become a candidate in the next pass.
- `Runtime-ready candidate`: import / wire / proof in the next pass.
- `Baseline approved`: only after runtime proof and advisor / user approval.

Exploration mode (replaces the refinement ladder):

- `Reject`: variants collapsed into the current baseline language, were functionally identical to each other, or were too noisy to read.
- `Exploration noted`: kept in scratch as reference; no promotion path from this pass.
- `Promising direction — escalate to rebaseline`: at least one variant is strong enough that the user should consider drafting a new thesis around it.

Rebaseline mode:

- `Thesis rejected`: candidate visual language fails on its own terms. Stay with current baseline.
- `Thesis ratified`: new visual language is the new baseline. Refinement work may now resume against it. Update the visual-stack reference doc.

## Refinement skeleton

When producing a prompt for refinement mode, use this shape:

- **Target surface:** what asset / surface / layer is being refined
- **Current baseline:** specific anchor docs and proof paths
- **Visual question:** the one thing this pass is asking
- **Acceptance criteria:** specific readable properties that constitute success
- **Rejection criteria:** specific properties that constitute failure
- **Constraints:** scale, palette limits, layering rules, visual stack invariants
- **Output expectations:** number of variants, format, scratch / promotion routing

## Exploration skeleton

When producing a prompt for exploration mode, use this shape:

- **Target surface:** the asset / surface being explored
- **Divergence direction:** the specific axis the exploration is broadening (e.g., "less detail-dense", "different palette family", "different silhouette language")
- **What to deliberately NOT inherit from the current baseline:** the constraints being relaxed
- **Acceptance criteria:** what would make a variant interesting enough to escalate to rebaseline consideration
- **Output expectations:** number of variants, format, scratch routing

## Boundaries

- This skill is advisory. It does not import, wire, or promote visual assets.
- It does not bless its own prompts as production-ready.
- It does not let a worker's self-verdict substitute for advisor review of actual images and runtime proof.
- It does not arbitrate gameplay / product math, balance, or core logic — visual surfaces only.

## Suggested invocation

- Critique these candidates and decide the next pass.
- Help me explore broader options for `<surface>`; the current direction feels stuck.
- Should this candidate be promoted to baseline?
- Draft a refinement prompt for `<surface>` against the current thesis.
