# model-reference: decisions in force

Rationale for the workbench `model-reference` skill (born `route-work`), apart from the harness-routing and 2026-09 fleet-refresh decisions, which keep their own notes; superseded choices are omitted and git history keeps the originals.

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

`route-work` named a verb the skill does not perform and kept teaching the dispatch reading the trims had removed; `model-reference` says what it is. The model-floor invariant left, because even a floor's shape is fleet policy; `adopt-global-rules` ships a `model-floor.md` rules file, where a floor belongs. The operator-calibration paragraph and cross-subscription caveat left too, restating a boundary the opening already draws. The orchestration invariant names that rules file as the alternative to the session's own model, `taste` extends to docs, research, and audits, and the description regained a firing condition, without which a skill fires only when typed by name. Decision notes keep their `route-work-*` filenames: they record what was true when written.

## The two exceptions pin effort and history (2026-09-24)

The CI-watch and test-quality-review exceptions named a model and nothing else, and Codex filled the gaps with defaults: `spawn_agent` resolves a named model without `reasoning_effort` to that model's default effort, and `fork_turns` defaults to the whole parent history. A 30-day audit of Codex sessions found 4 of 14 test-quality reviews at low effort (two to five minutes active) and one on astra, and all nine CI watchers of the first two weeks on the parent's model. The operator set both exceptions to `xhigh`, spawned without the parent's history: Opus on Claude Code, pinned by the agent files' `model` and `effort` frontmatter, which Claude Code honors for plugin agents, so the caller passes no model; `gpt-6-sol` on Codex, pinned per spawn with `model`, `reasoning_effort: "xhigh"` and `fork_turns: "none"`, since Codex registers no plugin agents. The Haiku and Sonnet ban and the no-Astra-or-Fable watcher rule stand. This skill keeps the policy; the spawn arguments that carry it live once, in each agent file's Dispatch line, and the calling skills point there ([plugin-surfaces](plugin-surfaces.md#codex-agents-the-parent-pastes-the-contract-2026-09-24)).

In plan-only probes with two fresh Codex-parent contexts per arm, the current wording's test-reviewer spawns named `gpt-6-sol` with no effort 2 of 2, and its watcher spawns named no `xhigh` 2 of 2; this wording named `reasoning_effort: "xhigh"` with `fork_turns: "none"` 2 of 2 in each, and its Claude Code variant passed no model to `test-quality-reviewer` 2 of 2, where the current wording passed `opus` 2 of 2. This is bounded regression evidence for these dispatch shapes, not a reliability estimate.
