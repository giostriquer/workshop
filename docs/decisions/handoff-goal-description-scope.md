# Decision: handoff-goal — description declares the defined-work scope

**Date:** 2026-07-31

## Status

Implemented.

## Context

The skill's frontmatter description listed "a brand-new idea" as a valid goal
source. Read by a session deciding whether to invoke, that phrase invites
exploratory handoffs — "look into X", open-ended research — which the skill's
own body already excludes: the *Check goal fit first* section requires pursuit
to be a loop with checks that can fail, and recommends a lighter tool
otherwise. The trigger (description) and the gate (fit check) disagreed, and
the description is the only part a session reads before invoking.

## Change

Frontmatter description only:

- "a brand-new idea" → "a newly described but concrete objective";
- added the scope clause — for already-defined work expected to achieve a
  concrete result, outcome stateable up front, done verifiable by checks that
  can fail;
- added an explicit NOT-for clause — exploratory handoffs (open-ended
  research, "look into X" investigations, outcome not stateable yet) belong
  in a plain task or a `handoff-review` continue brief.

The body is unchanged — the fit check already carried the rule; the
description now points the same way instead of against it. Per the
skill-authoring doctrine, the description states triggering conditions only
and does not summarize workflow.

## Parity

- Canonical copy: `plugins/toolkit/skills/handoff-goal/SKILL.md` (toolkit is
  the only plugin shipping this skill).
- Origin doc `docs/skills/handoff-goal.md` untouched — it describes the fit
  check accurately and does not quote the description.
