## Write the lane contract

**Choose the assignment first.** For each revalidated workset, select an
available existing or fresh lane by current file ownership, dependencies and
capacity. Completed work gives its former lane no ownership of later work.
Continue the existing session for unfinished assigned work, corrections,
delivery and recovery. Reusing an idle lane for new work needs an explicit new
assignment; keep the earlier workset's completed disposition. Useful context and
repository-supported setup reuse inform the choice after readiness is established.

Dispatch independent ready worksets together under the primary journey and the
current epic's governing concurrency and delivery limits. A lane awaiting PR
checks retains its delivery responsibility; that wait alone does not hold
independent implementation. Apply limits only within the scope of their governing
source, not because another program's recovery note used them.

**Lane identity.** Give each implementation or auditor lane one canonical name:
a short alphanumeric token, unique within the epic, such as `L3`, `Parser` or
`A2`. When reusing a lane, retain its established simple name; give a new lane
its own name and record it in the ledger and contract before dispatch. Use that
exact name in paste labels, pointer blocks, dispatches, report headings and
status updates throughout corrections, delivery, audit rounds and recovery.
Keep role, worksets, tickets,
phase and PR details in separate fields or prose. A lane covering several
worksets still has one name; separate lanes each have their own name and handoff.

For an inherited composite label, choose one canonical name and record the old
label's mapping to it in the ledger before the next handoff. This label repair
keeps the same session and preserves existing artifact paths and references.
The mapping is recovery metadata; subsequent destination labels use only the
canonical name.

Group concurrent assignments by active file ownership so they do not compete
over a shared contract. Historical ownership is not a reservation.
Name affected producers, fixture builders and consumer checks for
shared-interface changes. Parallel lanes must have neither conflicting file
ownership nor unmet producer/consumer dependencies; record readiness conditions.
Coordinate an ownership overlap before concurrent edits and record the agreement
under `FORKS/DEVIATIONS`. Coordination cannot override epic exclusions.

The initial dispatch is a complete brief that works without tracker access:

- **Lane:** canonical name from the ledger, with role and assigned worksets
  recorded separately; fresh or reused session and the current reason for that
  assignment.
- **Scope:** governing epic source and amendments, the journey step the
  workset moves, assigned criteria, the tickets its delivery closes, ticket
  objectives and source anchors, finish line, exclusions, and decisions the
  lane can make or must return.
- **Setup:** validated integration ref/SHA, worktree and branch, repository setup
  and toolchain, applicable repository rules and publication state. Include the
  shared scope folder and the [local tooling boundary](local-tooling.md); identify any tooling
  explicitly approved for delivery and its authority source. Name your
  delivery gate separately from any operator-reserved publication decision and
  cite the governing instruction for that reservation.
- **Inputs:** contract revision and smallest complete reading set, including
  exact required sections. Separate supporting evidence from startup reading;
  state which checks need it. Resolve conflicting contracts before dispatch.
- **Outcomes and evidence:** affected contracts, required behavior and checks,
  compatibility obligations and handback evidence, including the running-app
  flow for a user-reachable change. Let the lane choose design,
  sequencing and test techniques within repository and owning-skill rules.
- **Coordination and handback:** other lanes' ownership/dependencies, required
  gates, and the role's reporting skill: `workbench:epic-implementation` for the
  complete [lane report](lane-report.md), or
  `workbench:epic-auditor` for the complete
  [audit report](audit-report.md).

Name required skills by host name, task inputs, outcome and evidence. Do not
copy their procedures or model routing, pin plugin versions/cache paths, or add
method mandates unrelated to this work. Link the shared report template or
include it once in the initial contract; every handback of implementation or
audit work must still contain the populated copyable report.

**Amendments carry deltas.** Reference the active contract and revision, state
what changes, its scope basis, refreshed base/evidence where required, and any
changed gates or authority. Retain unchanged terms by reference instead of
repeating setup, standing rules, review instructions and the report template.
Name the role's reporting skill in each amendment; implementation delivery
authorizations name `workbench:epic-implementation`.
For a recovered session, make the current contract and amendments directly
readable; reconcile conflicting revisions before continuing.

**Auditor dispatches.** Require `workbench:epic-auditor` in every audit brief,
follow-up, amendment, acceptance, closeout and recovery prompt. When requesting
audit work, state whether it is an initial audit, a bounded follow-up or the
final closure audit. Supply approved criteria and exclusions, the artifact
revision and access/setup, neutral fix-family targets, required
evidence and the epic's scope folder. Keep PR history and implementer conclusions
out of the auditor's starting brief. Include or link the shared audit report in
the initial contract; later prompts reference that contract and carry deltas.
The auditor returns audit results in a populated report for your independent
corroboration; assignment closeout follows **Audit returns name what is finished**.
