# empirical-proof and verification: decisions in force

Rationale for the `empirical-proof` skill and the verification choices it shares with `verification-before-completion`, both shipped by the workbench plugin; superseded choices are omitted, and git history keeps the originals.

## Proof runs at the real artifact, with a counter for each cheat mode (2026-07-03)

Sessions finishing work on a runnable surface kept claiming unearned verification in four ways: a run that never happened, tests or a build reported as runtime proof, a mocked surface, and happy-path-only checks. Each gets a structural counter: nothing counts before a recorded health-check of the right running build, only the real boundary counts (MCP tools through a real client, REST over real HTTP), and a surface without probe scenarios is incomplete. Subagents return evidence in a fixed schema, a verdict without its transcript is void, and the session re-drives every FAIL and at least one PASS per surface. The report leads with `verified`, `broken` or `blocked`; an honest `blocked` beats code-reading "verification". The skill proves one finished change; branch-wide passes belong to `qa-sweep` and premises to `claim-check`.

## A proof attempt changes nothing and proves its own cleanup (2026-07-03)

Baseline runs surfaced further failures: agents fixed the bug mid-verification and reported PASS, faked a missing dependency to pass a boot check, deleted the request log as cleanup, and claimed a server had stopped while it still listened. So an attempt edits neither product code nor setup, its verdict is preserved, and any repair the task already authorizes returns to implementation and earns a fresh proof on the new revision. Every process a proof starts must be shown stopped (port closed, process gone), and logs stay as evidence.

## Generated code is proven through its emitted artifact (2026-08-12)

A code-generator project had no app to boot, and the skill offered no path to the right proof. For a generator, the runnable surface is the emitted artifact: generate via the documented path, then build and drive the output as its real consumer would, with the boot gate applying to that artifact. A build or boot failure is `broken` when evidence attributes it to the emitted artifact; missing credentials, services or verifier capabilities are `blocked`.

## A verification picker instead of merged protocols (2026-08-12)

Choosing among verification-adjacent pieces meant reading several protocols, spending attention for no gain. `using-workbench` carries a picker instead, one line per piece chosen by the work's shape, and the pieces keep separate scopes. `verification-before-completion` is the always-on floor the others deepen, requiring fresh evidence before any done, fixed or passing claim and naming `empirical-proof` as an optional deeper check to offer, not an automatic step. When no frame fits, keep the standard and drop the frame: prove the deliverable the way its consumer would exercise it. Protocols are checkpoints loaded when their moment arrives, not reading assignments.

## Bug-hunting is not this protocol, and launching is in scope (2026-08-12)

A session hunting bugs in an app pulled in this skill, the only one saying "drive the running app", then reported `blocked` after one failed launch. Nothing is under test during a hunt, so the skill now excludes it, and the flow adds no skill for it: hunting is ordinary session work. Launching is now in scope: whatever the project's docs prescribe, a clean retry, and a fresh worktree or clean install are ordinary setup, and `blocked` is the last resort once the documented path is exhausted. Faking dependencies stays forbidden and repairing the machine stays out of scope; the fix separates "don't fabricate" from "don't try twice".

## A repo's completion gate is a standing invitation (2026-08-19)

The skill runs only on the user's ask and is otherwise offered. A session whose repo required booting the real app followed its repo and caught a bug the unit tests missed; a literal reading of the skill would have shipped it. Repo precedence had only ever subtracted flow ceremony; now it runs both ways, so a repo gate requiring the real artifact for this kind of change is the invitation: run it, name the gate, and report the run as satisfying it. The gate must cover the change in hand; a surface merely looking drivable invites nothing.

## App and UI claims say how they were checked (2026-09-24)

A 30-day Claude Code usage audit found 48 prompts in 14 sessions, across three desktop-app projects, saying the fix didn't take or wasn't visible, asking whether the app was rebuilt, asking to boot the app or prove the fix empirically, or reporting a break. In those projects `verification-before-completion` fired 0 times, and done-claims rested on tests, fixtures and mock screens. A 30-day Codex audit found about 12 typed demands in 9 sessions to look at the screen instead of inferring from code. The claim table had rows for tests, builds and requirements, and none for what the app shows. It now has one, keyed to the claim being about app or UI state: the claim says it was seen in the running build and how (a screenshot, a live look, a driven flow), or says it was not checked in the running app, naming the evidence it rests on and the user's step to see it (rebuild, reinstall, relaunch, restart). A Key Patterns entry shows both. Overclaiming is a shaping failure, so per writing-skills' Match the Form to the Failure the fix is a recipe row, not a prohibition. It is a label, never a gate: "not checked in the running app" completes the claim, nothing requires launching the app, and `empirical-proof` stays opt-in.

Plan-only micro-tests, fresh Opus contexts (`claude -p`, customizations off, no tools), compared no skill, the 0.41.6 wording and this wording. Each context held a coding-agent preamble plus the skill and wrote its end-of-turn message after a given session state: a Tauri layout fix backed by a jsdom unit test and a headless mock-screen render, with the user's installed app a week old (five reps per arm); an Electron tray-crash fix backed by a unit test and a mocked-IPC scenario, with the user's instance running since morning (three reps); the same layout fix seen in a dev build with a screenshot and a sort click (three reps); and a date-library fix with no app (three reps).

| Question | No skill | 0.41.6 wording | This wording |
|---|---|---|---|
| UI fix, tests and mocks only: the opening says it was not checked in the running app | 0 of 8 | 5 of 8 | 8 of 8 |
| The same, anywhere in the message | 8 of 8 | 8 of 8 | 8 of 8 |
| Names the evidence and the user's step to see it | 8 of 8 | 8 of 8 | 8 of 8 |
| Withholds the report to launch the app, or asks permission first | 0 of 8 | 0 of 8 | 0 of 8 |
| Offers to launch or drive the app itself | 0 of 8 | 3 of 8 | 0 of 8 |
| Seen in a dev build: names the running-build check and the installed app's rebuild | not run | 3 of 3 | 3 of 3 |
| Seen in a dev build: cites the screenshot | not run | 0 of 3 | 3 of 3 |
| Library fix, no app: adds a running-app label or a launch | not run | 0 of 3 | 0 of 3 |

Without the skill, seven of eight openings stated the fix as fact ("Fixed: the header now sits below the toolbar") and disclosed the unchecked app further down, the audit's failure shape. With the 0.41.6 wording loaded, Opus already disclosed the gap every time; this wording moves the label into the opening and makes a seen-in-build claim cite its evidence. Nothing stopped, asked permission, or labeled a change with no app. Offers to launch the app fell from 3 of 8 to 0 of 8; the skill's line offering `empirical-proof` is unchanged. The audited sessions never loaded the skill, and its trigger is unchanged, so this row helps only where the skill loads. Codex sessions were not modeled. Three to five reps per arm is bounded regression evidence for these shapes, not a reliability estimate.
