# Decision: `writing-skills` becomes repo-local, shipped in no plugin

## Change

`writing-skills` moves from `plugins/toolkit/skills/` to
`.claude/skills/writing-skills/`, joining `change-log`, `push`, and
`workbench-drift` as tooling this repo runs on itself and ships to nobody.

## Consequences

- **Toolkit no longer ships any superpowers-derived piece.** Its `LICENSE`
  loses the derived-portions clause and its README loses the attribution
  block. The MIT notice moves to the repo's root `LICENSE`, naming the new
  path, because the obligation follows the code.
- **`docs/skills/writing-skills.md` is deleted.** That layer is usage pages
  for *shipped* skills, and the repo's own skills have never had one.
- **Two workbench skills pointed at it.** `using-workbench`'s ownership row
  named it as toolkit-shipped, and `self-audit` handed the edit to it by name;
  `self-audit` now defers to whatever skill-authoring discipline the
  environment provides. An installed workbench cannot reach a repo-local
  skill, so naming one is a pointer to nothing.
- The `workbench-drift` manifest keeps tracking it as an upstream mirror with
  its `localPath` updated, so drift review is unaffected.
- `AGENTS.md`'s standing instruction to use `writing-skills` for any skill
  change still holds and now describes a repo-local skill, which is what a
  rule in `AGENTS.md` should describe.
- Versions: `toolkit` `0.9.0` (loses a shipped skill), `workbench` `0.31.0`.

## Also in this change

`metadata: system: workbench` is removed from the eight workbench skills that
carried it. Nothing read the field, no host or script consumed it, and it was
present on exactly half the set with no pattern separating the halves.
