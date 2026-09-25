# Bounded correction review

Date: 2026-09-18
Status: accepted for workbench 0.40.1

## Problem

The initial-review limit allowed authors to close blocking findings after direct
corrections and passing tests, without independent verification of the correction.
A baseline scenario reproduced that interpretation in both code-quality-review
and file-pr. Repeating broad reviews indefinitely would instead encourage scope
expansion and low-value changes.

## Decision

Use one initial review followed by focused correction verification. Return every
blocking finding's fix or evidence-based rejection to its reviewer. Preserve the
reviewer session when available. Review unresolved findings, correction deltas,
and affected behavior; new blockers need a demonstrated consequence. Advisory
preferences and unrelated cleanup do not extend the loop.

Follow-up passes run automatically while each discipline's review converges.
Each keeps its own pass record. When review stops converging, unresolved blockers stop delivery
and require a concrete next-step decision from the authority that owns the work.
The stop never lowers the approval bar. Broader invalidation requires a full
review of the affected scope, not a reset. (This note first set a limit of two
automatic follow-up passes; the dated section below replaced it.)

Bind closure to the reviewed revision, finding dispositions, and evidence. A
completed review reopens for new scope or a material redesign that invalidates
its conclusions, not merely because another edit or commit exists. Existing
explicit user waivers and superseding repository processes retain precedence.

This refines the initial-review-only language in earlier workbench decisions.
Ships in workbench 0.40.1 with synchronized host manifests and release notes.
Installed plugin copies update through their host's normal update mechanism.

## Completion boundary clarified, 2026-09-19

Completion means the full agreed work set is implemented, verified, and about to
ship through a PR or the repository's established delivery process. Intermediate
edits, subtasks, local checkpoints and validation handbacks do not trigger reviews.
Correction rounds likewise wait for a complete, verified batch before delivery
resumes. This defines the existing gate instead of adding more review rules.

## Convergence replaces the follow-up pass count (2026-09-24)

The two-pass limit stopped sessions on routine focused checks. A Codex session
on workbench 0.41.6 had spent both automatic follow-ups when its last correction
added one negative assertion the test reviewer still had to confirm. It held
delivery and asked the user "May I run one extra review limited to the new RLE
negative assertion, then publish?", quoting "Use at most two automatic
follow-up passes per work-stream". A count measures how many passes ran, not
whether review is getting anywhere: a third pass over a four-line test change
is review working. The loop worth stopping is the runaway one, where a reviewer
re-raises a settled finding or keeps adding blockers the correction never
touched, or where each fix produces the next blocker, and a count only catches
that after it has spent its passes.

Follow-up passes now run automatically, with no count, whenever a verified
correction batch is ready for review, and the session never asks permission for
one. Each follow-up pass is judged on what changed since the previous pass. The
session stops, holds delivery and reports to the owning authority (the user for
standalone work, the epic owner for a lane) only when:

- a follow-up pass sent at least one open blocker closed or narrowed none of
  them. A reviewer narrowing a finding is progress; a finding still Partially
  resolved on the same gap is not. Passes sent no open blocker (an
  affected-delta review of a later change, or the pass after an approved
  comment-trim encoding) are never judged by this condition;
- a finding the author rejected with evidence is raised again without new
  evidence; or
- each of two consecutive follow-up passes raised a new blocker and ended with
  at least as many open blockers as it was sent. A pass that only narrows
  findings is judged by the first condition alone and neither counts toward
  nor breaks the two-pass run, so alternating "close one, raise one" with
  "narrow the new one" still stops.

The third condition is the churn case. The first draft measured progress, not
convergence: a pass that resolved its one blocker and raised one new blocker in
the correction's own lines counted as progress, so fixes that kept producing
their own blockers could loop without end. Counting open blockers against what
each pass was sent catches that after two passes in a row, and it never fires
once every blocker is confirmed. A single "fix regressed, reviewer caught it,
fixed" cycle still runs without asking, because one such pass is not two in a
row. The RLE case above is exactly one such pass (pass 2 resolved TQ-3 and
raised TQ-4), so its third pass still runs. A first version counted open
blockers alone; review caught that two passes in a row that each narrowed
their only finding (a test still missing its negative case, then its message
pin) would count as churn and stop a routine third check, the RLE shape again.
The condition now requires a new blocker in each of the two passes.

After a hold, the authority's decision restarts automatic passes unless it ends
review, and the churn count starts over, so an approved next pass is not
stopped by the pass that caused the hold; a correction made while review is
held waits for that decision before it is submitted.

Findings outside a follow-up pass's focus are labeled, not stopped on. The
focus is defined once in rule 2: the open blockers, the correction delta (the
change since the last reviewed revision), and the callers, contracts and
behavior it affects, plus the full affected scope when a correction broadly
invalidates the review. On a follow-up pass the reviewer labels a finding
outside it out-of-scope (follow-up) unless it proves the change unsafe or
incorrect as shipped; such a finding never makes the verdict ISSUES_FOUND,
never justifies another pass and never holds delivery, and
`test-quality-review` routes such a gap to Strategy notes, never to an Issue. A
first draft made these findings a stop condition; probes showed it holding
delivery when every real blocker was already confirmed, the kind of stop this
change exists to remove. A second draft recorded them as follow-ups in the stop
rule, with no actor and a boundary (the correction delta) narrower than the
focus rule's; a review found both, so the reviewer now labels them in the focus
rule itself.

Everything else stands: the focus rule, advisory-only findings never
triggering a pass, a broadly invalidated review re-reviewing the affected
scope, reviewer confirmation closing a blocker, explicit user waivers and
superseding repository processes taking precedence, a held review never being
PASS, and a new reviewer or handoff not resetting the record. The rule now says
outright that a blocker closes only on reviewer confirmation or the user's
explicit waiver, since a probe of the new wording found `file-pr` and the
hold's "that authority decides" read as two different closure paths. Passes are
still numbered, as a record (`mine-transcripts` reads "follow-up pass N"), never
as a limit. `code-quality-review` states the rule once; `test-quality-review`,
`receiving-code-review`, `file-pr`, `using-workbench`, `epic-orchestration`,
`trim-comments` and the lane report point to it, and the reviewers' output
field is the pass number.

Fresh Opus contexts read the three skills a delivering session holds
(`using-workbench`, `code-quality-review`, `file-pr`). The first draft's probes,
three reps per wording:

| Scenario | Two-pass wording | First convergence draft |
| --- | --- | --- |
| Both follow-ups spent; a 4-line negative assertion awaits the test reviewer | 0 of 3 ran the pass; 3 of 3 held and asked the user for an extension | 3 of 3 ran pass 3 without asking and filed on PASS |
| A rejected finding re-raised without new evidence, plus two blockers outside the correction delta, after pass 1 | 0 of 3 stopped; 3 of 3 sent pass 2 to re-argue | 3 of 3 stopped, held and reported, with the outside blockers recorded as follow-ups |
| Pass 1 resolved neither blocker | 0 of 3 stopped; 3 of 3 built a new correction and sent pass 2 | 3 of 3 stopped and reported with a recommendation |

On that draft, an epic lane given the first scenario with `epic-implementation`
and the lane report ran pass 3 with no handback to the owner (2 of 2). On the
rule as it now reads (labeling in rule 2, the three stop conditions above), the
same three scenarios and the churn cases, where the middle column is the first
draft:

| Scenario | Progress-only wording | Current wording |
| --- | --- | --- |
| RLE: pass 2 closed TQ-3 and raised TQ-4; TQ-4's fix awaits review | as above | 3 of 3 ran pass 3 without asking, reading pass 2 as the only churn pass so far |
| Rejected finding re-raised, plus two out-of-focus blockers | as above | 3 of 3 stopped on the re-raise and treated the out-of-focus pair as follow-ups that hold nothing |
| Pass 1 closed or narrowed neither blocker | as above | 3 of 3 stopped and reported; the new approach waits for the decision |
| Churn: passes 1 and 2 each closed one blocker and raised one in the fix's own lines | 0 of 2 stopped; 2 of 2 ran pass 3 | 3 of 3 stopped and reported |
| One regression: pass 1 closed CQ-1 and raised CQ-2 in its fix | not run | 3 of 3 ran pass 2 without asking |
| After a churn hold and the user's go-ahead, pass 3 closed one and raised one | not run | 2 of 2 ran pass 4 without asking, counting pass 3 as the first churn pass since the reset |

Two of the three churn reps asked whether the user's decision restarts the churn
count, and one read it as not restarting, which would stop the approved next
pass again at once; the rule now says the count starts over, and the last row
ran on that wording. Probes also surfaced two questions left open: whether a
test-only correction goes back to the code reviewer (all read "the changed
surfaces it owns" as no), and what the author does when a reviewer labels an
out-of-focus finding blocking anyway (the author cannot dismiss it, so it goes
into the hold report). Reps per cell are regression evidence on Opus only, not
a reliability estimate, and no probe ran on Codex, where the reported session
was.

## CI repairs do not reopen completed review (2026-09-25)

The 0.40.1 rule made later behavior, design, or risk changes a review trigger;
0.43.0 made follow-up passes automatic while converging. Together they let a
bounded CI repair restart code and test review after both stages had passed.
The completion clarification in 0.40.2 did not distinguish this landing work
from a correction to an open reviewer finding.

`fix-ci` owns the bounded repair loop and its stopping conditions. Once the
change has completed review, focused verification leads to authorized push and
watching the new head, without another review or mutation round. A repair that
requires new scope or a different design leaves that loop for a scope decision.

The review skill owns closure of its findings and when its completed review
becomes invalid. It does not describe CI steps. `file-pr` consumes the review
result and delegates CI tending without repeating either skill's procedure.
The first patch repeated the CI exception across six skills and made CI refer
back to review for exceptions; this revision removes those additions. No new
coordinator skill or shared process layer is needed.

A baseline planning probe reproduced both reviews and delta mutation testing
after a verified fallback fix. Probes of the replacement through the CI skill
alone and with the delivery skills loaded kept bounded fixes in the CI loop.
Controls preserved open findings, explicit user gates, scope decisions, review
of an authorized redesign, and the initial gate on an unreviewed branch. These
nine simulated cases are bounded regression evidence, not live delivery or
cross-model reliability evidence.

## Discipline ownership (2026-09-25)

The code-quality and test-quality skills each own their correction rules and
records. The earlier single-owner arrangement in this note is superseded by
[independent disciplines](completion-review-stages.md#independent-disciplines-2026-09-25).
Delivery callers combine verdicts, not review procedures. Stop conditions,
reviewer-confirmed closure, and the rule against reopening review for a changed
SHA remain unchanged within each discipline.
