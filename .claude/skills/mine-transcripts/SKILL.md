---
name: mine-transcripts
description: Use when a question needs numbers from this machine's Claude Code or Codex history across many sessions, such as how the reviewers did since a release ("compare test-quality-reviewer timing before and after 0.41.3"), skill usage over the last N days, how often the user corrected or interrupted the agent, or what subagents and workflows cost. Not for a retrospective on one session, which is self-audit.
---

# Mine Transcripts

## Overview

Committed scripts that answer cross-session questions over `~/.claude/projects` and
`~/.codex/sessions` in under a minute. The JSONL schemas, rubric-version detection and
round segmentation are solved here and reproduce past audit numbers. Run a command before
writing any parser; extend `mine.py` when no command fits.

## Quick reference

Run from the repo root, always through the interpreter:

| Question | Command |
| --- | --- |
| reviewer time before vs after a release | `python3 .claude/skills/mine-transcripts/scripts/mine.py reviewers --split-at 0.41.3` |
| reviewer time per version | `... mine.py reviewers --kinds tq` |
| skill invocations per week | `... mine.py skills` |
| user corrections and interrupts | `... mine.py friction` |
| subagent and workflow spend | `... mine.py spend` |

Every command takes `--days N` (default 30) or `--since YYYY-MM-DD [--until YYYY-MM-DD]`
(local dates, inclusive) and `--host claude|codex|all`. `--help` lists the rest.

## Reading the reviewer table

- One row per version bucket and host. Never pool hosts: a Claude round is a
  SendMessage continuation, a Codex round is a turn.
- `wall` is first to last event; `active` sums the rounds, so idle waits between
  rounds drop out. `init` is the first round; `fu` the later ones. A fresh dispatch
  counts as a follow-up when its prompt's opening (Claude) or its task name (Codex)
  names a later pass, such as `follow-up pass 1`, `round 2`, `re-review` or a
  correction delta.
- A Codex reviewer is identified by its spawn header (`You are the <name>. Your
  contract:`, workbench 0.42.0 on); older Codex spawns by task name and the rubric
  they read.
- The version is the one the agent read (`.../workbench/<ver>/skills/<rubric>/SKILL.md`
  or `.../agents/<name>.md`). Otherwise it is the version the dispatching session had
  loaded (`parent`), always so for ci-watcher on Claude. Long-lived sessions run old
  versions, so buckets follow what ran, not release dates.
- Excluded by default: this repo's own runs (rubric probes) and scratch-dir sessions.
- Give n beside every median. With n under 5, call the number anecdotal. `--rows`
  prints one line per dispatch when a median looks odd.

## Leak safety

Default output is numbers and neutral labels: `proj-<hash>`, `self`, `scratch`, and
`<scope>-<hash>` for skills and agents outside workbench and toolkit. It is safe to
quote. `--local-detail` prints real paths, names and prompt text: read it on this
machine and never paste it into the repo, a commit, a PR or a ticket.

## Extending

A new question is a new subcommand in `mine.py` over the `Thread` records in
`common.py`; `claude_code.py` and `codex.py` are the host readers. The record layouts
are in `transcript-formats.md`. Keep it streaming, standard library, aggregate output.

`tests/test_mine.py` runs every command over a synthetic tree of both hosts and pins
the reviewer rows, the leak-safe default output and the later-pass patterns. Cover a
change there, with placeholder strings only, and run from the repo root:
`python3 -B -m unittest discover -s .claude/skills/mine-transcripts/tests`.

## Common mistakes

| Mistake | Instead |
| --- | --- |
| Writing a one-off parser for a new question | Add a subcommand; the schema work is done |
| Quoting a median from a run still in progress | The newest rows grow as runs finish; rerun and say when |
| Reporting friction flags as corrections | They are regex candidates and a lower bound (a hand-read Codex sample held about three corrections per flag); read them with `--local-detail` first |
| Reading a trend off a week marked `*` | That week is partial; pick `--since`/`--until` on whole weeks or compare equal spans |
| Comparing Claude and Codex numbers directly | Compare within a host |
| Pasting `--local-detail` output into a note | Quote the default output only |
