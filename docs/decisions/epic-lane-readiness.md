# Decision: lane readiness includes dependencies and producer evidence

**Date:** 2026-09-15

## Problem

Lane feedback exposed ambiguous completion timing and incomplete dependency
coverage. Disjoint files do not make a contract producer and consumer independent.
A review of an early characterization cannot cover later implementation. Tests
built around assumed inputs can miss refusals that actual producer output reaches.
Named test filters can also hide failures elsewhere in an affected file.

The existing skills already require local gates, evidence before acceptance and
focused review follow-up for material changes. Clarify those requirements where
dispatches are written instead of adding a second implementation process.

## Change

- Keep file ownership as the grouping rule, identify shared-contract producers,
  fixture builders and consumer checks, and respect their dependencies when
  dispatching. A version bump alone does not require a separate lane.
- For artifact acceptance and authority derivation, including owner rulings,
  exercise actual producer output and supported saved versions on disposable
  copies. Verify the proposed recovery is available; disclose missing evidence.
- Name required local gates and applicable static/build checks separately from
  focused tests. Use name filters for iteration; complete affected test files and identified
  consumer checks before handback, with unavailable coverage stated.
- Trigger the completion review at implementation readiness. Earlier blocked or
  guidance reports do not trigger it; later material changes retain focused
  independent follow-up under the existing review skill.
- In `file-pr`, refresh the associated PR state before delivery and each push.
  A merged PR ends its tending loop. Preserve local work and route authorized
  remaining changes to a new branch and PR from the current base.
- Keep the session's required handback format when reporting delivery, with all
  `file-pr` output information in its existing fields. Use a verdict-first report
  only when no format is required. PR-body template requirements stay separate.

The small lane-reporting skill and CI model routing remain unchanged. Generic
rules do not require every repository CI job to run locally or every contract
change to become a separate lane.

## Verification

The assessment used current skill text and archived handbacks, review evidence
and correction dispatches. They support these specific gaps, not a causal count
of all amendments. Focused scenarios cover dependency ordering, producer and
recovery evidence, local check selection, review timing, and merged/open PR
delivery. All eleven simulated cases met their intended outcomes. Native plugin
validation, `file-pr` skill validation, local link checks and whitespace checks
passed. Two additional handback scenarios retained all delivery information in
the exact lane format and in the standalone verdict-first format. The lane skill,
shared report, review policy and CI routing remained unchanged. These checks do
not establish reliability across long sessions.
