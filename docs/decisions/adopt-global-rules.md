# Decision: `adopt-global-rules` — a portable global rules pack

**Date:** 2026-08-12

## Status

Implemented — ships in `toolkit 0.4.0`.

## Context

The operator maintains global agent rules by hand on every machine, and they had
already drifted. At the time of writing:

| Location | Contents |
| --- | --- |
| `~/.claude/rules/` | `context7.md` **and** `no-haiku-sonnet.md` |
| `~/.codex/AGENTS.md` | `context7` only, in a hand-written `<!-- context7 -->` fence |
| `~/.gemini/GEMINI.md` | byte-identical to the Codex file |

The model floor had reached Claude and nothing else. That is the failure the
pack exists to fix, and it is why "the pack wins on a re-run" was chosen over
"the machine wins."

## What the investigation changed about the design

Two findings reshaped the original framing of "a script that merges rules
files":

**The additive problem barely exists on Claude.** `~/.claude/rules/*.md` is a
native user-level rules directory: every `.md` in it loads into every session and
files compose rather than overwrite. Shipping a Claude rule is dropping a file.
Only single-file targets like `~/.codex/AGENTS.md` need merging at all.

**The pack must live inside the skill directory.** An installed plugin receives
only `plugins/toolkit/`, so a top-level `rules/` directory would be unreachable
from the skill at runtime. The pack therefore sits at
`plugins/toolkit/skills/adopt-global-rules/rules/`, and the root `bin/` shim
reaches the same copy. One implementation, one pack, two entry points.

## The design

**Two kinds of content, and they are not the same shape.** A **global
instruction document** is authored **per host** — `globals/CLAUDE.md` and
`globals/AGENTS.md` are separate files, neither derived from the other. **Rules**
are single-source and fan out to every host that applies.

The per-host split is not duplication to be refactored away. The operator's
`AGENTS.md` carries a GitHub CLI sandbox-escalation instruction that is
meaningless on Claude Code, and the `CLAUDE.md` carries a BLUF communication
preference the Codex copy does not. Deriving one from the other would force a
choice between shipping irrelevant instructions to a host and inventing a
conditional syntax to suppress them. Two authored documents is simpler and
honest about what it is. The cost — the near-identical sections in the two
documents can drift apart — is accepted, and is a content question for whoever
edits them, not something the mechanism should paper over.

Because a host's global document and its rules can share one file (Codex puts
both in `AGENTS.md`), the installer accumulates every edit to a given path in
memory and writes it once. Reading and writing per block would make each pass
blind to the last.

**Ownership by marker.** `<!-- agent-workshop:rule id=… -->` delimits what the
pack owns; everything else on the machine is never rewritten. Claude gets
whole-file ownership (an unmarked file at a rule's path is a collision, reported
and untouched); Codex gets block ownership. HTML comments were chosen because
block-level comments are stripped from memory files before they reach a model's
context — the marker is free to carry.

**Script does mechanics, skill does judgment.** This is what makes shipping both
worthwhile rather than redundant. The script detects, writes, and reports
deterministically, and emits every byte of a single-file target that sits outside
the fences. The skill reads that remainder and answers what a script structurally
cannot: is this existing prose the same rule under another name, or does it
contradict a core rule?

**Tiers by dependency, not preference.** `core` rules have no external
dependency and install unconditionally. A rule may instead declare a `requires`
precondition — for example an MCP server that must be configured on that machine
— and is skipped with a stated reason where it is unmet. On a machine without
that server such a rule is worse than inert: it instructs the agent to reach for
tools that are not there. The operator dropped the one optional rule that
prompted this (`context7`) from the pack before it shipped, keeping it
machine-local; the tier mechanism stays because the distinction is real.

**Legacy migration.** Blocks maintained by hand before the pack existed used the
same marker as both opening and closing fence. Left unhandled, adoption would
append a duplicate. The installer recognises the paired-identical form for rules
that declare `legacyMarkers` and upgrades it in place.

**Hosts are data.** Gemini and opencode were deliberately left out — the operator
drives Claude and Codex — but the host list is a manifest array, so adding either
is one entry plus its authored `globals/<HOST>.md`, not a code change.

## Scope judgment

`package.json` and `bin/` are the first executable entry point at this repo's
root, and `CLAUDE.md` says the repo "is not a host." A zero-dependency installer
for the scaffold's *own* rules was read as shipping the scaffold rather than
becoming a host. `npx github:giostriquer/agent-workshop` was chosen over
publishing to npm: no account, no package name, no publish step coupled to every
rules change.

The toolkit plugin's description was widened from "artifact-making utilities" to
"utilities" — this skill is machine setup, and leaving the description unchanged
would have made the plugin's own summary false.

## The pack is plugin payload, not a template

This was the framing that took longest to get right, and it is the whole point
of the piece. The `globals/` documents and `rules/` are **shipped content** —
they travel with the plugin exactly as its skills do. Installing the plugin and
running the skill puts *the workshop's* `CLAUDE.md` and `AGENTS.md` on the
machine. Changes to that content are a plugin release.

The alternative reading — a scaffold that helps each operator install their own
rules — was written into the first draft and is wrong. It makes the pack a
template, which would mean the content is per-machine configuration and nothing
converges. What makes this worth building is precisely that the content is
versioned with the plugin: a change released once reaches every machine on its
next run.

That resolves what looks like a contradiction with `route-work`. `model-floor`
bans Haiku and Sonnet by name — the concrete fleet policy `route-work`
deliberately refuses to carry ([decision](route-work-model-floor-portable.md)).
Both are right. `route-work` is a *reference* skill, and a reference that
hard-codes one fleet ships a policy its readers never chose. This pack is where
concrete policy is supposed to live: it is payload, it is explicitly the
workshop's own, and it only reaches a machine when someone deliberately invokes
it.

`model-floor` began as the operator's machine-local `no-haiku-sonnet.md` and
became shipped content, with two stale references corrected on the way in: it pointed at `toolkit:route-work` (the skill moved to
`workbench` in the plugin split) and described a "model × effort table" (the
effort axis was removed — see [decision](route-work-effort-axis-removed.md)).
Shipping it unfixed would have propagated both to every machine.

## Verification

No test harness exists in this repo and none was invented. `--root <dir>`
redirects every target under a sandbox, and the behaviour was driven end-to-end
against fixtures: fresh install, idempotent re-run, drifted block (pack wins,
diff correct), legacy-fence migration with surrounding user prose intact,
unmanaged collision left byte-for-byte, optional precondition unmet, orphan
detection and `--prune`, absent host, `--json` contract, argument validation, and
the `bin/` shim reaching the same implementation. Dry-run was confirmed to write
nothing.
