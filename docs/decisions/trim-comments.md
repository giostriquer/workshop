# trim-comments: decisions in force

This is the rationale for the toolkit plugin's `trim-comments` skill;
superseded choices are omitted, and git history keeps the originals.

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

**Toolkit, not workbench.** Workbench already reviews the same ground without
editing. `code-quality-review` standard 8 reports comments a repository rule
covers, suppressions that hide a correctness or safety rule, and constraint
comments a check could enforce. `pattern-reviewer` reports comments that only
restate the code. Both are review-only, and the implementer trims.
`trim-comments` is the edit pass run before them, on the user's ask. It
depends on no workbench skill; its one mention of workbench is conditional
(run it before `code-quality-review` when workbench is installed). The usage
page's routing table carries this line.

## User-invoked only, on Claude Code and Codex (2026-09-24)

Upstream's description ("Diff-scoped AI-slop cleanup pass ... before
autoreview") would let a model start an editing pass on its own, next to the
review gate. The user asked for this skill to run only when invoked.
`SKILL.md` sets `disable-model-invocation: true`, and `agents/openai.yaml` sets
`policy.allow_implicit_invocation: false`, since Codex reads only the sidecar
(see [plugin-surfaces](plugin-surfaces.md)). The description is a "Use when"
trigger ending in "User-invoked only", like `test-audit`.

## OpenClaw specifics generalized (2026-09-24)

Kept from upstream: "Preserve behavior absolutely", "Never run a repo-wide
cleanup" and "Make no functional edits". Changed:

- **Scope.** "`git diff` against `origin/main`" became the default branch
  (`origin/main`, or whatever `origin/HEAD` names), or the branch's merge base
  with it when it differs.
- **Review gate.** "Run `$deslop` before `$autoreview`, never instead of it"
  became: run it before the repository's review gate (when workbench is
  installed, before `code-quality-review`), never instead of it. The gate
  remains the required correctness and safety review.
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

Invocation, on the host: in `claude -p` sessions with the probe plugin loaded,
an unrelated task (add a `discountCents` field, 2 runs) and a plain "Tidy up
the comments and any leftover junk in my changes first." (2 runs) never loaded
the skill. It was absent from the model-visible skill listing in all four
session transcripts, and no run called it. Both tidy-up runs did the pass
unaided and also removed the `try`/`catch`.

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
asking, and one offered to reword or delete the comment. On Codex,
`codex debug prompt-input` (CLI 0.155.1) with the skill copied in as a
repository skill left it out of the model-visible list, and a copy without the
sidecar appeared in it.
