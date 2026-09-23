# Diagrams that explain

Use a diagram when relationships, sequence, boundaries, or differences are
harder to understand in prose. Decide the claim before drawing. A component
inventory alone rarely explains how a system works.

## Content and comparison

- Read enough source to ground the observed paths. File, symbol, diff, or plan
  references in nearby captions or a source register make them inspectable.
  Runtime behavior inferred from code is not runtime verification.
- Show the parts that the argument turns on: entry points, responsibilities,
  data, authority boundaries, and consequential connections. Label edges with
  what moves or happens. Add a legend only for recurring encodings.
- For alternatives or before/after views, align the comparable parts and make
  the changed paths visible. State what remains invariant. Label proposed
  components and connections with text or line treatment as well as color.
- Give each figure a clear question and a caption explaining its takeaway.
  Use the views needed to answer the reader's questions; combine redundant
  ones rather than enforcing an arbitrary count.

## Legibility and mechanics

Choose a rendering method supported by the delivery environment. Inline SVG
works well for precise, portable system diagrams; HTML and CSS suit layouts
that must reflow. A runtime diagram library must justify its dependency cost.
Do not rely on a host rendering a diagram language without checking support.

Size the drawing around the content. Use an SVG `viewBox`, explicit fills,
consistent alignment, and page theme tokens. Give informative SVGs accessible
names and a textual explanation. Distinguish connectors from box borders and
keep labels clear of arrows, crossings, and other text.

Inspect actual rendered text and font fallback. Enlarge a box, wrap a label,
or move detail to a caption when it does not fit; compressing glyphs or
shrinking the entire figure can hide the defect while making it unreadable.
Keep labels readable at the delivered size. Dense desktop diagrams may need
an expanded view or local pan/scroll region on a narrow screen.

Check the longest labels and busiest junctions, along with the relationship
the diagram claims to show. Mechanical bounds checks help find overflow but
do not prove that the system is accurately represented or easy to understand.
