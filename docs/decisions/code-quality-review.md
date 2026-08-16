# Decision: add the `code-quality-review` skill

**Date:** 2026-06-29

## Status

Implemented (2026-06-29). `validate-native-plugin.ps1` passes.

## Context

The toolkit had review *agents* (`spec-reviewer`, `pattern-reviewer`,
`test-quality-reviewer`, `vigil`) and a runtime QA *skill* (`qa-sweep`), but no
direct-use skill for the specific posture of an **unusually strict, structure-first
maintainability review**: the strict pass that hunts for restructurings
that delete complexity rather than rearrange it. The recurring pressure it answers
is the one a correctness-first review can't touch: a diff that works and passes
tests but leaves the codebase messier: a file crossing 1000 lines, a special-case
branch bolted onto an unrelated flow, feature logic in a shared path, an
abstraction that buys nothing: none of it a bug, all of it debt.

The skill content was **operator-provided as a finalized spec** and adopted
verbatim. Because the content was supplied rather than designed here, the
`writing-skills` RED→GREEN→REFACTOR authoring loop (baseline pressure scenarios →
minimal skill → close loopholes) does not apply: there was no skill to *author*,
only a fixed artifact to *wire into the scaffold correctly*. This decision records
the wiring and the two deltas applied to the supplied spec, not a design
derivation.

## The shape

`code-quality-review` is a **run-it-now review skill** the main session invokes
against a branch's diff. It layers explicit, non-negotiable standards on top of a
deep-audit baseline prompt, all biased the same direction: toward *deleting*
complexity over polishing it:

- A baseline prompt framing the pass as a behavior-preserving deep audit aimed at
  abstractions, modularity, succinctness, and legibility, with explicit license to
  restructure.
- Eight non-negotiable standards (rule 0 ambition through rule 7
  orchestration/atomicity), each naming a specific erosion to fight: the
  1000-line file crossing, ad-hoc spaghetti growth, "it works" rubber-stamping,
  magical over direct code, type/boundary muddiness, canonical-layer leaks, and
  avoidable sequential/non-atomic orchestration.
- Primary-questions, flag-aggressively, and preferred-remedies lists that all push
  for the *reframe* over the *rearrangement*.
- An approval bar with a short set of presumptive blockers, each waivable only with
  a clear justification, plus a demanding tone section.

It is **system-agnostic**: no product, framework, package, path, or ticket names
in the body. The one concrete number (the 1000-line threshold) is framed as a
decomposition-conversation starter, not a mechanical gate.

## Deltas from the supplied spec

The skill content is the operator's supplied spec with three deltas; the rubric
body (rules 0–7, review questions, remedies, approval bar) is unchanged:

1. **`name`** is `code-quality-review` (the spec's working title was
   `thermo-nuclear-code-quality-review`).
2. **`disable-model-invocation` is dropped.** The skill is model-invocable; its
   description carries the triggering conditions (strict code quality review / deep
   code quality audit / harsh maintainability review).
3. **The "thermo-nuclear" branding is removed throughout** (operator follow-up).
   The H1 is `# Code Quality Review` and the description's trigger phrases drop
   "thermo-nuclear / thermonuclear," keeping the neutral "strict / deep / harsh"
   framing. The same scrub was applied to the companion `code-quality-reviewer`
   agent: see [`docs/decisions/code-quality-reviewer.md`](code-quality-reviewer.md).

## What changed across the scaffold

Followed the `qa-sweep` precedent (the last new skill added to the toolkit):

- Canonical `.claude/skills/code-quality-review/SKILL.md` written and propagated
  **byte-identical** to all five mirrors (`.codex`, `.gemini`, `plugins/toolkit`,
  and both onboarding reference roots).
- Origin doc `docs/skills/code-quality-review.md` written and mirrored to both
  reference roots.
- `docs/skills/README.md` roster (count `twelve` → `thirteen`, new row, composition
  bullet), root `README.md` (toolkit skill count `six` → `seven`, skills line,
  full-scaffold count `twelve` → `thirteen`), `plugins/toolkit/README.md` (count,
  two enumerations, intro clause, skills table), and the
  `docs/marketplace/native-plugin.md` Codex skill enumeration updated; mirrored
  copies re-synced.
- Both `$expectedSkills` arrays in `scripts/validate-native-plugin.ps1`
  (`Assert-ToolkitPlugin`, `Assert-CodexToolkitPlugin`) gain
  `"code-quality-review"`.
- `toolkit` `0.8.4` → `0.9.0` (new skill = minor), `agent-workshop` `0.1.15` →
  `0.1.16` (onboarding payload mirrors grew), consistent across both plugin
  manifests, both Codex manifests, and the Claude marketplace.
- `docs/change-log.md`: entry via the `change-log` skill.

## Non-goals

- Not a correctness reviewer. It owns **maintainability and structural ambition**;
  bug-hunting and behavior verification are other paths' jobs.
- Not a substitute for `pattern-reviewer` (conformance to documented patterns). The
  two are complementary strict reviewers with different targets.
- Not a whole-repo auditor. Its prioritization and approval bar are written for
  "should this change land," i.e. a bounded branch/PR diff.
- The 1000-line rule is not a hard cap; it is a strong smell that starts a
  decomposition conversation.

## Acceptance criteria

- `/code-quality-review` runs the strict, structure-first pass over the current
  branch's diff, prioritizing structural findings and holding the approval bar's
  presumptive blockers.
- The skill body is byte-identical to the supplied spec apart from the two recorded
  deltas (`name`, dropped `disable-model-invocation`).
- All mirrors (`.codex`, `.gemini`, `plugins/toolkit`, both onboarding reference
  roots) are byte-identical to canonical; the origin doc is mirrored to both
  reference roots.
- `toolkit` is at `0.9.0` and `agent-workshop` at `0.1.16`, consistent across every
  manifest and the Claude marketplace entry.
- `scripts/validate-native-plugin.ps1` passes.
