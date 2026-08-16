# Decision: the communication style ships as a Claude output style, not as `CLAUDE.md` prose

**Date:** 2026-08-14

## Status

Implemented: pack v3, ships in `toolkit 0.7.0`.

## Context

`globals/CLAUDE.md` carried a two-paragraph **Communication** section: BLUF
answer-first responses plus ASD-STE100 Simplified Technical English. It went
into `~/.claude/CLAUDE.md` as part of the pack's global-document block, so every
Claude Code session in every repository loaded it as an always-on memory
instruction.

Claude Code has a first-class surface for exactly that instruction: an **output
style** at `~/.claude/output-styles/<name>.md`, selected with `/output-style`.
The pack was putting a style-shaped instruction in the wrong place.

## Decision

Move it. The section leaves `globals/CLAUDE.md` and ships as a pack-owned output
style, `bluf-ste`. `globals/AGENTS.md` keeps the same guidance inline, because
Codex has no equivalent surface: the per-host authoring rule doing what it
exists to do.

That makes **output styles a third kind of pack content**, alongside the
per-host global document and the fanned-out rules. A host receives them only if
its manifest entry declares a target, so the kind adds nothing to Codex.

## Why the surface matters

Three reasons, in order of weight:

1. **A memory file is a catch-all; an output style is a channel.** An
   instruction about how the session talks competes with everything else in
   `CLAUDE.md` for attention. In an output style it is the whole document.
2. **It becomes switchable.** A style the user can turn off is a preference. The
   same text in `CLAUDE.md` is an always-on instruction with no off switch short
   of editing the file the pack owns.
3. **It stops the duplicate.** The user's machine already carried a hand-written
   `bluf-ste.md` output style *and* the pack's `CLAUDE.md` paragraph. The pack's
   own reconciliation step cannot detect that: a rules directory is a flat
   namespace and the two live in different files entirely. Shipping the style
   collapses the pair to one source.

## What this cost the installer

Two mechanics, both small and both general rather than style-specific:

- **The marker cannot always ride at the top.** An output style opens with YAML
  frontmatter that the host parses from byte zero, so an HTML-comment marker
  ahead of it would break the file the pack is trying to manage. `markWholeFile`
  now inserts the marker directly below any leading frontmatter block, and the
  rules directory (which has no frontmatter) is unaffected.
- **Whole-file install and directory scanning are now shared.** Rules and output
  styles use the same `installWholeFile` and `scanDir`, so collisions, orphans,
  `--prune`, and the unmanaged report behave identically in both directories
  without a second implementation.

## Install, never activate

The installer writes the style file and stops. It does not touch
`settings.json`, and it does not switch the machine's active style. Choosing how
a session talks is a preference, and the pack's contract is that it owns marked
blocks rather than the user's settings. The run reports the style as *installed, not
activated* and names `/output-style` as the way to turn it on.

## Consequence for existing machines

A machine that already carries a hand-written `~/.claude/output-styles/bluf-ste.md`
gets a **collision**, not an overwrite: the file has no pack marker, so it is
the user's. That is the designed behaviour: the run surfaces it, the user
decides, and accepting the pack's copy is what puts the machine back on a single
released source.
