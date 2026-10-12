---
name: ketchup
description: Use when the user explicitly invokes ketchup to catch up on the current task or conversation and its pending decisions. User-invoked only.
disable-model-invocation: true
---

# Ketchup

Catch the user up since their last message before this invocation, or within
the range they specify. Notifications and agent reports do not reset that
point. Carry forward unresolved decisions still waiting on the user, even
when raised earlier. Use the project, PR, and agent names the user knows.

## Gather the update

Read the relevant conversation, task records, and agent reports. Refresh only
the current state needed for this update, such as a touched PR's head and
checks, a running job, or a task's governing ledger. Keep gathering read-only.
Use available authorized tools; name anything you could not refresh.

Distinguish what you verified from what an agent reported, what is still
running, and what rests on older evidence. A green check on an earlier head
does not establish the current result. Keep disagreements and gaps visible.
Reuse existing evidence when it still covers the state being reported.

An action item is a decision or step only the user can take: a product choice,
missing access, or approval that the existing instructions actually require.
Routine investigation, retries, tests, and already authorized work belong to
the agent. Do not turn uncertainty you can investigate into a user decision.

## Give the catch-up

1. Open with the number of decisions or steps waiting on the user, or say
   there are none. If nothing changed and nothing is pending, say so briefly.
2. Summarize meaningful results and their implications, most important first.
   Label reported, stale, running, or unverified results accurately.
3. For each human action item, state the decision, why it matters now, the
   viable options and consequences, your recommendation, and what can proceed
   without an answer. Say when a consequence is unknown; link existing detail
   where useful. The user should be able to decide from the summary.
4. Name the next agent-owned action, or say that the checkpoint is complete.

Use concise plain language. A table or existing visual can clarify a choice;
prose is enough when it carries the information. Link only existing artifacts.

## Continue under the existing authority

A standalone catch-up or explicitly report-only request ends with the update.
During an ongoing authorized task, give the update through the host's progress
channel and continue the next permitted action. Await a necessary human
decision only for work that depends on it; continue independent work.
An explicit pause or stop controls continuation. Invoking ketchup neither
stops other agents nor authorizes edits, publication, or external messages.

---

Adapted from Lauren Tan's [pstack ketchup](https://github.com/cursor/plugins/tree/1b6d44ff26d4e242f4e8f68c391e6d2f7ca16def/pstack/skills/ketchup)
(MIT, Copyright (c) 2026 Lauren Tan).
