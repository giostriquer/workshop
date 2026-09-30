# Decision: reusable web demo recording

**Date:** 2026-09-29

## Browser-specific name (2026-09-29)

The operator renamed `ui-demo-video` to `web-demo-video` because the skill
records browser workflows. The skill folder, discovery name, usage page,
tests, catalogs, and cross-references use the new name. Keep the recorder's
existing environment variables, output directory, and ownership format so
installed tooling and saved runs remain compatible.

## Context

The original skill came from repeated real web-app walkthroughs: a recording
for people and scene PNGs for the model's visual feedback. The operator now
requested a complete refresh for Claude Code and Codex, with no per-demo
recorder code. The old interface required copying `harness.mjs` into each app
and writing a JavaScript scenario. It reused output directories, waited for
network idle, and reported any conversion failure as missing ffmpeg.

A read-only Claude Code consultation with the exact `claude-opus-5-5` model
confirmed that copy-and-script overhead and identified stale evidence,
startup/finalization gaps, and misleading conversion errors. Its proposed JSON
walkthrough runner would duplicate controls now supplied by Playwright CLI.
Choose native CLI actions with a reusable capture helper instead.

## Decision

Use Microsoft's maintained [Playwright CLI](https://github.com/microsoft/playwright-cli)
for browser control and recording. The tested version is `0.1.22`. Its native
recorder supplies cursor pacing, video chapters, action callouts, and
screenshots. No Microsoft implementation or upstream skill text is bundled.

The bundled `scripts/capture.mjs` owns one isolated session per run. It
allocates a fresh directory, drives native CLI commands, captures named scene
frames and snapshots, retains diagnostics after failure, and finalizes only
its session. It runs from the installed skill rather than being copied into
an app. Dependencies can be installed once in a separate reusable tool
directory; app package and lockfiles stay untouched.

A Claude Code application run recorded and inspected the complete form and
share flow without recorder code, but submitted two UI calls in parallel.
Enforce one command at a time per run with a lock. Recovery preserves an
interrupted command's evidence, marks the run failed, and finalizes the owned
session after outstanding calls return; it does not replay an uncertain action.

Native diagnostics are scoped to a tab and can reset on navigation. Install a
fixed bundled BrowserContext event collector before app navigation so run status
includes earlier and closed-tab console/page errors and HTTP/transport failures.
Keep native summaries as well. Native recording creates one WebM per tab; retain
every returned part, associate scene frames with their part, and convert all
parts when requested. Retry failed owned-session cleanup separately from completed
recording finalization.

The workflow adapts Launch, Doctor, Drive, Evidence, and Cleanup from Lauren
Tan's MIT-licensed
[create-verification-skill](https://github.com/cursor/plugins/blob/69cf06fa253ba0761213669171198968e51fb9ff/pstack/skills/create-verification-skill/SKILL.md).
Reuse the app's documented run and seeding surfaces, stable UI controls,
ownership of temporary instances, and preserved evidence. Retain the original
skill's visual feedback loop and publication boundary.

Both hosts run the same helper. Claude Code inspects PNGs with Read; Codex
uses its available image tool. Their native browser integrations remain useful
for discovery or small visual checks, but neither is assumed to expose video
recording. Host browser and permission rules still apply. A missing capability
is a reported gap, not permission to attach through raw CDP to a managed
browser or to generate another recorder.

## Evidence contract

Capture completion and visual review are separate results. The helper reports
`captureStatus` and leaves `visualReview: pending`; only inspected frames
support a visual correctness claim. Console and request evidence stays
unfiltered. Media signatures check that artifacts were written, not that a
video played or that every frame is correct. MP4 conversion is optional, with
missing tooling and actual conversion failure reported separately.

The helper owns browser lifecycle, not dev-server provisioning, app seeding,
product regression assertions, or external publication. Cleanup closes only
the owned browser and keeps artifacts. The agent handles only app data and
servers it created and publishes selected media only under explicit authority.
