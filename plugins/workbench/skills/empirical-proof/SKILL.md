---
name: empirical-proof
description: Use when completing a behavioral change or refactor to an app, CLI, API, MCP tool, library, or generated artifact, or when explicitly asked to prove one change. Not for broad QA (qa-sweep), investigating a premise (claim-check), or exploratory bug hunting.
---
# Empirical Proof

Check the finished change the way its user or consumer experiences it. Operate
software, inspect images, follow state across tools, and compare expected with
observed behavior using the capabilities available in this session.

This is the default focused proof for behavioral completion under
`verification-before-completion`. Use it without another offer. Reuse existing
evidence when it already demonstrates the affected behavior on the relevant
artifact and state; a public-interface test can be the consumer for a library
claim. Apply explicit user declines and superseding repo rules, recording what
remains unverified. This guidance adds no fixed harness or ceremony.
Broad coverage belongs to `qa-sweep`, premises to `claim-check`, and exploratory
bug hunting to ordinary session work.

## Decide what would demonstrate the change

Turn the requested behavior, diff, and acceptance criteria into observable
outcomes. For a bug fix, exercise the original symptom on the changed build.
For a feature, complete the intended flow and inspect its result. For a
refactor, exercise or compare the behavior that must remain unchanged.

Choose checks that could expose a plausible failure:

- The main user journey, including the transitions the change affects.
- Relevant alternatives: empty or existing data, long content, cancellation,
  retries, invalid input, boundaries, permissions, or error recovery.
- State and side effects: read back what was saved, emitted, sent, or changed
  when persistence or integration is part of the claim.
- Nearby behavior likely to regress because it shares the changed path.

Scale this to the change. A layout correction may need a screenshot and a
resize; an account flow may need validation, persistence, and permissions.
Select meaningful cases rather than a universal input matrix. Name unrun checks.
State what the chosen route establishes and what it leaves outside the claim.

## Choose a route that fits the surface

Use project run instructions, verification skills, examples, or maintained
tooling where useful. Prefer a direct available tool over another temporary
harness. A harness can drive the real artifact; judge what it exercises.

| Surface | General direction | Useful observations |
| --- | --- | --- |
| Web app | Drive the affected flow with available browser tools or existing browser automation. | Rendered layout, navigation, inputs, responsive states, keyboard interaction; console and network failures when relevant. |
| Desktop app | Build or locate the changed app and operate it through native app/computer tools or its existing automation. | Windows, menus, dialogs, focus, keyboard shortcuts, resizing, app lifecycle, files and persisted settings. |
| Mobile app | Use an available simulator, emulator, device, or project automation. State which target was checked. | Touch flows, navigation, keyboard, rotation, lifecycle, permissions and platform behavior relevant to the change. |
| CLI / TUI | Invoke the changed executable; use a terminal or PTY for interactive behavior. | Exit status, stdout/stderr, prompts, screen state, files, cancellation and terminal sizing where relevant. |
| API / service | Send requests through the public boundary to the changed service. | Response and error semantics, validation, auth, state changes and integration effects. |
| MCP | Use a connected host tool, project client, or Inspector against the changed server. | Tool discovery/schema, arguments, returned content and errors, plus actual side effects. |
| Library / SDK | Exercise the public interface from a real consumer or supported project example. | Import/use behavior, returned values, errors, compatibility and packaging affected by the change. |
| Generator | Generate the output, then use that output as its consumer would. | Build/import/launch as appropriate, then the emitted behavior; source inspection alone cannot establish it. |

An API response does not establish a UI layout, and a web preview does not
establish native app integration. Match the route to the claim.
Calling an MCP handler directly skips tool discovery, schema, and transport.

## Use the current harness

**Codex:** use exposed browser/computer surfaces, connected MCP tools, shell
sessions, and image inspection according to their session documentation.
Tool presence alone does not establish a connected provider or target access.

**Claude Code:** use available Bash/terminal, image-reading, MCP, browser, and
computer-use tools. Chrome integration and native computer use have separate
setup and availability; consult current documentation as needed. Built-in
computer use needs an interactive session and is unavailable in `claude -p`.

Follow the host's interaction rules on either harness.

For UI work, keep a coherent session: observe, act, then inspect the resulting
state. Use fresh screenshots or semantic UI state to target actions. Inspect
images for visual claims; a saved screenshot that was never viewed is not a
layout check. DOM or accessibility state helps prove content and interaction,
but does not by itself prove appearance or full accessibility.

A small proof usually fits one agent. Delegate independent cases when useful,
with suitable tools and isolated state; keep one driver for shared UI state.
Inspect returned evidence and reproduce questionable findings as needed.

## Establish what is actually under test

Check that the target contains the change: an explicit build/revision marker,
the artifact you built and launched, or another reliable link between source
and running behavior. A healthy old server, installed app, PATH executable, or
connected MCP server can still exercise old code. Git HEAD alone does not
identify an already running process.

Readiness can be an app window, CLI invocation, MCP exchange, or service
response. There is no universal health endpoint. Reuse a suitable instance or
prefer an isolated one. Restarting someone else's session still needs authority.

Try documented setup and reasonable retries within existing task authority,
including real local dependencies.
Report unavailable credentials, services, platforms, or tools and continue
independent checks. A fake dependency supports a narrower test, not proof of
the real integration. Distinguish app failures from verifier or environment
failures before attributing a defect.

An unavailable route leaves that behavior's verification incomplete. Name the
attempts, concrete blocker, and remaining check; continue independent work.
Do not stop at the first setup failure, substitute a mock for missing real
integration evidence, or use an unauthorized account. A requirement to verify
does not grant external-write or user-session restart authority.

## Keep evidence proportional to the claim

When the claim is about performance, identify the revision and realistic
workload/configurations, verify completed correct work and errors, and report
repetitions and spread for comparisons. Observe the limiter or name the gap;
separate microbenchmarks from end-to-end results. Confounded or incomplete
measurements cannot establish a winner. An explicitly requested one-run
ballpark can remain one validated observation. If available,
`toolkit:benchmark-checklist` supplies the fuller procedure; this guidance
works without Toolkit and does not expand the authorized experiment budget.

Use tool exchanges, terminal output, inspected screenshots, recordings, logs,
or side-effect readback. Native session evidence can suffice; save artifacts
in the scope's scratch folder for handoffs or shareable reports. A video is
optional; `toolkit:web-demo-video` helps with browser walkthroughs.

Make it possible to tell what was exercised, on which build and inputs, what
was expected, and what happened. Older saved evidence needs the same link to
the tested build and state. A concise example:

> Checked the new export in the built desktop app: opened the menu, exported
> `acme.csv`, and read the file back. The values match the selected rows.
> Screenshot and file readback support this result. Narrow-window layout and
> the Windows build remain untested.

Label tests, builds, and source reading for what they establish. Keep failed
observations when authorized repairs follow; check the repaired build and
distinguish the results.

## Report the result and leave a usable workspace

Lead with verified behavior, a demonstrated defect, or a blocked check. Cite
what ran and its evidence; name coverage gaps and useful next steps. Partial
proof supports the covered behavior, not a whole-app claim.

A verification-only assignment ends with findings. Existing repair authority
allows fixes followed by a new check. Dispose of owned temporary resources,
confirm cleanup where relevant, retain useful evidence, and report anything
left running. Preserve user-owned sessions and data.
