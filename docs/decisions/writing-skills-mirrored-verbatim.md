# Decision: `writing-skills` is mirrored from upstream, not adapted

**Date:** 2026-08-12

## Status

Implemented.

## Context

Operator call: stop maintaining a local fork of `writing-skills` and carry
upstream's copy verbatim, "and whatever it brings with that."

The trigger was an audit finding two defects in the bundled corpus — a
self-contradiction about the `description` field, and a pointer to a worked
example that did not exist. Investigating them turned up the more useful fact:
**one of the two was caused by the partial port itself.** Upstream ships
`skills/writing-skills/examples/CLAUDE_MD_TESTING.md`; the port carried the
reference and dropped the directory, so the pointer dangled locally while being
perfectly valid upstream. The fork was the bug.

Diffing the whole package against upstream `main` showed the divergence was
small and, in two places, backwards:

| File | State before the mirror |
| --- | --- |
| `anthropic-best-practices.md` | byte-identical to upstream |
| `persuasion-principles.md`, `graphviz-conventions.dot` | byte-identical |
| `testing-skills-with-subagents.md` | 1 line (a namespace prefix) |
| `SKILL.md` | 18 lines (namespace prefixes, a dropped-piece link, repo-workflow wording, provenance footer) |
| `render-graphs.js` | 13 lines — **ours was the stale one** |
| `examples/` | missing entirely |

`render-graphs.js` is the notable one. Upstream had since replaced
`execSync('which dot')` with `execFileSync('dot', ['-V'])`, carrying the comment
that `which` "is not a command on Windows" — the operator's platform. Our fork
was holding a copy that fails there.

The description contradiction is **upstream's own**: that file is byte-identical,
so the fork neither caused it nor was hiding a fix. Mirroring does not change it.

## The change

`plugins/toolkit/skills/writing-skills/` is now a byte-for-byte copy of
`skills/writing-skills/` at upstream commit
`b36e0829c6d0140e93cfef2ca599b1b07d4a7797`, including the `examples/` directory.

**The manifest gains a third disposition, `mirrored`**, alongside `adopted` and
`dropped`. This is not cosmetic: `drift-check.mjs` branched on
`disposition === "adopted"` and sent everything else to the dropped/FYI bucket,
so leaving the entry mislabeled would have made future drift reviews silently
ignore this piece. The script now buckets mirrored pieces into a **Re-mirror**
section, and `workbench-drift`'s step 5 states that mirrored pieces skip the
adaptation filter entirely — there is nothing to judge, so the action is
re-copying the tree wholesale, gained and lost files included.

## The accepted cost

A verbatim mirror reintroduces six references that do not resolve here: five
`superpowers:`-namespaced skill references and one relative link to
`../using-superpowers/references/`, a piece this repo deliberately dropped. In an
installed environment those point at nothing. The skills they mean —
`test-driven-development`, `systematic-debugging` — ship unprefixed in
`workbench`.

This is the trade the operator chose: **fidelity to upstream over local
correctness.** Re-porting under the adaptation filter would fix all six and
re-create the fork that caused the dangling-pointer defect in the first place.
The cost is recorded in the manifest entry and stated plainly on the skill's
usage page, so nobody has to rediscover it.

## Licensing

Attribution was already satisfied at the plugin level:
`plugins/toolkit/LICENSE` names the skill and its bundled files as derived from
superpowers, © Jesse Vincent, under MIT. The per-file provenance footer the fork
carried was therefore redundant, and dropping it costs no compliance. That
clause claimed adaptations that no longer exist and now says the portions are
mirrored without modification.

## Not done here

**The reviewed-commit pin was not advanced.** `workbench-drift` is explicit that
an advanced pin asserts "everything up to here was seen," and only this one piece
was handled. The same drift run reported `skills/brainstorming/` as changed
upstream and still unreviewed. Advancing the pin would have silently written off
that review.

## Packaging

`toolkit` `0.2.0` → `0.3.0` across all three plugin manifests and the Claude
marketplace entry. Repo-only tooling (`workbench-drift`'s skill, script, and
manifest) ships in no plugin and carries no version.
