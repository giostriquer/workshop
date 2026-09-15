# Release Notes

Release notes for the shipped plugins (`workbench` and `toolkit`) newest
first, one section per released version. Strictly plugin releases: repo-only
work (structure, docs, tooling) lives in `docs/decisions/` and the git log,
not here. **Bounded:** at most 15 release sections: adding one past the cap
deletes the oldest (git history keeps everything). Sections from before the
2026-08-11 plugin split (`reviewers`, pre-split `toolkit`) were dropped in the
2026-08-12 reformat.

## workbench 0.38.1: 2026-09-15

- **Clarify epic lane readiness.** Dispatches identify shared-contract producers, fixture builders and consumer checks, respect producer/consumer dependencies, and separate local static/build gates from focused tests. Validation uses actual producer output and supported saved artifacts. Completion review runs over the finished implementation; earlier blocked reports do not trigger it. ([decision](decisions/epic-lane-readiness.md))
- **Preserve delivery state and report formats.** `file-pr` checks for merged PRs before pushing and routes authorized remaining work to a new branch and PR. Its delivery details fit the session's required handback format, with verdict-first output only when no format is required. ([decision](decisions/epic-lane-readiness.md))

## workbench 0.38.0: 2026-09-15

- **Keep epic lane handbacks consistent.** Add `epic-implementation` for implementation lanes dispatched through `epic-orchestration`, including amendments, recovery and delivery rounds. Both skills share one report reference, and each final handback contains a complete copyable report. Blocked, follow-up and guidance states include a `NEXT STEP` with the action or decision, owner and recommendation. ([decision](decisions/epic-implementation.md))

## workbench 0.37.6: 2026-09-14

- **Keep epic delegation provider agnostic.** Lane prompts name required skills, inputs, outcomes and evidence without restating their procedures or model routing. Optional local helpers inherit the owner's model; smaller models in the same provider/harness may handle mechanical work with cheaply verifiable results. The owner retains synthesis, rulings and authorization. ([decision](decisions/epic-orchestration-delegation.md))

## workbench 0.37.5: 2026-09-11

- **One CI watcher per pinned head.** `fix-ci` and `ci-watcher` state that reading and watching are one dispatch, that a head whose watcher returned red gets no second watcher for its pending checks, that the pre-push snapshot is a single read the parent runs itself, and that a re-watch is a new head with a new watcher. The watcher's description no longer asks hosts to dispatch it proactively. ([decision](decisions/fix-ci-act-on-first-failure.md))

## workbench 0.37.4: 2026-09-11

- **Epic dispatches are files; paste blocks are pointers.** `epic-orchestration` writes each lane prompt, audit brief and authorization to a file under the epic's scope folder and hands the operator a few-line block: role and authority, "Read and execute this dispatch:", the path, and any verbatim-required lines. Long inline briefs are gone. ([decision](decisions/epic-orchestration-dispatch-files.md))

## workbench 0.37.3: 2026-09-11

- **Place the PR Architecture section with the change description.** The conditional `## Architecture` section now sits immediately after the template's `Summary` / `What` / `Why` style sections and before verification, testing, checklist, release-note or footer sections, instead of being appended after the whole template. Existing template Architecture sections are still reused in place. ([decision](decisions/file-pr-architecture-section.md))
- **Act on the first failed check.** The `ci-watcher` returns at the first failed required check with the still-pending checks listed, and `fix-ci` starts the fix then instead of after the whole run finishes. Branch-only CI polls run jobs since `gh run watch` cannot fail fast. One snapshot right before pushing folds in further in-scope failures that appeared meanwhile. The two-attempt cap is now counted per failing cause. ([decision](decisions/fix-ci-act-on-first-failure.md))

## workbench 0.37.2: 2026-09-10

- **Use a local epic ledger for coordinator recovery.** Keep current actions, constraints and evidence pointers in one local entry point, with useful detailed records retained locally. Shared tracker updates carry concise tasks, decisions and outcomes; ledger retirement preserves outstanding work, holds and retained evidence. ([decision](decisions/epic-orchestration-artifact-lifecycle.md))
- **Show relevant module interactions in PR bodies.** Add a Mermaid graph under `## Architecture` when it clarifies architectural calls or interactions, even if the repository template omits that section. Preserve the original template, reuse an existing Architecture section, and omit unnecessary diagrams. ([decision](decisions/file-pr-architecture-section.md))

## workbench 0.37.1: 2026-09-10

- **Bound epic coordination reading and retire temporary instructions.** Dispatches name complete required reading sets and load supporting material for specific questions or checks. One current coordinator view replaces changed entries in place; lane closeout preserves contracts, dependencies, holds and audit evidence while retiring obsolete instructions from default reading. Validation and blind closing-audit requirements remain unchanged. ([decision](decisions/epic-orchestration-artifact-lifecycle.md))

## workbench 0.37.0: 2026-09-09

- **Preserve the verification procedures.** Keep evidence formats, design paths, review rubrics, and goal templates while correcting destructive recovery, repeated authorization, stale verification, and uncertainty handling. Expected TDD RED and obvious localized fixes no longer trigger systematic-debugging; persistent or unclear failures retain its four-phase investigation.
- **Delegate CI watching.** It always runs in a separate read-only agent: Opus on Claude, Sol on Codex, never Astra or Fable. Reports bind checks to the requested revision. The two-attempt fix limit and two-resync PR limit remain.
- **Use focused local checks for epic lanes.** Run focused local tests and mandatory gates, leaving full suites to PR CI unless specifically required. Every returned wave ends with verified acknowledgment and the next dispatch, delivery gate, closing audit, completion proposal, or concrete blocker. Mutation checks use disposable checkouts that preserve tests.
- **Keep proof opt-in and preserve evidence.** Retain corroboration protocols, distinguish unresolved findings from disproved ones, and retain valid code while establishing missing test evidence. ([decision](decisions/skill-wording-hardening.md))

## toolkit 0.10.0: 2026-09-09

- **Clarify dogfooding and recording authority.** Use me-human as a dogfooding perspective, make UI recordings opt-in, preserve visible application errors by default, and require existing authority for installs or uploads.
- **Preserve report and architecture templates.** Allow unsupported report fields to be omitted or marked unknown, require self-contained assets, and verify artifact paths. ([decision](decisions/skill-wording-hardening.md))

## workbench 0.36.0: 2026-09-04

- **`epic-orchestration` stops letting actionable work die in context.** The
  rule shipped as one non-negotiable about deferrals ("nothing lives only in a
  report"), which left out debt noticed in passing, follow-ups, and anything
  the orchestrator itself turns up while validating. It is now a section with a
  table of the five places such items surface, and the structural half that
  makes it stick: `DEBT + FOLLOW-UPS` is a required slot in the lane report
  format, so a lane fills it in or visibly leaves it blank. Each entry closes
  with a ticket id before the wave closes. Debt the epic's own fixes create is
  filed in the wave that created it.
  ([decision](decisions/epic-orchestration.md))

## workbench 0.35.0: 2026-09-04

- **`epic-orchestration` joins the process core.** The epic-owner role the
  operator had been running out of a private global skill (`epic-relay`) now
  ships: it writes the paste-ready lane prompts other sessions execute,
  validates each report against the repository rather than trusting it, and
  authorizes the PR without ever implementing, committing, or merging. The
  rename drops "relay", which named the transport rather than the job.
- **It is wired to the skills it was describing in prose.** Lanes run
  `code-quality-review` before handing back (dispatched, never self-served),
  and authorization files through `file-pr` with an explicit statement that its
  review gate is already satisfied, so no lane burns a second review pass on a
  diff that already had one. That wiring is why the skill lands in `workbench`
  rather than `toolkit`, which installs without it.
- **The validation section gets a rationalization table and red flags.** It is
  the step the whole pattern exists to defend and it shipped as bare
  imperatives, which `writing-skills` classifies as the wrong form for a
  discipline failure. Eight excuses are named, including the one the skill's
  own text manufactures: that the lane's `code-quality-review` covers it.
  ([decision](decisions/epic-orchestration.md))

## workbench 0.34.0: 2026-08-25

- **`handoff-goal` is user-invoked only.** It carries
  `disable-model-invocation: true`, like `self-audit`: whether work should
  outlive the session is the operator's call, so a session never packages a
  goal contract on its own judgment. The route pick still offers the option;
  choosing it is the user invoking the skill.
  ([decision](decisions/handoff-goal-user-invoked-only.md))

## workbench 0.33.0: 2026-08-25

- **The scope-language sweep.** A cross-cutting audit of all workbench
  skills and agents for text that bounds reading or root-causing.
  `test-driven-development` loses its "Scope boundary" section: "adjacent
  code → follow-up, not a fix here" sent a session that had traced a bug to
  its source elsewhere back to a symptom fix, against `systematic-debugging`.
  `code-quality-reviewer` no longer reviews "only what they show": the
  supplied sections define what is under review, and it reads whatever
  surrounding code it needs; cross-file tracing is unconditional.
  `pattern-reviewer` drops its one-reference-file reading cap, `fix-ci`
  drops "fix minimally ... nothing broader", and `handoff-goal`'s contract
  placeholder asks for actions to escalate, not "boundaries".
  ([decision](decisions/scope-language-sweep.md))

## workbench 0.32.0: 2026-08-25

- **`using-workbench` drops the scope guard.** Field sessions read "the
  accepted work defines the boundary" as a limit on reading, refused to trace
  causes into subsystems the ticket never named, and never reached the root
  cause. A rewrite that pinned the boundary to the diff tested clean but only
  added interpretation. Scope is the user's to define in the ask; a general
  guard cannot be stated precisely enough to avoid downgrading behavior, so
  the section is gone. The adversarial review's in-scope / out-of-scope
  finding labels are unchanged.
  ([decision](decisions/scope-guard-removed.md))
