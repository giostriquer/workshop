# writing-skills

TDD applied to skill authoring: baseline without the skill, write minimally
against observed failures, micro-test wording, close loopholes. Derived from
[obra/superpowers](https://github.com/obra/superpowers) (MIT, Jesse Vincent);
adapted per [`workbench-system.md`](../decisions/workbench-system.md). Ships in the
**toolkit** plugin (reclassified 2026-08-11 — an optional utility, not part of
the workbench process set; upstream drift tracking continues). The discipline this
repo already runs on ("micro-tested per writing-skills: 5/5 reps…").

## Use it

- Trigger: creating a skill, editing one, or verifying wording works before
  deployment — edits count; the Iron Law covers them.
- The load-bearing patterns: **baseline first** (no observed failure → nothing
  to fix → don't author) · **match the form to the failure** (rule-skipping →
  prohibitions + rationalization table; wrong-shaped output → positive recipe;
  omitted element → structural slot; conditional behavior → observable
  predicate) · **micro-test wording** (5+ reps per variant, no-guidance
  control, read every flagged match, variance is a metric) · descriptions state
  *when to use*, never the workflow (the SDO trap: agents follow a
  workflow-summarizing description instead of reading the body).
- References worth reading independently: `testing-skills-with-subagents.md`
  (the pressure-scenario methodology), `anthropic-best-practices.md`.

## Don't

- Don't skip testing for "simple edits" — untested wording changes are where
  regressions hide.
- Don't reach for prohibitions by default; they measurably backfire on shaping
  problems.
- Don't add nuance clauses ("don't X unless it matters") — they reopen the
  negotiation; express exceptions as their own conditionals.
- Don't summarize a skill's process in its description.
- Don't batch multiple skills without testing each.
