# self-audit

## What it does

`self-audit` looks back over the session you just spent and audits **the
process that ran it**: the workbench flow and its skills. Not the code that
got written, not the deliverable's quality, not your choices. One question,
asked of every moment: *did the process earn its place here?*

The product is a short list of proposals against named pieces. It reports; it
never edits a skill.

## When to reach for it

Type `/self-audit` at the end of a session that felt like more work than it
should have been: you corrected the session repeatedly, a gate never arrived,
a skill fired at the wrong moment, or something took three tries that should
have taken one.

It is **user-invoked only** (`disable-model-invocation: true`). A session never
decides on its own to stop and grade the process.

| The problem | The skill |
| --- | --- |
| Where did the process cost more than it returned? | `self-audit` |
| Is the code right? | [audit](audit.md) → [claim-check](claim-check.md) / [qa-sweep](qa-sweep.md) |
| Is this diff maintainable? | [code-quality-review](code-quality-review.md) |
| Now write the fix into the skill | `writing-skills` (repo-local, shipped in no plugin) |

## The protocol

**1: Replay the session into a trace.** Facts only, no verdicts: how work
entered and through which door; every skill that fired and what made it fire
(the session reaching for it, you typing it, you asking after the fact); every
skill that should have fired and didn't; which of the three user gates arrived,
which were asked, which the session decided for you; every correction,
redirect, repeated instruction, and interruption; every dead end. "Skip nothing
for being unflattering. The trace is where honesty is cheap."

**2: Classify each moment.** Three buckets, one of which yields proposals:

| Bucket | Test | Yields |
| --- | --- | --- |
| **Process defect** | the process misled, stayed silent, or cost more than it returned | a proposal |
| **Session defect** | the process was clear and the session didn't follow it | reported, no edit |
| **Clean** | it worked, or nothing was owed | at most one line |

**The conversion rule** keeps that split honest in both directions: an
instruction the session *reliably* misses is a wording defect, not a discipline
defect. Miss it more than once and it moves from *session defect* to *process
defect*: the fix belongs in the text.

**3: Apply the bar.** A proposal survives only if the change would have
altered what happened here, or would alter the next session of this shape. "No
findings is a legitimate result" and is reported as one.

**4: Name the target and the shape.** One piece per proposal: a skill by
name, or *the absence of one*, and one edit shape: **wording**, **gate**,
**boundary**, **new**, or **delete**. Concrete enough to act on: "clarify the
handoff" is not a proposal, the replacement sentence is.

**5: Report and stop.**

## Common questions

**Can a session grade itself honestly?**

Only structurally. It is self-report, and self-report flatters, which is why
the trace (step 1) is built before anything is judged (step 2). Facts are cheap
to write down before there's a verdict riding on them. Read the output knowing
what it is, and weigh the *session defects* section especially: a retrospective
that lists none is suspect.

**What if the session was compacted and I've lost the early part?**

It says so. The report's first line states the observation window: the whole
session, or only what survived the compaction. It will not reconstruct the
missing part from the artifacts it left behind, and it does not treat a summary
of a moment as the moment.

**It blamed itself instead of the process. Is that a cop-out?**

That's the *session defect* bucket working as designed: the process owes
nothing when it was clear and simply wasn't followed. But check for repetition:
one miss is a session defect, the same miss twice is a wording defect and should
have converted into a proposal.

**Why didn't it find anything?**

Possibly because there was nothing to find. The skill is explicitly barred from
padding: "A session where the process behaved is a finding of its own, and
reporting it as such is worth more than a manufactured list."

**Will it apply the fixes?**

No. It reports and stops. Applying anything is your call, and the edit itself
belongs to `writing-skills`.

**Why does it report what *worked*?**

Because a retrospective that only ever subtracts will eventually subtract the
parts that were carrying the session. The *What held* section names the pieces
that were load-bearing, one line each.

## It's working if

- The report opens with its observation window, before any finding.
- Proposals name a specific piece and a specific edit, not a direction.
- Every proposal traces to a moment that actually happened in the session.
- Session defects are listed separately and honestly, with no proposal attached.
- Nothing in your skills changed as a result of running it.
- Negative signal: a long list of tidy phrasing suggestions, or findings phrased
  as "the flow could in principle…". Both mean the bar and the moment rule were
  skipped.

## Where it fits

Outside the flow, looking back at it. Nothing hands off to `self-audit` and it
hands off to nothing automatically: its output is a list you decide to act on,
at which point `writing-skills` does the editing. Its closest
relative is [audit](audit.md), and the contrast is the whole point: `audit`
investigates the work, `self-audit` investigates the process that ran it.
