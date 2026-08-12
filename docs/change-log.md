# Change Log

Sections are keyed by the **released plugin version** that shipped the change
(`eviewers` before the 2026-06-16 rename became `	oolkit`), newest first. Repo
work that ships no release (packaging, structure, docs) sits under `## repo — date` sections in
chronological position.

## workbench 0.20.4 — 2026-08-12

### route rename: "rawdog" → "direct"; route gate asks structured

Operator flagged the first route's name as leftover sexual-origin slang that
survived sanitization. Renamed to **direct** across all 15 occurrences —
skills (`brainstorming`, `audit`, `using-workbench`), all four manifests, the
workbench README, docs pages, both flow diagrams, the doctrine snippet, and
the `workbench-system.md` ledger. The "agency (direct vs agentic)" phrasing
became "in-session vs dispatched" to keep the new name unambiguous. The route
gate also adopts 0.20.3's ask mechanics: `AskUserQuestion` when available
(numbered list otherwise) with user-facing labels — Direct / Plan /
Long-running goal — recommendation first and marked; `handoff-goal` keeps its
skill name. (A same-day conditional-sizing patch to audit was reverted before
landing — sizing stays as 0.20.3 shipped it.) Rationale:
[`route-rename-direct-and-structured-gate.md`](decisions/route-rename-direct-and-structured-gate.md).

## workbench 0.20.3 — 2026-08-12

### audit — structured sizing ask + runtime-modality flag

Operator review of the audit↔qa-sweep interaction found sizing was breadth-only:
runtime verification happened only by accident of tier (team sweep boots the app
by construction; a runtime-demanding request sized lower silently became code
reading). Step 1 now asks the tier question via `AskUserQuestion` (or the host's
equivalent) with the recommended tier marked, falling back to a numbered list —
and carries a **runtime modality flag**: when the target is behavior a real
client can drive, the same question confirms whether the check should drive the
booted app, with the confirmation handed to the engine as part of the workload.
Engines untouched (`claim-check` unchanged by operator directive). Rationale:
[`audit-sizing-ask-and-runtime-modality.md`](decisions/audit-sizing-ask-and-runtime-modality.md);
origin doc `docs/skills/audit.md` updated in step.

## workbench 0.20.2 — 2026-08-11

### manifests tell the process-system story

Operator flag: the plugin descriptions and Codex starter prompts still carried
the old toolkit-era identity (agent-list-first, laundry-list parentheticals,
"without onboarding"). Descriptions rewritten identity-first across all three
manifests and the marketplace — the flow's arc (audits → route pick →
implementation discipline → one adversarial review → landing that tends CI),
the agents as backing, the no-hooks/no-dispatcher stance. Codex `defaultPrompt`
reordered to walk the flow and now opens with "How does the workbench flow
work?"; the stale reviewer-install prompt dropped.

## toolkit 0.1.1 — 2026-08-11

### description accuracy pass

Same sweep: the Claude manifest's swap-era self-reference ("install alongside
toolkit") fixed to workbench, the Codex `longDescription`'s matching
self-reference fixed, and one identity-first description (per-skill
one-liners, "install alongside workbench, skip to keep sessions lean") now
consistent across all three manifests and the marketplace.

## workbench 0.20.1 — 2026-08-11

### using-workbench — session-start orientation for discoverability

Operator adjustment in two steps: the description now triggers at conversation
start (description-as-dispatcher, hook-free) so fresh sessions discover the
flow before their first response; the wording then settled from a MUST-invoke
variant down to informational orientation — invoke the owning skill on
relevance, announce it briefly, opt out when it doesn't fit; "defaults the
user configured, not gates." READMEs and the usage doc updated to the
session-start stance. See the amendment in
[`docs/decisions/workbench-system.md`](decisions/workbench-system.md).

## toolkit 0.1.0 — 2026-08-11

### toolkit — optional utilities split out; plugin names swapped

New plugin (operator call, name from the workshop family: tools in the kit,
making at the bench): `doc-to-html`, `arch-map`, `ui-demo-video`, and
`writing-skills` move out of toolkit so integrators opt into their token load —
every installed skill's listing rides in each session's context. Expected to
grow with future optional utilities. `writing-skills` was reclassified out of
the workbench set (tag dropped; superpowers lineage and `workbench-drift` tracking
continue at its new path), and each plugin now carries exactly its own
attribution and LICENSE notice. Marketplaces list both plugins; the validator
generalized to a per-plugin spec table. Boot cost: toolkit ≈ 1,784 tokens,
workbench ≈ 378 opt-in. See
[`docs/decisions/workbench-split.md`](decisions/workbench-split.md).

## workbench 0.20.0 — 2026-08-11

### vigil parked

Operator call: `vigil` retired from the process payload (five agents now) and
from the repo working set; spec preserved in `attic/agents/`, doc under
`deprecated/`, "governance" dropped from manifest wording. See
[`docs/decisions/park-vigil.md`](decisions/park-vigil.md).

### shipped-text hygiene — no repo-internal references in the payload

Operator rule: shipped skill text may reference only what an installed
environment can reach. Sweep applied — method provenance footers now point at
the GitHub blob URL of the decision doc; `using-workbench` dropped its
`workbench-drift` mention and links the published flow model; toolkit README and
LICENSE attribution links became absolute URLs. Rule recorded in `CLAUDE.md`
§ boundaries.

### description trim — six legacy skills cut to trigger-only listings

A boot-context analysis (what a fresh session pays for the plugin's skill/agent
listing: ≈ 3,166 tokens) found six legacy descriptions carrying ≈ 1,447 tokens
of workflow summary — the exact pattern the newly-ported `writing-skills` SDO
guidance names as a follow-the-description hazard, not just a cost.
`handoff-goal`, `route-work`, `qa-sweep`, `empirical-proof`, `arch-map`, and
`claim-check` rewritten to triggers + NOT-for disambiguation only (299–429
chars each); an 8/8 fresh-context routing probe (including both disambiguation
traps) verified the trimmed triggers before applying. Listing total ≈ 2,254
tokens (−29%). See
[`docs/decisions/description-trim-sdo.md`](decisions/description-trim-sdo.md).

### workbench — superpowers replaced by a curated, drift-tracked skill set

The **workbench** system (named **method** at landing, renamed the same day) lands in the process plugin: six process skills ported from
[obra/superpowers](https://github.com/obra/superpowers) head `44c9b2d` (MIT,
Jesse Vincent) through the adaptation filter — `brainstorming` (route-gate
terminal replacing the writing-plans pipeline; visual-companion subsystem not
carried), `test-driven-development` (default-where-harness per the flow),
`systematic-debugging`, `verification-before-completion` (the "deemed ready"
gate), `receiving-code-review`, `writing-skills` — plus the native `audit`
protocol skill (size → engine → confirm-the-flags → shape-routed exit) and
`workbench-drift`, the upstream watchdog (provenance manifest + bundled diff
script), which after its initial-pin (18/18 mapped) and drift-mode ("up to
date") runs both passed live settled as **repo-local tooling** at
`.claude/skills/workbench-drift/` — fork maintenance is the workshop's job, so it
ships in no plugin (validator-exempt from the bundle-template sync). The canonical flow the set
implements — two optional doors, user-picked routes, agency left to
user/harness, one adversarial review at readiness, outline-then-ask landing —
was designed interactively on a whiteboard artifact and is recorded in the
decision doc, with all eleven design questions operator-settled. Eight upstream
pieces and the SessionStart hook layer are formally dropped with recorded
rationale; attribution is carried in the toolkit README, LICENSE
(derived-portions notice), every adapted SKILL.md, the origin docs, and the
manifest. Skill docs ×8 in the new **compact usage-first format** (operator
call, same day: what-it-is + lineage, "Use it", "Don't" — the convention now in
`CLAUDE.md` §4 and the skills roster preamble; legacy docs migrate as touched),
and the flow's mental model drawn canonically as a maintained pair —
[`docs/workbench-flow.md`](workbench-flow.md) (mermaid, diffable) +
[`docs/workbench-flow.html`](workbench-flow.html) (arch-map deep-dark-glass rendering:
SVG system map, piece inventory, removed-pipeline rules, decisions ledger).
Every method SKILL.md is tagged `metadata.system: workbench` in its frontmatter for
greppable set membership. A third native piece, `using-workbench`, ships the flow
map inside the payload as an on-demand orientation reference (the
anti-`using-superpowers` — explains on request, no hook, never enforces), and
the rules-layer doctrine snippet for fresh-session awareness lives at
[`docs/workbench-doctrine.md`](workbench-doctrine.md), deliberately outside the
plugin. Rosters, READMEs, adoption docs,
validator (twenty toolkit skills), and all manifests updated. Cutover (install everywhere, uninstall
superpowers) awaits operator sign-off. See
[`docs/decisions/workbench-system.md`](decisions/workbench-system.md).

## repo — 2026-08-11

### change-log re-keyed by plugin release; skill learns the version-keyed format

This log's sections are now keyed by the **released plugin version** (see the
preamble above) instead of by date — the repo's product is its plugins, and nearly
every entry already recorded its bump inline, so the diary was release notes in a
diary's clothes. The entire history was re-keyed with entry bodies verbatim; two
archaeology calls (the `ci-watcher` `0.10.0` entry reordered above the `0.9.0`
batch; the 2026-07-31 description-scope change confirmed bump-less via git) are
recorded in the decision note. The `change-log` skill's Format section now carries
the rule generically — versioned-product repos key by release, with `## repo`
sections for unshipped work; date-keyed stays the default elsewhere — with the
usage doc updated for parity. See
[`docs/decisions/change-log-version-keyed.md`](decisions/change-log-version-keyed.md).

## toolkit 0.19.0 — 2026-08-11

### handoff-pr → file-pr — the PR skill now files and tends, not hands off

`handoff-pr` evolved into `file-pr`
([`plugins/toolkit/skills/file-pr/SKILL.md`](../plugins/workbench/skills/file-pr/SKILL.md)):
the authorization split that justified the artifact hand-off is gone from the
operator's environments, so the skill now opens the PR itself and sees it through —
base sync and the repo's own gates run *before* filing, template-verbatim body
(machinery inherited unchanged), `gh pr create`, then a tend loop: CI fixes composed
through `fix-ci`, merge-based conflict resolution (semantic collisions reported,
never guessed), at most two base re-syncs, ending **green and mergeable** — never
merging. Old origin doc moved to
[`docs/skills/deprecated/handoff-pr.md`](skills/deprecated/handoff-pr.md) with the
artifact behavior recoverable from git history. Live references updated repo-wide;
the adoption docs' Codex-surface lists (stale again — missing `fix-ci`) trued up to
twelve; mirrors re-synced. `toolkit` `0.18.0` → `0.19.0`; validator green. See
[`docs/decisions/file-pr.md`](decisions/file-pr.md).

## toolkit 0.18.0 — 2026-08-11

### fix-ci — CI watch-and-fix loop lands as a toolkit skill

New direct-use skill `fix-ci`
([`plugins/toolkit/skills/fix-ci/SKILL.md`](../plugins/workbench/skills/fix-ci/SKILL.md)):
the invocable form of "CI is failing, take a look" — watch the branch's CI (PR
checks, or push runs on direct-to-main workflows) to a verdict; on red, pull the
failing log, triage flake vs. fault, apply a minimal in-session fix, push per repo
conventions, re-watch. Hard cap of two fix attempts (plus one flake rerun); never
force-pushes; never weakens a failing check. Deliberately a **skill, not a wider
`ci-watcher`**: toolkit agents stay read-only, the fix runs with session context
and session authority, and the agent remains the loop's background wait-absorber.
Origin doc [`docs/skills/fix-ci.md`](skills/fix-ci.md); rosters, READMEs, and all
four manifests updated.
`toolkit` `0.17.0` → `0.18.0`; validator
green. See [`docs/decisions/fix-ci.md`](decisions/fix-ci.md).

## toolkit 0.17.0 — 2026-08-10

### attic/ introduced; handoff-review deprecated; orchestrate parked

New top-level `attic/` holds skills that live in the repo but ship in no plugin
and run on no host — in-progress drafts and deprecated pieces — instead of
being deleted or stranded in machine-local global configs. `handoff-review`
retired from `toolkit` (operator call): spec parked verbatim at
`attic/skills/handoff-review/`, origin doc moved to
[`docs/skills/deprecated/handoff-review.md`](skills/deprecated/handoff-review.md),
cross-references scrubbed (`handoff-goal` fit-check, `handoff-pr` Review field,
READMEs, adoption docs, manifests — the adoption docs' Codex-surface lists were
also three skills stale and were trued up to eleven). The personal
`orchestrate` and `codex-implement` skills moved from the global
`~/.claude/skills/` scope into `attic/skills/` as in-progress (verified absent
from Codex/Cursor global scopes); the always-injected
`~/.claude/rules/model-selection.md` parked beside `orchestrate` in the attic
(routing invariants stay live via the shipped `route-work` skill); the empty
`~/.codex/skills/codex-primary-runtime/` remnant was deleted. `CLAUDE.md` /
`AGENTS.md` § boundaries and the deprecation workflow now name the attic.
`toolkit` `0.16.5` → `0.17.0`; validator green.
See [`docs/decisions/attic-parked-skills.md`](decisions/attic-parked-skills.md).

## toolkit 0.16.5 — 2026-08-09

### handoff-goal — review cadence scaled to landed work

Live pursuit over-dispatched reviewer subagents on every small task while the
completed phase's cumulative diff had no mandated review slot. Operator-set
cadence, now in the plan template's boot path: a small task's independent pass
is a clean Verify re-run (never a per-task reviewer dispatch); reviewers come
in after a substantial chunk (feature / bug fix / risky refactor); each
completed phase gets an **adversarial code-quality review** of its cumulative
diff (`code-quality-review` skill where available), held by a standing exit
criterion. Critique mode audits the cadence both ways. `toolkit` `0.16.4` →
`0.16.5`; validator green. See
[`docs/decisions/handoff-goal-review-cadence.md`](decisions/handoff-goal-review-cadence.md).

## toolkit 0.16.4 — 2026-08-09

### handoff-goal — status-only plan; evidence never lands in contract files

Live pursuit defeated the `0.13.2` bounded-ledger design: a 450,388-character
`plan.md` treated as "the authoritative append-only ledger" consumed entire
post-compaction sessions in full re-reads. Operator-mandated fix: pursuit-side
writes to `plan.md` are **status flips only** (at most one phase `in progress`,
`done` when verified, `blocked`; checkbox ticks) — no prose, evidence, output,
or history; `ledger.md` is eliminated (two-file contract again); git commits +
re-runnable Verify commands are the durable record; resumption is by status,
not history replay; route changes escalate to the operator. Critique mode
migrates legacy contracts by cutting accumulated history and deleting evidence
files. `toolkit` `0.16.3` → `0.16.4`; validator green. See
[`docs/decisions/handoff-goal-status-only-plan.md`](decisions/handoff-goal-status-only-plan.md)
(supersedes
[`handoff-goal-bounded-plan.md`](decisions/handoff-goal-bounded-plan.md)),
[`docs/skills/handoff-goal.md`](skills/handoff-goal.md).

## toolkit 0.16.3 — 2026-08-07

### arch-map — self-contained skill package (no workshop-only deps)

Skill was pointing adopters at workshop-local `tmp/*.html` specimens — those
paths do not ship with the plugin, so style guidance was a no-op for anyone
integrating toolkit. Fix: sanitize and ship specimens under
`plugins/toolkit/skills/arch-map/references/` (subsystem + refactor), rewrite
`SKILL.md` so tokens/scraps/fit rules are the complete contract (no private
nicknames/domain names, no dependency on a shipped harness), and keep any
layout pressure-test tooling workshop-only under `scripts/arch-map-harness/`.
`toolkit` `0.16.2` → `0.16.3`.

## toolkit 0.16.2 — 2026-08-07

### arch-map — overflow/fit hardening + layout harness

Mechanical pass fixing the idoso pattern's overflow failure modes: SVG box
text now must fit its box (short labels, size-box-to-text budget, `text-anchor`
middle, `textLength` last resort), and long paths/tokens wrap via
`overflow-wrap:anywhere` on `code`, `.mod .path/.cap`, and `.chip`. Added a
headless-chromium layout harness (`scripts/arch-map-harness/`) that measures
every SVG `.title`/`.sub` `getBBox()` against its box plus HTML/page overflow at
1280/1024/768/390; new checklist item 12 + **Fit** process rule reference it.
Corpus (cadence, conosterm, forge) re-rendered clean. `toolkit` `0.16.1` →
`0.16.2`.

## toolkit 0.16.1 — 2026-08-07

### arch-map — idoso visual language as skill fallback

`arch-map` rigid defaults switch from Cursor-dark to the **idoso** deep-dark
glass pattern (near-black gradient, glass cards, Inter + JetBrains Mono, sky
accent, scarce emerald/rose). Specimens:
`tmp/cadence-overview-idoso.html`, `tmp/forge-architecture-cadence-idoso.html`.
`toolkit` `0.16.0` → `0.16.1`. See
[`docs/decisions/arch-map-idoso-visual.md`](decisions/arch-map-idoso-visual.md).

## toolkit 0.16.0 — 2026-08-05

### arch-map — ship to toolkit (renamed from structure-view)

Parked skill ships as **`arch-map`** in `plugins/toolkit` (`0.15.2` →
`0.16.0`for bundled roster). Mental-model
SVG first, Cursor-dark high contrast, scarce color, CDNs for fonts/icons/Mermaid;
`doc-to-html` description cross-points again. Validator / READMEs / marketplace
at twelve toolkit skills. See
[`docs/decisions/arch-map-rename-and-visual.md`](decisions/arch-map-rename-and-visual.md),
[`docs/skills/arch-map.md`](skills/arch-map.md).

## repo — 2026-08-05

### arch-map — rename + visual language from overview specimen

Parked skill formerly `structure-view` renamed to **`arch-map`** (easier to
type; purpose obvious). Draft rewritten around the lived specimen
`tmp/architecture-overview.html`: mental-model SVG first, Cursor-like dark
high contrast, scarce color (accent + ✓/✕ only), CDNs for fonts/icons/Mermaid.
Still not re-shipped to the toolkit. See
[`docs/decisions/arch-map-rename-and-visual.md`](decisions/arch-map-rename-and-visual.md),
[`docs/decisions/arch-map-skill-draft.md`](decisions/arch-map-skill-draft.md),
[`docs/skills/arch-map.md`](skills/arch-map.md). Former origin →
[`docs/skills/deprecated/structure-view.md`](skills/deprecated/structure-view.md).

### Cursor marketplace — use pluginRoot short sources

Aligned `.cursor-plugin/marketplace.json` with Cursor's multi-plugin convention:
`metadata.pluginRoot: "plugins"` plus short entry `source` names (`toolkit`) instead of full `plugins/...` paths. Updated the native-plugin validator
and adoption docs to match, and documented that Claude-compat loading exposes
toolkit skills but not agents (agents need a Cursor-native install). Dropped
explicit `skills`/`agents` path fields from the Cursor per-plugin manifests so
Cursor auto-discovers the default folders (Team Marketplace after 2.6 silently
rejects some `./`-prefixed path forms). See
[`docs/decisions/cursor-plugin-surface.md`](decisions/cursor-plugin-surface.md) and
[`docs/adoption/native-plugin.md`](adoption/native-plugin.md).

## toolkit 0.15.2 — 2026-07-31

### structure-view — withdrawn from the toolkit plugin pending more thought

Operator call after first real use — the cross-repo cadence exercise and two
full design generations of its output (dark report-style, then a light and a
dark "fiche technique") — the skill's output is not where it needs to be,
and the design conventions need more thought before this ships. Same-day
withdrawal: the SKILL.md draft (with the GREEN-round and round-1
refinements) is parked at
[`docs/decisions/structure-view-skill-draft.md`](decisions/structure-view-skill-draft.md),
the origin doc keeps a draft banner, doc-to-html's cross-pointer is
reverted, and the roster / READMEs / validator are back to eleven toolkit
skills. The spec and decision records stay — the thinking is kept, the
shipping is paused. `toolkit` `0.15.1` → `0.15.2`.

## toolkit 0.15.0 / 0.15.1 — 2026-07-31

### structure-view — new toolkit skill: derive-and-render architectural pages

The recurring want — "I'm mid-refactor and want to see what's moving, but
there's no doc to render" — had no owner: `doc-to-html` is a renderer bound
to a source document (its own round-four boundary: authoring belongs to an
author, not a renderer). `structure-view` lands in `plugins/toolkit` as the
doc-less sibling: it *derives* the representation — a refactor in flight, an
existing subsystem, or a proposed design — and renders a self-contained
architectural HTML page: containment-first layouts, role palette with a
mandatory legend, change-state coloring with the refactor's invariant
stated, provenance stamps, and a traceability rule (every box and edge
traces to a real file / symbol / diff hunk; proposed elements dashed).
Ephemeral-first in `tmp/` with a promote-to-durable pass; the two skills'
descriptions cross-point so sessions route by input, not topic. Designed
first at the operator's call (not incubated), with GREEN tests
compensating: two fresh subagents produced conforming pages — a
plugin-system subsystem map, and a before/after of refactor `36ef5ff` whose
probe proved the invariant by blob-hash survivor analysis and declined to
render a claim the commit's own decision doc makes but its diff doesn't
back. The round caught one defect — a provenance stamp taken from the
session's stale startup snapshot — fixed by requiring live `git rev-parse`
at generation time, and recorded as the origin doc's first observed pitfall.
`toolkit` `0.14.1` → `0.15.0` across all manifests; validator skill lists widened
and passing; both READMEs at twelve skills. See
[`docs/decisions/structure-view.md`](decisions/structure-view.md).

Same-day field round 1: a cross-repo exercise — a fresh session derived a
three-view page of a real external codebase, the artifact landing in this
repo's `tmp/` — passed all checks (provenance read live from the *source*
repo; house-style sibling correctly taken from the *output* repo) and fed
five refinements back into the skill: cross-repo resolution for Step 0 and
provenance, the uniform fan-out pattern, a prescribed parse-check method,
the orphan-box check, and architecture/dependency-rule tests named as the
highest-fidelity edge source. Recorded as Round 1 in the origin doc's
Maturity section; `toolkit` `0.15.0` → `0.15.1`.

## toolkit 0.14.1 — 2026-07-31

### route-work — code axis joins the table; opus-5 lands, opus-4.8 retires

Opus 5 (launched 2026-07-24) was inexpressible in the three-axis table:
sol-ultra-class intelligence with near-fable coding would have made its row
numerically identical to gpt-5.6-sol ultra/max except cost, its actual
distinguishing strength (SWE-bench Pro ~79% vs sol's 64.6%) invisible. The
canonical table gains a fourth axis — **code** (coding craft) — and *taste*
narrows to user-facing surfaces, resolving its conflation with the rubric's
taste-surface axis. `opus-5` lands at cost 5 / intelligence 8.5 / taste 8.5 /
code 9 (operator-confirmed, per the skill's freeze rule) and inherits every
Claude-side role; `opus-4.8` leaves the table — with opus-5 in the fleet,
nothing routes to it. Routing guidance updated: code-warm work steps from the
sol ladder to opus-5; "high ambiguity or silent failure" routes to the
frontier *band* (fable-5 for judgment and taste, opus-5 for implementation);
the calibration notes carry the cross-ladder caveat that GPT and Claude rows
burn different subscription pools. The hard-invariant sentence changed in
both mirrors ("opus-4.8 or fable-5" → "opus-5 or fable-5" in the skill and
the operator's always-injected rules file). `toolkit` `0.14.0` → `0.14.1`
across the three plugin manifests and the marketplace entry; validator
passes. See
[`docs/decisions/route-work-code-axis.md`](decisions/route-work-code-axis.md).

## repo — 2026-07-31

### handoff-goal — description declares the defined-work scope

*(Shipped without its own version bump — the changed description first reached
installs with the next release, `0.14.1`.)*

The frontmatter description listed "a brand-new idea" as a valid goal source,
which read as an invitation to hand off exploratory work — exactly what the
skill's own fit check excludes. The description (the only part a session reads
before invoking) now scopes the trigger to already-defined work — outcome
stateable up front, done verifiable by checks that can fail — and names the
NOT-for case (open-ended research, "look into X" investigations) with the
lighter tools to use instead (a plain task, or a `handoff-review` continue
brief). Body unchanged — the fit check already carried the rule. Probe check:
an exploratory scenario bounced to a plain brief citing the new clause
verbatim; a defined-slices-with-failable-checks scenario picked handoff-goal.
See
[`docs/decisions/handoff-goal-description-scope.md`](decisions/handoff-goal-description-scope.md).

## toolkit 0.14.0 — 2026-07-20

### route-work — new toolkit skill: model/effort routing decision procedure

The operator's always-injected model-selection rules file carried a model
table that went stale (it still listed a retired GPT tier) and doctrine
without a decision procedure — so every dispatched task defaulted to the top
tier at max effort, overpaying in wall-clock and weekly-limit burn.
`route-work` lands in `plugins/toolkit` as the fix: invoked with a task
description, the session grades it on five axes (repo precedent, ambiguity,
failure visibility, taste surface, blast radius) and returns a three-line
route — model + effort + process pattern (direct dispatch / plan-review
checkpoint / judge loop / taste pass) + why. The canonical model × effort
table is the skill's single source of truth — operator-confirmed row by row
and benchmark-anchored (AA Intelligence Index, DeepSWE, SWE-bench Pro,
Frontend Arena, 2026-07); the notable calibration call is that mid-tier
models (opus-4.8, gpt-5.6-terra) are cost lanes a class below the sol
ladder on both axes — taste included — while sol's own taste sits just
under fable's. The
always-injected rules file is slimmed (outside this repo) to the hard
invariants plus a pointer here. GREEN test: two fresh subagents given only
the SKILL.md graded differentially — a mechanical migration routed to sol
medium · direct dispatch; a silent-failure copy task escalated to fable-5.
`toolkit` `0.13.2` → `0.14.0` across all manifests; validator skill lists widened
and passing. See
[`docs/decisions/route-work.md`](decisions/route-work.md).

## toolkit 0.13.2 — 2026-07-19

### handoff-goal — plan.md is now boot-sized; history archives to ledger.md

Live goal pursuit grew `plan.md` to ~40k lines: the template's append-only,
rich-entry progress ledger sat inside the file the pursuer re-reads at every
boot and compaction, so every boot paid for the goal's entire history and the
loop visibly slowed. The contract now ships three files — `goal.md` (frozen),
`plan.md` (steering state only), and `ledger.md` (append-only archive, never
re-read at boot). Ledger entries are one line with the checkpoint sha as the
evidence pointer (command output is never pasted); each phase gains a standing
"ledger rolled up" exit criterion that appends the phase's entries to
`ledger.md` and collapses them to one summary line in `plan.md`; critique mode
audits boot-size and retrofits bloated in-flight contracts by performing the
overdue rollups. Micro-tested per writing-skills: 5/5 control reps appended
another multi-line prose entry with no shedding mechanism; 5/5 treatment reps
converged on one-line entry + rollup, with `plan.md` shrinking at phase
completion. `toolkit` `0.13.1` → `0.13.2` across all four manifests; validator
passes. See
[`docs/decisions/handoff-goal-bounded-plan.md`](decisions/handoff-goal-bounded-plan.md).

## toolkit 0.13.1 — 2026-07-17

### handoff-goal — every contract now ships commit discipline

Live goal pursuit showed pursuers hoarding 50–70k-line uncommitted diffs
across phases: the "never invent a rule nobody stated" doctrine left the
`Commits:` slot blank, the pursuit loop had no commit step, and a gate-heavy
contract read as "git is the operator's call." Commit cadence is now the
second skill-shipped operating-rule default (after quality posture): commit
at every verified checkpoint, local commits named routine and never
approval-gated (push/PR stays gated), the loop gains a
commit-the-checkpoint step, each phase gains a standing "work committed —
sha" exit criterion, ledger entries record the checkpoint sha, and critique
mode audits all of it. Micro-tested per writing-skills: 5/5 control reps
committed only after deriving permission from silence and flagging it as a
deviation; 5/5 treatment reps committed as rule-following, converging on one
shape. `toolkit` `0.13.0` → `0.13.1` across all four manifests; validator
passes. See
[`docs/decisions/handoff-goal-commit-discipline.md`](decisions/handoff-goal-commit-discipline.md).

## toolkit 0.13.0 — 2026-07-15

### ui-demo-video — new toolkit skill with a bundled Playwright recording harness

Adopted a lived-in skill for recording Playwright-driven walkthroughs of a
running app after UI work: per-scene PNG frames the model Reads to verify the
UI itself (the mandatory feedback loop — fix and re-record until the frames
show the expected result), plus a webm/mp4 as the human-shareable PR demo.
Sanitization replaced the origin project's specifics (hardcoded port, package
manager, Prisma backup path, internal fixture API with credentials,
tracker-specific delivery rule) with conditionals on what any project
observably has — the documented run path, the app's real API surface. First
toolkit skill to ship a supporting script: `scripts/harness.mjs`, copied into
the adopting project so Node resolves its Playwright install; the harness
gained dual `@playwright/test`/`playwright` resolution and a generic
`hideSelectors` option alongside the Next.js dev-overlay default. GREEN test:
the sanitized harness ran end-to-end against a neutral static page (scenes,
frames read back, webm + mp4, manifest). Canonical copy is
`plugins/toolkit/skills/ui-demo-video/` only; origin doc, rosters, and READMEs
updated. `toolkit` `0.12.4` → `0.13.0` across all four manifests; the validator passes. See
[`docs/decisions/ui-demo-video.md`](decisions/ui-demo-video.md).

## toolkit 0.12.4 — 2026-07-13

### doc-to-html — four recipes adopted from a comparative skill evaluation

An external general-purpose "information-first HTML artifact" skill
(Tailwind-CDN, authoring-oriented) was evaluated against `doc-to-html` to see
what it knew that ours didn't. Most of it fell to the skill's recorded
non-goals (renderer not author, opens from disk, renders what the markdown
says); four recipes survived the scope filter and were folded in, translated
into the skill's own vocabulary: per-section **surface picked by reader
action** (replacing the bare "tables over walls" bullet, with an
anti-sameness line), the **never-invent-numbers** inverse of the
derived-numbers rule (hero stat cells only carry source-backed stats;
checklist extended), a **~80ch running-prose measure** floor, and a
**narrow-screen collapse** of the fixed 288px sidebar — that last one a
genuine defect in the mandated reference shell, now a media query plus
checklist item 9. Tailwind-CDN styling, IA/content-discipline guidance,
`bg-white`, and the prohibition-formed anti-AI-tell lists were rejected with
reasons recorded. Canonical copy is
`plugins/toolkit/skills/doc-to-html/SKILL.md` only; origin doc updated for
parity. `toolkit` `0.12.3` → `0.12.4` across all four manifests; the
validator passes. See
[`docs/decisions/doc-to-html.md`](decisions/doc-to-html.md) (2026-07-13
amendment).

## toolkit 0.12.3 — 2026-07-12

### handoff-goal v2 — self-carrying split contract (`goal.md` + `plan.md`)

The emitted goal document becomes a **contract directory**:
`tmp/<YYYY-MM-DD>-<goal-slug>/` holding `goal.md` (frozen — the pursuer may not
edit it, making the goalpost-moving tripwire mechanical) and `plan.md` (living —
phases, ledger, next action, maintained by the pursuer). Absorbed the design
rigor of a Codex-native "ultragoal" skill rather than shipping a second
overlapping piece: a producer-side goal-fit check, a recorded baseline, a
primary verifier named on the real interaction surface with a capability
inventory (gaps become named blocked items, never silent downgrades), approval
gates, a red-team pass before delivery, stakes-scaled delegation lanes, and a
critique mode that tightens an existing contract in place. The contract carries
its own pursuit discipline plus an activation note, so any runtime — including
Codex goal mode via `create_goal` — can pursue it. Canonical copy is
`plugins/toolkit/skills/handoff-goal/SKILL.md` only; origin doc and both skills
rosters updated for parity. `toolkit` `0.12.2` → `0.12.3` across all four
manifests; the validator passes; a sample contract emission smoke-tested both
templates. See
[`docs/decisions/handoff-goal-split-contract.md`](decisions/handoff-goal-split-contract.md)
and its
[implementation plan](decisions/handoff-goal-split-contract-implementation-plan.md).

## toolkit 0.12.2 — 2026-07-07

### handoff-pr — single-mode delivery: tmp artifact by default, `inline` writes no file

The deliver step used to both print the full artifact inline and write the
`tmp/handoff-pr-<branch-slug>.md` scratch file, landing the same long artifact
twice in every run. Delivery is now a conditional on the invocation argument:
default writes the file and reports the path plus PR title (no inline dump);
`/handoff-pr inline` prints the artifact in-session and writes no file. A rule
pins it to exactly one mode, and the `description` names the option (matching
`handoff-review`'s argument-documenting style). Canonical copy is
`plugins/toolkit/skills/handoff-pr/SKILL.md` only; origin doc updated for
parity. `toolkit` `0.12.1` → `0.12.2` across all four manifests; the validator
passes. See
[`docs/decisions/handoff-pr-delivery-modes.md`](decisions/handoff-pr-delivery-modes.md).

## toolkit 0.12.1 — 2026-07-07

### claim-check — verdict evidence bulleted, prior/parallel work opens with a status word

The run right after the readiness reshape showed the same shaping failure one
section up: the verdict opened well, then wove three repro cases, the root-cause
chain, and a provenance caveat into one dense paragraph (parallel cases impossible
to compare), and prior/parallel work — good on content — gave no first-glance
answer to "is anyone on this?". Same fix form (positive recipe per
`writing-skills`): the verdict is now headline + one-two-sentence rationale, then
short labeled bullets — one per repro case with observed-vs-expected, one for the
root-cause chain of `file:line` hops, one per caveat; prior/parallel work opens
with a one-word status (`clean` / `in-flight` / `related` / `blocked`, act-first
tag when several apply) and stays prose. Supersedes the prior decision's
"verdict and prior-work stay prose" clause. Micro-tested 5-vs-5 on the real
failing material: five of five incumbent reps reproduced the dense-verdict
failure; five of five recipe reps converged on the bulleted shape and
independently chose the same status word. Canonical copy is
`plugins/toolkit/skills/claim-check/SKILL.md` only; origin doc updated for
parity. `toolkit` `0.12.0` → `0.12.1` across all four manifests; the validator
passes. See
[`docs/decisions/claim-check-verdict-and-priorwork-shape.md`](decisions/claim-check-verdict-and-priorwork-shape.md).

## toolkit 0.12.0 — 2026-07-03

### empirical-proof — new toolkit skill: post-change runtime proof with anti-cheating teeth

A ninth direct-use skill lands in `toolkit`: after finishing work that touched a
runnable surface (MCP tools and REST API endpoints are named must-covers), it
gates on the app genuinely running (health-checked, right build), fans probe
scenarios out to subagents under a raw-evidence contract (real MCP client
connections / real HTTP only — never mocks or in-process harnesses),
corroborates firsthand, and reports a verdict-first `verified` / `broken` /
`blocked` — never fixing local setup or the bugs it finds. Built
RED→GREEN→REFACTOR on a live bait harness (planted runtime-only bug, green unit
tests over the same buggy code, a boot-blocked variant, request-log tripwires):
baseline agents fixed-during-verify (3/4) and fabricated the missing dependency
(2/2); with the skill, 6/6 runs verdict honestly, and the one GREEN loophole —
unproven "server stopped" claims — became the evidence-bound cleanup rule.
`qa-sweep`'s single-change NOT-for clause now routes to `empirical-proof`.
`toolkit` `0.11.2` → `0.12.0` across all four manifests; the validator's
expected-skills lists extended and passing. See
[`docs/decisions/empirical-proof.md`](decisions/empirical-proof.md) and the
origin doc [`docs/skills/empirical-proof.md`](skills/empirical-proof.md).

## toolkit 0.11.2 — 2026-07-03

### claim-check — readiness section reshaped for scanning

An operator flagged a real claim-check report whose verdict and prior/parallel-work
sections read well but whose readiness section was one dense paragraph — candidate
directions inline as "(a) … (b) … (c) …" with gotchas woven in. The Output contract's
readiness item was a content list with no shape, so it now carries a positive recipe
(per `writing-skills` "match the form to the failure" — shaping failures get recipes,
not prohibitions): a one-line readiness call, then short labeled bullets — one per
candidate direction with its trade-off and marked recommendation, one per gotcha /
dependency / open unknown, each anchored to code or docs. Verdict and prior-work stay
prose. Wording micro-tested 5-vs-5 against the incumbent on the real failing material
before landing: all five recipe reps converged on the scannable shape; the incumbent
left gotchas as dense prose in five of five. Canonical copy is
`plugins/toolkit/skills/claim-check/SKILL.md` only; origin doc updated for parity.
`toolkit` `0.11.1` → `0.11.2` across all four manifests; the validator passes. See
[`docs/decisions/claim-check-readiness-shape.md`](decisions/claim-check-readiness-shape.md).

## toolkit 0.11.1 — 2026-07-02

### doc-to-html — nine field findings from an end-to-end run patched in

An operator ran `doc-to-html` (at `toolkit` 0.11.0) end-to-end on a 35-finding
performance audit and fed back nine findings; all nine verified against the current
source and landed. The skill gains: a recompute-and-flag rule for sources whose own
numbers contradict their items; an exception preserving source-owned id schemes from
renumbering; a default output path (source dir/basename, `.html`); a conditional —
not standing — evidence appendix; an explicit boundary between what yields to house
style and what never does (plus relative-link verification); a tie-break and
generated-output exclusions with a hand-authored test for Step 0's sibling glob; and
reference implementations for the previously improvised chrome (layout shell,
scroll-spy/keyboard-nav/progress-bar JS, print block) with a new print checklist
item. Core stances (one-pass, adaptable design vs rigid process, house style first)
untouched. Canonical copy is `plugins/toolkit/skills/doc-to-html/SKILL.md` only;
origin doc updated for parity. `toolkit` `0.11.0` → `0.11.1` across all four
manifests; the validator passes. See
[`docs/decisions/doc-to-html.md`](decisions/doc-to-html.md) (2026-07-02 amendment).

## repo — 2026-06-30

### Add a Cursor plugin marketplace surface + per-plugin LICENSEs

Published the plugins through Cursor's
plugin-marketplace convention, a third parallel host surface alongside Claude Code
(`.claude-plugin/marketplace.json`) and Codex (`.agents/plugins/marketplace.json`).
Added `.cursor-plugin/marketplace.json` (root, lists them by `source`
folder) and per-plugin `plugins/<name>/.cursor-plugin/plugin.json` manifests
(versions mirroring the existing ones, with `skills`/`agents` directory pointers), following the
[`cursor/plugins`](https://github.com/cursor/plugins) format. Also added
`plugins/toolkit/LICENSE` (MIT). The
`scripts/validate-native-plugin.ps1` validator gained Cursor checks — the marketplace
must list the plugins with the right sources, and each Cursor manifest's
version is held in lockstep with its Claude/Codex manifest (the same drift guard the
other surfaces get). `docs/adoption/native-plugin.md` lists the new surface, and
Cursor install instructions (the Team-Marketplace "Import from Repo" flow for
custom repos, Teams/Enterprise admin) were added to the root and `toolkit` READMEs and `native-plugin.md`. No version bump — additive
packaging at the versions already in flight. See
[`docs/decisions/cursor-plugin-surface.md`](decisions/cursor-plugin-surface.md).

## toolkit 0.11.0 — 2026-06-30

### get-pr-comments — new toolkit skill for PR-comment triage

Added `get-pr-comments`, a small, self-contained skill that pulls the active PR's
feedback from all three GitHub surfaces (conversation, review verdicts, inline diff
comments) via `gh`, groups it by severity and actionability, and returns a
prioritized action list plus the open questions. Its load-bearing design choice is a
**read, never reply** boundary: it must not reply to, resolve, react to, or comment
on the PR unless the operator explicitly asks for that specific action — summarizing
feedback and answering it are different acts with different stakes. Self-contained
(`gh` only, no profile), so it ships **direct-use in the `toolkit` plugin**; it sits alongside `ci-watcher` as the two read-only "state of my PR"
tools. See [`docs/decisions/get-pr-comments.md`](decisions/get-pr-comments.md).

- Canonical `plugins/toolkit/skills/get-pr-comments/SKILL.md` (the only copy); origin
  doc `docs/skills/get-pr-comments.md`. Both toolkit-skills lists in
  `scripts/validate-native-plugin.ps1` widened to eight. `plugins/toolkit/README.md`,
  root `README.md`, the Codex toolkit manifest, the `docs/adoption/native-plugin.md`
  Codex enumeration, and the skills roster updated. `toolkit` `0.10.0` → `0.11.0`. The validator passes.

## toolkit 0.10.0 — 2026-06-29

### ci-watcher — new toolkit agent for PR CI monitoring

Added `ci-watcher`, a small, self-contained agent that watches the current branch's
PR checks via `gh` and reports a pass/fail verdict with the failing-log excerpt or
check link — dispatch it (ideally in the background) instead of babysitting the
checks tab. It's the toolkit's first **utility** agent (neither review nor
governance), so the plugin's identity broadened to "review, governance, and
CI-monitoring agents." Because it's self-contained (works in any repo with a GitHub
PR + authenticated `gh`, no profile), it ships **direct-use in the `toolkit` plugin**. The spec was operator-provided in
another host's format and adapted: dropped `is_background` (moved to prose), mapped
dropped `model: fast` for `model: inherit` (the scaffold never names models), and added `tools: Bash, Read` (read-only). See
[`docs/decisions/ci-watcher.md`](decisions/ci-watcher.md).

- Canonical `plugins/toolkit/agents/ci-watcher.md` (the only copy); origin doc
  `docs/agents/ci-watcher.md`. `scripts/validate-native-plugin.ps1` toolkit-agents
  list widened to six. `plugins/toolkit/README.md`, root `README.md`, and the agent
  roster updated (roster also fixed a decouple leftover — `code-quality-reviewer`'s
  Pack column now reads `toolkit`, not `review-core`). `toolkit` `0.9.0` → `0.10.0`
  (new agent). The
  validator passes.

## toolkit 0.9.0 — 2026-06-29

### code-quality-review — new strict, structure-first maintainability skill

Added `code-quality-review`, a direct-use toolkit skill that runs an unusually
strict, **structure-first** maintainability review over a branch's diff. Its
posture is structural ambition over nit-picking: its first instinct is to hunt for
a "code judo" reframe that *deletes* whole categories of complexity rather than
rearranging them, and it treats file-size explosions (the 1000-line crossing),
ad-hoc spaghetti-branch growth, canonical-layer / boundary leaks, and unearned
abstractions as **presumptive blockers** — waivable only with a clear
justification — while preferring a few high-conviction structural findings over a
long list of cosmetic notes. It fills the gap between the toolkit's review *agents*
and its runtime QA skill (`qa-sweep`): the maintainability counterpart to
`pattern-reviewer` and the correctness path. System-agnostic — no product, path, or
ticket names in the body; the one concrete number (1000 lines) is a
decomposition-conversation starter, not a mechanical gate.

The skill content was **operator-provided as a finalized spec and adopted
verbatim**, with three deltas: `name` is the neutral `code-quality-review`,
`disable-model-invocation` is dropped (so the skill is model-invocable), and the
spec's "thermo-nuclear" branding is dropped throughout (neutral H1 and trigger
phrases). Because the content was supplied rather than designed here, the
`writing-skills` RED→GREEN authoring loop doesn't apply — this was a wiring task,
not a derivation. See [`docs/decisions/code-quality-review.md`](decisions/code-quality-review.md).

- Canonical `.claude/skills/code-quality-review/SKILL.md` propagated byte-identical
  to its mirrors (`.codex`, `.gemini`, `toolkit`); origin doc `docs/skills/code-quality-review.md` written and mirrored;
  roster, root README, toolkit README, and the marketplace-doc Codex skill
  enumeration updated. `toolkit` `0.8.4` → `0.9.0` (new skill = minor). Both
  `$expectedSkills` arrays in `scripts/validate-native-plugin.ps1` widened; the
  validator passes.

### code-quality-reviewer — new toolkit agent for the code-quality review stage

Added `code-quality-reviewer`, the fifth toolkit review agent and the dispatchable
counterpart to the new `code-quality-review` skill. It fills a stage the scaffold
always named but never shipped: the implementation-review loop runs **code quality
→ pattern → test trustworthiness**, and `pattern-reviewer` documents that it runs
"after code-quality review," but the code-quality agent itself was left for each
project to supply. This agent is it — a review-only subagent that **loads the
`code-quality-review` skill as its rubric** and applies it to a diff in its own
context (keeping the full diff out of the parent's window), with a built-in fallback
when the skill is absent. It reviews the `### Git / diff output` and `### Changed
file contents` sections a parent supplies, or gathers `git diff <base>...HEAD`
(default base `main`) itself.

The agent spec was operator-provided (originating in a Cursor "team kit") and
**adapted** into the scaffold rather than copied verbatim: de-branded (no
"thermo-nuclear"), repointed from the foreign plugin to the bundled skill, and made
host-agnostic (Cursor subagent-type names replaced with the host's Task mechanism;
Claude-format frontmatter with thin `.codex` / `.gemini` / `.opencode` wrappers).
See [`docs/decisions/code-quality-reviewer.md`](decisions/code-quality-reviewer.md).

- Canonical `.claude/agents/code-quality-reviewer.md` + host wrappers propagated
  byte-identical to `plugins/toolkit/agents/`; origin
  doc `docs/agents/code-quality-reviewer.md` written and mirrored. `marketplace/catalog.json`
  gains the agent (role `review-only`, maturity `core`, pack `review-core`) and the
  `review-core` pack list grows; re-mirrored. Agent roster, root README, and toolkit
  README (`four` → `five` agents) updated. The toolkit-agents list in
  `scripts/validate-native-plugin.ps1` widened. Rides the same unreleased batch as the
  skill — `toolkit` `0.9.0`, no further bump. The validator
  passes.

## toolkit 0.8.4 — 2026-06-24

### handoff-review — add a verify-then-continue mode for clean restarts

Broadened `handoff-review` from a pre-PR-review-only brief into one that also
serves a clean restart: when a session's context has gone bad, a new session
picks up the brief, *independently verifies* what the prior session did (rather
than trusting its word), and continues the remaining work from a verified
foundation. The unifying spine is that **verification is the precondition for
continuing** — the review is the gate, not an add-on. A third mode, `continue`
(alias `resume`), writes a verify-then-continue brief carrying current state
(re-derived from the repo), the remaining work as an outcome, and concrete
operating rules; the existing `default` (spawn) and `handoff` / `session`
(scratch file) modes stay verify-only. The continuation extension is
deliberately light and points at `handoff-goal` for substantial forward work
rather than duplicating its acceptance-checks / integrity apparatus. The name
was kept (`handoff-review`) to avoid churning ~46 references. See
[`docs/decisions/handoff-review-verify-and-continue.md`](decisions/handoff-review-verify-and-continue.md)
and its [implementation plan](decisions/handoff-review-verify-and-continue-implementation-plan.md).

- Canonical `.claude/skills/handoff-review/SKILL.md` propagated byte-identical to
  its mirrors; origin doc `docs/skills/handoff-review.md` and the
  `docs/skills/README.md` roster / composition updated and mirrored; `plugins/toolkit/README.md` skill row updated. `toolkit`
  `0.8.3` → `0.8.4`.
  `scripts/validate-native-plugin.ps1` passes.

## toolkit 0.8.3 — 2026-06-19

### handoff-pr — follow the repo PR template instead of replacing it

Fixed a real defect (caught via a weaker model's review of actual PRs): although
`handoff-pr` already says the body **is** the repo's PR template filled in, PRs
were going out carrying the skill's *built-in fallback* headings (`Summary` /
`Ticket` / `Caveats`) even when the repo shipped a template. Root cause was a
skill-design attractor — the fallback skeleton was the only concrete, copy-ready
block in "The artifact," so the model pattern-matched to it over the prose
"follow the template" instruction, with no forcing function on detection and no
conformance check. The fix is structural, not another prohibition: template
detection is now a **recorded gate** (the fallback is allowed only after an actual
search came up empty), the fallback is **demoted** to an explicit no-template
branch so it stops reading as the default, and Step 5 requires a
**heading-conformance check** before finalizing. Two adjacent generalizable nuggets
were folded in tool-agnostically — validation evidence in a template's test field
is commands+results (not bare file names), and the title/branch conform to the
repo's enforced linter pattern (discovered, not guessed). The rest of the source
review was heavily over-fitted to one repo (named formatter, package manager,
ticket scheme, review bot, branch scopes, colleague names) and was deliberately
**not** absorbed; rejected items are listed in the decision note. See
[`docs/decisions/handoff-pr-follow-not-replace-template.md`](decisions/handoff-pr-follow-not-replace-template.md).

- Canonical `.claude/skills/handoff-pr/SKILL.md` propagated byte-identical to its mirrors; origin doc `docs/skills/handoff-pr.md` updated and mirrored. `toolkit` `0.8.2` → `0.8.3`.
  `scripts/validate-native-plugin.ps1` passes.

## toolkit 0.8.2 — 2026-06-19

### handoff-goal — make the document defend the goal, not just preserve context

Reworked `handoff-goal` from a strong context-preserver into a goal *defender*.
The skill's founding rule (the document is the only context that survives) gains a
second: the document is the goal's defense against its own pursuing loop, which
under speed pressure Goodharts whatever *looks* done. The emitted document now
injects that discipline itself rather than assuming the target repo supplies it:
**verifiable acceptance checks** (verify command + evidence, plus a refutation/
mutation form for behavior changes) replace prose "definition of done"; an
**integrity rules** block forbids weakening/skipping/renaming-away tests and gates
and narrowing/reinterpreting scope (escalate instead); an operator-set **quality
posture** (default reliability-over-speed); **independent verification** baked into
the loop shape (act → verify with an independent pass → record → repeat);
stakes-scaled **invariants / non-goals**; a **progress ledger** authoritative over
post-compaction recollection; explicit **when-to-stop** conditions including the
"tempted to redefine the goal/checks/scope" tripwire; and a compaction *drift
check*. A calibration section keeps it from becoming a fortress: four parts are
always-on (verifiable checks, integrity rules, independent verification, the
tripwire), the rest scale with stakes. The `description` (triggering conditions) is
unchanged. See [`docs/decisions/handoff-goal-goal-defense.md`](decisions/handoff-goal-goal-defense.md).

- Validation note: across **three** methodologies — two reflective scenarios and a
  faithful behavioral test (a real runnable scratch repo, real tool-execution, a
  weaker pursuer model, and a subtle special-case-the-input hack caught by a hidden
  test the pursuers never saw) — the RED could not be established: pursuers did not
  reward-hack in either arm. When the honest fix is cheap they make it; when it is
  blocked they escalate. The change is **design-validated, not behavior-proven**;
  the intended mechanism (the tripwire was invoked by name) and a scope/autonomy
  delta were the observable wins. Full account in the decision note, including a
  wording refinement applied off the test (the integrity rule's "rename-away" now
  names the actual dodge and allows a legitimate repoint-to-a-seam fix).
- Canonical `.claude/skills/handoff-goal/SKILL.md` propagated byte-identical to its mirrors (`.codex`, `.gemini`, `toolkit`);
  origin doc `docs/skills/handoff-goal.md` updated and mirrored to both reference
  roots. `toolkit` `0.8.1` → `0.8.2` (rework of an existing skill = patch). No
  skill added or removed; `scripts/validate-native-plugin.ps1` passes.

### claim-check — STOP when the premise's source can't be reached

Closed a hole in `claim-check` surfaced in lived use: a session handed a ticket it
could not access (no integration, URL unreachable, no paste) ran the investigation
anyway, reconstructing the premise from the link and its own memory and emitting a
verdict on a resource it never saw. A new **access precondition** now fires before
the investigation — if the premise's source, or the artifact it concerns (ticket,
PR, repo, file, reference), can't be reached and the operator can't supply it, the
skill STOPs and reports the access gap (what couldn't be opened, what was tried,
what would unblock it) rather than substituting the link slug, memory, or inference
for the resource. Explicitly distinguished from `inconclusive` (which is earned
only *after* a real investigation hits a wall): the access STOP is a can't-start
precondition failure, not a verdict bucket. The premise-resolution fallback and the
Rules now cross-reference it. The `description` is unchanged. See
[`docs/decisions/claim-check-access-precondition.md`](decisions/claim-check-access-precondition.md).

- Canonical `.claude/skills/claim-check/SKILL.md` propagated byte-identical to its mirrors; origin doc `docs/skills/claim-check.md` updated and mirrored. Rides the same `toolkit` `0.8.2`
  bump as the handoff-goal rework above — no additional bump, both reworks ship in
  one batch. `scripts/validate-native-plugin.ps1` passes.

### handoff-pr — discover and run the repo's pre-push static gates

Closed a hole behind a real CI failure: a branch was handed off and pushed without
the repo's *required* formatter gate ever running locally — `--no-verify` commits
had bypassed the pre-commit hook, the handoff carried no pre-push gate, and CI's
fail-fast formatter check blocked the whole PR while "tests pass" hid it. The
validation step is now a **discover-then-run gate**: the producing session
discovers what the repo actually gates a PR on (reading its CI workflows, hook
config, build/package scripts, and contributor docs — no hardcoded toolchain),
identifies the fast static checks (format / lint / type-check) **separately** from
the test suites, runs them against an up-to-date base, and records the exact
commands and results by kind. It calls out the `--no-verify` hazard explicitly
(hook-bypassing commits skip the formatter — run it by hand before push) and keeps
formatting/typecheck/stale-base failures separated in any "known issues" note so
the opener fixes the gate that's actually red. The validation-provenance field and
Rules carry it; the body stays tool-agnostic by discovery. See
[`docs/decisions/handoff-pr-prepush-validation-gate.md`](decisions/handoff-pr-prepush-validation-gate.md).

- Canonical `.claude/skills/handoff-pr/SKILL.md` propagated byte-identical to its mirrors; origin doc `docs/skills/handoff-pr.md` updated and mirrored. Rides the same `toolkit` `0.8.2`
  batch bump — no additional bump. `scripts/validate-native-plugin.ps1` passes.

## toolkit 0.8.1 — 2026-06-18

### handoff-pr — derive the PR body from the repo's own PR template

Reworked `handoff-pr` so the PR body is no longer skill-invented. A new step before
assembly searches for a PR template GitHub would honor (case-insensitive):
`.github/pull_request_template.md` / `PULL_REQUEST_TEMPLATE.md`, any file under
`.github/PULL_REQUEST_TEMPLATE/`, and the same names (plus the directory form) in the
repo root and under `docs/`. When a template exists, the body *is* that template filled
in verbatim — headings, order, checkbox items, and `<!-- markers -->` preserved, our
content mapped into its existing fields, checklist boxes ticked `[x]` only when actually
verified; multiple templates are chosen by branch/intent and the choice is recorded.
With no template it falls back to a trimmed built-in Summary / Ticket / Caveats body.
The artifact is now two visibly separate blocks: the paste-ready **PR body** and an
opener-only **handoff notes** block carrying which template was used, validation
provenance, review status, and the `gh pr create` command — so process fields never leak
into the public PR description. A rule keeps the body tooling-agnostic (no named editors,
bots, or AI assistants; no "generated by" footers). See
[`docs/decisions/handoff-pr-template-derived-body.md`](decisions/handoff-pr-template-derived-body.md).

- Canonical `.claude/skills/handoff-pr/SKILL.md` propagated byte-identical to its mirrors (`.codex`, `.gemini`, `toolkit`); origin doc
  `docs/skills/handoff-pr.md` and the `docs/skills/README.md` one-liner updated and
  mirrored. `toolkit` `0.8.0` → `0.8.1` (rework of an existing skill = patch). No skill
  added or removed; `scripts/validate-native-plugin.ps1` passes.

## toolkit 0.8.0 — 2026-06-17

### qa-sweep — new team-scale, corroborated QA skill

Added `qa-sweep`, a direct-use skill that runs a broad QA / verification pass over
a decomposable surface (release, branch, feature, app) by fanning a QA team over
independent slices, then **reproducing every verdict-moving finding firsthand at
the running surface before it counts** — dropping what won't reproduce, separating
regressions from pre-existing bugs against a baseline, and synthesizing a
verdict-first, confidence-tagged report. Extracted from a lived-in QA session: the
durable lesson was the corroboration loop, not the fan-out, so the skill is rigid
about Phase 0 (decomposition gate) and Phase 3 (firsthand corroboration) and
flexible about slicing / harness / team size. It deliberately composes rather than
duplicates the scaffold's other tools — the team-scale, runtime sibling of
single-change verification and of `claim-check`'s single-premise investigation —
and ships with an optional deterministic-workflow appendix (fan-out → independent
per-finding corroboration → synthesize, with inline `SLICE_SCHEMA` /
`VERDICT_SCHEMA`). System-agnostic: no product, ticket, path, or harness names in
the skill body. See [`docs/decisions/qa-sweep.md`](decisions/qa-sweep.md).

- Canonical `.claude/skills/qa-sweep/SKILL.md` propagated byte-identical to its mirrors (`.codex`, `.gemini`, `toolkit`);
  origin doc `docs/skills/qa-sweep.md` written and mirrored; roster, root README,
  toolkit README, and the marketplace-doc Codex skill enumerations updated.
  `toolkit` `0.7.1` → `0.8.0` (new skill = minor). Both `$expectedSkills` arrays in
  `scripts/validate-native-plugin.ps1` widened; the validator passes.

## toolkit 0.7.1 — 2026-06-17

### doc-to-html — house-style-first, deeper findings cards, render-bug fixes

Reworked `doc-to-html` from a second round of lived-in feedback (`toolkit` `0.7.0`
→ `0.7.1`). The biggest change is a new
**Step 0 — match the repo's house style first**: glob `tmp/`/`docs/` for an
existing standalone `.html` report and match its `<style>` and component
vocabulary; the skill's own design system is relabelled **fallback-only** and its
default vocabulary upgraded from the calm-flat look to the richer card-and-chip
one adopters expect. A new *Findings & audit reports* section makes each card
carry, by structure, a concrete **Evidence** line and a **Fix** line with a cost
pill (never a claim without evidence), orders findings **by severity descending**,
and adds prefixed-id grouping plus an optional Method section. Concrete render
bugs are pinned in the reference markup and checklist: styled scrollbars on every
scroll container, section-number badges aligned to their heading
(`align-items:center`), and one consistent cost-pill placement. The
verified-links rule is clarified (enrichment links optional; some doc URLs 404 to
a server-side fetch). The skill stays system-agnostic — all examples use generic
placeholders, no real product/ticket/path names. See the amendment in
[`docs/decisions/doc-to-html.md`](decisions/doc-to-html.md).

- Skill body propagated byte-identical to its mirrors
  (`.codex`, `.gemini`, `toolkit`); origin doc
  `docs/skills/doc-to-html.md` updated and re-mirrored.
  `scripts/validate-native-plugin.ps1` passes.

## toolkit 0.7.0 — 2026-06-16

### Renamed the `reviewers` plugin to `toolkit`

The direct-use plugin began as four review/governance agents but has since
accumulated five direct-use skills (only `handoff-review` is review-adjacent), so
the name had outgrown its contents. Renamed `reviewers` → `toolkit` to match its
real identity — direct-use, no-setup, runs in any repo. Scope is
unchanged: same four agents, same five skills. Agents now resolve as
`toolkit:<agent>`; install via `toolkit@agent-workshop`. Version `0.6.3` →
`0.7.0`. The switching cost was ~zero (operator's own machines
only). See [`docs/decisions/rename-reviewers-to-toolkit.md`](decisions/rename-reviewers-to-toolkit.md).

- `git mv plugins/reviewers plugins/toolkit` (history preserved); both manifests,
  both marketplaces, the validator, the root and plugin READMEs, and the
  marketplace docs (+ reference mirrors) updated. The validator's `*-reviewer.md`
  agent assertions are untouched — singular `-reviewer` is the agent, plural
  `reviewers` was the plugin. `scripts/validate-native-plugin.ps1` passes.

## reviewers 0.6.3 — 2026-06-16

### claim-check — output trimmed to three parts

Restructured the report after a real run was hard to read (`reviewers` `0.6.2` →
`0.6.3`). The cause was template slots the
model dutifully filled, so the fix deletes them: the report is now **three parts
and nothing else** — Verdict (+ how-verified), Prior/parallel work, Readiness —
written as **plain text, not a blockquote**. The per-claim verdict table is gone
(claims are still investigated atomically; only the conclusion is reported, since
the verdict synthesis and readiness already carry which parts are real or stale);
the echoed `Source` line is gone; and prior/parallel work stays its own section
but is trimmed to what bears on the verdict and lifted back above readiness. An
explicit "Do not" list in the skill pins the four cuts. See the amendment in
[`docs/decisions/claim-check.md`](decisions/claim-check.md).

## reviewers 0.6.2 — 2026-06-16

### claim-check — depth gate and inconclusive verdict

Addressed the central failure mode reported from real runs: two sessions
concluded too early with confident verdicts that only got corrected after the
operator pushed back. Since depth is the skill's whole purpose, `claim-check`
gains a grounding gate (`reviewers` `0.6.1` → `0.6.2`). A new *Grounding a verdict* section defines an **evidence ladder** (ran
a repro / read the source at the top; subagent summary and inference at the
bottom): a `confirmed`/`refuted` verdict is earned only from the top rungs, a
verdict is only as strong as its weakest load-bearing claim, and a **contest
test** ("would this survive the operator pushing back once?") runs before any
verdict ships. A new sixth verdict, **`inconclusive`** (needs more information),
makes "I genuinely hit a wall" a first-class honest outcome — earned only after a
deep search, required to name the wall and the breaching input, and explicitly
gated so it cannot become a lazy escape from digging. See the amendment in
[`docs/decisions/claim-check.md`](decisions/claim-check.md).

- Skill body propagated to its mirrors (single shared hash); origin doc
  updated and re-mirrored; `scripts/validate-native-plugin.ps1` passes.

## reviewers 0.6.1 — 2026-06-16

### claim-check — refinements from first runs

Revised `claim-check` from two independent model runs on real tickets plus
operator review (`reviewers` `0.6.0` → `0.6.1`). The output is now **verdict-first** (verdict + how-verified and
readiness lead; `Source` moves to the bottom) and reports per-claim evidence
**lopsidedly** — settled claims collapse, only contested ones get space, and a
uniform verdict needs no claim list. Two new investigation moves are explicit: a
**provenance** step (check where the premise's evidence came from vs. the repo's
actual source of truth) and **conflict reconciliation** (read disputed lines
yourself when subagents disagree; never average). Depth is right-sized to the
claim's blast radius, and `mis-scoped` gets a corrected-framing slot.

- The terminal boundary moved from "never run anything" to "never implement the
  fix": a repro / falsification test for a falsifiable code claim is now part of
  the search, not implementation. This revises the original terminal-state
  decision for code claims specifically — see the amendment in
  [`docs/decisions/claim-check.md`](decisions/claim-check.md).
- Skill body propagated to its mirrors (single shared hash); origin doc
  updated and re-mirrored; `scripts/validate-native-plugin.ps1` passes.

## reviewers 0.6.0 — 2026-06-15

### claim-check skill — unbiased premise investigation

Added `claim-check`, a skill that runs an unbiased, evidence-grounded
investigation of a premise — a tracker ticket (the primary case), a hunch, or a
bare question — against the current repo, then stops at a verdict without
implementing. Every claim is treated as a hypothesis checked against evidence,
never assumed in either direction, so "the premise still holds" is a first-class
outcome alongside "already handled." A fuzzy input is first articulated into
atomic claims and confirmed with the operator; fan-out to subagents is the
recommended (not mandated) tool for code/doc scanning, with neutral,
evidence-returning briefs. Output is two-axis: a validity verdict (`confirmed` ·
`partially-confirmed` · `refuted/obsolete` · `mis-scoped` · `confirmed-but-blocked`)
with evidence, plus a readiness dossier or exactly what is missing. See
[`docs/decisions/claim-check.md`](decisions/claim-check.md) and the origin doc
[`docs/skills/claim-check.md`](skills/claim-check.md).

- Byte-identical mirrors in `.codex/` and `.gemini/`; the skills roster is now eleven skills and both READMEs name
  it. Shipped as an active `reviewers` plugin skill (`0.5.0` → `0.6.0`): payload
  copy, validator pin widened to the five skills, both reviewers manifests, the
  Claude marketplace entry, plugin README, root README, and the marketplace docs
  updated. `scripts/validate-native-plugin.ps1`
  passes.
- Refined the prior-work scan (step 3): git history (commits, merged PRs) is
  always searched; sibling/duplicate tickets are searched only when the tracker
  is queryable, and the skill must say the backlog was not swept when it is not
  reachable — rather than implying it was. Propagated to its mirrors.

## reviewers 0.5.0 — 2026-06-11

### doc-to-html skill — markdown to standalone dark HTML page

Added `doc-to-html`, a scaffold skill that renders a markdown report / audit /
findings document as a single self-contained dark-themed HTML page (sticky TOC,
keyboard nav, verified-links-only, evidence appendix, print stylesheet) and
governs how the page is edited afterward. The design system ships as
battle-tested defaults (bright sans-serif on a dark blue-gray canvas, subtle
card panels, one sparing accent family); the process rules are rigid:
one-pass generation, full clean rewrite on any design-direction change,
one-knob-at-a-time feedback handling, a collision-safe renumbering procedure,
and a pre-finish checklist. Reference markup for the card and vertical-stepper
structures is embedded in the skill. See
[`docs/decisions/doc-to-html.md`](decisions/doc-to-html.md) and the origin doc
[`docs/skills/doc-to-html.md`](skills/doc-to-html.md).

- Byte-identical mirrors in `.codex/` and `.gemini/`; the skills roster is now ten skills and the README skills
  line names it. `scripts/validate-native-plugin.ps1` passes.
- Shipped the same day as an active `reviewers` plugin skill (`0.4.0` →
  `0.5.0`) so already-installed instances update in place: payload copy,
  validator pin widened to the four skills, both reviewers manifests, the
  Claude marketplace entry, plugin README, root README, and marketplace docs
  updated. See the amendment in
  [`docs/decisions/doc-to-html.md`](decisions/doc-to-html.md).
- GREEN-tested per the writing-skills discipline: a fresh agent given only the
  skill applied the one-knob rule, the renumbering procedure (ids,
  cross-references, TOC, keyboard array, grep verification), the
  rewrite-on-direction-change rule, and the full pre-finish checklist.

## reviewers 0.4.0 — 2026-06-10

### handoff-goal skill — forward handoff in the reviewers plugin

Added `handoff-goal`, the third handoff skill, shipped through the `reviewers`
plugin (now `0.4.0`). Where `handoff-review` / `handoff-pr` hand a finished
branch backward, `handoff-goal` hands work *forward*: it writes a self-contained
goal document (`tmp/<YYYY-MM-DD>-<goal-slug>.md`) that a new session picks up
and pursues autonomously. The document carries the goal as an outcome with a
definition of done, current state re-derived from the repo, and operating rules
with concrete values (branch / worktree, commits, push / PR, validation,
stop-and-ask boundaries), and instructs the pursuing session to re-read the
rules after every compaction and append to a progress log — the file, not
session memory, is the durable contract. Goal resolution is three-way: inferred
from session context (then confirmed), scoped to referenced existing work, or
shaped from a brand-new description. The skill never pursues the goal itself.
See [`docs/decisions/handoff-goal.md`](decisions/handoff-goal.md).

- Validator now requires the `reviewers` payload to expose exactly
  `handoff-goal`, `handoff-pr`, and `handoff-review`, each byte-identical to
  canonical; mirrors landed in `.codex/`, `.gemini/`, and the plugin payload; origin doc added and the skills roster is
  now nine skills.
- Authored test-first per the writing-skills discipline: a baseline (no-skill)
  run produced a doc with no compaction-survival mechanics and an invented
  user-mandated rule; with the skill, producer and zero-context consumer runs
  passed both checks.

## repo — 2026-06-08

### reviewers on the Codex marketplace

Added `reviewers` to the Codex marketplace with a Codex manifest on the existing
Claude Code reviewers payload. It installs from the same marketplace and exposes
`handoff-review` / `handoff-pr` as Codex skills; the reviewer agent files remain
bundled for Claude Code and reference rather than active Codex plugin agents. See
[`docs/decisions/codex-reviewers-plugin.md`](decisions/codex-reviewers-plugin.md).

## reviewers 0.3.0 — 2026-06-08

### Handoff skills in the reviewers plugin

Added two direct-use prompt-artifact skills and shipped them through the `reviewers`
plugin (now `0.3.0`, broadened from agents-only to agents + skills). `handoff-review`
produces a self-contained, unbiased review brief (task-vs-code, rules conformance,
information leak, correctness) for a separate agent or session to run before a PR.
`handoff-pr` produces a structured PR handoff artifact with confirmed ticket links and
review status for a separately-authorized session to open, and never runs
`gh pr create` itself. Both are tool-agnostic and stand alone — each re-derives the
task from the ticket + diff, not from the implementing session's context. See
[`docs/decisions/handoff-skills.md`](decisions/handoff-skills.md) and its
[implementation plan](decisions/handoff-skills-implementation-plan.md).

- `scripts/validate-native-plugin.ps1` now requires the `reviewers` payload to expose
  exactly `handoff-pr` and `handoff-review`, each byte-identical to canonical —
  reversing the earlier "reviewers ships no skills" assertion.
- Canonical skills live in `.claude/skills/`, mirrored byte-identical to `.codex/`,
  `.gemini/`, the `reviewers` payload; origin docs
  added to `docs/skills/` and listed in the skills roster (now eight skills).

## reviewers 0.2.0 — 2026-06-05

### pattern-reviewer comment-noise check

Added a built-in comment-noise check to the canonical `pattern-reviewer`: in every
mode and regardless of domain, it flags comments that only restate the code
(line-by-line narration, name/signature headers, long blocks recoverable from the
code) and recommends deletion or replacement-by-naming, while explicitly keeping
comments that carry rationale, warnings, public-API intent, external references,
legal headers, and `TODO`/`FIXME` markers. Unlike project-specific conventions it is
reported as a finding even when undocumented; it defers to project-documented comment
conventions when they exist. Folded into the spec, origin doc, and catalog note, and
re-synced across the `reviewers` payload. See
[`docs/decisions/pattern-reviewer-comment-noise.md`](decisions/pattern-reviewer-comment-noise.md).
Bumped the `reviewers` plugin to `0.2.0` to ship the new capability.

## reviewers introduced — 2026-05-29

### Direct-use agents plugin

Added a second Claude Code marketplace plugin, `reviewers`, for
operators who want to use agents directly without onboarding the scaffold into a
project. It ships four curated standalone-capable agents (`spec-reviewer`,
`test-quality-reviewer`, `pattern-reviewer`, `vigil`) as active plugin agents and
contains no skills. This narrowly reverses the "no global scaffold agents"
non-goal for a bounded, curated subset; see
[`docs/decisions/agent-workshop-direct-use-agents-plugin.md`](decisions/agent-workshop-direct-use-agents-plugin.md).

- Enhanced canonical `pattern-reviewer` with a discovery/inference fallback: in a
  repo with no domain layout it discovers convention docs under `docs/` or infers
  conventions from sibling files, labelling findings lower-confidence rather than
  emitting a blanket coverage gap. Folded into the canonical spec, its origin doc,
  and the catalog note.
- The Claude marketplace now lists two plugins; `scripts/validate-native-plugin.ps1`
  validates the two-plugin marketplace and asserts the new payload has no skills and
  exactly four agents byte-identical to `.claude/agents/`.
- Generalized non-shipped sibling-agent references in `pattern-reviewer`,
  `spec-reviewer`, and `vigil` to role-based language (e.g. "a separate
  documentation-maintenance responsibility" instead of naming `wiki-maintainer`), so the
  curated plugin never points at agents absent from it and the canonical specs read
  portably in any context.
- Claude Code only this slice; Codex/Gemini/OpenCode delivery deferred.

## repo — 2026-05-23

### Manifest-backed agent marketplace

Added a marketplace layer for pack-based adoption. The new catalog defines initial agent packs (`review-core`, `docs-core`, `governance`, `specialized`), role and maturity labels, host-wrapper support, prerequisites, and project profile slots. Marketplace docs explain pack selection and keep project-specific behavior in profiles rather than canonical agent specs.

### Risk-aware test-quality reviewer

Reworked `test-quality-reviewer` from a narrow trustworthiness checklist into a lane-based scaffold for test trust, risk coverage, and test strategy. The canonical agent now supports `diff`, `audit`, and `strategy` modes; keeps `CRAP <= 6` as the default recommended ceiling when valid per-method CRAP data exists; leaves coverage targets project-defined; and treats property testing, mutation testing, and acceptance mutation testing as targeted strategy lanes rather than universal gates.

- Updated the Claude canonical spec plus Codex, Gemini, and OpenCode wrappers.
- Updated the origin doc, agent index, SDD example, and adjacent reviewer boundary language so adopters see the same ownership split.
