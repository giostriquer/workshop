# model-reference: decisions in force

Rationale for the workbench `model-reference` skill, including fleet calibration and harness routing. The skill owns the table; agent contracts own dispatch arguments.

## Operator-supplied reference rows (2026-09-29)

The operator re-graded `gpt-6.1-sol` to 7 / 9 / 8 / 8 / 6 and removed the
older `gpt-6-sol` row. Astra's speed is 5, Fable's intelligence is 9.5 and
speed is 4, Opus's speed is 6, and Sonnet's speed is 8. The other scores
remain unchanged. The usage page links the canonical skill table.

The table retains its legacy-illustrative qualification. These operator-supplied
edits provide no new evaluation provenance or general routing mandate.

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

Effort is not a modeled axis: each model gets one row, graded at the effort it actually runs at, and a change of habitual effort re-grades the row rather than splitting it. `cost` is subscription-limit burn alone and `speed` is wall-clock turnaround, since cost had included wall-clock and would otherwise score it twice. For shipped work the order is intelligence, taste, cost, speed; speed breaks ties between level rows and never buys a quality drop. "Climb effort before hopping models" was cut, not moved: standing escalation permission already covers rerunning a tier up.

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
