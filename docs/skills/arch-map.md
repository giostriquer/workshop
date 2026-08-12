# arch-map

> Formerly `structure-view`. The old name "was hard to type and did not read as
> 'architecture overview'"
> ([decision](../decisions/arch-map-rename-and-visual.md)).

## What it does

Reads a codebase and **authors an architecture representation** from it, then
renders that representation as a self-contained HTML page. The page leads with a
graphical mental model — an SVG layered system map, or for a refactor a
Today | Target flow graph — and only then shows the inventory that backs it. The
skill's own line: "A page that skips the graphical mental model / compare graph
fails the skill."

Three inputs, all derived from code rather than prose: an **existing subsystem**
(how a part of the codebase is structured today), a **refactor in flight** (a
branch or diff, or a planned one — what moves, what stays), or a **proposed
design** (a plan or conversation; target state before commit).

The load-bearing constraint is traceability. "Every box and edge traces to a real
file, symbol, or diff hunk," with the path carried in the caption or `title`
attribute. Anything proposed rather than observed renders dashed and is "never
silently mixed with observed." This is the architectural equivalent of a renderer
that may never invent a number.

## When to reach for it

It activates when "you need a visual architecture map of a codebase and no
finished source document exists." Situations that fit: onboarding yourself or
someone else onto an unfamiliar subsystem; showing what a refactor branch
actually moves before anyone reviews it; drawing the target architecture a design
conversation just settled on.

The sibling boundary with `html-report` was redrawn once and matters. The line is
**who authors the content**, not whether a file exists:

| The problem | The skill |
| --- | --- |
| The representation has to be derived by reading code, a diff, or a plan | `arch-map` — it authors, and traces every element to something real |
| Findings already exist — on disk, or reached in this session — and need rendering | `html-report` — it renders, and may never invent |
| A freeform diagram unconnected to this repo's code, diff, or plan | Neither. Out of scope by the skill's own "Not for" list. |
| UI behavior a still diagram can't convey | `ui-demo-video` |

That boundary moved because "three input shapes, all doc-less" stopped
discriminating the moment `html-report` also started accepting doc-less input
([decision](../decisions/html-report-rename-and-context-source.md)).

## The pipeline

**Step 0 — house style.** Glob the *output project's* `tmp/` and `docs/` for a
hand-authored standalone `.html` architecture page. There is a **genre test**:
"structural graphics dominate (system map, layers, legend, before/after flow) —
not a `html-report` report." A sibling that passes the genre test sets tokens and
component shapes. Otherwise the deep-dark glass defaults apply, copied from the
specimens shipped inside the skill package. When the repo you analyze isn't the
repo you write to, glob both — **the output repo's sibling wins**.

**1 — Derive.** Mine boxes (modules, layers, components) and edges (calls,
imports, data flow).

| Input | How it derives |
| --- | --- |
| Subsystem | Entry points, then modules, then edges. Architecture and dependency-rule tests come first — "enforced rules beat guessed imports." Explore subagents fan out on large surfaces. |
| Refactor | Classify the diff into add / remove / move / rename, and state **the invariant** — what does *not* change. |
| Proposed design | Extract from the plan, verify the references that are real, mark the rest proposed (dashed). |

**2 — Choose views.** At most **three** views plus the mandatory mental-model
diagram. Each view opens by stating the question it answers.

| Piece | Question | Form |
| --- | --- | --- |
| **Mental model** (required) | "How do I hold this in my head?" | SVG layered system map, or a Today \| Target flow graph for refactors |
| Containment / layers | "How is it organized?" | Stacked glass bands + module cards |
| Flow | "How does data / control move?" | HTML connector steps |
| Before / after | "What does this change?" | Linked compare panes (large refactors) |
| Delta | "What does this change?" | One canvas, good/bad/dim chips (small refactors) |

"Deriving more than you show is fine. Name unchosen views in the intro — do not
draw a fourth diagram."

**3 — Render.** A single HTML file. CDNs are allowed here (Inter and JetBrains
Mono, Lucide, Mermaid, optionally Tailwind for layout grids). Default output is
`tmp/<YYYY-MM-DD>-<slug>.html` in the project. **Promote** on request — re-verify
traces, run the full checklist, move to `docs/`. All generated chrome and copy is
English only.

**Process rules:** traceability; provenance on every view (derived-from plus
commit, with hashes read from a live `git rev-parse` at generation time); view
economy; a zoom cap of roughly 30 visible boxes per view; the invariant on
refactor pages; fit; and "one pass; direction change = clean rewrite; one knob at
a time." A 12-item pre-finish checklist closes the run.

## The visual language

Deep-dark glass, shipped as rigid defaults: a near-black canvas
(`#020408` → `#050811`) with a subtle sky glow at the top, translucent glass
panels rather than flat chrome, Inter for UI and JetBrains Mono for paths and
chips, a sky accent (`#38bdf8`), and scarce emerald/rose.

Two rules inside that carry weight. **Body text is `--ink` or `--soft`**; muted
grey is for captions and paths only — "never mid-grey paragraphs on black." And
**no role rainbow**: modules do not get painted entry/domain/infra/ext. Green and
red appear only for ✓/✕ verdicts, refactor good/bad, and Today/Target panel
chrome.

Two worked specimens ship **inside the skill package** at
`references/subsystem-specimen.html` and `references/refactor-specimen.html`.
Resolve them relative to the skill directory the host loaded. The skill is
explicit that you should not go hunting for workshop-local `tmp/` specimens —
"they are not part of this package."

## Common questions

**My diagram's text spills outside its boxes.** This is called out as "the #1
mechanical defect," because "SVG text must fit its box — SVG never wraps or
clips." The remedies, in order: short labels only (box titles are one noun,
`.sub` is a short path or tag, never an enumeration); **size the box to its text**
using roughly 7.2 user-units per character at 12px mono, leaving at least 5 units
of slack each side; center with `text-anchor="middle"` so overflow is obvious;
and only as a last resort compress-fit with
`textLength`/`lengthAdjust="spacingAndGlyphs"` or split into two `<tspan>` lines.
Detailed lists belong in the HTML layer cards below the diagram, not in SVG text.

**The diagram is too crowded.** Group boxes — don't shrink fonts. The zoom rule
caps a view at about 30 visible boxes; beyond that you group and link deeper.

**Can it use CDNs? `html-report` refuses to.** Yes, and the two skills genuinely
differ here. `arch-map` permits fonts, Lucide, Mermaid, and optional Tailwind
from CDNs; `html-report` is strictly self-contained with no external assets. If
your page must open offline or survive in an archive, say so up front.

**It drew part of my plan dashed, or left something out entirely.** Proposed
elements render dashed by rule, and anything that can't be traced to a file,
symbol, or diff hunk doesn't get drawn. This behavior showed up during
pre-landing validation: a probe rendering a 182-file refactor "declined to render
a claim the commit's own decision doc makes but its diff doesn't back"
([decision](../decisions/structure-view.md)). If a box you expected is missing,
the useful question is what real artifact would back it.

**Can I trust the commit hash in the footer?** It is read live at generation
time, and that requirement exists because of a caught defect: an early validation
round produced a "repo HEAD" provenance stamp taken from the session's stale
startup snapshot, which the checklist wording at the time failed to catch. In a
cross-repo run, the hash comes from the *analyzed* repo.

**Where do the reference specimens live in my install?** Next to the SKILL.md, in
`references/` — inside the plugin cache or repo checkout the host loaded. An
earlier version pointed at workshop-local `tmp/` files and private nicknames,
which meant "an adopting install would treat the style guidance as a no-op"
([decision](../decisions/arch-map-idoso-visual.md)). That is fixed; the specimens
ship with the skill.

**How field-proven are the conventions?** Partially. The skill was designed in
full rather than incubated ad hoc, with GREEN tests before landing standing in
for lived-in rounds. Its own non-goals name the conventions most likely to move
once more real rounds land: the view-economy cap, the box cap, and the role
taxonomy. Treat those three as tunable, not settled.

## It's working if

- The page opens with a graphic, not a wall of cards — an SVG system map, or
  Today | Target panes for a refactor.
- You can hover or read any box and find a real path in its caption or `title`,
  and three spot-checks against the repo resolve.
- Proposed elements are visibly dashed and never blended into observed ones.
- A refactor page states the invariant — what does *not* change — which is
  described as "the single most orienting fact in a refactor."
- The footer names what the view was derived from, with a commit hash.
- At most three supporting views, and the intro names anything derived but not
  drawn.

**Not working if** the page is only cards and lists with no diagram — that "fails
the skill" outright. Other tells that the checklist got skipped: mid-grey body
text on the near-black canvas, modules painted in role colors, SVG labels
bleeding past their rectangles, or the whole page scrolling sideways at phone
width instead of the diagram scrolling inside its own stage.

## Where it fits

`arch-map` ships in **`toolkit`**, the optional plugin, not in the `workbench`
process core. Toolkit is a set of artifact-making utilities you install alongside
workbench when you want them and skip otherwise; nothing in the workbench flow
depends on it. In practice `arch-map` shows up during orientation and design —
before `brainstorming` settles a refactor, or right after, to show what the
branch actually does.
