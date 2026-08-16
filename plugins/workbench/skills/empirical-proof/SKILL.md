---
name: empirical-proof
description: Use when a just-finished change touched a surface a real client can drive (an MCP tool, a REST endpoint, runnable app behavior, or a generator's emitted artifact) and the user asked for empirical verification (offer it otherwise; never run it uninvited). NOT for a release- or branch-wide pass (qa-sweep), verifying a premise or ticket (claim-check), or driving an app to hunt for unknown bugs in a surface, which is ordinary session work rather than this protocol.
---
# Empirical Proof

Prove finished work **at the running software**, not on paper. The deliverable is
a verdict (`verified`, `broken`, or `blocked`) where every "verified" traces to
a recorded exchange with the real running app. This skill **runs the proof**; it
does **not** fix what it finds, and it does **not** fix the environment it runs
in: both are the operator's separate step.

## When to use

After finishing work that touched a surface the running software can prove: an
MCP tool, a REST API endpoint, any behavior a client can drive, and before
reporting it done.

**Not for** a release- or branch-wide pass (`qa-sweep`), verifying a premise or
ticket (`claim-check`), diffs with no runtime surface (docs, pure test changes),
or **driving an app to hunt for unknown bugs in a surface**.

That last one is the misfire worth naming, because this is the only skill in the
flow that says "drive the running app", so exploratory hunting gets pulled here
and then inherits a gate and a verdict set built for proving *one finished
change*. Nothing is under test when you are hunting, so `verified` / `broken` /
`blocked` have nothing to attach to, and reaching for the `blocked` exit after a
launch hiccup ends a hunt that ordinary dev setup would have started. Hunting a
surface is ordinary session work: get the app up, drive it, reproduce what you
find, report it.

## The one rule that makes this proof

**A scenario counts only if it ran against the genuinely running app, over the
real boundary, and left a transcript.** Code reading predicts; green unit tests
are prerequisites; a mocked tool call or an in-process harness exercises a
different artifact. None of them verify. When that standard cannot be met, the
honest report is `blocked` or `not verified`, never a dressed-up "should work."

## Gate: the app is running, and it is the right app (rigid)

Before any scenario is dispatched:

1. **Find the documented way to run this project**: a project run skill,
   README, package scripts. That documented path defines what "can run here"
   means.
2. **Prefer an instance that is already running; health-check it and record the
   evidence** (the exact endpoint hit and its verbatim response). No recorded
   health-check → nothing downstream counts.
3. **Confirm the instance carries the change under test**: a stale process
   proves old code. Restart via the documented path when in doubt.
4. **Otherwise, start it yourself via the documented path.** Everything the
   project's own docs prescribe is in scope: install dependencies, copy the
   example env, build first, run the dev server: as is a clean retry when the
   first attempt fails for a reason the docs let you fix. A fresh worktree or a
   clean install is ordinary setup, not environment fabrication. What stays out
   of scope is repairing the *machine*: a broken toolchain, an absent service,
   local config drift.
5. **`blocked` is the last resort, not the first exit.** One failed launch is
   not a blocked verdict; a documented path you have actually exhausted is.
   Report it when the app cannot come up without something only the operator can
   supply: a credential, an unreachable service, a dependency you must not fake:
   quoting the observed failure verbatim and naming the one thing that would
   unblock it.

**Do not conjure the environment.** A boot gate that needs an unreachable
database, credential, or service is a *blocked* verdict. It is not an invitation to
stub a TCP listener, point an env var at a fake, or edit the boot check. A
service booted against a fabricated dependency is not the artifact that ships,
no matter how unrelated the change looks from inside: sessions under ship
pressure have done exactly this, every time reasoning "the change never touches
the DB."

## When the deliverable is generated code

A generator, scaffolder, or emitter has no app of its own to boot: its
runnable surface is **the artifact it emits**. The proof: run the generator
via the documented path, then build and drive the emitted artifact the way
its real consumer would: compile it, boot it, hit its endpoints. The gate
above applies to that artifact; reading the emitted source is still reading,
not proof. One boundary shift: an emitted artifact that fails to build or
boot is a **`broken` verdict against the generator**, not `blocked`: the
generator's output is the change under test.

## Scenarios: what to prove

From the diff, list the touched runnable surfaces. Two get named because they
are the ones this skill exists for: **if the change touched them, they must be
covered**:

- **MCP tools**: drive them through a real MCP client connection (the repo's
  client, an MCP inspector CLI): the same protocol path a real client takes.
  Importing the handler and calling it is not MCP.
- **REST API endpoints**: real HTTP against the running port. An in-process
  request harness is not the wire.

Any other runnable surface follows the same principle: the boundary a real
client hits, nothing shallower.

Per surface, write a small scenario matrix: the happy path, **then probes**:
invalid and missing input, boundary and type-coercion cases, the error path,
auth/permission where relevant. Right-size to blast radius: a one-line change
earns a handful of scenarios, a new endpoint earns the full matrix. A surface
with only its happy path exercised is **incomplete**, not verified.

## Fan out: scenarios to subagents, under an evidence contract

Dispatch subagents for scenario breadth (a trivial surface may be driven
directly: the contract below applies either way). Every agent receives the
same contract:

- **Environment facts**: base URL/port or connection handle, auth, one working
  example invocation to copy, and the **evidence directory**: the work
  scope's single folder (`.workbench/<work_scope>/`, or the repo's scratch
  equivalent) where every transcript and artifact lands. Agents never pick
  their own temp dirs; one proof, one folder.
- **The discipline**: real boundary only; probe beyond the happy path; fix
  nothing (not product code, not setup); stop any process you start **and
  confirm the stop** (port closed, process gone: a cleanup claim is a claim
  like any other); leave the workspace as found: logs included.
- **The schema**: per scenario:
  `scenario · exact invocation sent · verbatim response · observed vs expected · PASS / FAIL / BLOCKED`

A returned verdict without its transcript is **void**: redo it, don't argue
with it.

## Corroborate before you report (rigid)

Subagent results are leads. Firsthand, re-drive **every FAIL** and **at least
one claimed PASS per touched surface**: a fabricated or mistaken transcript
dies here, cheaply. A subagent's BLOCKED is yours to resolve within the gate's
rules or to report; never wave it through, and never substitute a unit test for
the runtime path it couldn't reach.

## Report

Verdict first: one of:

- **`verified`**: every scenario passed; per-surface results follow, each
  citing its transcript.
- **`broken`**: the failing scenarios with their evidence, expected vs
  observed. **Report the break; do not fix it.** A "verified after I fixed it
  in passing" is unreviewed implementation wearing a verification badge: the
  finding goes to the operator, the fix is their call.
- **`blocked`**: what the gate observed (verbatim), and the one input that
  would unblock.

Then: scenarios run per surface (so coverage is visible), gaps left unrun
(silence reads as covered), and a cleanup line: what you started and stopped,
citing the check that proved the stop, and what you left untouched.

## Rationalizations, observed

| Excuse | Reality |
|---|---|
| "The change doesn't touch the DB, a stub gets us past boot" | You cannot see the blast radius from inside the change; the artifact that ships boots against the real dependency. `blocked` + ask. |
| "I found the bug and fixed it while I was there: saves a round trip" | Now the report certifies code nobody reviewed. Report `broken`; the fix is the operator's step. |
| "Unit tests already cover this logic" | A repo can hold 4/4 green tests and a live type-coercion hole at the same time: the baseline for this skill did. Tests gate; they don't prove. |
| "I read the code path; it clearly works" | Reading predicts. The verdict requires a transcript. |
| "The happy path returned 201, we're good" | Every baseline bug lived outside the happy path. Probes are the proof. |
| "Cleaning up: removed the request log" | That log is the evidence. Stop your processes; leave the artifacts. |

## Red flags: STOP, you are about to cheat the proof

- Editing product code while "verifying" it
- Setting a fake env var, stub listener, or dummy service to get past a boot
  check
- Writing "verified" backed by tests, build output, or code reading
- Accepting a subagent PASS/FAIL with no transcript attached
- "Should work", "clearly correct", "the logic guarantees" in a verification
  report

## Rules

- No transcript, no verdict: `verified` means recorded exchanges with the
  genuinely running app over the real boundary, never tests, mocks, harnesses,
  or reading.
- Gate first: a recorded health-check on the right build before any scenario
  counts; start it yourself via the documented path, retry included.
- `blocked` is a first-class honest outcome but the last resort, not the first
  exit: cause verbatim + the one unblock, then stop. One failed launch is not a
  blocked verdict. Never fabricate a dependency to proceed.
- MCP tools and REST endpoints, when touched, are must-cover: driven through a
  real client connection / real HTTP respectively.
- The happy path never suffices: probe invalid input, coercion cases, the error
  path.
- Subagents return evidence, not verdicts alone; re-drive every FAIL and one
  PASS per surface before reporting.
- Report `broken`, don't repair it: the skill stops at the verdict, for setup
  and for bugs alike.
- Stop what you started and prove the stop (port closed, process gone); leave
  the workspace and its logs as found.
