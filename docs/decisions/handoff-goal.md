# handoff-goal: decisions in force

Rationale for the shipped `handoff-goal` skill (workbench plugin); superseded choices are omitted and git history keeps the originals.

## A forward handoff that writes a contract and never pursues it (2026-06-10)

A fresh session should pick up a goal and pursue it without re-explanation. Written by hand, that handoff loses chat-only rules at the first compaction, and a step-list goal leaves the pursuer unable to recognize done or reroute. So the skill writes a self-contained contract: the goal as an outcome with a definition of done, and operating rules as concrete values from the repo or the operator. An inferred goal is confirmed, and referenced work is read rather than recalled. The skill never pursues the goal itself.

## The contract defends the goal against its pursuer (2026-06-19)

A pursuing session under speed pressure converges on whatever looks done: a weakened test, a narrowed scope, victory on its own say-so. Many repos mandate no guard, so the contract carries the discipline. Four parts are always on: acceptance checks with a verify command and, for behavior changes, a refutation form; integrity rules naming the cheap proxies; independent verification; and a tripwire that turns the temptation to change the goal, checks, or scope into a stop-and-ask. The pursuer re-reads the goal, checks, and integrity rules after every compaction. Quality posture defaults to reliability over speed, and everything else scales with stakes.

## A split contract: frozen goal, route beside it (2026-07-12)

Weighed against ultragoal, a Codex-native goal skill, `handoff-goal` absorbed its design rigor rather than gaining a sibling, and the contract carries an activation note for runtimes with durable goal support. The contract became a frozen `goal.md` beside a `plan.md` route; routine work never writes `goal.md`, so an urge to edit it is the tripwire firing. The producer always runs a fit check (recommending a lighter tool when pursuit is not a loop), captures a baseline, and red-teams the draft. The primary verifier lives on the real surface, and a capability the pursuer lacks becomes a named blocked item, never a silent downgrade. Approval gates and delegation lanes scale with stakes, and critique mode audits existing contracts.

## Every contract ships a commit cadence (2026-07-17)

Pursuers left 50k to 70k lines uncommitted because a blank Commits slot in a gate-heavy contract read as git being the operator's call. Commit cadence became the second skill default after quality posture, a named exception to never inventing rules: commit at every verified checkpoint, at least once per phase, and never carry uncommitted work across a phase boundary. A loop step and a phase exit criterion make it structural; a stated operator or repo rule still wins.

## The description excludes open-ended research (2026-07-31)

The description once offered "a brand-new idea" as a goal source, inviting exploratory handoffs the fit check rejects. A session reads only the description before invoking, so it must agree with the fit check: open-ended research is excluded at the trigger, which states triggering conditions, not workflow.

## `plan.md` takes status flips only (2026-08-09)

A bounded in-file ledger still bloated the boot path: one pursuer spent its whole post-compaction budget re-reading a 450,000-character `plan.md` it was told was authoritative. Any sanctioned evidence recording inflates under pressure, so the pursuer writes only phase statuses and checkbox ticks, and no ledger exists. Git is the durable record when commits are allowed; resumption starts at the in-progress phase's first unchecked box and re-runs Verify commands rather than reading a log. A failed verification changes no status, and a route that no longer fits goes back to the operator. Losing sub-commit state at compaction is the accepted cost.

## Review effort scales with the landed work (2026-08-09)

The independent-pass wording read as a per-check choice, so pursuers dispatched reviewers for every small task while a finished phase's diff had no mandated review. A small task's independent pass is a clean Verify re-run; reviewers follow substantial chunks such as a feature, bug fix, or risky refactor. Every phase exits only after an adversarial code-quality review of its cumulative diff.

## Long-running work only (2026-08-20)

The trigger tested definedness but not duration, so a small, well-specified task the current session could finish still fired it. The description now leads with long-running work that must outlive this session, and the fit check disqualifies work that fits in one session in favor of a plain task. Critique of an existing contract has no duration test.

## User-invoked only (2026-08-25)

Whether work should outlive the session is the operator's routing call, and a contract the session decides to write freezes its own guess for a fresh session. The skill sets `disable-model-invocation: true` and runs only on an explicit `/handoff-goal`; brainstorming still offers the route, but only the user invokes it.
