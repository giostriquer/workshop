# One HTML artifact workflow

## Decision — 2026-09-22

Consolidate `html-report` and `arch-map` into the manual-only `html-artifact`
skill. Reports, plans, architecture explanations, and product targets share a
content and rendering workflow. Whether findings already exist in a document
is an input condition, not a useful division between competing design systems.

The operator approved the consolidation after comparing two substantial
project artifacts and their creation histories. One combined measured scope,
architecture, phased work, and acceptance criteria in a mostly static document.
The other combined research with realistic, interactive product targets; a
revision grounded those targets in the actual application shell and controls.
Private artifacts and transcript excerpts are not shipped as specimens.

## What changes

The old skills turned particular visual choices into universal rules: dark
palettes, glass panels, fixed navigation and component vocabulary, a capped
number of views, newest-file house style, and one-pass generation. The examples
support a different contract: choose composition for the reader's task, ground
product mockups in the product, and inspect the result before delivery.

`html-artifact` keeps source fidelity, traceable architecture, honest claim
status, accessibility, portability, and readable diagrams. It lets the model
choose typography, palette, density, layout, navigation, and useful interaction.
Diagram and product-mockup techniques live in conditional references. These
references are operating instructions within the skill, not a rationale layer.

Revision follows the observed problem. A design change does not automatically
require rewriting the entire document; useful content and working behavior
survive. Visual inspection covers the intended viewport, a narrow viewport,
dense content, and important states. Defect correction includes a recheck,
without an unlimited aesthetic iteration loop.

## Migration

Both former invocation names are replaced by `html-artifact`; there are no
permanent routing aliases or duplicated specs. Usage pages, discovery metadata,
and native-plugin inventory checks follow the new entry point. The former
diagram specimens move into the repository's layout harness as regression
fixtures, preserving checks without prescribing adopter aesthetics. Their
historical styles are not the new skill's defaults.

The two former decision notes are superseded. Git history retains their
rationale; neither is referenced by the retained release notes.

## Validation scope

Compare current guidance, no guidance, and revised guidance on a short audit
report and a mixed architecture/product plan using invented inputs. Assess
source preservation, distinct denominators, current/proposed status, product
fidelity, useful interaction, and the rendered result. Exercise revision as a
separate scenario. Small comparisons provide regression evidence, not proof of
reliability or of one model's superiority. Mechanical manifest and geometry
checks supplement rendered inspection; they do not establish design quality.

## Observed checks

The three guidance conditions each produced both invented artifacts. All kept
the supplied facts; the current guidance imposed navigation chrome on the short
report, while the control and revised guidance used simpler static pages. A
revision with the new skill changed hierarchy and palette together, preserved
the source facts, and left the original artifact intact.

The operator then requested full-content regeneration of both private reference
artifacts. Extracted text and links were preserved, as were the interactive
plan's scene content and datasets. Browser inspection covered desktop and
narrow layouts, diagrams, scene comparison, expansion, dismissal, and search.
Product preview assets were retained as authoritative content; this was not a
test of reconstructing the product without a visual reference.

The first proof exposed two useful corrections: authoring-process commentary
had entered the document opening, and section navigation disappeared during
long-form reading. The core now keeps authoring commentary in the delivery
note and calls for artifacts that readers can scan, navigate, and resume.
The corrected output was rechecked. Visual preference between sound designs
remains a reader judgment; preservation checks alone do not establish a winner.

On comparison, the operator preferred direct section access over the interactive
plan's collapsed navigation menu. Long personal reference documents now favor
visible navigation at wide reading sizes, reserving collapse for constrained
space. This is a reading affordance, not a mandatory sidebar for every artifact.

## Dark initial theme — 2026-09-22

After reviewing the regenerated artifacts, the operator requested that every
artifact start in dark mode. The initial HTML/CSS now carries dark colors even
when the system prefers light; light mode remains optional. Typography, exact
colors, composition, and density remain task-specific. Embedded product UI
retains its source appearance, and print can use paper-friendly colors.

The earlier regenerated light pages are the observed baseline for this change.
A focused generation scenario checks a dark initial report around a supplied
light product preview, with a light system preference and an optional theme
switch. This is regression evidence for the new default, not a reliability
estimate.
