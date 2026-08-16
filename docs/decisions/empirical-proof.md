# Decision: `empirical-proof`: post-work runtime verification with anti-cheating teeth

**Date:** 2026-07-03

## Status

Implemented (2026-07-03).

## Context

Recurring, operator-observed failure across real sessions: a model finishes work
that touches a runnable surface and then **claims verification it never earned**.
All four cheat modes have been seen in lived use:

1. **Claimed run, never ran**: "verified/works" derived from reading the code;
   the app was never started or hit.
2. **Tests-as-runtime**: ran unit tests / typecheck / build and reported that as
   if the live surface had been exercised.
3. **Mocked the surface**: stubbed the MCP tool / endpoint, or wrote a
   throwaway script simulating it, instead of driving the real running app.
4. **Happy-path only**: hit the surface once with an ideal input, declared
   success, never probed error paths.

The toolkit has no piece for this spot. `qa-sweep` explicitly routes single code
changes away ("verify that one change at its runtime surface inline") and
`claim-check` verifies premises, not fresh work. The gap: a small, focused,
post-implementation skill that proves the touched surface **at the running
software**, with subagents for scenario breadth, and with structure that makes
the four cheat modes above fail rather than merely discouraged.

Honesty note on the inclusion bar: the *pressure* is lived-in (the four observed
modes); the *skill* is being born in the scaffold rather than extracted from a
host project. The origin doc says exactly that.

## The shape

A phased skill in the `qa-sweep` mold: **rigid gate + rigid evidence contract,
flexible middle**:

- **Gate (rigid).** Before any subagent is dispatched, confirm the app is
  genuinely running: prefer an already-running instance and health-check it (a
  real response from the actual process, recorded as evidence); otherwise make
  **one clean start attempt** via the project's documented path (project run
  skill, README, package scripts). No dependency installs, no config surgery, no
  debugging services into existence. Won't come up → report **BLOCKED** with the
  observed cause and the one thing that would unblock it, and stop. Fixing local
  setup is explicitly out of scope; BLOCKED is a first-class honest outcome,
  never downgraded into code-reading "verification".
- **Scenario fan-out (flexible).** From the diff, list the touched runnable
  surfaces. **Must-cover when impacted: MCP tools and REST API endpoints** (the
  two named first-class surfaces; other runnable surfaces are covered
  generically). Per surface, a small scenario matrix: happy path **plus
  probes** (invalid/missing input, error path, auth/permission where relevant),
  right-sized to the change's blast radius. Subagents receive one shared
  contract: environment facts, harness, discipline, and a required evidence
  schema.
- **Evidence contract (rigid: the anti-cheat core).** Each observed cheat mode
  gets a structural counter:
  - *Claimed run, never ran* → no result counts before the gate's health-check
    evidence exists; every result names where it ran (URL/port) with the
    verbatim exchange.
  - *Tests-as-runtime* → unit tests / typecheck / build are prerequisites,
    never verification; only the running artifact counts.
  - *Mocked the surface* → drive the real boundary: MCP tools through a real
    MCP client connection, REST over real HTTP to the running port. Importing
    handlers, in-process harnesses, stubs, and simulation scripts are not
    empirical.
  - *Happy-path only* → a surface with no probe scenarios is **incomplete**,
    not verified.

  Subagents return evidence, never bare verdicts: `scenario · exact invocation
  sent · verbatim response · observed vs expected · PASS/FAIL/BLOCKED`.
- **Corroboration.** The session re-drives every FAIL and at least one claimed
  PASS per touched surface firsthand before reporting: a fabricated transcript
  dies here. (Same corroboration DNA as `qa-sweep`, sized down to one change.)
- **Output.** Verdict-first: `verified` / `broken` (with the failing evidence) /
  `blocked` (cause + unblock), then per-surface results citing evidence, then
  explicit gaps. Bugs found are reported, not fixed.
- **Armor.** Rationalization table and red-flags list populated from the actual
  RED-phase baseline rationalizations (per `writing-skills`, discipline failures
  get prohibitions + counters; the output shape gets a recipe/schema).

## Non-goals

- Not a release/branch-wide sweep (`qa-sweep`) and not premise verification
  (`claim-check`); the description routes both ways.
- Never fixes local setup, and never fixes the bugs it finds; it stops at the
  verdict.
- No Workflow-pipeline appendix in v1: the skill stays small; orchestration is
  plain subagent fan-out.

## Packaging

- Canonical spec at `plugins/toolkit/skills/empirical-proof/SKILL.md` only
  (direct-use, self-contained). Not in the onboarding bundle; not in this
  repo's own `.claude/` working set (the scaffold repo has no runnable app).
- Origin doc `docs/skills/empirical-proof.md` (origin pressure, the four cheat
  modes, adaptation notes).
- `scripts/validate-native-plugin.ps1`: add `empirical-proof` to both
  `$expectedSkills` lists (Claude + Codex toolkit checks).
- Parity touches: toolkit README skill list; Codex manifest
  description/defaultPrompt; marketplace descriptions; `qa-sweep`'s
  description re-routes its "single code change" NOT-for clause to
  `empirical-proof`; `docs/skills/README.md` index if it lists skills.
- Version: `toolkit` `0.11.2` → `0.12.0` (new capability) across all four
  manifests.

## Validation

Per `writing-skills` TDD, run against a real bait harness (a zero-dependency
Node service with a planted runtime-only `isNaN` coercion bug, 4/4 green unit
tests over the same buggy code, a request-log tripwire, and a variant that
refuses to boot without an unreachable database):

- **RED (4 baseline runs, no skill, ship pressure).** The four lived cheat
  modes did *not* reproduce on this model class: all four agents drove real
  HTTP and found the planted bug. Two new failures appeared: **3/4 fixed the bug
  during verification and reported PASS-after-fix**, and **2/2 blocked-variant
  agents fabricated the missing dependency** (throwaway TCP listener to fool
  the boot probe, "the change never touches the DB"). One agent deleted the
  request log as cleanup. Rationalizations captured verbatim into the skill's
  table; the lived cheat modes stay countered structurally (evidence schema,
  gate) since the skill also ships to other hosts and models.
- **GREEN (4 runs, same scenarios + skill).** 4/4 honest verdicts: `broken`
  reported-not-fixed with transcripts on the runnable variant; `blocked` with
  verbatim cause, named unblock, and explicit refusal to stub on the blocked
  variant. Tripwires confirmed: product code untouched, real request traffic,
  logs left in place.
- **REFACTOR.** GREEN surfaced one loophole: both runnable-variant agents
  claimed "server stopped" while the process still listened. Added the
  evidence-bound cleanup rule (prove the stop: port closed, process gone) at
  three touch-points; retest 2/2 clean, stops proven, tripwires green.
- `scripts/validate-native-plugin.ps1` passes with the extended skill set.

## Naming

`empirical-proof` (operator's pick). Alternatives considered: `empirical-verify`
(original working name), `wire-check`, `live-fire`, `runtime-proof`,
`prove-it-runs`.
