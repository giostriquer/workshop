# Decision: add the `fix-ci` skill (toolkit-only) — watch-and-fix as a skill, not a wider agent

**Date:** 2026-08-11

## Status

Implemented (2026-08-11). `validate-native-plugin.ps1` passes.

## Context

The operator's recurring move at a red check was the same message every time — "CI
is failing, take a look" — i.e. watch the checks, pull the failing log, fix the
cause, push, watch again. `ci-watcher` covers only the watch-and-report half by
design; the fix half was manual prompting. The ask: one invocable piece that watches
**and** fixes.

## Decision: a new skill, `ci-watcher` unchanged

The obvious edit — give `ci-watcher` `Edit`/`Write` and a fix loop — was rejected
for three reasons:

1. **The toolkit's agent invariant.** The plugin's documented promise is that its
   agents are advisory and read-only ("they never modify your files"); edit-capable
   agents are explicitly excluded. Widening `ci-watcher` breaks the plugin's
   identity for one convenience.
2. **Fix quality lives in the session.** The session that pushed the breaking commit
   has the context to fix it fast; a background subagent editing the working tree in
   parallel starts from zero and can collide with in-flight work. Skills run in the
   main session under the user's own permissions — the right authority model for
   edits and pushes.
3. **The original decision anticipated this.** `ci-watcher`'s docs said a watcher
   that retries or pushes is "a different, higher-authority tool." `fix-ci` is that
   tool; the authority difference is exactly the skill/agent boundary.

So: `fix-ci` (skill) composes with `ci-watcher` (agent). The skill owns the loop —
resolve target → watch → evidence → flake-vs-fault triage → minimal in-session fix →
conventional push → re-watch — and dispatches `ci-watcher` in the background only for
the waiting. Guardrails are part of the spec: hard cap of two fix attempts (plus one
flake rerun), never force-push or rewrite history, stage only what the fix touched,
never weaken a failing check to get to green.

Two deliberate widenings beyond the watcher: the skill also handles **branches with
no PR** (push-triggered runs via `gh run list` / `gh run watch`, for direct-to-main
workflows), and it may **rerun a failed job once** when the evidence says flake.

## What changed

- New canonical spec `plugins/toolkit/skills/fix-ci/SKILL.md`; origin doc
  `docs/skills/fix-ci.md`.
- `plugins/toolkit/agents/ci-watcher.md`: one composition sentence (it is the watch
  half of the loop); still read-only. Origin doc `docs/agents/ci-watcher.md` updated
  to name `fix-ci` as the fixer it always declined to be.
- `scripts/validate-native-plugin.ps1`: both toolkit expected-skills lists (Claude +
  Codex payloads) grew to twelve.
- `plugins/toolkit/README.md` (eleven → twelve, intro clause, install lists, skills
  table row), root `README.md` (toolkit skills line), `docs/skills/README.md`
  (seventeen → eighteen, roster row, composition bullet).
- Version bumps: `toolkit` `0.17.0` → `0.18.0` across `.claude-plugin`,
  `.codex-plugin`, `.cursor-plugin`, and the marketplace manifest (descriptions gained
  "CI watch-and-fix"). `agent-workshop` `0.1.23` → `0.1.24` — the skills roster is
  mirrored into the onboarding bundle
  (`references/docs/skills/README.md`) and grew a row.

## Non-goals

- Not host-agnostic: assumes `gh`, like `ci-watcher`. Other CI hosts swap the CLI.
- Not an auto-merger or PR manager — it fixes the red check and reports; PR state is
  the caller's business.
- `ci-watcher` gains no authority: still `Bash, Read`, still report-only.

## Acceptance criteria

- Invoking `fix-ci` (or "CI is failing, take a look") on a branch with a red check
  produces: evidence-first diagnosis, at most two fix commits pushed per repo
  conventions, a re-watch, and a verdict-first report; on a green branch it reports
  green and stops.
- `toolkit` at `0.18.0` consistently across all four manifests;
  `scripts/validate-native-plugin.ps1` passes.
