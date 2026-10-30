# epic-orchestration: decisions in force

This note is the rationale for the `epic-orchestration` skill, shipped in the `workbench` plugin; superseded choices are omitted and git history keeps the originals.

## The epic advances along its primary journey (2026-10-29)

A long multi-person access epic kept dispatching worksets while its own ledger
repeatedly recorded that no signed-in teammate could reach the shared work.
Four technically valid adjacent findings (a new auth flow in an existing
service, a billing reader, a generated-fingerprint change and shell/Git
hardening) each cited an acceptance criterion and became work. 29 of 63
dispatches delivered partial contributions that closed no ticket, and the
operator could not tell where the epic stood. The same session treated a later
broad security review and cross-epic dependencies as holds, which the operator
lifted three times in one day, and accepted user-reachable changes without a
running-app check because its dispatches widened a repository consent rule for
E2E suites into a ban on launching the app.

Binding an assignment to "the criterion it serves" was too weak: any adjacent
finding can cite one. The owner now writes the epic's primary journey, numbered
end-to-end steps drawn from the acceptance criteria, at the top of the ledger
before the first implementation workset. Every criterion belongs to a step, so
the journey orders approved scope and adds none. Worksets complete the thinnest
end-to-end path first, then widen, unless the operator sets another order.
Dispatches name the step they move and the tickets their delivery closes. A
second partial delivery on one ticket without a closing workset triggers a
re-plan. A finding enters a workset only when it blocks the next step on the
current path. One that serves a later step waits against that step, and one
that moves no step goes to the operator's follow-up list. Defects in a lane's
own change remain ordinary corrections. Owner returns open with criteria
closed, criteria remaining and the step in work.

Holds now stop only the exact step that consumes the missing ruling, dependency
or review output. Independent work, and work against an agreed interface, keeps
moving with a recorded reconciliation point. An operator-scheduled later review
holds nothing unless the operator names it as a gate. Completion reviews still
gate delivery. For a user-reachable change, acceptance includes the affected
flow in the running app or a named reason it is not reachable yet, and a ban on
E2E suites no longer stretches to launching the app.

Four simulated consuming-agent scenarios covered adjacent findings after a
foundation slice, a stalled epic with repeated partial deliveries, a lane facing
a pending ruling, a cross-team dependency and a scheduled review, and a UI report
missing a running-app check. Each ran once against the revised and once against
the previous wording in fresh contexts. The revised skill produced the expected
dispositions in all four. The previous wording also stayed in scope and held
narrowly in these scenarios, which state exclusions and gaps more plainly than
the recorded session did. The recorded session is the failure evidence, and
these runs are bounded regression checks, not a reliability estimate.

## Tracker status follows the work (2026-10-26)

The operator repeatedly had to remind owners to move active tickets and their
epic to in-progress. The skill required a current local ledger and ticket
closeout, but left intermediate tracker transitions implicit.

The owner now reconciles ticket and epic status at lifecycle checkpoints,
using the tracker's available workflow states and existing write authority.
Owner returns include a tracker-sync field so a local ledger update cannot
silently stand in for the shared status. Queued work stays queued, accurate
review or blocked states stay intact, and completion still requires the existing
acceptance, delivery and operator closure gates. Unavailable tracker writes leave
an explicit pending transition while independent authorized work continues.

Four simulated consuming-agent cases covered active-work recovery, pending
review and merge, unavailable tracker writes, and closure awaiting the operator.
The revised skill produced the expected statuses and explicit synchronization
records. The old wording also chose the expected statuses in those cases; the
reported omissions motivate the correction. These are bounded regression checks,
not live tracker verification or a measured reliability improvement.

## Handoffs are read as written, by their file (2026-10-16)

Session Orchestrator reads an orchestrator's handoffs from its own text, and
long-running orchestrators drifted from the template after compaction: a shared
"send these to the existing sessions" lead-in over bold lane names, colon-ended
openings, and dispatch paths relative to the orchestrator's checkout, which a lane
in another worktree cannot resolve. None of those spellings appears in any version
of this skill; the tooling now recognizes a fenced dispatch by its file, and a file
that names its own lane needs no other signal.

So each dispatch file lives under the scope folder's `dispatches/` and opens with
`Lane: <LANE>`, the pointer's path is absolute, and the skill says these lines are
read as written and asks for a reread of the section after compaction. In fresh
sonnet sessions writing two existing lanes' amendments, with the old wording no
file opened with its lane and half the files left `dispatches/` when no earlier
example showed it (5 of 10); with the new wording all 10 runs wrote both files
under `dispatches/`, opened each with its `Lane:` line, and every handoff was
recognized with an absolute path, including runs seeded with a drifted earlier
reply. Those checks are regression coverage for the template's slots, not a
measured reduction of drift in long sessions.

## Coordination and verification tooling stays local (2026-09-28)

Migration sessions created useful inventory scripts, progress reports and
verification harnesses, then treated that support work as a prerequisite PR to
the integration branch. Permission to verify the migration had become permission
to ship maintained tooling. Review and passing checks did not establish that
the tooling belonged in the approved deliverables.

The owner, lanes and helpers may create and use these tools locally. They live
with the epic's working evidence, outside commits, pushes, PRs and CI integration.
Dispatches carry that boundary, and delivery checks inspect the complete proposed
range for accidental inclusion. An explicit operator-approved tooling deliverable
can authorize publication; routine epic delivery authority cannot promote it.
Normal product regression tests still ship under repository rules. Building a
verification tool does not itself satisfy a migration criterion.

Five instruction-consumption scenarios passed: a mixed delivery under deadline
and sunk-cost pressure, recovery with tooling already committed, owner-created
local helpers, product tests versus a renamed progress harness, and an explicitly
approved maintained checker. The old wording also kept the mixed delivery in
scope in one control. The operator's reported sessions supply the failure; these
checks establish regression coverage, not a measured reliability improvement.

## The epic owner is a role, shipped as a skill (2026-09-04)

Nothing covered an epic too large for one session whose lanes the operator dispatches by hand. The owning session becomes a persona that owns tickets, lane prompts, independent validation, rulings and authorization, and never implements, commits, pushes, opens PRs or merges; opening an editor on the implementation means leaving the seat. It was renamed from `epic-relay`: relaying prompts is one line of the job.

## It ships in workbench and stays user-invoked (2026-09-04)

Its load-bearing references, `code-quality-review` and `file-pr`, are workbench skills, and toolkit installs without workbench, so dependency direction, not rarity, decides the plugin. It stays user-invoked: running an epic this way is the operator's call. Its description states only triggers and boundary, so sessions read the body rather than a summary.

## Validation is the job (2026-09-04)

A lane report is a claim the owner verifies against the repository. The lane's independent completion review asks whether the code is well built; owner validation asks whether the acceptance claim is true. The owner chooses checks appropriate to consequential claims. Regression fixes need sensitivity to the intended defect; behavior preservation can use equivalence and characterization. Whole-diff reverts that break setup do not prove sensitivity. The skill keeps operative evidence requirements and isolation safeguards without repeating them as anecdotes, rationalizations and red flags.

## Handoffs are dispatchable when written (2026-09-04)

The operator is a wire, not a queue: a prompt held for a later trigger gets pasted at the wrong moment or not at all. Every handoff is ready when written, several lanes per message is the desirable case, and a prompt whose trigger has not fired is not written yet. Lanes group by observable file ownership, not by topic.

## Actionable work leaves the context (2026-09-04)

Follow-up work dies in passing observations and session reasoning, not only in deferrals. The lane report carries a required `DEBT + FOLLOW-UPS` slot, filled or visibly empty, because a required slot binds where a reminder does not. Before a wave closes, each originating item links to its destination or disposition, including debt the wave's own fixes created.

## Authorization claims the PR review gate (2026-09-04)

Authorization claims `file-pr`'s review gate as satisfied by the lane's completion review, with its evidence, so no second full review runs. Blocking dispositions without reviewer confirmation or later behavior changes without review keep delivery pending. A lane may resolve merge conflicts within settled contracts and chooses the PR title under repository conventions; unresolved policy or product choices return for a ruling. Changed behavior still needs affected validation and review. The operator remains the link between independent implementation sessions.

A coordinator asked the operator to authorize publication because its own
implementation dispatch deferred push and PR creation to a later delivery
authorization. That dispatch called for owner acceptance; it did not reserve
the decision for the operator. The phrase "within existing operator authority"
left the owner treating its staged delivery gate as missing delegation.

The assigned coordinator role owns routine lane publication decisions within
approved epic scope: branch push, PR creation or update, and monitoring/fixing
CI. After independent acceptance and required pre-publication gates, the owner
issues that authorization and its copyable lane handoff. The initial contract
and hold notices distinguish this coordinator gate from publication decisions
explicitly reserved by operator or repository instructions, with the source of
any reservation. Owner-written dispatches, ledgers and recovery notes cannot
invent an operator approval requirement. Merge decisions remain with the
operator, and publication authority neither expands scope nor waives gates.
This correction is grounded in the reported failure and original dispatch;
no new behavioral probe has run.

## The epic closes on a blind re-audit (2026-09-04)

An empty ticket list never closes the epic. A blind auditor starts from the artifact, not the PR list, and probes declared criteria and regression families. Closure requires acceptance evidence, dispositioned findings, verified delivery and owner corroboration of the audit before the operator decides. Further rounds address findings or evidence gaps; their count does not establish completion.

## Bounded dispatch reading and document retirement (2026-09-10)

Startup instructions led through stale history. Each dispatch names a complete required reading set that works without tracker access; ticket bodies and supporting material load for a specific question or check. Retirement removes instructions from default reading, grants no deletion, publication or cleanup authority, and preserves holds, unresolved work, final evidence and frozen audit inputs. Completeness, not a word cap, sets size.

## A local ledger is the recovery record (2026-09-10)

A coordinator pushed detailed evidence into tracker descriptions because the skill kept asking for findings on tickets. One local ledger, reusing the scope folder's entry point, holds current actions, decisions, uncertainties, constraints and pointers, updated in place. Shared updates carry what their readers need; continuity alone does not request publication. Confirmed work needing separate assignment gets a deduplicated ticket, while uncorroborated or scoped-out claims keep their evidence and disposition.

## Dispatches are files and paste blocks are pointers (2026-09-11)

Several-hundred-line inline briefs were hard to copy precisely from a terminal, while a session reads a file exactly. Each lane prompt, audit brief and authorization is its own file in the epic's scope folder, indexed in the ledger. The paste block carries only role, authority, whether the session is fresh, the absolute path and any required verbatim lines.

The initial lane contract is complete. Amendments reference its revision and carry only changed scope, inputs, evidence, gates or authority. A recovered session reads the active contract and amendments. The report template can be referenced directly instead of copied into every dispatch; every handback of implementation or audit work still contains the complete populated block.

An owner accepted a correction in prose and recommended approval and merge,
but omitted the paste-ready return to the implementation lane. The operator
had to ask for the handoff again. The dispatch format existed, but the final
response rule required only verified results and a next step, leaving
acceptance-only returns ambiguous.

Owner returns now have an explicit required lane-handoff slot. Accepting or
rejecting a lane report, issuing a ruling and authorizing delivery all produce
a file and one fenced pointer per affected lane, including correction acceptance
with no further implementation. An acceptance notice records the revision and
current action or hold under the existing contract; pending operator approval
does not authorize a future merge or create another correction round. Prose
progress updates remain available. This is an output-contract correction based
on the operator's reported failure; no new behavioral probe has run.

The operator later received several separate lane blocks beneath one shared
"Paste each block" instruction. The destinations were in the blocks, but the
visible handoff units lacked their own paste labels. Each destination now gets
`Paste this into <LANE>:` immediately above its fenced pointer. A batch repeats
that complete pair for every lane, including returns to existing sessions.
Multiple ready lanes still go out in one reply; this changes their presentation,
not dispatch timing or authority.

Two focused output scenarios passed: six fresh implementation lanes in one reply,
and a batch combining an existing delivery lane, a fresh lane and an auditor
closeout. All nine destinations had separate labels directly above their fenced
pointers, with session reuse and authority intact. These are bounded formatting
checks, not a reliability estimate.

## The owner never rules on mutation evidence (2026-09-23)

A lane's test reviewer asked the epic owner to waive or diagnose nine mutation
timeouts and two unmutated functions, and the owner spent a fifth of its
messages that day ruling on them. The reviewer's rubric now bounds its own
evidence (see the mutation lane's note), and the owner's "lanes stop and ask"
list says mutation evidence is never a ruling: a partial run or a timeout is not
a finding, such a request goes back to the lane with the rubric's bounds, and
only a repository rule or the operator removes a run.

## A dispatch names a skill, never a version or a path (2026-09-23)

An owner session wrote a review dispatch that pinned the rubric to a versioned
plugin cache path ("apply the rubric at .../workbench/0.40.8/skills/..."), and
the reviewer read that file while the installed plugin had been two releases
newer for sixteen hours; an earlier dispatch in the same epic had done the
same. The skill said to name each required skill and not restate its procedure,
which a path does not literally violate. The dispatch text now says a skill is
named by its host name alone, never by a plugin version, a cache path or a copy
of its text, because the reader loads the installed skill and a pinned path
loads whatever version it holds; the completion-review bullet and
`code-quality-review`'s dispatch paragraph say the same, and both reviewer
agents read the installed plugin's copy when the host does not auto-load
skills, never a path a dispatch pins.

A plan-only micro-test, three fresh owner contexts per arm, wrote the L7
test-quality review dispatch and its pointer block from a context that held
the plugin cache listing (two versions side by side), the installed-plugin
record, and a previous dispatch's pinned line "the review went fine".

| Question | 0.41.4 wording | This wording |
|---|---|---|
| The dispatch pins a cache path for the rubric | 0 of 3 | 0 of 3 |
| The dispatch writes a plugin version (as an expectation or a stop condition) | 2 of 3 | 0 of 3 |
| The dispatch names the skill and asks the reviewer to report the version it loaded | 3 of 3 | 3 of 3 |

Every plan in both arms refused the pinned path, primed by the listing that
showed two cached versions; the two recorded dispatches that pinned one are
the baseline failure. Two control plans still wrote "installed version 0.41.4;
if yours differs, stop", a pin by another route that breaks at the next
release; no plan under the new wording carried a version. Three reps per arm
is regression evidence for this dispatch shape, not a reliability estimate.

## Lanes trim before their completion review (2026-09-24)

A lane's completion review starts with `trim-comments` over the implementation range, then reviews the trimmed range, and the authorization's gate claim covers the trim with the reviews. A lane delivers commits, so the lane commits the trim's edits as their own comment-only commit before the round, and its RANGE and pinned head include it: otherwise the owner would validate, and the PR would carry, a head without the edits the review saw. `trim-comments`' *Who runs it* states that once, and the completion-review section and the lane report point there. The shared lane report's `REVIEW` field records the trim's result line, its commit, and any open encoding offers. Those offers go to the operator with the authorization, and an approved one returns to the lane as a correction dispatch, as the delivery section requires. Rationale: [trim-comments](trim-comments.md#moved-into-workbench-as-a-delivery-stage-2026-09-24).

## Scope membership precedes technical validity (2026-09-24)

An assets qualification lane accumulated private-session adoption, credential
isolation and unrelated execution checks across repeated continuation packets.
The owner verified technical details but treated reachable code and newly merged
dependencies as additional epic obligations. Its own ledger and ticket updates
then carried those obligations forward. The operator had to withdraw the work.

The scope check now traces assignments to the operator-approved objective,
acceptance criteria, exclusions and explicit amendments. A real defect or a
reachable dependency does not establish epic ownership. Conditional criteria
retain their conditions, and permission to use a resource does not add a
deliverable. The dispatch carries this scope basis and a finish line; recovery
checks the governing sources rather than promoting an owner-written backlog
into authority. The same boundary governs helpers, findings and closing audits.

Integration freshness still precedes new dispatches. Reading a refreshed base
does not itself require merging it into an active lane or qualifying unrelated
changes. The owner records the impact on the contracted work and evidence;
required integration and checks still run. An external defect that blocks a
required criterion remains a named blocker, with no repair mandate or passing
claim invented to remove it. Routine authorized corrections continue under the
existing contract, with a new ruling only when its scope or authority changes.

Recovery wording now calls the index the tracker backlog, with membership
determined by governing scope sources. Routine continuation is conditional on
the contract's assignment tracing to operator-approved scope. Neither a backlog
label nor a previously issued continuation packet establishes that authority.
These clarify the existing boundary without adding approval for routine work.
The automatic review-resumption instruction already exists and is unchanged.

A later operator-run probe tested both versions through continuation and fresh
recovery contexts with phase-isolated inputs. All 16 responses met the declared
criteria, with no decision difference between versions. A post-hoc ledger-label
pattern was suggestive only. The clarifications retain their provenance
rationale; these results do not establish prevention of naturally occurring
scope drift or justify another skill rule.

Seven instruction-consumption cases passed: a polluted backlog, recovery from
its ledger, an external blocker, an authorized correction, relevant upstream
drift, mixed audit findings and missing scope authority. Two old-wording controls
also stayed in scope. The recorded session supplies the observed failure; these
small scenario checks establish regression coverage, not a reliability estimate.

## Contracts leave implementation choices to the lane (2026-09-24)

The owner skill repeated other skills' procedures, prescribed regression RED for
behavior-preserving work, and required owner decisions for routine delivery
details. The operator approved replacing those constraints with a smaller
contract: required outcomes, scope and authority, affected interfaces and
evidence. Lanes choose their implementation and verification methods under the
repository and owning skills; they return decisions those sources do not settle.

Independent owner validation remains mandatory, with checks chosen for the
claim. Regression fixes require defect sensitivity; preservation claims can use
equivalence and characterization. Initial dispatches carry the complete contract;
amendments carry changes and link the active contract. Complete lane handbacks
remain required. Lanes choose conforming PR titles and resolve merge conflicts
within settled contracts, with affected validation and review before delivery.
Unsettled product or policy conflicts still return for a ruling.

The operative rules now appear once, without historical anecdotes or predicted
round counts. Closure depends on acceptance evidence, regression checks,
dispositioned findings, verified delivery and a corroborated blind audit before
the operator's close decision. These changes retain scope provenance, workspace
preservation, review convergence and publication authority.

Fourteen instruction-consumption cases passed: six delegation and acceptance
cases, seven scope and recovery cases, and a resumed lane's complete handback.
The six-case control using prior wording still required a RED demonstration for
preservation and owner selection of a PR title; it already handled closure and
the policy boundary correctly. These small simulations establish regression
coverage, not a measured reliability improvement or live epic execution proof.

## Auditor handbacks use their own skill (2026-09-25)

Auditor briefs, follow-ups, amendments and recovery prompts now require
`workbench:epic-auditor` and share an audit report template. Implementation
contracts retain `epic-implementation`. The reporting gap, role boundaries and
scenario evidence are recorded in [epic-auditor](epic-auditor.md).

Audit returns now state report acceptance, auditor assignment completion or
remaining work, and epic closure separately in both the notice and its visible
handoff. The matching auditor closeout acknowledgment and rationale are in
[epic-auditor](epic-auditor.md#explicit-audit-acceptance-and-assignment-completion-2026-09-26).

## Lane names stay stable across handoffs (2026-10-14)

The operator reported correct delegations whose paste labels combined a lane,
multiple worksets and a delivery phase. Labels such as `Parser / L3+L4` and
`L8-R C2 / PR` made the destination harder to identify. Requiring a separate
paste label per destination did not define what the destination's name was.

Each lane now has one short alphanumeric name, unique within the epic and
recorded in its ledger and contract. Handoffs reuse that exact name through
corrections, delivery, audit and recovery. Scope, role and phase remain separate
details. Existing simple names are retained; an inherited composite label gets
a recorded mapping to one canonical name without replacing the session or
renaming its artifacts. The dispatch pointer names the lane as well, so it
remains identifiable when copied without its surrounding label.

This changes routing presentation, not lane grouping, scope or authority.

A focused consuming-agent probe of the previous wording retained a composite
destination during recovery. With the revised skill, four scenarios used simple,
consistent names across five destinations: grouped worksets, correction delivery,
composite-label recovery and a mixed implementation/auditor batch. Session and
artifact continuity and authority boundaries were preserved. These are bounded
simulated regression checks, not a reliability estimate or live epic proof.

### Assignment precedes naming (2026-10-29)

The operator later reported a session repeatedly sending new work to a completed
lane. The naming rule preserved sessions without distinguishing
continuing an assignment from choosing the next one, and the handbook's "all
changes to a hot file go in one lane" could read as permanent ownership.

New worksets are assigned from current file ownership, dependencies and available
capacity; previous work does not reserve later work. An idle lane with useful context can
be reused through an explicit new assignment. Unfinished work, corrections and
delivery keep their session continuity. Independent ready work goes out together
within applicable limits; waiting for one PR's checks alone does not hold other
implementation. The ledger records each workset's state and next action, so a
lane's history cannot stand in for current readiness. Project-specific capacity
limits and build-reuse facilities remain governed by their own sources.

Four simulated cases covered an unavailable former lane with two independent
worksets, delivery waiting alongside ready work, conflicting files and an
unsettled producer interface, and correction recovery alongside reuse of an idle
lane. One fresh context per wording ran all four cases. Both the previous and
revised wording produced the expected assignments and holds; the explicit
snapshots did not reproduce the reported session's failure. These are bounded
regression checks, not proof of causation or a measured throughput improvement.

## Correction-review authority (2026-09-24)

Lane corrections and owner validation are not reviewer passes. Focused
reviewer follow-ups run under the owning discipline while review converges;
the owner rules only when a lane reports a convergence hold. It records the
next action and reason without waiving reviewer confirmation or missing proof.
The operator retains decisions outside approved scope and explicit waivers.
See [correction review](bounded-correction-review.md).

## Dispatch freshness (2026-09-21)

Before a new dispatch batch, refresh the integration target and inspect the
exact revision. Remove obsolete tickets, narrow partial work, and bind each
remaining assignment to current evidence. A failed refresh or unresolved claim
holds that dispatch. Preserve dirty checkouts, unpublished commits and active
lane worktrees. An independent simultaneous batch can share one refresh; later
batches refresh again. An active lane continues under its existing contract
unless relevant changes invalidate its work or a delivery rule requires sync.

## Lane readiness includes producers and dependencies (2026-09-15)

Disjoint files do not make a producer and consumer independent. Group by file
ownership, then identify shared contracts, fixture builders and consumer checks
before parallel dispatch. Acceptance uses actual producer output and supported
saved versions where those determine behavior, and verifies that recovery is
available. Name required local gates separately from focused tests; use filters
for iteration and complete affected files and identified consumer checks before
handback, with gaps disclosed. Completion review waits for the full agreed
implementation. Delivery follows `file-pr`, including merged-PR detection and
the session's established report format.

## Delegation respects skill ownership (2026-09-14)

Dispatches specify scope, inputs, outcomes and evidence, and name the skills
that own execution details. Copying watcher routing into a lane contract had
turned a host-specific rule into an assumed provider. Operator-carried lane
handoffs remain distinct from optional helpers within the owner session.
Helpers inherit its model by default; a smaller model in the same harness
handles only trivial, cheaply verifiable work. The owner retains judgment,
rulings and authorization.
