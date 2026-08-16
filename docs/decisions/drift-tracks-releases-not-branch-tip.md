# Decision: drift is measured against published releases, not the branch tip

**Date:** 2026-08-12

## Status

Implemented.

## Context

Operator call, immediately after the `writing-skills` verbatim mirror: the
sync should only ever consider a **published** upstream version, not
work-in-progress commits.

`drift-check.mjs` resolved its comparison target with
`git rev-parse origin/main`. A branch tip is whatever the author committed
last: a half-finished refactor, an experiment, a typo fix that will be
amended. Diffing against it means reviewing churn upstream never stood behind,
and for a `mirrored` piece it means copying that churn into a shipped plugin.

Two pieces of evidence made the case concrete rather than theoretical:

- **The existing pin was already on an unreleased commit.**
  `git describe` resolves `44c9b2d` to `v6.2.0-1-g44c9b2d`: one commit past
  v6.2.0. The manifest half-admitted it, recording the release as `"6.2.0+"`.
  Nobody could say what that `+` contained.
- **The mirror landing on a release was luck, not design.** The commit mirrored
  the same day, `b36e082`, happens to be exactly `v6.3.0`. Had the author pushed
  one more commit that morning, a work-in-progress state would have shipped in
  `toolkit` 0.3.0 under the banner of an upstream mirror.

## The change

`upstream.track` defaults to `"releases"`. The script now fetches tags,
resolves the newest tag matching `upstream.tagPattern` (default `v*`) by version
sort, dereferences it with `^{commit}`: annotated tags resolve to a tag object,
not a commit, which would otherwise produce a target no diff could use, and
compares against that.

Commits sitting on the branch past that release are counted and reported as
excluded, so an operator can see unreleased work exists without it entering the
review.

Two deliberate design calls:

- **No silent fallback.** If upstream publishes no matching tags the script
  exits non-zero and says so. Falling back to the branch tip would restore the
  behavior being removed, at the moment it is least visible. `track: "branch"`
  is the explicit, recorded opt-out.
- **The pin belongs on a release.** Step 6 of the skill now says to land
  `lastReviewed` on a release tag and record it. A pin between releases cannot
  be described to anyone: `v6.2.0+1` names a state no one can reconstruct or
  reason about.

## Not done here

The pin was **not** advanced to v6.3.0. Only `writing-skills` was handled; the
same run reports `skills/brainstorming/` as changed and unreviewed. Advancing
the pin would assert that review happened. It stays at `44c9b2d`, now labeled
honestly as `v6.2.0+1 (unreleased)` so the next reviewer knows what it means.

## Packaging

Repo-only tooling: `workbench-drift`'s skill, script, and manifest ship in no
plugin. No version bump, no release-notes entry.
