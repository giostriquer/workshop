# empirical-proof

## What it does

`empirical-proof` checks a finished change through the way its user or consumer
experiences it. It covers web, desktop, and mobile apps, CLIs and TUIs, APIs,
MCP tools, libraries, and generated artifacts. The skill guides what to test
and how to choose a route; it does not prescribe a harness, a health endpoint,
a scenario count, or a team for every proof.

Modern models can operate software, inspect screenshots, follow a flow across
tools, and read back its effects. The session uses those capabilities when
available, alongside existing project automation and documented run paths.

## When to reach for it

Ask after a finished change when you want proof from the actual software.
A repo completion rule that requires this check also counts as an invitation.
Otherwise the session offers it. A drivable surface alone does not make it
mandatory ([decision](../decisions/workbench-operator-decisions.md)).

| Need | Route |
| --- | --- |
| Check one finished change through its real consumer | `empirical-proof` |
| Explore a running app for unknown bugs | Ordinary session work |
| Broad QA over a release or feature area | `qa-sweep` |
| Investigate a premise, ticket, or hunch | `claim-check` |
| Support a completion claim with fresh evidence | `verification-before-completion` |

## What a useful proof looks like

The session identifies the expected outcome, exercises the changed path, and
selects relevant failure cases and nearby regressions. It checks the result,
including persisted data or integration effects where those matter.

| Surface | Typical direction |
| --- | --- |
| Web | Browser flow, rendered layout, responsive and keyboard states |
| Desktop | Actual changed app, windows/menus, focus, lifecycle and saved state |
| Mobile | Available simulator/emulator/device, relevant navigation and platform states |
| CLI / TUI | Changed executable, exit/output, interactive terminal and emitted files |
| API / MCP | Real requests or connected tool calls, errors, schema and side effects |
| Library / generator | Real consumer of the public interface or generated output |

The route needs to match the claim. An API request can prove backend behavior;
it cannot show whether a desktop dialog clips. A healthy process can still be
an old build. A saved screenshot supports a visual claim only after the model
has inspected it.

Evidence can be a native tool exchange, terminal output, inspected screenshot,
log, recording, or result readback. Useful evidence identifies the build,
inputs, expected outcome, and observed outcome. Save it in the scope's scratch
folder when it needs to survive a handoff; a separate recording or transcript
file is not necessary for every tool call.

The report leads with what was verified, what failed, or what could not be
checked. It names the unrun cases and any temporary resources left running.
A failed result stays visible when an authorized repair and new check follow.

## Common questions

**Does this work for native apps?**
Yes. Use available native app/computer tools or existing project automation.
Mobile checks can use a simulator, emulator, or device. State which platform
and build were exercised; a web preview does not prove native integration.

**What differs between Codex and Claude Code?**
The shared approach is the same. Use the tools actually exposed and connected
in the session. Codex's browser/computer surfaces depend on its host. Claude
Code's Chrome integration and native computer use have separate availability
and setup; built-in computer use needs an interactive session and is not
available in `claude -p`. The skill does not assume either host has every tool.

**Do I need to create a temporary harness?**
Usually an existing project workflow, native tool, real client, or terminal
invocation is enough. Choose the simplest route that exercises the behavior.
For a requested browser video, `toolkit:web-demo-video` supplies the recorder.

**What if a dependency or UI tool is unavailable?**
Try reasonable documented setup within existing task authority, including
starting a real local dependency. Report the gap and continue independent checks.
An environment or verifier failure is not automatically an app defect. A fake
service can support a narrower test, but not a claim about the real integration.

**Are passing tests enough?**
They support the behavior they exercise. Report app interaction separately
from unit tests, builds, source inspection, or mocked behavior.

**Does it repair bugs?**
A verification-only request ends at findings. Existing repair authority lets
the session fix the defect and check the repaired build without hiding the
original failure.

## How to tell it worked

- The chosen route exercises the changed behavior on the changed artifact.
- Checks fit the surface and risk; their observations support the claims.
- Missing platforms, tools, states, and cases remain visible.
- User-owned sessions and data are preserved; temporary resources and evidence
  have a clear disposition.
