# Release Notes

Release notes for the shipped plugins — `workbench` and `toolkit` — newest
first, one section per released version. Strictly plugin releases: repo-only
work (structure, docs, tooling) lives in `docs/decisions/` and the git log,
not here. **Bounded:** at most 15 release sections — adding one past the cap
deletes the oldest (git history keeps everything). Sections from before the
2026-08-11 plugin split (`reviewers`, pre-split `toolkit`) were dropped in the
2026-08-12 reformat.

## workbench 0.20.7 — 2026-08-12

- **One evidence home per work scope.** An audit run scattered evidence
  across three per-agent `/tmp` dirs; now the dispatching session hands the
  scope folder (`.workbench/<work_scope>/`) to every agent in its contract —
  `qa-sweep` and `empirical-proof` carry it in their environment facts,
  `claim-check`'s persist path and repro artifacts move to the scope folder,
  and `using-workbench` states the rule: one work scope, one folder; never
  per-agent temp dirs, never the system temp.
  ([decision](decisions/evidence-one-home-per-scope.md))
- **Repo-bookkeeping sweep.** Shipped skill and agent text carries no
  repo-local references: provenance footers reduced to attribution only
  (decision-doc links removed), `audit`'s footer dropped,
  `code-quality-reviewer`'s repo path reworded to the bundled skill file.
- **Descriptions re-trimmed.** `code-quality-review`, `empirical-proof`,
  `qa-sweep`, and `verification-before-completion` descriptions cut back to
  tight triggers after growing during the field-feedback rounds.

## toolkit 0.1.2 — 2026-08-12

- **Repo-bookkeeping sweep.** `writing-skills`: provenance footer reduced to
  attribution only; a stale plugin-placement claim corrected.

## workbench 0.20.6 — 2026-08-12

- **Adversarial review: scope boundary + timing (Q15).**
  `code-quality-review` fires once, only when the work-stream's
  implementation is believed complete, right before the PR-or-merge gate —
  never mid-implementation. Findings are labeled in-scope (blocking) or
  out-of-scope (follow-up); out-of-scope findings are recorded, not fixed,
  unless they prove the change unsafe or incorrect.
  ([decision](decisions/scope-guards-q15-q16.md))
- **Scope guard (Q16).** `using-workbench`: stop and bring a split/rescope
  question to the user when a change crosses owner areas the ask never named
  or grows well past the sized expectation; `test-driven-development`: tests
  for the accepted work's behaviors — adjacent defects become follow-up
  work, not a failing test and fix in place.
  ([decision](decisions/scope-guards-q15-q16.md))

## workbench 0.20.5 — 2026-08-12

- **Expensive verification is user-optioned (Q14).** `empirical-proof` and
  `qa-sweep` are offered, run only on explicit ask or standing authorization;
  `verification-before-completion` is the only always-on gate.
  ([decision](decisions/expensive-verification-user-optioned.md))
- **Verification picker + generated-artifact surfaces** (first field
  feedback). `using-workbench` gains a pick-by-shape verification map —
  "keep the standard, drop the frame"; "checkpoints, not reading
  assignments" — and `empirical-proof` names the generator case: the emitted
  artifact is the runnable surface; won't-build output is `broken`, not
  `blocked`. ([decision](decisions/verification-shape-feedback.md))
- **route-work recalibrated, then reduced to a pure reference table.** New
  rows (two-rung sol ladder, `gpt-5.6-luna` bulk lane, opus-5 re-graded);
  the rubric, process patterns, output contract, and dispatch mechanics all
  cut — a lookup, not a pre-dispatch step; `/toolkit:` invocations fixed to
  `/workbench:`. ([decision](decisions/route-work-recalibration-and-trim.md))
- **TDD is a default, not a mandate (Q13).** A stated repo/user convention
  displaces a conflicting discipline step, announced in one line; the
  anti-rationalization armor still catches self-negotiated skips.
  ([decision](decisions/tdd-default-not-mandate.md))
- **Worktree-location convention.** Repo/user rule first; absent one,
  `<repo>/.worktrees/<task-name>` behind a `git check-ignore` gate; the
  harness's native worktree mechanism preferred; never the system temp
  directory. ([decision](decisions/using-workbench-worktree-location.md))

## workbench 0.20.4 — 2026-08-12

- **Route renamed: "rawdog" → "direct"** across skills, manifests, READMEs,
  both flow diagrams, and the doctrine snippet; the "direct vs agentic"
  agency phrasing became "in-session vs dispatched" to keep the name
  unambiguous.
  ([decision](decisions/route-rename-direct-and-structured-gate.md))
- **The route gate asks structured**: `AskUserQuestion` when available
  (numbered list otherwise), user-facing labels — Direct / Plan /
  Long-running goal — recommendation first and marked; `handoff-goal` keeps
  its skill name.

## workbench 0.20.3 — 2026-08-12

- **audit — structured sizing ask.** The tier question goes through
  `AskUserQuestion` (numbered-list fallback), recommended tier marked; the
  pick stays the user's.
  ([decision](decisions/audit-sizing-ask-and-runtime-modality.md))
- **audit — runtime-modality flag.** When the target is behavior a real
  client can drive, the sizing question also confirms whether the check
  should drive the booted app; the confirmation travels to the engine as
  part of the workload.

## workbench 0.20.2 — 2026-08-11

- **Manifests tell the process-system story.** Identity-first descriptions
  across all three manifests and the marketplace (the flow's arc, the agents
  as backing, the no-hooks stance); Codex `defaultPrompt` reordered to walk
  the flow.

## toolkit 0.1.1 — 2026-08-11

- **Description accuracy pass.** Swap-era self-references ("install
  alongside toolkit") fixed to workbench; one identity-first description now
  consistent across all three manifests and the marketplace.

## workbench 0.20.1 — 2026-08-11

- **using-workbench triggers at session start** (description-as-dispatcher,
  hook-free); wording settled from a MUST-invoke variant to informational
  orientation — invoke on relevance, opt out when it doesn't fit; "defaults
  the user configured, not gates."
  ([amendment](decisions/workbench-system.md))

## toolkit 0.1.0 — 2026-08-11

- **Optional utilities split into the new `toolkit` plugin** —
  `doc-to-html`, `arch-map`, `ui-demo-video`, `writing-skills` — so
  integrators opt into their listing token load (toolkit ≈ 1,784 tokens;
  workbench ≈ 378). ([decision](decisions/workbench-split.md))
- Marketplaces list both plugins; the validator generalized to a per-plugin
  spec table; each plugin carries exactly its own attribution and LICENSE
  notice.

## workbench 0.20.0 — 2026-08-11

- **The workbench system lands**: six process skills ported from
  [obra/superpowers](https://github.com/obra/superpowers) `44c9b2d` (MIT,
  Jesse Vincent) through the adaptation filter, plus the native `audit`
  protocol and `using-workbench` orientation. The flow — two optional doors,
  user-picked routes, agency left to user/harness, one adversarial review at
  readiness, outline-then-ask landing — is recorded with every design
  question operator-settled.
  ([decision](decisions/workbench-system.md))
- **workbench-drift** (provenance manifest + bundled diff script) settles as
  repo-local fork tooling at `.claude/skills/workbench-drift/` — ships in no
  plugin.
- **Description trim (SDO):** six legacy skills cut to trigger-only listings
  after an 8/8 routing probe; listing cost −29%.
  ([decision](decisions/description-trim-sdo.md))
- **Shipped-text hygiene:** payload text references only what an installed
  environment can reach — public URLs, never repo-relative paths.
- **vigil parked** to `attic/agents/`; five review agents remain.
  ([decision](decisions/park-vigil.md))
