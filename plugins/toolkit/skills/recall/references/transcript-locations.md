# Transcript locations

Where each host keeps session history, and how to pick one workspace's
sessions. Every host writes one JSON object per line, and single lines can be
megabytes long: search with `grep` or `rg` and read the matched regions, never
a whole file (`rg -o '.{0,300}<term>.{0,300}'` prints the surroundings of a
match instead of the whole line). Read in place. Do not move, rewrite, compress or delete any of
these files, and do not decompress an archive beside its original.

On every host, a session belongs to this workspace when its recorded working
directory is the workspace, a directory inside it, or one of its worktrees. A
session started in a directory that contains the workspace (a parent such as
the home folder) counts only when its commands or edits name this workspace's
path as a whole path, not as the start of a longer sibling name: search it for
that path before keeping it. A session recorded in another project stays out
unless the user names that project. Subagent threads are left out.

A host whose folder is absent has no history here: say so and go on. For a
host not listed, look for its documented session store; when none is found,
name that host as a gap in the brief.

## Claude Code

Root: `$CLAUDE_CONFIG_DIR`, else `~/.claude`.

- A workspace's sessions: `projects/<slug>/<session id>.jsonl`, where the slug
  is the launch directory with every `/` and `.` turned into `-`
  (`/Users/me/acme` becomes `-Users-me-acme`). A worktree has its own slug.
- Subagent threads sit under `projects/<slug>/<session id>/subagents/`. Open
  one only to trace a main session's result into it.
- Each record carries `timestamp`, `cwd` and `type`. A `user` record with text
  content is a prompt; `assistant` records hold text and `tool_use` blocks.

## Codex

Root: `$CODEX_HOME`, else `~/.codex`.

- Sessions: `sessions/YYYY/MM/DD/rollout-<time>-<id>.jsonl`, one file per
  thread, with older ones under `archived_sessions/`.
- The first line is `session_meta` and holds `cwd`, the recorded working
  directory. A `source` that is an object naming a subagent marks a spawned
  thread.
- Most files, and every file under `archived_sessions/`, can be compressed as
  `.jsonl.zst`, and a plain `grep` skips them. Search them with `rg -z`, or
  stream one to standard output (`zstd -dc <file>`) and search the stream.
  Both routes need the `zstd` binary: check `command -v zstd` first, since
  `rg -z` finds nothing and reports nothing without it. Without `zstd`, name
  the compressed sessions as unreadable.

## Muse

Root: `~/.local/share/muse`.

- Sessions: `sessions/YYYY/MM/DD/<session id>/session.jsonl`.
- Subagent threads sit under `<session id>/subagent/<id>/session.jsonl`.
- A `runtime.session.metadata` record near the top of each `session.jsonl`
  holds the working directory as `workspace_root`.
- Read the `session.jsonl` files only. Do not open `session-index.db`: opening
  it writes beside the session store.

## Cursor

Root: `~/.cursor`.

- A workspace's chats: `projects/<slug>/agent-transcripts/<id>/<id>.jsonl`,
  where the slug is the workspace path with the leading `/` dropped and each
  `/` turned into `-` (`/Users/me/acme` becomes `Users-me-acme`).
