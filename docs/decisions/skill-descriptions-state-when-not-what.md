# Skill descriptions state when to load the skill

Descriptions are the discovery surface. State the task, symptoms, and useful
exclusions; keep the procedure in the skill body. A workflow summary can tempt
a consuming agent to act on the listing instead of reading the contract.
The repo-local `writing-skills` skill owns this authoring rule.

The original audit removed procedure summaries from TDD, CI repair, self-audit,
brainstorming, claim-check, and model-reference descriptions. Existing body
instructions were preserved. That pass was static conformance, not a pressure
test or evidence of improved reliability.

Routing exclusions can be longer when they distinguish neighboring skills.
Current triggers come from each spec; older notes about empirical proof being
optional, reviewer exemptions, and model grades do not override those specs.
The usage handbook links the contracts rather than maintaining another trigger
catalog. Unresolved historical suggestions are not current requirements.

## using-workbench's description excludes dispatched subagents (2026-11-09)

The orientation's body told a subagent dispatched for a specific task to skip
it, but the description, which decides the load, did not. In the week of
2026-11-02, 131 of 170 Codex subagent threads read the file, 117 of them in
full, as comment trimmers, reviewers and CI watchers; Claude Code subagents
read it 0 times. An exclusion in the body cannot prevent a load, so the
description now ends "Not for a subagent dispatched to execute a specific task."
