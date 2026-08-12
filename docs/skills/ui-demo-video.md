# ui-demo-video

## What it does

Drives your running app with Playwright through a short scripted walkthrough and
records it — producing a webm and (with `ffmpeg`) an mp4 you can drag into a pull
request. That is the half people expect.

The half people miss: it emits **one PNG frame per scene**, and those frames are
the point *for the model*. A model cannot watch a video mid-session, but it can
`Read` a PNG, see the actual rendered UI, and iterate. The skill states it
directly — "**The frames are the point for the model**: Read them after
recording to visually verify the UI state, and iterate (fix code or scenario,
re-record) until the frames show the expected result. The video is the
human-shareable artifact." Which is why the skill says to "use the frames as the
visual feedback loop even when nobody asked for a video."

It is **not a test suite**. Scenes demonstrate and verify visually; they do not
assert. Assertions belong to your project's test suite. It also does not install
Playwright or provision your app — "missing prerequisites are reported with the
one-line install hint, not fixed silently"
([decision](../decisions/ui-demo-video.md)).

## When to reach for it

It activates "after UI work that can be verified visually — a new element, layout
change, or user flow in a web app whose dev server a browser can drive." Not for
API-only or non-visual changes.

Reach for it when you've just changed something you'd otherwise verify by
squinting at code: a new dialog, a layout that could break at the wrong
breakpoint, a multi-step flow whose middle state you never actually looked at.
And reach for it when nobody asked for a video — the frames alone pay for the
run.

| The problem | The skill |
| --- | --- |
| A visual change you want to *see* rendered, and optionally share | `ui-demo-video` |
| A finished change with a drivable but non-visual surface — an endpoint, an MCP tool, a generator's output | `empirical-proof` (workbench) |
| A broad release or branch surface that splits into slices | `qa-sweep` (workbench) |
| Behavior that must *fail* when it regresses | Your project's test suite. This skill does not assert. |
| About to claim the work is done | `verification-before-completion` (workbench) — the always-on gate this feeds |

## Prerequisites

- **The app runs locally.** Find the project's documented run path — a project
  run skill, the README, package scripts — "and use that; do not invent a launch
  command."
- **Playwright installed in the project** (`@playwright/test` or `playwright`)
  with chromium downloaded. The one-time setup, if missing:
  `npm i -D @playwright/test && npx playwright install chromium`.
- **`ffmpeg` on PATH** for mp4 conversion. Optional — the webm is always
  produced.

## The run

1. **App running first.** Start the dev server via the documented run path, in
   the background, and health-check it before anything else. If booting can
   reseed or migrate a local dev database, back that file up first. Seed the data
   your scenes need through the app's **real surface** — a fixture or seed
   endpoint, the REST/RPC API, a documented CLI seeder — "never direct DB writes:
   seeded state must pass the same validation real usage does."
2. **Copy the harness, then write a scenario beside it.** `scripts/harness.mjs`
   from the skill's directory gets copied into the project's `tmp/` folder, and
   `tmp/<scenario>.mjs` sits next to it. Scenes should be short and named for
   what they prove. `highlight()` draws the eye to the element under test. Every
   route the scenario visits is listed in `prewarm` "so dev-compile skeletons stay
   out of frame."
3. **Run it:** `node tmp/<scenario>.mjs`.
4. **Feedback loop (mandatory).** Read every `scene-*.png` and check the UI is
   actually correct — "the element present, states right, no dev-overlay badges
   or half-loaded skeletons. Wrong → fix and re-record. Only a frame-verified
   recording counts as evidence."
5. **Cleanup.** Delete the demo entities you seeded, through the same real
   surface you created them with; stop any dev server you started; confirm the
   port is closed.
6. **Delivery.** GitHub only accepts video attachments through the browser
   editor, so the mp4 is drag-dropped into the PR description by hand — the API
   cannot attach it.

### What lands in `tmp/<name>/`

| File | What it's for |
| --- | --- |
| `scene-NN-<slug>.png` | One per scene. The model reads these. |
| `<name>.webm` | Always produced. |
| `<name>.mp4` | Only with `ffmpeg` on PATH. This is the PR attachment. |
| `manifest.json` | Scene list, timings, file paths, and an `ok` flag. |
| `scene-FAIL.png` | Written when the scenario throws — the page state at failure. |

### Knobs on `recordUiDemo`

| Option | Default | Notes |
| --- | --- | --- |
| `name`, `baseUrl` | — | Required. `name` becomes the output folder and file basename. |
| `prewarm` | `[]` | Routes visited off-camera first, so nothing compiles on film. |
| `viewport` | 1280×720 | Override when the surface needs it. |
| `outDir` | `"tmp"` | Parent of the run folder. |
| `hideNextDevOverlay` | `true` | Hides `nextjs-portal`; a no-op in non-Next apps. |
| `hideSelectors` | `[]` | Hide other frameworks' overlays or badges. |
| `defaultTimeoutMs` | 60000 | Per-action Playwright timeout. |
| `scenePauseMs` | 1200 | Settle time before each frame is captured. |

## Common questions

**Why copy the harness into the project instead of importing it from the
plugin?** Node resolves `import "@playwright/test"` relative to the importing
file, "so a harness left in the plugin cache can never find the project's
Playwright install." The copy is not laziness; it is the only arrangement that
resolves.

**The scenario failed. Is the output garbage?** No. "A scenario failure still
saves the video and a `scene-FAIL.png` — those are debugging evidence, not
garbage." The frame shows you the page state at the moment it broke.

**The frames show a dev badge or a half-loaded skeleton.** Two fixes. Add the
offending element to `hideSelectors` (the Next.js overlay is hidden by default).
And list every route the scenario touches in `prewarm`, so the dev server has
already compiled them before the camera rolls.

**Can I just insert rows into the dev database to set up the scene?** No. Seed
through the app's real surface, so "seeded state must pass the same validation
real usage does." Direct DB writes can produce a demo of a state your app could
never actually reach.

**The recording doesn't show my change.** "The app under test must be the working
tree you changed — the dev server compiles from source, so a stale server proves
old code; restart when in doubt."

**Can it attach the mp4 to the PR for me?** No. GitHub accepts video attachments
only through the browser editor. And local artifacts don't get pushed to other
trackers "unless the project's own rules say to."

**No `ffmpeg` on this machine.** The webm is still produced, and the frames — the
part that matters for verification — are unaffected.

**Should the seeded data look like test data?** No: "Realistic demo data reads
better than test slugs — name seeded entities like a user would ('Sprint
review'), not 'TEST-1234 probe'."

**Does it work outside Next.js?** Yes. The one framework-specific behavior, the
Next dev-overlay hack, was generalized to a `hideSelectors` option; the Next
default stays on and is a no-op elsewhere. The harness was validated end-to-end
against a plain static page with no framework and no project fixtures.

## It's working if

- Every `scene-*.png` got read back, and each shows the element you expected in
  the state you expected — no dev badges, no skeletons.
- `manifest.json` lists the scenes you wrote, with `ok: true`.
- A scene that looked wrong triggered a fix and a re-record, not a shrug. That
  loop *is* the skill.
- The dev server you started is stopped and the port is closed; the entities you
  seeded are gone, removed through the same surface that created them.

**Not working if** you hand over a video nobody looked at frame by frame. "Only a
frame-verified recording counts as evidence" — an unread recording is an artifact,
not proof. Equally: if you find yourself adding assertions to scenes so a failure
fails the build, you've drifted into test-suite territory the skill deliberately
doesn't occupy.

## Where it fits

`ui-demo-video` ships in **`toolkit`**, the optional plugin — not the `workbench`
process core. Toolkit holds artifact-making utilities you install alongside
workbench when you want them; nothing in the workbench flow requires this one. It
was the first toolkit skill to ship a supporting script, and `scripts/harness.mjs`
travels with it. Where it lands in practice is just before a done-claim: the
frames are the visual evidence that `verification-before-completion` asks for,
and the mp4 is what the PR reviewer sees.
