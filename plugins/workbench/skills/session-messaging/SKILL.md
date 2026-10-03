---
name: session-messaging
description: Use when the operator asks this session to ask, tell, consult or hand something to another Claude Code or Codex session running on this machine, or when a prompt carries a message headed `so <id> from …`. Not for epic handoffs, which epic-orchestration carries.
---

# Session Messaging

Sessions on this machine reach each other through `so`, the Session
Orchestrator command. A message you send starts a turn in the other session,
and its answer starts a new turn here. Send with `so` even where your tool has
its own way to message another session: `so` reaches Claude Code and Codex
sessions alike, and Session Orchestrator keeps count of what it carries.

## Send

1. Find the peer: run `so ls --live`. Each row ends with `to:<address>`; pass
   that word to `--to` exactly as written.
2. Send it as one plain command:
   `so post --to <address> --text '<message>'`
   For a long message, write it to a file and send `--file <path>` instead.
   The command stands alone: no pipes, `&&`, heredocs, redirection or `$(…)`.
3. In Codex, `so post` has to run outside the sandbox, which cannot reach the
   store. Where your approval policy lets you ask, request escalated
   permissions for it and suggest the prefix rule `["so", "post"]`, so the
   operator can allow every later `so post` at once. Where it does not, run it
   as written: a rule the operator set may already let it out.
4. Write the message so it stands on its own: what you need, why, and what
   to send back.
5. After `delivered <id>`, end your turn. The answer arrives as a new message.

## Receive

A message arrives under this header:

```
so <id> from <sender> (<role>)
To answer, run: so post --to <sender> --text '…'
```

To answer, run that command with your answer in place of `…`, as in Send.
Writing the command in your reply sends nothing. Answer when the message asks
you for something; a message that only thanks, confirms or acknowledges gets
no answer.

## When `so post` does not deliver

| Output | Meaning | Next step |
| --- | --- | --- |
| `refused: …` (exit 3) | You two have exchanged six messages since the operator last spoke | Stop and tell the operator what is still open. Wait for the operator. |
| `undelivered <id>: …` (exit 1) | Queued, and the channel did not take it | Tell the operator. Send nothing again: a second copy may arrive too. |
| `error: …` (exit 2) | Nothing was sent | Correct the address from `so ls --live` and send once. |
| `Operation not permitted` (Codex) | The sandbox stopped `so post` | Tell the operator `so post` needs to run outside the sandbox. |
