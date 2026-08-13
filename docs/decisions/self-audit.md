# Decision: `self-audit` — a retrospective on the process, not the work

**Date:** 2026-08-13

## Status

Implemented. Ships as `workbench 0.23.0`.

## Context

Every tuning change to the workbench system so far has arrived the same way:
the operator noticed friction during a session and said so afterward, from
memory. The flow had a door for auditing the *work* (`audit`, with
`claim-check` and `qa-sweep` behind it) and nothing at all for auditing
**itself**. Improvements therefore depended on the operator both noticing the
friction and remembering it well enough to describe.

The session is the one party that observed every moment. The obstacle is that
it is also the party being graded, and a session asked "how did the process
do?" will produce a flattering essay: it confuses *the process misled me* with
*I ignored the process*, and it pads with phrasing suggestions to look
thorough.

## The shape

A user-invoked skill that turns the retrospective into a protocol whose
structure resists self-flattery rather than trusting the session not to.

- **Trace before verdict.** Step 1 records facts only — which skills fired and
  what made them fire, which of the three gates arrived versus were decided for
  the user, every correction and dead end. Judgment is step 2. Facts are cheap
  to write down before there is a verdict riding on them.
- **Three buckets, one yields proposals.** *Process defect* → proposal;
  *session defect* (the process was clear, the session didn't follow it) →
  reported, no edit; *clean* → one line. Without the split, every retrospective
  becomes "the skill should have made me do it."
- **The conversion rule** keeps the split honest the other way: an instruction
  the session *reliably* misses is a wording defect, not a discipline defect.
  Repeated misses move from *session defect* to *process defect*.
- **A bar, and a no-findings out.** A proposal survives only if the change
  would have altered this session or the next of its shape. A clean result is
  reported as clean; padding is barred explicitly.
- **Named target, named edit shape** — one piece (or *the absence of one*) and
  one of: wording, gate, boundary, new, delete. "Clarify the handoff" is not a
  proposal; the replacement sentence is.
- **Observation window stated first**, so a compacted session cannot be
  reconstructed from the artifacts it left behind.
- **Reports, never edits.** The edit belongs to `writing-skills`.
- **What held** is part of the output: a retrospective that only ever subtracts
  will eventually subtract the parts that were working.

## Non-goals

- **Not an audit of the work.** Bugs, code quality, and test gaps stay with
  `audit` and the review pieces.
- **Not a flow moment.** It is `disable-model-invocation: true` and carries no
  row in `using-workbench`'s ownership table — it sits outside the flow looking
  back at it, the same way `adopt-global-rules` sits outside. A session able to
  invoke its own retrospective would run one unprompted, at the worst moment,
  and grade itself.
- **Never grades the user.** Corrections are evidence about the process, not
  about them.

## Packaging

`workbench 0.23.0`. Usage page: `docs/skills/self-audit.md`.
