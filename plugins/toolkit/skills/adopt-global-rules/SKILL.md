---
name: adopt-global-rules
description: Install the workshop's shipped global agent configuration onto this machine, additively — a per-host instruction document (CLAUDE.md / AGENTS.md), discrete rules, and output styles. Reconciles what is already there instead of overwriting it. User-invoked only.
disable-model-invocation: true
---

# Adopt Global Rules

Install **the workshop's shipped global agent configuration** onto this machine,
adding to what is already there rather than replacing it.

The pack below is plugin payload: it ships with this plugin the same way its
skills do. Changes to it arrive as a plugin release, not as per-machine
configuration.

The script does the mechanics; you do the judgment. Do not hand-write any of
these files — run the script, then reconcile what it could not.

## Three kinds of content

| Kind | Source | Shape |
|---|---|---|
| **Global document** | `globals/<HOST>.md` | one whole instruction doc **authored per host** |
| **Rules** | `rules/**` | discrete single-source rules fanned out to every host |
| **Output styles** | `output-styles/**` | whole files, only for hosts with a native surface for them |

The distinction matters when editing. Hosts want different things said — a
Codex sandbox-escalation instruction is meaningless to Claude Code — so each
host's global document is written separately and no host's copy is derived from
another's. Rules are the opposite: one body, installed everywhere it applies.

Output styles are the narrowest kind. Where a host has a first-class surface for
how a session talks, that instruction belongs there and not in the global
document — the same words in both places is the duplicate nothing mechanical
catches. A host without such a surface keeps the instruction in its global
document instead.

Where each lands:

```
claude   globals/CLAUDE.md → ~/.claude/CLAUDE.md    rules → ~/.claude/rules/<id>.md
                                                    styles → ~/.claude/output-styles/<id>.md
codex    globals/AGENTS.md → ~/.codex/AGENTS.md     rules → ~/.codex/AGENTS.md
```

Codex has no rules directory and no output styles, so everything it gets lands
in `AGENTS.md` as separate blocks.

## Run the plan

```
node adopt.mjs --dry-run --json
```

from this skill's directory. `--tier core` for unconditional rules only,
`--host <ids>` to narrow, `--skip-globals` to install rules and leave the
instruction document alone, `--prune` to remove blocks whose rule left the
manifest.

Exit `0` clean, `2` collisions or orphans need attention, `1` error.

## What the pack owns

Managed content is delimited by `<!-- workshop:rule id=... -->` markers.
The pack owns what is inside them and nothing else:

- **Rules and output-styles directories** — one file per piece, whole-file
  ownership. A file at a piece's path *without* the marker is the user's own:
  reported as a collision, never touched. In a file that opens with YAML
  frontmatter the marker sits directly below it, so the host still parses the
  frontmatter.
- **Single-file targets** — fenced blocks. Everything outside the fences is left
  byte-for-byte as found.

Managed blocks are **pack-owned**: a re-run overwrites a drifted block and
reports the diff. That is deliberate — it is how a machine that missed a change
catches up. Say so if the user has edited one: the fix is to edit the pack, not
the machine.

## Then reconcile

The script reports mechanics. Three things need a reader, and they are the
reason this skill exists:

1. **`unmanaged`** — everything on the machine the pack does not own, returned
   verbatim: prose outside the fences in a single-file target, and every
   unmarked file in a rules directory. Read it. Does any of it duplicate what is
   about to be installed **under a different filename or heading**? Does any of
   it *contradict* it? A rules directory is a flat namespace, so a user's
   `no-haiku-sonnet.md` and the pack's `model-floor.md` never collide — they both
   install and say the same thing twice. Nothing but a reader catches that.
2. **Collisions** — an unmarked file occupying a rule's path. Read it and say
   whether it is the same rule, a conflicting one, or unrelated.
3. **Skipped rules** — report the precondition that failed. A rule skipped for a
   missing MCP server is correct behaviour, not a failure.

## Output styles install, they do not activate

Installing a style puts the file on disk. It changes nothing until the user
selects it — in Claude Code, `/output-style`. Say so when one lands; a style
nobody selected is a file that looks installed and does nothing.

Never switch the active style for them. That is a preference, not setup.

## Present, then apply

Show the user the plan: what lands, what is skipped and why, and anything from
the reconciliation above. Get their go-ahead, then re-run without `--dry-run`
and report what changed.

Never edit a target by hand to work around a collision — surface it and let the
user decide.

## Bare machines

Where this plugin is not installed, the same implementation runs standalone:

```
npx github:giostriquer/workshop --dry-run
```

## Changing what ships

The pack is edited in the plugin's own repository and released, never patched on
a machine. `rules/manifest.json` holds the host list, each host's targets, and
the rule and output-style lists. Hosts are data — adding one is an entry plus
its `globals/<HOST>.md`, not a code change, and a host gets output styles only
if its entry declares a target for them. Rules declare a `tier`: `core` installs
unconditionally, while a rule with a `requires` precondition is skipped, with a
reason, where it is unmet.
