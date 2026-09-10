# Decision: conditional architecture diagrams in PR bodies

**Date:** 2026-09-10

**Release:** workbench 0.37.2

## Change and reason

Add an `Architecture` section to `file-pr` when a Mermaid diagram materially
clarifies relevant calls, dependencies or data/control flow between modules.
The trigger includes changed interactions and existing interactions needed to
understand the change. Local edits with no useful architectural relationship to
show keep their ordinary PR body.

The section uses the exact heading `## Architecture`, including when the repo
template does not request it. Reuse that heading if the template already provides
it. Otherwise append the section after the filled template and before any required
footer. Preserve every original heading, checkbox and hidden marker in order.
Update the existing heading check to permit this one conditional addition instead
of rejecting it as template replacement.

Diagrams show the smallest relevant interaction, derived from the final code and
diff. This adds neither a general architecture report nor a new artifact skill.
Validation and delivery gates remain unchanged.

## Focused checks

Exercise a changed cross-module call with a template lacking Architecture, a
localized change that needs no diagram, a template with the exact section already
present, and a relevant interaction with no repository template. Check content,
diagram relationships and template preservation, not merely the presence of a
Mermaid fence. Scenario samples establish only the covered outcomes.

One fresh-context probe met the four cases: add, omit, reuse and fallback. Original
template structure and grounded diagram relationships were checked. Mermaid syntax
was reviewed manually; rendering remains unverified because no local parser or
renderer was available.
