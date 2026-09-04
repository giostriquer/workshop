# Decision: `epic-orchestration`: the epic owner is a role, and it ships

**Date:** 2026-09-04

## Status

Implemented. Ships as `toolkit 0.10.0`.

## Context

The skill existed and was already field-proven, but it lived in the operator's
private global scope (`~/.claude/skills/epic-relay/`), where it was invisible
to the plugins, absent from every other host, and outside the repo's review and
release surface. Nothing about it was machine-specific: it describes a role, a
validation checklist, and a prompt contract, all portable.

The workbench covers the inside of one session's work. `handoff-goal` packages
one goal for one fresh session. Nothing covered the tier above: an epic whose
tickets exceed what a single session can hold, implemented by several sessions
that the operator dispatches by hand, with no dispatcher and no automation
between them.

## The shape

A user-invoked orchestrator persona. The session owns tickets, lane prompts,
independent validation, rulings, and authorization, and never implements,
commits, pushes, opens PRs, or merges. Three claims carry it:

- **Four roles that do not blur**, stated as a table, with the operator as the
  only cross-session wire.
- **Validation is the job.** Every check in that section is there because
  skipping it let a real defect through: explicit `cd <worktree>` per
  invocation, red-flip that deletes added files rather than `git checkout`-ing
  a path that did not exist at base, design-reading anything
  infrastructure-shaped, and testing what a gate **accepts** rather than
  whether it runs cleanly.
- **The epic closes on a blind re-audit**, never on an empty ticket list, and
  the auditor's mandate includes attacking the fixes the previous round
  produced.

## What changed in the move

- **Renamed** `epic-relay` to `epic-orchestration`. "Relay" named the transport
  (the operator pasting between sessions); the skill is about owning the epic,
  and the transport is one line of it.
- **Description trimmed to trigger-only**, per
  [description-trim-sdo](description-trim-sdo.md): the workflow summary ("you
  write paste-ready lane prompts, independently validate what comes back, and
  authorize or refuse the PR") is exactly the pattern `writing-skills` names as
  a defect, since a description that summarizes the body gets followed instead
  of the body being read. The invocation-gating boundary ("never implements,
  commits, or opens the PR itself") is kept.
- **Em dashes removed**, matching the repo-wide copy convention.
- **Dispatch becomes a recipe with an envelope.** The rule shipped as a single
  prohibition at the tail of "Writing a lane prompt": *"Every prompt must be
  dispatchable the moment it is written. Never write 'when X finishes, paste
  this'."* Two things were missing and one was the wrong form. Missing: the
  reason (a prompt the operator has to hold gets pasted at the wrong moment or
  not at all, because the operator is routing to workers rather than keeping a
  queue) and the parallel case (several lanes in one message is the desirable
  case, not a tolerated one). Wrong form: `writing-skills` classifies
  wrong-shaped output as the failure a prohibition backfires on and a positive
  recipe binds, so the rule is now its own `## Dispatching` section stating what
  a handoff **is**, with the literal `Paste this into <LANE>:` envelope repeated
  per destination. "Hold it until the trigger fires" survives as a definition
  rather than a ban: a prompt whose trigger has not fired is not written yet.
- **A `writing-skills` pass closed four gaps.** (1) The validation section was
  built as bare imperatives plus war stories, which is the wrong form for a
  discipline failure; it gains a rationalization table and a red-flags list.
  (2) The skill manufactured the excuse it never countered, requiring a lane
  review and then saying "validate anyway" with nothing bridging them; the
  bridge is now explicit, since the two ask different questions (is the code
  well built, versus is the claim true). (3) There was no when-not-to-use in
  the body, so `## When this is the right seat` states the three conditions and
  the sibling skills, and names leaving the seat (opening an editor on the
  implementation) as the boundary. (4) `## Dispatching` said "as many lanes as
  the work parallelizes into", which is not observable; it now keys on file
  ownership, which is.
- **The lane's review was described as self-served, which `code-quality-review`
  forbids.** "The lane runs its own adversarial review" read as the author
  reviewing the author. The skill is explicit that the implementing session is
  the one context that cannot run it, so the text now says the lane *owns
  running* it and it dispatches to `code-quality-reviewer` or a fresh session.

Apart from those, the body is verbatim. It arrived with lived-in proof, which is
the inclusion bar; rewriting field-earned text on arrival would discard the
reason it qualifies.

## Follow-up: actionable work does not live in context (0.36.0)

The first release carried one non-negotiable covering this: "every deferral
becomes a ticket... nothing lives only in a report." Too narrow on both axes.
*Deferral* excludes debt a lane notices in passing, follow-ups, and the things
the orchestrator itself turns up while validating, none of which were deferred
by anyone. *A report* excludes the chat, the diff, and the session's own
reasoning, which is where most of it actually dies.

`writing-skills` classifies this failure as omitting a required element from
something the session already produces, for which the prescribed form is
structural, not a prose reminder. So the fix has two halves:

- **A required slot.** `DEBT + FOLLOW-UPS` joins the lane report format beside
  `FORKS/DEVIATIONS`. A lane fills it in or visibly leaves it empty; there is no
  way to silently not consider it.
- **A section naming the five surfaces** where such items appear (lane report,
  the orchestrator's own validation, a ruling, a scoped-out finding, the blind
  re-audit) and the closing condition: a ticket id, before the wave closes,
  written back into the record that raised it.

The clause that matters most in practice is the last one, because it is the
only one about the epic's own output: a fix that widened a type, left a shim,
or pinned a version to get green is debt the moment it merges, and the lane
that wrote it is the only context that knows why.

## Why `workbench`, after first landing in `toolkit`

The first call was `toolkit`, on the reasoning that orchestrating a
hand-dispatched epic is a tier above ordinary work that most repos never reach,
and therefore optional by definition. That reasoning was about *frequency*, and
frequency turned out to be the wrong axis.

The deciding constraint is dependency direction. The skill names
`code-quality-review` (what a lane runs before handing back) and `file-pr`
(what authorization files through, and whose review gate the authorization
block declares already satisfied). Both are `workbench` skills, and `toolkit`
installs **without** `workbench`. A toolkit-only adopter would get a skill whose
two load-bearing cross-references point at nothing.

A skill that links workbench skills belongs in workbench. It stays user-invoked
(`disable-model-invocation: true`): whether an epic runs this way is the
operator's call, never a session's, and that is orthogonal to which plugin
carries it.

## Non-goals

- **No dispatcher.** The operator remains the only wire between sessions. The
  skill's value is the prompt contract and the validation discipline, not
  automation of the handoff.
- **No re-review at the PR.** The authorization block states that
  `file-pr`'s gate is already satisfied by the lane's `code-quality-review`.
  This is not a weakening: it is `file-pr`'s own second exemption ("the review
  already ran on this diff"), claimed explicitly rather than reasoned past.
  Corrections landing after that review, or a semantic conflict in the dev
  merge, put the gate back in force.
- **No overlap with `attic/skills/orchestrate`.** That parked draft dispatches
  executors itself from inside one session. This one never dispatches anything;
  the two solve different problems and the parked draft stays parked.

## Packaging

`workbench 0.35.0`, broadened in `0.36.0`. Usage page: `docs/skills/epic-orchestration.md`. Removed from
the operator's global `~/.claude/skills/` scope in the same change, so there is
one copy and the plugin is it.
