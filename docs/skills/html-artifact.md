# html-artifact

Creates or revises a shareable HTML artifact: a report, plan, architecture
explanation, or interactive product target. It chooses the composition and
visual language for what the reader needs to understand, decide, or try.

## When to use it

The skill is **user-invoked only** (`disable-model-invocation: true`, plus
`allow_implicit_invocation: false` for Codex). Invoke `/html-artifact` or
`$html-artifact` in Codex with your material and intended audience. For example:

- “Turn these findings into a concise decision document for the webapp team.”
- “Explain the current dependency flow and the proposed extraction in HTML.”
- “Make a plan with realistic current/target screens for this schema editor.”
- “This page hides the main decision. Improve its hierarchy and comparisons.”

Documents, conversation findings, code, diffs, and proposed designs can all be
inputs. Include a preferred reference or product captures when they matter.
The skill can read source to derive a representation; a missing body of research
still needs investigation before an evidence-backed report can be produced.

## What to expect

The artifact leads with the decision, mechanism, or working surface. Its content
may combine prose, tables, diagrams, implementation phases, evidence, and
interactive demonstrations. A short report can remain entirely static.

Design follows your direction and relevant product conventions. There is no
mandatory dark theme, glass treatment, card grid, sidebar, or diagram count.
An unrelated HTML file does not automatically become the design reference.
Long personal reference documents keep section navigation visible when space
permits, so routine reading does not require opening a menu.

Existing findings, IDs, measurements, denominators, scope, and uncertainty stay
intact. Observations, proposals, targets, and illustrative data remain distinct.
Architecture claims have inspectable sources. Product targets retain enough of
the actual application's context to make the proposed experience credible.

## Delivery and verification

The default is a complete HTML file that works offline, with embedded assets or
system fonts. A hosted artifact follows that host's verified packaging rules;
required network dependencies are disclosed.

Before delivery, the author renders the page at the intended reading size and
a narrow viewport, checks dense content and diagrams, and exercises important
controls with keyboard access. Observed defects are fixed and rechecked. The
handoff says what was verified and what remains unverified.

Documents have useful print output. Wide diagrams, tables, and desktop previews
can use local scrolling or expansion while the surrounding document reflows.

## Common questions

**Can this author a plan as well as display one?** Yes. It can organize and
visualize a proposed design using the available evidence. It does not turn
unsupported assumptions into findings or replace needed research.

**Will it copy the example's style?** Explicit visual direction leads. When you
provide an example for inspiration, the author extracts useful principles and
adapts them to this artifact's content and audience.

**Are interactive mockups real implementations?** They are labeled simulations
unless connected behavior was specifically requested and built. A working
local edit is not proof of persistence, generation, or backend correctness.

**What happened to `html-report` and `arch-map`?** Invoke `html-artifact` for
either task. Diagram and product-mockup techniques are loaded when needed.

## How to tell it worked

A colleague can find the main decision, follow its evidence, and understand the
changed mechanism or product behavior without reconstructing the source
conversation. The page is readable at its delivery size, its controls work as
described, and visual polish has not changed the facts.

`html-artifact` ships in the optional **toolkit** plugin. Its
[canonical skill](../../plugins/toolkit/skills/html-artifact/SKILL.md) is the
authority for behavior.
