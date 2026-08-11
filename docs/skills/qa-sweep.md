# qa-sweep

## Origin

A broad QA pass on a release surface too large for one session to drive end to
end. The maintainer's instinct was the right one — split the surface into feature
clusters and fan out a team of subagents, each driving the *real* running
artifact (a browser-automation harness against a containerized build), each
reporting what it saw. That part worked and felt fast. But the durable lesson
wasn't the fan-out. It was what happened next: the lead treated each agent's
report as a **lead, not a conclusion** — reproduced every high-stakes finding
firsthand at the surface, dropped the one that didn't reproduce, separated a real
regression from a pre-existing bug by diffing against a baseline build, and closed
a gap one agent had marked BLOCKED by injecting data to reach the state the agent
couldn't. The findings were trustworthy because they were *checked*, not because
six agents agreed.

`qa-sweep` captures that shape: **contract → fan-out → independent corroboration →
confidence-tagged synthesis.** The fan-out is the cheap, well-trodden half; the
corroboration is the half worth institutionalizing.

## Problem

Fan-out QA has a seductive failure mode: it produces a thick stack of reports
fast, and the volume *reads* as thoroughness. Three things go wrong if the
posture isn't pinned:

1. **Unverified claims multiply.** Parallel agents multiply coverage and
   plausible-but-wrong findings at the same rate. A report nobody reproduced is a
   hypothesis wearing a verdict's clothes — and six of them is a
   confident-nonsense generator.
2. **The decomposition is assumed, not gated.** Fan-out only pays off when the
   surface actually splits into independent, low-contention slices. Forced onto a
   non-decomposable or write-heavy surface with no isolation, parallel agents
   corrupt the very state they're testing, and the parallelism is theater.
3. **Regressions and pre-existing bugs blur together.** Without a baseline diff, a
   bug that was always there gets reported as a release blocker, and the verdict
   the sweep owes — ship or don't — is wrong for the wrong reason.

## Solution shape

A run-it-now QA orchestration, not a brief generator. The main session owns the
sweep across five phases, two of them rigid:

- **Phase 0 (rigid) — scope, gate, smoke.** Name the surface and the single
  verdict owed. Run the **decomposition gate**: independent slices, or isolatable
  shared state, or stop. Verify the *real* artifact (a substitute must be proven
  behavior-faithful), and smoke it before spending a team.
- **Phase 1 — the operating contract.** One shared preamble every agent gets
  verbatim — environment facts, the harness, the runtime-observation discipline,
  collision-scoping, constraints, and a **structured output schema** so results
  merge. Only the scope line differs per agent.
- **Phase 2 — fan out** one agent per slice, sized to the surface, logging
  coverage.
- **Phase 3 (rigid) — corroborate.** The load-bearing half. Every finding is a
  lead; verdict-moving ones (blockers, regressions, root-cause claims, mediums)
  are reproduced **firsthand at the surface**. What won't reproduce is dropped
  with a note; regression-vs-pre-existing is settled against a baseline; gaps an
  agent hit are the lead's to close, not to wave through. Every survivor is tagged
  with **how** it was verified.
- **Phase 4 — synthesize.** Dedup, categorize, verdict-first report; raw captures
  in an evidence appendix; dropped claims and coverage gaps stated, not silent.

The load-bearing constraint, distilled: **a subagent's finding is a hypothesis
until you reproduce it yourself at the running surface.** The skill is rigid about
the gate (Phase 0) and the corroboration (Phase 3) and flexible about everything
else — how you slice, which harness, how many agents.

An optional appendix encodes Phases 2–4 as a deterministic workflow (pipeline:
fan-out → per-finding independent corroboration → synthesize, with two JSON
schemas), so the verify-loop is un-skippable for repeatable sweeps. The workflow
covers the bulk; the operator still personally reproduces the decision-critical
tail.

## Real invocation snippet

> /qa-sweep is this release safe to cut? surface decomposes by feature area, driven through the app's browser harness against the staging build

Names the verdict owed and the surface. The skill runs the decomposition gate,
smokes the build, writes one contract, fans a QA agent over each feature area,
then reproduces every would-be blocker and claimed regression firsthand —
diffing against the prior build to separate regressions from pre-existing bugs —
before any of them count, and returns a ship / no-ship verdict with each finding
tagged by how it was verified.

## Pitfalls observed

- **Trusting the pile.** The whole value is the corroboration; a sweep that
  collects six reports and synthesizes without reproducing anything is *less*
  trustworthy than one careful inline pass, because the volume hides that nothing
  was checked.
- **Skipping the gate.** Fan-out forced onto a surface that won't decompose, or
  onto shared mutable state with no isolation, is theater at best and corruption
  at worst.
- **Substituting a unit test for an unreachable runtime path.** When an agent
  can't reach a state, the answer is another route to the *real* surface (inject
  data, second identity), not a green unit test standing in for runtime
  observation.
- **No baseline.** Without diffing a baseline, pre-existing bugs masquerade as
  release blockers and the verdict is wrong.
- **Silent gaps.** Coverage not reached and claims dropped have to be stated;
  omission reads as "covered."

## Adaptation notes

- The clusters, the harness, the URLs, the container — all re-derived per task.
  The skill carries the *skeleton and the discipline*; the operator supplies the
  work-list and environment each run. Bake those specifics in and the skill rots.
- The agent output schema (`area · whatIDid · observed · verdict · severity ·
  regression · confidence`) is portable; rename fields to match how your team
  triages.
- The optional workflow is genuinely optional — the lived-in run used the
  model-driven version (background agents + manual corroboration), which is fine
  for one-off sweeps; the workflow is for when someone wants the verify-loop
  deterministic and un-skippable.
- It deliberately **composes rather than duplicates** the scaffold's other tools:
  it is the team-scale, runtime sibling of a single-change runtime verification
  and of `claim-check` (one premise, deep). The new, load-bearing content is the
  decomposition gate and the corroboration loop — the parts neither a generic
  parallel-agent dispatch nor a single-premise investigation encodes.
- Pairs forward with `handoff-goal` / `file-pr`: a clean ship verdict, or a
  blocker list, feeds straight into the next session's work.
