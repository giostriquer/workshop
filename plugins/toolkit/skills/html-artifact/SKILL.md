---
name: html-artifact
description: Use when creating or revising an HTML report, plan, architecture explanation, or interactive product target from documents, conversation findings, code, or a proposed design.
disable-model-invocation: true
---

# HTML Artifact

Create a shareable artifact that helps its reader understand, decide, or try
something. Choose the composition and visual language for that job.

## Establish the content

- Identify the reader, the decision or task, the authoritative inputs, and the
  delivery environment. Resolve only unknowns that materially change the work.
- Preserve established findings, source IDs, quantities, scope, uncertainty,
  and conclusions. Keep measured values distinct from targets, examples, and
  proposals. Counts name their population; a displayed subset does not replace
  a source total. Layout gaps never justify invented content.
- When deriving architecture, inspect the relevant code, diff, or plan and
  trace consequential components and connections to it. Distinguish observed
  and proposed structure. Disclose unsupported claims and coverage gaps; broad
  research remains a separate task when the needed evidence does not exist.
- Keep evidence close to the claims it supports. Preserve useful source links,
  check internal anchors and accessible destinations, and describe access
  limits honestly. A reachable link alone does not validate a claim.

## Design for the reader

Open with the recommendation, central mechanism, or working surface the reader
needs. Organize the rest around their questions. Choose prose, tables,
comparisons, diagrams, sequences, and controls by what each makes easier to
understand. Retain the detail needed to evaluate and execute a plan. Make long
artifacts easy to scan, navigate, and resume.

For long personal reference documents, keep section navigation visible at wide
reading sizes. Collapse it only when space requires. Prefer direct access over
extra menus or presentation effects that add steps to routine reading.

Keep authoring and testing commentary in the delivery note. The artifact itself
carries the provenance and limitations relevant to its reader.

Start every artifact in dark mode. Set dark colors in the initial HTML/CSS so
the first frame is dark, including when the operating system prefers light.
A light-mode option is optional; it starts with dark selected. Keep embedded
product UI faithful to its source, and use paper-friendly print colors where
useful.

Choose a short design intent covering hierarchy, typography, palette, density,
and layout. Explicit user direction and relevant product design systems lead.
Use a selected reference for its useful principles; an arbitrary recent HTML
file is not authority. No fixed color values, font pairing, card vocabulary,
hero, sidebar, or diagram count applies to every artifact.

Let interaction earn its place: comparing states, inspecting detail, filtering
data, or demonstrating behavior. A concise document can be entirely static.
Open tools in a meaningful, honestly labeled working state.

Read only the relevant techniques, relative to this skill directory:

- [Diagrams](references/diagrams.md): architecture, mechanisms, and alternatives.
- [Product mockups](references/product-mockups.md): credible current/target UI
  and interactive demonstrations.

## Build and verify

Default to a complete standalone HTML file with inline CSS, JavaScript when
useful, and embedded assets or system fonts. It should work offline. If the
requested destination supplies a wrapper or runtime, verify that host contract
and adapt the packaging; disclose any required network dependencies.

Use semantic structure, visible keyboard focus, accessible names, readable
contrast and type, and reduced-motion behavior where relevant. At narrow
widths, reflow the document; wide diagrams, tables, code, and desktop previews
can scroll within labeled containers. Keep initial content visible without
animation or scroll triggers. Give documents useful print output, including
content normally behind controls.

Render before delivery. Inspect the opening, densest content, diagrams, and
important states at the intended reading size and a narrow viewport. Exercise
the controls that carry the artifact's purpose, including keyboard operation.
Fix observed defects and recheck affected states. Stop when the task is served
and no material defect remains; report checks you could not perform.

For revisions, diagnose the feedback against the reader's task. Preserve sound
content and working behavior while changing what the problem requires. Neither
a full rewrite nor a single-property adjustment is mandatory. Deliver the file
with a concise account of verification and remaining limitations.
