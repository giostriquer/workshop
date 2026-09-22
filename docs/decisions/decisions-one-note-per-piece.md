# Decision: one decision note per piece

**Date:** 2026-09-22

## Status

Implemented.

## Context

`docs/decisions/` had grown to 126 notes and 97,000 words: implementation
plans, embedded skill drafts, superseded notes kept beside their successors,
and notes about pieces, plugins and doc layers that no longer exist. A reader
looking for why a shipped skill is shaped the way it is had to read a chain of
notes and work out which ones still held.

## Decision

Each shipped piece gets one note, `<piece>.md`, that carries the decisions
still in force as dated sections, and nothing else: no status lines, no
implementation checklists, no probe logs. A later decision amends that note;
a note it supersedes is deleted, since git history keeps it. Notes the release
notes still link stay as separate files until they roll off the bounded log.
Implementation plans and drafts are not decisions and are not kept here.
`AGENTS.md` carries the rule.

The first pass deleted 33 notes outright, merged 53 into 15 consolidated notes
(each checked against its current spec, with lapsed entries dropped), and kept
28. The usage pages under `docs/skills/` were rewritten to their handbook
contract in the same change.
