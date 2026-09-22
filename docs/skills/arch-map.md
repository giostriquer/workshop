# arch-map

## What it does

Reads a codebase, **authors an architecture representation**, and renders it
as a self-contained HTML page. The page leads with a graphical mental model (an
SVG system map, or a Today | Target flow graph for a refactor), then the
inventory behind it. A page without that graphic fails the skill.

Three inputs: an **existing subsystem**, a **refactor in flight** (a branch,
diff, or planned change), or a **proposed design** (a plan or conversation).

The load-bearing rule is traceability. Observed boxes and edges trace to a real
file, symbol, or diff hunk, with the path in the caption or `title`. Proposed
elements trace to the plan or conversation and render dashed.

## When to reach for it

It is **user-invoked only** (`disable-model-invocation: true`). Type `/arch-map`
when you need a visual architecture map and no finished source document exists:
onboarding onto a subsystem, showing what a refactor branch moves, or drawing a
target architecture a conversation settled on.

The line with `html-report` is **who authors the content**, not whether a file
exists:

| The problem | The skill |
| --- | --- |
| The representation must be derived from code, a diff, or a plan | `arch-map` |
| Findings already exist on disk or in this session | `html-report` |
| A freeform diagram unconnected to this repo | Neither; out of scope |
| UI behavior a still diagram can't convey | `ui-demo-video` |

## The pipeline

**Step 0: house style.** Glob the output project's scope/artifact directories
and `docs/` for a hand-authored `.html` page dominated by structural graphics.
A match sets the style; otherwise the deep-dark glass defaults apply. When the
analyzed repo isn't the output repo, glob both; **the output repo wins**.

**1: Derive** boxes (modules, layers, components) and edges (calls, imports,
data flow).

| Input | How it derives |
| --- | --- |
| Subsystem | Entry points, modules, edges. Architecture tests first: enforced rules beat guessed imports. |
| Refactor | Classify the diff into add / remove / move / rename; state **the invariant** (what does *not* change). |
| Proposed design | Extract from the plan, verify real references, mark the rest dashed. |

**2: Choose views.** The mental model plus at most **three** supporting views,
each opening with the question it answers.

| Piece | Question | Form |
| --- | --- | --- |
| **Mental model** (required) | "How do I hold this in my head?" | SVG system map, or Today \| Target graph for refactors |
| Containment / layers | "How is it organized?" | Glass bands + module cards |
| Flow | "How does data / control move?" | HTML connector steps |
| Before / after, or delta | "What does this change?" | Compare panes (large refactors) or one good/bad/dim canvas (small) |

Views derived but not drawn get named in the intro.

**3: Render** an offline HTML file: inline CSS, JavaScript, and SVG, system
fonts, no remote requests. Output goes to the repo's scope folder, otherwise
`.workbench/<scope>/`, and moves somewhere durable only on request or by repo
convention, after rechecking provenance.

Every view is footed with its source and commit. Copy follows the requested or
conversation language. A 12-item checklist closes the run.

## The visual language

Deep-dark glass, as rigid defaults: a near-black canvas with a faint sky glow,
translucent glass panels, system sans-serif and monospace fonts, a sky accent
(`#38bdf8`), and scarce emerald/rose.

Two rules carry weight. **Body text is `--ink` or `--soft`**; muted grey is for
captions and paths. And **no role rainbow**: modules are not painted by role.
Green and red appear only for ✓/✕ verdicts, refactor good/bad, and Today/Target
chrome.

## Common questions

**My diagram's text spills outside its boxes.** SVG never wraps or clips.
Keep labels short (one-noun titles, never lists), size the box to its text
(about 7.2 units per character at 12px mono, 5 units of slack each side), and
center with `text-anchor="middle"`. Last resort: `textLength` or two `<tspan>`
lines. Lists belong in the HTML cards.

**The diagram is too crowded.** Group boxes rather than shrinking fonts; a
view holds about 30.

**It drew part of my plan dashed, or left something out.** Proposed elements
render dashed. An observed element with no backing file, symbol, or diff hunk
isn't drawn; if a box is missing, ask what real artifact would back it
([decision](../decisions/arch-map.md)).

**Can I trust the commit hash in the footer?** It is read live at generation
time. In a cross-repo run it comes from the *analyzed* repo.

**Where do the reference specimens live in my install?** In `references/`
beside the SKILL.md (`subsystem-specimen.html`, `refactor-specimen.html`),
inside the plugin cache or checkout the host loaded.

## It's working if

- The page opens with a graphic, not a wall of cards.
- Observed boxes carry a real path in their caption or `title`, and three
  spot-checks against the repo resolve.
- Proposed elements are visibly dashed.
- A refactor page states the invariant.
- The footer names what each view was derived from, with a commit hash.
- At most three supporting views, with undrawn ones named in the intro.
- The page renders with networking disabled.

**Not working if** body text is mid-grey, modules wear role colors, SVG labels
bleed past their boxes, or the whole page scrolls sideways at phone width
instead of the diagram scrolling inside its stage.

## Where it fits

`arch-map` ships in **`toolkit`**, the optional plugin; nothing in the
`workbench` flow depends on it. It serves orientation and design: before
`brainstorming` settles a refactor, or after, to show what the branch does.
