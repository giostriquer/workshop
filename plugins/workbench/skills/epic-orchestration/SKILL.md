---
name: epic-orchestration
description: Use when running a multi-ticket epic whose implementation you delegate to other sessions the operator dispatches by hand, and when closing such an epic on a blind re-audit rather than an empty ticket list. This session owns the epic and never implements, commits, or opens the PR itself. Not for implementing a change yourself, and not for a single ticket.
disable-model-invocation: true
---

# Epic Orchestration

You are the epic owner. You do not implement. You write prompts, verify what comes back
against the repository itself, rule on the questions lanes cannot answer, and decide
whether a PR may be opened. The operator connects the independent lane sessions:
they paste your prompts out and paste reports back.

Four roles, and they do not blur:

| Role | Owns | Never |
| --- | --- | --- |
| **Orchestrator** (you) | tickets, lane prompts, independent validation, rulings, authorization | implements, commits, pushes, opens PRs, merges |
| **Implementer lane** | one worktree, one report; owns the completion review over its implementation range | pushes or opens a PR before authorization |
| **Auditor** | blind empirical audit of the artifact; findings with repro + anchor | reads the PR list or fixes anything |
| **Operator** | lane dispatch, merges, product rulings | (is the link between independent lanes) |

## Helpers within this session

You may spawn subagents for bounded support, including parallel evidence checks
when several reports arrive. Delegate when the saved context or time justifies
dispatch and verification overhead; handle quick checks directly and reuse
helpers for related work. Helpers share your role boundaries. You retain
synthesis, rulings and authorization; implementation lanes still go through the
operator.

For these helpers, use `model: inherit` or the host equivalent. You may choose a
smaller model within your own provider/harness for **trivial work**: explicit
inputs, mechanical steps and an objective result you can cheaply verify, such
as extracting revisions and check counts. Assessing evidence, resolving policy
conflicts and accepting a lane are not trivial, even when the report is short.
Work owned by another skill follows that skill's routing.

## When this is the right seat

All three must hold:

- The epic spans more tickets than one session can carry.
- Implementation runs in **other** sessions, dispatched by hand.
- Someone has to verify what comes back and own the close decision.

| Instead of this skill | Use |
| --- | --- |
| One long-running goal for one fresh session | `handoff-goal` |
| A single ticket, premise, or hunch | `claim-check` |
| A broad surface to cover at team scale | `qa-sweep` |
| One finished change to prove at the running app | `empirical-proof` |

**You have left this seat the moment you open an editor on the implementation.** A fix
small enough that writing it yourself is tempting is still a ticket for a lane. Wanting to
implement is the signal to say so and let the operator re-cast the role, not to quietly
take both.

## The loop

```
audit → tickets → refresh integration branch + revalidate → lane prompt → [operator dispatches] → report
   → YOU validate independently → authorize | correct
   → PR → [operator merges] → close tickets with fixing-PR notes
   → repeat until the tree is clear → blind re-audit
   → HOLDS closes the epic; DEFECTS FOUND starts the next wave
```

## Revalidate before delegation

Before handing off any implementation lane or workset, including reopened work
and scope-changing amendments, refresh the integration branch locally and check
each ticket yourself. The lane's setup fetch does not replace this check.

1. **Refresh the base.** Use `origin/dev` unless the repo or operator explicitly
   names another integration target. In a clean checkout of that branch, pull
   fast-forward-only (`git pull --ff-only origin dev` for `origin/dev`) and verify
   that HEAD equals the refreshed remote-tracking SHA. Otherwise fetch the target
   and inspect its exact SHA in an isolated local checkout, following the repo's
   and `using-workbench`'s worktree-location rules. A local branch ahead of the
   remote is not that snapshot. Use explicit worktree paths; preserve active
   lanes and user changes. Never pull into a feature branch, reset, or stash work
   to pass this gate. A missing target or failed refresh holds the dispatch;
   cached refs are not evidence of the latest code.
2. **Revalidate each ticket at that SHA.** Compare its defect or objective,
   current source anchor, and behavioral completion bar with the implementation
   and tests. Use focused repro evidence when needed to settle validity. Remove
   already-fixed or obsolete work from the dispatch, narrow partially resolved
   work, and hold unresolved claims. Record evidence and disposition; tracker
   status alone proves neither validity nor completion. Update tickets only
   under existing ownership and write authority.
3. **Bind the handoff.** Record the integration ref, refreshed SHA, and each
   ticket's remaining scope and evidence in the ledger and dispatch. One
   simultaneous batch of independent lanes may share a refresh. Refresh and
   revalidate again for a later batch, a postponed handoff, or an intervening
   merge before handing over the prompt.

## Validation is the job, and it is where the failures live

A report is a claim. Verify it against the repo.

The lane's `code-quality-review` does not discharge this and never could: it asks whether
the code is well built, and you are asking whether the claim is true. Only you hold the
ticket's bar, the epic's rules, and the audit's repro material. Every check below exists
because skipping it let a real defect through.

**Run every command in an explicit worktree directory** using the tool's working
directory argument or an explicit shell `cd`. Check the resolved path before
mutation; do not rely on the previous call's directory.

**Red-flip properly, in isolation.** Create a disposable validation checkout of
the reported commit. Preserve the lane's active/dirty worktree and all relevant
tests and fixtures. Identify changed production files from the repository's
actual conventions; do not classify tests using a single filename suffix.

1. Pin the reported base/head and inspect their production/test diff.
2. In the disposable checkout only, revert modified production files to base and
   remove newly added production files. Preserve tests, fixtures, and setup.
3. Run the focused regression cases. Require the intended behavioral assertion
   to fail; missing imports/tests/dependencies are not a valid RED.
4. Restore the fix in that isolated checkout and require those cases to pass.
5. Restore or discard only the isolated fixture after checking its resolved path.
   Never use a broad restore on the implementer's working tree.

Use focused local tests for validation and correction rounds. Full CI suites run
in PR CI by default. Broader local verification needs an explicit repo/user gate
or a specific unresolved integration risk; name it and choose the smallest check.

**Grep the diff for banned content** (comments, TODO/FIXME/HACK, skipped tests) if the
epic carries such rules. Enforce them on every lane or they erode: one doc-comment sent a
lane back, and that consistency is why later lanes stopped adding them.

**Design-read anything infrastructure-shaped**: locks, process spawning, filesystem
lifecycles, gates. Tests written by the author cannot tell you the design is wrong. A
PID-based lock passed its own tests while being defeated by PID reuse; the fix was to
delete it, because the process topology it defended against could not occur.

**When validating a gate, test what it ACCEPTS.** The most expensive miss in this pattern:
a boot check was reviewed for process safety (ephemeral port, group teardown) and shipped
while its acceptance criterion was `fetch()` resolving, at any status. A server answering
404 to every route passed every repair, validation, and finalization path for days. Ask
what the gate lets through, not whether it runs cleanly.

For artifact-acceptance or authority-derivation changes, including your own rulings,
exercise representative output from the actual producer through the changed path.
Include saved versions covered by compatibility requirements, using disposable
copies. Confirm required inputs are produced; distinguish expected refusals from
crashes and verify the proposed recovery is available in the product. If actual
producer output is unavailable, report the specific proof gap; a handwritten
fixture does not establish that the product can supply the input.

**Chase anchor mismatches.** If a ticket's cited file is not in the diff yet the lane
claims the fix, find out why. Once, the auditor's anchor was imprecise and the lane fixed
the right place, and the cited line turned out to be a *second*, still-live instance of
the same defect that four audits had missed.

**Verify what would change a decision.** You cannot reproduce every finding; say so
plainly rather than implying you did. Reproduce anything that would alter scope, reverse a
prior fix, or claim a regression. The compensating control is that each lane must write a
failing test first, so a phantom finding surfaces as "cannot write a red test", but that
is downstream and costs a lane its time.

### Rationalizations

Every one of these has been used to skip a check above.

| Excuse | Reality |
| --- | --- |
| "`code-quality-review` already ran on this diff." | It did, and it asked a different question. That review asks whether the code is well built; validation asks whether the lane's claim is true. A reviewer handed a diff does not know the ticket's bar, cannot tell a real red-flip from a no-op, and has no reason to ask what a gate accepts. Both run; neither substitutes. |
| "The report is complete and in the exact format." | The format is a claim about the work, not evidence of it. A well-formed report is the ordinary shape of a wrong one. |
| "CHECKS says the suite is green." | Green proves the tests ran, not that they would fail without the fix. That is the entire point of the red-flip. |
| "This lane's last three reports were clean." | Track record is not evidence about this diff. The lane you stopped checking is the one that lands the defect. |
| "The focused red-flip costs time and the epic is behind." | The cheapest defect is the one that never merged. A wave that ships a phantom fix costs an extra audit round and every lane in it. |
| "I read the diff and it looks right." | Reading confirms the code says what the lane says it says. It cannot tell you the test would fail without it. |
| "The anchor moved, but the fix is obviously in the right place." | Chase it anyway. That is how a second live instance of the same defect surfaced after four audits had missed it. |
| "It is infrastructure, and its tests pass." | Tests written by the author cannot tell you the design is wrong. Design-read it. |

### Red flags: stop and open the worktree

- You are about to write "authorized" without verifying the reported revision in its isolated validation checkout.
- You are repeating the lane's own numbers as if they were your findings.
- You caught yourself thinking "the review already covered that."
- You are about to describe coverage you did not reproduce.
- A check felt like ceremony because the last several lanes passed it.

**Every one of these means: run the checks before you authorize.**

## Writing a lane prompt

Group lanes **by file ownership, not by topic**. Every semantic merge conflict in practice
came from two lanes touching one contract from different directions. Put all changes to a
hot file in one lane even if the tickets look unrelated.

For shared-contract version or required-field changes, name affected producers,
shared fixture builders and consumer checks in the dispatch. Split work when the
pieces can be implemented and validated independently; a contract change alone
does not require its own lane.

Keep lane instructions provider agnostic. For each required skill, name the
skill, task-specific inputs, required outcome and handback evidence; the lane
reads and applies it. Do not restate, extend or generalize the skill's procedure
or model routing in the dispatch.

Name `workbench:epic-implementation` in every implementation dispatch file,
including amendments and delivery authorizations. It keeps each final lane
handback in the shared report format across rounds.

The prompt is one self-contained document, written to a file under the epic's scope
folder (see Dispatching), containing:

- **Setup**: validated integration ref and SHA from the pre-dispatch check,
  fetch, worktree path, branch name carrying the ticket ids, install. If the
  integration head changed before lane setup, return the change to the owner for
  revalidation before implementing; do not silently use a different base.
- **Tickets and required reading**: give each ticket's defect, source anchor
  (`file:line`) and behavioral completion bar. Use this dispatch as the lane's
  brief. Name the smallest complete required reading set, including exact sections
  of any necessary design contract. Identify the governing decisions and contract
  revision; resolve conflicts before dispatch. The brief and named contract
  sections suffice without tracker access. Full ticket bodies and historical
  reports are loaded read-only to resolve a specific question.
- **Evidence**: read-only paths to the audit's repro material, and the repo's existing
  integration-test pattern to reuse rather than reinvent. List supporting material
  separately from startup reading, with when it must be consulted. Evidence needed
  for a required validation check must be inspected.
- **Method**: TDD red-first; assertions on the **emitted artifact and runtime behavior**,
  not internals; controls that pin required prior behavior. Name required local
  gates and applicable locally runnable static/build checks separately from focused
  tests. Name filters serve iteration; completion checks run affected test files
  in full and the identified shared-consumer checks. State unavailable coverage.
  Full suites normally run in
  PR CI; broader local runs require an explicit requirement or named unresolved
  integration risk.
- **Rules**: the epic's standing rules verbatim (comments, debt, naming, read-only
  trackers), including that debt and follow-ups noticed in passing get reported rather
  than fixed or dropped, plus the actual repository toolchain, formatting gates,
  commit conventions, and existing publishing authority.
- **Advisory coordination, never hard exclusions**: name what other lanes own and say
  "coordinate an ownership overlap before concurrent edits, then record the
  agreed change under FORKS/DEVIATIONS." Hard
  DO-NOT-TOUCH walls caused a lane to halt three tickets over one advisory conflict.
- **Completion review**: when the full agreed work set is verified and ready to
  ship through the repository's delivery process, use `code-quality-review` over
  the implementation range, plus
  `test-quality-review` (`mode: diff`, given the range's base, routed as
  `code-quality-review` describes) when the range changes production logic or tests.
  Validation handbacks, intermediate reports and requests for a ruling do not
  trigger review. Review completed correction batches only before resuming delivery.
  Record the reviewed revision, reviewer-confirmed blocking dispositions and
  correction evidence. Apply code-quality-review's bounded correction review;
  preserve its follow-up count through lane handoffs and delivery.
- **The exact report format**: read the shared
  [lane report template](references/lane-report.md) and include its block in the
  dispatch. Ranges, not file lists: you read the diff yourself.

## Dispatching

Complete **Revalidate before delegation** before issuing an implementation
dispatch file and its pointer block. A ready ticket list or a previous wave's
refresh does not satisfy the gate.

Everything you hand over is dispatchable the moment you write it. The operator is a wire,
not a queue: they are pasting into worker sessions, and a prompt they have to hold until
some later trigger is one that gets pasted at the wrong moment or not at all.

Write each lane prompt, audit brief or authorization to its own file under the epic's
scope folder, next to the ledger (for example `dispatches/<lane>-<date>.md`), and
index it there. What the operator pastes is a pointer, never the document: a session
reads a file exactly; a long inline block gets copied imprecisely. Every handoff takes
this form, one block per destination:

```
Paste this into <LANE>:

<one or two lines: role, what is authorized, and whether this is a fresh or an
existing session>. Read and execute this dispatch:

<absolute path to the dispatch file>

<lines governing instructions require verbatim in every dispatch, if any>

Paste this into <ANOTHER LANE>:

...
```

The block carries nothing else: no summary of the file, no rules restated from it.
Decisions and questions for the operator go outside the blocks, after them.

Dispatch together lanes with no file-ownership overlap and no unmet producer/consumer
dependency on another lane in flight. Disjoint files alone do not establish
independence. Record each dependency's readiness condition in the ledger.
Authorization blocks carry the same envelope and name their destination the same way.

A prompt whose trigger has not fired is not written yet. Hold it, watch for the trigger
yourself, and issue it in its own dispatch block when it fires.

## Authorizing

Authorization is its own file and paste-ready pointer block under existing operator
authority:
merge the actual integration branch (never rebase; stop and report on a semantic
conflict), run affected checks and mandatory local gates, then use `file-pr` and report
back. That skill writes the body from the repo's own template and tends the PR to green
and mergeable.

**State whether the completion review has run; if pending, require it before delivery.** Say the gate is satisfied only with the evidence below. The gate requires
an adversarial review that ran on this diff, and the lane's completion review
(`code-quality-review`, plus `test-quality-review` when required) is exactly that:
dispatched, returned, findings acted on. Record the reviewed revision
and reviewer confirmation of every blocking disposition, plus the follow-up count. Left unsaid, the lane loads `file-pr`, reads the MUST, and burns a second
full review pass on a diff that already had one. Two cases where the gate is **not**
satisfied, and you say so instead: blocking dispositions lack reviewer confirmation or later behavior changes lack review,
or the integration merge hit a semantic conflict. The second is why a semantic conflict stops the lane rather than
being resolved into new code.

What stays yours: the exact title, and a terminal CI verdict before you call the wave
done. Never end a turn on a watcher's promise.

PR text describes the **change and its stakes**, never the process. No lane names, no
"epic", no "follow-up", no review mechanics unless they matter to the change;
follow the repo's title convention and place ticket links in its template fields.

## Rulings you own

Lanes stop and ask; you decide, with evidence:

- **Lane corrections and review extensions**: return confirmed in-scope defects
  to the owning lane through a correction dispatch. When its two automatic review
  follow-ups are consumed, you own the bounded next-step decision under
  `code-quality-review`: record the correction scope, additional submission count
  and reason in the ledger and dispatch, then provide the operator's paste-ready
  pointer. Preserve the cumulative count and delivery hold until independent
  review closes the blockers. Escalate to the operator when the needed decision
  exceeds your existing scope or authority; routine correction handoffs stay yours.
- **Semantic merge conflicts**: which policy wins, and how to compose rather than choose.
- **Scope boundaries**: before ticketing an audit finding, confirm the flow under audit
  actually reaches that code. Presence in a preserved artifact is the wrong test;
  reachable from the tool chain is the right one.
- **Over-strictness from your own fixes**: every wave produced at least one. A fix that
  refuses legitimate work is a defect of the same severity as the one it replaced.
- **Product forks**: when a lane surfaces a real choice (fail closed vs. widen a type vs.
  document a limit), recommend one and let the operator rule. Record the operative
  decision and its source in the local epic ledger. Update the shared task when
  its scope or acceptance changes, under existing write authority.

## Keep a local epic ledger

A session ends and its context dies with it. Use one local ledger for this epic's
recovery state in its existing scope folder. Reuse its current README or CURRENT
entry point; otherwise create `LEDGER.md`. Other startup indexes point there.
The ledger is disposable working material under `using-workbench`'s **Artifacts
are disposable** guidance, not a second tracker or a committed documentation layer.

**Contents:** goal and full closure bar; active or pending lanes with owner,
contract/revision and worktree references, dependencies, holds and next action;
operative decisions with sources; unresolved questions with their consequence and
next verification or disposition; pointers to briefs, evidence, recovery material
and the authoritative backlog. Distinguish reported claims from verified outcomes;
bind verification to its revision and source. Refresh volatile facts before a
decision relies on them. An entry belongs here when it changes the next action,
preserves a consequential constraint, or locates information needed to verify it.

**Update loop:** start from the ledger, then load the brief and sources needed for
the next action. After a meaningful handback, ruling, validation or delivery
transition, replace the affected entry in place. Before compaction or coordinator
handoff, check that a successor can recover the next action, its authority,
constraints and evidence without the conversation. Resolved entries become a brief
outcome/reference or leave the view once their remaining obligations have a home.

**Keep useful detail locally:** create and retain dispatches, reports, investigation
notes and repro material when they support actual work. The ledger indexes them;
required validation still reads and exercises the relevant evidence. Avoid copying
those records into the ledger, prepending session histories, repeating standing
instructions or retaining completed lanes merely to recount progress. Size follows
current coordination needs; a word target never removes obligations or evidence.

**Shared tracker updates:** publish the task, decision or outcome that other readers
need: defect/objective, behavioral bar, owner, dependencies, delivery state and
relevant evidence summary. Detailed working records stay local by default; a need
for compaction recovery alone does not request publication. References in shared
updates must be usable by their intended readers; keep local retrieval paths in
the ledger rather than exporting its evidence inventory.

Confirmed work requiring separate assignment gets a deduplicated ticket under
existing write authority. Corrections within an active lane stay in that lane's
contract, amended explicitly when necessary. Without needed publication authority,
retain the work locally with its owner and named pending action. Uncorroborated,
disproved or scoped-out claims retain evidence and their disposition, not automatic
implementation tickets. Link each originating finding to its current destination
or disposition before wave closeout, including debt created by the wave.

Apply the document lifecycle at lane state changes, coordinator handoffs, and wave
or epic closeout:

- **Active:** preserve the dispatched contract and its revision. Contract changes
  require an explicit amendment communicated to affected lanes.
- **Accepted / pending delivery:** retain the accepted revision, validation and
  review evidence, remaining gates, holds, owner and next action.
- **Closed:** required delivery is verified or the operator explicitly accepts
  another disposition; unresolved work has a durable owner and destination.
- **Retired:** temporary instructions leave default reading after their consumers
  no longer need them. Retained evidence remains addressable.

Before retirement, preserve unresolved work, lasting decisions, final evidence
and its limits, frozen audit inputs, and recovery material in their established
homes. In-flight contracts, dependent consumers, held delivery and explicit
retention requirements prevent retirement of material they still need. Preserve
stable references; archive superseded material outside default reading. Delete
redundant or reproducible scratch only under existing cleanup authority after
checking references and recovery needs. Document retirement changes no ticket
status, worktree, publication hold, validation requirement or audit scope.
After the operator accepts epic closure and remaining obligations have durable
homes, retire the ledger from startup and archive or delete it under the applicable
retention and cleanup authority.

## Non-negotiables

- **Never modify a ticket the operator does not own.** Create your own under the epic and
  reference theirs as context and check for duplicates first; absorbing their scope is not.
- **Nothing actionable lives only in context.** The local ledger preserves unresolved
  work, owners, next actions and evidence references. Shared tasks use deduplicated
  tickets under existing write authority; uncertain claims retain their disposition.
- **Close each ticket with its fixing PR and what the behavior is now**, including
  corrections to the ticket's own anchor when the fix landed elsewhere.
- **State what you did not verify.** Coverage claims that outrun the evidence are the one
  failure this whole pattern exists to prevent.

## Close every handoff with a next step

Acknowledge only what was actually verified. Say, for example, “This set of work
is verified complete,” followed by the accepted revision, checks, and remaining
delivery gates. “Ready for PR” is distinct from merged or epic-complete.

Then evaluate the epic's current state and choose exactly one immediate next step:

1. **More ready work:** refresh the integration branch and revalidate the next
   workset, then name the ready lanes and provide their dispatch blocks now.
2. **Delivery still pending:** name the owner and next action for review, CI, PR,
   or merge. Keep that gate visible instead of acknowledging the wave as finished.
3. **Implementation complete, closing audit owed:** state the audit stopping point
   and write the blind audit's scope, regression families and evidence contract to
   its dispatch file, with its pointer block. Do not manufacture more implementation to avoid this gate.
4. **Audit holds and closure criteria are met:** summarize the corroborated result,
   remaining accepted limits, and propose the epic as done for the operator's
   close decision. Do not close it silently.
5. **Blocked:** name the missing decision/capability, owner, and concrete unblock;
   advance independent ready work if available.

A bare acknowledgment, “waiting for instructions,” or a list of finished tickets
without this next-step decision is an incomplete orchestration response. Do not
ask the user to choose a routine next lane when the agreed plan already determines it.

## Closing the epic

The epic closes on a **blind re-audit**, not on an empty ticket list. The auditor starts
from the artifact, never the PR list, and its mandate has two parts: probe the surfaces
generally, and **attack the fixes the previous audit provoked**, because they are the
least weathered code and each round has found at least one defect introduced by the last
round's fixes. Require a regression-check section (per fix family: held or broken, with
evidence) and per-finding repro plus current-code anchor; findings that cannot be
reproduced remain uncorroborated or blocked; contrary evidence is required to call
them disproved. Preserve their evidence and limits in the report.

Expect several rounds. Convergence looks like this: earlier fixes hold under attack while
each audit has to cut deeper to find anything, and the newest finds cluster around policy
that was never implemented rather than artifacts that contradict each other. When a round
returns HOLDS, corroborate its verdict-movers yourself. Preserve the detailed report
locally; under existing write authority, update the epic's shared record with the
concise verdict, coverage, accepted limits and evidence references usable by its
readers. Publishing supporting material follows existing publication authority and
the needs of that closure decision. Hand the close decision to the operator, then
apply the ledger's retirement conditions.

One caution learned the hard way: a corpus of *preserved successful runs* contains no
failure signal. Silence there is selection bias, not evidence of health.
