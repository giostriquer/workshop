# Release Notes

Release notes for the shipped plugins (`workbench` and `toolkit`) newest
first, one section per released version. Strictly plugin releases: repo-only
work (structure, docs, tooling) lives in `docs/decisions/` and the git log,
not here. **Bounded:** at most 15 release sections: adding one past the cap
deletes the oldest (git history keeps everything). Sections from before the
2026-08-11 plugin split (`reviewers`, pre-split `toolkit`) were dropped in the
2026-08-12 reformat.

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

## workbench 0.28.0: 2026-08-20

- **`handoff-goal` is for long-running work only.** The description asked that
  a goal be *defined* (stateable up front, verifiable by checks that can fail)
  and never asked how long pursuit would take, so a small well-specified task
  passed the trigger and got a contract directory the session could have
  finished without. Definedness and duration are independent, and only the
  first was being tested. The trigger now leads with the constraint: a goal
  that must outlive this session, pursued over many turns, and not work this
  session can finish. The body says the same at the top of *When to use*, and
  the fit check's disqualifiers gain "work that fits in one session".
- **Both places that offer the route follow.** `brainstorming`'s route gate
  marks the handoff long-running-work-only, and `using-workbench`'s ownership
  row reads "a long-running autonomous goal, outliving this session". Critique
  mode is unaffected: auditing an existing contract has no duration test.
  ([decision](decisions/handoff-goal-long-running-only.md))

## toolkit 0.8.1: 2026-08-20

- **`ui-demo-video`'s trigger drops its protocol.** The description explained
  what the skill records and emits, and carried an instruction ("use the frames
  even when nobody asked for a video") that is not a firing condition at all.
  Both already live in the body. What is left is when it fires and what it is
  not: UI work verifiable visually in an app a browser can drive, never
  API-only changes and never a test suite.
- **`arch-map` drops "Formerly structure-view."** The rename note has done its
  work in the trigger; `docs/skills/arch-map.md` still records it for anyone
  searching the old name.

## workbench 0.27.0: 2026-08-20

- **`file-pr` now backstops the adversarial review instead of assuming it.**
  The skill described itself as landing rather than verification and assumed
  every completion gate had run, so a branch that reached it un-reviewed got
  filed. It now opens with a MUST: before filing, the branch diff has had the
  `code-quality-review` pass, dispatched to a reviewer that did not write the
  code; if it has not run, `file-pr` runs it and acts on the findings first.
  Two exemptions and only two: a trivial, non-code, or documentation-only
  branch, and a review that already ran for this work-stream. Every other gate
  is still assumed, and `using-workbench`'s landing line says so.
- **`file-pr` and `receiving-code-review` triggers name the ask.** "Always use
  before or to file/open a PR" and "always use when receiving any sort of code
  review feedback" replace the paragraph-long descriptions; what each skill
  does once loaded is unchanged and stays in the body.
- Usage pages follow, including the three that repeated "`file-pr` assumes the
  gates already ran".

## toolkit 0.8.0: 2026-08-20

- **`get-pr-comments` ships here again.** The skill is self-contained (one `gh`
  pass against the current branch's PR, read-only, no dependency on any
  workbench piece), which is the placement argument that predates the plugin
  split; the split had carried it into `workbench` without re-testing it. The
  text is unchanged, only its plugin is.
  ([decision](decisions/get-pr-comments-returns-to-toolkit.md))

## workbench 0.26.0: 2026-08-20

- **`get-pr-comments` leaves workbench, and no workbench text names it.** The
  flow's feedback stage is now `receiving-code-review` alone.
  `receiving-code-review`'s description drops its "pairs with get-pr-comments"
  sentence and its body states the stage without pointing outside the plugin;
  `using-workbench`'s flow diagram and ownership row follow. An installed
  workbench without toolkit no longer reads a pointer to a skill that is not
  there. Triage still happens when toolkit is installed; the flow does not
  depend on it.
  ([decision](decisions/get-pr-comments-returns-to-toolkit.md))
- **`audit`'s trigger names the ask, not the protocol.** The description packed
  the whole division of labor into the frontmatter (sizing, engine dispatch,
  uncertainty confirmation, exit routing), which is what the skill does after it
  fires, not what makes it fire. It now reads as the ask itself: use when asked
  to do an audit or check, with the one exclusion that still matters kept, that
  an idea to build goes to `brainstorming` instead. The protocol summary moves
  verbatim into the skill body's opening line, where the session reads it once
  the skill is already loaded.
- **`using-workbench`'s trigger names the moments it precedes.** "Use when
  starting any conversation to orient the session" became the work the
  orientation comes before: coding, auditing, planning, shipping, filing a PR,
  debugging, or reaching for any other workbench skill.
- Usage pages follow all three. Tiers, engines, gates, and exit routes are
  unchanged.

## workbench 0.25.0: 2026-08-19

- **The adversarial review is dispatched, never self-served.** Sessions were
  running the rubric over their own diff and reporting that as the gate, which
  the shipped text permitted: `using-workbench`'s Boundaries said workbench
  "never dictates execution agency", its ownership row pointed at the skill
  rather than the agent, and the usage page answered "inline or dispatch?" with
  "Either". `code-quality-review` now opens with *Who runs it*: a fresh reviewer
  context handed the diff and the changed files' contents, being the
  `code-quality-reviewer` agent or the host's equivalent. The implementing
  session holds every justification that produced the code, so the structure
  reads as inevitable rather than as a choice, and the code-judo move the rubric
  exists to find is what it is blindest to.
- **Agency stays the user's call everywhere else.** The boundary carves out this
  one exception instead of weakening, the hooks claim splits into its own bullet
  so the exception cannot be misread as covering activation, and the flow
  diagram and ownership row both say dispatched. Where a host offers no subagent
  mechanism, the diff goes to a fresh session and the report names that route.
  Rubric, timing, and the two outs are unchanged.
  ([decision](decisions/adversarial-review-is-dispatched.md))

## workbench 0.24.0: 2026-08-19

- **A repo's own completion gate now invites `empirical-proof`.** The skill
  said "never run it uninvited" and counted only the user as the inviter, so a
  session in a repo whose `AGENTS.md` requires booting the real app would have
  offered the run, waited, and shipped. Both trigger surfaces now name a repo
  process document that requires driving the real artifact as the standing ask
  it already was: run it, name the gate that invited it, and report the run as
  part of satisfying that gate rather than offering it first. Rigor once it
  runs is unchanged.
- **`using-workbench` states repo precedence once, and in both directions.**
  The rule lived scattered across `test-driven-development`,
  `code-quality-review`, and the two standing gates, and in every place it
  could only subtract ceremony. *At session start* now carries it plainly:
  follow the repo's own process document for worktrees, test discipline, and
  completion gates instead of re-running the flow's version, and let a repo
  gate invite a tier the flow would otherwise only offer. The three user gates
  and the adversarial review before PR-or-merge survive regardless, and the
  session names which of those it skips and why.
  ([decision](decisions/repo-gate-invites-empirical-proof.md))

## workbench 0.23.3: 2026-08-18

- **Skill and agent descriptions parse as YAML again.** `receiving-code-review`,
  `fix-ci`, `qa-sweep`, and the `code-quality-reviewer` agent carried an
  unquoted `description:` with a colon-space inside it, which YAML rejects
  ("mapping values are not allowed in this context") and hosts refused to
  load. Each is reworded, not quoted; the trigger text reads the same.
  The plugin validator now checks every shipped frontmatter for this class
  of defect. ([decision](decisions/frontmatter-plain-scalars.md))

## toolkit 0.7.2: 2026-08-18

- **Skill descriptions parse as YAML again.** `adopt-global-rules` and
  `arch-map` carried an unquoted `description:` with a colon-space inside
  it, which YAML rejects and hosts refused to load. Each is reworded, not
  quoted; the trigger text reads the same. The plugin validator now checks
  every shipped frontmatter for this class of defect.
  ([decision](decisions/frontmatter-plain-scalars.md))

## workbench 0.23.2: 2026-08-18

- **`code-quality-review` names its posture in the body, not the trigger.**
  The skill's description now carries only when it fires (a strict or
  adversarial code quality review, required once a work-stream's
  implementation is complete, right before PR-or-merge, never
  mid-implementation); the rubric's opening line states the review's focus
  and gains **pattern drift** alongside abstraction quality, maintainability,
  and codebase health. Usage page and plugin README follow the wording.
