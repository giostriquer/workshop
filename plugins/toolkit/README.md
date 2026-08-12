# toolkit

Optional artifact-making utilities from
[Agent Workshop](https://github.com/giostriquer/agent-workshop) — the grab-bag of optional tools next
to the [`workbench`](../workbench/README.md). Install it when you want these; skip
it to keep sessions lean. The set grows with more optional utilities over time.

## Install

**Claude Code:**

```
/plugin marketplace add giostriquer/agent-workshop
/plugin install toolkit@agent-workshop
```

**Codex:**

```powershell
codex plugin marketplace add giostriquer/agent-workshop --ref main
codex plugin add toolkit@agent-workshop
```

**Cursor** — Team Marketplace (Teams/Enterprise, admin): import
`giostriquer/agent-workshop`, then install `toolkit` from **Customize**.

## Skills

| Skill | Does |
| --- | --- |
| `html-report` | renders a report — a markdown doc, or findings reached in-session — as a polished standalone dark HTML page |
| `arch-map` | derives a visual architecture map — subsystem, refactor, or proposed design — when no source doc exists |
| `ui-demo-video` | Playwright walkthrough of the running app — verification frames for the model, mp4 for the PR |
| `writing-skills` | TDD applied to skill authoring — baselines, micro-tested wording, loophole closing |

> **Attribution:** `writing-skills` is derived from
> [obra/superpowers](https://github.com/obra/superpowers) by **Jesse Vincent**
> (MIT), adapted per the
> [workbench-system decision](https://github.com/giostriquer/agent-workshop/blob/main/docs/decisions/workbench-system.md).

## Not included

No MCP servers, no hooks, no dispatchers — skills activate on their own triggers
or your invocation.
