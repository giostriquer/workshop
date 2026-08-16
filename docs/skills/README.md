# Skills handbook

Usage pages for every skill shipped in a plugin: what each one does, when to
reach for it, what surprises people, and how to tell it worked.

**What these pages are not.** They are not rationale, history, or design
records. When you want to know *why* a skill is shaped the way it is, read
[`docs/decisions/`](../decisions/), which is where the arguments and the field
failures live. These pages answer the reader's question ("should I use this,
and how?"), not the maintainer's ("why is it like this?").

The spec is always the authority. A `SKILL.md` is the whole artifact; if a page
here ever disagrees with the skill it documents, the skill wins and the page is
wrong.

## Two plugins

**`workbench`** is the process core: how work enters, gets scoped, gets built,
and lands. Start with [using-workbench](using-workbench.md), which maps the
whole flow and tells you which piece owns which moment.

**`toolkit`** is optional. Six utilities you install alongside workbench when
you want them, and skip to keep sessions lean.

## Find the skill by the moment

| The moment | The skill |
| --- | --- |
| Getting oriented; "which skill do I use for X?" | [using-workbench](using-workbench.md) |
| Something to verify, hunt, or check | [audit](audit.md): sizes it, then dispatches an engine |
| One premise, ticket, or hunch to settle | [claim-check](claim-check.md) |
| A broad surface worth team-scale coverage | [qa-sweep](qa-sweep.md) |
| Designing a feature or a refactor | [brainstorming](brainstorming.md) |
| A goal a fresh session should pursue alone | [handoff-goal](handoff-goal.md) |
| Implementing where a test harness exists | [test-driven-development](test-driven-development.md) |
| A bug, before proposing any fix | [systematic-debugging](systematic-debugging.md) |
| About to claim something is done | [verification-before-completion](verification-before-completion.md) |
| Proving one finished change at the running app | [empirical-proof](empirical-proof.md) |
| The adversarial pass before PR-or-merge | [code-quality-review](code-quality-review.md) |
| Picking a model | [route-work](route-work.md) |
| Turning a branch into a PR and seeing it green | [file-pr](file-pr.md) |
| CI is red | [fix-ci](fix-ci.md) |
| Review feedback arrived | [get-pr-comments](get-pr-comments.md) → [receiving-code-review](receiving-code-review.md) |
| Looking back at how the process itself ran | [self-audit](self-audit.md) |

## The optional toolkit

| What you want | The skill |
| --- | --- |
| A report rendered as a polished HTML page | [html-report](html-report.md) |
| An architecture map derived from the code | [arch-map](arch-map.md) |
| A recorded walkthrough of UI work, with frames the model reads back | [ui-demo-video](ui-demo-video.md) |
| To write or edit a skill | [writing-skills](writing-skills.md) |
| To install the workshop's global CLAUDE.md / AGENTS.md and rules on a machine | [adopt-global-rules](adopt-global-rules.md) |
| To use a system as a real human user and report what got in the way | [me-human](me-human.md) |

## Two things worth knowing up front

**Almost nothing here is compulsory.** Skills fire on relevance, not on
obligation. The exceptions are the two default-on completion gates:
`verification-before-completion` at every done-claim, and `code-quality-review`
once an implementation is complete. Each stops only for an explicit decline or
a repo process that supersedes it.

**The expensive tiers are offered, never assumed.** `empirical-proof` and
`qa-sweep` cost real time and budget. They run on your explicit ask, now or by
standing rule, not because a session decided the work deserved them.

## Not documented here

Three skills run only inside this repository and ship in no plugin:
`change-log`, `push`, and `workbench-drift`. They live in `.claude/skills/` and
are maintenance tooling for the scaffold itself, not part of what adopters
install.
