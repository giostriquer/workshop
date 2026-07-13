---
name: doc-to-html
description: Use when turning a markdown report, audit, review, or research/findings document into a polished standalone dark-themed HTML page, or when revising such a page — content tweaks, inserting/moving/renumbering sections, ordering findings by severity, matching the repo's existing report style, or "this looks noisy / unreadable / ugly / off" feedback.
---

# Doc to HTML

## Purpose

Render a markdown document (report, audit, review, research findings) as a single self-contained HTML page that reads calmly on a dark screen, navigates well, and prints clean — then govern how that page is edited afterward.

Two stances, deliberately different: the **visual design is adaptable** — first match whatever house style the repo already uses, and fall back to the defaults here only when there is none. The **process rules are rigid** — each exists because its absence failed in real use.

## Step 0 — match the repo's house style first

Before applying any default in this skill, glob the repo (especially `tmp/` and `docs/`) for an existing standalone `.html` report — excluding generated output (`node_modules/`, `dist/`, `coverage/`, `playwright-report/`, `.next/`, and similar build/test artifacts). A candidate counts only if it is hand-authored: an inline `<style>` block and prose content, not a minified or tool-emitted page. **If one exists, it is the house style:** read its `<style>` block and component vocabulary and match it — palette, type scale, class system, card/chip/table shapes. If several qualify, the most recently modified hand-authored report wins. Consistency with a sibling artifact beats this skill's defaults every time; a wrong-aesthetic first pass gets thrown away whole, so detect before you generate.

The design system below is the **fallback for when no sibling report exists** — not the first choice.

## Page architecture

Every page gets:

- **Single self-contained file.** Inline CSS and JS, no external assets, no build step. The page must open from disk.
- **Sticky TOC sidebar** (~288px) with an active-item highlight (scroll-spy) and keyboard navigation (`j`/`k` or arrow keys) driven by one explicit array of section ids in document order. A thin top progress bar is a nice touch. Below ~900px the sidebar collapses into static flow (reference CSS) — a fixed 288px rail otherwise eats a phone's whole viewport.
- **Surface picked by reader action.** Choose how each section renders by what the reader does with it: facts sharing attributes → a table (explanation lives in the surrounding prose, not in the cells); an ordered process → the stepper; findings/claims → the finding card; nuance/caveat → the dashed caveat box; bulk raw output → terminal block or appendix. Consecutive sections carrying different kinds of content should not all render as the same shape — an unbroken run of identical cards is a flat hierarchy, however polished each card looks.
- **Verified links only.** Don't ship a link you didn't fetch; annotate the result inline (small green/red run next to the link). Enrichment links are optional — but whatever ships is verified. Note: some canonical-looking doc URLs are JS-rendered and 404 to a server-side fetch (e.g. client-side error-code decoders) — confirm a URL actually serves content before relying on it. Relative/companion links (a sibling file, the source md): verify the target file exists.
- **Styled scrollbars.** Every scroll container — the page, the sidebar, and especially overflowing `.term`/code blocks and wide tables — gets themed scrollbars, never the raw OS default (CSS below).
- **Print media query.** White background, dark text, hide the nav and keyboard hints (reference CSS below; it's on the checklist).

**Evidence appendix — conditional, not standing.** When the source carries bulk raw evidence (transcripts, terminal dumps, long excerpts), it moves to an appendix at the end and the body cites it with a small `→ A1` cite-chip — the body stays readable without dropping the proof. When the evidence is already compact (`file:line` refs, short quotes), it stays inline in the cards; an appendix of one-liners is empty ceremony. Either way, a footer listing the artifacts the work produced is high-value for audit/research output.

**What yields to house style, what doesn't.** Step 0's sibling governs *visual treatment* — link-annotation style, nav chrome, chip/card/table shapes all follow the house look, including where it disagrees with the defaults below. It never waives the architecture itself: single self-contained file, working TOC/scroll-spy/keyboard nav, print stylesheet, a readable narrow-screen collapse, and verified links ship on every page regardless of aesthetic.

## Design system — defaults (fallback only)

Use these only when Step 0 finds no house style. They reproduce a rich, card-and-chip dark report; keep the readability floors even if you change the mood.

- **Canvas + type.** Dark blue-gray canvas (`--bg:#0e1117` family); **sans-serif** body (serif reads muddy on dark) at ~16px with generous line-height. Body text must be bright (`#d0d8e0`+) — gray-on-dark is the #1 readability killer; when in doubt, brighten. Cap running prose at ~80ch (`p,li{max-width:80ch}`); tables, terminal blocks, and the stat grid may span the full column, but full-column paragraph lines (~120ch) are the quiet cousin of gray-on-dark.
- **Readable chips/code.** Inline code and chips ~0.9em, near-white text on a clearly lighter chip.
- **One accent family** used sparingly (active TOC item, headline callout, section-number badge) plus semantic green/red/amber ONLY inside terminal blocks, link-result runs, and cost/severity pills.
- **Component vocabulary** (the look adopters actually expect):
  - `.sec-num` — mono section-number badge, aligned with its heading (see alignment rule).
  - `.hero` + a `.stat-grid` (up to 4-up) for the verdict / TL;DR — stat cells carry only numbers the document itself backs; three real stats beat four with one invented.
  - `.card` + `.pid` (mono id badge) + colored `.chip`s (severity, evidence tier, disposition).
  - `.claim` — a quote box (❝) carrying the one-line finding.
  - `.term` — terminal/code block with `ok`/`bad`/`dim`/`warn` spans, horizontal scroll, styled scrollbar.
  - `.why` — dashed caveat box for "might not be a problem" / nuance.
  - `.fix` + a `.cost` pill for the action and its cost class.
  - cite-chips (`→ A1`) linking body to appendix; a footer-of-artifacts.
- Differentiate caveat / "maybe" sections with a subtle background or dashed border — not louder colors.

## Findings & audit reports

For reports that carry findings (audit, QA, review):

- **Order by severity, descending.** Most severe first, always (critical → high → medium → low). The ids are then reassigned top-down, so a deck whose findings arrive in mixed order (e.g. medium, high, low, critical) ships as `F-1` critical, `F-2` high, …. After sorting, run the **Renumbering procedure** so ids, cross-refs, TOC, and the nav array all match. **Exception:** when the source already carries a stable, cross-referenced id scheme of its own (severity-coded ids tied to its priority matrix or roadmap), preserve those ids and skip reassignment — the Renumbering procedure governs ids this skill assigns, not ids the source owns.
- **Every finding card carries evidence and an action.** Not just label → headline → body. Required shape: id + chip header (severity + evidence tier) → one-line **claim** (quote box) → an **Evidence** line that is concrete (a live result, `file:line`, or an appendix cite) → a **Fix** line with a cost pill. The headline states the finding; the body proves it and says what to do. Concise beats extensive — but never a claim without its evidence.
- **Group when items partition.** When findings naturally split (by product, area, severity, owner), group them into sub-sections with prefixed ids (`AUTH-1`, `API-1`, …), each its own TOC group, then run the Renumbering procedure. A recognised variation, not an afterthought.
- **Optional Method section.** For audit/QA/research output, a short "how this was produced" section — a few numbered practices + a one-line phase chain — helps the reader trust the claims.

## Process rules (rigid)

- **Default output path.** Same directory as the source, same basename, `.html` extension — unless the user or the document itself names a different target.
- **One pass.** Generate the full HTML in one pass from the markdown.
- **Derived numbers are recomputed.** Totals and per-section counts come from the items actually rendered, not from the source's prose. When the source's stated numbers disagree — with the items, or with each other — render the recomputed values and flag the divergence to the user in the completion summary; never silently ship either side. The inverse is equally rigid: the layout never invents numbers — no stat cell, percentage, or count the source doesn't back, even when a grid slot looks empty without one.
- **Targeted edit vs clean rewrite.** Content tweaks are targeted edits. A change of design DIRECTION — including switching to match a house style found late — is always a full clean rewrite; incrementally restyling markup built for a different aesthetic compounds into a mess.
- **One knob at a time.** If the user dislikes the result, ask which specific element fails (contrast, density, hierarchy) and turn that one knob; don't swing the whole design.
- **Renumbering procedure.** When an insert, move, drop, sort, or re-group forces renumbering: renumber via descending replace-all or a temp placeholder (avoid collisions), then update every cross-reference, TOC entry, element id, and the keyboard-nav order array, and verify with a grep that ids are sequential and references resolve.

## Pre-finish checklist

1. Parse-check the HTML (balanced tags, sequential heading levels); no garbage/stray CSS tokens.
2. Every TOC target id exists; the keyboard-nav order array matches document order.
3. Findings are ordered most-severe-first; skill-assigned ids run top-down (source-owned id schemes are preserved as-is).
4. Every scroll container has a styled scrollbar (no raw OS bars).
5. Section-number badges align with their headings; cost pills sit in one consistent place across all cards.
6. No markdown content dropped — spot-check section count and headline statements; derived totals/counts match the rendered items, any divergence from the source's stated numbers is flagged in the completion summary, and no number was invented to fill a layout slot.
7. Every shipped external link was fetched and annotated; every relative link's target file exists.
8. Print media query present: white background, dark text, nav and keyboard hints hidden, cards avoid page breaks.
9. Narrow-screen check: at phone width the sidebar collapses to static flow and nothing overflows horizontally except intentional scroll containers.

## Reference markup

Tokens and the cross-browser styled scrollbar (applies to the page and every scroll container):

```css
:root{
  --bg:#0e1117; --panel:#151b24; --line:#28313f;
  --text:#dee4ec; --muted:#9ba6b4; --faint:#6b7585;
  --accent:#5aa7ff; --green:#46c061; --amber:#e3a93c; --red:#f0635a;
  --mono:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace;
}
*{scrollbar-width:thin;scrollbar-color:#33415c transparent}          /* Firefox */
::-webkit-scrollbar{width:10px;height:10px}                          /* Chromium/WebKit */
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:#2c3a52;border-radius:6px;border:2px solid var(--bg)}
::-webkit-scrollbar-thumb:hover{background:#3a4d6b}
```

Layout shell — sticky nav, progress bar, hero + stat-grid, table wrap. This is the chrome the architecture section mandates; copy it on fallback runs instead of improvising:

```css
body{margin:0;background:var(--bg);color:var(--text);font:16px/1.7 system-ui,'Segoe UI',sans-serif}
.layout{display:flex;max-width:1400px;margin:0 auto}
nav{position:sticky;top:0;flex:0 0 288px;height:100vh;overflow-y:auto;padding:28px 18px;border-right:1px solid var(--line)}
nav a{display:block;color:var(--muted);text-decoration:none;font-size:13.5px;line-height:1.45;padding:6px 10px;border-radius:6px;border-left:2px solid transparent}
nav a.active{color:var(--accent);background:#16202e;border-left-color:var(--accent)}
main{flex:1;min-width:0;padding:40px 48px 80px}
#bar{position:fixed;top:0;left:0;height:3px;width:0;background:var(--accent);z-index:10}
.hero{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:30px 34px;margin-bottom:36px}
.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:20px}
.stat{background:#101820;border:1px solid var(--line);border-radius:10px;padding:14px 16px}
.stat b{display:block;font-size:26px;color:var(--text)}
.stat span{font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em}
.tablewrap{overflow-x:auto}
table{width:100%;border-collapse:collapse;font-size:14px;margin:14px 0}
th,td{text-align:left;padding:9px 12px;border-bottom:1px solid var(--line)}
th{color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.07em}
p,li{max-width:80ch}
@media(max-width:900px){
  .layout{display:block}
  nav{position:static;height:auto;border-right:0;border-bottom:1px solid var(--line)}
  main{padding:28px 20px 60px}
  .stat-grid{grid-template-columns:repeat(2,1fr)}
}
```

Section / card header row — the number badge and its heading must share a centerline. Use `align-items:center` (NOT `baseline`) whenever the badge and heading font sizes differ, or the number floats high/low:

```css
.sec-head{display:flex;align-items:center;gap:14px;margin-bottom:8px}
.sec-num{font:700 13px/1 var(--mono);color:var(--accent);background:#15233a;
         border:1px solid #2c4366;border-radius:6px;padding:3px 9px;flex:0 0 auto}
.sec-head h2{font-size:24px;line-height:1.2;letter-spacing:-.01em}
```

Finding card — id/chip header → claim quote box → Evidence → Fix with a cost pill. The cost pill lives in the **Fix header**, the same place on every card (don't let it float at the end of whichever sentence happens to be last):

```html
<section class="card" id="f01">
  <div class="card-top">
    <span class="pid">F-1</span>
    <span class="chip critical">critical</span>
    <span class="chip repro">reproduced</span>
    <h3>Headline states the finding, not the topic</h3>
  </div>
  <div class="claim"><span class="tag">Claim</span>One-line statement of what was found.</div>
  <div class="lbl">Evidence</div>
  <p>Concrete proof: a live result, <code>path/to/file.ts:42</code>, or an appendix cite <a class="cite" href="#a1">→ A1</a>.</p>
  <div class="lbl">Fix <span class="cost c-s">S</span></div>
  <p>The action to take.</p>
</section>
```

```css
.card{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:26px 30px;margin-bottom:30px;scroll-margin-top:24px}
.card.maybe{background:#171a26;border-style:dashed}            /* caveat / "might not be a problem" */
.card-top{display:flex;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px}
.pid{font:700 13px/1 var(--mono);color:#fff;background:#293549;border-radius:6px;padding:3px 10px}
.card h3{font-size:19.5px;line-height:1.35;flex:1 1 100%;margin-top:2px}   /* headline drops to its own line */
.chip{font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;border-radius:99px;padding:3px 11px;border:1px solid}
.chip.critical{color:#ff9d96;border-color:#6e3631;background:#2d1a18}
.chip.high{color:#ffce6e;border-color:#6e5520;background:#2b2210}
.chip.medium{color:#9ad97e;border-color:#3f5a2a;background:#1b2614}
.chip.low{color:#9aa6b6;border-color:#37425a;background:#1a2230}
.chip.repro{color:#7ee29a;border-color:#2c5e3b;background:#13261a}      /* evidence tier */
.claim{background:#101820;border:1px solid #2a3c55;border-radius:10px;padding:17px 20px 17px 52px;margin:4px 0 20px;position:relative;font-size:16.5px;line-height:1.62;color:#e6edf6}
.claim::before{content:"❝";position:absolute;left:18px;top:13px;font-size:24px;color:var(--accent)}
.claim .tag{display:block;font-size:10.5px;font-weight:800;letter-spacing:.14em;color:var(--accent);text-transform:uppercase;margin-bottom:5px}
.lbl{font-size:11px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:#8e9aab;margin:20px 0 7px}
.cite{font:700 12px/1 var(--mono);color:var(--accent)}
.cost{font:700 11px/1 var(--mono);border-radius:5px;padding:2px 8px;vertical-align:1px}
.c-xs{color:#7ee29a;background:#13261a} .c-s{color:#9ad97e;background:#1b2614}
.c-m{color:#ecc06a;background:#272012} .c-l{color:#d4b3ff;background:#221a33}
```

Terminal / code block — semantic spans, horizontal scroll, themed scrollbar from the rule above:

```css
.term{background:#0a0e14;border:1px solid #232c3a;border-radius:9px;font-family:var(--mono);
      font-size:12.8px;line-height:1.75;padding:13px 17px;margin:10px 0;overflow-x:auto;color:#c1cddb;white-space:pre}
.term .ok{color:var(--green)} .term .bad{color:var(--red)} .term .dim{color:#5d6878} .term .warn{color:var(--amber)}
```

Vertical stepper (ordered process; connector line through the dots):

```html
<ol class="stepper">
  <li><span class="dot"></span><div><h3>Step title</h3><p>What happens.</p></div></li>
  <li><span class="dot"></span><div><h3>Next step</h3><p>…</p></div></li>
</ol>
```

```css
.stepper{list-style:none;margin:0;padding:0}
.stepper li{position:relative;display:flex;gap:16px;padding-bottom:24px}
.stepper li::before{content:"";position:absolute;left:7px;top:18px;bottom:0;width:2px;background:var(--line)}
.stepper li:last-child::before{display:none}
.dot{flex:none;width:16px;height:16px;margin-top:4px;border-radius:50%;border:2px solid var(--accent);background:#0f1520}
```

Interactive chrome — scroll-spy, keyboard nav, progress bar. The three classic bugs are pinned shut here: key handlers must not fire inside form fields, a short last section never enters a top-of-viewport observation band (the bottom-of-page fallback covers it), and the `order` array drifts from the DOM (keep the comment's warning; the renumbering procedure updates it):

```html
<script>
const order=['hero','f01','f02','a1'];   // section ids in document order — MUST match the DOM
const links=Object.fromEntries([...document.querySelectorAll('nav a')].map(a=>[a.hash.slice(1),a]));
let active=null;                         // null, not order[0] — the first observer callback must apply the initial highlight
const setActive=id=>{if(!links[id]||id===active)return;
  links[active]?.classList.remove('active');links[id].classList.add('active');active=id;};
const spy=new IntersectionObserver(es=>{
  const v=es.filter(e=>e.isIntersecting);if(v.length)setActive(v[0].target.id);},
  {rootMargin:'0px 0px -60% 0px'});      // activate in the top 40% of the viewport
order.forEach(id=>{const el=document.getElementById(id);if(el)spy.observe(el);});
addEventListener('keydown',e=>{
  if(e.target.closest('input,textarea,select')||e.metaKey||e.ctrlKey||e.altKey)return;
  const d={j:1,ArrowDown:1,k:-1,ArrowUp:-1}[e.key];if(!d)return;e.preventDefault();
  const next=order[Math.min(order.length-1,Math.max(0,order.indexOf(active)+d))];
  document.getElementById(next)?.scrollIntoView({behavior:'smooth'});setActive(next);
});
addEventListener('scroll',()=>{
  const h=document.documentElement,p=h.scrollTop/(h.scrollHeight-h.clientHeight)||0;
  document.getElementById('bar').style.width=p*100+'%';
  if(p>0.99)setActive(order[order.length-1]);   // short last section: bottom of page wins
},{passive:true});
</script>
```

Print — mandatory architecture, checklist item 8:

```css
@media print{
  body{background:#fff;color:#111}
  nav,#bar,.kbd-hint{display:none}
  .layout{display:block} main{padding:0}
  .hero,.card,.stat{background:#fff;border-color:#bbb;break-inside:avoid}
  .term{background:#f4f4f4;color:#222;border-color:#ccc}
  a{color:#134a9e}
}
```

## Suggested invocation

- Turn `report.md` into a standalone HTML page. (→ Step 0 first: match any sibling `.html` report)
- The page feels noisy / unreadable — fix it. (→ ask which knob fails: contrast, density, or hierarchy)
- Insert a new section between 4 and 5. (→ renumbering procedure, then the checklist)
- Order the findings by severity. (→ sort descending, then the renumbering procedure)
- Make it feel like a printed zine instead. (→ design-direction change: full clean rewrite)
