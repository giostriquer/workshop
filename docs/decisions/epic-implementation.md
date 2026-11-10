# Decision: a small reporting skill for epic implementation lanes

**Date:** 2026-09-15
**Release:** workbench 0.38.0

## Problem

After repeated amendments, implementation lanes return prose summaries and a
report-file pointer instead of the coordinator's report fields. The operator
needs a complete, paste-ready handback on each round. The existing report
contract already covers the information; its application drifts over time.

## Change

Add `epic-implementation` in the existing Workbench skills directory. It applies
only to implementation lanes dispatched through `epic-orchestration`, including
corrections, resumed sessions and authorized delivery. Each implementation
dispatch names it. The canonical report template lives in the shared
`epic-orchestration/references/lane-report.md` file. The coordinator includes its
block in the dispatch; the lane reads that reference if the dispatch omits it.
Both skills link directly to the reference, so retrieving the template does not
load the coordinator's instructions into the implementation lane.

The skill defines the final reply as one copyable report block, with current
evidence and explicit gaps. Detailed evidence can remain in linked local files.
Scope, implementation method and delivery authority come from the dispatch.
This adds no implementation workflow, coordinator role or publication authority.

The statuses `blocked`, `need-follow-up` and `need-guidance` share one conditional
`NEXT STEP` field naming the needed action or decision, owner and recommendation.
`ready-for-validation` omits that field. This replaces the blocked-only field so
each non-ready handback remains actionable.

### Questions through the orchestrator (2026-10-28)

Implementation lanes can stop to ask the operator questions that the
orchestrator already has authority to settle. Route questions and approvals
unresolved by the active contract through the existing `need-guidance` handback,
including user-input requests from other skills. `NEXT STEP` names the
orchestrator as owner and carries the question, evidence and recommendation.
The orchestrator applies existing delegated authority or escalates an
operator-reserved decision. Independent authorized work continues while the
dependent action waits. This changes routing without granting new authority.

### Handback shape, acknowledgments and operator-only approvals (2026-11-09)

Three gaps showed in the week of 2026-11-02.

One lane ended seven of ten final replies with prose and a path to a saved
report, and three with the fenced block. Handoff tooling relays the block, so
the owner never received the prose ones. The skill said the reply contains the
handback but did not cover a handback that is itself saved as a file. It now
states the reply's shape: the fenced block is the last element, and a saved
file holds the same block.

Four acknowledge-only dispatches each came back as a full report marked
ready for validation, and each cost the owner a verification turn. The auditor
skill already had a one-line acknowledgment; implementation lanes now have one
for an acceptance with work still assigned and one for a closeout.

Three lanes opened a blocking question dialog for an approval only the operator
could give; one waited 7 hours 50 minutes with its turn blocked. The by-the-book
route lost another such ask at the owner for about 40 hours. An operator-only
approval now goes in the same `need-guidance` handback with `operator` as the
owner and the exact ask, while independent work continues; the owner carries
that ask in its hold line.

The report template's `REVIEW` field gains a `scope` slot for the lane's one
`scope-review` attempt, and `NEXT STEP` names its owner as the orchestrator or
the operator. The acknowledgment lines and a report carrying an operator ask
were run through Session Orchestrator's recognition code: neither line files as
a report, and the report files with its status. One scenario probe gave a
lane a verified ticket, a second ticket blocked on a permission only the
operator could grant, and a contract asking for a saved report: its reply ended
with the fenced report, saved the same block, and named `operator` as owner in
`NEXT STEP` with the exact ask. Each scenario ran once, in a fresh context on Opus 5.5, before the last round of review corrections: regression evidence for that scenario, not a reliability estimate.

## Validation

The operator's repeated-round example is the recorded failure. A fresh control
with the full existing orchestration skill retained the report fields but did
not use a copyable fenced block. This shows the existing template is useful;
the correction targets its persistence and presentation in lane handbacks.

Read-only scenario probes with the new skill produced complete report blocks
for blocked CI, a resumed amendment with missing evidence, and merged delivery.
The standalone task did not activate it. A coordinator probe named the skill
in both a correction amendment and a delivery authorization while retaining
their distinct authority. These are focused regression checks, not a measure
of reliability over long sessions.

Native plugin validation, skill validation, local reference checks and
`git diff --check` passed. Shared-reference links use file paths without heading
fragments.

A focused output probe covered all four statuses: `ready-for-validation` omitted
`NEXT STEP`; blocked, follow-up and guidance reports named the required action or
decision, owner and recommendation.

## The lane reads the completion round's inputs (2026-11-09)

The completion round's lane-side instructions (reviewer dispatch lines, the
trim's commit subject, the one scope-review attempt) sat in a delivery
reference only the owner read, and only after the round had run. The lane now
reads that reference's completion-round section before dispatching the round,
and the contract carries the inputs it needs. A closeout for withdrawn work
has no accepted revision, so the lane's acknowledgment says `withdrawn` in its
place.
