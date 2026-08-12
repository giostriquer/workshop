# Workbench doctrine — the rules-layer snippet

The one piece of workbench that lives *outside* the plugin: a short, neutral
standing rule for the operator's own rules layer (global `~/.claude/rules/` /
`CLAUDE.md`, distributed by the planned npx global-rules pack — or pasted into a
project's `CLAUDE.md`). It makes a fresh session know the flow exists; the
`using-workbench` skill carries the detail on demand. Deliberately informational —
no MUST-language, no red-flags tables; that layer is what workbench removed.

Copy from here:

```markdown
# Workbench flow

My environments follow the **workbench** flow (workbench plugin):

- **Start:** investigations go through `audit` (I size the workload); feature
  and refactor ideas go through `brainstorming`, which ends at MY route pick —
  rawdog / plan / handoff-goal. Implementation agency (direct vs agentic) is
  mine and the harness's; hand the implementer the plan or goal if one exists.
- **Finish:** when you consider the implementation ready — test-quality review,
  verify with evidence (`verification-before-completion`; `empirical-proof` if
  runnable), ONE adversarial review (`code-quality-review` + comment trim per
  repo rules), then outline what was done and ask me: PR or merge? Explicit
  repo/user rules may pre-authorize.
- **Flow artifacts are disposable** — plans, audit reports, design docs live
  under `.workbench/<work_scope>/` (or `.tmp/workbench/<work_scope>/`) and last
  only for the work; promote to durable only when I ask or the repo has an
  established pattern.
- Details on demand via the `using-workbench` skill. These are defaults, not
  gates I haven't asked for — never force process.
```
