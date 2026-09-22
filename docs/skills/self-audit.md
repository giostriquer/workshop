# self-audit

## What it does

`self-audit` looks back over the session and audits **the process that ran
it**: the workbench flow and its skills, not the code, the deliverable, or
your choices. One question for every moment: *did the process earn its place
here?* It reports proposals against named pieces; applying them is a separate
act you authorize.

## When to reach for it

Type `/self-audit` after a session that cost more than it should have:
repeated corrections, a missed gate, a skill firing at the wrong moment. It is
**user-invoked only**.

| The problem | The skill |
| --- | --- |
| Where did the process cost more than it returned? | `self-audit` |
| Is the code right? | [audit](audit.md) |
| Write the fix into the skill | your environment's skill-authoring discipline |

## The protocol

**1: Replay the session into a trace.** Facts only: how work entered; which
skills fired and why, and which should have; what needed your answer versus
what existing authorization settled; every correction and dead end. "Skip
nothing for being unflattering."

**2: Classify each moment.**

| Bucket | Test | Yields |
| --- | --- | --- |
| **Process defect** | the process misled, stayed silent, or cost more than it returned | a proposal |
| **Session defect** | the process was clear and the session didn't follow it | reported, no edit |
| **Clean** | it worked, or nothing was owed | at most one line |

An instruction the session misses more than once moves from session defect to
process defect: the fix belongs in the text.

**3: Apply the bar.** A proposal survives only if it would have changed what
happened here, or the next session of this shape. No findings is a legitimate
result, never padded.

**4: Name the target and shape.** One piece (or the absence of one) and one
edit shape: **wording**, **gate**, **boundary**, **new**, or **delete**, with
the replacement text itself.

**5: Report and stop.** Observation window first, then proposals costliest
first, session defects, and what held, so later edits keep the load-bearing
parts.

## Common questions

**Can a session grade itself honestly?**

Only structurally: self-report flatters, so the trace is built before any
judgment. Read the session defects with that in mind.

**What if the session was compacted?**

The first line says so. It will not reconstruct the lost part from artifacts
or summaries.

**It blamed the session, not the process. Is that a cop-out?**

Not for one miss: a clear process owes nothing. The same miss twice should
have become a proposal.

## It's working if

- The report opens with its observation window.
- Each proposal names a piece and an edit, traced to a real moment.
- Session defects are listed separately, without proposals.
- Nothing in your skills changed.
- Negative signal: tidy phrasing nits, or "the flow could in principle…".

## Where it fits

Outside the flow, looking back at it. Its closest relative is
[audit](audit.md): `audit` investigates the work, `self-audit` the process.
