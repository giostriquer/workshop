# empirical-proof

## What it does

`empirical-proof` proves a just-finished change **at the running software**.
It starts the real app, or finds one already running. It drives the surface the
change touched through the same boundary a real client uses, records each
exchange word for word, and returns one of three verdicts: `verified`,
`broken`, or `blocked`. A "verified" must trace back to a recorded exchange.
Reading the code, passing unit tests, mocks, and in-process harnesses don't
count.

Each attempt keeps its revision, transcripts, and verdict. An authorized
repair leads to a new attempt.

## When to reach for it

Ask for it after finishing a change that touched a surface a real client can
drive: an MCP tool, a REST endpoint, runnable app behavior, or a generator's
emitted artifact. It is an expensive tier. The session offers it and runs it
only when you ask, either now or through a standing rule
([decision](../decisions/workbench-operator-decisions.md)). A repo process
document that requires driving the real artifact counts as that standing ask,
and the session names that gate when it runs the proof.

| The problem | The skill |
| --- | --- |
| One finished change touched a drivable surface | `empirical-proof` |
| Exploring a running surface for unknown bugs | No skill; ordinary session work |
| A release, branch, or feature area at team scale | `qa-sweep` |
| A premise, ticket, or hunch to prove or break | `claim-check` |
| About to claim done | `verification-before-completion` |

## The gate, the scenarios, the verdicts

**The gate (rigid) runs before any scenario.**

1. Find the documented way to run the project: a run skill, the README, or
   package scripts.
2. Prefer an instance that is already running. Health-check it, and record the
   endpoint and its exact response. Without a recorded health-check, nothing
   downstream counts.
3. Confirm the instance is running the change. If you're unsure, restart it.
4. Otherwise start it yourself. Anything the docs prescribe is in scope:
   installs, env setup, builds, the dev server, and a clean retry. Repairing
   the *machine* is not in scope, meaning a broken toolchain, a missing
   service, or config drift.
5. "One failed launch is not a blocked verdict; a documented path you have
   actually exhausted is."

**Don't fake the environment.** If the app can't reach a database, credential,
or service it needs, the verdict is `blocked`. Never stub a listener, fake an
env var, or edit the boot check to get past it
([decision](../decisions/empirical-proof.md)).

**Generated code.** A generator's output is the surface. Run the generator,
then build, boot, and drive what it emits. A failure the evidence ties to the
emitted artifact is `broken`. Missing credentials or services are `blocked`.

**Scenarios.** When MCP tools or REST endpoints are touched, they must be
covered. MCP tools go through a real MCP client, and REST endpoints get real
HTTP. For each surface, run the happy path and then probe it with invalid
input, boundary and coercion cases, the error path, and auth. Scale the number
of scenarios to the blast radius. A surface tested only on the happy path is
**incomplete**.

**Fan-out and corroboration.** Every agent gets the same contract: environment
facts and the single evidence folder; real boundary only, fix nothing, stop
what it starts and confirm the stop; and a schema of scenario, exact
invocation, verbatim response, observed vs expected, PASS / FAIL / BLOCKED. A
verdict without a transcript is void. The session re-drives every FAIL and at
least one PASS per surface itself.

| Verdict | Means | Carries |
| --- | --- | --- |
| `verified` | Every scenario passed | Per-surface transcripts |
| `broken` | Scenarios failed | Expected vs observed; the attempt is preserved |
| `blocked` | The app can't honestly come up | The failure verbatim and the one unblock |

The report opens with the verdict. It then lists the scenarios run per surface
and any gaps left unrun. It ends with a cleanup line that cites how each stop
was confirmed.

## Common questions

**I asked it to hunt bugs, and it reported `blocked` after a launch failure.**
The wrong protocol ran. Hunting is ordinary session work: set up, start the
dev server, drive the app. Even here, one failed launch isn't `blocked`.

**If launching is in scope, why won't it stand up the missing database?**
Starting the app is setup. A stub that stands in for a real dependency is
fabrication. A service booted against a stub isn't the artifact that ships.

**It found a real bug. Why didn't it fix it?**
The attempt keeps the failure on record. It never reports a PASS after a silent
fix. If you authorized repairs, they come next, followed by a new attempt.

**My unit tests are green. Isn't that enough?**
No. Tests gate the change but don't prove it.

**My repo's `AGENTS.md` requires booting the app. Does the session still just
offer?**
No. That requirement counts as the invitation, so it runs.

**Should it clean up its logs?**
No. It stops its processes and proves the stop, but it leaves the logs alone.
They are the evidence.

## It's working if

- The verdict comes first, and every pass cites a real transcript.
- Probes run alongside the happy paths.
- A `blocked` verdict quotes the failure and names the one thing that would
  unblock it.
- Product code doesn't change during an attempt.
- **Not working:** it ran with no ask, rule, or repo gate; it went hunting for
  bugs; it reported `blocked` after one failed launch; "verified" rests on tests
  or reading the code; or the environment was stubbed.

## Where it fits

This is the deep form of the completion gate. `verification-before-completion`
is the floor for every done-claim; this skill, when asked for, supplies that
evidence from the running software. Once the work is verified, the required
adversarial review runs, then the PR-or-merge question.
