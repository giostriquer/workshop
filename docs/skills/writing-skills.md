# writing-skills

## What it does

Applies test-driven development to skill authoring. The core claim is stated
flatly: "**Writing skills IS Test-Driven Development applied to process
documentation.**" You write the test (a pressure scenario run against a
subagent), watch it fail (baseline behavior without the skill), write the skill,
watch it pass (the agent now complies), then refactor by closing the loopholes
the agent found.

The rule that makes it more than an analogy: "If you didn't watch an agent fail
without the skill, you don't know if the skill teaches the right thing." And its
enforcement clause, the Iron Law ("NO SKILL WITHOUT A FAILING TEST FIRST")
which "applies to NEW skills AND EDITS to existing skills."

It is not a linter and not a style guide you skim once. It is a process with a
checklist, plus a set of hard-won rules about *what form* guidance should take
for a given failure: a prohibition, a recipe, a structural slot, or a
conditional. It is derived from [obra/superpowers](https://github.com/obra/superpowers)
by Jesse Vincent (MIT), adapted for the workbench system.

## When to reach for it

Its trigger is short: "Use when creating new skills, editing existing skills, or
verifying skills work before deployment." The edit case is the one people skip,
and the skill anticipates that: "Not for 'simple additions', Not for 'just
adding a section', Not for 'documentation updates'."

| The problem | The skill |
| --- | --- |
| Writing or editing a skill, or checking one works before shipping | `writing-skills` |
| A convention specific to one project | Your instructions file: the skill says project-specific conventions don't become skills |
| A constraint a regex or validator could enforce | Automate it. "Save documentation for judgment calls." |
| A one-off solution you won't reference again | Nothing. Don't create a skill. |
| A standard practice already well documented elsewhere | Link to it; don't restate it as a skill |

## The cycle

| TDD concept | Skill creation |
| --- | --- |
| Write test first | Run the baseline scenario **before** writing the skill |
| Test fails (RED) | The agent violates the rule without the skill |
| Watch it fail | Document the exact rationalizations, verbatim |
| Minimal code | Write the skill addressing those specific violations |
| Test passes (GREEN) | The agent complies with the skill present |
| Refactor | Find new rationalizations, plug them, re-verify |

**Micro-test the wording before running full scenarios.** Pressure scenarios are
the final gate but slow per iteration, so the skill inserts a cheaper loop first,
with five rules: one fresh-context sample per call, with the system prompt being
"the realistic context the guidance will live in (the full skill or prompt
template, not the guidance in isolation)"; **always include a no-guidance
control**: "If the control doesn't exhibit the failure, there is nothing to fix:
stop, don't author the guidance"; 5+ reps per variant, because "single samples
lie"; read every flagged match manually, because "template echoes and quoted
counter-examples masquerade as hits"; and treat variance as a metric: "Five
different interpretations across five reps means the wording isn't binding:
tighten the form before adding words."

## Match the form to the failure

The most transferable section, and the one most likely to change how you write. A
form that bulletproofs one failure type "measurably backfires on another."

| Baseline failure | Right form | Wrong form |
| --- | --- | --- |
| Skips a rule under pressure (knows better, does it anyway) | Prohibition + rationalization table + red flags | Soft guidance ("prefer…", "consider…") |
| Complies, but the output has the wrong shape (bloated, buried verdict, restated spec) | A positive recipe or contract: state what the output IS, its parts, in order | A prohibition list ("don't restate", "never narrate") |
| Omits a required element from something they already produce | Structural: a REQUIRED field or slot in the template they fill in | Prose reminders near the template |
| Behavior should depend on a condition | A conditional keyed to an observable predicate | An unconditional rule plus exemption clauses |

Two rules apply whichever form you pick. **No nuance clauses**: "'Don't X unless
it matters' reopens the negotiation," and appending a single nuance clause to a
winning recipe "degraded it from consistent to noisy." And **exemption clauses
don't scope**: "'This limit doesn't apply to code blocks' still suppresses code
blocks. If part of the output must be exempt, restructure so the rule can't reach
it."

## The description field

The skill is emphatic here: "`description`: Third-person, describes ONLY when to
use (NOT what it does)," start with "Use when…", keep it under 500 characters if
possible, and "**NEVER summarize the skill's process or workflow**."

The stated reason is behavioral, not stylistic: "when a description summarizes
the skill's workflow, an agent may follow the description instead of reading the
full skill content." The recorded case is an agent performing one review because
the description said "code review between tasks," even though the skill's
flowchart required two. "The trap: Descriptions that summarize workflow create a
shortcut agents will take. The skill body becomes documentation agents skip."

## Bundled files

These load on demand: the skill points at them; they are not read up front.

| File | What it holds |
| --- | --- |
| `testing-skills-with-subagents.md` | The full testing methodology: writing pressure scenarios, pressure types (time, sunk cost, authority, exhaustion), plugging holes, meta-testing |
| `anthropic-best-practices.md` | Anthropic's official skill-authoring guidance, as published (see the known issue below) |
| `persuasion-principles.md` | Why authority, commitment, scarcity, social proof, and unity framing change compliance: research background for discipline skills |
| `graphviz-conventions.dot` | Style rules for the flowcharts the skill permits |
| `render-graphs.js` | Renders a skill's `dot` blocks to SVG so a human can look at the flow. Needs graphviz installed. |
| `examples/CLAUDE_MD_TESTING.md` | A full worked test campaign, testing CLAUDE.md documentation variants |

## Common questions

**This skill is mirrored from upstream, byte for byte.** Alone among the
superpowers-derived skills here, it carries no local adaptations: the package is
a verbatim copy of `skills/writing-skills/` from
[obra/superpowers](https://github.com/obra/superpowers) (MIT, © Jesse Vincent).
Every other derived skill passes an adaptation filter that defangs imperatives
and re-points cross-references; this one is exempt by choice, so what you read
is what upstream ships.

That has a visible cost. The mirror carries five references to
`superpowers:`-namespaced skills and one relative link to
`../using-superpowers/`, a piece this repo deliberately does not ship. **Those
six references resolve to nothing in an installed environment.** Read them as
pointing at `test-driven-development` and `systematic-debugging`, which ship
unprefixed in the `workbench` plugin. It also means upstream's own defects
arrive unfiltered: see the next entry.

**A known defect in the bundled corpus: the description guidance contradicts
itself across files.** `SKILL.md` says the
description "describes ONLY when to use (NOT what it does)" and "**NEVER
summarize the skill's process or workflow**." The bundled
`anthropic-best-practices.md` says the opposite: "The `description` field enables
Skill discovery and should include both what the Skill does and when to use it,"
repeats it as "Include both what the Skill does and specific triggers/contexts,"
carries example descriptions that lead with capabilities ("Extract text and
tables from PDF files, fill forms, merge documents. Use when…"), and its
checklist asks that "Description includes both what the Skill does and when to
use it." Both files ship in the same skill directory. If you follow the bundled
reference here you will write descriptions the SKILL.md forbids. This repo's own
practice follows `SKILL.md`: a pass over six toolkit descriptions rewrote them to
triggers and disambiguation only, cutting their listing cost from roughly 1,447
to 535 tokens while a fresh-context routing probe still scored 8 of 8
([decision](../decisions/description-trim-sdo.md)).

**Where is the worked test-campaign example?** In
`examples/CLAUDE_MD_TESTING.md`, which `testing-skills-with-subagents.md` points
at. It is present. This pointer was dangling for a while: an earlier partial port
carried the reference but not the directory, so the file it named existed only
upstream. The mirror brought the whole tree, so it resolves now.

**Do I really need a baseline for a two-line edit?** By the skill's own terms,
yes: the Iron Law explicitly covers edits, and "Write skill before testing?
Delete it. Start over." Its rationalization table pre-answers the usual outs:
"Skill is obviously clear" → "Clear to you ≠ clear to other agents"; "I'll test if
problems emerge" → "Problems = agents can't use skill"; "No time to test" →
"Deploying untested skill wastes more time fixing it later."

**My agent complies but produces bloated output. Should I add a prohibition?**
No. That is the classic misapplication. In head-to-head wording tests on
dispatch-prompt guidance, "the prohibition arm produced clearly more of the
unwanted content than the recipe arm (fully separated distributions), and trended
worse than even the no-guidance control." Use a recipe: "A recipe leaves nothing
to negotiate: the output matches the stated shape or it doesn't." The skill still
tells you to micro-test your own case rather than assume.

**Where do skills live?** "Personal skills live in your runtime's skills
directory": `~/.claude/skills/` on Claude Code, with Codex, Copilot CLI, and
Gemini CLI also recognizing `~/.agents/skills/` as a cross-runtime alias. Skills
meant to ship to every machine belong in a plugin.

**Why not `@`-link a related skill?** "`@` syntax force-loads files immediately,
consuming 200k+ context before you need them." Reference by skill name with an
explicit marker instead: `**REQUIRED BACKGROUND:** You MUST understand
systematic-debugging`.

**When is a flowchart appropriate?** Only for non-obvious decision points,
process loops where you might stop too early, and "when to use A vs B" decisions.
Never for reference material, code examples, linear instructions, or labels
without semantic meaning.

**Can I write several skills and test them all at the end?** The skill has a
section for exactly this: "STOP: Before Moving to Next Skill." Do not "create
multiple skills in batch without testing each," and do not skip testing "because
'batching is more efficient'."

## It's working if

- You can name the baseline failure your skill fixes, and quote the
  rationalizations verbatim from a run you actually watched.
- The form matches the failure: prohibition for a discipline failure, recipe for
  a shaping failure, a structural slot for an omission, a conditional for
  condition-dependent behavior.
- Five micro-test reps converge on the same shape rather than five different
  interpretations.
- The description reads as triggering conditions only, third person, under ~500
  characters, with no workflow summary in it.
- New rationalizations from testing made it into the table, and re-testing kept
  the skill green.

**Not working if** the skill exists but no baseline run does. That is the state
the Iron Law names: written before it was tested, therefore unverified against
the failure it claims to fix. The other clear negative signal is a control that
never failed: "If the control doesn't exhibit the failure, there is nothing to
fix." Guidance authored against a failure that doesn't occur is pure token cost.

## Where it fits

`writing-skills` ships in **`toolkit`**, the optional plugin, not in the
`workbench` process core. Toolkit is the opt-in set of artifact-making utilities
you install alongside workbench; workbench's own orientation map points at
`writing-skills` for "Authoring or editing skills" while noting that it ships in
`toolkit`. If you never author skills, skip it. If you do, it is the piece that
keeps a skill from being an untested opinion, and the skills in this repository,
including this one, are held to it.
