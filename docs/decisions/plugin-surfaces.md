# Plugin surfaces: decisions in force

Rationale for how the `workbench` and `toolkit` plugins reach Cursor, Google Antigravity, OpenCode, and Muse alongside their Claude Code and Codex marketplaces; superseded choices are omitted and git history keeps the originals.

## Cursor as a parallel marketplace (2026-06-30)

Cursor has its own marketplace convention, so the repo carries a third parallel surface: a root `.cursor-plugin/marketplace.json` listing each plugin by short `source` name under `metadata.pluginRoot: "plugins"`, and a per-plugin `.cursor-plugin/plugin.json` with version and metadata. Each Cursor manifest keeps the same version as its Claude and Codex counterparts, and the validator refuses drift, so an additive packaging surface ships at the versions in flight instead of forcing a bump. Each plugin carries its own MIT `LICENSE`. Neither plugin ships Cursor rules, so the manifests declare none. Install goes through Cursor's Team Marketplace import-from-repo flow, because custom-repo marketplaces are a Teams/Enterprise admin feature.

## Antigravity: a root manifest, no self-registration (2026-08-13)

Antigravity treats any directory with a root `plugin.json` as a plugin and finds plugins only by scanning a workspace's `.agents/plugins/` and the global `~/.gemini/config/plugins/`. Each plugin therefore carries a root `plugin.json` held to the same name and version as its other manifests, and the existing `skills/<skill>/SKILL.md` layout needed no change. With no registry file to point at, the repo does not self-register: adoption is copying or linking a plugin folder into a scanned directory. Self-registration was rejected because copies under `.agents/plugins/` would drift, Windows junctions do not survive a clone, and moving the canonical home there would break the Claude marketplace sources and collide with the Codex marketplace file. The surface carries no agents, since the format covers only skills, rules, MCP servers, and hooks, and no `rules/` payload, since the `adopt-global-rules` pack is content that skill installs, not rules that fire every session.

## OpenCode: skills by directory scan, nothing to register (2026-08-21)

OpenCode has no marketplace or content manifest: its `plugin` config takes npm or JS/TS hook modules, and skills load by scanning `~/.config/opencode/skill/` and any `skills.paths` roots for `SKILL.md`. The existing layout already fits, so adoption is pointing global `skills.paths` at a clone's two `skills/` directories or copying skill folders into the scanned directory. No `.opencode-plugin/` manifest or registry entry exists, because either would be inert fiction, the mistake the Antigravity surface first made, and the validator refuses one. The validator also requires each skill's frontmatter `name` to match its folder in lowercase-hyphen form, OpenCode's loader rule and one Claude Code shares. The review agents are not converted to OpenCode's different agent format, since another mirror adds drift, and no npm shim injects `skills.paths` when a config edit does the same. Neither OpenCode nor Antigravity is an `adopt-global-rules` host target; adding one is a separate decision.

## Muse: a native per-plugin manifest on the Claude marketplace catalog (2026-10-14)

Muse (probed with Muse 1.4.8) has plugins and marketplaces of its own, shaped close to Claude Code's. It could already install both plugins before this surface existed: `muse plugins marketplace add` reads a catalog from `marketplace.json`, `.agents/plugins/marketplace.json`, or `.claude-plugin/marketplace.json`, and its Claude-compatible importer then reads each plugin's `.claude-plugin/plugin.json` and scans `skills/`. The Muse marketplace therefore rides the existing Claude catalog, and the validator refuses a root `.muse-plugin/marketplace.json`: Muse does not probe that path, so the file would be inert fiction of the kind the OpenCode section records. Each plugin instead carries a native `.muse-plugin/plugin.json` (`schemaVersion: 1`, `compat.source: "native"`), which Muse prefers when present. The native manifest enumerates skills (`{id, path}`) instead of scanning the directory, so the validator holds the enumeration and each canonical path to the same expected list as the directory, and the version to the other manifests'. Its capability families are exactly `skills`, `commands`, `hooks`, `mcpServers`, and `reminders`; neither plugin ships the last four, and the validator keeps them empty and rejects any other family. Muse reports one warning per plugin, `multiple-manifests` for ignoring the other hosts' manifests; that is inherent to a multi-host package and accepted. All 39 skills pass `muse skills validate` under its `agent-skills-common-subset` profile with no unknown or unsupported fields.

The release helper includes the Muse manifest in version updates and version-only
change detection. Codex-only submission exports exclude `.muse-plugin/`, so
transformed skills cannot be advertised as a native Muse package. Focused fixtures
check both consumers as well as manifest validation.

Muse registers agents, unlike Codex. Each `agents/<name>.md` imports as an agent definition `workbench/<name>` under either manifest family, held at `review_needed` until the operator runs `muse plugins approve workbench`; skills need no approval. Dispatch is therefore the Claude Code shape, written once in `using-workbench` under *Workbench agents on Muse* and named per agent in its Dispatch line: by the scoped id, with no model and nothing pasted. A missing or unapproved definition is a reported gap, never a generic spawn with a pasted contract, which remains only the Codex route. The `model-reference` exceptions say Muse resolves the definition's model pin on its own fleet; what the Claude-model names in agent frontmatter map to there was not observed, so no Muse model id is pinned anywhere. Plan-only probes of the new wording, one fresh-context parent per question, each asked for the exact spawn it would make:

| Question | This wording |
|---|---|
| Muse watcher after a push: scoped id `workbench/ci-watcher`, run inputs only, no contract pasted | 1 of 1 |
| Muse watcher with the definition still `review_needed`: no spawn, no parent polling, gap reported with the approve command | 1 of 1 |
| Muse `file-pr` test review: scoped id `workbench/test-quality-reviewer` with the base branch, no contract pasted | 1 of 1 |

One rep per question is regression evidence for these dispatch shapes, not a reliability estimate, and the parents wrote plans rather than spawning, so it says nothing about how an imported definition behaves at run time. A run-time smoke test after a real install found the current limit of that: in `muse exec` the six definitions appear in the session's reviewed catalog and `muse plugins inspect` reports them `trusted_enabled` with no diagnostics, yet both a native subagent spawn and a Workflow `agentType` delegation for `workbench/pattern-reviewer` were rejected as `agent_definition_unavailable`, while a `general-purpose` spawn in the same mode succeeded. No CLI surface gives a deeper cause. Until a Muse release admits them, the dispatch rule degrades as written: the parent reports the monitoring or review gap instead of substituting a generic agent. Interactive-session spawning was not tested. Revisit this paragraph on the first Muse release where an approved definition spawns; nothing in the repo needs to change for that, since the Dispatch lines already name the scoped ids.

## Muse implicit-invocation hole, accepted (2026-10-14)

The native plugin loader in Muse 1.4.8 ignores `disable-model-invocation`. The same `SKILL.md` reports `user-invocable-only` installed as a user skill and under the Claude-compatible plugin importer, but `on` under a native manifest, so the eleven user-invoked-only skills are model-invocable on Muse through the native surface. `enabledDefault: false` in the manifest is not the missing policy either: it yields activation `off`, not user-invocable-only. This is the Codex parity failure one host over, with no sidecar equivalent to ship. The alternatives were dropping the native manifest for the Claude-compatible importer (policy and agents both hold; the cost is the display name and five more import warnings) or shipping those skills disabled. The operator chose the native manifest anyway, so this surface knowingly does not hold invocation parity until the Muse loader honors the key, at which point the frontmatter already in the skills makes it hold with no repo change. Per machine, `muse skills user-only plugin:<plugin>:<skill> --scope plugin` restores the policy; the README's Muse install notes say so. A validator gate refusing the native manifest was considered and declined in the same decision, since the manifest is the surface the operator wants; the hole is recorded here instead of gated.

## Muse: adopt-global-rules host, and repo-local skill precedence (2026-10-14)

Muse is an `adopt-global-rules` host target (the separate decision the OpenCode section anticipated). Its user instruction document is `~/.config/muse/AGENTS.md`, canary-proved by loading a marker file there in a scratch home and reading it back from the session log; `XDG_CONFIG_HOME` is honored, and the pack's home-relative target assumes the default `~/.config`, as its other hosts assume their default homes. Muse has no rules directory and no output-style surface, so the host is `file` mode like Codex: `globals/MUSE.md`, authored for its sandbox and approval flow, and the shared rules land as fenced blocks in the same file. A separate host is needed because, while Muse reads `~/.claude/CLAUDE.md`, a canary in `~/.claude/rules/` was not loaded, so the claude host's rules never reach a Muse session. The adopted file was verified end to end: a dry run, an apply, an idempotent re-run, and a scratch-home session loading the result.

For project skills Muse scans `.agents/skills`, `.codex/skills`, and
`.claude/skills`, in that precedence order (probed with the same skill id in
all three); `.muse/skills` and a bare `skills/` are not scanned. Repo-local
maintenance skills are canonical in `.claude/skills/` and fully mirrored into
`.codex/skills/`, whose copy Muse selects. The validator compares every complete
folder, excluding Codex's host-specific `agents/` sidecars. See
[repo tooling](repo-tooling.md#repo-local-discovery-and-documentation-ownership-2026-10-14)
for the mirror and agent-scope decision. Muse 1.4.8 did not load project agent
files in the probe; this repository now has no repo-scoped agent definitions.

## Codex implicit-invocation parity (2026-09-24)

Codex ignores the `disable-model-invocation` frontmatter key. It reads a skill's invocation policy only from a sibling `agents/openai.yaml`, where `policy.allow_implicit_invocation` defaults to true. A 30-day Codex usage audit found `handoff-goal` loaded implicitly in 12 of 24 `/goal` sessions with no explicit invocation, and users typing "don't use handoff-goal" into continuation prompts; `self-audit` and `epic-orchestration` loaded the same way. Every skill that sets `disable-model-invocation: true` therefore also ships `agents/openai.yaml` with an `interface` display name and short description and `policy.allow_implicit_invocation: false`. That keeps the skill out of Codex's model context, while `$skill` still invokes it explicitly. `codex debug prompt-input` (CLI 0.155.1) confirms the effect: a skill with only the frontmatter key appears in the model-visible skill list, and the same skill with the sidecar does not. The validator fails a skill that sets the frontmatter key without that sidecar policy, so a new user-invoked skill cannot ship implicit on Codex again. Only a direct child of `policy:` counts, at the indentation of the first indented line beneath it: a `false` nested deeper does not satisfy the check, and a direct child set to anything but `false`, even beside a `false`, fails it.

## Codex submission export (2026-09-25)

The bundled OpenAI plugin-ingestion validator rejects
`disable-model-invocation: true`, although Codex's runtime ignores that Claude
frontmatter field and reads `agents/openai.yaml`. Removing the field from shared
sources would enable automatic invocation on Claude. Keep both host policies in
the canonical skills and export a Codex-only package with
`scripts/export-codex-plugin.py` when preparing an OpenAI submission. The export
removes only that frontmatter field after checking the corresponding Codex policy
is the boolean `false`. It accepts the canonical inline `true` or `false` spelling
and rejects unsupported YAML forms before writing output. Skill bodies, sidecars, supporting files, and agent
contracts stay intact. Other hosts' manifests are excluded from the export.

The export refuses an existing destination and any destination inside its source.
Validate the generated package with OpenAI's bundled validator; the native
validator continues to check shared-source parity. Marketplace installs keep
using the shared sources. This is an export boundary, not a second maintained
skill tree or a validator exception. Codex starter prompts describe only skills
shipped by their own plugin: PR-comment triage belongs to Toolkit, and repository
skill-authoring tools are not advertised by either plugin.

## Codex agents: the parent pastes the contract (2026-09-24)

Workbench ships its subagents as Claude Code agent files, which Claude Code registers with their frontmatter and body. A Codex plugin manifest has no agents field: its parser reads skills, MCP servers, apps, hooks and interface metadata ([manifest.rs](https://github.com/openai/codex/blob/main/codex-rs/core-plugins/src/manifest.rs)), and plugin agents are open requests ([openai/codex#18308](https://github.com/openai/codex/issues/18308), [#18988](https://github.com/openai/codex/issues/18988)). The Codex dispatch lines therefore spawned a generic agent with pinned `model`, `reasoning_effort` and `fork_turns: "none"`, and a message telling the child to follow the agent file from the installed plugin. A 30-day study of Codex CI watchers found the pointer failing: 43 of 46 watchers never read `agents/ci-watcher.md`, 36 of them read `fix-ci`'s `SKILL.md` instead, the parent workflow with its fix, commit and push steps, and one watcher, reused through a follow-up task, edited four source and test files and ran `git commit` and `git push`.

The published multi-host process-skill collections do not use a pointer. obra/superpowers retired its only named agent and dispatches a generic subagent with a self-contained prompt template ([obra/superpowers#1299](https://github.com/obra/superpowers/pull/1299)); EveryInc's Compound Engineering review reads each reviewer persona file and spawns a generic subagent with its text, never a typed agent or a platform registration ([dispatch-reviewers.md](https://github.com/EveryInc/compound-engineering-plugin/blob/main/skills/ce-code-review/references/dispatch-reviewers.md)); mattpocock/skills and openclaw work the same way. Each sets model and effort on the spawn call and keeps read-only as a sentence in the pasted text.

At each Codex dispatch site the parent now reads the agent file from the plugin its current skill was loaded from, `agents/<name>.md` at the plugin root, two directories above that skill's `SKILL.md`, which holds in the Codex plugin cache as in a clone. The `spawn_agent` message is `You are the <name>. Your contract:`, then the file's body after its frontmatter, verbatim, then the run's inputs: the PR, pinned head SHA and deadline for `ci-watcher`, the three labeled sections for `code-quality-reviewer`, the question or target and base branch for `test-quality-reviewer`. The model, effort and `fork_turns` pins stay, and they live in the agent file too: each workbench agent file carries one **Dispatch** line near its top naming its dispatch per host, next to the contract the Codex parent is already reading. The rule is written once, in `using-workbench` under *Workbench agents on Codex*: on Claude Code, dispatch the registered agent by name with no model; on Codex, spawn with the arguments the Dispatch line names. Each call site in `fix-ci`, `code-quality-review`, `test-quality-review` and `file-pr` names the agent and the run's inputs, plus one clause, "on Codex, paste the agent file and use its Dispatch line", so a parent that loaded only that skill still dispatches correctly. The first draft restated the Codex values at every site, up to four times per agent counting the usage pages, and told parents to keep "the dispatching skill's" pins, so a change to one agent's model or effort meant finding every copy. `model-reference` keeps the policy, which model and effort and why, in its two exceptions. The agent file stays the single source, with no second copy of a contract in the repo, so nothing drifts; Claude Code dispatch is unchanged, since the registered agent carries its contract. The cost is the contract in every spawn message, written by the parent: about 1.6k characters for the test reviewer, 4k for the code reviewer and 8.5k for the watcher. From the same incident, a follow-up to a spawned agent (`followup_task` or an equivalent) carries only that agent's own next job: for a returned watcher, a new pinned head, which makes it that head's one watcher. The fix, the commit and the push stay in the parent. The follow-up rule lives in `using-workbench`, and `fix-ci` points to it, adding that the flake rerun's watcher is a fresh spawn because its head is not new.

Three alternatives are set aside for now. A Codex agent-role TOML cannot ship in a plugin, so it needs a per-machine or per-repo install and a second copy of each contract, and a role's `sandbox_mode` is not applied at spawn: role overrides apply developer instructions, model, effort and a handful of other settings, and no sandbox ([role.rs](https://github.com/openai/codex/blob/main/codex-rs/core/src/agent/role.rs)). A plugin hook sees `SubagentStart` with the child's id and role, which is `default` for these generic spawns, so it could tell a watcher from another child only by parsing the message the parent already writes, and it adds a surface that runs on every spawn in every session. Cursor's per-agent `readonly` field waits until a probe shows how Cursor treats it on a plugin agent; the operator declined it until then.

Plan-only probes in fresh contexts, recorded below: Opus 5.5 subagents role-playing a Codex CLI 0.155.1 parent (V2 multi-agent tools, the workbench plugin cached at a placeholder home), reading the installed skill and agent files and writing the exact tool calls they would make. The draft that first ran the follow-up probe said "other work gets its own spawn and contract"; one of three parents read that as license to spawn a worker for the fix, which `fix-ci` keeps in the parent, so the wording now sends any other job where its skill puts it and `fix-ci` says the fix, commit and push stay in the session.

| Question | 0.41.6 wording | This wording |
|---|---|---|
| Watcher after a push: spawn message carries the `ci-watcher` body verbatim | 0 of 3 (each pointed at the file by its cache path) | 3 of 3, then 2 of 2 |
| Watcher: `gpt-6-sol`, `xhigh`, `fork_turns: "none"`, and the PR, pinned SHA and deadline | 3 of 3 | 3 of 3, then 2 of 2 |
| `file-pr` review: code reviewer message carries the `code-quality-reviewer` body verbatim | 0 of 3 (named the skill) | 3 of 3 |
| `file-pr` review: code reviewer gets `fork_turns: "none"`, no model, and the three sections | 2 of 3 (one pointed it at `git diff`) | 3 of 3 |
| `file-pr` review: test reviewer message carries the `test-quality-reviewer` body verbatim, with its pins and base branch | 0 of 3 | 3 of 3 |
| `test-quality-review` audit: test reviewer message carries the body verbatim | 0 of 2 (one pinned the skill's cache path) | 2 of 2 |
| Red watcher, parent told to hand work to agents: the fix, commit or push goes to the watcher | 0 of 3 | 0 of 3, then 0 of 3 |
| The same: the fix stays in the parent | 3 of 3 | 2 of 3 (one spawned a fix worker), then 3 of 3 |
| The same: the new head's watcher has the contract | 0 of 3 (a new spawn with a pointer) | 3 of 3 (a follow-up carrying only the new head), then 3 of 3 |
| Claude Code parent: dispatches `workbench:ci-watcher` by name, no model, nothing pasted | 3 of 3 | 3 of 3 |

"Then" counts are the final wording; the other new-wording counts ran on the first draft, whose paste instructions match it. The follow-up probe did not reproduce the incident: no current-wording parent sent the fix to the watcher, so the follow-up rule rests on the study, and the probe shows only that the new sentences do not invite it. The parents were Opus 5.5 role-playing Codex, not a Codex model, and wrote plans rather than running them, so the probes say nothing about how a watcher behaves with its contract pasted. Three reps per arm or fewer is bounded regression evidence for these dispatch shapes, not a reliability estimate.

The Dispatch line was probed the same way, with Opus 5.5 parents role-playing Codex CLI 0.155.1 or Claude Code, comparing the first draft, which restated the values at each site, with this wording.

| Question | First draft | This wording |
|---|---|---|
| Codex `file-pr` review: code reviewer spawned with `fork_turns: "none"`, no model or effort, the body pasted and the three sections | 2 of 2 | 3 of 3 |
| Codex `file-pr` review: test reviewer spawned with `gpt-6-sol`, `xhigh`, `fork_turns: "none"`, the body pasted and the base branch | 2 of 2 | 3 of 3 |
| Codex watcher after a push: the spawn carries `gpt-6-sol`, `xhigh`, `fork_turns: "none"`, the body, the PR, SHA and deadline | 2 of 2 (fresh spawns) | 3 of 3 (each sent the returned watcher a follow-up with only the new head, and wrote this spawn as the fallback) |
| Codex flake rerun: a fresh spawn with the watcher's pins, not a follow-up | 2 of 2 | 3 of 3 |
| Claude Code parent: all three agents dispatched by name, no model, no contract pasted | 2 of 2 | 3 of 3 |

The shorter call sites lost nothing: every Codex spawn in both arms carried the right pins, and this wording's parents cited the Dispatch line as their source. The after-a-push difference is a choice both wordings allow. Two or three reps per arm is bounded regression evidence for these dispatch shapes, not a reliability estimate.
