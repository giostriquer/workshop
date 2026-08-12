# visual-advisor

> **Parked 2026-08-11** — the onboarding `agent-workshop` plugin was deleted; the spec sits alongside this doc in [`SKILL.md`](SKILL.md). See `docs/decisions/drop-onboarding-plugin.md`.

## Origin

In the originating project, AI-generated visual workflows produced two failure modes that didn't appear in code workflows:

1. **Self-bless gate collapse.** When the same agent generates a candidate and judges it, the gate collapses.
2. **Mode confusion.** Refinement prompts ("under the current visual thesis, refine X") and exploration prompts ("the current direction feels stuck, broaden") need different anchoring. Mixing them produces fifty variants of the same look.

`visual-advisor` was introduced as the **advisor counterpart** to the `visual-implementer` agent — taste judgment, prompt shaping, mode discipline, and promotion gating. Together they enforce role separation.

## Problem

Visual work has specific failure modes:

- **Self-judgment.** Without role separation, candidate → approval becomes one agent's self-verdict.
- **Mode drift.** Without explicit mode commitment, refinement framing applied to exploration scope keeps producing the same look.
- **Stale baseline anchoring.** Without retrieval-first, candidates get judged against the agent's memory of the baseline rather than the current canonical doc.
- **Premature promotion.** A flat candidate preview gets approved before runtime proof. The visual fails at runtime scale because adjacent assets weren't compared.

The advisor / implementer split addresses self-judgment. Mode discipline addresses mode drift. Retrieval-first addresses stale baseline. The promotion gate addresses premature approval.

## Solution shape

**Three modes:**

- `refinement` — sprite intake, animation, runtime proof, presentation wiring under a settled visual thesis. Current baselines are *constraints*.
- `exploration` — broaden visual options when the current direction feels stuck. Current baselines are *context only* — do NOT re-impose them on candidates. Study-only outputs; cannot promote to baseline directly.
- `rebaseline` — the user has decided a baseline must change and a new thesis needs drafting. Requires explicit thesis-ratification gate before refinement work resumes.

**Pass type ladder:** `study-only` → `candidate asset` → `runtime proof` → `baseline promotion`. Plus `thesis ratification` for rebaseline mode.

**Verdict ladder per mode:**

- Refinement: `Reject` / `Needs another art pass` / `Study approved` / `Runtime-ready candidate` / `Baseline approved`.
- Exploration: `Reject` / `Exploration noted` / `Promising direction — escalate to rebaseline`.
- Rebaseline: `Thesis rejected` / `Thesis ratified`.

**Mode-specific prompt skeletons** (refinement / exploration) ensure prompts don't accidentally apply the wrong anchoring.

## Real invocation snippet

```markdown
The `visual-advisor` skill helps critique visual candidates, shape image-model or worker prompts, select the next pass, and decide when art is ready for runtime implementation. It is the advisor counterpart to the `visual-implementer` agent.

Mode selection is the first decision the advisor makes. Default to `refinement`. Switch to `exploration` when the user uses divergence language ("explore", "broaden", "different", "stuck", "same look", "diverge"). Switch to `rebaseline` only when the user explicitly says a baseline needs replacing.
```

Example invocations:

> Critique these candidates and decide the next pass.

> Help me explore broader options for the landing page illustration; the current direction feels stuck.

> Should this candidate be promoted to baseline?

## Pitfalls observed

- **Running an exploration pass through refinement-mode prompts.** Pick the mode before writing the prompt. The advisor produces fifty variants of the same look when the mode is wrong.
- **Self-blessing.** The advisor must inspect actual images, not just worker summaries. The advisor's whole point is independence from the implementer's verdict.
- **Letting a worker's "approved" verdict substitute for advisor review.** The worker may report `runtime-ready candidate`; the advisor still must read the actual screenshots before promoting.
- **Promoting without runtime proof.** Flat previews are insufficient. The visual must be evaluated at runtime scale beside adjacent assets.
- **Cleaning rejected variants into baselines.** Rejected variants and exploration outputs belong in scratch space (`.temp` or equivalent), not in baseline docs. Documentation tracks promoted baselines, ratified theses, and durable workflow lessons — not failed studies.

## Adaptation notes

- The skill's *shape* — mode discipline, advisor / implementer split, verdict ladder, retrieval-first — generalizes across visual-asset domains: game art, web UI, document mockups, marketing visuals, illustrations. Sanitize the canonical spec to your project's domain.
- The "Minimal context" reading list in the skill references generic project paths. Replace these with your project's visual-stack docs.
- Pair with `visual-implementer`. Without the implementer side, the advisor has nowhere to send approved prompts.
- If your project doesn't have AI-generated visuals as a recurring workflow, this skill and the paired agent probably don't earn their keep. Leave them out — the scaffold's discipline is "lived-in proof or nothing."
- Mode-specific scaffold-doc references (e.g., HUD prompt scaffolds, animation reference contracts) are project-specific. Drop or replace for your project.
