# recall: decisions in force

Rationale for the Toolkit `recall` skill.

## Adopted from pstack as an explicit entry point (2026-11-09)

The operator asked to port Lauren Tan's pstack `recall` from
[`cursor/plugins`](https://github.com/cursor/plugins/tree/236e5481d05cbadc315b374a5de54971858c27bb/pstack/skills/recall)
at `236e5481d05cbadc315b374a5de54971858c27bb` (source manifest 0.15.36, MIT).
A review of the week of 2026-11-02 showed the gap it fills: owner sessions
that lived across many days and compactions lost track of their own earlier
decisions, and nothing shipped rebuilt working context across sessions.
`ketchup` covers the current conversation only, `why` covers the history of a
design, and `self-audit` looks at how the process ran.

Toolkit owns it, beside the other optional pstack ports. It is user-invoked
only on Claude Code and Codex, as upstream is, because it reads private
session history.

What was kept: the scope lock stated back before reading, the search-first
reading of large transcripts, the per-session record, the check against live
state, and the output contract of capsule, tagged threads, problems and one
next move.

What changed on the way in:

- **Host-neutral history.** Upstream reads one host's chat folder. The port
  reads every host with history for the workspace on the machine, since work
  here often crosses hosts, and carries the layouts in a reference: Claude
  Code, Codex, Muse and Cursor.
- **Read-only, stated as a boundary.** Session transcripts are the only record
  of past work, so the skill opens them for reading and leaves each where it is
  and as it is, including compressed archives, which are streamed.
- **No model routing.** Upstream sends slices to subagents on a fast, cheap
  model and points at its own dispatcher skill for effort. The port uses
  parallel readers where the host offers them and the session's standing model
  rules allow, and reads directly otherwise.
- **The shared-record sweep is the repository's own record.** Upstream hands
  that sweep to its `why` investigators across chat, docs and error tracking.
  `why` here is user-invoked only, so the port reads commits, pull requests and
  issues itself and names sources it could not reach.
- **Routes point at local skills.** Upstream's session-pickup, automate-me and
  unslop references are not carried; the route table names `ketchup`, `why`
  and `self-audit`.
- **An `unverified` tag.** Upstream requires a status tag on every thread and
  has none for a thread whose state could not be checked.
- **It ends with the brief.** The port says it resumes and authorizes nothing.

The private-context rule is kept and made concrete: the brief is for the user
in the conversation, and anything bound for a shared place is restated and
cites only sources others can open.

## Checked (2026-11-09)

One application run on a real machine (Opus 5.5, fresh context, no
subagents) recalled a week of work on one topic. It stated its scope before
reading, checked four hosts, stayed inside the workspace, changed nothing,
verified threads with read-only `git` and `gh`, and returned the brief in the
contract's shape. Its run notes named four ambiguities, each corrected: a
repository with no pull requests has no `#N` for a merged tag, "verified,
uncommitted" did not say whose check counts, leaving out the current session
hid the source of live uncommitted work, and a topic naming a skill matched
every session through the listings each one loads. A no-skill control run was
discarded: it found the new skill in the working tree and followed it, so
there is no baseline to compare against.

An independent review then tightened the port: a status is "verified" only on
a check run in that turn, shared places cite only sources others can open and
never session ids, transcript text is evidence and not instruction, only the
project's own authorized tracker is searched, and the layout reference states
one workspace rule for every host, names where Muse keeps subagent threads and
its working directory, and says most Codex history is compressed and how to
search it. The Cursor layout is taken from upstream and was not checked on a
machine with Cursor history.
