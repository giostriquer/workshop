# Decision: the adversarial code-quality review is default-on, not offered

**Date:** 2026-08-12

## Status

Implemented.

## Context

The intended rule has always required an adversarial code-quality review after
a work-stream's implementation is complete and before the PR-or-merge ask.
Sessions were not doing it. They would finish an implementation, verify it,
and go straight to the landing gate, not out of defiance but because the
flow layer told them the review was optional in four separate places.

The operator reported the symptom as "models are not understanding correctly."
Reading the text as a model would, the misunderstanding is well-founded:

1. **`using-workbench` said it outright.** "**`verification-before-completion`
   is the only always-on piece.**" A model that reads this has been told, in
   the plainest terms available, that `code-quality-review` is *not* always-on.
   Everything else the file says about the review is downstream of that.
2. **The session-start framing generalized the wrong way.** "These are defaults
   the user configured, **not gates**: skills fire on relevance, never on
   compulsion." Applied globally, this dissolves any mandatory step.
3. **The Boundaries section repeated it.** "Orientation, not compulsion … it
   never forces."
4. **The skill's own description was request-shaped.** "*Use for* a strict code
   quality review, deep code quality audit, or especially harsh maintainability
   review" reads as a trigger waiting on a user's words. The completion timing
   that followed it read as a *restriction on when it may fire*, not as a
   *mandate that it must*.

The flow diagram did say "ONE adversarial review … fires only here," but
"fires only here" constrains placement, not obligation, and it was
outweighed by four statements pointing the other way.

## The change

The review is now stated as **default-on**, with exactly two exits, at every
site that previously implied otherwise:

- **`using-workbench`, session-start framing**: the "defaults, not gates"
  paragraph now carries an explicit carve-out naming the two default-on
  pieces, and closes the rationalization gap: a small diff, a confident
  implementation, a tidy-looking change, time pressure, or the session's own
  judgment that this one looks fine are *not* reasons to skip.
- **`using-workbench`, Cost and authority**: "the only always-on piece"
  becomes two always-on pieces. This was the load-bearing error.
- **`using-workbench`, flow diagram**: "REQUIRED, not offered," with the two
  exits inline.
- **`using-workbench`, ownership table**: the row is marked **required**.
- **`using-workbench`, Boundaries**: "orientation, not compulsion" keeps its
  meaning but names the two standing exceptions, and states that skipping one
  is the user's call, never the session's.
- **`code-quality-review` description**: re-shaped from request-triggered to
  completion-triggered: "Required once a work-stream's implementation is
  complete … run it unasked unless the user explicitly declines or the repo's
  own process supersedes it." The on-request triggers are kept, because asking
  for a harsh review out of band is still a real entry point.
- **`code-quality-review` body**: the gate bullet now says default-on and
  enumerates the two exits alongside the non-reasons.

## The two exits, deliberately narrow

- **The user explicitly declines.** Their process, their call.
- **The repo's own process supersedes it.** A repo with its own mandated review
  stage wins; the workbench layer never overrides local convention.

Nothing else qualifies. The failure mode being closed is a session talking
itself out of the review on the grounds that this particular change looked
clean, which is exactly the judgment the adversarial pass exists to
distrust.

## Amendment (same day): "adversarial" added to the on-request triggers

The flow layer calls this pass **adversarial** in every place it names it:
"ONE adversarial review", "the one adversarial pass", "its adversarial
review". The skill's own description contained the word nowhere, so a user
asking for "an adversarial code quality review" was matching on "code quality
review" alone and got no help from the term the rest of the system uses. The
on-request clause now reads "a strict **or adversarial** code quality review".

A trigger-surface fix rather than a behavioral one, but the same family of
defect as the mandate confusion above: the flow and the skill were describing
the same thing in different words.

## Amendment (same day): description trimmed back to purpose and usage

Making the review default-on was implemented partly *in the description*; it
grew to carry when to run it unasked, both exceptions, and the
once-per-work-stream rule. That is execution policy in the one field every
session pays for whether or not the skill fires, and it is precisely the
description bloat this repo's own token audit flags against other skills. The
skill body already carried all of it.

Trimmed to purpose and usage: 65 words → 31, leaner than the 40 it started at.
What stays is the trigger surface, including the phrase that makes the gate fire,
"required once a work-stream's implementation is complete," plus the
misfire guard, "never mid-implementation". Both exits and the non-reasons live
in the body's gate bullet, which is where a session reads them: after the
skill has already loaded, at the moment it matters.

Lesson worth keeping: a mandate needs exactly one word in the description
(*required*) and its full statement in the body. Encoding the whole policy in
the trigger surface taxes every session to serve the sessions where it fires.

## What was deliberately not changed

`verification-before-completion` keeps its always-on status and its wording;
it was never the confused half. The `code-quality-reviewer` agent's
description is untouched because it is the executor the skill dispatches, not the
trigger surface. And the review's **scope discipline is unchanged**: it still
fires once, never mid-implementation, and out-of-scope findings still become
follow-ups rather than growing the diff. Making the review mandatory does not
make it recursive.

## Honest note on process

This change is prose in two skill specs, with no code diff. Running the
adversarial code-quality review on it would be ceremony; that skill's rubric
(abstraction quality, file size, spaghetti conditions, code-judo moves) has no
purchase on a spec edit. Recorded here rather than performed.

## Packaging

`workbench` `0.20.8` → `0.20.9` across all three plugin manifests and the
Claude marketplace entry.
