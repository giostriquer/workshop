# correct

## What it does

`correct` investigates recurring repository mistakes and turns them into
proportionate prevention: clearer ownership, a constrained interface, types,
an executable check, or a behavioral test. It keeps instructions for judgment
that cannot be encoded economically.

## When to reach for it

Ask explicitly: "Find why agents keep missing registrations and prevent it",
or invoke `/toolkit:correct` (Claude Code) or `$toolkit:correct` (Codex).
An ordinary "fix this" does not start this investigation.

| Need | Skill |
| --- | --- |
| Prevent a repeated repository mistake | `correct` |
| Examine how the session's process failed | [self-audit](self-audit.md) |
| Survey architectural friction | [improve-codebase-architecture](improve-codebase-architecture.md) |
| Fix one known bug | Normal implementation workflow |

## Scope and result

Name an area and history window if you have one. Otherwise it starts with the
active repository's last 30 commits. Two distinct cited occurrences establish
recurrence; one incident described twice does not. It traces the mechanism
into current code and preserves required compatibility and distinct adapters.

A plan-only request changes nothing. Authorized repairs proceed within their
scope. Invoking the skill does not authorize commits, publication, global
configuration edits, or deletion of user data. Conversation evidence stays
within the requested workspace and window; unavailable history is disclosed.

The report connects each mistake class to its occurrences, remedy and owner,
enforcing check, and proof or gap. For a repair, valid work must pass and an
isolated reproduction of the historical violation must fail for the intended
reason. Planned checks are labeled unrun. CI that was not run is not reported
as passing.

## Common questions

**Will it keep adding rules to AGENTS.md?**
It first looks for an existing owner or check. Durable instruction edits happen
only within the authorized change, and prose is not described as enforcement.

**Must every repeated mistake trigger a refactor?**
No. The remedy must fit the consequence and scope. A small existing validation
hook may suffice; a judgment call may still need a concise instruction.

**Does it need Workbench or a specific host?**
No. It uses repository history, available review evidence, and the host's tools.
Its architecture reference ships alongside it in Toolkit.

## How to tell it worked

- Distinct occurrences and current code support the claimed mechanism.
- The remedy prevents the mistake while preserving legitimate callers.
- Negative and positive checks support the enforcement claim.
- Scope, private evidence, and unrelated work were preserved.

The [canonical skill](../../plugins/toolkit/skills/correct/SKILL.md) is the
authority for behavior.
