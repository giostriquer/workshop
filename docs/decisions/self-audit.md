# Decision: `self-audit`: a retrospective on the process, not the work

**Date:** 2026-08-13

## Status

Implemented. Ships as `workbench 0.23.0`.

## Context

Every tuning change to the workbench system so far has arrived the same way:
the operator noticed friction during a session and said so afterward, from
memory. The flow had a door for auditing the *work* (`audit`, with
`claim-check` and `qa-sweep` behind it) and nothing at all for auditing
**itself**. Improvements therefore depended on the operator both noticing the
friction and remembering it well enough to describe.

The session is the one party that observed every moment. The obstacle is that
it is also the party being graded, and a session asked "how did the process
do?" will produce a flattering essay: it confuses *the process misled me* with
*I ignored the process*, and it pads with phrasing suggestions to look
thorough.

## The shape

A user-invoked skill that turns the retrospective into a protocol whose
structure resists self-flattery rather than trusting the session not to.

- **Trace before verdict.** Step 1 records facts only: which skills fired and
  what made them fire, which of the three gates arrived versus were decided for
  the user, every correction and dead end. Judgment is step 2. Facts are cheap
  to write down before there is a verdict riding on them.
- **Three buckets, one yields proposals.** *Process defect* → proposal;
  *session defect* (the process was clear, the session didn't follow it) →
  reported, no edit; *clean* → one line. Without the split, every retrospective
  becomes "the skill should have made me do it."
- **The conversion rule** keeps the split honest the other way: an instruction
  the session *reliably* misses is a wording defect, not a discipline defect.
  Repeated misses move from *session defect* to *process defect*.
- **A bar, and a no-findings out.** A proposal survives only if the change
  would have altered this session or the next of its shape. A clean result is
  reported as clean; padding is barred explicitly.
- **Named target, named edit shape**: one piece (or *the absence of one*) and
  one of: wording, gate, boundary, new, delete. "Clarify the handoff" is not a
  proposal; the replacement sentence is.
- **Observation window stated first**, so a compacted session cannot be
  reconstructed from the artifacts it left behind.
- **Reports, never edits.** The edit belongs to `writing-skills`.
- **What held** is part of the output: a retrospective that only ever subtracts
  will eventually subtract the parts that were working.

## Non-goals

- **Not an audit of the work.** Bugs, code quality, and test gaps stay with
  `audit` and the review pieces.
- **Not a flow moment.** It is `disable-model-invocation: true` and carries no
  row in `using-workbench`'s ownership table; it sits outside the flow looking
  back at it, the same way `adopt-global-rules` sits outside. A session able to
  invoke its own retrospective would run one unprompted, at the worst moment,
  and grade itself.
- **Never grades the user.** Corrections are evidence about the process, not
  about them.

## Packaging

`workbench 0.23.0`. Usage page: `docs/skills/self-audit.md`.

## Transcript evidence and a closing defect note (2026-09-24)

**Why.** self-audit stopped at what was still in context. Its evidence rule
said to state it when the early part was gone, so on the long sessions where a
retrospective matters most it audited only the tail. Meanwhile the operator ran
6 transcript analyses by hand in 14 days, self-audit fired about once in 30
days across both hosts, and at least 8 maintenance requests in 6 process-repo
sessions started from a pasted Codex transcript. In one of them neither the
maintainer session nor the operator could find which instruction produced a
misread. The method for both gaps already existed upstream: superpowers v6.4.1
added `diagnosing-superpowers`, which reads session transcripts on disk, and
pstack's `reflect` confirms the transcript by its opening prompt and treats its
content as untrusted data.

**What changed.**

- **The transcript is the evidence.** self-audit reads the session's on-disk
  transcript, including what came before a compaction and the subagent
  transcripts. Discovery stays host-neutral: it finds the host's storage and
  record format at run time and confirms the file by matching the opening user
  prompt, or the earliest prompt still in context after a compaction, never by
  recency alone. Reads stay inside the current session, its subagents, and any
  session the user names. When no file resolves, it audits what is in context
  and says so in the window line. This replaces the observation-window bullet
  above: the window now names the transcript files read.
- **Every finding cites `path:line`, or it is dropped.** The fallback cites the
  turn in context instead.
- **Context safety.** Measure a transcript before reading it, find line numbers
  with `grep -n`, and pull small fields from specific lines. Never `cat` a
  transcript or print a whole record. Quotes stay short, because transcripts
  hold secrets. The file is never modified.
- **A closing defect note.** The report ends with one paste-ready block per
  proposal: the skill and its version, the exact instruction or dispatch line
  that drove the behavior, observed versus intended behavior, the transcript
  pointer, and the proposed change. It is shaped for the loop the operator
  actually runs: see the failure, paste it into the process repo, fix, bump.

**Left out of the upstream skill.** The intake interview, the seven parallel
analysts, the GitHub issue and scrubbed-bundle pipeline, and the rule that it
never diagnoses a skill. self-audit stays a user-invoked, single-session
retrospective whose product is proposals. Cross-session transcript statistics
belong to a separate repo-local skill, not to this shipped one.

**Evidence.** Fresh-context probes on Opus 5.5, each handed a synthetic
compacted session under a placeholder home. Before the compaction, the opening
prompt limited testing to focused runs, a loaded TDD line told the session to
run the full suite anyway, and the session did so twice across two user
corrections, then wrote the rule into a reviewer dispatch. After it, context
held only the summary and the PR filing. The fixture also held a newer decoy
session in the same workspace sharing the earliest in-context prompt, a session
from another workspace, records of 213 to 643 KB, and fake credentials inside
test output.

| Question | Current wording (3, Claude Code layout) | This wording (3 Claude Code, 2 Codex) |
|---|---|---|
| Reads the on-disk transcript | 0 of 3 (two saw it on disk and declined, citing the skill) | 5 of 5 |
| Finds the pre-compaction defect: the TDD line, three runs, two corrections | 0 of 3 (all: no proposals) | 5 of 5 |
| Takes the right file over the newer decoy | n/a | 5 of 5 |
| Reads the subagent transcript (Claude Code layout) | n/a | 3 of 3 |
| Ends with a defect note naming skill, version, instruction line, observed and intended, pointer | n/a | 5 of 5 |
| Puts a credential in the report | 0 of 3 | 0 of 5 |

No run printed a large record whole; the largest single tool output in any
run was 15 KB. With no transcript for the workspace and the decoy as the only
file, 2 of 2 rejected the decoy by content, said in-context only in the window
line, cited turns in context, and said there was no defect note.

The first round exposed two gaps, both fixed and re-tested. On Codex, where one
date tree holds every workspace's sessions, both runs printed another
workspace's messages during discovery, and one pulled the fake credentials into
its own context, though its report paraphrased them. The confinement bullet now
narrows candidates by recorded working directory first; re-test, 0 of 2 read
another workspace's messages or surfaced a credential. And 0 of 3 Claude Code
defect notes stood alone: they cited `M:9`, a `<webapp>` stand-in, or an elided
path. The note now writes every path in full; re-test, 4 of 4 did (2 Claude
Code, 2 Codex), and all four still found the defect and rejected the decoy.
Synthetic fixtures and two to three reps per arm are regression evidence for
this session shape, not a reliability estimate.

**Packaging.** Ships with the next workbench release. Usage page updated in
the same change.

## Reachable on an explicit request (2026-09-24)

`self-audit` drops `disable-model-invocation`, and its Codex sidecar sets `policy.allow_implicit_invocation: true`; the description now fires only on the user's explicit ask for a look back at how the process ran, never on the session's own initiative. A 30-day usage audit found the user asks for retrospectives in plain words (six transcript analyses in fourteen days) and never types the slash command, so a hidden skill fired about once in thirty days across both hosts. Both hosts now behave the same way. A routing probe (Opus 5.5, fresh context, the shipped skills' descriptions, three reps per message) sent two plain-words retrospective asks to `self-audit` 6 of 6 times and an unrelated fix and a closing "PR is merged" to it 0 of 6 times: bounded regression evidence.
