# toolkit

Optional utilities from
[Workshop](https://github.com/giostriquer/workshop), alongside [`workbench`](https://github.com/giostriquer/workshop/blob/main/plugins/workbench/README.md). Install the skills you need for artifacts, review, architecture, or machine setup.

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

**Muse:**

```sh
muse plugins marketplace add workshop https://github.com/giostriquer/workshop
muse plugins install toolkit@workshop
```

Muse's native loader currently ignores user-invoked-only skill policy. See
[the host limitation and per-machine workaround](https://github.com/giostriquer/workshop/blob/main/docs/decisions/plugin-surfaces.md#muse-implicit-invocation-hole-accepted-2026-10-14)
for skills marked user-invoked only below.

**Cursor**: Team Marketplace (Teams/Enterprise, admin): import
`giostriquer/workshop`, then install `toolkit` from **Customize**.

**Google Antigravity:** Copy or link this folder into your workspace's `.agents/plugins/toolkit/` (that workspace only) or into `~/.gemini/config/plugins/toolkit/` (every workspace). Antigravity scans both; there is no registry file to edit.

**OpenCode:** No marketplace file exists on this surface; opencode loads skills by scanning directories. Point your global config's `"skills": { "paths": [...] }` at this folder's `skills/` directory in a clone of the repo, or copy individual skill folders into `~/.config/opencode/skill/`.

For each standalone skill copy, also copy this plugin's [LICENSE](LICENSE) and
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) into the copied skill folder.
Keep both files with full-plugin copies and exports as well.

## Skills

The architecture survey requires Workbench's `codebase-design` and
`domain-modeling`. `correct` uses Workbench's `codebase-design` when prevention
requires a design choice. Install Workbench alongside Toolkit for those paths.
`grill-me` and `grilling` remain self-contained in Toolkit.

| Skill | Does |
| --- | --- |
| [`html-artifact`](skills/html-artifact/SKILL.md) | creates HTML reports, plans, architecture explanations, PR walkthroughs, and interactive product targets |
| [`anatomy`](skills/anatomy/SKILL.md) | launches pinned, unchanged upstream Anatomy for detailed interactive isometric figures; user-invoked only, with an on-demand fetch |
| [`ketchup`](skills/ketchup/SKILL.md) | catches up on meaningful results, current evidence, and decisions waiting on the user; user-invoked only |
| [`why`](skills/why/SKILL.md) | reconstructs historical decision rationale, separating documented intent, inference and unknowns; user-invoked only |
| [`web-demo-video`](skills/web-demo-video/SKILL.md) | records a browser walkthrough with reusable CLI capture, scene frames, and optional MP4 |
| [`get-pr-comments`](skills/get-pr-comments/SKILL.md) | triages the PR's conversation, review, and inline comments into a prioritized action list; read-only |
| [`adopt-global-rules`](skills/adopt-global-rules/SKILL.md) | installs the workshop's shipped host-specific global instructions, rules, and Claude output styles onto this machine additively; user-invoked only |
| [`test-audit`](skills/test-audit/SKILL.md) | gates a test before it lands, and audits or prunes existing tests that are low-value, duplicative, or coupled to implementation; user-invoked only |
| [`dependency-audit`](skills/dependency-audit/SKILL.md) | audits and upgrades project dependencies; responds to supply-chain/security incidents across explicitly selected runtimes, containers, apps and OS software, verifying the active consumer after approved fixes |
| [`grill-me`](skills/grill-me/SKILL.md) | interviews you about a plan, design, or idea in rounds of questions with recommended answers until every branch is settled; user-invoked only |
| [`grilling`](skills/grilling/SKILL.md) | the round-based interview that `grill-me` and `improve-codebase-architecture` run |
| [`improve-codebase-architecture`](skills/improve-codebase-architecture/SKILL.md) | surveys a codebase for deepening opportunities, writes an offline HTML report, then grills the candidate you pick; user-invoked only |
| [`correct`](skills/correct/SKILL.md) | turns evidenced recurring mistakes into proportionate prevention and verifies it; explicit requests only |
| [`benchmark-checklist`](skills/benchmark-checklist/SKILL.md) | validates measured performance comparisons, with a lightweight path for requested ballparks |

> **Attribution:** `get-pr-comments` is derived from the `cursor-team-kit` plugin in Cursor's [cursor/plugins](https://github.com/cursor/plugins) (MIT, Copyright (c) 2026 Cursor), adapted per the [get-pr-comments decision](https://github.com/giostriquer/workshop/blob/main/docs/decisions/get-pr-comments.md).

`anatomy` is a launcher for Ryan's MIT-licensed
[Anatomy](https://github.com/wheresryan22/anatomy). Its complete upstream
package is fetched unchanged at a pinned commit when invoked; it is not
bundled here. See the [usage page](https://github.com/giostriquer/workshop/blob/main/docs/skills/anatomy.md) and
[decision](https://github.com/giostriquer/workshop/blob/main/docs/decisions/anatomy.md).

`ketchup` adapts Lauren Tan's MIT-licensed pstack skill from
[cursor/plugins](https://github.com/cursor/plugins). It preserves the current
task's authority and makes visuals optional. See its
[usage page](https://github.com/giostriquer/workshop/blob/main/docs/skills/ketchup.md) and
[decision](https://github.com/giostriquer/workshop/blob/main/docs/decisions/ketchup.md).

> **Attribution:** `test-audit` is derived from OpenClaw's [openclaw/openclaw](https://github.com/openclaw/openclaw) `.agents/skills/test-audit` (MIT, Copyright (c) 2026 OpenClaw Foundation): adapted per the [test-audit decision](https://github.com/giostriquer/workshop/blob/main/docs/decisions/test-audit.md): user-invoked only, validation and landing made host- and stack-neutral, OpenClaw examples replaced with placeholders.

> **Attribution:** `web-demo-video` adapts the verification workflow from Lauren Tan's `pstack` `create-verification-skill` in Cursor's [cursor/plugins](https://github.com/cursor/plugins) (MIT, Copyright (c) 2026 Lauren Tan). Its recorder uses Microsoft's [Playwright CLI](https://github.com/microsoft/playwright-cli) as an external tool. See the [web-demo-video decision](https://github.com/giostriquer/workshop/blob/main/docs/decisions/web-demo-video.md).

> **Attribution:** `grill-me`, `grilling` and `improve-codebase-architecture` are derived from Matt Pocock's [mattpocock/skills](https://github.com/mattpocock/skills) (MIT, Copyright (c) 2026 Matt Pocock), with improvements to `improve-codebase-architecture` adapted from the `pstack` plugin in Cursor's [cursor/plugins](https://github.com/cursor/plugins) (MIT, Copyright (c) 2026 Lauren Tan): adapted per the [mattpocock-skills decision](https://github.com/giostriquer/workshop/blob/main/docs/decisions/mattpocock-skills.md).

`adopt-global-rules` also runs without any plugin installed, for bootstrapping a
bare machine:

```powershell
npx github:giostriquer/workshop --dry-run   # plan; drop --dry-run to apply
```

`correct` and `benchmark-checklist` adapt Lauren Tan's MIT-licensed pstack
guidance in [cursor/plugins](https://github.com/cursor/plugins). The benchmarking
questions originate in [Brendan Gregg's checklist](https://www.brendangregg.com/blog/2018-06-30/benchmarking-checklist.html).
See the [correction decision](https://github.com/giostriquer/workshop/blob/main/docs/decisions/correct.md) and
[benchmark decision](https://github.com/giostriquer/workshop/blob/main/docs/decisions/benchmark-checklist.md).

`why` adapts Lauren Tan's MIT-licensed pstack guidance; the PR walkthrough
reference in `html-artifact` adapts Cursor's MIT-licensed `pr-review-canvas`.
See the [why decision](https://github.com/giostriquer/workshop/blob/main/docs/decisions/why.md)
and [HTML artifact decision](https://github.com/giostriquer/workshop/blob/main/docs/decisions/html-artifact.md).

## Scope

No MCP servers, no hooks, no dispatchers: skills activate on their own triggers
or your invocation.
