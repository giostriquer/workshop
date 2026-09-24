# trim-comments: decisions in force

This is the rationale for the workbench plugin's `trim-comments` skill and its
`comment-trimmer` agent; superseded choices are omitted, and git history keeps
the originals.

## Port OpenClaw's deslop into toolkit (2026-09-24)

`trim-comments` began as a port of OpenClaw's repo-local `deslop` skill,
[openclaw/openclaw](https://github.com/openclaw/openclaw)
`.agents/skills/deslop/SKILL.md` at commit `203aafc` (2026-08-16), MIT,
Copyright (c) 2026 OpenClaw Foundation. Upstream is a diff-scoped,
behavior-neutral cleanup pass run before review. It looks for comment slop,
abnormal defensive checks and `try`/`catch`, type-laundering casts, redundant
one-use helpers and variables, unowned shims and fallbacks, and style drift,
fixes only trivial behavior-neutral items inline, and reports the rest. The
port kept that checklist and its order. The same day it was narrowed to
comments and renamed; see
[Comments only, renamed trim-comments](#comments-only-renamed-trim-comments-2026-09-24).

**Inclusion bar.** `AGENTS.md` asks for lived-in proof from a substantial
project before a piece is added. This one has none in this repository's own
projects: the user requested it directly, and that request is the basis for
adding it. OpenClaw's use of `deslop` in its own review flow is the only field
record behind it.

**Where it ships.** It first shipped in toolkit 0.12.0 as a user-invoked pass,
and moved into workbench as a delivery stage in 0.43.0; see
[Moved into workbench as a delivery stage](#moved-into-workbench-as-a-delivery-stage-2026-09-24).

## OpenClaw specifics generalized (2026-09-24)

Kept from upstream: "Preserve behavior absolutely", "Never run a repo-wide
cleanup" and "Make no functional edits". Changed:

- **Scope.** "`git diff` against `origin/main`" became the default branch
  (`origin/main`, or whatever `origin/HEAD` names), or the branch's merge base
  with it when it differs.
- **Review gate.** "Run `$deslop` before `$autoreview`, never instead of it"
  became: run it before the review round (`code-quality-review`, plus
  `test-quality-review` when logic or tests changed), never instead of it. The
  round runs on the trimmed diff and remains the required correctness and
  safety review.
- **Report.** Upstream's "1–3 sentences" limit stays, written out as "1 to 3".
  It has a recipe (one sentence each for what changed, what is left, and any
  encoding offer as a question) and an example in a different domain from the
  probe fixtures. With upstream's bare limit, the port's first draft wrote five
  to nine sentences, two runs of it with bullet lists; see
  [Probes of the port](#probes-of-the-port-2026-09-24).

## Two rules from pstack's comment trim (2026-09-24)

Lauren Tan's pstack (`pstack/`, MIT, Copyright (c) 2026 Lauren Tan, in
[cursor/plugins](https://github.com/cursor/plugins)) trims comments with a
`no-comments` skill and a `comment-sicko` agent. Two of its rules close gaps
that upstream `deslop` leaves open:

| Taken | Source (commit) | Where it landed |
| --- | --- | --- |
| A constraint comment (`do not remove`, `do not change wording`, `talk to X before changing`) is never deleted silently. Offer the cheapest in-scope type, runtime check, test or lint rule, wait for approval, and if approved encode it, then delete the comment | `pstack/skills/no-comments/SKILL.md` step 5 (`e8d856f`) | Constraint comments section |
| A lint or type suppression that silences a rule protecting correctness or safety is reported, never kept silently | `no-comments` step 2 (`e8d856f`), `pstack/agents/comment-sicko.md` (`99559f2`) | Suppressions section |

One step differs from pstack. When the user declines the encoding, pstack
deletes the comment and reports the constraint open. Here the comment stays and
the constraint is reported open, because deleting it without the user's
approval would lose the only record of the rule.

## Comments only, renamed trim-comments (2026-09-24)

The user asked for the skill to be "more focused around comments itself", with
a name to match. The skill now edits comments and nothing else, and is renamed
from `deslop` to `trim-comments`, which names what it does.

**Why comments only.** A pass that edits only comments has a contract anyone
can check in its diff: no code line changes. Upstream's code-level checks
(defensive checks and `try`/`catch`, casts, one-use helpers, shims and
fallbacks, style drift) needed the pass to judge whether each code edit was
behavior-neutral, and that judgment is the review gate's job. The comment
categories are now spelled out as a remove list: narration and restating prose,
syntax explanation, banners and dividers, commented-out code, comments the
diff made wrong, and workaround sermons. Scope covers the lines the diff adds
or changes plus any comment the diff made wrong, because a stale comment
usually sits on an unchanged line next to the changed code.

**What moved to code review.** The code-level checks left the skill. The usage
page's routing table sends code-level slop to workbench's
`code-quality-review`, and sets out the comment line: `code-quality-review`
standard 8 reports comments a repository rule covers, correctness-hiding
suppressions and enforceable constraint comments; `pattern-reviewer` reports
comments that restate the code; `trim-comments` is the edit pass before both.
Suppressions changed with this: a correctness-hiding suppression now stays in
place and is reported with the rule's fix, never fixed inline, since the fix is
a code edit.

**What pstack contributes now.** Comment Sicko's keep-list, which the port
left out, is the skill's keep list, adapted:

| Comment Sicko (`99559f2`) | trim-comments |
| --- | --- |
| Legal or license headers | License and copyright headers |
| Non-obvious behavior forced by an external dependency, platform, vendor, or protocol we cannot reshape | The same, as "something outside the repository's control" |
| Doc comments that define a public API contract | The same |
| Issue or RFC links that explain a constraint code cannot express | The same |
| `// prettier-ignore`; lint suppressions whose rule is faulty, pedantic, or style-only | Formatter and tool directives such as `prettier-ignore`; suppressions of style-only rules |

Its opening list of targets ("narration, banners, commented-out corpses,
workaround sermons") also fills out the remove list. Its idea of marking the
code a sermon excused (`MUST KILL`) survives without that vocabulary: the
report names the code a removed sermon defended, for the author to reshape.

Not taken: the persona, "when I am not sure a keep clause applies, the comment
dies", the rule that surprises in our own code die with a reshape flag, the
`/how`, `/why` and `/architect` hand-offs, and `MUST KILL` as a label. Here a
comment on neither list stays, so a note on why an internal choice was made
survives, as it does in `pattern-reviewer`'s own keep list.

**The repository's rules win.** Where `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING`
or an equivalent says which comments to remove or keep, it overrides both
lists, as `code-quality-review` standard 8 and `pattern-reviewer` already
defer to repository comment rules.

**Probes.** These are bounded regression evidence, not a reliability
estimate. Every run was a fresh context on `claude-opus-5-5` with the user's
normal configuration, in its own copy of an invented `webapp` checkout: `main`
pushed to a local bare `origin`, and a `feat/order-csv` branch whose diff holds
a narrating comment, a banner, a commented-out tax line, a comment from `main`
that the diff's free-shipping change made wrong, an SPDX license header, a
vendor-quirk comment with an issue link, a `do not reorder these columns: talk
to the billing team` constraint comment whose only test counts columns, an
`eslint-disable-next-line @typescript-eslint/no-floating-promises` over an
async audit call that rejects on an empty order id, an
`eslint-disable-next-line camelcase` over a vendor field name, and a
`try`/`catch` that only rethrows. A narrating comment from `main` sits outside
the diff. Skill runs were `claude -p "/trimprobe:trim-comments"` with a probe
plugin copy loaded through `--plugin-dir` (3), or a subagent told the user had
typed `/trim-comments` and pointed at the skill file (3). Controls got "Trim
the comment slop from my branch's changes before I send it for review." with no
skill; the Port column is the port's shipped text, before this change.

| Question | No skill (2) | Port (2) | `trim-comments` (6) |
|---|---|---|---|
| Removes the narration, banner, commented-out line and stale comment | 2 | 2 | 6 |
| Keeps the license header, vendor comment and link, and style-only suppression | 2 | 2 | 6 |
| No code line changed; the `try`/`catch` still there | 2 | 0 | 6 |
| Nothing outside the diff touched; the `main` comment still there | 2 | 2 | 6 |
| Keeps the correctness suppression and reports it with the rule's fix | 2 | 1 | 6 |
| Constraint comment kept, encoding offered as a question, nothing encoded | 0 | 2 | 6 |
| Report of at most three sentences, in prose | 0 | 0 | 6 |

The controls' comment edits were right, but they asked nothing about the
constraint comment and wrote multi-section replies with headings and lists.
Both Port runs removed the rethrow-only `try`/`catch` and wrote four
sentences, and one named the unhandled rejection without the fix. Continuing
two skill runs exercised the approval path: after "Yes, do that", the run added
a test pinning the header and column order and then deleted the constraint
comment; after "No, leave the tests as they are", the comment stayed and the
run reported the constraint as open.

Not probed: the workaround-sermon rule, a repository with its own comment
rules, suppressions in languages other than TypeScript, and Codex, Cursor,
Antigravity and OpenCode behavior.

## Probes of the port (2026-09-24)

The port's own probes, on the broader checklist, are kept for the rules that
carried over. Every run was a fresh context on `claude-opus-5-5`, in a copy of
the same invented `webapp` checkout with an earlier diff: a narrating comment,
a `// do not remove: the upstream parser needs this order` comment whose only
test counts columns, an unneeded `as unknown as` cast, a rethrow-only
`try`/`catch`, a one-use helper, the same floating-promise suppression, and an
early return for empty orders that also drops shipping.

| Question | No skill | First draft | Report recipe |
|---|---|---|---|
| Edits only inside the diff | 2 of 2 | 3 of 3 | 6 of 6 |
| Keeps the suppression and reports it with the rule's fix | 2 of 2 | 3 of 3 | 6 of 6 |
| Constraint comment kept, encoding offered as a question, nothing encoded before approval | 0 of 2 | 3 of 3 | 6 of 6 |
| Report of at most three sentences, in prose | 0 of 2 | 0 of 3 | 4 of 6 |

The report recipe column covers two rounds of three runs: the recipe with its
example, then the text with "one sentence per part" (2 of 3 within three
sentences in each round). The runs that missed the letter wrote four sentences
in prose. Both controls changed the CSV test to pin the exact row without
asking, and one offered to reword or delete the comment.

## Moved into workbench as a delivery stage (2026-09-24)

The user asked to "move trim-comments into workbench as part of our delivery
process, similar to how test-quality and code-quality already behave". The
skill moved from `plugins/toolkit/skills/` to `plugins/workbench/skills/`,
gained a dispatched agent, `comment-trimmer`, and became a default-on stage
between verification and the review round. The agent has no note of its own;
this section is its rationale.

**Dispatched, never self-served.** The session that wrote the diff wrote its
comments too, so its narration reads as explanation and its stale comments
read as current: the same blindness that makes `code-quality-review` a
dispatched review. `comment-trimmer` loads the skill as its rubric and edits
comment lines only. It never commits, stages or pushes, and never applies an
encoding. Unlike the read-only reviewers it has `Edit`. Its report follows the
skill's step 7 recipe and ends with `## Trim: DONE | NOTHING_TO_TRIM |
BLOCKED`, in the form of the reviewers' verdict lines. Its one dispatch input
is the base branch or diff range; a scope-folder input in the first draft had
no use and is gone. When the user invokes the skill directly, a session that
wrote the diff dispatches the agent the same way, and any other session
applies the checklist.

**The pre-edit check runs against a copy.** Before its first edit to a file,
the agent copies that file to its repository-relative path inside one
`mktemp -d` directory outside the repository, and no copy means no edit. The
mirrored path matters: in a flat directory two files that share a name
(`src/a/index.ts`, `src/b/index.ts`) would overwrite each other's copy, and a
restore could write one file over another. The directory is removed once every
edit is verified or restored, and kept, with its path reported, only when a
restore fails. Before returning it diffs each edited
file against its copy, and it puts any line that is not a comment-only change
back as the copy has it. A first draft let it choose between `git diff` and the
copy; under `git diff`, "undo any other change" could revert the author's
unstaged code in a file the trim also touched, so the check and every undo now
run against the copy only. A comment-only change is defined the same way in
the agent and in the skill's step 6: a line that differs from its original
only in comment text, its code tokens identical (a trailing comment removed
from a code line included), a deleted whole-line comment, a changed line
inside a block comment, or a blank line deleted with the comment it set off.
The blank-line case came from the probes below: three of five runs deleted the
blank line a removed banner left doubled, and one reported it as outside the
definition, so the definition now names it. On `BLOCKED` the agent restores every file it edited
from its copy and says so, so a stopped trim leaves no half-applied edits.

**The parent's side lives in the skill.** On Claude Code the dispatching
session reads the skill, never the agent file, so the skill's *Who runs it*
carries what the parent does with the result: a report without a `## Trim:`
line reads as `BLOCKED`; after `BLOCKED` the session fixes the cause and
re-dispatches once, or asks the user; and a host without subagents takes
`code-quality-review`'s fresh-session route, which the skill names without
restating.

**Before the review round, never instead of it.** The trim changes the diff.
Reviewing first would spend the reviewers on comment noise about to disappear
and leave the trim's edits unreviewed, so the round runs on the trimmed diff,
and `code-quality-review` standard 8 now reports what the trim left, keeping
its `pattern-reviewer` cross-reference. The skill says this in the second
paragraph of *Who runs it*; a separate closing section that repeated it is
folded in there.

**One revision for the whole round.** The agent never commits, but
`code-quality-reviewer` gathered `git diff <base>...HEAD`, which leaves out
uncommitted edits, while `test-quality-review` reads the working tree against
the merge base plus untracked files, so one round could review two revisions,
and `epic-orchestration`'s "trimmed range" did not exist until a commit. Both
reviewers now read the working tree against the merge base, untracked files
included. Where the work is delivered as commits (an epic lane, whose RANGE
and pinned head must include the trim, or a session that has already
committed its work under its existing authority), the dispatching session
commits the trim's edits as their own comment-only commit, following the
repository's conventions, before the round. The author's own changes are committed before the trim is
dispatched, so the trim's commit stays comment-only, and the session confirms
that from `git show`. Otherwise the edits stay in the
working tree, where both reviewers read them. No commit is added where the
session has no commit authority. The skill's *Who runs it* states this once;
`epic-orchestration`'s completion-review bullet and the lane report's `REVIEW`
field point there.

**Late trims and corrections.** When a session reaches `file-pr` with only the
reviews done, the trim runs then; its edits are comment-only, the session
confirms that from the diff, and the round keeps covering the revision. A
correction batch is not re-trimmed: its comments are the implementer's ordinary
editing, and the focused correction review's standard 8 still reports the three
kinds it covers (comments a repository rule governs, correctness-hiding
suppressions, enforceable constraint comments), not narration. Both rules sit once
in the skill's *Who runs it*, and `file-pr` points there from its exemption
for a revision the review already covers.

**Default-on, with the review's outs.** The trim is required exactly like the
reviews: only the user's explicit decline or a superseding repository process
skips it, and a small diff, confidence or time pressure do not. The rule is
stated once, in `using-workbench`'s completion requirements, and
`trim-comments`, `code-quality-review`, `file-pr` and `epic-orchestration` name
the stage or point there. The description is a completion-stage trigger (the
full agreed work set verified and about to ship, before the review round) or a
direct ask. Its carve-out, in both the skill's and the agent's description,
reads "Never fires on its own mid-implementation, where tidying your own
comments is ordinary editing": a bare "Never mid-implementation" contradicted
the direct ask, and the reason came only from the body, which a parent sees
after it has decided. The body keeps its own line. `disable-model-invocation`
is gone, the Codex sidecar allows implicit invocation, and the earlier
user-invoked-only section is removed as superseded.

**Untracked files are in scope.** Checklist step 1 now adds untracked files
(`git ls-files --others --exclude-standard`) to the `git diff` scope, the
same scope `test-quality-review` resolves, so a new source file the author has
not staged is trimmed like any other changed file.

**Code comments only.** The scope step, the description, the agent contract
and the usage page's first paragraph each say in a clause that the pass covers
comments in source and config files (`//`, `#`, `/* */`, doc comments,
suppression directives), never PR, review, issue or tracker comments, commit
messages, or prose documents such as Markdown. Workbench sessions also meet
PR-comment rules (`get-pr-comments`, and the shipped globals' approval rule for
posting comments), so a bare "comments" could be misread. Most readers already
take it this way; the clauses remove the ambiguity rather than change
behavior.

**Encoding offers go to the outline gate.** The agent cannot wait for an
answer, so it returns each constraint-comment offer and leaves the comment in
place. The dispatching session carries the offers into the PR-or-merge outline
the user already sees, and tells the user that an approved encoding takes a
follow-up review pass. An approved encoding (a test or a type) is implemented
as a correction and goes through `code-quality-review`'s bounded correction
review; a declined one leaves the comment and reports the constraint open. When the skill was invoked directly outside the completion
stage there is no outline gate, so the session asks the user right away.

Two channels could own the same constraint comment: the trim's offer and
`code-quality-review` standard 8, which flags an enforceable constraint
comment. The session names the open offers in the review dispatch, and
standard 8 notes such a comment instead of raising it again as a finding.
Epic lanes record the trim's result line and open offers in the lane report's
`REVIEW` field; the owner sends the offers to the operator with the
authorization, and an approved one returns to the lane as a correction
dispatch.

**Model pin.** `model-reference`'s test-quality exception now names
`comment-trimmer` beside `test-quality-reviewer`, one section at one tier:
Opus at `xhigh` on Claude Code through the agent's frontmatter, `gpt-6-sol` at
`xhigh` on Codex through its Dispatch line, spawned without the parent's
history, and the host's default model elsewhere.

**Probes.** Bounded regression evidence, not a reliability estimate; every run
was a fresh context on `claude-opus-5-5`. The parent probes were plan-only:
subagents role-playing a Claude Code parent, or a Codex CLI 0.155.1 parent with
`spawn_agent`, read the plugin from a snapshot and wrote the exact tool calls
they would make for ticket `ABC-123` in an invented `webapp` repository. The
0.42.0 column read the snapshot from before this change.

| Question | 0.42.0 wording | This wording |
|---|---|---|
| Claude Code parent, work verified, PR already requested: dispatches `comment-trimmer` first, then the review round on the trimmed diff | 0 of 2 (both called standard 8 the trim) | 3 of 3 |
| The same parent passes no model to any agent | 2 of 2 | 3 of 3 |
| Codex parent, same moment: spawns `comment-trimmer` first with the contract pasted, `gpt-6-sol`, `xhigh`, `fork_turns: "none"` | not run | 3 of 3 |
| Mid-implementation (two tests red, a function unstarted, "keep the diff tidy"): no trim dispatched | not run | 6 of 6 |
| Mid-implementation: tidies its own new comments as ordinary editing | not run | first draft 0 of 3, final 3 of 3 |
| `file-pr` asked to file after both reviews passed, no trim, no decline: runs the trim first | 0 of 2 | 3 of 3 |
| `file-pr`, same case: keeps the reviews as covering the comment-only trim | not applicable | 3 of 3 |

The first draft said only that the stage is dispatched and never runs
mid-implementation. All three of its mid-implementation parents read that as
forbidding their own comment edits and left the narration for the completion
trim despite the user's "keep the diff tidy". The skill now says that
mid-implementation, tidying your own comments is ordinary editing, not this
stage, and all three final runs cleaned their comments by hand and still
dispatched the trim at completion.

The agent probes ran it for real: `claude -p --agent` with a probe copy of the
agent and skill loaded through `--plugin-dir`, each run in its own copy of the
`webapp` fixture from the sections above plus an untracked `docs/orders.md`
holding an HTML comment and a quoted PR review comment. The prompt gave the
base branch, a scope folder, and the probe plugin's directory, since a probe
copy is not the installed plugin. A first round without read access to that
directory returned `## Trim: BLOCKED` 3 of 3 with no edits, which exercised the
blocked path.

| Question | Report as drafted (3) | Report recipe (3) |
|---|---|---|
| Removes the narration, banner, commented-out tax line and stale comment | 3 | 3 |
| Keeps the license header, vendor comment and link, constraint comment, both suppressions, the out-of-diff comment and the `try`/`catch` | 3 | 3 |
| Changes comment lines only (7 deleted, none added), in `src/summary.ts` only, and commits or stages nothing | 3 | 3 |
| Leaves `docs/orders.md` untouched | 3 | 3 |
| Reports the floating-promise suppression with the rule's fix | 3 | 3 |
| Returns the encoding offer as a question and writes no test | 3 | 3 |
| Ends with `## Trim: DONE` | 3 | 3 |
| Report of at most three sentences, in prose | 0 (200 to 250 words, bullets in 2) | 3 (100 to 119 words) |

The drafted Output section listed the report's parts without the step 7
recipe; it now names the recipe, and the runs met it.

**Probes of the review fixes.** An independent code-quality review of the
change found the revision split, the `git diff` undo, and the gaps the
sections above now close. The fixes were probed with the same bounded,
fresh-context method; the pre-fix column ran the wording before these fixes.
The agent runs used `claude -p --agent` with a probe copy of the agent and
skill through `--plugin-dir`, user settings off, in the invented `webapp`
fixture: `feat/order-csv` committed, plus the author's unstaged code fix in
`src/summary.ts` (express shipping from `12` to `15` on a line with a trailing
narrating comment, and a new empty-order guard). The probe copy adds `Skill`
to the agent's tools: without it the agent reads the installed plugin's
`SKILL.md`, and the installed workbench on the probe machine predates the
move, so a first round blocked 4 of 5 with no edits and one run used the old
toolkit copy of the skill.

| Question | Pre-fix wording | This wording |
|---|---|---|
| Agent run: every edit is a comment-only change | 2 of 2 | 5 of 5 |
| Agent run: the author's unstaged code (`15`, the guard) survives | 2 of 2 | 5 of 5 |
| Agent run: three trailing comments removed, their code lines intact | 2 of 2 | 5 of 5 |
| Agent run: checks against a copy outside the repository; nothing committed or staged | 2 of 2 | 5 of 5 |
| Agent run: that copy sits in a fresh `mktemp -d` directory | 0 of 2 (a sibling folder; a fixed `/tmp` path) | 5 of 5 |
| Forced `BLOCKED` after edits: every edited file restored from its copy, and the report says so | not run | 2 of 3 |
| Lane parent, work committed, lane may commit: trim first, its own comment-only commit, then both reviewers on that commit | 2 of 2 | 3 of 3 |
| Same parent: the open offer named in the code-quality dispatch as one to note, not raise | 0 of 2 | 3 of 3 |
| Parent whose user committed the work and forbade commits: no commit, both reviewers on the working tree | 2 of 2 | 3 of 3 |
| Mid-implementation parent holding only the descriptions: no trim dispatched, tidies its own comments when asked | 2 of 2 | 3 of 3 |

The pre-fix agent runs both chose the copy, because the file had uncommitted
work, so the `git diff` undo did not show, though one put its copy at a fixed
`/tmp` path that concurrent runs would share; that fix rests on the review's
reading of the text, as the revision split does: every plan-only parent in
both columns handed both reviewers a diff that held the trim, while the
failure sat in `code-quality-reviewer`'s own gathering step, which a parent
that supplies the diff never reaches. Three of the first five agent runs also
deleted the blank line a removed banner left doubled, and one reported it as
outside the definition, which is why the definition now names that case; the
last two runs, on the final wording, deleted it within the definition. To
force `BLOCKED` after edits, a hook stopped each run once both files carried
trim edits, the skill file was made unreadable, and the session resumed with
word that the plugin had been reinstalled and the skill needed loading again.
Two runs returned `BLOCKED` with both files back to their pre-run bytes, the
author's unstaged code included; the third found the old toolkit copy of the
skill installed on the probe machine, used it, and finished `DONE` with
comment-only edits. An earlier variant that made the file unreadable without a
restart forced nothing: the `Skill` tool served its cached copy 3 of 3.

Not probed: a real Codex spawn, Cursor, Antigravity and OpenCode; the approval
path from the outline gate through the correction review; a direct invocation
outside the completion stage, where the session asks right away; and a live,
rather than plan-only, epic lane.
