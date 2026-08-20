# Decision: `CLAUDE.md` becomes a pointer at `AGENTS.md`

## What changed

`CLAUDE.md` is now a single line, `@AGENTS.md`. The two files previously
carried parallel copies of the same maintenance rules, on the reasoning that
each host loads only one of them and forwarding between them is unreliable
under context pressure. `AGENTS.md` absorbed what was worth keeping and was
trimmed at the same time.

## What was dropped in the trim

Most of it was duplication or scaffolding-about-the-scaffolding: the
source-priority ladder, the adopting-project separation essay, the mirrored
"maintenance stance" section, and the scope-discipline paragraph.

One rule left that was load-bearing: **"shipped text may reference only what
an installed environment can reach: public URLs, never repo-relative paths or
repo-local tooling."** It is the rule behind two changes in the same release
window, the cross-plugin pointer removed when `get-pr-comments` moved to
`toolkit`, and the `workbench:route-work` pointer fixed in the shipped
`model-floor.md` rules payload. Re-adding it is the operator's call; it is
recorded here so the omission is deliberate rather than forgotten.

## What was added

`AGENTS.md` gains a standing instruction to use `writing-skills` for any
change to any skill in the repo.
