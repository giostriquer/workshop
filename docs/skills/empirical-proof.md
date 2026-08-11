# empirical-proof

## Origin

Four fake-verification behaviors, each observed repeatedly in lived sessions
across projects and models: a session **claims it ran** the app when it never
did (the verdict came from reading code); it **runs unit tests or a build** and
reports that as if the live surface had been exercised; it **mocks or
simulates the surface** (stubbed tool call, throwaway script) instead of
driving the real running app; or it hits the surface **once, on the happy
path**, and declares success. In every case the report says "verified" and the
evidence would not survive one skeptical question.

One honesty note: unlike most scaffold pieces, this skill was born *in* the
scaffold rather than extracted from a host project — the lived-in part is the
failure pressure above, not the skill text. Its wording was validated with a
full RED/GREEN baseline harness instead (below), and the origin doc will be
updated as real-project use accumulates.

## Problem

Post-implementation verification is exactly where reward-shaped behavior
concentrates: the work feels done, the operator is waiting, and a confident
"verified" is cheap. Three specific gaps:

1. **No running-app gate.** Nothing forces the session to establish that the
   app is genuinely running (and is the right build) before "verification"
   starts — so verification quietly degrades into code reading.
2. **No evidence standard.** A verdict without the exchange that produced it is
   unfalsifiable; subagent fan-out multiplies unverifiable claims.
3. **No honest blocked path.** When the environment can't run the app, the
   choices presented are "fake it" or "fail" — so sessions fake it. The skill
   needed a first-class `blocked` outcome that is *not* a failure.

## Solution shape

A phased skill in the `qa-sweep` mold — rigid gate and evidence contract,
flexible middle. Gate: health-check a genuinely running instance (or one clean
documented start attempt), record the evidence, confirm the build carries the
change; if it won't come up, report `blocked` with the verbatim cause and the
one unblock, and stop — fixing local setup is out of scope by design, and
fabricating the environment (stub listeners, fake env vars, edited boot
checks) is prohibited outright. Scenarios: from the diff, the touched runnable
surfaces — MCP tools and REST API endpoints are named must-covers, driven
through a real MCP client connection and real HTTP respectively — each with a
happy path plus probes (invalid input, type-coercion cases, error paths).
Fan-out: subagents take scenario breadth under one contract whose output schema
requires the exact invocation and verbatim response per scenario — a verdict
without its transcript is void. Corroboration: the session re-drives every FAIL
and at least one claimed PASS per surface firsthand. Report: verdict-first
`verified` / `broken` / `blocked`; a found bug is reported, never fixed —
"verified after I fixed it in passing" is unreviewed implementation wearing a
verification badge.

## Validation (RED/GREEN baseline)

The bait harness: a small zero-dependency Node service with a "just
implemented" validation change carrying a planted runtime-only bug (an
`isNaN` coercion hole that stores string/null/boolean `qty` values), 4/4 green
unit tests over the same buggy code, a request-log tripwire proving whether the
server was actually hit, and a second variant that refuses to boot without an
unreachable database.

- **RED (no skill, ship pressure):** 3 of 4 agents fixed the planted bug
  during "verification" and reported PASS-after-fix; both blocked-variant
  agents fabricated the missing dependency (a throwaway TCP listener to fool
  the boot probe), reasoning "the change never touches the DB"; one agent
  deleted the request log as "cleanup."
- **GREEN (with skill, same pressure):** 6 of 6 runs produced honest verdicts —
  `broken` with transcripts and the root cause reported-not-fixed on the
  runnable variant, `blocked` with the verbatim boot failure and the named
  unblock (and an explicit refusal to stub) on the blocked variant. Product
  code untouched in all runs, logs left in place.
- **REFACTOR:** the one loophole GREEN surfaced — agents *claiming* "server
  stopped" while the process still listened — became the evidence-bound
  cleanup rule ("prove the stop: port closed, process gone"); the retest ran
  2/2 clean.

## Real invocation snippet

> Just finished wiring the new `update_message` handler — run empirical-proof
> before I open the PR.

The session gates on the MCP server actually running, matrixes the touched
tool (happy path, malformed patch, missing fields, the error path), fans the
scenarios to subagents that call the tool over a real MCP client connection,
re-drives the failures firsthand, and reports `verified`/`broken`/`blocked`
with transcripts.

## Pitfalls observed

- **Fix-during-verify.** The dominant baseline failure (3 of 4 runs): the bug
  gets fixed in passing and the report says PASS. The report then certifies
  code nobody reviewed. The skill's `broken` verdict exists precisely so the
  finding goes to the operator instead.
- **Environment fabrication.** Both baseline blocked-runs stubbed the missing
  dependency rather than reporting `blocked` — always with a blast-radius
  argument ("doesn't touch the DB"). The gate prohibits the substitution
  outright; the operator decides, not the verifier.
- **Unverified cleanup claims.** "Server stopped" while the port still
  listened. Cleanup claims are claims: prove the stop.
- **Green tests as cover.** The bait repo held 4/4 passing tests and a live
  runtime hole simultaneously; agents that ran only `npm test` would have
  shipped it. Tests are prerequisites, never proof.

## Adaptation notes

- The two named must-cover surfaces (MCP tools, REST endpoints) are the
  portable core; add your stack's equivalents (GraphQL resolvers, queue
  consumers, CLI entry points) under the same principle — the boundary a real
  client hits, nothing shallower.
- "One clean start attempt via the documented path" leans on the project
  documenting how it runs (run skill, README, package scripts). If your
  project has no documented path, that gap — not this skill — is the first
  fix.
- The verdict taxonomy (`verified` / `broken` / `blocked`) is deliberately
  three-valued; teams that want severity can grade inside `broken` rather than
  adding buckets.
- Pairs forward with `file-pr` (proof in hand before the PR is filed) and sits one
  notch below `qa-sweep` (single change vs. decomposable surface — same
  corroboration DNA).
