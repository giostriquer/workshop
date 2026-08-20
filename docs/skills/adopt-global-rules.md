# adopt-global-rules

## What it does

Installs **the workshop's shipped global agent configuration** onto the machine
you run it on: the instructions that load in every session, in every
repository, regardless of which project you are in.

The configuration is **plugin payload**, not a template. It ships with the
plugin the same way its skills do: you install the plugin, run the skill, and
the machine ends up carrying the workshop's `CLAUDE.md`, `AGENTS.md`, rules,
and output styles. Changes to that content arrive as a plugin release.

It adds to what is already there. It does not replace a machine's global
configuration and it does not rewrite instructions the machine already carries.
The pack owns a set of clearly marked blocks; everything else on the machine is
left exactly as found.

Three kinds of content ship:

| Kind | What it is |
| --- | --- |
| **Global document** | A whole instruction document, authored separately for each host |
| **Rules** | Discrete single-source rules, fanned out to every host that applies |
| **Output styles** | Whole style files, for hosts that have a native surface for them |

That split is the important one. Hosts want different things said: a Codex
sandbox-escalation instruction means nothing to Claude Code, so each host's
global document is written on its own terms rather than derived from another's.
Rules are the opposite: one body, installed everywhere.

Where things land:

| Host | Global document | Rules | Output styles |
| --- | --- | --- | --- |
| Claude Code | `~/.claude/CLAUDE.md` | `~/.claude/rules/<rule>.md`, one file each | `~/.claude/output-styles/<style>.md` |
| Codex | `~/.codex/AGENTS.md` | `~/.codex/AGENTS.md`, one fenced block each | Not supported |

Claude Code loads both `~/.claude/CLAUDE.md` and every `.md` in
`~/.claude/rules/` into every session. Codex reads one flat `AGENTS.md`, so both
kinds land there as separate blocks.

Output styles are different in one way that matters: installing one does not
turn it on. The file lands; you select it with `/output-style`. Claude Code ships
`bluf-ste`: answer-first responses in plain technical English.

## When to reach for it

Run `/adopt-global-rules` when you are setting up a new machine, or when you
suspect a machine has fallen behind: an instruction you added months ago that
never made it everywhere.

It is **user-invoked only**. The skill carries `disable-model-invocation: true`,
so a session will never decide on its own to rewrite the machine's global
configuration.
You ask, or it does not run.

| The problem | The skill |
| --- | --- |
| Get the workshop's global configuration onto this machine | `adopt-global-rules` |
| Which model should this work run on | [model-reference](model-reference.md) |

## What "additive" actually means

The pack owns content between `<!-- workshop:rule id=… -->` markers, and
nothing else.

- **A file you wrote is never touched.** If a file sits at a rule's path without
  a pack marker, it is yours. The run reports a **collision** and leaves it
  byte-for-byte as it was.
- **Prose outside the fences is never rewritten.** Your own notes above and
  below the blocks in `CLAUDE.md` or `AGENTS.md` survive verbatim.
- **A block the pack owns is a block the pack maintains.** Re-running overwrites
  a managed block that has drifted, and prints the diff.

That last one is deliberate, and it is the whole point: it is how a machine that
missed a change catches up. The rule of thumb it implies: **edit the pack, not
the machine.** A local tweak inside a managed block is lost on the next run.

## Common questions

**Will it clobber my existing global instructions?**

No. It only writes inside its own markers. An unmarked file at a rule's path is
reported and left alone, and content outside the fences in a single-file target
is preserved exactly.

**Why is the communication style an output style rather than a line in
`CLAUDE.md`?**

Because Claude Code has a surface built for exactly that, and an instruction
lands better in the surface designed for it than in the catch-all memory file.
It is also switchable: an output style you can turn off is a preference, while a
line in `CLAUDE.md` is an always-on instruction competing with everything else
in there. Codex has no equivalent, so its `AGENTS.md` keeps the same guidance
inline, which is the per-host authoring rule doing its job.

**Why are `globals/CLAUDE.md` and `globals/AGENTS.md` different files rather
than one source?**

Because they are genuinely different documents. Instructions about sandbox
escalation or a host-specific CLI belong in one and not the other. Deriving one
from the other would mean either shipping irrelevant instructions to a host or
inventing a conditional syntax to suppress them. Two authored files is simpler
and honest about what it is.

**I want the rules but not the global document (or vice versa).**

`--skip-globals` installs rules only and leaves the instruction document alone.
`--tier core` restricts to the unconditional rules.

**I already hand-wrote a block with informal `<!-- name -->` fences. Will I get a
duplicate?**

Not if the rule declares that marker as a legacy form. The pack recognises the
paired-identical-marker style and upgrades it in place to a proper managed
block.

**Why did it skip a rule?**

A rule can declare a precondition: for instance, needing a particular MCP
server configured on that machine. Where the precondition is unmet the rule is
skipped and the reason is stated, rather than installed as an instruction to
reach for something that is not there.

**What is an "orphan"?**

A marked block on the machine whose rule is no longer in the pack. Orphans are
always reported. They are only removed if you pass `--prune`.

**What is "unmanaged"?**

Everything the pack does not own, handed back for you to read. This is the part
worth actually reading: a rules directory is a flat namespace, so an instruction
you wrote under a different filename never collides with the pack's copy: both
install, and you get the same thing twice. Nothing mechanical can detect that.

**Can I run it on a machine with no plugin installed?**

Yes. That is the point of the second entry point:

```
npx github:giostriquer/workshop --dry-run
```

Same implementation, no install required. Drop `--dry-run` to apply.

**How do I change what ships?**

Edit it in the plugin's repository and cut a release, never patch a machine.
Global documents live under `globals/`, one per host; output styles under
`output-styles/`; `rules/manifest.json` holds the host list, each host's
targets, and the rule and output-style lists. Adding a host is a manifest entry
plus its `globals/<HOST>.md`, not a code change. Because the content is
versioned with the plugin, every machine converges on the same thing the next
time the skill runs, which is the entire point.

**Does it work on Gemini / opencode / Cursor?**

Not out of the box; only Claude Code and Codex ship as targets. Adding another
single-file host is a manifest entry and one authored document.

## It's working if

- A fresh machine ends up carrying the same shipped configuration as every
  other, in one run.
- A second run reports everything `unchanged`; it is idempotent.
- A shipped output style shows up in `/output-style` on the machine, ready to
  select.
- A change released in the pack lands on the next run of every machine, without
  anyone editing a machine by hand.
- Hand-written global instructions already on the machine are still there
  afterwards, untouched.
- Negative signal: you find yourself editing `~/.claude/CLAUDE.md`,
  `~/.claude/rules/`, or `~/.codex/AGENTS.md` directly to work around what the
  tool did. Collisions are meant to be surfaced and decided, not hand-patched
  around.

## Where it fits

`adopt-global-rules` sits entirely outside the workbench flow. Nothing hands off
to it and it hands off to nothing; it is machine setup, run once per machine and
then whenever the pack is released. Its closest relative in spirit is
[model-reference](model-reference.md): model-reference describes the routing doctrine and
deliberately carries no concrete fleet policy, while this skill is where the
workshop's concrete policy (its model floor included) actually ships and
reaches a machine.
