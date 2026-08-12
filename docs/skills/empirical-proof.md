# empirical-proof

## What it does

This skill proves a just-finished change **at the running software**, not on paper. You start the real app, drive the surface your change touched over the boundary a real client uses, record the exchanges verbatim, and return a verdict: `verified`, `broken`, or `blocked`. Every "verified" traces to a recorded exchange with the genuinely running app. Code reading predicts; green unit tests are prerequisites; a mocked call or in-process harness exercises a different artifact. None of those produce a verdict here.

It is an **expensive tier that is offered, never run uninvited**. It fans out subagents, boots applications, and re-drives results firsthand for corroboration. The rule across the flow is that `verification-before-completion` is the always-on gate and this skill is a user option: the session offers it when a change qualifies and runs it only on your explicit ask, in the moment or by standing rule ([decision](../decisions/expensive-verification-user-optioned.md)).

It stops at the verdict. The skill says so twice over: it **"does not fix what it finds, and it does not fix the environment it runs in — both are the operator's separate step."** A bug found during the run is reported `broken` with its evidence, not patched. A "verified after I fixed it in passing" is, in the skill's words, **"unreviewed implementation wearing a verification badge."** One thing it *does* do that it used to refuse: launch the app. Installing dependencies, copying the example env, building, and starting the dev server are all in scope now, along with a clean retry.

## When to reach for it

Ask for it after finishing work that touched a surface the running software can prove — an MCP tool, a REST endpoint, runnable app behavior, or the artifact a generator emits — and before reporting that work done. If you have a standing rule authorizing it, it runs on qualifying changes without a fresh ask; otherwise the session should offer and wait.

The exclusion worth memorizing: **driving an app to hunt for unknown bugs is not this skill.** It is ordinary session work with no protocol at all — get the app up, drive it, reproduce what you find, report it.

| The problem | The skill |
| --- | --- |
| One finished change touched a drivable surface and you want proof it works live | `empirical-proof` |
| You want to explore a running surface looking for unknown bugs | No skill. Ordinary session work — no gate, no verdict set |
| A release, branch, or feature area needs a broad pass that splits into independent slices | `qa-sweep` |
| A premise, ticket, or hunch needs proving or breaking before you act | `claim-check` |
| You are about to claim done and just need fresh evidence for the claim | `verification-before-completion` |
| The diff has no runtime surface at all (docs, pure test changes) | Nothing here applies |

## The gate, the scenarios, the verdicts

**The gate is rigid and runs before any scenario is dispatched.**

1. Find the documented way to run this project — a project run skill, README, package scripts. That documented path defines what "can run here" means.
2. Prefer an instance already running. Health-check it and record the evidence: the exact endpoint hit and its verbatim response. **"No recorded health-check → nothing downstream counts."**
3. Confirm that instance carries the change under test. A stale process proves old code.
4. Otherwise start it yourself via the documented path. **"Everything the project's own docs prescribe is in scope — install dependencies, copy the example env, build first, run the dev server — as is a clean retry when the first attempt fails for a reason the docs let you fix."** A fresh worktree or clean install is ordinary setup, not environment fabrication. What stays out of scope is repairing the *machine*: a broken toolchain, an absent service, local config drift.
5. **"`blocked` is the last resort, not the first exit. One failed launch is not a blocked verdict; a documented path you have actually exhausted is."**

Running underneath all of that, unchanged and absolute: **"Do not conjure the environment."** A boot gate needing an unreachable database, credential, or service is a `blocked` verdict — not an invitation to stub a TCP listener, point an env var at a fake, or edit the boot check.

**Scenarios.** From the diff, list the touched runnable surfaces. Two are must-cover when impacted: MCP tools, driven through a real MCP client connection ("importing the handler and calling it is not MCP"), and REST endpoints, driven over real HTTP against the running port ("an in-process request harness is not the wire"). Per surface you write a small matrix: the happy path, then probes — invalid and missing input, boundary and type-coercion cases, the error path, auth where relevant. Right-size to blast radius. A surface with only its happy path exercised is **incomplete, not verified**.

**Fan-out under an evidence contract.** Every dispatched agent gets the same three things: environment facts including the work scope's single evidence folder (`.workbench/<work_scope>/` or the repo's scratch equivalent), the discipline (real boundary only, probe past the happy path, fix nothing, stop what you start and confirm the stop, leave the workspace and its logs as found), and the schema — scenario, exact invocation sent, verbatim response, observed versus expected, PASS/FAIL/BLOCKED. **"A returned verdict without its transcript is void — redo it, don't argue with it."**

**Corroboration before reporting.** Subagent results are leads, not conclusions. You re-drive every FAIL firsthand, plus at least one claimed PASS per touched surface, so a fabricated or mistaken transcript dies cheaply.

| Verdict | Means | Carries |
| --- | --- | --- |
| `verified` | Every scenario passed | Per-surface results, each citing its transcript |
| `broken` | Scenarios failed | The failing evidence, expected versus observed. Report it; do not fix it |
| `blocked` | The app could not honestly be brought up | The gate's observation verbatim, plus the one input that would unblock |

The report is verdict-first, then scenarios run per surface so coverage is visible, then gaps left unrun (silence reads as covered), then a cleanup line naming what you started and stopped and citing the check that proved the stop.

## Common questions

**Someone asked me to drive the app and hunt for bugs, and the session invoked this skill, hit a launch failure, and quit. What happened?**
That is the exact field failure this skill was recently fixed for, and it is worth understanding because two separate defects combined. An operator set out to drive an Electron app and hunt for bugs in a named surface area. The session pulled in `empirical-proof`, hit a launch failure, reported the environment `blocked`, and stopped — when the correct path was a fresh worktree, an install, a dev-server start, and driving the app.

Defect one: this is the only skill in the flow that says "drive the running app," and its `NOT for` list excluded release-wide passes and premise verification but said nothing about exploring a surface for unknown bugs. That work had nowhere else to land, so it got absorbed here and inherited a gate and a verdict set built for proving *one finished change*. Nothing is under test when you are hunting, so `verified`, `broken`, and `blocked` have nothing to attach to.

Defect two: the gate used to read **"make one clean start attempt via the documented path… Anything beyond it is not yours to do… Fixing local setup is out of scope by design."** That calibration is right for verification integrity and wrong as a general rule about starting an app, because it makes one hiccup terminal. Combined, a session that only wanted to explore a surface got a rule that ended the work.

Both are fixed. The exploratory exclusion now appears in both trigger surfaces — the description and the body — and the body explains the misfire rather than merely prohibiting it. Launching is in scope, and `blocked` is demoted to last resort ([decision](../decisions/empirical-proof-stops-absorbing-exploration.md)).

**So does exploratory bug-hunting get its own skill now?**
No, deliberately. A new hunting skill and a solo-scale `qa-sweep` were both weighed and rejected. The flow already carries the answer for work no protocol fits: keep the standard and drop the frame. Driving an app to hunt bugs is ordinary session work.

**If launching is in scope, why won't it stand up the missing database?**
Because that fix separated two things the old text conflated: *don't fabricate dependencies* (kept, absolute) from *don't try twice to start the app* (removed, wrong). Stubbing a listener, faking an env var, and editing a boot check remain forbidden. The reasoning that leads there is named in the skill's rationalization table: "The change doesn't touch the DB, a stub gets us past boot." The answer is that you cannot see the blast radius from inside the change, and the artifact that ships boots against the real dependency. During the skill's authoring validation, both agents run against a boot-blocked variant without the skill fabricated the missing dependency — one improvised a throwaway TCP listener to fool the boot probe — each reasoning that the change never touched the DB.

**It found a real bug. Why didn't it just fix it?**
Because a report that certifies code nobody reviewed is worth less than the round trip it saves. The same validation runs found three of four agents fixing the planted bug during verification and reporting PASS-after-fix. The finding goes to the operator; the fix is a separate, reviewable step.

**My unit tests are green. Isn't that the same evidence?**
No. The bait harness used to develop this skill held four of four green unit tests over code with a live runtime-only type-coercion hole. Tests gate; they do not prove.

**My project generates code — there is no app to boot.**
The emitted artifact is the runnable surface. Run the generator via the documented path, then build and drive its output the way a real consumer would: compile it, boot it, hit its endpoints. Reading the emitted source is still reading. One boundary shift applies here — an emitted artifact that fails to build or boot is a **`broken` verdict against the generator**, not `blocked`, because the generator's output is the change under test. This case was added after a real project whose deliverable was emitted source code found the skill assumed a bootable app ([decision](../decisions/verification-shape-feedback.md)).

**Where does the evidence go?**
Into the work scope's single folder, handed to every dispatched agent in its contract. Agents never pick their own locations. This became explicit after an audit run scattered its evidence across three separate per-agent system-temp directories although all of it belonged to one work scope ([decision](../decisions/evidence-one-home-per-scope.md)). One proof, one folder.

**A subagent came back with a clean PASS. Can I take it?**
Not on its own. Every FAIL and one PASS per surface get re-driven firsthand, and a verdict arriving without its transcript is void rather than debatable. A subagent's BLOCKED is yours to resolve inside the gate's rules or to report — never wave it through, and never substitute a unit test for the runtime path it could not reach.

**Should it clean up the logs it generated?**
No. Stop the processes you started and prove the stop — port closed, process gone, because a cleanup claim is a claim like any other — but leave the artifacts. "Cleaning up: removed the request log" is in the rationalization table for a reason: that log is the evidence. One validation-run agent did exactly this.

## It's working if

- The report leads with a verdict, and every passing surface cites a transcript of a real exchange with the running app.
- Probes appear alongside happy paths — invalid input, coercion cases, error paths — not just the one ideal call.
- A `blocked` verdict quotes the observed failure verbatim and names the single thing that would unblock it, after the documented path was actually exhausted.
- Product code is untouched by the run, and any bug found appears as a finding rather than a commit.

Negative signals — the skill is being misapplied if:

- It ran without anyone asking for it. This is a user-optioned tier; running it uninvited spends time and budget on ceremony nobody ordered.
- It was invoked to go looking for unknown bugs. There is nothing under test, so the verdicts have nothing to attach to, and the `blocked` exit will end a hunt that ordinary dev setup would have started.
- A `blocked` verdict appears after a single failed launch.
- "Verified" is backed by build output, green tests, or a careful reading of the code path.
- The environment was helped along with a stub, a fake env var, or an edited boot check.

## Where it fits

This is the deep form of the flow's completion gate. `verification-before-completion` is the always-on floor that demands fresh evidence for any done-claim; when the change touched something a real client can drive and you decide the spend is warranted, this skill supplies that evidence from the running software instead of from a command's exit code. Its output feeds the same place: once the work is honestly `verified`, the required adversarial `code-quality-review` fires, and then the landing gate asks PR or merge.
