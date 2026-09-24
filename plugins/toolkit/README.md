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
| `html-artifact` | creates HTML reports, plans, architecture explanations, and interactive product targets; user-invoked only |
| `ui-demo-video` | provides a Playwright walkthrough of the running app, verification frames for the model, and an MP4 for the PR |
| `get-pr-comments` | triages the PR's conversation, review, and inline comments into a prioritized action list; read-only |
| `adopt-global-rules` | installs the workshop's shipped global CLAUDE.md / AGENTS.md, rules, and Claude output styles onto this machine additively; user-invoked only |
| `me-human` | dogfoods a system from a human user's perspective by trying before asking, escalating on bugs, and stopping at the scope edge; user-invoked only |
| `test-audit` | gates a test before it lands, and audits or prunes existing tests that are low-value, duplicative, or coupled to implementation; user-invoked only |
| `dependency-audit` | audits a project's dependencies read-only (safe bumps, bumps with their caveats and the code they touch, conflicts, advisories, removal candidates with evidence), then applies the groups you pick in batches through the package manager; user-invoked only |
| `grill-me` | interviews you about a plan, design, or idea in rounds of questions with recommended answers until every branch is settled; user-invoked only |
| `grilling` | the round-based interview that `grill-me` and `improve-codebase-architecture` run |
| `improve-codebase-architecture` | surveys a codebase for deepening opportunities, writes an offline HTML report, then grills the candidate you pick; user-invoked only |
| `codebase-design` | the deep-module vocabulary (module, interface, depth, seam, adapter, leverage, locality) and its principles |
| `domain-modeling` | sharpens a project's domain terms in `CONTEXT.md` and offers ADRs for hard-to-reverse decisions |

> **Attribution:** `get-pr-comments` is derived from the `cursor-team-kit` plugin in Cursor's [cursor/plugins](https://github.com/cursor/plugins) (MIT, Copyright (c) 2026 Cursor), adapted per the [get-pr-comments decision](https://github.com/giostriquer/workshop/blob/main/docs/decisions/get-pr-comments.md).

> **Attribution:** `test-audit` is derived from OpenClaw's [openclaw/openclaw](https://github.com/openclaw/openclaw) `.agents/skills/test-audit` (MIT, Copyright (c) 2026 OpenClaw Foundation): adapted per the [test-audit decision](https://github.com/giostriquer/workshop/blob/main/docs/decisions/test-audit.md): user-invoked only, validation and landing made host- and stack-neutral, OpenClaw examples replaced with placeholders.

> **Attribution:** `grill-me`, `grilling`, `improve-codebase-architecture`, `codebase-design` and `domain-modeling` are derived from Matt Pocock's [mattpocock/skills](https://github.com/mattpocock/skills) (MIT, Copyright (c) 2026 Matt Pocock), with improvements to `improve-codebase-architecture` and `codebase-design` adapted from the `pstack` plugin in Cursor's [cursor/plugins](https://github.com/cursor/plugins) (MIT, Copyright (c) 2026 Lauren Tan): adapted per the [mattpocock-skills decision](https://github.com/giostriquer/workshop/blob/main/docs/decisions/mattpocock-skills.md).

`adopt-global-rules` also runs without any plugin installed, for bootstrapping a
bare machine:

```powershell
npx github:giostriquer/workshop --dry-run   # plan; drop --dry-run to apply
```

## Not included

No MCP servers, no hooks, no dispatchers: skills activate on their own triggers
or your invocation.
