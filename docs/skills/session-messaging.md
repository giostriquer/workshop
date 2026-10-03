# session-messaging

## What it does

Lets a Claude Code or Codex session message another session running on the
same machine, outside any epic, through Session Orchestrator's `so` command.
The sender finds the peer with `so ls --live` and sends with `so post`; the
message starts a turn in the other session, and its answer comes back the same
way. The skill also tells a session what to do when a message arrives, and
when `so post` refuses or fails.

## When to reach for it

Use it when you ask a session to consult, ask or tell another session ("ask
the Codex session in webapp which port it uses"), or when a message headed
`so <id> from …` arrives. Epic handoffs between an orchestrator and its lanes
stay with `epic-orchestration`.

It needs Session Orchestrator installed: the `so` command on `PATH` and its
hooks plugin in both tools.

## Common questions

**Does the receiving session need this skill to answer?**

No. Every message carries the exact command that answers it, on the line
under its header. The skill helps the receiver judge when an answer is owed.

**Why did `so post` print `refused:`?**

Two sessions may exchange six messages since you last spoke to either of
them. The seventh is refused, so two models cannot keep thanking each other
on their own. Say anything in either session and they can talk again.

**Why does a Codex session ask before its first message?**

Codex runs shell commands in a sandbox that cannot reach the store, so
`so post` has to run outside it. Allow it for good when Codex asks, and Codex
writes a rule for `so post`; `so doctor` reports whether that rule is there.
Under `approval_policy = never` a Codex session cannot ask, and cannot send.

## How to tell it worked

The sender prints `delivered <id>` and ends its turn. The receiver starts a
turn on the message, and its answer arrives in the sender as a new turn. The
Session Orchestrator app's Timeline shows `message.delivered` both ways, and
`message.refused` when the budget stopped one.
