# Decision: `route-work` becomes `model-reference`, and sheds the last of its policy

## The rename

`route-work` named a verb the skill does not perform. It routes nothing and
dispatches nothing; three earlier notes exist because sessions kept reading it
as a dispatch procedure and running it before every fan-out
([trim](route-work-recalibration-and-trim.md)). The trims removed the rubric,
the process patterns, and the output contract, but the name kept re-teaching
what the body had stopped saying.

`model-reference` says what it is. The directory, the frontmatter name, the
H1, and every pointer move with it.

## Two invariants leave

**The model floor.** The invariant previously shipped the *shape* of a floor
(decide the weakest model allowed, write it into the always-injected rules
file, override anything selecting below it) after an earlier note replaced a
hard "never Haiku or Sonnet" with that portable form
([portability](route-work-model-floor-portable.md)). The shape is still fleet
policy, only one abstraction up, and this skill carries no fleet policy. It is
gone. `adopt-global-rules` ships a `model-floor.md` rules file, which is where
a floor belongs and always did.

**The operator-calibration paragraph and the cross-ladder caveat.** Both were
commentary on how to read one operator's rows. The skill's opening already
says the concrete policy belongs to the operator's rules file, so the
paragraphs restated a boundary the skill states once.

## Also in this change

- The orchestration invariant reads as a sentence again and names the
  operator's rules file as the alternative to the session's own model.
- The axis definitions become a list rather than a paragraph; `taste` extends
  from "docs voice" to docs, research, and audits; `gpt-5.6-luna` re-grades to
  4 on taste and code.
- The description regains a trigger clause. The rewrite had left it stating
  only what the skill *is*, and a description with no firing condition is a
  skill that only ever fires when typed by name.

## Consequences

- `plugins/toolkit/skills/adopt-global-rules/rules/core/model-floor.md` is
  shipped payload and pointed at `workbench:route-work`. It now points at
  `workbench:model-reference`. Anyone who already adopted that rules file onto
  a machine carries the stale pointer until they re-run the skill.
- The usage page moves to `docs/skills/model-reference.md`. Decision notes keep
  their `route-work-*` filenames: they record what was true when written.
