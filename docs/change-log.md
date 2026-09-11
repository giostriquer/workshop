# Release Notes

Release notes for the shipped plugins (`workbench` and `toolkit`) newest
first, one section per released version. Strictly plugin releases: repo-only
work (structure, docs, tooling) lives in `docs/decisions/` and the git log,
not here. **Bounded:** at most 15 release sections: adding one past the cap
deletes the oldest (git history keeps everything). Sections from before the
2026-08-11 plugin split (`reviewers`, pre-split `toolkit`) were dropped in the
2026-08-12 reformat.

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

## workbench 0.31.0: 2026-08-20

- **`file-pr`'s review gate stops being negotiable.** The MUST gate shipped
  with two exemptions and nothing defending them, which `writing-skills`
  classifies as the wrong form for a discipline failure: a prohibition needs a
  rationalization table and red flags beside it. "Trivial, non-code, or
  documentation-only" becomes **the branch changes no code**, measured on the
  diff rather than on how routine the work felt, and "already ran for this
  work-stream" becomes **already ran on this diff**, since commits added since
  the review are unreviewed code.
- **Nine rationalizations and five red flags are named**, including the two
  `code-quality-review` already forbids that a session under pressure still
  reaches for: an author's own careful reading, and a self-served pass over
  its own diff. A closing sentence forbids everything else, deadlines and
  waiting reviewers and a direct "open the PR" included, and a
  spirit-versus-letter line at the top cuts off the rest as a class.
  ([decision](decisions/file-pr-gate-bulletproofed.md))
- **`metadata: system: workbench` is gone from all eight skills that had it.**
  No host or script read the field, and it sat on exactly half the set with no
  pattern separating the halves.
- `using-workbench` and `self-audit` no longer name `writing-skills`, which
  has left the plugins; an installed workbench cannot reach a repo-local skill.

## toolkit 0.9.0: 2026-08-20

- **`writing-skills` leaves the plugin** and becomes repo-local tooling
  alongside `change-log`, `push`, and `workbench-drift`. Toolkit ships no
  superpowers-derived piece any more, so its `LICENSE` loses the
  derived-portions clause and its README loses the attribution block; the MIT
  notice moves to the repository's root `LICENSE`, since the obligation
  follows the code.
  ([decision](decisions/writing-skills-moves-repo-local.md))

## workbench 0.30.0: 2026-08-20

- **Six descriptions stop summarizing what the skill does.** `writing-skills`
  carries a tested rule: a description that summarizes the workflow creates a
  shortcut the agent takes instead of reading the body. An audit of all sixteen
  workbench skills found six carrying post-fire protocol in the trigger, and
  `test-driven-development` was almost word for word the worked bad example
  that skill ships ("write test first, watch it fail, write minimal code,
  refactor").
- **`test-driven-development`, `fix-ci`, `self-audit`, `brainstorming`,
  `claim-check`, and `model-reference`** now state only when they fire.
  `fix-ci` and `self-audit` also stop opening with an imperative or a noun
  phrase. Nothing was deleted: every clause already lived in its skill's body,
  bar `model-reference`'s "a lookup, not a step before every dispatch", which
  moved into its opening. Exclusions stayed in the triggers, since they route
  between near-neighbour skills.
- **`verification-before-completion`'s trigger narrows** to the moment it
  fires, and its per-file attribution footer is dropped; the plugin `LICENSE`
  already names it among the superpowers-derived portions.
- `empirical-proof` and `qa-sweep` were left long on purpose: their bulk is
  routing between near neighbours, which is trigger work.
  ([decision](decisions/skill-descriptions-state-when-not-what.md))

## toolkit 0.8.2: 2026-08-20

- **`writing-skills` drops a paragraph of dangling pointers.** Its opening
  linked `../using-superpowers/references/codex-tools.md` and its Gemini
  sibling, neither of which exists in this package, so an installed copy
  pointed at nothing.

## workbench 0.29.0: 2026-08-20

- **`route-work` is now `model-reference`.** The old name named a verb the
  skill does not perform: it routes nothing and dispatches nothing, and three
  earlier trims exist because sessions kept reading it as a dispatch procedure
  to run before every fan-out. Those trims removed the rubric, the process
  patterns, and the output contract, but the name kept re-teaching what the
  body had stopped saying. Invoke it as `/model-reference`.
- **The model-floor invariant leaves.** It shipped the *shape* of a floor after
  an earlier note replaced a hard "never Haiku or Sonnet" with that portable
  form. A floor is still fleet policy, one abstraction up, and this skill
  carries none; `adopt-global-rules` ships a `model-floor.md` rules file, which
  is where a floor belongs. The operator-calibration paragraph and the
  cross-ladder caveat go with it, both restating a boundary the opening states
  once.
- **The table gets clearer and re-graded.** Axis definitions become a list
  rather than a paragraph, `taste` extends from "docs voice" to docs, research,
  and audits, and `gpt-5.6-luna` re-grades to 4 on taste and code. The
  orchestration invariant names the operator's rules file as the alternative to
  the session's own model.
- `adopt-global-rules`'s shipped `model-floor.md` pointed at
  `workbench:route-work` and now points at `workbench:model-reference`; a
  machine that already adopted it carries the stale pointer until the skill is
  re-run. ([decision](decisions/route-work-renamed-model-reference.md))
