# web-demo-video

Records a real browser walkthrough with a reusable capture helper and
Microsoft's Playwright CLI. Claude Code and Codex use the same capture commands;
each host uses its own terminal, image viewer, and permission mechanism.

The skill ships a recorder interface instead of requiring a copied harness or
a new JavaScript scenario for each demo. Native browser actions drive the flow.
The helper allocates fresh outputs, captures scene PNGs, retains error evidence,
and finalizes only its own isolated browser session.

## When to use it

Use it after a browser-driven UI change when a recorded walkthrough is useful,
requested, or required by the repo. Small visual checks can use available
browser tools without installing a recorder. Use the project test suite for
regression protection, `empirical-proof` for non-visual runnable surfaces, and
`qa-sweep` for a broad verification pass.

## The workflow

1. Discover the app's documented launch path and short walkthrough. Verify the
   server uses the changed checkout. Reuse project verification instructions
   and prepare realistic placeholder data through a supported surface.
2. Run the installed helper's `doctor` for CLI capabilities and HTTP readiness.
   Reuse an existing `@playwright/cli`, or install it once in an authorized,
   separate tool directory. The app's package and lockfiles need no edits.
3. `start` a fresh recording, then use `act` for ordinary CLI browser actions.
   Drive stable controls or refs from a fresh snapshot. Capture each named
   scene with `frame`; wait for rendered state or a loading indicator to
   disappear instead of waiting for network idle.
4. `finish`, including after failure. It gathers console/request evidence,
   flushes and checks the video, optionally converts MP4, and closes only the
   owned browser.
5. View every named scene and failure PNG and inspect error evidence. A wrong
   scene gets an in-scope fix and a new run. Preserve the failed attempt.
6. Remove only demo entities and servers this run created. Keep the artifacts
   and deliver the recording, reviewed frame paths, and remaining gaps.

The skill's [command reference](../../plugins/toolkit/skills/web-demo-video/references/commands.md)
contains the complete setup, authentication, flags, and a concrete form flow.

## What the outputs mean

Each run gets a unique directory under `tmp/ui-demo-video/` by default.

| Artifact | Purpose |
| --- | --- |
| `scene-NN-<name>.png` | Viewport image for each named checkpoint. |
| `scene-N.json` | Structured UI snapshot at that checkpoint. |
| `failure-NN.png` | Best-effort frame when an action or capture fails. |
| `<name>.webm`, `<name>-N.webm` | Finalized recording for each tab; checked for a nonempty WebM signature. |
| Matching `.mp4` parts | With ffmpeg; padded for odd viewport dimensions. |
| `manifest.json` | Scene paths, capture status, diagnostics, conversion, and cleanup. |
| `browser-evidence.json` | Run-wide console/page errors and request events, including navigation and closed tabs. |
| `console.json`, `requests.json` | Unfiltered native summaries for the current tab at finish. |
| `activity.jsonl` | Browser tool replies, retained for diagnosis. |

`captureStatus: captured` reports completed capture, while
`visualReview: pending` deliberately remains. The helper cannot claim that an
agent inspected pixels. Media signature checks do not prove playback or visual
correctness. Only viewed images support a visual correctness claim.
Each scene names its video part. Deliver all `files.videos` entries, or all
converted `files.mp4s` entries when MP4 is required; the helper does not edit
multiple tabs into one movie.

## Common questions

**Does the app need Playwright?** No. The agent CLI can live in a reusable tool
directory. The helper resolves it from `--cli`, `UI_DEMO_VIDEO_CLI`, an existing
project `@playwright/cli`, or PATH. An ordinary project Playwright library is not
the agent CLI. The tested CLI version is `0.1.22`.

**Does it use my personal browser session?** No. It launches a fresh, isolated
profile. Existing authorized app authentication can be supplied through
`--storage-state` before recording. The authentication file is not copied into
the artifacts. Native host browser tools have their own session and permission
rules.

**Is ffmpeg required?** The native recorder produces WebM without a separate
ffmpeg command on PATH. ffmpeg enables MP4 conversion. `finish --mp4 required`
fails if MP4 cannot be delivered; ordinary finish preserves WebM and reports
missing or failed conversion accurately.

**What if a command fails or the session is interrupted?** Call `finish` on
the returned run directory. Failed actions keep a failure frame when possible,
and finalization preserves partial evidence. Wait for each command to return;
overlap is rejected. After an interrupted command's process exits and all tool
calls return, `finish --recover` preserves its lock and marks that run failed.
Read the manifest before making a completion claim. No broad browser or process
cleanup is used.
If browser close failed, repeat `finish` retries that cleanup without replaying
actions or recording finalization. The original failure stays in the manifest.

**Why no JSON walkthrough language?** Playwright CLI already supplies
navigation, locators, forms, dialogs, tabs, uploads, and recording annotations.
The helper handles reusable capture responsibilities; app flows supply native
actions. An unsupported interaction can use a narrow CLI `run-code` call while
recording stays in the helper.

**Can it upload the recording?** Only with existing explicit authorization.
Select reviewed media; diagnostic files can contain local paths or app data,
so the entire artifact directory is not an attachment bundle.

## It is working if

- The video and scene frames come from the changed app's real user flow.
- Every checkpoint image was viewed and error evidence was inspected.
- Runs preserve previous evidence and report actual capture/conversion failures.
- The helper closes its own browser and keeps the evidence.
- Claude Code and Codex use the installed helper without writing recorder code.
