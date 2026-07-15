---
name: ui-demo-video
description: Use after UI work that can be verified visually — a new element, layout change, or user flow in a web app whose dev server a browser can drive. Records a Playwright-driven video walkthrough of the running app, emitting a per-scene PNG frame the model reads to verify the UI itself — both shareable evidence (PR demo) and a model feedback loop. Use the frames as the visual feedback loop even when nobody asked for a video. NOT for API-only or non-visual changes, and not a test suite — scenes demonstrate and verify visually, they do not assert.
---

# UI Demo Video

Record a Playwright-driven walkthrough of the running app into a shareable video,
emitting a PNG frame per scene. **The frames are the point for the model**: Read
them after recording to visually verify the UI state, and iterate (fix code or
scenario, re-record) until the frames show the expected result. The video is the
human-shareable artifact (GitHub PR descriptions accept mp4 drag-drop).

## When to use

After UI work that a video can verify — a new element, layout change, or flow.
Use the frames as the visual feedback loop even when nobody asked for a video.
Not for API-only or non-visual changes.

## Prerequisites

- The app runs locally. Find the project's documented run path — a project run
  skill, README, package scripts — and use that; do not invent a launch command.
- Playwright is installed **in the project** (`@playwright/test` or
  `playwright`) with a chromium browser downloaded. If missing, the one-time
  setup is: `npm i -D @playwright/test && npx playwright install chromium`.
- `ffmpeg` on PATH for mp4 conversion (optional — the webm is always produced).

## Workflow

1. **App running first.** Start the dev server via the documented run path, in
   the background, and health-check it before anything else. If booting can
   reseed or migrate a local dev database, back that file up first. Seed the
   data the scenes need through the app's **real surface** — a fixture/seed
   endpoint, the REST/RPC API, a documented CLI seeder — never direct DB
   writes: seeded state must pass the same validation real usage does.
2. **Copy the harness, then write a scenario file next to it.** Copy
   `scripts/harness.mjs` from this skill's directory into the project's `tmp/`
   folder — the harness must live inside the project so Node resolves the
   project's own Playwright install — then write `tmp/<scenario>.mjs` beside it
   (example below). Scenes should be short and named for what they prove. Use
   `highlight()` to draw the eye to the element under test. List every route
   the scenario visits in `prewarm` so dev-compile skeletons stay out of frame.
3. **Run it:** `node tmp/<scenario>.mjs`. Outputs land in `tmp/<name>/`:
   per-scene PNGs, `<name>.webm` + `<name>.mp4`, `manifest.json`. A scenario
   failure still saves the video and a `scene-FAIL.png` — those are debugging
   evidence, not garbage.
4. **Feedback loop (mandatory):** Read every `scene-*.png` with the Read tool
   and check the UI is actually correct — the element present, states right, no
   dev-overlay badges or half-loaded skeletons. Wrong → fix and re-record. Only
   a frame-verified recording counts as evidence.
5. **Cleanup:** delete the demo entities you seeded (through the same real
   surface you created them with), stop any dev server you started, and confirm
   the port is closed.
6. **Delivery:** GitHub only accepts video attachments via the browser editor —
   the mp4 is drag-dropped into the PR description manually (the API cannot
   attach it). Do not upload local artifacts to other trackers unless the
   project's own rules say to.

## Scenario example

```js
import { recordUiDemo } from "./harness.mjs";

const BASE = "http://localhost:3000";

await recordUiDemo(
  {
    name: "my-feature-demo",
    baseUrl: BASE,
    prewarm: ["/items", "/items/42"],
  },
  async ({ page, scene, highlight }) => {
    await scene("list shows the new item", async () => {
      await page.goto(`${BASE}/items`, { waitUntil: "networkidle" });
      await page.getByText("Quarterly report").first().click();
    });
    await scene("detail dialog renders the new action", async () => {
      await page.getByRole("button", { name: "Share" }).click();
      await highlight(page.getByRole("dialog").getByRole("link", { name: "Copy link" }));
    });
  },
);
```

## Notes

- The harness hides the Next.js dev overlay (`nextjs-portal`) by default so
  dev-mode badges don't photobomb recordings — a no-op in non-Next apps. Pass
  `hideSelectors: ["..."]` to hide other frameworks' overlays or badges.
- Realistic demo data reads better than test slugs — name seeded entities like
  a user would ("Sprint review"), not "TEST-1234 probe".
- Viewport defaults to 1280×720; override via `viewport` if the surface needs it.
- mp4 conversion needs `ffmpeg` on PATH; without it the webm is still produced.
- The app under test must be the working tree you changed — the dev server
  compiles from source, so a stale server proves old code; restart when in doubt.
