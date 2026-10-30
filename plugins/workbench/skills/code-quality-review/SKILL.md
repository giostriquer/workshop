---
name: code-quality-review
description: Use for a strict or adversarial code quality review; required when the full agreed work set is ready to ship through a PR or the repository's delivery process.
---

# Code Quality Review

Use this skill for a strict review focused on implementation quality, maintainability, abstraction quality, pattern drift, and codebase health.

Judge implementation structure and maintainability. Coverage and assertion-strength
verdicts are outside this review's scope.

Above all, this skill should push the reviewer to be **ambitious** about code structure. Do not merely identify local cleanup opportunities. Actively search for "code judo" moves: restructurings that preserve behavior while making the implementation dramatically simpler, smaller, more direct, and more elegant.

Completion for this gate means the full agreed work set is implemented and
verified, and the session is about to ship it through a PR or the repository's
established delivery process. Individual edits, finished subtasks, progress
reports, and local checkpoints do not trigger review. Fixes to reviewer findings
follow the same boundary: finish and verify the batch before resuming delivery.

## Who runs it: a reviewer that did not write the code

This review is **dispatched, never self-served.** Run it in a fresh reviewer
context handed the accepted scope, the diff (the working tree against the base's
merge base, untracked files included), and the changed files' contents:
the `code-quality-reviewer` agent, or the host's equivalent subagent mechanism.
The accepted scope is the ticket, plan or agreed change as it was asked for,
never the author's account of the code; it sets where in-scope ends, not what
the reviewer may read. Dispatch `code-quality-reviewer` by name with no model,
so it runs on the parent's (on Codex, paste the agent file and use its Dispatch
line, per `using-workbench`'s *Workbench agents on Codex*), with the three
inputs as `### Accepted scope`, `### Git / diff output` and `### Changed file
contents`.

The session that implemented the change is the one context that cannot perform
this review. It holds every justification that produced the code, so the
structure reads as inevitable rather than as a choice someone made, and the
code-judo move this rubric exists to find is precisely what that context is
blindest to. A self-served pass reliably returns "nothing blocking" on a diff a
fresh reviewer takes apart, and a reviewer forked from the author's history
inherits the same justifications. Dispatching also keeps the full diff and file
contents out of the implementing session's window.

The comment trim precedes the round: dispatch `trim-comments` to the
`comment-trimmer` agent first, as that skill describes, including how its edits
reach the round's revision, and review the trimmed diff.

The dispatch names this skill, never a plugin version or a cache path: the
reviewer loads the installed skill. Record this review's verdict against the
accepted scope and revision.

Where the host offers no subagent mechanism, the review still does not run
inside the implementing context: hand the diff to a fresh session and name that
route in the report. An author's pass over their own work is reported as what it
is and never as this gate.

## Core Prompt

Start from this baseline:

> Perform a deep code quality audit of the current branch's changes.
> Rethink how to structure / implement the changes to meaningfully improve code quality without impacting behavior.
> Work to improve abstractions, modularity, reduce Spaghetti code, improve succinctness and legibility.
> Be ambitious, if there is a clear path to improving the implementation that involves restructuring some of the codebase, go for it.
> Be extremely thorough and rigorous. Measure twice, cut once.

## Scope Boundary: strict inside, follow-up outside

All the strictness below applies **within the accepted work's boundary**:
the ticket, plan, or agreed change under review, as the dispatch's accepted
scope states it. Findings outside it are classified, not chased:

- **In scope (blocking):** demonstrated defects and material structural problems
  in this change. Explain the consequence and fix before approval.
- **In scope (advisory):** supported improvements without a blocking consequence.
  File length or an alternative design alone does not establish a blocker.
- **Out of scope (follow-up):** adjacent defects, pre-existing mess this
  diff did not worsen, improvements beyond the accepted work: record them
  in the existing scope record; external tickets require explicit existing
  authorization and deduplication. Do **not** fold them into
  this change. One exception: a finding that proves this change **unsafe or
  incorrect as shipped** blocks regardless of where it lives.
- The review is a **gate, not an implementation-discovery engine**, and a
  **default-on** gate: when a work-stream's implementation is complete, this
  review runs whether or not anyone asked for it. Exactly two things stop it:
  **the user explicitly declining**, or **the repo's own process superseding
  it**. A small diff, a confident implementation, a clean-looking change, time
  pressure, or the session's own sense that this one doesn't need it are not
  among them. Run the initial review when implementation is believed complete,
  before filing a PR or merging directly. Record the reviewed revision and
  dispositions. Complete the bounded correction review below before delivery.

## Bounded correction review

Use one initial review round plus focused correction verification. The implementer owns
fixes and focused tests; the independent reviewer owns closure of blocking findings.

1. **Return every blocking disposition to its reviewer.** Send finding IDs, the
   reviewed and current revisions, the correction diff, and focused test evidence.
   Include evidence-based rejections as well as fixes. Reuse the same reviewer
   session; if unavailable, give a replacement independent reviewer the prior
   findings and evidence. A one-line correction or passing test does not close a
   blocker without reviewer confirmation.
2. **Keep follow-up focused.** A follow-up pass's focus is the open blockers,
   the correction delta (the change since the last reviewed revision), and the
   callers, contracts, and behavior it affects, plus the full affected scope
   when a correction broadly invalidates the initial review. Trace outside
   changed lines when needed to assess effects. New blockers need a concrete
   failure path, violated requirement, or demonstrated material maintainability
   consequence. Cosmetic preferences, alternative designs alone, and unrelated
   cleanup remain advisory or follow-up work. On a follow-up pass, the reviewer
   labels a finding outside this focus out-of-scope (follow-up) unless it proves
   the change unsafe or incorrect as shipped, which still blocks: an
   out-of-scope finding never makes the verdict ISSUES_FOUND, never justifies
   another pass, and never holds delivery.
3. **Run follow-up passes automatically while review converges.** A pass is one
   submission of the revised change to this reviewer. When a verified correction
   batch is ready for review, submit the next pass without asking anyone: no pass count
   limits it. Number passes as a record (0 for the initial round), never as a
   limit. Correction dispatches, lane handbacks and owner validation are not
   passes. A replacement for a reviewer that never returned completes the same
   unchanged submission. Send this reviewer's findings and the changed surfaces
   they concern. Stop when all blocking dispositions are confirmed and the
   current revision is covered. Advisory-only findings never
   trigger another pass.
4. **Stop only when review stops converging.** Judge each follow-up pass on
   what changed since the previous pass. Stop submitting passes, hold delivery,
   and report to the authority that owns the work (the epic owner for a
   delegated lane, the user for standalone implementation) when:
   - a follow-up pass sent at least one open blocker closed or narrowed none of
     them (a finding still Partially resolved on the same gap is no progress);
   - a finding the author rejected with evidence is raised again without new
     evidence; or
   - each of two consecutive follow-up passes raised a new blocker and ended
     with at least as many open blockers as it was sent (in-delta churn). A
     pass that only narrows findings is judged by the first condition alone
     and neither counts toward nor breaks the two-pass run.

   The report names each open finding with both sides' evidence and recommends
   a next step; that authority decides it within its existing authority, and the
   decision is recorded. Unless it ends review, the decision restarts automatic
   passes under rules 3 and 4, with the two-pass churn count starting over.
   Corrections and owner validation continue under existing task authority, but
   a correction made while review is held waits for that decision before it is
   submitted. A held review is never PASS: a blocker closes only on reviewer
   confirmation or the user's explicit waiver, and the author cannot dismiss a
   disputed blocker to bypass this gate.
5. **Record closure against the revision.** The reviewer returns the reviewed
   revision, finding IDs with resolved / unresolved / rejected-with-evidence
   dispositions, supporting evidence, and PASS or ISSUES_FOUND. Confirmation of
   all blockers ends the correction loop. Further edits or a new SHA alone do
   not reopen it. New scope or a material redesign that invalidates a prior
   conclusion needs review of the affected delta by its owning reviewer.
   Explicit review requests and superseding repository gates still apply. A new
   reviewer, PR preparation, or session handoff does not reset the record: prior
   findings, dispositions and rejections carry over.

Existing explicit user waivers and superseding repository processes retain
precedence.

## Non-Negotiable Additional Standards

Apply the baseline prompt above, plus these explicit review rules:

0. **Be ambitious about structural simplification.**
   - Do not stop at "this could be a bit cleaner."
   - Look for opportunities to reframe the change so that whole branches, helpers, modes, conditionals, or layers disappear entirely.
   - Prefer the solution that makes the code feel inevitable in hindsight.
   - Assume there is often a "code judo" move available: a re-organization that uses the existing architecture more effectively and makes the change dramatically simpler and more elegant.
   - If you see a path to delete complexity rather than rearrange it, push hard for that path.

1. **Inspect a PR that pushes a file from under 1k lines to over 1k lines for a concrete decomposition problem.**
   - Treat this as a strong code-quality smell by default.
   - Prefer extracting helpers, subcomponents, modules, or local abstractions instead of letting a file sprawl past 1000 lines.
   - If the diff crosses that threshold, explicitly ask whether the code should be decomposed first.
   - The crossing alone is advisory; it blocks only when the review demonstrates a concrete maintainability consequence.

2. **Do not allow random spaghetti growth in existing code.**
   - Be highly suspicious of new ad-hoc conditionals, scattered special cases, or one-off branches inserted into unrelated flows.
   - If a change adds "weird if statements in random places", treat that as a design problem, not a stylistic nit.
   - Prefer pushing the logic into a dedicated abstraction, helper, state machine, policy object, or separate module instead of tangling an existing path.
   - Call out changes that make the surrounding code harder to reason about, even if they technically work.

3. **Bias toward cleaning the design, not just accepting working code.**
   - If behavior can stay the same while the structure becomes meaningfully cleaner, push for the cleaner version.
   - Do not rubber-stamp "it works" implementations that leave the codebase messier.
   - Strongly prefer simplifications that remove moving pieces altogether over refactors that merely spread the same complexity around.

4. **Prefer direct, boring, maintainable code over hacky or magical code.**
   - Treat brittle, ad-hoc, or "magic" behavior as a code-quality problem.
   - Be skeptical of generic mechanisms that hide simple data-shape assumptions.
   - Flag thin abstractions, identity wrappers, or pass-through helpers that add indirection without buying clarity.

5. **Push hard on type and boundary cleanliness when they affect maintainability.**
   - Question unnecessary optionality, `unknown`, `any`, or cast-heavy code when a clearer type boundary could exist.
   - Prefer explicit typed models or shared contracts over loosely-shaped ad-hoc objects.
   - At external inputs, prefer the existing authoritative schema and a type derived from it, or a validator checked against the whole declared type. A cast or a predicate that checks only some fields does not establish that type; do not introduce a schema library merely to satisfy this preference.
   - If a branch relies on silent fallback to paper over an unclear invariant, ask whether the boundary should be made explicit instead.

6. **Keep logic in the canonical layer and reuse existing helpers.**
   - Call out feature logic leaking into shared paths or implementation details leaking through APIs.
   - Prefer existing canonical utilities/helpers over bespoke one-offs.
   - Push code toward the right package, service, or module instead of normalizing architectural drift.
   - Check whether a plausible local edit can break a distant invariant: independently writable copies, equivalent competing paths, importable internals, or hand-synchronized lists. Name the concrete consequence and the ownership, visibility, or consistency check that prevents it. Preserve required compatibility and distinct adapters; the smell alone is advisory.

7. **Treat unnecessary sequential orchestration and non-atomic updates as design smells when the cleaner structure is obvious.**
   - If independent work is serialized for no good reason, ask whether the flow should run in parallel instead.
   - If related updates can leave state half-applied, push for a more atomic structure.
   - Do not over-index on micro-optimizations, but do flag avoidable orchestration complexity that makes the implementation more brittle.

8. **Report what the comment trim left, per the repository's rules.** The `trim-comments` stage edits the diff's comments before this round; what remains is findings like any other, and the implementer acts on them. Cosmetic narration belongs to `trim-comments`; it does not acquire a blocking structural consequence merely because it survived that pass.
   - Where the repository's rules say which comments to remove, flag the ones the diff adds that those rules cover.
   - Flag a lint or type suppression (`eslint-disable`, `@ts-ignore`, `@ts-expect-error`, `# type: ignore`, `#[allow(...)]`) that silences a rule protecting correctness or safety. Look the rule up and ask for the fix it wants.
   - Flag a constraint comment (`do not remove`, `keep in sync with`, `do not change this wording`) that a test, type, or lint rule could enforce, and name the cheapest one. One the trim already returned as an encoding offer waits for the outline gate: note it, and do not raise it again as a finding.

## Review lenses and remedies

For the initial review, and when a correction introduces a new quality concern,
read [Review lenses](references/review-lenses.md) for questions, concrete smells,
remedies and reporting tone. Apply them within the Scope Boundary and bounded
correction rules above; a lens is not an independent reason to block delivery.
Keep findings direct, evidenced and tied to a structural consequence.

## Output Expectations

Open the report with the verdict, on its own line and before anything else:

```
## Verdict: PASS | ISSUES_FOUND
```

- `PASS` - no in-scope (blocking) finding. Advisory and out-of-scope findings may follow it.
- `ISSUES_FOUND` - at least one in-scope (blocking) finding, judged against the approval bar below.

After the verdict, record the reviewed revision (include a diff fingerprint for
uncommitted changes), follow-up pass number (0 for the initial round), and
stable finding IDs. On follow-up,
include each prior blocker's disposition and supporting evidence.

A report that omits the verdict line reads as `ISSUES_FOUND`.

Prioritize findings in this order:

1. Structural code-quality regressions
2. Missed opportunities for dramatic simplification / code-judo restructuring
3. Spaghetti / branching complexity increases
4. Boundary / abstraction / type-contract problems that make the code harder to reason about
5. File-size and decomposition concerns
6. Modularity and abstraction issues
7. Legibility and maintainability concerns

Do not flood the review with low-value nits if there are larger structural issues.
Prefer a smaller number of high-conviction comments over a long list of cosmetic notes.
Label every finding **in-scope (blocking)**, **in-scope (advisory)**, or
**out-of-scope (follow-up)** per the scope boundary: an unlabeled finding reads as blocking.

## Approval Bar

Do not approve merely because behavior seems correct.
The bar for approval is:

- no clear structural regression
- no unaddressed material structural problem where a demonstrated simplification resolves the consequence
- no unjustified file-size explosion
- no obvious spaghetti-growth from special-case branching
- no obviously hacky or magical abstraction that makes the code harder to reason about
- no unnecessary wrapper/cast/optionality churn obscuring the real design
- no clear architecture-boundary leak or avoidable canonical-helper duplication
- no missed opportunity for an obvious decomposition that would materially improve maintainability

Investigate these aggressively and require a clear structural justification.
They block when the review demonstrates a correctness or material maintainability
consequence; file length or an alternative design alone is not sufficient:

- the PR preserves a lot of incidental complexity when there is a plausible code-judo move that would delete it
- the PR pushes a file from below 1000 lines to above 1000 lines
- the PR adds ad-hoc branching that makes an existing flow more tangled
- the PR solves a local problem by scattering feature checks across shared code
- the PR adds an unnecessary abstraction, wrapper, or cast-heavy contract that makes the design more indirect
- the PR duplicates an existing helper or puts logic in the wrong layer when there is a clear canonical home

If those conditions are not met, leave explicit, actionable feedback and push for a cleaner decomposition.
