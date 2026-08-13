---
name: self-audit
description: Retrospective on the session so far, find where the workbench process itself degraded or misled the model, stayed silent when it should have spoken, or pointed the session wrong, and propose the specific fixes. User-invoked only.
metadata:
  system: workbench
disable-model-invocation: true
---

# Self Audit

Look back over this session and audit **the process that ran it**. The subject
is the workbench flow and its skills — not the code that got written, not the
deliverable's quality, not the user's choices. One question, asked of every
moment: *did the process earn its place here?*

The product is a short list of proposals against named pieces. This skill
reports; applying anything is a separate act the user authorizes.

## The evidence is this session, and only this session

- **State the observation window first.** The whole session, or only what
  survived a compaction. If the early part is gone from context, say so — do
  not reconstruct it from the artifacts it left behind, and do not treat a
  summary of a moment as the moment.
- **A finding needs a moment.** "The flow could in principle mishandle X" is
  not a finding; it is speculation wearing a retrospective's clothes. Cut it.
- **This is self-report, and self-report flatters.** The session is grading its
  own conduct. That is why step 1 builds the trace before step 2 judges any of
  it: facts are cheap to write down before there is a verdict riding on them.

## Steps

1. **Replay the session into a trace** — facts only, no verdicts yet:

   - How the work entered, and through which door: something to verify, an
     idea to build, or neither.
   - Every skill that fired: which one, at what moment, and what made it fire —
     the session reaching for it, the user typing it, or the user asking for it
     after the fact.
   - Every skill that *should* have fired by its own description and didn't.
   - The three user gates — size the workload, pick the route, PR or merge:
     which arrived, which were actually asked, which the session decided on the
     user's behalf.
   - Every user correction: redirects, "no", instructions repeated, work
     interrupted, scope pushed back on, visible frustration.
   - Every dead end: work done and then discarded, artifacts nobody read,
     ceremony that produced nothing.

   Skip nothing for being unflattering. The trace is where honesty is cheap.

2. **Classify each moment.** Three buckets — only the first yields a proposal:

   | Bucket | Test | Yields |
   | --- | --- | --- |
   | **Process defect** | the process misled, stayed silent, or cost more than it returned | a proposal |
   | **Session defect** | the process was clear and the session didn't follow it | reported, no edit |
   | **Clean** | it worked, or nothing was owed here | at most one line |

   **The conversion rule:** an instruction the session reliably misses is a
   wording defect, not a discipline defect. If the trace shows the same rule
   ignored, misread, or fired late more than once, move it out of *session
   defect* and into *process defect* — the fix belongs in the text.

3. **Apply the bar.** A proposal survives only if making the change would have
   altered what happened here, or would alter the next session of this shape.
   Phrasing nits that cost nothing don't survive. Few load-bearing proposals
   beat a long list, and **no findings is a legitimate result** — report it as
   one rather than padding to look thorough.

4. **Name the target and the shape of the change.** Each surviving proposal
   names one piece — a skill by name, or *the absence of one* — and one shape:

   - **wording** — the instruction is there but reads wrong, ambiguous, or buried
   - **gate** — fires too often, too rarely, or at the wrong moment
   - **boundary** — two pieces overlap, or a moment had no owner
   - **new** — a moment recurred with nothing owning it
   - **delete** — a piece cost more than it returned

   Say what it cost *this* session, and be concrete enough to act on: "clarify
   the handoff" is not a proposal, the replacement sentence is.

5. **Report and stop.** Verdict-first. Whether to apply anything is the user's
   call, and the edit itself belongs to `writing-skills`, not here.

## Output

- **The observation window**, stated plainly, in the first line.
- **Proposals**, costliest first: target piece · the moment that exposed it ·
  the change · what it cost.
- **Session defects**, listed separately and honestly, with no proposal
  attached — the process owes nothing for these.
- **What held**: pieces that were load-bearing this session, one line each. A
  retrospective that only ever subtracts will eventually subtract the parts
  that were working.

## Boundaries

- **Never audits the work.** Bugs, code quality, and test gaps belong to
  `audit` and the review pieces. If this session's *output* deserves a look,
  say so in one line and stop.
- **Never edits a skill**, and never edits the user's rules or configuration.
  Its last act is the report.
- **Never invents findings.** A session where the process behaved is a finding
  of its own, and reporting it as such is worth more than a manufactured list.
- **Never re-runs the work** to check whether it was done right. The trace is
  the evidence; this is a retrospective, not a second attempt.
- **Never grades the user.** Their corrections are evidence about the process,
  not about them — a correction means the process left something for a human
  to catch.
