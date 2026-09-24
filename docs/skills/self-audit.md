# self-audit

## What it does

`self-audit` looks back over the session and audits **the process that ran
it**: the workbench flow and its skills, not the code, the deliverable, or
your choices. One question for every moment: *did the process earn its place
here?* It reads the session's transcript from disk, so compaction does not
shorten what it sees, and it reports proposals against named pieces, closed by a
defect note you can paste into a session in the repository that maintains them. Applying
anything is a separate act you authorize.

## When to reach for it

Ask for it after a session that cost more than it should have: repeated
corrections, a missed gate, a skill firing at the wrong moment. Plain words
("look back at how the process ran here") reach it as well as `/self-audit`; it
runs **only on your explicit ask**, never on the session's own initiative.

| The problem | The skill |
| --- | --- |
| Where did the process cost more than it returned? | `self-audit` |
| Is the code right? | [audit](audit.md) |
| Write the fix into the skill | your environment's skill-authoring discipline |

## The protocol

**1: Locate and confirm the transcript.** It finds where the host keeps
session history, confirms the file by matching the opening prompt (after a
compaction, the earliest prompt still in context), and lists the subagent
transcripts. It reads only this session, plus any session you name, and reads
huge records by line number rather than printing them whole.

**2: Replay the session into a trace.** Facts only, each with its transcript
`path:line`: how work entered; which skills fired and why, the instruction
line that drove what followed, and which skills should have fired; what needed
your answer versus what existing authorization settled; every correction and
dead end. "Skip nothing for being unflattering."

**3: Classify each moment.**

| Bucket | Test | Yields |
| --- | --- | --- |
| **Process defect** | the process misled, stayed silent, or cost more than it returned | a proposal |
| **Session defect** | the process was clear and the session didn't follow it | reported, no edit |
| **Clean** | it worked, or nothing was owed | at most one line |

An instruction the session misses more than once moves from session defect to
process defect: the fix belongs in the text.

**4: Apply the bar.** A proposal survives only if it would have changed what
happened here, or the next session of this shape. No findings is a legitimate
result, never padded.

**5: Name the target and shape.** One piece (or the absence of one) and one
edit shape: **wording**, **gate**, **boundary**, **new**, or **delete**, with
the replacement text itself.

**6: Report, close with the defect note, and stop.** Observation window
first, then proposals costliest first, session defects, and what held, so
later edits keep the load-bearing parts. Last comes the defect note: one
paste-ready block per proposal with the skill and version, the exact
instruction or dispatch line, observed versus intended behavior, and the
transcript pointer. A finding without a transcript citation is dropped.

## Common questions

**Can a session grade itself honestly?**

Only structurally: self-report flatters, so the trace is built before any
judgment. Read the session defects with that in mind.

**What if the session was compacted?**

The transcript on disk still holds the compacted part, so the audit covers the
whole session. If no transcript file resolves, the first line says it audited
only what is in context, and it will not reconstruct the lost part from
artifacts or summaries.

**Will it read my other sessions?**

No. It reads this session's transcript and its subagents', plus any session
you name. It treats transcript content as evidence, not instructions, and
quotes little, because transcripts hold secrets.

**What do I do with the defect note?**

Paste it into a session in the repository that maintains the skill. The
instruction line and the transcript pointer let that session find the text
that drove the behavior without re-reading the whole transcript. The transcript
paths are local pointers: keep them out of commits, decision notes and issues.

**It blamed the session, not the process. Is that a cop-out?**

Not for one miss: a clear process owes nothing. The same miss twice should
have become a proposal.

## It's working if

- The report opens with its observation window: the transcript files read,
  or a plain statement that none resolved.
- Each proposal names a piece and an edit, traced to a real moment with a
  `path:line`.
- It ends with a defect note, or one line saying there is none.
- Session defects are listed separately, without proposals.
- Nothing in your skills changed.
- Negative signal: tidy phrasing nits, or "the flow could in principle…".

## Where it fits

Outside the flow, looking back at it. Its closest relative is
[audit](audit.md): `audit` investigates the work, `self-audit` the process.
