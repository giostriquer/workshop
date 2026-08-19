# Release Notes

Release notes for the shipped plugins (`workbench` and `toolkit`) newest
first, one section per released version. Strictly plugin releases: repo-only
work (structure, docs, tooling) lives in `docs/decisions/` and the git log,
not here. **Bounded:** at most 15 release sections: adding one past the cap
deletes the oldest (git history keeps everything). Sections from before the
2026-08-11 plugin split (`reviewers`, pre-split `toolkit`) were dropped in the
2026-08-12 reformat.

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

## workbench 0.22.0: 2026-08-12

- **`route-work` drops the effort axis.** The table is now one row per model,
  graded at the effort that model is actually run at; re-grade a row rather than
  splitting it when your habitual effort changes. `grok-4.6` joins the fleet and
  `fable-5` is re-graded.
- **`speed` is a real axis, and `cost` shrank to make room.** Cost was defined as
  "subscription-limit burn **plus wall-clock**", so adding a speed column without
  touching it scored wall-clock twice. Cost is now burn alone; speed is
  wall-clock turnaround. A new reading note bounds it: speed breaks ties between
  level rows and never buys a drop on intelligence, taste, or code.
- **"Climb effort before hopping models" is gone**, along with the `sol
  low/medium` and `sol xhigh` rows it named. The *Standing escalation permission*
  invariant already covers rerunning a tier up, so nothing load-bearing went with
  it. The cross-ladder caveat was generalized off its old GPT-vs-Claude framing,
  which `grok-4.6` had broken.
- The frontmatter description advertised the old grain and omitted `speed`.
  Because it is the activation surface, it was corrected with the table rather than
  after it. ([decision](decisions/route-work-effort-axis-removed.md))

## toolkit 0.4.0: 2026-08-12

- **New skill: `adopt-global-rules`.** Installs the workshop's own shipped
  global agent configuration onto a machine **additively**: a per-host instruction document
  (`~/.claude/CLAUDE.md`, `~/.codex/AGENTS.md`) plus discrete rules (one marked
  file each in `~/.claude/rules/`, fenced blocks in `AGENTS.md`). The pack owns
  only what its `<!-- workshop:rule id=… -->` markers delimit; an unmarked
  file at a rule's path is reported as a collision and left exactly as found. It
  is user-invoked only (`disable-model-invocation: true`).
- **Global documents are authored per host, not derived.** `globals/CLAUDE.md`
  and `globals/AGENTS.md` are separate files because hosts want different things
  said: sandbox-escalation instructions are meaningless to one, a communication
  preference may not belong in the other. Rules are the opposite: one body fanned
  out everywhere. `--skip-globals` installs rules only.
- **Two entry points, one implementation.** The skill runs `adopt.mjs` from its
  own directory; `npx github:giostriquer/workshop` runs the same file
  through a root `bin/` shim, so a machine with no plugin installed can still
  bootstrap. The pack lives inside the skill directory because that is the only
  copy an installed plugin can reach.
- **The script does mechanics; the skill does judgment.** `--dry-run --json`
  returns the plan plus every byte of a single-file target sitting *outside* the
  pack's fences, verbatim: the skill reads that to answer what no script can:
  whether existing prose duplicates or contradicts a rule about to be installed.
- **Drift is fixed, not reported.** Managed blocks are pack-owned: a re-run
  overwrites a drifted block and prints the diff. Hand-maintained legacy fences
  (the same marker used to open and close) are recognised and migrated in place
  rather than duplicated. Rules whose precondition is unmet, such as an optional rule
  needing an MCP server that machine lacks, are skipped with a reason instead
  of installed as misleading dead weight.
  ([decision](decisions/adopt-global-rules.md))
- **`writing-skills` now fires on auditing an existing skill**, not just
  creating, editing, or verifying one: a distinct trigger that was falling
  through the description.
- **The edit is recorded rather than doomed.** This skill is mirrored
  byte-for-byte from upstream, so the next re-mirror would have silently erased
  the word. Its manifest entry keeps `disposition: mirrored` and gains a
  `localDeltas` list; `drift-check.mjs` prints those under the Re-mirror heading:
  it previously showed only paths and a file count, making a recorded delta
  invisible at the one moment it matters, and `workbench-drift` makes
  re-applying them part of the re-mirror. Flipping to `adopted` was rejected: it
  reopens the fork that caused the earlier dangling-pointer defect.
  ([decision](decisions/mirrored-pieces-local-deltas.md))

## workbench 0.21.0: 2026-08-12

- **`brainstorming` gains a three-path classifier.** Before the first question it
  now sorts the request into **spike** (a feasibility question whose output is an
  answer, not code), **bounded** (a well-scoped change to a flow already in the
  repo), or **architectural** (new subsystems, restructuring, interfaces others
  depend on), and says the classification out loud so you can override it. Each
  path carries its own checklist. The point is that a one-file fix stops
  receiving the ceremony designed for a new subsystem.
- **Two rules keep it honest.** Bounded measures the repo, not the session's
  familiarity: if there is no existing flow to change, the task is architectural.
  And the ratchet is one-way, when torn take the heavier path, hidden complexity
  upgrades mid-task, nothing downgrades. A red-flags table names the
  rationalizations that break each rule.
- **The approval gate does not scale.** A two-sentence design is still presented
  and still waits for a yes; what shrinks with simplicity is the artifact.
- Adopted from upstream and retargeted on the way in: every path ends at the
  workbench **route gate** rather than upstream's `writing-plans` (a dropped
  piece), a spike ends at a recommendation with no route pick, and the
  After-the-Design section is scoped to the architectural path so bounded work
  never writes a design doc. Upstream's `"You MUST use this before any creative
  work"` description was ignored; that is the compulsion framing this fork
  removes.
  ([decision](decisions/brainstorming-three-paths-adopted.md))

## toolkit 0.3.0: 2026-08-12

- **`writing-skills` is now mirrored from upstream byte-for-byte**, at
  `b36e082`, including the `examples/` directory the earlier partial port left
  behind. That omission was the cause of the dangling
  `examples/CLAUDE_MD_TESTING.md` pointer: the file was valid upstream all
  along, so the fork was the bug.
- **Two fixes arrive with the mirror.** The worked test-campaign example
  resolves again, and `render-graphs.js` picks up upstream's Windows-safe
  graphviz probe: ours still ran `execSync('which dot')`, which upstream had
  already replaced precisely because `which` is not a command on Windows.
- **Accepted cost, recorded rather than hidden:** the verbatim copy carries five
  `superpowers:`-namespaced references and one link to `../using-superpowers/`,
  a dropped piece. Those six resolve to nothing in an installed environment.
  Fidelity to upstream was chosen over local correctness; the skill's usage page
  says so.
- **The drift manifest gains a `mirrored` disposition.** `drift-check.mjs`
  branched on `adopted` and sent everything else to the dropped/FYI bucket, so
  the new label would have made future reviews silently skip this piece; it now
  reports a Re-mirror section, and `workbench-drift` states that mirrored pieces
  bypass the adaptation filter. The reviewed-commit pin was deliberately **not**
  advanced: `brainstorming` has unreviewed upstream changes, and an advanced
  pin would assert they had been seen.
- Unchanged: the description contradiction inside `anthropic-best-practices.md`.
  That file is byte-identical to upstream, so it is upstream's defect; mirroring
  neither causes nor fixes it.
  ([decision](decisions/writing-skills-mirrored-verbatim.md))

## workbench 0.20.12: 2026-08-12

- **`empirical-proof` no longer absorbs exploratory runtime work.** It was the
  only skill in the flow that says "drive the running app," and its `NOT for`
  list didn't exclude hunting for unknown bugs, so that work landed here and
  inherited a gate and verdicts built for proving one finished change. Both
  trigger surfaces now exclude it, and the body explains the misfire rather
  than just prohibiting it. Exploratory driving gets no new skill: it is
  ordinary session work, per `using-workbench`'s standing rule that when no
  frame fits, you keep the standard and drop the frame.
- **Launching the app is in scope; `blocked` is demoted to last resort.** The
  gate read "make **one clean start attempt**… Anything beyond it is not yours
  to do… Fixing local setup is out of scope by design," which made a single
  launch hiccup terminal. It now covers everything the project's docs prescribe
 (install, example env, build, dev server) plus a clean retry, and states
  that a fresh worktree or clean install is ordinary setup, not environment
  fabrication. "One failed launch is not a blocked verdict; a documented path
  you have actually exhausted is." The closing Rules recap was corrected to
  match, having restated the old "one documented start attempt at most."
- **Unchanged on purpose:** the "Do not conjure the environment" prohibition.
  Stubbing a listener, faking an env var, or editing a boot check is still
  forbidden, and repairing the machine is still out of scope. The fix separates
  *don't fabricate dependencies* (kept) from *don't try twice to start the app*
  (removed).
  ([decision](decisions/empirical-proof-stops-absorbing-exploration.md))
