# Workbench operator decisions: rationale in force

Rationale for scope, route, repository precedence, and evidence ownership. The
[flow map](../workbench-flow.md) summarizes current execution; canonical skills
define the procedure.

## Audit sizing is a structured question with a runtime flag (2026-08-12)

Unless coverage is already stated, `audit` asks for the tier through a structured question tool with the recommendation first, because free-prose asks buried the tiers or skipped the pick. Tiers size breadth, not evidence source, so a "does X work" check sized as a quick look could quietly become greps. When the target is behavior a real client can drive, the same question confirms driving the booted app, which reaches the engine as scope.

**Sizing is stated; asked only when the answer changes cost or modality (2026-11-09).** Both audits in one week ran without the sizing question, one inline and one as a static review with independent readers, and the user accepted both: the question had become a step sessions skip, not a decision the user needed to make. The step now states the tier, engine and one-line reason, and asks only when two tiers both fit and differ in what the user pays (a team sweep, or delegated readers not yet authorized) or in runtime modality, and the coverage is not already stated. An asked pick keeps the structured-question form above. The static-review tier's fit, which named only instruction, configuration and document review, now names read-only code audits too, the use it was already put to. A static review that used independent readers reads the cited lines firsthand for every reader claim the verdict rests on, and reports the rest as the reader's, unverified; in the observed run that check was voluntary. The Output's exit list gains the repairs-already-authorized exit the steps already had. Two runs motivate this; no wording comparison was run.

## The first route is `direct`, asked like sizing (2026-08-12)

The first route's former slang name, left in by oversight, became `direct`: implement from session context. A route pick that is still needed, in `brainstorming` or at `audit`'s confirmed-fix exit, is asked like the sizing question, with user-facing labels (Direct, Plan) instead of skill names.

On 2026-10-30, the operator retired `handoff-goal`. Its former long-running-goal
route is removed from the active skills, catalogs and flow maps; the contract
and templates remain in the [deprecated archive](../../attic/deprecated/skills/handoff-goal/origin.md).

## TDD is a default, not a mandate (2026-08-12)

A session ran tests despite a repo rule forbidding test runs before manual validation, because the skill's MANDATORY labels had no stated rank against repo rules. A conflicting stated repo or user convention now wins, announced in one line, while the compatible rest of the cycle still applies. Convenience alone never displaces a step, and the cycle's rigor is unchanged where TDD applies.

## Focused proof by default, broad QA by invitation (2026-10-08)

`verification-before-completion` requires focused `empirical-proof` for behavioral
completion. Reuse adequate current evidence through the affected consumer
boundary; no automatic full suite, recording, team, or permanent harness.
A blocked route remains incomplete and reports attempts and the concrete gap.
Broad `qa-sweep` remains offered, running only on an explicit ask, immediate or
standing. Explicit declines and superseding repo rules retain precedence.
This revises the former opt-in choice, whose cost rationale assumed fan-out;
see [the verification decision](empirical-proof.md).

## Worktrees live inside the repository (2026-08-12)

A session put a worktree in system temp, mixing a repository checkout into disposable space. Placement follows the repo or user convention, prefers the harness's native mechanism, and otherwise defaults to an ignored `<repo>/.worktrees/<task-name>`, never outside the repo unless the user asks. Upstream's full worktree skill was declined: one lived failure does not justify it; only its ignore check and prefer-native idea were borrowed.

## Review is a scoped completion gate (2026-08-12)

A field session grew a one-ticket change into a 52-file workset because the adversarial review had neither fixed timing nor scope classification, so it ran as an implementation-discovery engine. The initial review fires once implementation is believed complete, right before the PR-or-merge gate, never mid-implementation. Strictness applies inside the accepted work; outside findings become recorded follow-ups unless they prove the change unsafe or incorrect as shipped.

## One evidence home per work scope (2026-08-12)

An audit scattered one scope's evidence across three per-agent temp directories: the orientation named the location, but dispatched agents skip it and the engines' contracts named none. Everything a work-stream produces, agents' evidence included, now lands in one `.workbench/<work_scope>/` folder whose path the dispatcher hands every agent in its contract, never per-agent or system temp directories.

## Temporary artifacts have an end of use (2026-11-02)

Calling `.workbench` disposable without an end-of-use action left finished build
copies and probe output accumulating between manual cleanups. The owning session
must retire artifacts when their consumers finish, and account for leftovers at
closeout. Preserve the small evidence actually needed for review, delivery or
follow-up, with a reason and removal condition; keeping one receipt does not
justify retaining its whole build tree. This is scoped housekeeping under existing
authority, not an automatic machine cleanup. Explicit preservation, stop-tending
instructions and repository approval requirements still govern deletion.

## Brainstorming classifies the request first (2026-08-12)

Upstream's three-path classifier was adopted: the session first announces the request as a spike (an answer, not code), bounded (a well-scoped change to existing code), or architectural (unresolved structure or depended-on interfaces). The local copy gave everything architectural ceremony, the over-ceremony the fork exists to remove, so this lightening was adopted, not dismissed as pressure tuning. Adapted: bounded and architectural work ends at the route resolution rather than upstream's dropped plan-writing hand-off, a spike ends in a reported recommendation, and only architectural work gets a written design.

## Scope is the user's to define (2026-08-25)

`using-workbench` no longer carries the former stop-and-rescope guard. Sessions read it as limiting what they could read, stopped tracing causes into subsystems the ticket never named, and missed root causes; a more precise rewrite only added terms to misread. Scope is the user's to define in the ask, so nothing replaces the guard; a repo or user wanting a size rule states it. Review finding labels stay: they classify findings, not the session's reach.

## Scope language never limits reading (2026-08-25)

A follow-up audit of all workbench skills and agents removed text readable as limiting what a session reads, traces, or root-causes. `test-driven-development` lost its scope-boundary section, which steered a session that traced a bug into another module toward a symptom fix, against `systematic-debugging`'s fix-at-source rule. Reviewers now read whatever surrounding code judging the change needs, `fix-ci` fixes the cause without bundling unrelated changes, and no new rule replaces the removed text.

## audit confirms a runtime check even when it asks no sizing question (2026-11-09)

Making the sizing question conditional left the runtime-modality confirmation
attached to a question that often is not asked. The confirmation now stands
on its own: inside the sizing question when there is one, as its own question
otherwise.

## session-messaging retired (2026-11-09)

The operator retired `session-messaging`. Messages between sessions are carried
by the operator's own tooling, which acts outside the session, so Workbench no
longer ships a skill for sending them; epic handoffs were never its job and
stay with `epic-orchestration`. The complete skill, usage page and decision
history remain in the
[deprecated archive](../../attic/deprecated/skills/session-messaging/origin.md).
