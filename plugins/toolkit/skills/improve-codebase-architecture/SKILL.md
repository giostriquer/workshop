---
name: improve-codebase-architecture
description: Use when the user wants a codebase, subsystem, or upcoming change surveyed for architectural friction and deepening opportunities (shallow modules, leaking seams, code that is hard to test through its interface), as periodic upkeep or before a big build. User-invoked only.
disable-model-invocation: true
---

# Improve Codebase Architecture

Surface architectural friction and propose **deepening opportunities**: refactors that turn shallow modules into deep ones. The aim is testability and AI-navigability.

The skills this command loads ship beside it in the toolkit plugin: `toolkit:codebase-design`, `toolkit:grilling` and `toolkit:domain-modeling` (plain names on hosts that don't prefix plugin skills with the plugin name). If another installed plugin ships a skill with the same plain name, load the toolkit one.

This command is _informed_ by the project's domain model and built on a shared design vocabulary:

- Load `toolkit:codebase-design` for the architecture vocabulary (**module**, **interface**, **depth**, **seam**, **adapter**, **leverage**, **locality**) and its principles (the deletion test, "the interface is the test surface", "one adapter = hypothetical seam, two = real"). Use these terms exactly in every suggestion, and don't drift into "component," "service," "API," or "boundary."
- The domain language in `CONTEXT.md` gives names to good seams; ADRs (in `docs/adr/`, or wherever the repo keeps its decision records) record decisions this command should not re-litigate.

## Process

### 1. Explore

**Scope before you scan: YAGNI.** Deepening a module pays off by making future changes to it easier, so put extra weight on the parts of the codebase that have recently changed. Decide *where* to look before you look:

- If the user named a direction (a module, a subsystem, a pain point), take it, and skip the inference below.
- Otherwise, walk back a good stretch of the commit history (`git log --oneline`) to find the codebase's hot spots, the files and areas that keep coming up, and let those paths pull your attention first. If the changes are scattered with no clear hot spot, widen the net.

Read the project's domain glossary (`CONTEXT.md`) and any ADRs in the area you're touching first.

Then walk the codebase, through an exploration sub-agent where the host has one. Don't follow rigid heuristics; explore organically and note where you experience friction:

- Where does understanding one concept require bouncing between many small modules?
- Where are modules **shallow**, with an interface nearly as complex as the implementation? Tells: callers coordinate several calls to finish one operation; options expose internal stages; a function forwards the same arguments to another of the same shape (a pass-through).
- Where have pure functions been extracted just for testability, but the real bugs hide in how they're called (no **locality**)?
- Where do tightly-coupled modules leak across their seams? Tells: one decision (a representation, a policy, a wire or storage format) is known in several modules, so changing it takes coordinated edits; transport or storage types cross an interface where domain types should.
- Where are modules split by execution order (load, validate, transform, save), each re-handling the same data and its invariants?
- Where does the same workaround recur across unrelated callers, or do types need escape hatches (`any`, casts, optional fields that are always set) to compile?
- Which parts of the codebase are untested, or hard to test through their current interface?

Apply the **deletion test** to anything you suspect is shallow: would deleting it concentrate complexity, or just move it? A "yes, concentrates" is the signal you want.

**Evidence.** Read the code, not the file names. Each candidate rests on a traced path: the entry point, the modules the call passes through, and the call sites the deletion test counted, cited as `file:line`. Name any part you couldn't trace as a gap instead of filling it with a guess.

**Screen before presenting.** Check each candidate's proposed deepening against the same tells: one that adds a pass-through, splits by execution order, or carries a transport type through the new interface is not a deepening; revise or drop it. A deep call chain is not a deep module: depth concentrates behaviour behind one interface, a chain scatters it across modules. A few special cases don't make a candidate; complexity in the data is not complexity in the design.

### 2. Present candidates as an HTML report

Write a self-contained HTML file to the OS temp directory so nothing lands in the repo. Resolve the temp dir from `$TMPDIR`, falling back to `/tmp` (or `%TEMP%` on Windows), and write to `<tmpdir>/architecture-review-<timestamp>.html` so each run gets a fresh file. Open it for the user (`xdg-open <path>` on Linux, `open <path>` on macOS, `start <path>` on Windows) and tell them the absolute path.

The report is one file that works offline and opens in dark mode: inline CSS, diagrams drawn as inline SVG or plain HTML, no scripts, nothing fetched from a CDN. Draw graph-shaped relationships (call graphs, dependencies, sequences) as SVG graphs, and use more editorial visuals (mass diagrams, cross-sections, collapse views) when the weight of a module is the point. Each candidate gets a **before/after visualisation**. Be visual.

For each candidate, render a card with:

- **Files**: which files/modules are involved, with the `file:line` evidence from the traced path
- **Problem**: why the current architecture is causing friction
- **Solution**: plain English description of what would change
- **Benefits**: explained in terms of locality and leverage, and how tests would improve
- **Before / After diagram**: side-by-side, custom-drawn, illustrating the shallowness and the deepening
- **Recommendation strength**: one of `Strong`, `Worth exploring`, `Speculative`, rendered as a badge
- **Gaps**: what the trace could not settle, when anything

End the report with a **Top recommendation** section: which candidate you'd tackle first and why.

**Use CONTEXT.md vocabulary for the domain, and the `codebase-design` vocabulary for the architecture.** If `CONTEXT.md` defines "Order," talk about "the Order intake module," not "the FooBarHandler," and not "the Order service."

**ADR conflicts**: if a candidate contradicts an existing ADR, only surface it when the friction is real enough to warrant revisiting the ADR. Mark it clearly in the card (e.g. a warning callout: _"contradicts ADR-0007, but worth reopening because…"_). Don't list every theoretical refactor an ADR forbids.

See [HTML-REPORT.md](HTML-REPORT.md) for the full HTML scaffold, diagram patterns, and styling guidance.

Do NOT propose interfaces yet. After the file is written, ask the user: "Which of these would you like to explore?"

### 3. Grilling loop

Once the user picks a candidate, load `toolkit:grilling` to walk the decision tree with them: constraints, dependencies, the shape of the deepened module, what sits behind the seam, what tests survive.

Side effects happen inline as decisions crystallize; load `toolkit:domain-modeling` to keep the domain model current as you go:

- **Naming a deepened module after a concept not in `CONTEXT.md`?** Add the term to `CONTEXT.md`. Create the file lazily if it doesn't exist.
- **Sharpening a fuzzy term during the conversation?** Update `CONTEXT.md` right there.
- **User rejects the candidate with a load-bearing reason?** Offer an ADR, framed as: _"Want me to record this as an ADR so future architecture reviews don't re-suggest it?"_ Only offer when the reason would actually be needed by a future explorer to avoid re-suggesting the same thing; skip ephemeral reasons ("not worth it right now") and self-evident ones.
- **Want to explore alternative interfaces for the deepened module?** Use the design-it-twice pattern in `toolkit:codebase-design` (its `DESIGN-IT-TWICE.md`).
