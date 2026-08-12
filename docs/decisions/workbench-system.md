# Decision: the workbench system — superpowers replaced by a curated, drift-tracked skill set inside toolkit

**Date:** 2026-08-11

## Status

**Discoverability 2026-08-11 (post-0.20.0):** `using-workbench`'s description
now triggers at conversation start — description-as-dispatcher, hook-free —
after the operator judged pure on-demand reference insufficient for
discoverability. The wording is deliberately informational (orientation with a
built-in opt-out; "defaults the user configured, not gates"), keeping the
no-compulsion stance: an operator-tried MUST-invoke variant was settled down to
this form the same day. `workbench 0.20.0` → `0.20.1`.

**Renamed 2026-08-11:** the system formerly called **method** is **workbench**
throughout (plugin swap + unification — see `workbench-split.md`). A twelfth
operator decision joined the ledger: **Q12 — flow artifacts are disposable**,
saved under `.workbench/<work_scope>/` (or `.tmp/workbench/<work_scope>/`),
enduring only for the work; durable only on explicit user ask or an established
repo pattern.

**Proposed — in progress.** Operator is reviewing each step; nothing commits until
the whole system passes their review (operator directive, 2026-08-11). This doc is
the working spec; the checklist at the bottom tracks the phases.

## Context

The operator runs the `superpowers` plugin (obra/superpowers, MIT, v6.2.0 at time
of writing) across all environments and values several of its content skills —
brainstorming, TDD, systematic debugging — but rejects its **pressure system**: a
`SessionStart` hook injecting an enforcement dispatcher ("1% chance a skill might
apply → you MUST invoke it", a red-flags table pre-labeling every hesitation as
rationalization) and imperative skill descriptions ("You MUST use this before any
creative work") that push every session toward the spec → plan → subagent-dispatch
pipeline. The operator's preferred process with current-generation models is:
scope the issue → direct main-session implementation → end-of-task adversarial
code-quality review + comment trim.

An earlier mitigation plan (skill-level permission deny rules + a doctrine hook)
was designed but is **superseded** by this decision: rather than living with a
neutralized upstream, the operator chose to own the system. The known cost of
forking — perpetual upstream merge duty — is answered with tooling: a provenance
manifest plus a drift-check loop that turns "owe upstream a merge" into "upstream
owes us a review."

Operator decisions shaping this (2026-08-11): the replacement **bundles into the
existing `toolkit` plugin** (no separate repo, no third plugin); the system is
named **workbench**; of the borderline skills only `receiving-code-review` is kept.

## Decision

### 1. Six upstream skills are adopted into `plugins/workbench/skills/`

| Skill | Why it earns its place |
| --- | --- |
| `brainstorming` | Socratic requirements/design exploration before creative work — on invitation, not compulsion. |
| `test-driven-development` | RED→GREEN→REFACTOR discipline when implementing features and bugfixes. |
| `systematic-debugging` | Root-cause discipline before proposing fixes. |
| `verification-before-completion` | Evidence before completion claims — same ethos as `empirical-proof`. |
| `writing-skills` | The RED→GREEN skill-authoring loop; the operator authors skills constantly. |
| `receiving-code-review` | Technical rigor on review feedback — verify, never performatively agree; complements `get-pr-comments` and the adversarial-review flow. |

Skills **keep their upstream names**: muscle memory survives, the manifest mapping
stays trivial, and plugin namespacing (`toolkit:brainstorming` vs
`superpowers:brainstorming`) prevents collisions during any transition overlap.
Every method SKILL.md carries `metadata.system: workbench` in its frontmatter
(operator call 2026-08-11) — hosts ignore the extra key; it makes set membership
greppable for tooling and humans alike.

**Plus one method-native skill: `audit`** (operator-approved 2026-08-11). The flow
model's door A requires three behaviors that exist in no upstream or toolkit piece —
ask the user to size the workload (quick look inline / deep audit via `claim-check`
/ team sweep via `qa-sweep`), bring flagged uncertainties back for confirmation
before proceeding, and route the exit by shape (feature/refactor → brainstorming;
confirmed fix → route pick). `audit` is razor-thin protocol glue: it dispatches the
engines and runs the exchanges, never investigates anything itself, and triggers
only on invitation. It is workbench's one unproven piece — born from the flow
whiteboard rather than lived use — and is flagged as such in the manifest
(`nativePieces`); expect tuning after real runs. No upstream lineage, so
`workbench-drift` does not track it.

**Amendment 2026-08-11 (same day): `writing-skills` reclassified.** With the
utilities-plugin split (now named `toolkit` — see
`docs/decisions/workbench-split.md`), `writing-skills` moved there and left the
workbench set: it was always meta-work outside the flow, and the operator scoped it
as optional-per-user. Its `system: workbench` tag was dropped; its superpowers
lineage and drift tracking continue unchanged in the manifest. The workbench set is
therefore **five ported skills + `audit` + `using-workbench`**, all in the workbench plugin.

**And a second native reference skill: `using-workbench`** (operator-approved
2026-08-11). A fresh session with the plugin sees only skill *descriptions* —
the entry triggers work, but the completion chain (test-quality → verified-ready
→ one adversarial review → outline gate) has no natural trigger surface, and the
flow's connective tissue ships nowhere in the payload. `using-workbench` fixes the
second problem: an on-demand orientation map (the flow at a glance, moment→skill
ownership, the three user gates) that answers "how does method work?" without
ever enforcing anything — the anti-`using-superpowers`. The first problem is the
rules layer's job: the standing doctrine snippet lives at
[`docs/workbench-doctrine.md`](../workbench-doctrine.md), ready for the npx
global-rules pack (or a project `CLAUDE.md`), deliberately outside the plugin.

### 2. The adaptation filter (applies at port time and to every future upstream adoption)

Adopting upstream text is **never a copy** — it passes this filter on the way in:

1. **Defang the description.** Imperative/coercive triggers ("You MUST use this
   before any creative work") become honest conditional ones ("Use when the user
   wants to explore intent and design before building"). The description is the
   only activation surface — there is no hook and no dispatcher.
2. **De-pipeline the body.** Cross-references to dropped pieces are scrubbed or
   redirected to toolkit equivalents (e.g. a hand-off to `requesting-code-review`
   becomes `code-quality-review`; hand-offs to `writing-plans` /
   `subagent-driven-development` / `executing-plans` are removed). No adopted
   skill may route a session into the spec→plan→subagent pipeline.
3. **Carry only needed references.** Upstream `references/` files come along only
   when the adopted body actually uses them; platform-adaptation shims for the
   dispatcher do not.
4. **Provenance footer.** Each adapted skill ends with one line: derived from
   obra/superpowers (MIT, Jesse Vincent), adapted per this decision.

### 3. Eight skills and the hook layer are dropped

| Piece | Why |
| --- | --- |
| `using-superpowers` (dispatcher) | The enforcement layer this system exists to remove. Nothing replaces it. |
| `hooks/` (session-start + variants) | The pressure delivery mechanism. **method ships no hooks.** |
| `subagent-driven-development` | Operator process is direct main-session implementation + end adversarial review. |
| `executing-plans` | Plan-execution machinery of the pipeline. |
| `requesting-code-review` | Replaced by `code-quality-review` and the reviewer agents. |
| `dispatching-parallel-agents` | Parallel dispatch is native harness behavior when wanted (operator call). |
| `writing-plans` | Plans are written on request without a skill; the trigger otherwise feeds the pipeline (operator call). |
| `using-git-worktrees` | Primary host has native worktree support (operator call). |
| `finishing-a-development-branch` | Superseded by `file-pr` (file-and-tend) and `push`. |

### 4. Provenance manifest + `workbench-drift` skill

The system's memory is a **manifest** (`manifest.json`, shipped inside the
`workbench-drift` skill folder): the upstream repo/ref/license, the last-reviewed
upstream commit, and one entry per upstream piece — its path, local landing path
(or none), `adopted`/`dropped` disposition, the **why**, and the adaptations
applied. The why-column is load-bearing: it lets the drift analysis distinguish
"upstream improved a skill we carry — review this diff" from "upstream tuned the
dispatcher we deleted on purpose — FYI count only."

`workbench-drift` (drafted in `attic/skills/workbench-drift/`; after its first
successful live runs it moved to the **repo working set**,
`.claude/skills/workbench-drift/` — operator call 2026-08-11: fork maintenance is
this repo's job, so the skill ships in **no plugin** and is validator-exempt
from the bundle-template sync) is the loop:

- A bundled deterministic script (`scripts/drift-check.mjs`, Node — same pattern
  as `ui-demo-video`'s harness) clones/fetches upstream, diffs
  `lastReviewed..HEAD` over `skills/` and `hooks/`, maps changed paths through the
  manifest, and emits a grouped report: **review-required** (adopted pieces, with
  diffs), **intentionally-dropped** (count only), **unmapped** (new upstream
  pieces needing a disposition).
- The skill judges each review-required diff against the manifest's recorded
  rationale and recommends adopt / adapt / ignore, verdict-first. Anything
  adopted passes the §2 filter on the way in. The manifest's `lastReviewed` pin
  advances only when the review completes. It never auto-applies upstream
  changes and never commits.

First run operates in **initial-pin mode**: the manifest is seeded from the
installed 6.2.0 plugin cache (no git lineage), so the first live run pins the
actual upstream commit and verifies manifest coverage against the real repo.

### 5. Cutover plan

1. Land the adopted skills in the workbench plugin (+ origin docs, rosters, READMEs,
   validator lists, manifests; `toolkit` → `0.20.0`).
2. Run `workbench-drift` live once (pins the upstream commit, proves the loop);
   promote it from the attic into toolkit in the same release if the run is clean.
3. Update the plugins on each machine; **uninstall superpowers everywhere.**
4. The earlier deny-list plan becomes unnecessary (no upstream hook left to
   fight). The workflow-doctrine rule ("direct implementation, adversarial review
   at the end") ships separately via the planned npx global-rules pack — it is not
   part of method, deliberately: method carries no always-injected anything.

## The flow (settled 2026-08-11 — canonical; the port must honor it)

Designed interactively with the operator on a shared whiteboard (artifact
`method — flow whiteboard`, v7); the eleven decisions below are the operator's.
**The visual model is drawn canonically in [`docs/workbench-flow.md`](../workbench-flow.md)**
(mermaid, version-controlled); this section is the prose record.

**Entry — two doors, both optional ways in.**

- **Door A — audit** (something to verify, hunt, or check). Protocol owned by the
  native `audit` skill: (1) the **user sizes the workload** — quick look (inline)
  · deep audit (`claim-check`) · team sweep (`qa-sweep`); (2) the engine runs;
  (3) when findings carry **flagged uncertainties**, the session brings them back
  and the user confirms — clean audits skip the pause; (4) exit: if the audit was
  the ask, report and stop; revealed work routes **by shape** — feature/refactor →
  brainstorming, confirmed fix → straight to the route gate.
- **Door B — idea** (no big audit needed). Ground the idea with a couple of
  questions, most answered from the codebase; **what the code can't answer is
  brainstorming's job**.

**Scoping.** Brainstorming **always** precedes feature design and refactors. Its
output hits a user gate — **pick the route**: `direct` (implement straight from
session context) · `plan` (structured mid-size work; mechanism **discovered from
the user's stack**, in order: plugin plan skill → repo-local skill → repo planning
standards → harness plan mode as final fallback; method ships nothing for it) ·
`handoff-goal` (really big, long-running goal; contract dir, fresh session pursues
autonomously — same flow, own cadence).

**Implementation.** Execution agency belongs to **the user and the harness** —
method never dictates in-session vs dispatched execution; its only job is handing the implementer
the plan or goal when one exists. Inside implementation:
`test-driven-development` is the **default for features/bugfixes where a test
harness exists** (silent skip where none) — a default, not a mandate: a stated
repo/user convention that conflicts takes precedence, announced (**Q13**,
2026-08-12); `systematic-debugging` fires on any bug before fixes are proposed.

**Completion.** (1) **test-quality review** of the implementation's tests
(`test-quality-reviewer`); (2) **"deemed ready"** is
`verification-before-completion`'s claim gate — evidence in hand before the ready
claim, `empirical-proof` when there's a runnable surface; (3) **one adversarial
code-quality review + comment trimming**, per the repo's rules
(`code-quality-review`); findings are fixed and **re-verified, then the flow
proceeds — no second review round**; (4) the session **outlines structurally what
was done** and asks: file a PR or merge directly? When repo or user rules
explicitly pre-authorize, it may proceed without asking. Landing runs through
`file-pr` / merge / `push`, with `fix-ci` tending the checks.

**Feedback.** `get-pr-comments` triages arriving PR feedback;
`receiving-code-review` governs acting on it; verified fixes re-enter
implementation.

**Decisions ledger** (all operator calls, 2026-08-11): **Q1** brainstorming always
before feature/refactor design, and owns what the codebase can't answer about an
idea · **Q2** TDD default where a harness exists · **Q3** adversarial review fires
once, at model-deemed readiness · **Q4** comment trim rides that review · **Q5**
fixed findings re-verify and proceed straight to the outline gate — no re-review ·
**Q6** review precedes landing; landing is outline-then-ask with a rules bypass ·
**Q7** the confirm gate pauses only on flags · **Q8** audit sizes: quick look /
deep (claim-check) / sweep (qa-sweep) · **Q9** audit-revealed work routes by shape
· **Q10** PLAN resolves through the user's stack (plugin skill → local skill →
repo standards → harness plan mode) · **Q11** "deemed ready" =
verification-before-completion, with empirical-proof for runnable surfaces —
refined by **Q14** (2026-08-12): expensive verification (empirical-proof,
qa-sweep) is user-optioned — offered when it fits, run only on explicit ask or
standing authorization; verification-before-completion is the only always-on
gate.

## Non-goals

- **Not a repo fork.** Only the skills the operator uses are carried; git lineage
  is replaced by the manifest.
- **No hooks, no dispatcher, no always-injected doctrine** inside the plugin —
  defanged descriptions are the entire activation surface.
- **No auto-merge.** Drift tooling reports and recommends; a human lands changes.

## Licensing & attribution

Upstream is MIT (Jesse Vincent / obra/superpowers); toolkit is MIT. Attribution is
**visible, not buried** (operator directive 2026-08-11: "make it clear somewhere,
readme or something — just to be fair with it"). The surfaces, all landed in
phase B:

1. **`plugins/toolkit/README.md`** — the workbench skills' section carries an
   attribution paragraph: these skills derive from
   [obra/superpowers](https://github.com/obra/superpowers) by Jesse Vincent (MIT),
   adapted for this plugin's process (link to this doc). The plugin's public face
   credits the source where the skills are listed.
2. **Root `README.md`** — one line in the toolkit section naming the lineage.
3. **`plugins/toolkit/LICENSE`** — a "portions derived from" notice appending the
   upstream copyright line, so the shipped payload itself satisfies MIT's
   notice-preservation clause for the derived text.
4. **Each adapted `SKILL.md`** — the one-line provenance footer (§2.4).
5. **Each origin doc** (`docs/skills/<name>.md`) — the Origin section tells the
   real story: authored upstream by Jesse Vincent, proven in the operator's lived
   use, adapted here per this decision.
6. **The manifest** — upstream repo, author, license, per-piece lineage (already
   seeded).

## Acceptance criteria

- Six defanged skills ship in toolkit; no adopted skill references a dropped piece
  or ships imperative-pressure language; each carries the provenance footer.
- `workbench-drift`'s live run pins a real upstream commit, reports coverage clean
  against the seeded manifest, and the skill runs from the repo working set
  (`.claude/skills/`), shipped in no plugin.
- Superpowers can be uninstalled with no capability the operator cares about lost.
- Validator green; `toolkit` at `0.20.0`; no commits before operator sign-off.

## Phases

- [x] **A — foundation**: this decision doc; seeded manifest; `drift-check.mjs`;
  `workbench-drift` SKILL.md draft in the attic (2026-08-11).
- [x] **B — port** (2026-08-11): six skills ported from upstream head `44c9b2d`
  through the adaptation filter; `audit` authored against the settled flow;
  origin docs ×8; rosters/READMEs/validator/manifests/LICENSE updated;
  `toolkit` → `0.20.0`, `agent-workshop` → `0.1.27`.
- [x] **C — prove the loop** (2026-08-11): initial-pin run mapped 18/18 upstream
  entries; pin set to the port commit; drift-mode run clean ("up to date");
  `workbench-drift` moved from the attic to the repo working set
  (`.claude/skills/` — repo-only tooling, not shipped; operator call).
- [ ] **D — cutover**: operator sign-off, commit, install everywhere, uninstall
  superpowers.
