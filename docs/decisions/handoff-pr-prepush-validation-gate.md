# Decision: `handoff-pr` discovers and runs the repo's pre-push static gates

**Date:** 2026-06-19

## Status

Implemented.

## Context

A real PR failed CI on a single required gate: a formatter check (`format:check`)
flagged one unformatted line, while everything else (typecheck, lint, integration,
e2e, api-compat) passed. The chain that let it through:

1. Commits were made with `--no-verify`, so the repo's pre-commit hook (which runs
   the formatter) never fired.
2. The handoff carried no pre-push static-checks gate, so the branch was pushed
   without the formatter ever running on the changed line.
3. The required CI gate ran the formatter, failed fast (~1 min), and blocked the
   whole PR.

The handoff's existing "Validation / tests: what was run and the result" field was
too loose to catch this: it invited "tests pass" and treated all checks as one
bucket. Three things were missing: (a) the *fast static checks* (formatting, lint,
typecheck) are usually the **required** CI gates and the cheapest to fail, yet they
were not run locally; (b) a `--no-verify` commit silently skips the local
formatter, so "it built and tested fine" says nothing about formatting; (c) when a
handoff lists "known issues," a formatting failure blurred together with a
stale-base typecheck red herring, so an opener could chase the wrong failure.

## Constraint

The fix must **not** hardcode a toolchain (no `oxfmt` / `turbo` / `lefthook` /
`pnpm`). Repos differ. Instead the skill must teach the producing session to
**discover** the project's actual validation surface and bake the discovered,
concrete commands into the artifact.

## The shape

`handoff-pr`'s validation step becomes a discover-then-run gate:

- **Discover the gates from the repo, not assumption.** Read the CI workflow
  definitions (which checks block merge, which fail fast), the commit/push hook
  config, the build/package manifest's script targets, and any contributor docs.
  Identify the **fast static checks** (formatting, lint, typecheck) *separately*
  from the test suites.
- **Run them against an up-to-date base** (fetch latest first) and record the
  **exact commands and each result**, kept separate by kind (format / lint /
  typecheck / tests). Static checks are run locally, not just the tests.
- **The `--no-verify` hazard is named explicitly:** if any commit bypassed the
  pre-commit/pre-push hooks, the repo's formatter never ran on it: run the
  formatter manually before the branch is pushed.
- **Validation provenance** in the opener-only notes carries the discovered
  commands + results separated by kind, the base they ran against, and any hook
  bypass, so "passed" is specific and "not run" appears only where literally true.
- **Known-issues hygiene:** a formatting failure is separated from a typecheck/test
  failure and from a stale-base error, so the opener fixes the gate that's actually
  red.

Form (per `writing-skills` "match the form to the failure"): partly a discipline
failure (skip the static gate, trust `--no-verify` commits) → named prohibition;
partly a shaping failure (the loose "what was run" field) → a recipe for what the
provenance must contain. Both are kept tool-agnostic via discovery.

## Non-goals

- No named formatter, linter, task runner, package manager, or hook tool in the
  skill body: the producing session discovers the repo's own.
- `handoff-pr` still never opens the PR or pushes on the operator's behalf beyond
  what the repo flow already does; it records the gate, it doesn't become CI.
- The `description` (triggering conditions) is unchanged.
- Scoped to `handoff-pr` as requested; the sibling `handoff-goal` already carries a
  discovered "Validation" gate in its operating rules, so the lesson is not
  duplicated there.

## Packaging

- Canonical `.claude/skills/handoff-pr/SKILL.md` edited; byte-identical mirrors
  re-propagated to `.codex/`, `.gemini/`, `plugins/toolkit/`, and both onboarding
  reference roots. Origin doc `docs/skills/handoff-pr.md` updated and mirrored.
- Rides the same batch version bump as the `handoff-goal` and `claim-check` changes
  landing together: `toolkit` `0.8.2`, `agent-workshop` `0.1.13`: no additional
  bump. `scripts/validate-native-plugin.ps1` `$expectedSkills` unchanged; passes.

## Validation

The RED is the lived CI failure above. GREEN check: a branch with a `--no-verify`
commit that left a file unformatted produces a handoff whose validation step
discovers the repo's formatter gate, runs it, catches the unformatted file, and
records the formatter command + result separately from typecheck/tests. This
avoids reporting "tests pass" and then letting CI fail.
- `scripts/validate-native-plugin.ps1` passes with the unchanged skills set.
