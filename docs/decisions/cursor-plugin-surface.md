# Decision: add a Cursor plugin marketplace surface + per-plugin LICENSEs

**Date:** 2026-06-30

## Status

Implemented (2026-06-30). `validate-native-plugin.ps1` passes.

## Context

The repo already publishes its two plugins (`agent-workshop`, `toolkit`) through two
native host marketplaces: Claude Code (`.claude-plugin/marketplace.json`) and Codex
(`.agents/plugins/marketplace.json`). Cursor has its own plugin-marketplace
convention; this adds that third parallel surface so the same two plugins are
installable from Cursor.

The format follows the official Cursor plugins repo
([`cursor/plugins`](https://github.com/cursor/plugins)): a root
`.cursor-plugin/marketplace.json` listing plugins by `source` folder (no versions in
the marketplace entries), and a per-plugin `<plugin>/.cursor-plugin/plugin.json`
carrying the version, metadata, and `skills` / `agents` directory pointers.

## What was added

- `.cursor-plugin/marketplace.json` (root): owner + `metadata.description` + a
  `plugins` array. Uses `metadata.pluginRoot: "plugins"` with short plugin `source`
  names (`agent-workshop`, `toolkit`), matching Cursor's multi-plugin convention.
- `plugins/agent-workshop/.cursor-plugin/plugin.json` (`skills: ./skills/`) and
  `plugins/toolkit/.cursor-plugin/plugin.json` (`skills: ./skills/`, `agents:
  ./agents/`). Versions mirror the existing manifests: `agent-workshop` `0.1.18`,
  `toolkit` `0.11.0`.
- `plugins/agent-workshop/LICENSE` and `plugins/toolkit/LICENSE`: the MIT text the
  operator supplied. **Note:** the supplied text reads `Copyright (c) 2026 Cursor`
  (matching the Cursor plugins-repo template); change the holder if it should read
  Agent Workshop.
- `scripts/validate-native-plugin.ps1` gained Cursor-surface checks: the marketplace
  lists exactly the two plugins with the right `source`s, and each Cursor per-plugin
  manifest's `version` is kept in lockstep with its Claude/Codex manifest (the same
  drift guard the other surfaces get).
- `docs/adoption/native-plugin.md` "Marketplace Files" lists the Cursor surface.

## Why no version bump

The Cursor manifests mirror the **current** plugin versions (`0.1.18` / `0.11.0`);
this is an additive packaging surface, not a functional change to any skill or agent,
so it ships at the versions already in flight rather than forcing another bump. The
validator now refuses any future drift between the three surfaces' versions.

## Install

Cursor custom-repo marketplaces are a **Team Marketplace** feature
(Teams/Enterprise, admin): **Dashboard → Settings → Plugins → Team Marketplaces →
Add Marketplace → Import from Repo** pointed at `giostriquer/agent-workshop`; members
then install `agent-workshop` / `toolkit` from **Customize**. (Plugins published to
the official `cursor.com/marketplace` install via `/add-plugin` or the **Add to
Cursor** button.) These instructions are in the root, `toolkit`, and
`agent-workshop` READMEs and `docs/adoption/native-plugin.md`.

## Non-goals

- No `rules/` directory: neither plugin ships Cursor rules, so the manifests omit the
  `rules` pointer.
