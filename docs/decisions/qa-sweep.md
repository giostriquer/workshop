# Decision: add the `qa-sweep` skill

**Date:** 2026-06-17

## Status

Implemented (2026-06-17). `validate-native-plugin.ps1` passes.

## Context

A recurring real-session shape: a QA / verification pass over a surface too broad
for one session to drive end to end: a release, a branch, a feature area, a whole
app. The lived-in run that produced this skill split the surface into feature
clusters, fanned out a team of subagents (each driving the *real* running
artifact through a browser-automation harness against a containerized build), and
then (the part that mattered) the lead **corroborated** the findings firsthand
before they counted: reproduced every high-stakes one at the surface, dropped the
one that didn't reproduce, separated a regression from a pre-existing bug via a
baseline diff, and closed a gap an agent had marked BLOCKED by injecting data to
reach the unreachable state.

The maintainer's read, which this skill encodes: **the fan-out is the cheap,
well-trodden half; the corroboration loop is the half worth institutionalizing.**
Fan-out alone multiplies coverage *and* plausible-but-wrong claims at the same
rate: a sweep that collects six reports and synthesizes without reproducing
anything is a confident-nonsense generator whose volume reads as thoroughness.

## The shape

`qa-sweep` is a **run-it-now QA orchestration skill** the main session invokes with
a surface and the verdict it owes. Five phases, two of them **rigid**:

- **Phase 0 (rigid): scope, gate, smoke.** Name the surface and the single
  verdict owed; run the decomposition gate (independent slices, or isolatable
  shared state, or stop: fan-out over shared mutable state corrupts what it
  tests); verify the *real* artifact (a substitute must be proven
  behavior-faithful and declared); smoke before spending a team.
- **Phase 1: operating contract.** One shared preamble every agent gets verbatim
  (environment facts, harness, runtime-observation discipline, collision-scoping,
  constraints, structured output schema); only the scope line differs.
- **Phase 2: fan out** one agent per slice, sized to the surface, logging
  coverage.
- **Phase 3 (rigid): corroborate.** Every finding is a lead; verdict-moving ones
  are reproduced firsthand at the surface; what won't reproduce is dropped with a
  note; regression-vs-pre-existing is settled against a baseline; agent gaps are
  the lead's to close; every survivor is tagged with how it was verified.
- **Phase 4: synthesize.** Dedup, categorize, verdict-first report, evidence
  appendix, explicit dropped-claims and coverage gaps.

**Load-bearing rule (the invariant):** a subagent's finding is a hypothesis, not a
finding, until you reproduce it yourself at the running surface. The skill is
rigid about Phase 0 and Phase 3, flexible about everything else (slicing, harness,
team size).

An **optional appendix** encodes Phases 2–4 as a deterministic workflow (a
`pipeline` of fan-out → per-finding independent corroboration → synthesize, with
inline `SLICE_SCHEMA` and `VERDICT_SCHEMA`) so the verify-loop can't be forgotten
on repeatable sweeps. The workflow covers the bulk; the operator still personally
reproduces the decision-critical tail.

## Why a new skill, not an extension

- **Distinct from `claim-check`.** `claim-check` investigates *one premise* deeply
  against the repo and faces inward/present; `qa-sweep` runs a *broad runtime
  surface* with a team and corroborates findings at the surface. They share the
  "treat it as a hypothesis, go verify" spine but differ in scale, target
  (premise vs. running artifact), and output (validity verdict vs. ship verdict).
- **Distinct from single-change runtime verification.** That checks one change at
  its runtime surface inline; `qa-sweep` is team-scale and adds the
  decomposition gate and the corroboration loop on top.
- **Not just "dispatch parallel agents."** A generic parallel-agent dispatch stops
  at "review each summary." The new, load-bearing content here is the
  decomposition gate (Phase 0) and the firsthand-corroboration loop (Phase 3),
  which no generic fan-out encodes. Watering a general dispatch mechanic down with
  QA specifics would hurt it; a focused QA skill is the right home.

## Sanitization

The lived-in run was a web-app release driven through a browser harness in a
container. Per the scaffold's no-domain-coupling rule, the canonical SKILL.md
carries **no** product names, URLs, ticket numbers, or harness brand: the worked
specifics live (generalized) in the origin doc, and the skill body states the
discipline inline rather than depending on host-specific skills that don't ship in
this scaffold (e.g. a single-change verification skill or a parallel-dispatch
skill are described by behavior, not named). The only sibling skill named is
`claim-check`, which ships in the same `toolkit` plugin.

## Name

`qa-sweep`: signals "broad surface" and avoids collision with the single-change
verification and single-premise (`claim-check`) tools. Considered and rejected:
`verification-team` (foregrounds the fan-out, the cheap half), `release-qa`
(under-claims the branch / feature / app cases), `qa-fanout` (reads as "just the
fan-out", which is exactly what the skill is *not* about).

## Packaging

Mirrors the `claim-check` landing pattern, at current versions
(`toolkit` `0.7.1` → `0.8.0`, new skill = minor; `agent-workshop` `0.1.10` →
`0.1.11`, onboarding payload mirrors grew = patch). The Codex marketplace
(`.agents/plugins/marketplace.json`) carries no version or skill-list fields and
is **not** touched; `marketplace/catalog.json` indexes agents only and is **not**
touched.

**Core parity (6):**

- Canonical: `.claude/skills/qa-sweep/SKILL.md`.
- Byte-identical host mirrors: `.codex/skills/qa-sweep/SKILL.md`,
  `.gemini/skills/qa-sweep/SKILL.md` (skill-parity convention; `.opencode/` does
  not mirror skills).
- Origin doc: `docs/skills/qa-sweep.md`.
- Roster entry in `docs/skills/README.md` (eleven → twelve).
- Root `README.md` skill count and toolkit skills line gain `qa-sweep`.

**`toolkit` channel: `0.7.1` → `0.8.0`:**

- Byte-identical payload: `plugins/toolkit/skills/qa-sweep/SKILL.md`.
- `plugins/toolkit/README.md`: skills table + prose (five → six skills).
- `plugins/toolkit/.claude-plugin/plugin.json`: version (+ description phrase).
- `plugins/toolkit/.codex-plugin/plugin.json`: version + `longDescription` +
  `defaultPrompt` (name the sixth skill).
- `.claude-plugin/marketplace.json`: `toolkit` entry version (+ description).
  Must equal the manifest version (validation asserts).

**Marketplace docs (2) + reference re-mirrors:** `docs/marketplace/native-plugin.md`
and `docs/marketplace/README.md` each enumerate the Codex `toolkit` skill surface
and gain `qa-sweep`; both re-mirror into both reference roots.

**Onboarding reference mirrors: forced by `validate-native-plugin.ps1`** in each
of the root reference root (`skills/agent-workshop-onboard/references`) and the
Codex reference root (`plugins/agent-workshop/skills/agent-workshop-onboard/references`):

- `references/skills/qa-sweep.md` (== canonical SKILL.md).
- `references/docs/skills/qa-sweep.md` (== origin doc).
- `references/docs/skills/README.md` (re-mirror, roster changed).
- `references/docs/marketplace/native-plugin.md` and
  `references/docs/marketplace/README.md` (re-mirror, enumerations changed).

**Onboarding plugin version bump (`agent-workshop` `0.1.10` → `0.1.11`):**
`.claude-plugin/plugin.json` (root manifest), `plugins/agent-workshop/.claude-plugin/plugin.json`
(validation asserts == root), `plugins/agent-workshop/.codex-plugin/plugin.json`
(validation asserts == root), and the `agent-workshop` entry in
`.claude-plugin/marketplace.json` (validation asserts == root manifest).

**Validation + change log (2):**

- `scripts/validate-native-plugin.ps1`: both `$expectedSkills` arrays
  (`Assert-ToolkitPlugin`, `Assert-CodexToolkitPlugin`) gain `"qa-sweep"`.
- `docs/change-log.md`: entry via the `change-log` skill.

## Non-goals

- Not a substitute for single-change verification (one change, inline) or
  `claim-check` (one premise, deep). It is the team-scale, corroborated sweep.
- It does not fix what it finds. The verdict + findings are the terminal
  deliverable; acting on them is a separate step the operator owns.
- It is not a license to fan out by default. Phase 0's decomposition gate is a
  precondition, not a formality; a non-decomposable or unisolatable surface routes
  back to an inline pass.
- It is not an agent. The main session orchestrates and fans out to subagents and
  performs the corroboration; a single dispatched agent cannot drive that.

## Validation

- `scripts/validate-native-plugin.ps1` passes (both `$expectedSkills` arrays
  widened to include `qa-sweep`; all mirrors byte-identical; both version bumps
  consistent across manifests and the Claude marketplace).
- GREEN test: a model given the skill and six returned slice reports does **not**
  synthesize a verdict directly; it reproduces the verdict-moving findings
  firsthand at the surface, drops what doesn't reproduce, and tags each survivor
  with how it was verified, rather than averaging the pile.
- GREEN test: a model given the skill and a **non-decomposable, write-heavy**
  surface with no isolation **declines to fan out** (Phase 0 gate) and does the
  pass inline, rather than spawning a team that corrupts shared state.

## Acceptance criteria

- `/qa-sweep <surface + verdict owed>` runs the five-phase sweep and returns a
  verdict-first, confidence-tagged report, and stops without fixing anything.
- The skill text carries the decomposition gate and the firsthand-corroboration
  loop as explicitly rigid, and states the runtime-observation discipline inline
  (no hard dependency on a non-scaffold skill).
- All mirrors (`.codex`, `.gemini`, `plugins/toolkit`, both onboarding reference
  roots) are byte-identical to canonical / source.
- `toolkit` is at `0.8.0` and `agent-workshop` at `0.1.11`, consistent across
  every manifest and the Claude marketplace entry.
- `docs/change-log.md` gets an entry via the `change-log` skill.
