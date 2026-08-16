# Decision: `claim-check` STOPs when it can't reach the premise's source

**Date:** 2026-06-19

## Status

Implemented.

## Context

Observed in lived use: a session was handed a tracker ticket as the premise, did
**not** have access to that ticket (no integration, URL unreachable, no paste), and
went ahead with the claim-check anyway: reconstructing the premise from the link
and its own memory and investigating a *guessed* version of the claim. The output
looked like a real verdict but rested on a resource the session never examined.

The skill already had the right *spirit* in two places: "Resolving the premise"
says to fetch the substance "via a tracker integration or the URL if reachable;
otherwise ask the operator to paste them," and `inconclusive` exists for "an
artifact you cannot access." But neither closed this hole:

- The "otherwise ask the operator to paste" fallback didn't say **STOP**: a model
  under momentum read it as a soft suggestion and proceeded.
- `inconclusive` is *earned after* a genuine investigation hits a wall on a
  load-bearing claim. The failure here is *before* investigation: the premise's
  substance never arrived, so there is nothing on which to ground even an
  `inconclusive` one, because you can't name the load-bearing claim you couldn't
  reach if you never had the claims.

The resource can be any source the premise rests on: a ticket, a PR, the repo or
file the claim is *about*, a referenced doc or URL. In every case, no firsthand
access to the source = no premise to check.

## The shape

Add an explicit **access precondition** that fires *before* the investigation:

- A claim-check requires firsthand access to (1) the premise's **source** (what
  *states* it: ticket/PR/doc) and (2) the **artifact it concerns** (the repo /
  file / reference). If either is unreachable and the operator can't supply it,
  **STOP** before investigating.
- The STOP report is plain and short. It names the resource that could not be accessed, what
  was tried, and the one thing that would unblock it (paste the body, grant repo
  access, share the doc). It is **not** one of the verdict buckets: no
  investigation ran.
- Hard prohibition on the observed failure: do **not** reconstruct the premise from
  the link's slug, the ticket ID, memory, or inference, and do **not** investigate
  a guessed version of the claim.
- Distinguished from `inconclusive` in the text so the two don't blur: access STOP
  = can't start; `inconclusive` = started, dug, hit a real wall on a load-bearing
  claim. The partial case is preserved, when only the *prior-work backlog* is
  unreachable (tracker won't take a query) the investigation still proceeds and
  records that the backlog wasn't swept.

Form (per `writing-skills` "match the form to the failure"): this is a discipline
failure (the model knows it lacks the source and proceeds anyway) so it gets a
named STOP precondition plus a prohibition on the specific cheap substitutes
(slug / memory / inference), not soft "prefer to ask" guidance.

## Non-goals

- Not a new verdict bucket: the six-bucket taxonomy is unchanged; the access STOP
  is a precondition failure reported as such.
- Doesn't change the substance-fetch ladder (integration → URL → operator paste);
  it adds the STOP that triggers when that ladder is exhausted.
- The `description` (triggering conditions) is unchanged: *when* to reach for the
  skill hasn't changed.

## Packaging

- Canonical `.claude/skills/claim-check/SKILL.md` edited; byte-identical mirrors
  re-propagated to `.codex/`, `.gemini/`, `plugins/toolkit/`, and both onboarding
  reference roots. Origin doc `docs/skills/claim-check.md` updated and mirrored.
- Rides the same version bump as the `handoff-goal` rework landing in the same
  batch: `toolkit` `0.8.2`, `agent-workshop` `0.1.13`: no additional bump (both
  reworks ship under one release step). `scripts/validate-native-plugin.ps1`
  `$expectedSkills` is unchanged and still passes.

## Validation

The RED is the lived observation above (a session proceeded without access and
produced a verdict on a resource it never saw). GREEN check: hand a session a
ticket URL it cannot open with no paste, and confirm it STOPs and reports the
access gap rather than reconstructing and investigating a guessed premise.
- `scripts/validate-native-plugin.ps1` passes with the unchanged skills set.
