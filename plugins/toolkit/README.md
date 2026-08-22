# toolkit

Optional utilities from
[Workshop](https://github.com/giostriquer/workshop): the grab-bag of optional tools next
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

**Cursor**: Team Marketplace (Teams/Enterprise, admin): import
`giostriquer/workshop`, then install `toolkit` from **Customize**.

**Google Antigravity:** Copy or link this folder into your workspace's `.agents/plugins/toolkit/` (that workspace only) or into `~/.gemini/config/plugins/toolkit/` (every workspace). Antigravity scans both; there is no registry file to edit.

**OpenCode:** No marketplace file exists on this surface; opencode loads skills by scanning directories. Point your global config's `"skills": { "paths": [...] }` at this folder's `skills/` directory in a clone of the repo, or copy individual skill folders into `~/.config/opencode/skill/`.

## Skills

| Skill | Does |
| --- | --- |
| `html-report` | renders a markdown report or findings reached in-session as a polished standalone dark HTML page |
| `arch-map` | derives a visual architecture map of a subsystem, refactor, or proposed design when no source doc exists |
| `ui-demo-video` | provides a Playwright walkthrough of the running app, verification frames for the model, and an MP4 for the PR |
| `get-pr-comments` | triages the PR's conversation, review, and inline comments into a prioritized action list; read-only |
| `adopt-global-rules` | installs the workshop's shipped global CLAUDE.md / AGENTS.md, rules, and Claude output styles onto this machine additively; user-invoked only |
| `me-human` | acts as a human user putting a system to real work by trying before asking, escalating on bugs, and stopping at the scope edge; user-invoked only |

`adopt-global-rules` also runs without any plugin installed, for bootstrapping a
bare machine:

```powershell
npx github:giostriquer/workshop --dry-run   # plan; drop --dry-run to apply
```

## Not included

No MCP servers, no hooks, no dispatchers: skills activate on their own triggers
or your invocation.
