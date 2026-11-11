# model-reference: decisions in force

Rationale for the workbench `model-reference` skill, including fleet calibration and harness routing. The skill owns the table; agent contracts own dispatch arguments.

## Test-quality review and comment trim pin Opus 5.5 (2026-11-10)

`test-quality-reviewer` and `comment-trimmer` pinned the `opus` alias on Claude
Code, which resolves to whichever Opus the host maps it to. The operator asked
for both to carry `claude-opus-5-5`, the pin the contract, code-quality and
spec reviewers already use. All five Opus agents now name one exact model, and
a new Opus release reaches none of them until the pin is edited. Effort, the
separate context, by-name dispatch with no model override, the Muse
scoped-definition route and the Codex `gpt-6.1-sol` pin are unchanged.

## Table and notes agree again; effort is recorded; escalation climbs effort first (2026-11-09)

The 2026-11-05 re-grade changed rows and nothing else, which left the skill
disagreeing with itself. Corrected in one pass:

- The reading notes said Opus was level with Fable on taste and code and sent
  intelligence-heavy work to Fable, while the table graded Opus at or above
  Fable 5.1 on all three quality axes. The notes now say what the table says.
- The caveat said the Fable row had been renamed without re-grading; it was
  re-graded on 2026-11-05. The caveat now gives that date and says what is
  still missing: a task set and a method.
- "luna and sol are not taste routes" contradicted Sol's taste grade against
  the stated threshold of 7. The note now names the rows the threshold
  excludes. Excluding Sol would take a higher threshold or a lower grade.
- The priority order never placed the `code` axis added on 2026-07-31. It now
  reads intelligence, then the axis the work loads (code or taste), then cost,
  then speed, which is the tie-break the usage page already gave.
- `fable-5.2` joined the fleet after the re-grade. It has a row with no
  grades rather than Fable 5.1's numbers under a new name, which is the
  rename-without-re-grading the caveat used to describe.
- An `effort` column records the level each row is graded at, taken from the
  operator's host configuration and dispatch pins on 2026-11-09; rows with no
  recorded level show `n/a`. The table said rows were graded at the effort
  actually run and never said which. Still one row per model.
- Calibration gets a definition (date, task set with outcome checks, two or
  three effort levels per candidate, score against spend), since the skill
  required a calibration it never described.

**Escalation climbs effort before tier, reversing the 2026-08-12 cut.** That
decision dropped "climb effort before hopping models" as already covered by
standing escalation. Vendor guidance published 2026-11-09 orders the steps as
self-verification, one effort level, then the next model at a lower effort,
and reports that past `high` one more level can cost as much as a larger
model. The invariant now carries that order as two cases keyed to the current
effort (below `high`, at or above it), since every pinned agent already runs
above `high`, and says to escalate by fresh
dispatch because a mid-session model switch re-pays the prompt cache and
drops earlier reasoning. That guidance prices the API; the `cost` axis is
subscription burn, which it does not measure.

**Code-quality and spec review pin Opus 5.5 at `xhigh` on Claude Code.** Both
agents inherited the parent's model. With sessions moving to Fable 5.2 they
became the only reviewers running on it, while test-quality, contract and trim
review stayed on Opus. The operator chose the pin; Codex and other harnesses
keep the parent's model and effort.

Open: the `xhigh` pins on the watcher and the reviewers have no measurement
behind the level. The calibration recipe above is how to get one.

## Operator-supplied reference rows (2026-09-29)

The operator removed the older `gpt-6-sol` row and re-graded several others.
Those scores were superseded by the 2026-11-05 re-grade; the table in the
skill is the only current copy. The usage page links it.

The table retains its illustrative qualification. Operator-supplied edits
provide no new evaluation provenance or general routing mandate.

## Claude CI watching uses Sonnet 5.5 (2026-09-29)

The operator removed the global Sonnet ban and assigned Claude Code CI
watching to Sonnet 5.5. The watcher pins `claude-sonnet-5-5` in its agent
frontmatter, so an alias cannot drift to another Sonnet version. The parent
still dispatches by name without a model override. The watcher keeps `xhigh`
effort and a separate context; Codex still uses `gpt-6.1-sol`. Test-quality
review and comment trimming keep Opus on Claude Code. Haiku stays out of CI
watching; since the global rule gave Haiku a narrow lane
([adopt-global-rules](adopt-global-rules.md#haiku-gets-a-narrow-lane-2026-10-07)),
the watcher exclusion names it directly.

## Sol 6.1 dispatch pins (2026-09-29)

The operator requested that every current Sol 6 spawn recommendation or
requirement move to `gpt-6.1-sol`. The Codex dispatches for `ci-watcher`,
`test-quality-reviewer`, and `comment-trimmer` now use that model. Their
`reasoning_effort: "xhigh"`, `fork_turns: "none"`, separate-agent requirement,
and contract-message shape stay the same. The model-reference exceptions,
using-workbench orientation, and matching usage pages carry the same pin.

This replaces the Sol 6 model pins described in the earlier decisions below.
Recorded probe results keep `gpt-6-sol`: they describe that model. The
current table removes its retired row, as recorded above. The Sol 6.1 reference row retains
the table's existing legacy-illustrative qualification.

## One canonical table behind a pointer (2026-07-20)

The operator's always-injected rules file carried its own model table, which went stale because an injected copy has no update trigger. The table moved into the skill as its only canonical copy, and the rules file shrank to the hard invariants plus a pointer. Three of those invariants still stand: orchestration never goes to a weaker-model subagent, a session reruns on a smarter tier without asking when output misses the bar, and for shipped work intelligence outranks taste and both outrank cost. The skill never dispatches, and its rows describe one operator's fleet for adopters to replace.

## A code axis; taste means user-facing work (2026-07-31)

A `code` axis grades coding craft, because most dispatched work is implementation and without it a model's coding edge was invisible. `taste` narrowed to user-facing surfaces, dropping the code-quality claim the new axis now carries. Retired models leave the table rather than lingering "for reference": a stale row is the failure the skill exists to prevent.

## A lookup, not a dispatch procedure (2026-08-12)

Sessions read the skill as a procedure and ran it before every subagent dispatch, so the grading rubric, process patterns, output contract, worked examples, and dispatch mechanics were cut. What remains is the table with axis definitions, the hard invariants, and short reading notes, triggered as a lookup rather than a pre-dispatch step. How the table was made belongs in decision notes; in the shipped skill that history was dead weight and went stale.

## Invariants carry shape, not one operator's policy (2026-08-12)

A plugin that hard-codes one operator's fleet ships a policy its adopters never chose. The hard invariants therefore state the shape of each rule; which models are in or out, and where any floor sits, belong to the operator's always-injected rules file. The named CI-watch and test-quality-review assignments are explicit exceptions outside the invariants. By the same reasoning, the writing-skills best-practices reference may keep its Haiku and Sonnet testing advice.

## One row per model; cost and speed kept apart (2026-08-12)

Effort is not a modeled axis: each model gets one row, graded at the effort it actually runs at, and a change of habitual effort re-grades the row rather than splitting it. `cost` is subscription-limit burn alone and `speed` is wall-clock turnaround, since cost had included wall-clock and would otherwise score it twice. For shipped work the order is intelligence, taste, cost, speed; speed breaks ties between level rows and never buys a quality drop. "Climb effort before hopping models" was cut then as already covered by standing escalation permission; the 2026-11-09 section above restores it as an ordered step.

## Renamed to model-reference; the floor leaves (2026-08-20)

`route-work` named a verb the skill does not perform and kept teaching the dispatch reading the trims had removed; `model-reference` says what it is. The model-floor invariant left, because even a floor's shape is fleet policy; `adopt-global-rules` ships a `model-floor.md` rules file, where a floor belongs. The operator-calibration paragraph and cross-subscription caveat left too, restating a boundary the opening already draws. The orchestration invariant names that rules file as the alternative to the session's own model, `taste` extends to docs, research, and audits, and the description regained a firing condition, without which a skill fires only when typed by name.

## Dispatch exceptions pin effort and context (2026-09-24)

CI watching, test-quality review and comment trimming require separate agents.
A model name alone left Codex using default effort and inherited context, so
these exceptions also specify `xhigh` and a fresh context. The exact current
pins and spawn arguments live in each agent's Dispatch line; Claude Code and
Muse dispatch the registered definition, while Codex receives the contract in
its spawn message. See [plugin surfaces](plugin-surfaces.md).

Comment trimming shares the test reviewer's tier because the author should not
review their own comment choices. Keeping the pair together avoids a later
model change splitting their policy. The CI watcher has its own assignment,
recorded above. Bounded dispatch-shape probes motivated making effort and
context explicit; they did not establish general model reliability.

## Routing stays inside the running harness (2026-09-17)

A table row describes capability, not reachability. Dispatch uses only models
the current host exposes; launching another provider's CLI changes the session,
permissions and budget and is the operator's decision. When a fitting model is
unreachable, use the best permitted reachable model and name the limitation.
This applies independently of standing permission to escalate model quality.

## One table, with calibration limits (2026-10-14)

The September fleet refresh changed names and operator-supplied scores without
a dated evaluation method. Those legacy rows remain illustrative, not measured
routing evidence. Duplicating them in the usage page produced drift twice, so
the handbook now links the canonical table instead. Historical names, scores,
and sync edits remain in git; active dispatch pins live in the agent contracts
and the skill's explicit exceptions.

## Contract-review routing (2026-10-16)

The operator selected Opus 5.5 at `xhigh` for Claude Code and GPT-6.1 Sol at
`xhigh` for Codex. Other harnesses retain the parent's model and effort,
including when importing Claude frontmatter. `contract-reviewer` owns the exact
dispatch settings; its [role decision](pattern-reviewer-comment-noise.md) records
the skill/agent split. The existing watcher, test-review and trim routes stay as
documented.
