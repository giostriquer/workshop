# Decision: a code-quality review opens with its verdict

**Date:** 2026-09-17

**Release:** workbench 0.40.0

## Change and reason

`code-quality-review` now requires the report to open with
`## Verdict: PASS | ISSUES_FOUND`, the line `test-quality-review` has always
emitted, with `PASS` defined as no in-scope (blocking) finding. The agent spec
names the line and the usage page lists it under "It's working if".

Two readers wanted it and neither had it.

A **session** reading a hand-back had to infer the outcome from prose. A survey
of 64 reviewer hand-backs on one machine found the verdict written as `SHIP`,
`fix-then-ship`, `REWORK`, `SHIP (advisory findings only)` and
`not approved as shipped`; 15 opened with a `## Verdict:` heading, 41 mentioned
the word somewhere in the body, 6 carried only the blocking/advisory labels and
2 said neither. Every one of those reviews knew its own answer; none of them
said it the same way twice.

A **tool** could not read it at all. The launch of a reviewer is exact on disk -
a subagent call naming the agent, and a notification carrying its status,
duration and token cost - so counting reviews per branch or per session is
already possible, and only the outcome was unreadable. One line closes that
without asking the reviewer for anything it had not already decided.

The vocabulary is `test-quality-review`'s rather than a third one, so a reader
takes a single rule across both stages. `pattern-reviewer` keeps its own
domain-scoped wording and is unchanged here.
