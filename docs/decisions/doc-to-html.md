# Decision: add the `doc-to-html` skill

**Date:** 2026-06-11

## Status

Implemented.

## Context

A recurring deliverable across real sessions: a markdown document: research
findings, an audit, a review; that the operator wants as a polished,
standalone HTML page. Built ad hoc each time, the page converges on the same
lessons learned the same expensive way:

1. **Readability failures on dark canvases.** Serif body text reads muddy on
   dark screens; gray-on-dark text is the single biggest readability killer;
   per-block colored boxes and left-border stripes turn a calm report into
   noise.
2. **Structure drift under edits.** Numbered sections, the TOC, element ids,
   and the keyboard-nav order array fall out of sync the first time a section
   is inserted or moved: the page silently breaks in ways nobody re-checks.
3. **Wrong edit strategy.** Restyling markup incrementally toward a *different
   design direction* compounds into a mess every time; and a single "I don't
   like it" gets answered with a whole-design swing instead of turning the one
   failing knob.

Each session that builds such a page without the distilled conventions repeats
the failures. That is the textbook pressure for a skill.

## The shape

`doc-to-html` renders a markdown document as a single self-contained dark
HTML page and governs how that page is edited afterward. Two deliberately
different stances inside one skill:

- **Design system as defaults.** The dark, calm, structured visual language
  (bright sans-serif body, subtle card panels, one sparing accent family,
  readable code chips) is presented as battle-tested defaults: adaptable when
  the document calls for a different mood.
- **Process rules as rigid.** One-pass generation, targeted-edit vs
  clean-rewrite (design-direction changes always rewrite), one-knob-at-a-time
  feedback handling, the renumbering procedure, and the pre-finish checklist
  are non-negotiable: each rule exists because its absence failed in real
  use.

The skill embeds compact reference markup for the two structures sessions
kept reinventing: the card (label → headline → metadata → body) and the
vertical stepper, so future sessions copy instead of improvising.

Content principles ride along: tables over prose walls, verified-links-only
(every external link fetched and annotated with its result), and an evidence
appendix that keeps raw proof out of the body without dropping it.

## Packaging

At first landing, a scaffold skill only (shipping through onboarding, not
through `reviewers`): superseded the same day; see the amendment below:

- Canonical at `.claude/skills/doc-to-html/SKILL.md`; byte-identical mirrors
  at `.codex/` and `.gemini/` per the skill-parity convention (`.opencode/`
  does not mirror skills).
- Onboard references in both reference roots: `references/skills/doc-to-html.md`
  and `references/docs/skills/doc-to-html.md`, plus the re-mirrored
  `references/docs/skills/README.md`.
- Origin doc at `docs/skills/doc-to-html.md`; roster entry in
  `docs/skills/README.md` (ten skills).
- `README.md` skills line gains the new name.
- The new reference files change the `plugins/agent-workshop` payload that
  both the Claude and Codex marketplaces serve, so the onboarding plugin bumps
  `0.1.2` → `0.1.3` in both payload manifests, the root manifest, and the
  Claude marketplace entry. (The Codex marketplace file carries no version
  fields.) This supersedes the handoff-goal precedent of leaving the
  onboarding version untouched on reference-only additions: a changed
  payload should carry a changed version so installs refresh.
- Distribution to Codex was initially via onboarding only: superseded the
  same day by the amendment below.

## Amendment (2026-06-11, same day): direct-use via `reviewers` 0.5.0

The operator has `reviewers` installed on a machine and wanted `doc-to-html`
available there without running onboarding. Onboarding-only distribution
cannot reach an already-installed plugin, so the skill is now also an active
`reviewers` plugin skill:

- Byte-identical payload copy at `plugins/reviewers/skills/doc-to-html/SKILL.md`;
  `scripts/validate-native-plugin.ps1` `$expectedSkills` widens to exactly
  {`doc-to-html`, `handoff-goal`, `handoff-pr`, `handoff-review`} in both the
  Claude and Codex assertions.
- `reviewers` `0.4.0` → `0.5.0` in both plugin manifests and the Claude
  marketplace entry; Codex manifest prose, default prompts, plugin README,
  root README, and marketplace docs now name the fourth skill.
- Identity note: `reviewers` is now described as review agents plus
  direct-use skills, rather than strictly handoff-themed: accepted
  deliberately over a separate single-skill plugin, because the point was
  updating an existing install in place.

## Amendment (2026-06-17): house-style-first + findings-card depth from lived-in feedback

After the skill shipped, an operator used it to render several real reports
(a multi-section QA-findings deck among them) and fed back what failed. Three
families of problem, all addressed here:

**The defaults were the wrong starting point.** The skill applied its own
calm-flat "design-system defaults" with no step to detect and match a report
already living in the repo. That produced a full wrong-aesthetic first pass
that had to be thrown away and rewritten against a sibling artifact. Fix: a new
**Step 0: match the repo's house style first** (glob `tmp/`/`docs/` for an
existing standalone `.html` report; read its `<style>` + component vocabulary
and match it). The design system is relabelled **fallback only**, and its
default vocabulary is upgraded from the calm-flat look to the richer
card-and-chip vocabulary adopters actually expect (progress bar, ~288px
sidebar, `.sec-num` badges, `.hero` + `.stat-grid`, `.card`/`.pid`/colored
`.chip`s, `.claim` quote box, `.term` block, `.why` caveat, `.fix` + `.cost`
pill, cite-chips, footer-of-artifacts; `--bg:#0e1117` family, ~16px body).

**Findings cards were under-specified**: "fancy but say nothing." A new
*Findings & audit reports* section makes the card carry, by structure, an
**Evidence** line (concrete: live result, `file:line`, or appendix cite) and a
**Fix** line with a cost pill. A claim must always include its evidence. It also
adds: order findings **by severity, descending** (most severe first, then
renumber); a recognised **grouping** variation (prefixed ids per
product/area); and an optional **Method** section for audit/QA/research output.

**Concrete render bugs**, fixed in the reference markup and the checklist:
styled scrollbars on every scroll container (not the raw OS bar);
section-number badges aligned to their heading (`align-items:center`, not
`baseline`, when sizes differ); and one consistent cost-pill placement across
all cards (a pill in the Fix header). The verified-links rule is clarified:
"don't ship unverified links; enrichment links are optional", with a note
that some canonical-looking doc URLs are JS-rendered and 404 to a server-side
fetch.

What the feedback said to **keep** (and this amendment strengthens, not
touches): the renumbering procedure, the evidence-appendix architecture, the
pre-finish checklist, and "design-direction change ⇒ full clean rewrite."

System-agnostic guard held: the operator's source reports name real systems;
none of those names enter the skill: all reference markup uses generic
placeholders (`F-1`, `AUTH-1`, neutral finding text).

Packaging: skill body change, so the same propagation as before:
canonical at `.claude/skills/doc-to-html/SKILL.md`, byte-identical to the
`.codex`/`.gemini`/`toolkit` mirrors and both onboarding reference roots; origin
doc re-mirrored. `toolkit` `0.7.0` → `0.7.1`, `agent-workshop` `0.1.9` →
`0.1.10` (its onboarding payload carries the changed reference copies).
`scripts/validate-native-plugin.ps1` passes.

## Amendment (2026-07-02): nine field findings from a real end-to-end run

An operator ran the skill (at `toolkit` 0.11.0) end-to-end on a 35-finding
performance-audit markdown in a repo with house-style siblings and fed back
nine findings: six from the run itself (F1–F6), three from reading the
fallback path (F7–F9, flagged as un-executed and reviewed skeptically). All
nine verified against the current source and were patched:

- **F1: self-contradictory sources.** New rigid process rule: derived numbers
  (totals, per-section counts) are recomputed from the rendered items;
  divergences from the source's stated numbers are flagged in the completion
  summary, never silently shipped either way. Checklist item 6 extended to
  match. (The run's source claimed "34 findings: 11/12/8/4", which sums
  to 35.)
- **F2: source-owned id schemes.** The severity-ordering bullet gains an
  exception: a source that already carries a stable, cross-referenced id
  scheme keeps it; the Renumbering procedure governs ids the skill assigns.
  Checklist item 3 reworded to "skill-assigned ids run top-down."
- **F3: default output path.** New process rule: same directory, same
  basename, `.html` extension, unless the user or document names a target.
- **F4: conditional evidence appendix.** Moved out of the unconditional
  "Every page gets" list: appendix only when the source carries bulk raw
  evidence; compact evidence (`file:line`, short quotes) stays inline.
- **F5: rigid/adaptable boundary for architecture.** New paragraph: house
  style governs visual treatment; it never waives the architecture itself
  (self-contained file, working TOC/scroll-spy/keyboard nav, print, verified
  links). Verified-links rule extended to relative/companion links (target
  file must exist); checklist item 7 extended.
- **F6: sibling tie-break.** Several qualifying siblings → most recently
  modified hand-authored report wins.
- **F7: Step 0 glob exclusions.** Generated output excluded
  (`node_modules/`, `dist/`, `coverage/`, `playwright-report/`, `.next/`);
  a candidate counts only if hand-authored (inline `<style>`, prose content).
- **F8: reference implementation for mandated chrome.** Reference markup
  gains the layout shell (sticky nav, progress bar, hero/stat-grid, table
  wrap) and the ~20-line scroll-spy + keyboard-nav + progress-bar JS with the
  three classic bugs pinned shut (key handlers inside form fields, short last
  section never activating, order array drifting from the DOM).
- **F9: print reference + verification.** Reference print block added;
  new checklist item 8 (white bg, dark text, nav/hints hidden, cards
  `break-inside:avoid`).

Core stances untouched: one-pass generation, adaptable design vs rigid
process, house style beats defaults, terse instruction style. The patches add
missing rules in place rather than restructuring.

Packaging: the skill now ships only in `plugins/toolkit/` (post-decoupling;
the onboarding bundle does not carry it), so one canonical copy changed.
Origin doc `docs/skills/doc-to-html.md` updated for parity (third-round
paragraph, solution-shape additions, five new pitfalls). `toolkit` `0.11.0` →
`0.11.1` across all four manifests (Claude/Codex/Cursor plugin manifests and
the Claude marketplace entry).

## Amendment (2026-07-13): comparative evaluation against an external artifact-authoring skill

The operator brought an external general-purpose skill definition
("simple-html-artifact": Tailwind-CDN, information-first single-page HTML,
`bg-white` default, posture/brief step, surface-choice matrix, content
discipline) and asked what it knew that `doc-to-html` didn't. The evaluation
frame was the Non-goals below: this skill is a *renderer with edit
governance*, not an author; it opens from disk and renders what the
markdown says.

**Rejected as out of scope (each against a recorded boundary):**

- **Tailwind CDN styling**: an external asset; breaks the opens-from-disk /
  print / archive contract (and `cdn.tailwindcss.com` is explicitly not for
  production). The self-contained architecture stays.
- **Brief/posture step and web-search-for-comparables**: authoring concerns.
  Step 0 (house-style detection) already fills the "constrain taste before
  styling" role, and this skill's posture is fixed: technical report.
- **Information-architecture guidance** (digestibility ladder, reader-job
  ordering, 4–6 section budget) **and content discipline** (convert prose to
  labels, cut examples/definitions): both violate "renders and maintains
  what the markdown says" and the no-dropped-content checklist item.
- **`bg-white` default**: the skill's identity is the dark report page; a
  light mood is already an allowed per-document adaptation.
- **Anti-AI-tell prohibition lists** (gradient heroes, glass cards, civic
  drift): aimed at marketing-page failure modes this skill doesn't have, and
  prohibition-formed; per writing-skills' form-matching, shaping problems get
  recipes, not prohibition lists. The one transferable insight inside them
  (visual sameness) was adopted as a recipe below.

**Adopted: four recipes, translated into this skill's own vocabulary:**

1. **Surface by reader action.** The bare "tables over walls" bullet becomes
   a per-section surface picker (shared attributes → table, ordered process →
   stepper, findings → card contract, nuance → caveat box, bulk output →
   terminal/appendix) plus the anti-sameness line: an unbroken run of
   identical cards is a flat hierarchy.
2. **Never invent numbers.** The derived-numbers rigid rule gains its
   inverse: the layout never creates data the source doesn't back; the
   `.hero`/`.stat-grid` note says three real stats beat four with one
   invented; checklist item 6 extended.
3. **~80ch prose measure.** Readability floor next to bright-text:
   `p,li{max-width:80ch}` in the reference shell; tables, terminal blocks,
   and the stat grid still span the column.
4. **Narrow-screen collapse.** A media query in the reference shell collapses
   the fixed 288px sidebar below ~900px; added to the non-waivable
   architecture list and as checklist item 9. This one is less "adopted" than
   "exposed": the mandated reference shell was genuinely unreadable at phone
   width: a defect verifiable in the CSS itself.

Micro-fix riding along: checklist item 1 gains "sequential heading levels."

Honesty note: unlike the prior amendments, these additions are comparative
rather than field-failure-driven (except the phone-width defect). They were
kept minimal and recipe-formed for exactly that reason; the next real render
is their validation run.

Packaging: one canonical copy (`plugins/toolkit/`). Origin doc
`docs/skills/doc-to-html.md` updated for parity (fourth-round paragraph,
solution-shape additions, four new pitfalls). `toolkit` `0.12.3` → `0.12.4`
in the three plugin manifests and the Claude marketplace entry.
`scripts/validate-native-plugin.ps1` passes.

## Non-goals

- Not a general frontend-design skill: scope is the report/document page
  shape only.
- No external assets, build steps, or frameworks; the page opens from disk.
- The skill does not pick the document's content or structure; it renders and
  maintains what the markdown says.

## Validation

- `scripts/validate-native-plugin.ps1` passes with the new reference files.
- GREEN test: a model given the skill and a revision scenario (insert a
  section mid-document; "the page looks noisy") applies the renumbering
  procedure and the one-knob rule instead of ad-hoc edits or a whole-design
  swing.

## Acceptance criteria

- `/doc-to-html` over a markdown file yields a single self-contained HTML
  page with TOC, keyboard nav, evidence appendix, print stylesheet, and the
  default design system.
- The skill text carries the card and stepper reference markup inline.
- All mirrors and both reference roots are byte-identical to canonical.
- `docs/change-log.md` gets an entry via the `change-log` skill when this
  lands.
