# adopt-global-rules: decisions in force

This is the rationale for the toolkit plugin's `adopt-global-rules` skill and its root `bin/` launcher; superseded choices are omitted, and git history keeps the originals.

## The pack is plugin payload, not a template (2026-08-12)

Hand-kept global rules had drifted; the model floor had reached Claude alone. The pack therefore ships as plugin content, so one release reaches every machine; per-operator templates would never converge. Unlike the workbench `model-reference` skill, it may carry concrete policy such as `model-floor`'s Haiku and Sonnet ban, because the pack is explicitly the workshop's own and arrives only when invoked.

## One implementation, two entry points (2026-08-12)

An installed plugin receives only its own directory, so pack and installer live inside the skill, and the root `bin/` shim imports that same file. Bare machines run it via `npx` from GitHub, avoiding an npm publish on every rules change.

## Global documents per host, rules single-source (2026-08-12)

Each host's global document is authored separately because hosts need different things said: the Codex copy carries a sandbox-escalation instruction meaningless on Claude Code. Drift between near-identical sections is the accepted cost. Rules are one body fanned out to every applicable host, and hosts are manifest data, not code.

## Ownership by marker; the pack wins on a re-run (2026-08-12)

HTML-comment markers delimit what the pack owns, and hosts strip them before the model reads. Directory targets get whole-file ownership, so an unmarked file at a rule's path is a reported, untouched collision; single-file targets get fenced blocks. A re-run overwrites a drifted block and reports the diff; that is how lagging machines catch up. Edits to one path accumulate into one write, and legacy blocks fenced by one repeated marker are upgraded in place.

## The script does mechanics, the skill does judgment (2026-08-12)

The script detects, writes, and reports deterministically, returning everything it does not own verbatim. The skill reads that remainder for what no script sees: the same rule under another name, or prose contradicting a shipped rule.

## Tiers by dependency, not preference (2026-08-12)

`core` rules install unconditionally. A rule whose `requires` precondition (such as an MCP server) is unmet is skipped with a reason: it would send the agent to absent tools.

## The communication style ships as a Claude output style (2026-08-14)

The BLUF and Simplified Technical English guidance moved from `globals/CLAUDE.md` into the `bluf-ste` output style, a third content kind for hosts that declare a target. A style is a dedicated, switchable channel, and shipping it retires a hand-written duplicate reconciliation missed. Codex has no such surface, so `globals/AGENTS.md` keeps the guidance inline. The marker sits below YAML frontmatter so the host still parses it.

## Output styles install, never activate (2026-08-14)

The installer writes the style but never edits `settings.json` or switches the active style: how a session talks is the user's preference. The run reports it as installed, not activated, and names `/output-style`. An existing unmarked `bluf-ste.md` is a collision the user resolves.
