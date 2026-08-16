# qa-sweep

## What it does

`qa-sweep` runs a QA pass over a surface too broad for one session to drive end
to end: a release, a branch, a feature area, a whole app. It splits the surface
into slices, fans out a team of subagents that drive the **real running
artifact**, and then does the part that matters: it reproduces the findings that
would move the verdict **firsthand**, at the surface, before any of them count.
The deliverable is "a ship / don't-ship verdict plus categorized,
**corroborated** findings, not a pile of unverified agent claims."

It is an **orchestration protocol the main session runs**, with two rigid phases
and three flexible ones. Phase 0 (scope, gate, smoke) and Phase 3 (corroborate)
do not bend; how you slice, which harness you drive, and how many agents you
dispatch all do. The design record is explicit that it is not an agent: "the main
session orchestrates and fans out to subagents and performs the corroboration; a
single dispatched agent cannot drive that."

It **stops at the verdict**. "It does **not** fix what it finds: acting on the
findings is the separate step the operator owns." It also does not read code as a
substitute for driving the app: "QA here is *runtime observation*, not code
reading."

## When to reach for it

Invoke it by name with the surface and the verdict you owe (`/qa-sweep`; on hosts
that namespace plugin skills, `/workbench:qa-sweep`). It is also the engine the
`audit` protocol dispatches when you pick the **team sweep** tier: `audit` sizes
the workload, `qa-sweep` does the work.

It never fires on its own. `qa-sweep` and `empirical-proof` are the flow's
expensive tiers: **offer them, never default to them**. They run "on the user's
explicit ask (now or standing) and not otherwise," because "running one uninvited
spends the user's time and budget on ceremony they didn't order."

Use it when **all** of these hold:

- The surface **decomposes into independent, low-shared-state slices**: features,
  routes, areas, flows.
- There is a **runnable artifact to observe**: an app, a service, a CLI.
- Breadth justifies the cost of a team **plus** your own corroboration on top.

| The problem | The skill |
| --- | --- |
| A broad, decomposable runtime surface at team scale | `qa-sweep` |
| One code change with a drivable surface | `empirical-proof` |
| One premise, ticket, or hunch | `claim-check` |
| Something to check, not yet sized | `audit` asks for the tier first |
| About to claim done, fixed, or passing | `verification-before-completion` |
| A surface that won't decompose, or write-heavy with no isolation | No skill: do the pass inline, or isolate first |
| Driving the app to hunt for unknown bugs in general | Ordinary session work: `empirical-proof` names this misfire and excludes it |

## The one rule that makes it trustworthy

"**A subagent's finding is a hypothesis, not a finding, until you reproduce it
yourself at the running surface.**"

The reasoning is stated in the skill and again in
[the origin decision](../decisions/qa-sweep.md): fan-out is the cheap,
well-trodden half; it "multiplies coverage, and it multiplies
plausible-but-wrong claims at the same rate." A sweep that collects six reports
and synthesizes without reproducing anything is "a confident-nonsense generator
that *looks* thorough," whose volume reads as thoroughness. The corroboration
loop is the half worth institutionalizing.

## The five phases

**Phase 0: scope, gate, smoke (rigid).**

1. Name the surface and the single verdict you owe: "is this release safe to
   cut?" The whole sweep serves that one question.
2. **Decomposition gate.** List the independent slices. If they share mutable
   state, can you isolate them (distinct accounts, sites, worktrees, containers,
   or read-only access)? If you can "neither decompose nor isolate, STOP: fan-out
   is theater here, and parallel writers will corrupt the shared state you're
   testing."
3. Get the **real** artifact running. A substitute build or image must be proven
   behavior-faithful (diff it) and declared in the report.
4. **Smoke before you spend.** Confirm it boots and its top-level surfaces
   respond. "Smoke fails → report BLOCKED and stop; a team on a broken build
   wastes the tokens."

**Phase 1: the operating contract.** One shared preamble every agent receives
verbatim; only the scope line differs per agent. It carries:

| Contract element | What it pins down |
| --- | --- |
| Environment facts | Base URL or handle, authentication, entry points, seed/data state, and the evidence directory: the sweep's single work-scope folder. "Agents never invent their own temp dirs; one sweep, one folder." |
| The harness | The exact way to drive the surface, with a working example to copy, and how to capture evidence (screenshots, response bodies, console/network errors) |
| The discipline | Use runtime observation only and never substitute a unit test. Exercise the happy path, **then probe around it** (empty input, conflict, double-submit, a deliberately triggered error). |
| Collision-scoping | Mutation-heavy slices pinned to distinct surfaces; agents flag any cross-interference they notice |
| Constraints | Don't fix, don't commit or push, don't touch production |
| Output schema | So results merge instead of arriving as prose |

**Phase 2: fan out.** One subagent per slice, concurrently, each with
`contract + its scope line`. Size the team to the surface: "a few slices for 'any
obvious breakage', a larger team for 'be exhaustive'." Log what each slice
covered "so gaps are visible rather than silent."

**Phase 3: corroborate (rigid; this is the skill).** Every returned finding is
a **lead**:

- **Tier by stakes.** Anything that would move the verdict: blockers,
  regressions, root-cause claims, mediums; you reproduce firsthand at the
  surface. A cosmetic or low finding backed by a captured artifact can be
  accepted as-is.
- **Reproduce, don't trust.** Re-drive the lead. "A finding you cannot reproduce
  is **dropped with a note**, not softened into a hedge."
- **Regression vs pre-existing.** Settle it against a baseline: the prior build,
  branch, or main. "A 'bug' that also reproduces on the baseline is pre-existing,
  not a release blocker."
- **Close the gaps agents hit.** A subagent's BLOCKED is yours to resolve: find
  another path (inject data to reach an unreachable state, use a second identity).
  Never substitute a unit test for an unreachable runtime path.
- **Tag every survivor with how it was verified**: firsthand-reproduced,
  agent-artifact, or baseline-diff. "Confidence is part of the finding."

**Phase 4: synthesize.** Dedup across slices, categorize by a meaningful
dimension, lead with the ship / no-ship call, then the findings: each with what
was done, what was observed, severity, regression-vs-pre-existing, and how it was
verified. Raw captures go in an evidence appendix the body cites. State the gaps
explicitly: "silence reads as 'covered', which it wasn't."

## The agent output schema

Each agent returns, per item in its slice:

`area · whatIDid · observed (+ evidence ref) · verdict (PASS | FAIL | PARTIAL |
BLOCKED) · severity · regression (suspected) · confidence`

plus a one-line slice summary and the list of evidence artifacts it saved.
Severity runs `blocker` / `high` / `medium` / `low` / `cosmetic`; confidence runs
`high` / `medium` / `low`.

The skill also carries an **optional** appendix that encodes Phases 2–4 as a
deterministic pipeline with inline JSON schemas, so that on a repeatable sweep
"the verify-loop can't be forgotten": each slice's findings are corroborated by
an *independent* agent with no finder context, and findings that don't reproduce
are surfaced in a `dropped` bucket rather than hidden. Even with the pipeline:
"**you still personally reproduce anything that would move the verdict**."

## Common questions

**It refused to fan out and did the pass inline. Why?**
The Phase 0 decomposition gate. Either the surface didn't split into independent
slices, or the slices shared mutable state with no isolation available. Fanning
out anyway would corrupt the very state under test. A model given a
non-decomposable, write-heavy surface with no isolation is expected to decline
the team and do the pass inline; that is one of the skill's stated acceptance
checks ([decision](../decisions/qa-sweep.md)).

**It reported BLOCKED before dispatching anyone.**
Smoke failed. The artifact didn't boot or its top-level surfaces didn't respond,
and the skill stops there rather than paying for a team to explore a broken
build.

**An agent found a bug and the final report doesn't mention it.**
Two possibilities, and the report distinguishes them. Either it didn't reproduce
firsthand and was **dropped with a note**: the skill refuses to soften an
unreproducible claim into a hedge, or it reproduced on the baseline too and was
classified pre-existing rather than a release blocker. Both outcomes are stated
explicitly; neither is silently dropped.

**A subagent came back BLOCKED. Doesn't that just become a coverage gap?**
No. "Gaps are yours." The lead is expected to find another path: inject data to
reach an unreachable state, use a second identity, rather than waving it
through. Only what genuinely could not be reached lands in the stated gaps.

**Can it run against a test harness or unit tests instead of the app?**
No. The discipline is runtime observation, and the skill explicitly forbids
substituting a unit test for an unreachable runtime path. If there is no runnable
artifact, this is the wrong skill.

**We can't run the exact release build. Can it use a near-identical one?**
Only if you "prove the substitution is behavior-faithful (diff it) and say so in
the report." The substitution has to appear in the write-up, not just in your
head.

**Where does all the evidence go?**
Into the sweep's single work-scope folder (`.workbench/<work_scope>/`, or the
repo's scratch equivalent), handed to every agent in the contract. This was
tightened after an audit run left its evidence spread across three per-agent
system-temp directories that all belonged to one work scope
([decision](../decisions/evidence-one-home-per-scope.md)). One sweep, one folder.

**Will it fix the bugs it finds?**
No. "Stop at the verdict, not the fix." The sweep reports; acting on the findings
is your separate step.

**Will a session run this on its own after finishing some work?**
It should not. This is an offered tier, not a default one; it runs on your
explicit ask, including a standing rule you set, or as `audit`'s team-sweep pick.
The always-on completion gate is `verification-before-completion`, not this.

**How is this different from just dispatching parallel agents?**
The design record answers directly: a generic parallel dispatch "stops at 'review
each summary'." The load-bearing content here is the decomposition gate and the
firsthand-corroboration loop, which no generic fan-out encodes.

## It's working if

- The first thing you read is a ship / no-ship call, not a findings dump.
- Every finding carries how it was verified: firsthand-reproduced,
  agent-artifact, or baseline-diff.
- Regressions are separated from pre-existing bugs by an actual baseline
  comparison you can point at.
- Claims that didn't reproduce appear in the report as dropped, with a note.
- Coverage gaps are named, so silence never reads as coverage.
- All evidence is in one scope folder, referenced by an appendix.
- **Not working:** a polished report that merges the agents' summaries with no
  firsthand reproduction behind any verdict-moving finding; a "blocker" that
  nobody re-drove; per-agent temp directories scattered around the filesystem; a
  team dispatched against a surface whose slices all write to the same database.

## Where it fits

`qa-sweep` is one of the two engines at the workbench flow's **entry**: door A,
"verify · hunt · check." You size the workload, `audit` dispatches this engine
for the team-sweep tier, and the verdict either ends the work or reveals work
that routes onward through `brainstorming` or the route pick. Its nearest
neighbor is `claim-check`, the other engine: same "treat it as a hypothesis, go
verify" spine, but aimed at one premise investigated against the repo rather than
a broad running surface. On the completion side, `empirical-proof` is the
single-change version of the same runtime discipline, and
`verification-before-completion` is the always-on gate both of them deepen.
