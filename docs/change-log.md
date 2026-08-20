# Release Notes

Release notes for the shipped plugins (`workbench` and `toolkit`) newest
first, one section per released version. Strictly plugin releases: repo-only
work (structure, docs, tooling) lives in `docs/decisions/` and the git log,
not here. **Bounded:** at most 15 release sections: adding one past the cap
deletes the oldest (git history keeps everything). Sections from before the
2026-08-11 plugin split (`reviewers`, pre-split `toolkit`) were dropped in the
2026-08-12 reformat.

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

## workbench 0.23.1: 2026-08-16

- **The workbench copy now avoids em dashes without flattening the prose.**
  Skill, agent, plugin, and supporting documentation text was rewritten so
  each clause keeps its meaning through ordinary sentence structure instead
  of a glyph substitution.

## toolkit 0.7.1: 2026-08-16

- **The toolkit copy now avoids em dashes without flattening the prose.**
  Skill, template, reference, plugin, and supporting documentation text was
  rewritten so each clause keeps its meaning through ordinary sentence
  structure instead of a glyph substitution.

## toolkit 0.7.0: 2026-08-14

- **`adopt-global-rules` ships the communication guidance as a Claude output
  style.** The BLUF / Simplified Technical English section leaves
  `globals/CLAUDE.md` and installs as `bluf-ste` in
  `~/.claude/output-styles/`: the surface Claude Code built for it, and one the
  user can switch off. `globals/AGENTS.md` keeps the guidance inline because
  Codex has no equivalent. Output styles are a **third kind of pack content**
  (pack v3), declared per host and installed **never activated**: the run names
  `/output-style` and touches no settings. The installer now places a managed
  marker below leading YAML frontmatter, and rules and output styles share one
  whole-file install and directory scan, so collisions, orphans, and `--prune`
  behave identically in both.
  ([decision](decisions/adopt-global-rules-output-styles.md))

## workbench 0.23.0: 2026-08-13

- **New skill: `self-audit`.** A retrospective on **the process that ran the
  session**: the flow and its skills, never the code or the deliverable. It
  replays the session into a trace of facts first, then classifies each moment
  as *process defect* (yields a proposal), *session defect* (reported, no edit),
  or *clean*. The conversion rule keeps that split honest: an instruction the
  session reliably misses is a wording defect, not a discipline defect.
  Proposals must name one piece and one edit shape: wording, gate, boundary,
  new, delete, and clear a bar: the change would have altered this session or
  the next of its shape. No findings is a legitimate result. It reports and
  stops; the edit belongs to `writing-skills`. User-invoked only
  (`disable-model-invocation: true`), and deliberately absent from
  `using-workbench`'s ownership table; it sits outside the flow, looking back
  at it. ([decision](decisions/self-audit.md))

## toolkit 0.6.0: 2026-08-13

- **New skill: `me-human`.** Puts the session in the stance of a human user
  putting a system to real work: eager, learning by doing, reporting what got
  in the way. Three behaviors carry it: try before asking, escalate before
  declaring a blocker (investigate, make a targeted local change, report, and ask
  after two failed attempts), and stop at the scope edge rather than growing
  the work. It answers whether the thing is any good to use, while the
  verification pieces answer whether it works. The skill states the
  stance only: the target system, entry point, goal, and driving mechanism come
  from you at invocation. User-invoked only
  (`disable-model-invocation: true`). ([decision](decisions/me-human.md))

## toolkit 0.5.0: 2026-08-12

- **Renamed `agent-workshop` → `workshop`.** Install with
  `/plugin install toolkit@workshop` from `giostriquer/workshop`; the standalone
  installer is now `npx github:giostriquer/workshop`. **You must update
  `enabledPlugins` and `extraKnownMarketplaces` in your settings and re-add the
  marketplace**: the plugin namespace changed, and nothing detects that for you.
- **`adopt-global-rules` markers move to `<!-- workshop:rule … -->`.** Retired
  namespaces are recorded, so a machine that adopted `0.4.0` has its old blocks
  **rewritten in place** rather than duplicated. A marker rename that dropped its
  predecessor would make existing blocks invisible: orphan detection keys on the
  same pattern, and append a second copy of everything.
  ([decision](decisions/rename-to-workshop.md))

## workbench 0.22.1: 2026-08-12

- **Renamed `agent-workshop` → `workshop`** across the plugin manifests and
  attribution URLs. Install with `/plugin install workbench@workshop`. Same
  settings caveat as toolkit: the namespace change is not detected for you.
