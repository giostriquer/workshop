# Decision: add an OpenCode plugin surface

**Date:** 2026-08-21

## Status

Implemented. `validate-native-plugin.ps1` passes.

## Context

The repo publishes its two plugins (`workbench`, `toolkit`) across four host
ecosystems (Claude Code, Codex, Cursor, Antigravity), each with a native
packaging convention. OpenCode was checked for its equivalent and has none that
fits this payload:

- **No marketplace, no registry file.** Verified against the published config
  schema (<https://opencode.ai/config.json>): the `plugin` array accepts npm
  specs or local JS/TS hook modules only — code-level extension points, not
  content bundles. Nothing in the schema registers skill folders by reference
  to a manifest.
- **Skills are discovered by directory scanning**: `~/.config/opencode/skill/`
  (global) plus extra roots under `skills.paths` in `opencode.json`, each
  scanned recursively for `**/SKILL.md`. The loader keys a skill on its
  frontmatter `name`, which must be lowercase-hyphenated, at most 64 chars,
  and match the folder name.
- **Agents have their own format** (`mode` / prompt-body / `permission`
  frontmatter), incompatible with the Claude Code agent files.

So the existing layout needs no new file: `plugins/<plugin>/skills/<skill>/SKILL.md`
is already exactly what opencode's scanner loads. Like Antigravity, **this
repository does not self-register on this surface**; adoption is pointing
config at a clone or copying folders into a scanned directory.

## What was added

- Install instructions in the root and per-plugin READMEs: point global
  `"skills": { "paths": [...] }` at the two plugin `skills/` directories in a
  clone, or copy individual skill folders into `~/.config/opencode/skill/`.
- `scripts/validate-native-plugin.ps1`: every shipped skill's frontmatter
  `name` must equal its folder name in lowercase-hyphen form (opencode's
  loader rule; Claude wants the same parity), and neither plugin may carry an
  invented `.opencode-plugin/` manifest directory.
- The operator's machine wiring points global `skills.paths` at this
  checkout's two `skills/` directories, so repo edits flow live into every
  opencode session on the machine.

## Non-goals

- **No manifest file.** There is no `.opencode-plugin/plugin.json` and no
  registry entry: both would be inert fiction, the exact mistake recorded in
  [antigravity-plugin-surface](antigravity-plugin-surface.md). The validator
  now refuses them if they reappear.
- **No agent conversion.** Converting the five reviewers into opencode agent
  format would create a fifth diverging mirror of content whose copies the
  repo already fights to keep aligned. Skills-only matches the Codex surface's
  declared capability set.
- **No npm plugin shim.** A published `opencode-*` package could inject
  `skills.paths` from its `config` hook, but that adds an npm release train
  for what a config edit already does.
- **No `adopt-global-rules` host target.** Same boundary as Antigravity:
  adding `~/.config/opencode/` as a globals destination is a separate decision.

## Why no version bump

No plugin payload changed — no manifest, no skill, no agent was added or
edited. This is documentation plus validator coverage, mirroring the Cursor
and Antigravity precedents.
