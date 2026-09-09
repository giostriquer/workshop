---
name: qa-sweep
description: Use when running a broad QA or verification pass over a release, branch, feature, or app surface that splits into independent slices and deserves team-scale coverage against the real running artifact, on the user's ask (directly or as audit's team-sweep pick), never by default. NOT for a single code change (that is empirical-proof) or a single premise, ticket, or hunch (that is claim-check).
---

# QA Sweep

Run a thorough QA pass on a surface too broad for one session to cover, **without
trading rigor for parallelism**. The deliverable is a ship / don't-ship verdict
plus categorized, **corroborated** findings, not a pile of unverified agent
claims. This skill **runs the sweep**: it fans out a QA team, reproduces the
findings that matter firsthand, and synthesizes the report. It does **not** fix
what it finds during the sweep. A standalone sweep ends at its report; an
already-authorized implementation task can resume afterward with the evidence preserved.

## When to use

Use when ALL of these hold:

- The surface **decomposes into independent, low-shared-state slices**: features,
  routes, areas, flows.
- There is a **runnable artifact to observe**: an app, a service, a CLI. QA here
  is *runtime observation*, not code reading.
- Breadth justifies the cost of a team **plus** your own corroboration on top.

Reach for a cheaper tool instead when:

- It's **one code change**; that's `empirical-proof`; you don't need a team.
- It's **one premise, ticket, or hunch**; that's `claim-check`.
- The surface **won't decompose**, or it's write-heavy with **no isolation
  available** (parallel mutation will corrupt the shared state you're testing).
  Do it inline, or isolate first.

## The one rule that makes this trustworthy

**A subagent's finding is a hypothesis, not a finding, until you reproduce it
yourself at the running surface.** Fan-out multiplies coverage, and it
multiplies plausible-but-wrong claims at the same rate. The corroboration loop
(Phase 3) is the non-negotiable half: skip it and you have built a
confident-nonsense generator that *looks* thorough. Codify the check harder than
the fan-out. Everything else here: how you slice, which harness, how many
agents: bends to the task; **Phase 0 and Phase 3 do not.**

## Phase 0: Scope, gate, smoke (rigid)

1. **Name the surface and the verdict you owe.** Write it down: e.g. "is this
   release safe to cut?" The whole sweep serves that one question.
2. **Decomposition gate.** List the independent slices. If they share mutable
   state, can you isolate them: distinct accounts / sites / worktrees /
   containers, or read-only access? If you can **neither decompose nor isolate**,
   STOP: fan-out is theater here, and parallel writers will corrupt the shared
   state you're testing. Do it inline.
3. **Get the real artifact running, faithfully.** Verify the *actual* thing under
   test. If you must substitute a near-identical build or image, **prove the
   substitution is behavior-faithful** (diff it) and say so in the report.
4. **Smoke before you spend.** Confirm the artifact boots and its top-level
   surfaces respond before committing a team to deep work. Smoke fails → report
   the observed failure and do not dispatch the team. Try documented authorized
   setup/retries first. Attribute a product boot defect to the product; missing
   verifier prerequisites are BLOCKED. A team on an unusable build wastes tokens.

## Phase 1: Write the operating contract (rigid scaffold, task-specific content)

One shared preamble every agent receives **verbatim**; only the **scope line**
differs per agent. It must carry:

- **Environment facts**: base URL / handle, how to authenticate, the entry
  points, seed / data state, and the **evidence directory**: the sweep's
  single work-scope folder (`.workbench/<work_scope>/`, or the repo's scratch
  equivalent) that every agent writes its evidence into. Agents never invent
  their own temp dirs; one sweep, one folder.
- **The harness**: the exact way to drive the surface (the runner, plus a working
  example to copy) and how to capture evidence (screenshots, response bodies,
  console / network errors).
- **The discipline**: *runtime observation only*: drive the real surface, never a
  unit test as a substitute; do the happy path, **then probe around it** (empty
  input, conflict, double-submit, a deliberately triggered error).
- **Collision-scoping**: pin mutation-heavy slices to distinct surfaces, and tell
  agents to flag any cross-interference they notice.
- **Constraints**: what's out of bounds: don't fix, don't commit or push, don't
  touch production.
- **A structured output schema** (below), so results merge instead of arriving as
  prose.

## Phase 2: Fan out the QA team

Dispatch one subagent per slice, concurrently, each with `contract + its scope
line`. Each returns the structured schema. Size the team to the surface: a few
slices for "any obvious breakage", a larger team for "be exhaustive". **Log what
each slice covered** so gaps are visible rather than silent.

## Phase 3: Corroborate (rigid; this is the skill)

Treat every returned finding as a **lead**. Then:

- **Tier by stakes.** Anything that would move the verdict: blockers,
  regressions, root-cause claims, mediums; you reproduce **firsthand at the
  surface**. A cosmetic / low finding backed by a captured artifact (a screenshot,
  a response body) can be accepted as-is with that evidence status stated.
- **Reproduce, don't trust.** Re-drive the lead. If a root cause is claimed,
  confirm it at the source (read the code; inspect the DOM / the wire). A finding
  remains **uncorroborated** if it was observed but cannot be reproduced. Mark it
  **disproved** only with contrary evidence, or **blocked** when prerequisites
  prevent reproduction. One failed reproduction does not refute the observation.
- **Regression vs pre-existing.** Establish it by diffing against a baseline: the
  prior build, branch, or main. Never assume: a "bug" that also reproduces on the
  baseline is pre-existing. Record origin separately from severity and release
  acceptance: pre-existing defects may still block release under the stated criteria.
- **Close the gaps agents hit.** A subagent "BLOCKED" or "couldn't reach it" is
  *yours* to resolve: find another path (inject data to reach an unreachable
  state, use a second identity) rather than waving the gap through. Do not
  substitute a unit test for an unreachable runtime path.
- **Tag every survivor with how it was verified**: firsthand-reproduced /
  agent-artifact / baseline-diff. Confidence is part of the finding.

## Phase 4: Synthesize

- **Dedup** across slices; **categorize** by a meaningful dimension (product area /
  severity / owner).
- **Verdict first.** Lead with the ship / no-ship call, then the findings: each
  with what was done, what was observed, severity, regression-vs-pre-existing, and
  how it was verified. Raw captures go in an **evidence appendix**; the body cites
  them.
- **State the gaps.** Coverage you didn't reach, unresolved leads, and disproved claims go in
  explicitly: silence reads as "covered", which it wasn't.

## Agent output schema (keep results mergeable)

Each agent returns, per item in its slice:

`area · whatIDid · observed (+ evidence ref) · verdict (PASS | FAIL | PARTIAL |
BLOCKED) · severity · regression (suspected) · confidence`

plus a one-line slice summary and the list of evidence artifacts it saved.

## Optional: make the corroboration un-skippable with a workflow

For a repeatable sweep, encode Phases 2–4 as a deterministic pipeline so the
verify-loop can't be forgotten. Each slice's findings are corroborated by an
**independent** agent (no finder context, which provides the adversarial part) as soon as
that slice reports:

```js
export const meta = {
  name: 'qa-sweep',
  description: 'Fan out QA over slices, corroborate each finding independently, synthesize',
  phases: [{ title: 'Fan-out QA' }, { title: 'Corroborate' }],
}

// args = { surface: '<url/handle>', contract: '<shared preamble>', slices: [{ label, scope }] }

const SLICE_SCHEMA = {
  type: 'object',
  required: ['sliceSummary', 'findings', 'evidence'],
  properties: {
    sliceSummary: { type: 'string' },
    evidence: { type: 'array', items: { type: 'string' } },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        required: ['area', 'whatIDid', 'observed', 'verdict', 'severity'],
        properties: {
          area: { type: 'string' },
          whatIDid: { type: 'string' },
          observed: { type: 'string' },
          evidenceRef: { type: 'string' },
          verdict: { enum: ['PASS', 'FAIL', 'PARTIAL', 'BLOCKED'] },
          severity: { enum: ['blocker', 'high', 'medium', 'low', 'cosmetic'] },
          regressionSuspected: { type: 'boolean' },
          confidence: { enum: ['high', 'medium', 'low'] },
        },
      },
    },
  },
}

const VERDICT_SCHEMA = {
  type: 'object',
  required: ['evidenceStatus', 'regression', 'howVerified'],
  properties: {
    evidenceStatus: { enum: ['reproduced', 'uncorroborated', 'disproved', 'blocked'] },
    regression: { enum: ['regression', 'pre-existing', 'unknown'] },
    howVerified: { type: 'string' },
    note: { type: 'string' },
  },
}

const results = await pipeline(
  args.slices,
  slice => agent(`${args.contract}\n\nYOUR SLICE:\n${slice.scope}`,
    { label: `qa:${slice.label}`, phase: 'Fan-out QA', schema: SLICE_SCHEMA }),
  (report, slice) => parallel((report?.findings || []).map(f => () =>
    agent(`Independently corroborate this finding by driving the REAL surface at ${args.surface}.
Reproduce it firsthand. Return evidenceStatus: reproduced, uncorroborated, disproved, or blocked.
An unsuccessful reproduction is uncorroborated unless contrary evidence disproves the claim.
Unavailable prerequisites are blocked. Preserve uncertainty; do not default it to false.
Establish regression-vs-pre-existing against a baseline. Do NOT trust the original report's wording.
Finding: ${JSON.stringify(f)}`,
      { label: `verify:${slice.label}`, phase: 'Corroborate', schema: VERDICT_SCHEMA })
      .then(v => ({ ...f, slice: slice.label, verified: v })))),
)

const all = results.flat().filter(Boolean)
return {
  confirmed: all.filter(f => f.verified?.evidenceStatus === 'reproduced'),
  disproved: all.filter(f => f.verified?.evidenceStatus === 'disproved'),
  unresolved: all.filter(f => !['reproduced', 'disproved'].includes(f.verified?.evidenceStatus)),
}
```

The workflow handles breadth; **you still personally reproduce anything that would
move the verdict** (would-be blockers, claimed regressions). Automated
corroboration covers the bulk; you cover the decision-critical tail.

## Rules

- **A finding is a hypothesis until you reproduce it.** Every verdict-moving
  finding is re-driven firsthand at the running surface before it counts; one you
  cannot reproduce remains uncorroborated or blocked, not automatically disproved.
- **Gate before you fan out.** No decomposition and no isolation → no sweep; do it
  inline. Fan-out over shared mutable state corrupts what you're testing.
- **Verify the real artifact.** Test the actual thing under test; a substitute must
  be proven behavior-faithful and declared in the report.
- **Smoke gates depth.** Boot + top-level response before a team deploys; smoke
  fails → classify product failure vs blocked prerequisites; stop team dispatch, not independent authorized work.
- **One contract, one schema.** Every agent gets the same preamble and returns the
  same structured schema; only the scope line differs. Mergeable results, not
  prose.
- **Separate regressions from pre-existing issues** against a baseline. Never assume.
- **Gaps are yours.** A subagent's BLOCKED is your job to close, not to wave
  through; never substitute a unit test for an unreachable runtime path.
- **Verdict-first, confidence-tagged.** Lead with ship / no-ship; tag each finding
  with how it was verified; state unresolved/disproved claims and coverage gaps explicitly.
- **Finish the sweep before repairing.** Preserve its verdict and evidence.
  Continue subsequent repairs only under the larger task's existing authority.
