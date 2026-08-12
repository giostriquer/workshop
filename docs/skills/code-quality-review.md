# code-quality-review

## What it does

This skill runs an unusually strict maintainability review over a finished change: abstraction quality, structure, file sprawl, and spaghetti growth. Its distinguishing posture is ambition. It is not looking for local cleanup opportunities — it is looking for **"code judo" moves: restructurings that preserve behavior while making the implementation dramatically simpler, smaller, more direct, and more elegant.** Where a normal review says "this could be cleaner," this one asks whether the change can be reframed so whole branches, helpers, modes, or layers disappear.

It is **default-on**. Once a work-stream's implementation is complete, **"this review runs whether or not anyone asked for it. Exactly two things stop it — the user explicitly declining, or the repo's own process superseding it."** The skill enumerates the non-reasons directly: a small diff, a confident implementation, a clean-looking change, time pressure, or the session's own sense that this one doesn't need it. That last one is the point — the session's judgment that a change looks fine is precisely what an adversarial pass exists to distrust.

It is a gate, not a fixer and not a bug-hunter. It produces findings, labeled and prioritized; in-scope findings then get fixed and re-verified as a separate step, and the review does not run again. It owns maintainability and structural ambition — correctness, behavior verification, and pattern conformance belong to other paths. Run through its companion `code-quality-reviewer` agent, it is explicitly review-only: it surfaces problems and pushes for a cleaner structure, and does not patch code.

## When to reach for it

Mostly you don't — it fires on its own, **"once, only when the implementation is believed complete, immediately before the PR-or-merge question — never mid-implementation."** That timing is load-bearing in both directions: it must not be skipped at completion, and it must not fire in the middle of implementation.

It also keeps an on-request entry point, because asking for a harsh review out of band is a real thing people want. Its description triggers on a strict **or adversarial** code quality review, a deep code quality audit, or an especially harsh maintainability review.

| The problem | The skill |
| --- | --- |
| A work-stream's implementation is complete and needs its one strict structural pass before landing | `code-quality-review` (fires by default) |
| You want a harsh maintainability audit right now, outside the flow | `code-quality-review`, invoked directly |
| Does the change conform to the project's documented implementation patterns? | `pattern-reviewer` agent — a complementary strict reviewer with a different target |
| Are the tests trustworthy and do they cover the risk? | `test-quality-reviewer` agent |
| Does the change actually work? | `verification-before-completion`, and `empirical-proof` if you want proof at the running app |
| A design spec or plan needs review before anyone implements it | `spec-reviewer` agent |

## The rubric

The pass starts from a baseline instruction — a deep audit of the current branch's changes that rethinks how to structure them without impacting behavior, improving abstractions and modularity, reducing spaghetti, with explicit license to restructure surrounding code: **"Be extremely thorough and rigorous. Measure twice, cut once."**

Layered on top are eight non-negotiable standards. Rule 0 is the ambition rule: look for reframings that delete complexity rather than rearrange it, and **"prefer the solution that makes the code feel inevitable in hindsight."** The remaining seven each name a specific erosion:

| Rule | What it fights |
| --- | --- |
| 1 | A PR pushing a file from under 1k lines to over 1k without a very strong reason |
| 2 | Ad-hoc conditionals, scattered special cases, and one-off branches bolted into unrelated flows |
| 3 | Rubber-stamping "it works" implementations that leave the codebase messier |
| 4 | Hacky or magical code where direct and boring would do; thin wrappers and identity abstractions |
| 5 | Unnecessary optionality, `unknown`, `any`, cast-heavy code, and silent fallbacks papering over unclear invariants |
| 6 | Feature logic leaking into shared paths; bespoke helpers where a canonical one exists |
| 7 | Needless sequential orchestration and non-atomic updates that leave state half-applied |

**The scope boundary decides what each finding costs.** All that strictness applies inside the accepted work's boundary — the ticket, plan, or agreed change under review. Findings in scope are blocking and get fixed before approval. Findings outside it — adjacent defects, pre-existing mess this diff did not worsen, improvements beyond the accepted work — are **recorded as follow-up work, not folded into this change**. One exception: a finding that proves the change unsafe or incorrect as shipped blocks regardless of where it lives. Every finding must carry a label, and **"an unlabeled finding reads as blocking."**

**The approval bar is a set of presumptive blockers**, each waivable only with a clear justification: preserving a lot of incidental complexity when a plausible code-judo move would delete it, pushing a file past 1000 lines, adding ad-hoc branching that tangles an existing flow, scattering feature checks across shared code, adding an unnecessary abstraction or cast-heavy contract, and duplicating an existing helper or putting logic in the wrong layer.

Findings come out in priority order — structural regressions first, then missed simplification opportunities, then spaghetti growth, then boundary and type-contract problems, then file size, modularity, and legibility. The skill is blunt about noise: **"Do not flood the review with low-value nits if there are larger structural issues."**

## Common questions

**My diff is three lines. Do I really have to run this?**
Yes, unless you decline it or your repo has its own mandated review stage that supersedes it. Those are the only two exits, and they are narrow on purpose. Sessions were previously finishing implementations and going straight to the landing gate — not out of defiance, but because the flow layer described the review as optional in four separate places, most damagingly the line stating that `verification-before-completion` was the *only* always-on piece. All four sites now state the same rule ([decision](../decisions/adversarial-review-is-default-on.md)).

**The review found ten problems that have nothing to do with my change. Do I fix them all?**
No. Label them out-of-scope and record them as follow-up work. This rule exists because of a specific field failure: a one-ticket persistence change grew into a **52-file workset across six subsystems** through a loop of implement the ticket, find an adjacent defect, treat it as required, add tests and a fix, review the larger implementation, find more defects, repeat. Two weaknesses fed it — the review carried no scope classification distinguishing blocking findings from adjacent ones, and its timing was unpinned, so it ran as an implementation-discovery engine rather than a completion gate ([decision](../decisions/scope-guards-q15-q16.md)).

**Should I re-run the review after fixing its findings?**
No. Fixed findings get re-verified and the work proceeds. The skill's own framing: **"feeding each round's discoveries back into implementation grows the diff without bound."** One pass per work-stream.

**Can I run it midway through, to catch problems early?**
Not as this gate. It fires once, when the implementation is believed complete, right before the PR-or-merge question. Firing mid-implementation is the failure mode that produced the 52-file workset.

**Is the 1000-line rule a hard cap?**
No. It is a strong smell that starts a decomposition conversation, and the skill allows a waiver where there is a compelling structural reason and the resulting file is still clearly organized. What it does not allow is the threshold being crossed silently: if the diff crosses it, the review must explicitly ask whether the code should be decomposed first.

**Will it catch bugs?**
Not its job. It owns maintainability and structural ambition; bug-hunting and behavior verification belong to other paths, and it is not a substitute for pattern conformance review either. It is also not a whole-repo auditor — its prioritization and approval bar are written for the question "should this change land."

**I asked for "an adversarial code quality review" and got nothing.**
That gap is closed. The flow calls this pass adversarial everywhere it names it, but the skill's own description contained the word nowhere, so the request was matching on "code quality review" alone. The on-request clause now reads "a strict **or adversarial** code quality review."

**Should I run the skill inline or dispatch the agent?**
Either. The skill is the rubric; the `code-quality-reviewer` agent loads that same `SKILL.md` and treats it as the complete rubric — tone, approval bar, output ordering, and all the structural rules — applying it to a diff in its own subagent context. Dispatching keeps the full diff and file contents out of the main window and lets the code-quality, pattern, and test-quality stages run as separate focused passes. The agent reviews the labeled sections when a parent supplies them and gathers `git diff <base>...HEAD` itself when they are absent.

**Can it edit the code it criticizes?**
The agent cannot — it is review-only, does not edit, commit, or push, and does not spawn nested subagents unless asked. Routing findings into edits is the implementer's step.

## It's working if

- The review fired at completion without anyone requesting it, and the session said so.
- Every finding carries an in-scope or out-of-scope label, and the out-of-scope ones left the diff alone and became follow-up work.
- The top findings are structural — a reframing that deletes a layer, a file that should be decomposed — rather than a list of naming suggestions.
- Approval was withheld on a change that worked and passed its tests, because it left the local architecture messier.
- It ran exactly once, and the fixed in-scope findings were re-verified without a second review round.

Negative signals — the skill is being misapplied if:

- It keeps firing during implementation, each round surfacing new work. That is the diff-growth loop the timing rule exists to stop.
- The diff is expanding because of review findings the accepted work never named.
- It was skipped because the change looked clean, the diff was small, or time was short. Those are named non-reasons, and the decision to skip is the user's to make, never the session's.
- The output is a long list of cosmetic nits while a 1,400-line file or a bolted-on special case goes unmentioned.

## Where it fits

This is the last gate before landing. Once a work-stream's implementation is complete and verified with evidence — the test-quality review done, `verification-before-completion` satisfied, and `empirical-proof` run if you asked for it — this single adversarial pass runs. In-scope findings are fixed and re-verified, out-of-scope findings become follow-ups, and the session proceeds without re-reviewing. Then the user gate: the session outlines what was done and asks PR or merge.
