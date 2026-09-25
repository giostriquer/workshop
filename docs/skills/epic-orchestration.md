# epic-orchestration

## What it does

`epic-orchestration` makes the session the **epic owner**: it holds the tickets,
writes the prompts other sessions execute, verifies what comes back against the
repository, rules on open questions, and decides whether a PR may be opened. It
never implements, commits, pushes, or merges. You carry prompts out and
reports back.

| Role | Owns |
| --- | --- |
| Orchestrator (this session) | tickets, lane prompts, independent validation, rulings, authorization |
| Implementer lane | one worktree, one report, its completion review |
| Auditor | a blind empirical audit, with repro and anchor per finding |
| Operator (you) | lane dispatch, merges, product rulings |

It is **user-invoked only**.

## When to reach for it

Type `/epic-orchestration` when an epic spans more tickets than one session can
carry and you dispatch the implementation sessions by hand, or to close such an
epic on evidence rather than an empty ticket list.

| The problem | The skill |
| --- | --- |
| A multi-ticket epic, lanes dispatched by hand | `epic-orchestration` |
| One goal for one fresh session | [handoff-goal](handoff-goal.md) |
| A broad surface to cover at team scale | [qa-sweep](qa-sweep.md) |
| One premise, ticket, or hunch | [claim-check](claim-check.md) |
| One finished change to prove | [empirical-proof](empirical-proof.md) |

Not for implementing a change yourself, and not for a single ticket.

## Common questions

**What does it produce?**

Dispatch files and paste-ready pointer blocks. Each lane prompt, audit brief, or
authorization is its own file under the epic's scope folder. The initial lane
contract carries scope, setup, tickets with anchors and behavioral bars,
required reading, outcomes, evidence, rules and authority. It includes or links
the shared report template. Amendments state only what changed and reference
the active contract. Every final handback still contains the complete populated
report. You paste a short `Paste this into <LANE>:` block naming the role,
authority and file path.

Everything is dispatchable the moment it is written. A prompt whose trigger has
not fired is not written yet; the session watches for the trigger.

**How much freedom does the implementation lane have?**

It chooses design, sequencing and verification methods within the agreed scope,
repository rules and the skills that own the work. The owner specifies outcomes,
affected contracts and required evidence without repeating those skills'
procedures. Lanes return decisions their existing contract does not settle.

**Does it check that a ticket is still valid before assigning it?**

Yes. It first ties each assignment to the approved epic's acceptance criteria
and scope sources, including explicit amendments and exclusions. It then refreshes
the integration branch (`origin/dev` unless another target is configured)
without disturbing active lanes or your changes, then checks each ticket at that
SHA. Fixed or obsolete work leaves the dispatch,
partly resolved work is narrowed, and unresolved claims or a failed refresh
hold it.

**What stops qualification from growing into unrelated work?**

Every dispatch states its scope basis and finish line. A discovered defect,
reachable dependency, or coordinator-written backlog does not expand the epic.
Permission to use a credential or fixture does not add a deliverable, and a
conditional readiness check stays conditional. Helpers and closing audits use
the same scope boundary.

Unrelated findings get separate follow-ups. If one blocks a required epic check,
that check stays visibly blocked until the dependency is resolved or you amend
the scope. The owner continues independent work without claiming the missing
proof passed.

**Does every handback require another merge and dispatch?**

No. A lane continues work and routine corrections under an active contract whose
assignment traces to operator-approved scope. Before new dispatches, the owner
still refreshes and inspects the integration branch. The lane merges and rechecks
when a relevant change invalidates the work or evidence, or a repository/delivery
rule requires it. Unrelated upstream changes do not create new qualification
tasks. Valid evidence keeps
its original revision and input attribution.

**How does it group work into lanes?**

By **file ownership, not topic**: all changes to a hot file go in one lane.
Lanes go out together only when they share no files and none waits on another
in-flight lane's output.

**How does it connect to the rest of the workbench?**

Every implementation dispatch names [epic-implementation](epic-implementation.md),
which keeps handbacks in the shared
[lane report template](../../plugins/workbench/skills/epic-orchestration/references/lane-report.md).
When the full agreed work set is ready to ship, the lane runs
[trim-comments](trim-comments.md), committing its edits inside the lane's
range, then [code-quality-review](code-quality-review.md), plus
`test-quality-review` when production logic or tests changed; a dispatch names
those skills by name, never by a plugin version or a cache path. Authorization
sends the lane to [file-pr](file-pr.md), states whether that review has run,
and carries the trim's open encoding offers to you; one you approve goes back
to the lane as a correction.

**When does the owner step into a lane's review?**

Only when it stops converging. Corrections and owner validation are not review
passes, and the lane's focused follow-ups run without the owner. When a lane
reports that review stopped converging under `code-quality-review`, the owner
decides and records the next step, and unless that decision ends review the
lane's follow-ups run on their own again. Delivery waits until independent
reviewers close the blockers or you explicitly waive them.

**Can it use subagents?**

Yes, for bounded support such as checking evidence. Helpers inherit the
session's model; a smaller one in the same harness takes only trivial, cheaply
verifiable work.

**Does it trust the reports?**

No. The owner inspects the reported revision and independently checks
consequential claims. Regression fixes need evidence that checks detect the
intended defect; reverts or mutations run only in disposable checkouts.
Behavior-preserving work can use equivalence and passing characterization.
New interfaces, docs and configuration get checks suited to their contracts.
Missing imports or broken setup never count as a regression RED.

The owner also checks applicable diff rules, infrastructure design, what gates
accept and reject, and actual producer output where required. It states what
remains unverified. Completion review does not replace this acceptance check.

**Does the owner choose PR titles or resolve every merge conflict?**

The lane chooses the title under repository conventions and `file-pr`. It can
resolve merge conflicts within settled contracts. Changed behavior still needs
affected validation and review before delivery; a new scope, policy, product or
authority decision returns for a ruling. Valid prior authorization and review
evidence continue to apply.

**Where do debt, follow-ups, and validation details go?**

Into a local epic ledger, with detailed records beside it.
`DEBT + FOLLOW-UPS` is a required report slot, so a lane cannot silently skip
it. Separately assignable work gets a deduplicated ticket; corrections stay in
the lane's contract; unconfirmed claims keep their evidence and disposition.

**What should a new coordinator read?**

The ledger: the epic's existing README or CURRENT entry point, or `LEDGER.md` if
none exists. It indexes the approved goal, closure bar, exclusions and amendment
sources separately from discovered follow-ups, plus lanes and revisions,
dependencies, holds, decisions, owners, and next actions. Its tracker backlog
indexes work; governing scope sources determine membership. Read the ledger,
then the brief and governing sources needed for the next action. Finished
instructions leave that path once no active lane, held delivery, or outstanding
work needs them
([using-workbench's artifact guidance](using-workbench.md)); evidence stays
addressable.

**How does each reply end?**

With what was verified and a concrete next step: continue authorized work, dispatch ready
lanes, name a pending delivery gate, dispatch the closing audit, propose
closure, or name a blocker.

**When is the epic done?**

On a **blind re-audit**, not an empty ticket list. The auditor starts from the
artifact, never the PR list, probes the epic's declared surfaces against its
acceptance criteria, and attacks prior fixes. The owner corroborates the audit
and checks acceptance evidence, regression families, finding dispositions and
required delivery before proposing closure. You decide. Another round needs an
unresolved finding, changed behavior or missing evidence; the number of rounds
does not establish completion.

**A lane asks me to waive, scope or diagnose mutation timeouts.**
Not your call, and not a ruling. The test reviewer bounds its own run; a partial run or a timeout is not a finding. Send the request back to the lane with the rubric's bounds. Only a repository rule or the operator removes a run.

**Will the PR mention the process?**

No. PR text describes the change and its stakes, never lanes, the epic, or
review mechanics.

## It's working if

- Every prompt you receive is dispatchable as-is.
- Every implementation dispatch names a freshly validated revision and only work
  remaining at it, tied to an approved epic criterion.
- Amendments reference the active contract; lanes can make decisions it already settles.
- Reports come back validated against the repo, with unverified parts stated.
- Lanes that touch the same file arrive in the same prompt.
- Negative signal: a lane report accepted because it looked complete.

## Where it fits

Above the workbench flow, and made of it: it coordinates several sessions across
an epic and owns the judgment none can make alone. Its closest neighbor is
[handoff-goal](handoff-goal.md), which packages one goal for one fresh session.
