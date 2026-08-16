# Decision: add the `code-quality-reviewer` agent

**Date:** 2026-06-29

## Status

Implemented (2026-06-29). `validate-native-plugin.ps1` passes.

## Context

The scaffold's implementation-review loop always named a **code-quality** stage
ahead of pattern and test review: `pattern-reviewer`'s own description says it runs
"after code-quality review," and `docs/agents/README.md` listed "the project's
code-quality reviewer" as the first implementation-review step, but no such agent
shipped. Every adopting project had to supply it. This adds the missing agent.

It is the dispatchable counterpart to the `code-quality-review` skill added in the
same batch: the **skill is the rubric**, the **agent loads that rubric and applies
it to a diff** in its own subagent context. The agent's spec was operator-provided
(originating in a Cursor "team kit") and **adapted into the scaffold** rather than
copied verbatim: the skill addition was the verbatim one; this agent needed
sanitization.

## Adaptations from the supplied spec

The supplied spec was Cursor-specific; the scaffold version keeps its identity and
changes what doesn't port:

- **De-branded.** "Thermo-nuclear" is dropped throughout (name, description, body),
  matching the same scrub applied to the skill: see
  [`docs/decisions/code-quality-review.md`](code-quality-review.md).
- **Name** is `code-quality-reviewer` (spec working title
  `thermo-nuclear-code-quality-review`).
- **Rubric source repointed.** The spec loaded the rubric "from the
  `thermo-nuclear-code-quality-review` skill in the cursor-team-kit plugin"; the
  scaffold version loads the bundled `code-quality-review` skill (with the same
  built-in fallback when the skill is absent), and can read the `SKILL.md` directly
  on hosts that don't auto-load skills.
- **Orchestration made host-agnostic.** The spec hardcoded Cursor subagent types
  (`subagent_type: "shell"`, `"explore"`, `"thermo-nuclear-code-quality-review"`).
  The scaffold version describes the same flow: collect `git diff <base>...HEAD`
  (default base `main`) and changed-file contents, then dispatch with
  `### Git / diff output` and `### Changed file contents` sections: in terms of
  "the host's Task / subagent mechanism," and the canonical spec carries
  Claude-format frontmatter (`tools: Read, Grep, Glob, Bash`, `model: inherit`) with
  thin `.codex` / `.gemini` / `.opencode` wrappers, like the other review agents.
- **Robust input.** It reviews the labeled sections when supplied, and gathers the
  diff itself when they aren't, so it works both as a parent-orchestrated stage and
  standalone.

## What changed across the scaffold

Followed the `pattern-reviewer` agent layout:

- Canonical `.claude/agents/code-quality-reviewer.md` + thin host wrappers
  (`.codex/agents/*.toml`, `.gemini/agents/*.md`, `.opencode/agents/*.md`).
- Mirrored byte-identical to `plugins/toolkit/agents/` and both onboarding reference
  roots (canonical → `references/agents/`, wrappers → `references/wrappers/<host>/`).
- Origin doc `docs/agents/code-quality-reviewer.md` written and mirrored to both
  reference roots.
- `marketplace/catalog.json`: new `code-quality-reviewer` agent entry (role
  `review-only`, maturity `core`, pack `review-core`) and added to the `review-core`
  pack list; re-mirrored to both reference roots.
- `scripts/validate-native-plugin.ps1`: toolkit-agents expected list widened.
- `docs/agents/README.md` roster (count `eight` → `nine`, new row, compose section
  now names the actual agent), root `README.md` (agent enumeration, `eight` → `nine`),
  and `plugins/toolkit/README.md` (`four` → `five` agents in three places, agents
  table row) updated; roster mirrored.
- Ships in the same unreleased batch as the `code-quality-review` skill: `toolkit`
  `0.9.0`, `agent-workshop` `0.1.16` (no further bump).

## Non-goals

- Not a fixer. Review-only; routing findings into edits is the implementer's step.
- Not a correctness or test reviewer. It owns maintainability/structure; pattern and
  test trustworthiness are separate stages.
- Not a replacement for the skill. The skill remains usable inline (model-invocable);
  the agent is for running the same rubric in an isolated subagent context as part of
  a multi-stage review.

## Acceptance criteria

- The agent is dispatchable as `toolkit:code-quality-reviewer` (and via host
  wrappers), loads the `code-quality-review` rubric, and reviews a supplied or
  self-gathered diff, review-only.
- All mirrors (`plugins/toolkit/agents`, both reference roots, host wrappers) are
  byte-identical to canonical; origin doc and catalog mirrored.
- `toolkit` at `0.9.0`, `agent-workshop` at `0.1.16`, consistent across manifests
  and the Claude marketplace.
- `scripts/validate-native-plugin.ps1` passes.
