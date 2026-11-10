# recall

[Canonical skill](../../plugins/toolkit/skills/recall/SKILL.md)

Use `recall` when you come back to work that spans earlier sessions and want
to know where it stands: "recall my work on the export filter", "where did I
leave off last week", "what have I been working on this week". Invoke `/toolkit:recall`
in Claude Code, or select Recall with `$` or `/skills` in Codex. It is
user-invoked only on hosts that enforce invocation policy; see the Toolkit
README for the known Muse limitation.

It reads your own session history for the current workspace, across every
agent host that has history for it on this machine, then checks what it found
against the repository as it is now. By default it covers the last 7 days. Give
a window or a topic to change that. It says its scope back before it reads, and
when the history is too large to read whole it tells you what it sampled.

When the topic names a feature, file or bug, it also reads the repository's own
record for it: commits, pull requests and issues, including fixes that shipped
and were reverted.

## What you get

| Part | Holds |
| --- | --- |
| Capsule | At most 5 bullets: what the work is and where it stands |
| Threads | One line each, with a status tag: merged, open PR, in flight, verified but uncommitted, reverted, planned, or unverified with the reason. A commit hash stands in for a PR number where the repository uses none |
| Problems | At most 5 recurring ones, including what was tried and did not hold |
| Next move | The single most useful next action |

Each status comes from a check made in that turn, not from what an earlier
session claimed. Checks that only an earlier session ran are shown as
unverified.

## Common questions

**Does it change anything?** No. It reads transcripts and runs read-only `git`
and `gh` commands. It never moves, rewrites or deletes a transcript, and it
ends with the brief: it does not resume the work.

**Will it read my other projects?** Only when you name one.

**Which skill for what?**

| You want | Use |
| --- | --- |
| What changed in this conversation | [ketchup](ketchup.md) |
| Why a design or workaround exists | [why](why.md) |
| How the process itself ran in a session | [self-audit](self-audit.md) |
| Your working context across earlier sessions | `recall` |

**Can I paste the brief into a PR?** The brief is written for you and may quote
private context from your sessions. For anything shared, restate the finding
and cite only what others can open (a PR, issue or commit); session ids and
transcript text stay in the conversation.

**It's working if:** the scope is stated before the reading starts, every
thread has a status tag you can trust or an honest `unverified`, and the next
move is one concrete action.
