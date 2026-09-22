# ui-demo-video

## What it does

Drives your running app with Playwright through a short scripted walkthrough
and records a video for sharing. It also emits **one PNG frame per scene**, and
those frames are the point for the model: it reads them, checks the rendered UI,
and fixes and re-records until they show the expected result.

It is **not a test suite**. Scenes demonstrate and verify visually; they do not
assert.

## When to reach for it

After UI work a browser can drive and show: a new element, a layout change, a
user flow. Not for API-only or non-visual changes. Record when asked, when the
repo requires it, or when it helps an authorized UI task; a small visual check
needs no recording toolchain ([decision](../decisions/ui-demo-video.md)).

| The problem | The skill |
| --- | --- |
| A visual change you want to *see* rendered | `ui-demo-video` |
| A drivable non-visual surface (endpoint, MCP tool) | `empirical-proof` (workbench) |
| A broad release or branch surface | `qa-sweep` (workbench) |
| Behavior that must *fail* when it regresses | Your test suite |
| About to claim the work is done | `verification-before-completion` (workbench) |

## Prerequisites

- The app runs locally through its documented run path.
- Playwright with Chromium, installed in the project. If it's missing, the skill
  uses an available browser tool and reports the gap; it installs only when
  setup is in the authorized scope, never editing package or lock files for a demo.
- `ffmpeg` on PATH for the mp4 (optional).

## The run

1. **App running first.** Start and health-check the dev server, backing up a
   local dev database that booting could reseed. Seed data through the app's
   **real surface**, never direct DB writes.
2. **Copy the harness, then write a scenario.** Copy `scripts/harness.mjs` into
   the project's `tmp/` and write `tmp/<scenario>.mjs` beside it. Name short
   scenes for what they prove; `highlight()` marks the element under test;
   `prewarm` lists every visited route.
3. **Run it:** `node tmp/<scenario>.mjs`.
4. **Feedback loop (mandatory).** Read every `scene-*.png`: element present,
   states right, no hidden runtime errors or half-loaded skeletons. Wrong → fix
   in scope and re-record. "Only a frame-verified recording counts as
   evidence."
5. **Cleanup.** Delete seeded entities through the same surface, stop the dev
   server you started, and confirm the port is closed.
6. **Delivery.** Hand over the local recording and frames.

### What lands in `tmp/<name>/`

| File | What it's for |
| --- | --- |
| `scene-NN-<slug>.png` | One per scene; the model reads these. |
| `<name>.webm` | Always produced. |
| `<name>.mp4` | With `ffmpeg` only; the PR attachment. |
| `manifest.json` | Scenes, timings, files, and an `ok` flag. |
| `scene-FAIL.png` | Page state when the scenario throws. |

### Knobs on `recordUiDemo`

`name` and `baseUrl` are required; `name` becomes the folder and file
basename. Optional: `prewarm` (routes visited off-camera first), `viewport`
(1280×720), `outDir` (`"tmp"`), `defaultTimeoutMs` (60000), `scenePauseMs`
(1200, settle time before each frame), and the presentation-only
`hideNextDevOverlay` (`false`) and `hideSelectors` (`[]`).

## Common questions

**Why copy the harness into the project?** Node resolves Playwright relative to
the importing file, so the harness must sit inside the project.

**The scenario failed. Is the output garbage?** No. The video and
`scene-FAIL.png` are still saved as debugging evidence.

**The frames show a dev overlay or a half-loaded skeleton.** Investigate the
overlay; it may be a real runtime error. Add routes to `prewarm` so they compile
first. Hide overlays only for a presentation recording, after keeping
unfiltered frames.

**Can I insert rows straight into the dev database?** No. Seeded state must pass
the same validation real usage does.

**The recording doesn't show my change.** A stale server proves old code;
restart when in doubt.

**Can it attach the mp4 to the PR?** Only when existing authorization covers
that write. Otherwise you get the local file to attach.

**Should seeded data look like test data?** No. Name entities as a user would
("Sprint review"), not "TEST-1234 probe".

**Does it work outside Next.js?** Yes. `hideNextDevOverlay` is the only
Next-specific option, and it is off by default.

## It's working if

- Every `scene-*.png` was read and shows the expected state, with no runtime
  errors or skeletons.
- `manifest.json` lists your scenes with `ok: true`.
- A wrong-looking scene triggered a fix and a re-record.
- The dev server you started is stopped, the port is closed, and seeded
  entities are gone.

**Not working if** you hand over a video nobody checked frame by frame, or you
start adding assertions to scenes so failures break the build.

## Where it fits

`ui-demo-video` ships in **`toolkit`**, the optional plugin; nothing in the
`workbench` flow requires it. It lands before a done-claim: the frames are
visual evidence, and the mp4 is what the reviewer sees.
