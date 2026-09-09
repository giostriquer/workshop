# Workbench doctrine: the rules-layer snippet

The one piece of workbench that lives *outside* the plugin: a short, neutral
standing rule for the operator's own rules layer (global `~/.claude/rules/` /
`CLAUDE.md`, distributed by toolkit:adopt-global-rules, or pasted into a
project's `CLAUDE.md`). It makes a fresh session know the flow exists; the
`using-workbench` skill carries the detail on demand. This is deliberately informational,
with no MUST-language or red-flags tables; that layer is what workbench removed.

Copy from here:

```markdown
# Workbench flow

My environments follow the **workbench** flow (workbench plugin):

- **Start:** investigations go through `audit` using my requested scope; unresolved feature
  and refactor design goes through `brainstorming`, carrying my route choice:
  direct / plan / handoff-goal. Implementation agency (in-session vs dispatched)
  is mine and the harness's; hand the implementer the plan or goal if one exists.
- **Finish:** when you consider the implementation ready: test-quality review,
  verify with evidence (`verification-before-completion`; offer
  `empirical-proof` for runnable surfaces: run it only if I ask or a standing
  rule authorizes), an adversarial review at readiness (`code-quality-review` + comment
  trim per repo rules), then outline what was done and ask me: PR or merge?
  Existing repo/user authority carries forward. Re-review only material new risk; do not repeat unchanged checks or decisions.
- **Flow artifacts are disposable**: plans, audit reports, design docs live
  under `.workbench/<work_scope>/` (or `.tmp/workbench/<work_scope>/`) and last
  only for the work; promote to durable only when I ask or the repo has an
  established pattern.
- Details on demand via the `using-workbench` skill. These are defaults, not
  gates I haven't asked for, never force process.
```
