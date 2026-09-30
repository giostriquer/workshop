# Capture commands

The helper uses Node 18+ and Microsoft's `@playwright/cli`. It has no dependency
on the app's Playwright version. The tested CLI is `0.1.22`; `doctor` checks the
native recorder commands before capture. Resolve the helper from the loaded
skill directory and invoke it with `node`, including when plugin files have no
executable bit.

The `UI_DEMO_*` variable names, tool directory, and saved-run format remain
compatible with the earlier skill name. Resolve `UI_DEMO_SKILL` to the current
`web-demo-video` directory.

## One-time setup

Reuse an existing CLI first. Resolution order is `--cli`, `UI_DEMO_VIDEO_CLI`,
the `--project` directory's `@playwright/cli`, then `playwright-cli` on PATH.
An ordinary project `playwright` install alone is not the agent CLI.

If recording setup is authorized, install the CLI once in a reusable tool
directory. This directory is separate from app dependencies:

```sh
UI_DEMO_TOOLS="$HOME/.cache/workshop/ui-demo-video"
npm install --prefix "$UI_DEMO_TOOLS" --ignore-scripts --no-audit --no-fund @playwright/cli@0.1.22
export UI_DEMO_VIDEO_CLI="$UI_DEMO_TOOLS/node_modules/@playwright/cli/playwright-cli.js"
```

The default browser is a fresh, headless Chrome instance with an isolated
profile. It does not use personal Chrome cookies or attach to an existing tab.
For a machine without Chrome, use the CLI's bundled Chromium:

```sh
node "$UI_DEMO_TOOLS/node_modules/playwright/cli.js" install chromium
node "$UI_DEMO_SKILL/scripts/capture.mjs" start --project . --url http://localhost:3000 --browser chromium
```

Browser downloads and persistent tool installation need to be inside the
authorized setup scope. Otherwise report the gap and use available native
browser tools for proportionate visual checks. A screenshot check does not
require a recording installation. No capture command installs anything or
changes app package, lock, or configuration files.

## Doctor and start

`doctor --project DIR --url URL` checks CLI capabilities and HTTP readiness,
and reports optional ffmpeg availability. It does not launch a browser; `start`
tests actual browser launch and records startup failures.

`start` allocates `<project>/tmp/ui-demo-video/<name>-<unique suffix>/` by
default. `--out` changes the parent directory; relative paths resolve against
`--project`. Every run owns a unique session and fresh directory. A warning
names output that is not known to be gitignored. Keep it outside delivery.

Optional `start` flags:

| Flag | Purpose |
| --- | --- |
| `--name share-project` | A lowercase filename label, up to 64 characters. |
| `--viewport 1280x720` | The browser and recording dimensions. |
| `--browser chromium` | Bundled Chromium; also supports Chrome, Edge, Firefox, or WebKit. |
| `--storage-state FILE` | Load existing authorized app authentication before recording. |
| `--cli PATH` | The CLI executable or its JavaScript entry point. |

Authentication state remains at its original location; it is not copied into
the output. Use an existing app fixture/account and keep login secrets out of
recorded actions. Diagnostic files and browser config can include local paths
or app data. Publish only reviewed, selected media, not the entire directory.

## Act and frame

`act --run DIR -- COMMAND ARG...` sends an ordinary Playwright CLI UI command to
the owned session. Use fresh snapshot refs (`e7`) or observed semantic locators:

```sh
node "$UI_DEMO_SKILL/scripts/capture.mjs" act --run "$UI_DEMO_RUN" -- fill "getByRole('textbox', { name: 'Project title' })" 'Sprint review'
node "$UI_DEMO_SKILL/scripts/capture.mjs" act --run "$UI_DEMO_RUN" -- click "getByRole('button', { name: 'Create project' })"
node "$UI_DEMO_SKILL/scripts/capture.mjs" frame --run "$UI_DEMO_RUN" --name 'Created project is visible' --wait-for '#projects h2'
```

Actions include navigation, form controls, keyboard/mouse input, uploads,
dialogs, tabs, snapshots, and highlighting. Use the CLI's `--help` for its
command syntax. Session overrides, attachment, broad cleanup, and recorder
lifecycle commands are rejected: the helper owns them. `run-code` is an escape
for a specific interaction the CLI cannot express, not a place to write another
recorder.

`frame` saves a viewport PNG and structured snapshot and adds a chapter. Its
`--wait-for CSS` waits for an observed selector to be visible;
`--wait-hidden CSS` waits for a loading indicator to disappear. These fixed
bundled waits use Playwright readiness, not a connection going idle. Leave
product overlays and errors visible. All calls on a run must be sequential.
Discover controls before starting; batch known actions to avoid filming idle
model turns. Wait for each call to return before the next; overlapping commands
are rejected. Inspect each scene before continuing an uncertain flow.

## Finish and recovery

Call `finish --run DIR` even after a failed action or interrupted turn. It
collects run-wide console, page errors, and request evidence from the bundled
context collector, plus native current-tab summaries. It awaits `video-stop`,
checks every recording, then closes only the owned session. It retains all evidence.
A completed run can be read again with `finish` without repeating capture.
When close failed, repeat `finish` retries only owned-session cleanup and keeps
the original failure evidence.

Native recording produces a separate video per tab or popup. Deliver every
`files.videos` part; each scene's `video` names its corresponding WebM.
`files.webm` is the initial tab's recording. MP4 conversion applies to all parts;
`files.mp4s` lists successful conversions and `conversion.parts` reports each
outcome. The helper does not compose tabs into a single edited video.
Use `act ... -- tab-close [index]` to flush that tab's video before closing it.
If app code closes a popup itself, the native recorder can lose that part;
the helper reports missing media as failed and preserves the other evidence.

An interrupted command can leave a lock. Once all outstanding tool calls have
returned, use `finish --run DIR --recover`. Recovery requires the lock's owning
process to have exited; it cannot override a live command. It preserves the
abandoned lock and marks the interrupted run failed. Inspect its evidence and
record the corrected flow in a fresh run; do not replay an uncertain action.

| `--mp4` | Behavior |
| --- | --- |
| `auto` (default) | Convert with ffmpeg if present; retain WebM and record missing/failed conversion. |
| `off` | Deliver WebM without conversion. |
| `required` | Return a failure when MP4 cannot be produced. |

`--ffmpeg PATH` selects a converter. Failed conversion never advertises a
partial MP4 as a finished artifact; the real error stays in the manifest. Odd
viewport dimensions are padded to an even size for H.264.

| Result | Meaning |
| --- | --- |
| Exit 0 | Command succeeded or capture completed; images still require review. |
| Exit 1 | Action, media, cleanup, or browser error evidence needs attention. |
| Exit 2 | Usage or prerequisite gap; a startup failure may include a preserved run directory. |
| `captureStatus: captured` | Scene frames and finalized video exist; no detected browser errors. |
| `captureStatus: needs-review` | Media exists, but console/page errors, failed HTTP responses, or transport failures need review. |
| `captureStatus: failed` | A capture step, required artifact, or cleanup failed. |
| `visualReview: pending` | The helper does not claim a model viewed the images. |

Read the manifest's listed `scene-*.png`, any failure frames, `console.json`,
and `browser-evidence.json`. The latter retains events across navigations and
closed tabs; `console.json` and `requests.json` are native current-tab summaries.
`activity.jsonl` preserves tool replies. Media signature
checks are artifact checks, not a playback or visual-correctness proof. Fix
in-scope defects and start a new run instead of overwriting the failed attempt.

## Host differences

Claude Code uses Bash for these commands and Read for PNG inspection. The
installed skill's base directory supplies `UI_DEMO_SKILL`. Codex uses its
terminal and available image-viewing tool, resolving the script next to the
listed `SKILL.md`. Keep artifacts inside the permitted workspace. A denied
browser launch is a permission gap; use the host's approval mechanism.
For unattended Claude Code runs with scoped Bash permissions, invoke each
`node` command directly so the allowed command pattern can match it.

Chrome integration in Claude Code and configured browser providers in Codex
are optional. Discover their actual tools and follow their documentation and
permission rules. Screenshots, GIFs, and video are distinct capabilities; do
not invent recording methods, attach through raw CDP to a managed browser, or
change browser security settings to obtain a recording. If an image tool is
unavailable, report that visual inspection did not run.
