# ui-demo-video

## Origin

In a lived-in web-app project, "the UI change is done" kept meaning "the code
compiles and the tests pass" — until someone opened the app and the new button
was behind a skeleton loader, or the dialog rendered under the dev-mode badge.
The sessions started recording Playwright walkthroughs of the running app to
attach to PRs, rebuilding the recording scaffolding ad hoc each time: launch,
record, screenshot, convert, clean up.

Two discoveries turned the ritual into a skill. First, the scaffolding
converged — every ad-hoc script wanted the same shape (named scenes, a
highlight helper, prewarmed routes, a manifest), so it froze into a reusable
harness. Second, and more important: the per-scene PNG frames turned out to
matter more than the video. A model cannot watch a video mid-session, but it
can `Read` a frame, see the actual rendered pixels, and iterate — fix the
code or the scenario, re-record — until the frames show the expected result.
The video is for the humans reviewing the PR; the frames are the model's
visual feedback loop, useful even when nobody asked for a video.

The original skill text was saturated with the origin project's specifics: a
hardcoded port and package manager, a Prisma dev-database backup path, an
internal fixture-seeding API with credentials, project routes in every
example, a tracker-specific delivery rule. Adoption into the toolkit replaced
each with a conditional on what any project observably has — the documented
run path, the app's real API surface, the project's own tracker rules.

## Problem

1. **UI changes verified by proxy.** Compile success and green tests say
   nothing about what actually renders. Without a visual check, the classic
   failures ship: element present in the DOM but obscured, wrong state on
   first load, dev-only artifacts in the layout.
2. **No feedback loop the model can close.** A human can eyeball the app; a
   mid-session model can't — unless something turns UI state into an artifact
   the Read tool understands. Screenshots ad hoc get taken once and never
   re-checked; nothing forces the "look at what actually rendered" step.
3. **Recording scaffolding reinvented per session.** Video recording,
   per-scene capture, ffmpeg conversion, failure handling, and cleanup are
   fiddly enough that each ad-hoc rebuild gets some of it wrong — recordings
   lost on scenario failure being the expensive classic.
4. **Recordings that lie or distract.** Dev-overlay badges photobomb the
   frame; dev-compile skeletons appear on first navigation and read as broken
   UI; a stale dev server happily demos last week's code.

## Solution shape

A bundled harness plus a workflow whose rigid core is the feedback loop. The
harness (`scripts/harness.mjs`, copied into the project so Node resolves the
project's own Playwright) records a browser context video while the scenario
runs named scenes; each scene ends in a PNG frame, a failure still saves the
video plus a `scene-FAIL.png`, and a `manifest.json` records scenes, timings,
and files. Routes listed in `prewarm` are visited off-camera first so
dev-compile skeletons stay out of frame; a `highlight()` helper outlines the
element under test; the Next.js dev overlay is hidden by default and a
`hideSelectors` option extends the same treatment to any framework's badges.

The workflow around it: start the app via its documented run path and
health-check it; seed demo data through the app's real surface (never direct
DB writes); run the scenario; then the mandatory step — **Read every
`scene-*.png` and only count a frame-verified recording as evidence**,
iterating until the frames show the expected result. Cleanup deletes seeded
entities through the same surface and confirms the dev server is stopped.
Delivery acknowledges a hard platform constraint: GitHub accepts video
attachments only through the browser editor, so the mp4 is drag-dropped
manually.

## Real invocation snippet

> record a demo of the new share dialog

Dev server health-checked, harness copied to `tmp/`, a two-scene scenario
written (`list shows the item`, `dialog renders the share action`), run,
frames read back — the second frame shows the dialog under a skeleton, so the
route joins `prewarm` and the recording is redone before anything is claimed.

> the frames look right but the video is old

The dev server predates the working-tree change — restart via the documented
run path, re-record.

## Pitfalls observed

- **Skipping the frame-read.** Recording the video and declaring success
  without reading the frames — the exact failure the skill exists to prevent.
  Only a frame-verified recording counts as evidence.
- **Stale dev server.** The recording is honest, the code is old. When in
  doubt, restart via the documented run path before recording.
- **Dev-compile skeletons in frame.** First navigation to a route in a dev
  server compiles on demand; the video opens on a loading skeleton. Every
  route the scenario visits belongs in `prewarm`.
- **Dev-overlay photobombing.** Framework dev badges render over the UI in
  every frame. The harness hides the Next.js overlay by default; other
  frameworks need their selector passed via `hideSelectors`.
- **Seeding around the app.** Direct DB writes create entities that bypass
  the app's validation and render oddly (or break the app mid-demo). Seed
  through the real surface — fixture endpoint, API, documented CLI.
- **Test slugs on camera.** "TEST-1234 probe" in a PR demo reads as noise;
  name seeded entities like a user would ("Sprint review").
- **Treating failure artifacts as garbage.** A failed scenario still saves
  the video and `scene-FAIL.png` — that is the debugging evidence, not
  something to delete and retry blind.
- **Attaching the mp4 via API.** GitHub's API cannot attach videos; only the
  browser editor accepts the drag-drop. Plan for the manual step instead of
  fighting it.
- **Importing the harness from outside the project.** Node resolves
  `@playwright/test` relative to the importing file; a harness left in a
  plugin cache or home directory can't find the project's Playwright. Copy it
  into the project next to the scenario.

## Adaptation notes

- The harness is the portable half — it assumes only Node, a Playwright
  install, and a URL to drive. Everything environmental (how the app starts,
  how data is seeded, where artifacts go) is deliberately expressed as
  conditionals on the project's own documented paths; adopters fill those in
  from their repo, not by editing the harness.
- The feedback loop is the rigid half. Whatever else is adapted, keep step 4:
  read every frame, iterate until the frames show the expected result.
- `tmp/` as scenario/output home is a convention, not a requirement —
  `outDir` overrides it. Keep outputs out of version control wherever they
  land.
- Pairs with `empirical-proof` as the visual sibling of its behavioral proof:
  `empirical-proof` drives the real API boundary and asserts, `ui-demo-video`
  drives the real UI and shows. A UI-heavy change may warrant both.
- The mp4 feeds `handoff-pr` naturally — the demo video is PR-description
  material, with the drag-drop caveat noted in the artifact.
