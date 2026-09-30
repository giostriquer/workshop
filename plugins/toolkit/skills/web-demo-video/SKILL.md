---
name: web-demo-video
description: Use when a browser-driven UI change needs a recorded walkthrough or visual evidence, such as a new element, layout, or user flow. Not for API-only changes or a regression test suite.
---

# Web Demo Video

Record the real user flow with Microsoft's Playwright CLI and the bundled
capture helper. The helper owns recording, scene frames, diagnostics, and
cleanup. Run it from the installed skill. Demos supply browser actions.

## Launch and discover

Use the app's documented run path and verify it serves the changed checkout.
Back up a database if startup can migrate or reseed it. Seed
placeholder data through a supported API, fixture endpoint, or CLI, never direct
database writes. Reuse the project's verification instructions and discover
the short walkthrough before recording.

Use `@playwright/cli` (`0.1.22` tested). [Setup and commands](references/commands.md) covers an isolated
installation and authentication. App package and lockfiles stay untouched.
Run `node scripts/capture.mjs --help` from this skill's directory for flags.
Recording needs a launchable browser; MP4 conversion also needs `ffmpeg`.
Use the shared setup when recording prerequisites are missing.

## Capture

Resolve `UI_DEMO_SKILL` to this skill's directory. `start` returns a fresh
`runDir`; use it as `UI_DEMO_RUN` for all later calls.

```sh
node "$UI_DEMO_SKILL/scripts/capture.mjs" doctor --project . --url http://localhost:3000
node "$UI_DEMO_SKILL/scripts/capture.mjs" start --project . --url http://localhost:3000 --name share-project
node "$UI_DEMO_SKILL/scripts/capture.mjs" act --run "$UI_DEMO_RUN" -- snapshot
node "$UI_DEMO_SKILL/scripts/capture.mjs" act --run "$UI_DEMO_RUN" -- click "getByRole('button', { name: 'Share' })"
node "$UI_DEMO_SKILL/scripts/capture.mjs" frame --run "$UI_DEMO_RUN" --name "Share dialog is visible" --wait-for 'dialog[open]'
node "$UI_DEMO_SKILL/scripts/capture.mjs" finish --run "$UI_DEMO_RUN"
```

Drive sequentially with observed refs or stable semantic locators. Refresh refs
after navigation or DOM changes. Wait for each call to return; inspect each
scene. Native cursor pacing and action callouts make the video readable.
`frame` saves a PNG and snapshot and adds a video chapter. Readiness uses visible
controls or hidden loading indicators, not network idle or improvised sleeps.
Use CLI actions for dialogs, uploads, and tabs. An unsupported action
may use `run-code` for that interaction; recording remains in the helper.

## Inspect, finish, deliver

Always call `finish`, including after an action failure or interruption. It
retains failure frames, run-wide errors, all tab videos, and available MP4, and
closes only its own browser. Read `manifest.json` and its named frames, not a
glob across earlier runs. Deliver all listed video parts. View every PNG, inspect error
evidence, and fix in-scope defects in a fresh recording. Preserve unfiltered
evidence; overlays and runtime errors must stay visible.

`captureStatus: captured` means recording completed; `visualReview: pending`
is intentional. Only inspected images support a visual correctness claim.
Claude Code uses Read for PNGs; Codex uses its available image tool. Native
browser tools can help discovery or small visual checks when present. Use
their own documented recording capability only when exposed; neither host
guarantees it. Follow the host's browser and permission rules.

Remove only entities you created through their real surface and stop only
servers you started. Keep artifacts. Deliver the recording, reviewed frame
paths, and any gaps. Publish attachments only with existing explicit authority.
