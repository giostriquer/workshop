# adopt-global-rules

## What it does

Installs **the workshop's shipped global agent configuration** onto the machine
you run it on: the instructions every session loads, in every repository. It is
plugin payload, so changes arrive as a plugin release. It adds to what is
already there rather than replacing it.

| Kind | What it is |
| --- | --- |
| **Global document** | A whole instruction document, authored separately for each host |
| **Rules** | Discrete single-source rules, installed on every host |
| **Output styles** | Style files, for hosts with a native style surface |

| Host | Global document | Rules | Output styles |
| --- | --- | --- | --- |
| Claude Code | `~/.claude/CLAUDE.md` | `~/.claude/rules/<rule>.md` | `~/.claude/output-styles/<style>.md` |
| Codex | `~/.codex/AGENTS.md` | `~/.codex/AGENTS.md`, one block each | None; `AGENTS.md` carries the guidance inline |

The pack ships the `model-floor` rule and the `bluf-ste` output style
(answer-first responses in plain technical English). Installing a style does
not turn it on: select it with `/output-style`. The session never switches your
active style.

## When to reach for it

Run `/adopt-global-rules` when setting up a new machine, or when a machine may
have fallen behind the released pack. It is **user-invoked only**: a session
never decides on its own to rewrite global configuration.

| The problem | The skill |
| --- | --- |
| Get the workshop's global configuration onto this machine | `adopt-global-rules` |
| Which model should this work run on | [model-reference](model-reference.md) |

## What "additive" actually means

The pack owns content between `<!-- workshop:rule id=… -->` markers, and nothing
else.

- **A file you wrote is never touched.** An unmarked file at a rule's or
  style's path is reported as a **collision** and left byte-for-byte as found.
- **Prose outside the fences is preserved.** Your notes around the blocks in
  `CLAUDE.md` or `AGENTS.md` survive verbatim.
- **A managed block is pack-owned.** A re-run overwrites a drifted block and
  prints the diff. **Edit the pack, not the machine**: a local tweak inside a
  managed block is lost on the next run.

## Common questions

**What does a run look like?**

A script does a dry run; the session shows you what lands, what is skipped and
why, and any collisions, duplicates, or contradictions. After your go-ahead it
applies the plan and reports what changed. Exit code `0` is clean, `2` means
collisions or orphans need attention, `1` is an error.

**I want only some of it.**

`--skip-globals` installs rules and leaves the global document alone.
`--tier core` limits to unconditional rules. `--host <ids>` narrows the hosts.

**Why did it skip a rule?**

Its precondition, such as a configured MCP server, is unmet on this machine.
The run states the reason; the skip is correct behavior, not a failure.

**What is an "orphan"?**

A marked block whose rule is no longer in the pack. Orphans are always reported
and removed only with `--prune`.

**What is "unmanaged"?**

Everything the pack does not own, returned verbatim for you to read. A rules
directory is a flat namespace, so your own `no-haiku-sonnet.md` never collides
with the pack's `model-floor.md`: both install and say the same thing twice.
Only a reader catches that.

**Can I run it on a machine without the plugin?**

Yes: `npx github:giostriquer/workshop --dry-run`. Same implementation; drop
`--dry-run` to apply.

**How do I change what ships?**

Edit the pack in the plugin's repository and release it; never patch a machine.
`rules/manifest.json` holds the hosts, their targets, and the rule and style
lists. Each host's global document under `globals/` is authored separately, not
derived from another's.

**Does it work on Gemini / opencode / Cursor?**

No; only Claude Code and Codex ship as targets. Adding a host is a manifest
entry plus its `globals/<HOST>.md`, not a code change.

## It's working if

- One run gives a fresh machine the same configuration as every other.
- A second run reports everything `unchanged`.
- A shipped output style appears in `/output-style`, ready to select.
- Hand-written global instructions survive untouched.
- Negative signal: editing `~/.claude/CLAUDE.md`, `~/.claude/rules/`, or
  `~/.codex/AGENTS.md` by hand to work around a collision instead of deciding it.

## Where it fits

Outside the workbench flow: machine setup, run once per machine and again after
each pack release. [model-reference](model-reference.md) carries routing
doctrine without fleet policy; this skill delivers the workshop's concrete
policy, its model floor included.
