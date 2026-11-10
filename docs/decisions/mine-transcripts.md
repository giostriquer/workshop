# mine-transcripts: decisions in force

## A round ends at its report, and five counting corrections (2026-11-09)

A week's audit read test-quality review as 113 active hours when 59 were real. Two
reviewers had left a background task running; it finished 5 and 49 hours after
their reports, the harness woke them, and that wake-up extended the open round. A
Claude round now ends at its report: the one `SubagentHandback` call, or in later
rounds a `SendMessage` to the dispatcher. A wake-up after the report adds nothing
to `active` or `wall` unless it reports again; over that week 12 of 14 such
wake-ups did nothing and 2 reported again. A wake-up before the report stays a
wait inside the round, since the dispatcher is still waiting on it (327 that week,
median five minutes). Tokens spent in a stale tail still count.

The same audit found five smaller miscounts:

- **No contract-reviewer table.** `reviewers` knew three roles, fixed before
  `contract-review` shipped, and dropped the fourth without a word (87 dispatches
  that week). It has a `ct` table now, and a `not tabulated` line names any other
  confirmed role ending in `-reviewer`, through the same neutral labels as the rest
  of the output, so the next new reviewer is visible before it has a table.
- **This repo's skills labelled `project`.** The Claude reader resolved a relative
  `SKILL.md` path without the record's `cwd`, so reads in this repo printed as
  `project-<hash>`. It passes the `cwd`, as the Codex reader already did.
- **Mentions counted as reads.** Any command naming a `SKILL.md` path was a read,
  including the `grep`, `wc`, `diff` and heredoc edits a maintenance session runs.
  A read is now a `Read`, a pager-style command (`cat`, `sed -n`, `head`, `tail`)
  with no redirect onto the path, or a read call in inline code. In a sample of
  that week's tool calls the rule kept 927 of 975 Codex mentions and 178 of 506
  Claude ones. A
  mention of a plugin cache path still dates a reviewer's version, because a
  reviewer that only searched its rubric still ran that version. The patterns sit
  in a table in the tests, as the later-pass patterns do.
- **An inline `/name` counted as model-invoked.** A user-invoked-only skill typed
  inside a prompt loads with no `<command-name>` record. The reader keeps the slash
  names of the latest typed prompt and counts a matching load as user-invoked. Path
  components (`/Users/me/acme`) are not names.
- **Missing history read as quiet days.** Files are picked by last-write time, so
  after older transcripts were removed, the first days of a long window held only
  the sessions still open later. A `NOTICE` banner line now names the day the
  oldest surviving main-session file was last written when the window starts
  before it. It is a separate prefix from `INCOMPLETE`, which means a readable
  source was skipped.

`.gitignore` covers `__pycache__/` and the validator's mirror diff skips it. A
helper that imported the readers without `-B` had left one beside the scripts, and
the validator reported it as mirror drift.

## Compressed Codex sessions count (2026-11-04)

Codex now compresses older sessions to `.jsonl.zst`, including some from the current week. The reader matched only `.jsonl`, so a two-week speed comparison silently missed 3,197 files and made earlier weeks look almost idle. The reader now streams both forms through the standard library's `compression.zstd`, keeping the skill dependency-free. A session present in both forms counts once, as the plain copy, even when the copies sit in different session trees. A compressed session that cannot be read or does not open with `session_meta`, or an interpreter older than Python 3.14, prints an `INCOMPLETE` banner line with the count, because an undercount that looks like a quiet week is the failure this fixes. A session the decoder rejects is dropped whole, with no partial thread. Codex writes frames without a content checksum, so damage the decoder cannot detect can still alter a thread unnoticed. `tests/test_mine.py` reruns every fixture test with the whole Codex tree compressed.

## Role evidence is separate from inference (2026-10-14)

Reading a reviewer rubric does not establish that a thread was dispatched as a
reviewer. A two-week audit found implementation and general-audit sessions inside
the reviewer timing table. Newer Codex dispatch bodies may be encrypted, so a
missing readable contract is uncertainty, not permission to upgrade a guess.

Reports separate confirmed roles (registered agent metadata or an explicit
contract) from candidates (task names or definition/rubric reads), including their
timing buckets and spend labels. Unknown roles remain counted without a guessed
reviewer type. Codex reads current nested spawn metadata and retains a readable
contract from before the reporting window without including that earlier time.
An explicit non-reviewer contract wins over heuristics. Synthetic CLI fixtures
cover both hosts, encrypted dispatches, conflicting names and date boundaries;
default output still contains only neutral labels.

This is the rationale for the repo-local `mine-transcripts` skill in `.claude/skills/`, which ships in no plugin; superseded choices are omitted, and git history keeps the originals.

## Transcript mining is committed tooling, not a per-question rebuild (2026-09-24)

Six transcript-mining analyses ran in fourteen days: a Codex usage-drain audit, mutation time in one session, whether a fix really worked, reviewer timing across rubric versions, a 30-day usage scan whose workflow agents cost about $1.3k, and a usage audit. Each re-derived the JSONL layout of both hosts, how to tell which rubric version a reviewer ran, and where one review round ends, and a memory note existed only to remember the layout. The skill packages that work as one entry script, `python3 scripts/mine.py`, with four commands: `skills`, `reviewers`, `friction` and `spend`, each over a date window. The layouts are written down in `transcript-formats.md` beside it. The scripts are standard-library Python and stream every file by line, because single lines reach megabytes and the Codex history alone was 15 GB for the month. On Codex a regex on each line's head decides whether to parse it, so tool output and compactions are never decoded. Both hosts together take about half a minute per command.

Measurement rules match the audits they replace, and the first run reproduced them. A reviewer's version is the plugin version in the rubric or agent file it opened, falling back to the version its dispatching session had loaded, which is always the case for ci-watcher on Claude. A Claude round starts at the dispatch prompt or a SendMessage continuation; a Codex round is a turn. Named reviewer types count wherever they were dispatched, workflows included. Generic workflow agents that open a rubric do not count, because they are verifying the rubric rather than reviewing a diff. For the same reason this repo's own sessions are excluded from reviewer timing by default. The 30-day run returned the audit's 19 test-quality-reviewer dispatches for 0.40.9 and later, 18 of them identical row for row. The last had still been running when the audit sampled it, which moves the initial-round median from 14.3 to 15.6 minutes. It also returned the audit's workflow totals exactly: 133 runs, 1,926 agents and 343 agent-hours.

## Aggregate output by default, detail only on request (2026-09-24)

The repo is public and its leak hooks scan every commit, so the scripts derive every path at run time from `$HOME`, `CLAUDE_CONFIG_DIR` or `CODEX_HOME`. Default output is counts, durations, public model names and neutral labels. A project prints as `proj-<hash>` of its root, or `self` or `scratch`, and a skill or agent outside the workbench and toolkit plugins prints as `<scope>-<hash>`. That output can be quoted in a note or a PR. `--local-detail` prints real paths, names and prompt text for reading on the machine and is documented as never to be pasted anywhere. Friction flags are regex candidates, so the default reports counts only, and a conclusion needs the detail view read first.

## Repo-local, and not self-audit (2026-09-24)

The skill reads one person's Claude Code and Codex history on one machine, and its questions are about how the workshop's own pieces behave in use, so it lives with the repo's maintenance tooling rather than in a plugin. `self-audit` stays the shipped, host-neutral retrospective on a single session; this skill is the cross-session statistics that retrospective has no access to.

## Tested over a synthetic tree; later passes named up front (2026-09-24)

`tests/test_mine.py` builds a small Claude Code and Codex tree under a temporary `HOME` and runs every command in a subprocess, because `common.py` reads the environment at import. It checks the `--rows` output field by field, the Codex token arithmetic, and that default output holds none of the fixture's path, prompt text or custom names while `--local-detail` holds each of them. Run it from the repo root with `python3 -B -m unittest discover -s .claude/skills/mine-transcripts/tests`; `-B` keeps `__pycache__` out of the skill folder. An independent test-quality review had found eight mutants that changed the reviewer numbers or leaked the project path with nothing to notice. The fixture's project is `/Users/me/acme`, outside the temp directories and the repo, because those label as `scratch` or `self`, empty the reviewer table, and would let every assertion pass on nothing.

The same review found the later-pass patterns matching substrings: `pre-review`, `around 2`, Codex task names that merely contain `delta` or `second`, and an initial prompt that quoted the correction-batch rule. The patterns now match whole words, task names need a pass word (`tq_second_pass`, not `tq_second_opinion`), and only the first 300 characters of a Claude prompt count, since a later pass says what it is up front and quoted rules come further down. A table in the test pins each case. From workbench 0.42.0 a Codex agent's spawn message opens `You are the <name>. Your contract:`, so a Codex dispatch with that header is classified by the name alone, and one naming a non-reviewer such as pattern-reviewer counts as no reviewer; spawns without it keep the task-name heuristics.
