# empirical-proof and verification: decisions in force

Rationale for the `empirical-proof` skill and the verification choices it shares with `verification-before-completion`, both shipped by the workbench plugin; superseded choices are omitted, and git history keeps the originals.

## Focused consumer proof is the completion default (2026-10-08)

Behavioral changes now require proof through the affected user or consumer
boundary before a completion or readiness claim. The gate invokes
`empirical-proof` without another offer. Existing evidence counts when it
exercises that boundary on the relevant artifact and state; invoking the skill
does not require repeating a valid run. Focused test results still support
their own claims while overall verification is incomplete.

The former label-only UI rule improved disclosure but allowed a session to
leave runnable proof to the user. The original cost decision also assumed
fan-out and a fixed protocol, which the surface-aware rewrite removed. The
new default keeps checks proportional: no automatic broad QA, full suite,
recording, team, or permanent verification harness. A blocked route needs
reasonable authorized setup, a concrete remaining gap, and continued independent
checks. Missing access is not a pass or permission to use another account.
Explicit user declines and superseding repository rules retain precedence;
a waived check is reported as unverified.

This adapts pstack's
[prove-it-works principle](https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/principle-prove-it-works/SKILL.md)
and [bug-fix workflow](https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/poteto-mode/playbooks/bug-fix.md)
without importing its dispatcher, model routing, or delivery authority.
Documents use artifact inspection and relevant checks; behavioral agent
instructions use consuming-agent scenarios. A pure refactor can use a real
boundary comparison that demonstrates the preserved contract.

Validation must cover both skill discovery from an ordinary task and its
application: a wrong consumer path behind green tests, stale artifacts,
already-sufficient evidence, generated output, unavailable access, explicit
declines, and non-executable work. Small scenario sets establish bounded
regression evidence, not a reliability estimate.

The focused trials used the same CLI defect behind a green helper test in
three fresh contexts: existing guidance, no guidance, and revised guidance.
All three found and repaired the consumer defect, so this sample demonstrates
no comparative improvement. The revised trial discovered the skills from a
local catalog, invoked the empirical guidance, and checked real command output.
Ten response scenarios covered the boundaries above; a reused-context delta
check confirmed that later wording fixes preserved evidence reuse and explicit
declines. These trials do not establish native-app execution or general reliability.

## Surface-aware guidance for modern harnesses (2026-09-30)

The operator asked to repeat the web-demo modernization for empirical proof,
then clarified the desired shape: include apps, guide what to test, and give a
general direction for each surface without hard constraints on how. The old
protocol assumed a recorded HTTP health endpoint before any scenario, a fixed
request/response schema, API-style probes for every surface, default fan-out,
and compulsory replay. That made valid desktop and short-lived CLI checks
ineligible and could encourage restarting a user-owned instance to resolve
build uncertainty.

The replacement covers web, desktop, and mobile apps; CLI/TUI; API and MCP;
libraries; and generated output. It directs checks toward the actual claim:
user journeys, relevant adverse states, side effects, and likely regressions.
Readiness and build identity fit the surface. Tools, case counts, evidence
format, recordings, delegation, and replay are choices, not ritual gates.
Native tool exchanges and inspected images can supply evidence without a new
capture harness. Existing project workflows remain useful. This change adds
no helper, project feature map, SDK dependency, or model pin.

The shared design borrows launch/readiness/drive/evidence/cleanup concepts from
Lauren Tan's MIT-licensed pstack
[create-verification-skill](https://github.com/cursor/plugins/blob/fae2c6ed95821bd85f614a73e4842e13229fa5e5/pstack/skills/create-verification-skill/SKILL.md)
and
[maintain-verification-skill](https://github.com/cursor/plugins/blob/fae2c6ed95821bd85f614a73e4842e13229fa5e5/pstack/skills/maintain-verification-skill/SKILL.md).
Their project-skill generation and parallel maintenance protocols are not
adopted. A read-only Claude Code Opus 5.5 consultation supported native tools,
surface-specific observations, current-build identity, and proportional proof.

Host directions name capabilities without assuming they exist in every
session. Official [Claude Chrome](https://code.claude.com/docs/en/chrome),
[Claude computer use](https://code.claude.com/docs/en/computer-use), and
[Codex MCP](https://developers.openai.com/codex/mcp/) documentation ground the
availability distinction. In particular, Claude's built-in computer use needs
an interactive session and is unavailable in print mode; a reasoning
consultation is not native-app execution.

Baseline characterization applied the old wording to five surface/tool/ownership
cases and found source contradictions for desktop and CLI proof. A desktop
no-guidance comparator was reasoned in the same context. These establish the
specific correction, not a reliability estimate. Fresh corrected-guidance
application checks cover those cases plus mobile, generated output, public
library use, side effects, and opt-in boundaries. Research and check records
remain local scratch evidence. No real app was driven by these scenario checks.

## Evidence describes the actual consumer and result

The original failures were invented runs, tests or builds reported as app
interaction, simulated dependencies reported as real integration, and narrow
happy-path coverage reported as a whole-surface pass. Keep the evidence and
scope distinction rather than the old fixed protocol. HTTP and MCP changes
are exercised through their public boundaries; apps through relevant user
interaction; libraries and generated artifacts through actual consumers.
Relevant adverse cases matter, but a fixed API matrix does not fit every app.
A missing tool or platform limits coverage and is not automatically a defect.

## Repairs and cleanup preserve work and observations

A failed observation remains visible when authorized implementation repairs
follow; the repaired build earns a new check. Verification-only work ends with
findings. Documented setup, including starting a real local dependency, can
support the proof within existing authority. A fake dependency supports only
the narrower test it actually exercises. Preserve user-owned sessions and
data; dispose of owned temporary resources, confirm cleanup where relevant,
and retain useful evidence. The skill does not grant machine repair or
external-write authority.

## A verification picker instead of merged protocols (2026-08-12)

Choosing among verification-adjacent pieces meant reading several protocols, spending attention for no gain. `using-workbench` carries a picker instead, one line per piece chosen by the work's shape, and the pieces keep separate scopes. `verification-before-completion` is the always-on floor the others deepen, requiring fresh evidence before any done, fixed or passing claim and using focused `empirical-proof` for behavioral completion, with reuse of adequate evidence. When no frame fits, keep the standard and drop the frame: prove the deliverable the way its consumer would exercise it. Protocols are checkpoints loaded when their moment arrives, not reading assignments.

## Bug-hunting is not this protocol, and launching is in scope (2026-08-12)

A session hunting bugs in an app pulled in this skill, the only one saying "drive the running app", then reported `blocked` after one failed launch. Nothing is under test during a hunt, so the skill now excludes it, and the flow adds no skill for it: hunting is ordinary session work. Documented setup and reasonable retries support useful progress within existing authority. A missing credential, service, platform, or verifier capability is reported as a gap, while independent checks can continue. A substituted dependency cannot establish the real integration; the distinction is between trying setup and fabricating proof.

## Repository completion rules retain precedence

A repository may require wider proof or a specific supported run path. Follow
that rule and name it. Explicit user declines and superseding repository
processes can also narrow the required checks; preserve the resulting evidence
gap in the report. Focused consumer proof no longer needs a separate invitation.

## Historical disclosure evaluation (2026-09-24)

A 30-day Claude Code usage audit found 48 prompts in 14 sessions, across three desktop-app projects, saying the fix didn't take or wasn't visible, asking whether the app was rebuilt, asking to boot the app or prove the fix empirically, or reporting a break. In those projects `verification-before-completion` fired 0 times, and done-claims rested on tests, fixtures and mock screens. A 30-day Codex audit found about 12 typed demands in 9 sessions to look at the screen instead of inferring from code. The then-current correction added a claim-table row requiring a running-build observation or an explicit unchecked-app disclosure. It addressed report shape without requiring a launch. The focused consumer-proof decision above supersedes that label-only completion policy; the historical evaluation below measures disclosure, not runtime verification.

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

Without the skill, seven of eight openings stated the fix as fact ("Fixed: the header now sits below the toolbar") and disclosed the unchecked app further down, the audit's failure shape. With the 0.41.6 wording loaded, Opus already disclosed the gap every time; this wording moves the label into the opening and makes a seen-in-build claim cite its evidence. Nothing stopped, asked permission, or labeled a change with no app. Offers to launch the app fell from 3 of 8 to 0 of 8; the opt-in line was unchanged in that evaluation. The audited sessions never loaded the skill, and its trigger is unchanged, so this row helps only where the skill loads. Codex sessions were not modeled. Three to five reps per arm is bounded regression evidence for these shapes, not a reliability estimate.

## Performance claims (2026-10-04)

The approved pstack 0.15.9 adaptation adds a small measurement contract to
verification-before-completion and connects empirical proof to the optional
Toolkit checklist. A performance comparison identifies revision, workload,
configurations, completed correct work, repetitions and variation, and the
observed limiter or uncertainty. An unsupported comparison is inconclusive;
an explicitly requested ballpark can report a valid single run. This did not change the then-current opt-in policy or give Workbench a Toolkit
dependency. The later default-proof decision above changes the trigger, not
the performance evidence standard. The
full procedure and its source are recorded in `benchmark-checklist.md`.
