# doc-to-html

## Origin

A long research session ended the way many do: a markdown findings document and the request "make this a page I can actually read." The page got built ad hoc — and then rebuilt, because the first pass made every classic mistake: serif body text that read muddy on the dark canvas, gray-on-gray metadata nobody could read, a rainbow of colored sub-boxes fighting for attention, and links that had never been checked. Later edits made it worse: an attempted restyle toward a calmer aesthetic was done incrementally on markup built for the louder one, and a mid-document section insertion silently broke the TOC, the element ids, and the keyboard-nav order.

By the end, the conventions that survived were worth keeping and the editing mistakes were worth forbidding. `doc-to-html` freezes both.

A second round of lived-in use — rendering several real reports, including a multi-section QA-findings deck — surfaced the deeper lesson: the skill's own defaults were the *wrong starting point* when a report already lived in the repo. Matching that sibling artifact, not the skill's defaults, is now the first move; the defaults are the no-sibling fallback. Findings cards gained a required evidence-and-fix structure, findings sort by severity, and a handful of concrete render bugs (raw scrollbars, a number badge misaligned from its heading, a cost pill that floated inconsistently) got pinned shut.

A third round — field feedback from converting a large performance audit in a repo that had house-style siblings — filled in the rules the skill had left implicit: what to do when the source's own numbers contradict its items (recompute and flag, never silently ship), when *not* to renumber (a source that owns a stable, cross-referenced id scheme keeps it), where the output lands by default (same directory, same basename, `.html`), when the evidence appendix applies (bulk raw evidence only — compact `file:line` evidence stays inline), which architecture items yield to house style and which never do, and how Step 0 avoids mistaking generated HTML (`coverage/`, `playwright-report/`) for a hand-authored sibling. It also exposed that the most bug-prone mandated components — scroll-spy, keyboard nav, progress bar, print stylesheet — shipped with no reference implementation, so fallback runs reinvented them; the skill now carries the chrome JS and print CSS inline.

A fourth round was comparative rather than field-driven: an external general-purpose "information-first HTML artifact" skill (Tailwind-CDN, light-theme, authoring-oriented) was evaluated side-by-side to see what it knew that this skill didn't. Most of it fell to the recorded non-goals — CDN styling breaks the opens-from-disk contract, and information-architecture / content-discipline guidance belongs to an author, not a renderer bound to "no markdown content dropped." Four transferable recipes survived the scope filter: pick each section's render surface by reader action instead of defaulting everything to the same shape, never invent a number to fill a layout slot (the 4-up stat grid quietly tempted exactly that), cap running prose at ~80ch, and collapse the fixed sidebar at phone width — that last one exposed a genuine defect in the mandated reference shell, which had been unreadable on a phone all along.

## Problem

Failure families recur when a session builds a report page without the distilled conventions:

1. **Readability on dark canvases.** Serif on dark reads muddy; dim gray text on a dark background is the #1 readability killer; per-block colored boxes and left-border stripes turn a calm report into noise. Each is rediscovered by user complaint, one round-trip at a time.
2. **Structure drift under edits.** Numbered cards, TOC entries, element ids, cross-references, and the keyboard-nav order array are five copies of the same ordering. Insert or move one section and some subset silently desyncs — and nobody re-checks.
3. **Wrong edit strategy.** Restyling markup incrementally toward a *different design direction* compounds into a mess; and a single "I don't like it" gets answered with a whole-design swing when one knob (contrast, density, hierarchy) was the actual complaint.
4. **Defaults applied over an existing house style.** A repo with a sibling `.html` report already has an aesthetic. Reaching for the skill's own defaults first produces a wrong-look first pass that is thrown away whole and rewritten against the sibling — the most expensive single mistake of the second round.
5. **Findings cards that say nothing.** A card that is only label → headline → body reads as "fancy but empty." Audit/QA findings need the claim's concrete evidence (`file:line`, a live result, an appendix cite) and an action with a cost — carried by structure, not left to prose discipline. And findings shown in arrival order, not severity order, bury the worst item mid-page.

## Solution shape

A rendering contract plus an editing discipline. **Step 0 comes before everything: match the repo's existing house style if one is found** (read a sibling report's `<style>` and component vocabulary; the defaults are only the no-sibling fallback). Candidates exclude generated output and must be hand-authored; if several qualify, the most recently modified wins. The page architecture is fixed (single self-contained file, sticky TOC with keyboard nav that collapses to static flow at phone width, each section's surface picked by reader action — tables for shared attributes, stepper for sequences, cards for findings, never an unbroken run of one shape — verified-links-only with inline result annotations — relative links verified to exist on disk, styled scrollbars, print stylesheet; the evidence appendix is conditional on bulk raw evidence). House style governs the visual treatment of that architecture, never its presence. The fallback design system — dark blue-gray canvas, bright sans-serif body capped at ~80ch of running prose, the rich card-and-chip vocabulary adopters expect (`.sec-num`, `.hero`/`.stat-grid`, `.card`/`.pid`/`.chip`, `.claim`, `.term`, `.why`, `.fix`/`.cost`, cite-chips) — is framed as **defaults**, adaptable when a document needs a different mood. The process rules are **rigid**: one-pass generation, a default output path (source directory, source basename, `.html`), derived numbers recomputed from the rendered items and never invented (source contradictions flagged, never silently shipped; no stat cell or count the source doesn't back), targeted-edit vs clean-rewrite (a design-direction change always rewrites), one-knob-at-a-time feedback handling, a collision-safe renumbering procedure, and a pre-finish checklist (parse-check, TOC targets, nav-order array, severity order, styled scrollbars, badge/cost-pill alignment, no dropped content, derived-number reconciliation, print stylesheet present, narrow-screen collapse).

For findings reports specifically: order findings by severity descending, give each card a required claim → evidence → fix-with-cost structure, group items into prefixed sub-sections when they partition, and offer an optional Method section. A source that already owns a stable, cross-referenced id scheme keeps it — renumbering governs only ids the skill assigns.

The skill also embeds compact reference markup for the structures sessions kept reinventing — the layout shell (sticky nav, progress bar, hero/stat-grid, table wrap), the finding card (id/chip header → claim quote box → evidence → fix + cost pill), the header-row alignment, the styled scrollbar, the terminal block, the vertical stepper, the scroll-spy/keyboard-nav/progress-bar JS with its classic bugs pinned shut, and the print block — so future sessions copy rather than improvise.

## Real invocation snippet

> /doc-to-html turn docs/audit-findings.md into a standalone page

One pass, full page, checklist run before handover.

> the page feels too dense

Not a redesign trigger. The skill asks which element fails — contrast, density, or hierarchy — and turns that knob only.

> add a "rollback plan" section between 6 and 7

Renumbering procedure: descending replace-all, then cross-references, TOC, ids, and the keyboard-nav array, verified with a grep.

> order the findings by severity

Sort descending (critical first), then the renumbering procedure so ids run top-down and every cross-ref/TOC/nav entry follows.

## Pitfalls observed

- **Defaults over an existing house style.** Reaching for the skill's own look when the repo already has a report aesthetic — the first pass is wrong-aesthetic and gets thrown away. Glob for a sibling `.html` and match it *before* generating.
- **Findings cards that are fancy but empty.** A card without a concrete evidence line and an action reads as decoration. Make the structure force claim → evidence (`file:line` / live result / appendix cite) → fix + cost.
- **Raw OS scrollbars.** Overflowing terminal blocks and wide tables show the unstyled system scrollbar against a dark page — jarring. Theme every scroll container.
- **Number badge misaligned from its heading.** `align-items:baseline` floats a small mono badge high or low next to a large heading; use `align-items:center` when the sizes differ.
- **Inconsistent cost-pill placement.** A cost pill that lands at the end of whichever sentence is last varies card to card; pin it to one place (the Fix header).
- **Incremental restyling toward a new direction.** The single most expensive mistake. Markup built for one aesthetic resists another; each patch adds special cases. Direction change = clean rewrite, every time.
- **Whole-design swings from vague dislike.** "Looks off" answered with a new palette, new layout, new typography — destroying the parts that worked. Ask for the failing element first.
- **Partial renumbering.** Renumbering the headings but not the ids, or the ids but not the keyboard array. The grep verification step exists because "I think I got them all" was wrong repeatedly.
- **Unverified links.** A polished page full of links nobody fetched reads as authoritative and isn't. "Verified links only" means *don't ship unverified links* — enrichment links are optional, but whatever ships is fetched. Some canonical-looking doc URLs are JS-rendered and 404 to a server-side fetch; confirm before relying.
- **Evidence inline — and its inverse.** Pasting raw terminal output and long quotes into the body makes it unreadable: appendix, cited from the body. But an appendix for a doc whose evidence is compact (`file:line` refs, one-liners) is empty ceremony — that evidence stays inline in the cards.
- **Generated HTML mistaken for a house-style sibling.** An unexcluded Step 0 glob hits `coverage/`, `playwright-report/`, `dist/` output, and a literal reading extracts a "house style" from a minified test-runner page. Siblings must be hand-authored: inline `<style>`, prose content.
- **Renumbering over a source-owned id scheme.** Reassigning ids top-down destroys a source's stable taxonomy that its own priority matrix and roadmap cross-reference dozens of times. Preserve source-owned schemes; renumber only skill-assigned ids.
- **Silently shipping a source's self-contradictions.** A source claiming "34 findings" over 35 items, or a section header count that disagrees with its list, forces the renderer to invent a disposition. Recompute derived numbers from the rendered items and flag the divergence — either silent choice is wrong.
- **Improvised interactive chrome.** Rewriting scroll-spy, keyboard nav, and the progress bar from scratch each fallback run reintroduces the classic bugs: key handlers firing inside form fields, a rootMargin band that never activates a short last section, an order array drifted from the DOM. Copy the reference JS.
- **Every section rendered as the same shape.** A page that is one unbroken run of identical card grids reads as flat hierarchy no matter how polished each card is. Pick the surface per section by what the reader does with it.
- **Numbers invented to fill layout.** A 4-up stat grid with three real stats tempts a fourth made-up one; the layout never creates data the source doesn't back — shrink the grid instead.
- **Full-column prose lines.** Paragraphs spanning the whole ~1000px content column run past 120 characters per line — the quiet cousin of gray-on-dark. Cap running prose at ~80ch; tables and terminal blocks may still span.
- **Desktop-only reference shell.** The fixed 288px sidebar left almost nothing of a phone's viewport for content. The shell collapses to static flow below ~900px; the checklist now verifies it.

## Adaptation notes

- Step 0 has primacy: when a repo has a house style, *that* is the design system and the defaults below it are moot. The defaults matter only in a greenfield repo.
- The design system is the adaptable half: a light theme, a different accent family, or a denser layout are legitimate per-document choices. Keep the readability floors (bright text, readable chips, styled scrollbars) even when the mood changes.
- The process rules are the portable half — they apply unchanged to any theme, including light ones.
- The reference markup is a starting point, not a component library; adapt class names and tokens to taste, keep the shapes. It uses generic placeholders (`F-1`, `AUTH-1`, neutral finding text) on purpose — the skill is system-agnostic, so no real product, ticket, or path names belong in it.
- Pairs naturally with `visual-advisor` when the page's look needs art-direction judgment beyond the defaults — `doc-to-html` governs structure and process, not taste exploration.
- Sibling boundary: `arch-map` owns the doc-less cases — deriving an architectural page from the repo, a diff, or a plan when no source document exists. `doc-to-html` stays a renderer bound to a source; an architecture *document* still belongs here.
