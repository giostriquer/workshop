# Workbench: a curated workflow with tracked upstream sources

## Adopt the useful techniques without the dispatcher (2026-08-11)

Workbench keeps the design, testing, debugging, verification, and feedback
techniques used in real projects while removing Superpowers' SessionStart
hook and forced spec-to-plan-to-subagent pipeline. Skill descriptions state
when to load a piece; the user and host determine execution agency.

The shipped process core lives in `plugins/workbench/`. Optional utilities
live in `plugins/toolkit/`. The five shipped Superpowers adaptations are
`brainstorming`, `test-driven-development`, `systematic-debugging`,
`verification-before-completion`, and `receiving-code-review`.
`writing-skills` is a repo-only adaptation in `.claude/skills/`, mirrored to
`.codex/skills/`; it ships in neither plugin.

Native skills fill the remaining roles. `audit` establishes coverage and routes
investigations; `using-workbench` maps ownership and completion requirements.
Read their current contracts rather than reconstructing behavior from the
original migration plan.

## Adaptation filter

- Descriptions state observable triggers rather than coercing all work into
  one process.
- Remove dependencies on dropped dispatch and planning skills. Existing user
  choices, repository rules, and delivery authority carry forward.
- Carry the references an adopted skill actually uses. Keep shared requirements
  visible and branch-specific resources behind a clear pointer.
- Preserve source attribution and license notices with adapted material.

`using-superpowers`, its hooks, `subagent-driven-development`,
`executing-plans`, `writing-plans`, `requesting-code-review`,
`dispatching-parallel-agents`, `using-git-worktrees`, and
`finishing-a-development-branch` are not carried. Their roles belong to host
capabilities, user-selected planning tools, and Workshop's review and delivery
skills. Removing the pipeline does not prohibit authorized delegation.

## Current workflow ownership

The [flow map](../workbench-flow.md) summarizes the current
[`using-workbench` contract](../../plugins/workbench/skills/using-workbench/SKILL.md).
The diagram is a reading aid; the skill specs define execution.

The original migration ledger contained rules later replaced: unconditional
brainstorming, confirmation of empirical uncertainty, a scope-based reading
stop, comment trimming inside review, and no correction re-review. Those
instructions no longer belong in the active rationale. Their replacements are
recorded in:

- [Operator decisions](workbench-operator-decisions.md): scope, routes, repository precedence, and artifact ownership.
- [Skill wording](skill-wording-hardening.md): carry settled authority and preserve useful work.
- [Consumer proof](empirical-proof.md): focused behavioral evidence before completion.
- [Comment trimming](trim-comments.md): a separate stage before the review round.
- [Review stages](completion-review-stages.md): independent code and test disciplines.
- [Correction review](bounded-correction-review.md): reviewer-confirmed closure and convergence holds.

## Provenance and upstream review

The repo-local `workbench-drift` skill and its manifests record upstream paths,
local destinations, adoption decisions and reviewed revisions. The bundled
checker computes changes; the session evaluates them; existing operator
authority determines what can land. It never silently applies upstream changes.

Superpowers tracks published release tags. Explicit branch tracking is used
when a source has no suitable release tag; a source commit and manifest version
do not prove a marketplace release. Pins advance only after all changed watched
paths have dispositions. Caches stay in ignored repository-local storage.
See [repo tooling](repo-tooling.md) for the checker and mirror rules.

## pstack drift alongside Superpowers (2026-10-04)

Reuse the deterministic checker with `pstack-manifest.json`; do not create a
second checker or shipped maintenance skill. pstack tracks an exact branch
commit because it had no release tags at review. Entries cover carried material
and reviewed exclusions. Other paths remain unmapped and surface when they
change; a catch-all dropped entry would hide new skills. The Matt Pocock source
uses the same explicit policy, with its own manifest.

## Licensing and attribution

The Superpowers-derived text is MIT-licensed by Jesse Vincent. The Workbench
README and LICENSE carry shipped attribution; repo-only adaptations use the
root LICENSE. Skill provenance and the drift manifests preserve the source
mapping. Toolkit's separate adaptations carry their own attribution. Usage
pages explain how to use a skill, not its origin story.
