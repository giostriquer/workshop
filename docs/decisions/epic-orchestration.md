# epic-orchestration: decisions in force

This note is the rationale for the `epic-orchestration` skill, shipped in the `workbench` plugin; superseded choices are omitted and git history keeps the originals.

## The epic owner is a role, shipped as a skill (2026-09-04)

Nothing covered an epic too large for one session whose lanes the operator dispatches by hand. The owning session becomes a persona that owns tickets, lane prompts, independent validation, rulings and authorization, and never implements, commits, pushes, opens PRs or merges; opening an editor on the implementation means leaving the seat. It was renamed from `epic-relay`: relaying prompts is one line of the job.

## It ships in workbench and stays user-invoked (2026-09-04)

Its load-bearing references, `code-quality-review` and `file-pr`, are workbench skills, and toolkit installs without workbench, so dependency direction, not rarity, decides the plugin. It stays user-invoked: running an epic this way is the operator's call. Its description states only triggers and boundary, so sessions read the body rather than a summary.

## Validation is the job (2026-09-04)

A lane report is a claim the owner verifies against the repository; each check exists because skipping it let a real defect through. The lane's completion review, which the lane runs through an independent reviewer, does not discharge this: it asks whether the code is well built, validation whether the claim is true. Skipping checks is a discipline failure, so the section carries a rationalization table and red flags, not bare imperatives.

## Handoffs are dispatchable when written (2026-09-04)

The operator is a wire, not a queue: a prompt held for a later trigger gets pasted at the wrong moment or not at all. Every handoff is ready when written, several lanes per message is the desirable case, and a prompt whose trigger has not fired is not written yet. Lanes group by observable file ownership, not by topic.

## Actionable work leaves the context (2026-09-04)

Follow-up work dies in passing observations and session reasoning, not only in deferrals. The lane report carries a required `DEBT + FOLLOW-UPS` slot, filled or visibly empty, because a required slot binds where a reminder does not. Before a wave closes, each originating item links to its destination or disposition, including debt the wave's own fixes created.

## Authorization claims the PR review gate (2026-09-04)

Authorization claims `file-pr`'s review gate as satisfied by the lane's completion review, with its evidence, so no second full review runs. The gate returns when blocking dispositions lack reviewer confirmation, later behavior changes lack review, or the integration merge hits a semantic conflict. No dispatcher automates handoff: the operator remains the only link between independent lane sessions.

## The epic closes on a blind re-audit (2026-09-04)

An empty ticket list never closes the epic. A blind auditor starts from the artifact, not the PR list, and attacks the previous round's fixes, since each round has found a defect the last introduced.

## Bounded dispatch reading and document retirement (2026-09-10)

Startup instructions led through stale history. Each dispatch names a complete required reading set that works without tracker access; ticket bodies and supporting material load for a specific question or check. Retirement removes instructions from default reading, grants no deletion, publication or cleanup authority, and preserves holds, unresolved work, final evidence and frozen audit inputs. Completeness, not a word cap, sets size.

## A local ledger is the recovery record (2026-09-10)

A coordinator pushed detailed evidence into tracker descriptions because the skill kept asking for findings on tickets. One local ledger, reusing the scope folder's entry point, holds current actions, decisions, uncertainties, constraints and pointers, updated in place. Shared updates carry what their readers need; continuity alone does not request publication. Confirmed work needing separate assignment gets a deduplicated ticket, while uncorroborated or scoped-out claims keep their evidence and disposition.

## Dispatches are files and paste blocks are pointers (2026-09-11)

Several-hundred-line inline briefs were hard to copy precisely from a terminal, while a session reads a file exactly. Each lane prompt, audit brief and authorization is its own file in the epic's scope folder, indexed in the ledger. The paste block carries only role, authority, whether the session is fresh, the absolute path and any required verbatim lines.

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
