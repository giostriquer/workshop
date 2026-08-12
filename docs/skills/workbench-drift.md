# workbench-drift

The workbench set's upstream watchdog: a provenance manifest plus a bundled diff
script against [obra/superpowers](https://github.com/obra/superpowers), so
upstream owes the fork a *review* instead of the fork owing upstream a merge.
**Workbench-native and repo-local** — it lives at `.claude/skills/workbench-drift/`
and ships in no plugin: fork maintenance is agent-workshop's job, not an
adopter's. Rationale: [`workbench-system.md`](../decisions/workbench-system.md).

## Use it

- Trigger: "check superpowers drift", "anything new upstream?", or a periodic
  review; also when changing a piece's disposition (adopt a drop, drop an
  adopt).
- The loop: run `scripts/drift-check.mjs` (deterministic: fetch, diff
  `lastReviewed..HEAD`, group by disposition) → judge each **review-required**
  diff on its content (improvement / pressure-tuning / irrelevant) against the
  manifest's recorded *why* → recommend adopt / adapt / ignore, verdict-first →
  apply only what the user approves, always through the adaptation filter →
  advance the pin.
- Dropped-piece churn reports as counts only; new upstream pieces get proposed
  dispositions for the user.
- The manifest (`manifest.json`, beside the skill) is the system: repo, pin,
  per-piece lineage + disposition + why; native pieces sit in `nativePieces`,
  unwatched.

## Don't

- Don't advance the pin without completing the review (ignores included) — the
  pin asserts "everything up to here was seen."
- Don't auto-apply upstream changes, however small.
- Don't judge from commit messages — diffs only.
- Don't adopt upstream text as a copy — everything passes the defang/de-pipeline
  filter on the way in.
- Don't touch dropped pieces without an explicit user call; the skill may argue,
  never act.
