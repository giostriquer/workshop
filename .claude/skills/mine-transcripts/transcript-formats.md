# Transcript formats

What the scripts rely on, so no session re-derives it. Both hosts write one JSON
object per line; some lines are megabytes (compactions, tool output), so stream by
line in binary and never load a whole file. Files are selected by mtime at or after
the window start, then events by their own timestamp, because long sessions start
before the window. Timestamps are UTC; the scripts bucket by local date.

## Claude Code

Root: `$CLAUDE_CONFIG_DIR` or `~/.claude`, then `projects/<slug>/`, where the slug is
the launch directory with `/` and `.` turned into `-` (`/Users/me/acme` becomes
`-Users-me-acme`).

| File | Holds |
| --- | --- |
| `<session>.jsonl` | the main session |
| `<session>/subagents/agent-<id>.jsonl` | one Agent-tool dispatch |
| `<session>/subagents/agent-<id>.meta.json` | `agentType`, `description`, `model`, `isFork`, `toolUseId` |
| `<session>/subagents/workflows/<run>/agent-<id>.jsonl` | one agent of a Workflow run; `agentType` is `workflow-subagent` unless the script named a type |

Record fields used: `type` (`user`, `assistant`, `attachment`, `system`, ...),
`timestamp`, `cwd`, `entrypoint` (`cli`, `sdk-cli`, `claude-desktop`), `isMeta`,
`origin.kind` (`human`, `task-notification`, `coordinator`), `promptSource` (`typed`,
`system`, `sdk`, `queued`).

- **Assistant.** `message.content` holds `text`, `thinking` and `tool_use` blocks
  (`name`, `input`). `message.usage` repeats on every block of one response, so sum
  it once per `requestId`.
- **Typed prompt.** A `user` record with text content, not `isMeta`, `origin.kind`
  human or absent, `promptSource` not `system` or `sdk`, and not starting with
  `<task-notification`, `<local-command`, `<command-` or `Caveat:`.
- **Interrupt.** User text starting `[Request interrupted by user`. A denied tool
  call is a `tool_result` with `is_error` and "doesn't want to proceed".
- **Skill load.** An `isMeta` user record starting `Base directory for this skill: <dir>`.
  A slash command shows just before it as `<command-name>/<name></command-name>`;
  otherwise the model called the `Skill` tool.
- **Subagent rounds.** The first non-meta user text is the dispatch prompt (workflow
  agents get `[Workflow harness ...]` relays). Each SendMessage continuation is an
  `isMeta` record with `origin.kind` `coordinator` and text "The coordinator sent a
  message while you were working: ...". Forks start with a `fork-context-ref` record
  and no dispatch prompt.
- **Versions.** Plugin files live at
  `plugins/cache/<marketplace>/<plugin>/<version>/skills/<name>/SKILL.md` and
  `.../agents/<name>.md`. Reviewer agents `Read` their rubric by that path, which
  dates the run. ci-watcher reads nothing, so its version is the parent session's
  most recent skill load.

## Codex

Root: `$CODEX_HOME` or `~/.codex`, then `sessions/YYYY/MM/DD/rollout-<time>-<id>.jsonl`
and `archived_sessions/`. One file per thread; a spawned subagent gets its own file.

Every line starts `{"timestamp":..,"ordinal":N,"type":T,"payload":{"type":P,...` (the
ordinal is sometimes absent), so a regex on the head decides whether to parse. Tool
outputs, `reasoning`, `compacted` and `event_msg/item_completed` are most of the bytes
and are never parsed.

- **`session_meta`** (line 1): `id`, `parent_thread_id`, `forked_from_id`, `cwd`,
  `agent_path` (`/root/<task_name>`), `source`. A string source (`cli`, `vscode`,
  `exec`) is a main thread, `exec` being automation; `{"subagent":{"thread_spawn":..}}`
  is a spawned subagent; `{"subagent":{"other":"guardian"}}` is the auto-review
  approver. Lines whose ordinal is below `subagent_history_start_ordinal` are history
  copied from the parent: skip them. Some guardian files are all history.
- **`turn_context`**: `model`, `effort`.
- **`event_msg`**: `task_started` and `task_complete` bracket one turn (a round);
  `turn_aborted` with reason `interrupted` in a main thread is a user interrupt;
  `token_count` carries `info.total_token_usage`, cumulative per thread, where
  `input_tokens` includes `cached_input_tokens`.
- **`response_item` `message`, role user**: `internal_chat_message_metadata_passthrough.content_item_kinds`
  says what it is. `user.text` is a typed prompt; `skills.selected_skill_instructions`
  is a `$skill` mention with `<name>` and `<path>`; `goal.internal_context`,
  `agents_md.instructions` and `environments.environment_context` are injected.
- **`response_item` `function_call` / `custom_tool_call`**: `exec`, `exec_command`,
  `spawn_agent`, `send_message`, `followup_task`, `wait_agent`, `sleep`. Codex has no
  Skill tool: the model loads a skill by reading its `SKILL.md` path in a command
  (`~/.codex/plugins/cache/...`, `.codex/skills/`, `.agents/skills/`). `spawn_agent`
  and `send_message` payloads are encrypted in the parent. From workbench 0.42.0 the
  child's spawn message, a user message, opens `You are the <name>. Your contract:`,
  which names the agent; an older spawn is recognized by its task name and by the
  rubric or agent file it reads.
