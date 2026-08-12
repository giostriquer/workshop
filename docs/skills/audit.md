# audit

Workbench's investigation door: sizes an investigation with the user, dispatches the
right engine, confirms flagged uncertainty, routes the exit. **Workbench-native**
(no upstream lineage) and its one unproven piece — expect tuning. Rationale:
[`workbench-system.md`](../decisions/workbench-system.md).

## Use it

- Trigger: "audit X", "check whether …", "is the refactor actually done?", "hunt
  this bug" — anything that starts as a question about reality, not an idea to
  build.
- The protocol: **size first** (quick look inline · deep = `claim-check` · sweep
  = `qa-sweep`; asked via `AskUserQuestion` when available, a numbered list
  otherwise; recommend one, user picks) → engine runs → **flags come back as
  questions** (only when flags exist) → **exit by shape** (report-and-done ·
  feature/refactor → `brainstorming` with findings as context · confirmed fix →
  route pick).
- Sizing carries a **runtime modality flag**: when the target is behavior a
  real client can drive (endpoint, running-app flow, CLI), the same question
  confirms whether the check should drive the booted app — the confirmation
  travels to the engine as part of the workload.
- Example: "check whether the session-cache refactor is complete" → deep audit →
  `partially-confirmed` + two flags → user resolves → refactor-shaped → handed
  to brainstorming.

## Don't

- Don't let it investigate — beyond the quick-look tier, engines own the rigor.
- Don't grow a quick look into a deep audit silently; that's the user's call.
- Don't pause for confirmation when nothing was flagged, or skip it when
  something was.
- Don't start the revealed work — its last act is always a hand-off.
- Don't use it for idea-first work; that path grounds against the codebase and
  goes to `brainstorming` directly.
