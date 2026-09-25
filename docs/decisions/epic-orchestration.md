# epic-orchestration: decisions in force

This note is the rationale for the `epic-orchestration` skill, shipped in the `workbench` plugin; superseded choices are omitted and git history keeps the originals.

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

## The epic closes on a blind re-audit (2026-09-04)

An empty ticket list never closes the epic. A blind auditor starts from the artifact, not the PR list, and probes declared criteria and regression families. Closure requires acceptance evidence, dispositioned findings, verified delivery and owner corroboration of the audit before the operator decides. Further rounds address findings or evidence gaps; their count does not establish completion.

## Bounded dispatch reading and document retirement (2026-09-10)

Startup instructions led through stale history. Each dispatch names a complete required reading set that works without tracker access; ticket bodies and supporting material load for a specific question or check. Retirement removes instructions from default reading, grants no deletion, publication or cleanup authority, and preserves holds, unresolved work, final evidence and frozen audit inputs. Completeness, not a word cap, sets size.

## A local ledger is the recovery record (2026-09-10)

A coordinator pushed detailed evidence into tracker descriptions because the skill kept asking for findings on tickets. One local ledger, reusing the scope folder's entry point, holds current actions, decisions, uncertainties, constraints and pointers, updated in place. Shared updates carry what their readers need; continuity alone does not request publication. Confirmed work needing separate assignment gets a deduplicated ticket, while uncorroborated or scoped-out claims keep their evidence and disposition.

## Dispatches are files and paste blocks are pointers (2026-09-11)

Several-hundred-line inline briefs were hard to copy precisely from a terminal, while a session reads a file exactly. Each lane prompt, audit brief and authorization is its own file in the epic's scope folder, indexed in the ledger. The paste block carries only role, authority, whether the session is fresh, the absolute path and any required verbatim lines.

The initial lane contract is complete. Amendments reference its revision and carry only changed scope, inputs, evidence, gates or authority. A recovered session reads the active contract and amendments. The report template can be referenced directly instead of copied into every dispatch; every final handback still contains the complete populated block.

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
