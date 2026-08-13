# toolkit

Optional utilities from
[Workshop](https://github.com/giostriquer/workshop) — the grab-bag of optional tools next
to the [`workbench`](../workbench/README.md). Install it when you want these; skip
it to keep sessions lean. The set grows with more optional utilities over time.

## Install

**Claude Code:**

```
/plugin marketplace add giostriquer/workshop
/plugin install toolkit@workshop
```

**Codex:**

```powershell
codex plugin marketplace add giostriquer/workshop --ref main
codex plugin add toolkit@workshop
```

**Cursor** — Team Marketplace (Teams/Enterprise, admin): import
`giostriquer/workshop`, then install `toolkit` from **Customize**.

## Skills

| Skill | Does |
| --- | --- |
| `html-report` | renders a report — a markdown doc, or findings reached in-session — as a polished standalone dark HTML page |
| `arch-map` | derives a visual architecture map — subsystem, refactor, or proposed design — when no source doc exists |
| `ui-demo-video` | Playwright walkthrough of the running app — verification frames for the model, mp4 for the PR |
| `writing-skills` | TDD applied to skill authoring — baselines, micro-tested wording, loophole closing |
| `adopt-global-rules` | installs the workshop's shipped global CLAUDE.md / AGENTS.md and rules onto this machine, additively — user-invoked only |
| `me-human` | act as a human user putting a system to real work — tries before asking, escalates on bugs, stops at the scope edge — user-invoked only |

`adopt-global-rules` also runs without any plugin installed, for bootstrapping a
bare machine:

```powershell
npx github:giostriquer/workshop --dry-run   # plan; drop --dry-run to apply
```

> **Attribution:** `writing-skills` is derived from
> [obra/superpowers](https://github.com/obra/superpowers) by **Jesse Vincent**
> (MIT), adapted per the
> [workbench-system decision](https://github.com/giostriquer/workshop/blob/main/docs/decisions/workbench-system.md).

## Not included

No MCP servers, no hooks, no dispatchers — skills activate on their own triggers
or your invocation.
