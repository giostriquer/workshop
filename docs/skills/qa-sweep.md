# qa-sweep

## What it does

`qa-sweep` runs QA over a surface too broad for one session to cover: a
release, a branch, a feature area, or a whole app. It splits the surface into
slices and sends subagents to drive the **real running artifact**. Then it
reproduces firsthand every finding that could change the verdict. The result is
a ship / don't-ship verdict with categorized, **corroborated** findings.

Phase 0 and Phase 3 are rigid. Slicing, harness, and team size bend to the
task. The sweep fixes nothing. Repairs you already authorized come after its report.

## When to reach for it

Invoke it by name (`/qa-sweep`) with the surface and the verdict you owe, or
pick `audit`'s **team sweep** tier. It is an expensive tier. A session offers
it and runs it only when you ask, either now or through a standing rule.

Use it only when all three hold:

- The surface splits into independent slices that share little state.
- A runnable artifact (an app, service, or CLI) can be observed.
- The breadth justifies a team plus your own corroboration.

| The problem | The skill |
| --- | --- |
| A broad runtime surface that splits into slices | `qa-sweep` |
| One code change with a drivable surface | `empirical-proof` |
| One premise, ticket, or hunch | `claim-check` |
| A surface that won't split, or writes with no isolation | Inline pass, or isolate first |

## The one rule that makes it trustworthy

"**A subagent's finding is a hypothesis, not a finding, until you reproduce it
yourself at the running surface.**" Fan-out multiplies wrong claims as fast as
it multiplies coverage ([decision](../decisions/qa-sweep.md)).

## The five phases

**Phase 0: scope, gate, smoke (rigid).**

1. Name the one verdict you owe, for example "is this release safe to cut?"
2. **Decomposition gate.** Isolate slices that share mutable state, using
   separate accounts, worktrees, or containers, or read-only access. If you
   can't split the surface or isolate its slices, do the pass inline.
3. Run the **real** artifact. A substitute build must be proven to behave the
   same, and the report must say so.
4. **Smoke before you spend.** First try the documented, authorized setup and
   retries. If the artifact still doesn't boot, report what you observed and
   don't dispatch the team. A product boot defect is the product's fault. A
   missing prerequisite is BLOCKED.

**Phase 1: the operating contract.** Every agent gets the same preamble, and
only the scope line differs. The preamble covers:

- environment facts, including the sweep's single evidence folder
  (`.workbench/<work_scope>/`)
  ([decision](../decisions/workbench-operator-decisions.md))
- the harness, with a working example
- runtime observation only: the happy path, then probes such as empty input,
  conflicts, and double-submits
- separate surfaces for slices that do heavy writing
- no fixing, committing, pushing, or touching production
- the output schema

**Phase 2: fan out.** One subagent per slice, run concurrently, with each
slice's coverage logged.

**Phase 3: corroborate (rigid; this is the skill).** Every finding is a lead
until checked.

- **Tier by stakes.** Anything that could move the verdict (blockers,
  regressions, root-cause claims, mediums) gets reproduced firsthand. A low or
  cosmetic finding backed by a captured artifact can stand as is.
- **Reproduce, don't trust.** A finding that doesn't reproduce stays
  **uncorroborated**, or **blocked** when a prerequisite is missing. It is
  **disproved** only by contrary evidence.
- **Regression or pre-existing?** Decide against a baseline, and record the
  answer separately from severity. Pre-existing defects can still block
  release.
- **Close the gaps.** A subagent's BLOCKED is yours to resolve. A unit test
  never stands in for a runtime path you couldn't reach.
- **Tag each finding** as reproduced firsthand, backed by an agent's artifact,
  or confirmed by a baseline diff.

**Phase 4: synthesize.** Remove duplicates and categorize. Lead with the
ship / no-ship call, then list findings with severity, regression status, and
how each was verified. Put raw captures in an appendix. State any coverage
gaps, unresolved leads, and disproved claims.

## The agent output schema

Each item reports: `area · whatIDid · observed (+ evidence ref) · verdict (PASS
| FAIL | PARTIAL | BLOCKED) · severity · regression (suspected) · confidence`.
The agent adds a slice summary and lists the evidence it saved.

For sweeps you run repeatedly, an optional workflow corroborates each finding
with an independent agent. You still reproduce, yourself, any finding that
could change the verdict.

## Common questions

**It refused to fan out. Why?**
The slices weren't independent, or they shared mutable state that couldn't be
isolated.

**It stopped before dispatching anyone.**
Smoke failed. It then either reported a product failure or marked the sweep
BLOCKED.

**A finding didn't reproduce. Is it false?**
Not automatically. The report keeps it as uncorroborated or blocked.

**Can it run unit tests instead of the app?**
No. If nothing runs, this is the wrong skill.

**We can't run the exact release build.**
A near-identical build works if you prove it behaves the same and declare the
swap.

**Will a session run this on its own?**
No, it's an offered tier. The gate that always runs is
`verification-before-completion`.

## It's working if

- It leads with ship or no-ship.
- Every finding says how it was verified.
- A baseline separates regressions from pre-existing bugs.
- Findings that don't reproduce stay uncorroborated, not disproved.
- It names coverage gaps.
- All the evidence lives in one scope folder.
- **Not working:** agent summaries merged without reproduction, a "blocker"
  nobody re-drove, or evidence scattered across temp directories.

## Where it fits

`qa-sweep` is one of the two engines behind door A ("verify · hunt · check"),
next to `claim-check`. At completion, `empirical-proof` applies the same
discipline to a single change. `verification-before-completion` is the gate
that always runs, and both sweeps and proofs build on it.
