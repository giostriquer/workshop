# Decision: add the `ui-demo-video` skill

**Date:** 2026-07-15

## Status

Implemented.

## Context

A lived-in pattern from a real web-app project: after UI work, the session
records a Playwright-driven walkthrough of the running app — a shareable
webm/mp4 for the PR, plus a PNG frame per scene. The frames turned out to be
the real value: a model cannot watch a video mid-session, but it can `Read` a
frame, see the actual rendered UI, and iterate (fix code or scenario,
re-record) until the frames show the expected result. The video is for
humans; the frames are the model's visual feedback loop.

The pattern earned its keep across repeated real use, but the skill text and
its harness were saturated with project specifics: a hardcoded port and
package manager, a Prisma dev-database path to back up, an internal State API
with fixture credentials for seeding, project routes in every example, and a
tracker-specific delivery rule. Copied as-is, a new adopter would inherit
instructions that are wrong everywhere except the origin project.

## The shape

`ui-demo-video` lands in `toolkit` as a direct-use skill with a bundled
recording harness (`scripts/harness.mjs`) — the first toolkit skill to ship a
supporting script. Sanitization decisions:

- **Project specifics become conditionals on observable predicates.** "Start
  `pnpm dev` (port 3002)" becomes "start the dev server via the project's
  documented run path and health-check it"; the Prisma backup becomes "if
  boot can reseed or migrate a local dev database, back that file up"; the
  State API seeding becomes "seed through the app's real surface — a
  fixture/seed endpoint, the REST/RPC API, a documented CLI seeder — never
  direct DB writes." The principle (real surface, not DB writes) survives;
  the credentials and query strings do not.
- **The harness is copied into the project, not imported from the plugin.**
  Node resolves `import "@playwright/test"` relative to the importing file,
  so a harness left in the plugin cache can never find the project's
  Playwright install. The skill instructs: copy `scripts/harness.mjs` into
  the project's `tmp/` next to the scenario file.
- **Two portability fixes in the harness itself.** It now resolves
  `@playwright/test` *or* `playwright` (projects have either) via dynamic
  import with a clear install hint on failure; and the Next.js dev-overlay
  hack (`nextjs-portal`) generalizes to a `hideSelectors` option — the Next
  default stays (a no-op elsewhere), other frameworks' dev badges get the
  same treatment without editing the harness.
- **Delivery rule generalized.** "GitHub only accepts video attachments via
  the browser editor" is universally true and stays; "never upload to
  Linear" was a project rule and becomes "don't push local artifacts to
  other trackers unless the project's own rules say to."
- **The rigid core is the feedback loop.** Step 4 — Read every
  `scene-*.png` and only count a frame-verified recording as evidence — is
  the skill's non-negotiable; everything visual/environmental is adaptable.

## Packaging

- Canonical (only) copy at `plugins/toolkit/skills/ui-demo-video/` —
  `SKILL.md` + `scripts/harness.mjs`. Not mirrored to `.claude/` (the repo
  itself has no UI to demo) and not in the onboarding bundle.
- Origin doc at `docs/skills/ui-demo-video.md`; roster entry in
  `docs/skills/README.md` (sixteen skills).
- Root `README.md` and `plugins/toolkit/README.md` skill lists gain the new
  name; Codex manifest prose and default prompts updated.
- `scripts/validate-native-plugin.ps1` `$expectedSkills` widens to include
  `ui-demo-video` in both the Claude and Codex assertions.
- `toolkit` `0.12.4` → `0.13.0` (new skill = minor bump, per the doc-to-html
  precedent) in the three plugin manifests and the Claude marketplace entry.

## Validation

- `scripts/validate-native-plugin.ps1` passes with the new skill directory.
- GREEN test: the sanitized harness executed end-to-end against a neutral
  static page (no framework, no project fixtures) — scenes recorded, per-scene
  PNGs emitted and read back, manifest written, webm produced — proving the
  harness carries no hidden dependency on the origin project.

## Non-goals

- Not a test framework — scenes demonstrate and verify visually; assertions
  belong to the project's test suite.
- Not for API-only or non-visual changes (that is `empirical-proof`'s
  territory).
- The skill does not install Playwright or provision the app; missing
  prerequisites are reported with the one-line install hint, not fixed
  silently.
