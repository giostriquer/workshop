# html-report: decisions in force

This note is the rationale for the `html-report` skill, shipped in the `toolkit` plugin; superseded choices are omitted and git history keeps the originals.

## Adaptable design, rigid process (2026-06-11)

Report pages built ad hoc kept failing alike: grey text on dark canvases, numbering and navigation drifting after edits, and whole-design swings in answer to one complaint. The skill renders a report as one self-contained dark page and governs later edits. Visual design adapts; process is rigid: one pass, a direction change is a clean rewrite, one knob at a time, a renumbering procedure and a pre-finish checklist.

## House style first, evidence on every claim (2026-06-17)

Applying the skill's own defaults first produced a wrong-aesthetic pass that had to be discarded, so Step 0 matches a hand-authored report already in the repo and the design system is fallback only. Findings cards looked rich but said little, so each claim now travels with its evidence and assessed findings run most severe first. Reference markup pins observed render bugs such as raw scrollbars and misaligned badges.

## Fidelity and architecture hardening (2026-07-02)

A full run on a large audit exposed nine gaps. Totals and counts are recomputed from rendered items, with source divergences flagged rather than silently shipped; source-owned ids are kept; the evidence appendix appears only for bulk raw evidence. House style governs visual treatment but never waives the architecture: self-contained file, working navigation, print and verified links.

## A renderer, not an author (2026-07-13)

Compared with an external authoring skill, it declined CDN styling, a brief step and content-discipline guidance, since each breaks opening from disk or has it choose content. It adopted four recipes: surface chosen by reader action, no numbers invented to fill layout, an 80-character prose measure and a sidebar that collapses at phone width.

## Renamed, with a context source (2026-08-12)

Sessions produce reports more often than they hand over files, so the skill renders a markdown document or material from the conversation, and the new name describes the artifact. From context there is nothing to diff, so fidelity is discipline: nothing invented, hedges visible, claims kept with their evidence, and Method and coverage gaps mandatory because the page is the only surviving record. Output target, a standalone file or host-published content without a document skeleton, is chosen before generating, since switching means a rewrite.
