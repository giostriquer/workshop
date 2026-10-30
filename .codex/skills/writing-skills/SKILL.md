---
name: writing-skills
description: Use when creating new skills, editing existing skills, auditing existing skills or verifying skills work before deployment
---

# Writing Skills

## Overview

**Writing skills IS Test-Driven Development applied to process documentation.**

You write test cases (pressure scenarios with subagents), watch them fail (baseline behavior), write the skill (documentation), watch tests pass (agents achieve the intended outcome), and refactor (close loopholes).

**Core principle:** Measure task outcomes, not obedience alone. Compare current
wording, no guidance, and the proposed correction where useful. A control that
succeeds can demonstrate that existing guidance is harmful. Recorded failures,
source contradictions, and reproducible effects can justify a correction without
manufacturing a no-guidance failure. Preserve useful procedures and examples;
amend the specific defective condition and its repeated counterparts.

Score correctness, work preservation, authority, evidence, and useful progress.
The skill's own rule is not the expected answer merely because it is a rule.

**REQUIRED BACKGROUND:** You MUST understand workbench:test-driven-development before using this skill. That skill defines the fundamental RED-GREEN-REFACTOR cycle. This skill adapts TDD to documentation.

**Official guidance:** When changing skill discovery, supporting-file layout, or
bundled tool instructions, consult the relevant sections of
[anthropic-best-practices.md](anthropic-best-practices.md) for Anthropic's authoring
patterns. Apply this repo's governing rules where its conventions differ.

## What is a Skill?

A **skill** is a reference guide for proven techniques, patterns, or tools. Skills help future agents find and apply effective approaches.

**Skills are:** Reusable techniques, patterns, tools, reference guides

**Skills are NOT:** Narratives about how you solved a problem once

## TDD Mapping for Skills

| TDD Concept | Skill Creation |
|-------------|----------------|
| **Test case** | Pressure scenario with subagent |
| **Production code** | Skill document (SKILL.md) |
| **Test fails (RED)** | Agent violates rule without skill (baseline) |
| **Test passes (GREEN)** | Correct task outcome with skill present |
| **Refactor** | Close loopholes while maintaining compliance |
| **Write test first** | Run baseline scenario BEFORE writing skill |
| **Watch it fail** | Document exact rationalizations agent uses |
| **Minimal code** | Write skill addressing those specific violations |
| **Watch it pass** | Verify agent now complies |
| **Refactor cycle** | Find new rationalizations → plug → re-verify |

The entire skill creation process follows RED-GREEN-REFACTOR.

## When to Create a Skill

**Create when:**
- Technique wasn't intuitively obvious to you
- You'd reference this again across projects
- Pattern applies broadly (not project-specific)
- Others would benefit

**Don't create for:**
- One-off solutions
- Standard practices well-documented elsewhere
- Project-specific conventions (put in your instructions file)
- Mechanical constraints (if it's enforceable with regex/validation, automate it; save documentation for judgment calls)

## Skill Types

### Technique
Concrete method with steps to follow (condition-based-waiting, root-cause-tracing)

### Pattern
Way of thinking about problems (flatten-with-flags, test-invariants)

### Reference
API docs, syntax guides, tool documentation (office docs)

## Directory Structure


```
skills/
  skill-name/
    SKILL.md              # Main reference (required)
    supporting-file.*     # Only if needed
```

**Flat namespace** - all skills in one searchable namespace

**Separate files for:**
1. **Heavy reference** (100+ lines) - API docs, comprehensive syntax
2. **Reusable tools** - Scripts, utilities, templates

**Keep inline:**
- Principles and concepts
- Code patterns (< 50 lines)
- Everything else

## Authoring format and discovery

When writing or revising frontmatter, discovery wording, skill structure or a
flowchart, read [Authoring format](authoring-format.md) for the schema, examples,
search terms, cross-reference conventions and flowchart rules.

Descriptions state when to use the skill, not its procedure. Reference pointers
name the target, what it supplies and the observable condition for reading it.
Keep shared authority, preservation, recovery and completion requirements inline;
conditional references do not weaken them.

## Code Examples

**One excellent example beats many mediocre ones**

Choose most relevant language:
- Testing techniques → TypeScript/JavaScript
- System debugging → Shell/Python
- Data processing → Python

**Good example:**
- Complete and runnable
- Well-commented explaining WHY
- From real scenario
- Shows pattern clearly
- Ready to adapt (not generic template)

**Don't:**
- Implement in 5+ languages
- Create fill-in-the-blank templates
- Write contrived examples

You're good at porting - one great example is enough.

## File Organization

Keep the common steps visible. Place substantial reference material used by only
some branches behind a conditional pointer, as described above. Keep a concept's
definition, rules and exceptions together under one heading; avoid scattering
them across the workflow. File length alone does not justify hiding a shared
requirement or creating another document.

### Self-Contained Skill
```
defense-in-depth/
  SKILL.md    # Everything inline
```
When: All content fits, no heavy reference needed

### Skill with Reusable Tool
```
condition-based-waiting/
  SKILL.md    # Overview + patterns
  example.ts  # Working helpers to adapt
```
When: Tool is reusable code, not just narrative

### Skill with Heavy Reference
```
pptx/
  SKILL.md       # Overview + workflows
  pptxgenjs.md   # 600 lines API reference
  ooxml.md       # 500 lines XML structure
  scripts/       # Executable tools
```
When: Reference material too large for inline

Keep each active `SKILL.md` under 20,000 UTF-8 bytes so compaction can retain the
entrypoint. Run `node scripts/check-skill-size.mjs` from the repository root.
Move substantial conditional procedures with explicit pointers; do not cut shared
gates or delete useful examples to hit the bound. Supporting files remain part
of the skill and must be available to the consuming host.

Invoke bundled scripts through their interpreter in the prose (`bash scripts/tool.sh`, `node scripts/tool.js`), never by bare path: some harness plugin packagers strip executable bits, and a bare `scripts/tool.sh` fails there with `Permission denied`.

## Steps and Completion Criteria

For each substantive step, state the observable condition that permits moving
on: a required input resolved, an artifact with specified fields, or a result
checked against the task contract. Replace vague bounds such as "understand
thoroughly" with the evidence needed to tell complete from incomplete. For
example: "Each changed behavior has a result and supporting evidence, or a named
verification gap." The criterion covers the agreed scope; it grants no new
authority and does not turn missing evidence into success.

Test the resulting actions with a realistic scenario. Sharpen an unclear
completion criterion before adding steps, splitting the document, or choosing
stronger adjectives. Preserve effective existing wording when it already works.

## Evidence before shipping skill changes

Behavior changes need a recorded problem and relevant scenario checks. Preserve
valid drafts while testing them; never delete useful text solely because it was
written before a test. Mechanical corrections can be made directly. Related
skills may be revised together when their interaction is the defect, but each
changed behavior needs coverage. Keep their unaffected checklists, examples,
templates, and verification contracts intact.

## Testing All Skill Types

For measured evaluation claims, verify that trials actually attempted the task
and score their observable outcomes with the same rubric. Record the guidance,
model/settings, scenario set, trial count, failures and missing runs, and
variation; do not silently discard errors. Compare fresh, comparable contexts
and disclose reused context or changed conditions. A few successful probes
support those scenarios, not a general reliability percentage. Investigate
whether an apparent gain reflects an easier task, leaked answers, or grading
the prescribed wording instead of the outcome. Keep this evidence in local
scratch unless the user authorizes publishing it.

Different skill types need different test approaches:

### Discipline-Enforcing Skills (rules/requirements)

**Examples:** TDD, verification-before-completion, designing-before-coding

**Test with:**
- Academic questions: Do they understand the rules?
- Pressure scenarios: Do they comply under stress?
- Multiple pressures combined: time + sunk cost + exhaustion
- Identify rationalizations and add explicit counters

**Success criteria:** Agent follows rule under maximum pressure

### Technique Skills (how-to guides)

**Examples:** condition-based-waiting, root-cause-tracing, defensive-programming

**Test with:**
- Application scenarios: Can they apply the technique correctly?
- Variation scenarios: Do they handle edge cases?
- Missing information tests: Do instructions have gaps?

**Success criteria:** Agent successfully applies technique to new scenario

### Pattern Skills (mental models)

**Examples:** reducing-complexity, information-hiding concepts

**Test with:**
- Recognition scenarios: Do they recognize when pattern applies?
- Application scenarios: Can they use the mental model?
- Counter-examples: Do they know when NOT to apply?

**Success criteria:** Agent correctly identifies when/how to apply pattern

### Reference Skills (documentation/APIs)

**Examples:** API documentation, command references, library guides

**Test with:**
- Retrieval scenarios: Can they find the right information?
- Application scenarios: Can they use what they found correctly?
- Gap testing: Are common use cases covered?

**Success criteria:** Agent finds and correctly applies reference information

## Common Rationalizations for Skipping Testing

| Excuse | Reality |
|--------|---------|
| "Skill is obviously clear" | Clear to you ≠ clear to other agents. Test it. |
| "It's just a reference" | References can have gaps, unclear sections. Test retrieval. |
| "Testing is overkill" | Untested skills have issues. Always. 15 min testing saves hours. |
| "I'll test if problems emerge" | Problems = agents can't use skill. Test BEFORE deploying. |
| "Too tedious to test" | Testing is less tedious than debugging bad skill in production. |
| "I'm confident it's good" | Overconfidence guarantees issues. Test anyway. |
| "Academic review is enough" | Reading ≠ using. Test application scenarios. |
| "No time to test" | Deploying untested skill wastes more time fixing it later. |

**All of these mean: Test before deploying. No exceptions.**

## Match the Form to the Failure

Before writing guidance, classify the baseline failure. The form that bulletproofs one failure type measurably backfires on another.

| Baseline failure | Right form | Wrong form |
|---|---|---|
| Skips/violates a rule under pressure (knows better, does it anyway) | Prohibition + rationalization table + red flags (see Bulletproofing below) | Soft guidance ("prefer...", "consider...") |
| Complies, but output has the wrong shape (bloated prompt, buried verdict, restated spec) | Positive recipe or contract: state what the output IS: its parts, in order | Prohibition list ("don't restate", "never narrate") |
| Omits a required element from something they already produce | Structural: REQUIRED field or slot in the template they fill in | Prose reminders near the template |
| Behavior should depend on a condition | Conditional keyed to an observable predicate ("if the brief exists, reference it") | Unconditional rule + exemption clauses |

**Why prohibitions backfire on shaping problems:** under a competing incentive ("make the prompt self-contained"), agents negotiate with "don't X". In head-to-head wording tests on dispatch-prompt guidance, the prohibition arm produced clearly more of the unwanted content than the recipe arm (fully separated distributions), and trended worse than even the no-guidance control: micro-test your own case rather than assuming, but never reach for the prohibition by default. A recipe leaves nothing to negotiate: the output matches the stated shape or it doesn't.

**Rules for whichever form you pick:**
- **No nuance clauses.** "Don't X unless it matters" reopens the negotiation: appending a single nuance clause to a winning recipe degraded it from consistent to noisy in the same wording tests. Express a real exception as its own conditional on an observable predicate.
- **Exemption clauses don't scope.** "This limit doesn't apply to code blocks" still suppresses code blocks. If part of the output must be exempt, restructure so the rule can't reach it.

## Discipline-specific wording

When a baseline shows a known rule being skipped under pressure, read
[Discipline examples](discipline-examples.md) for rationalization tables and red
flags. For wrong-shaped output or missing elements, use the positive recipe or
structural field from Match the Form to the Failure instead. Outcome, governing
authority and preservation of valid work remain the standard in either case.

## RED-GREEN-REFACTOR for Skills

Follow the TDD cycle:

### RED: Write Failing Test (Baseline)

Run pressure scenario with subagent WITHOUT the skill. Document exact behavior:
- What choices did they make?
- What rationalizations did they use (verbatim)?
- Which pressures triggered violations?

This is "watch the test fail" - you must see what agents naturally do before writing the skill.

### GREEN: Write Minimal Skill

Write skill that addresses those specific rationalizations. Don't add extra content for hypothetical cases.

Run same scenarios WITH skill. Judge the resulting action against the task contract, including preservation and authority.

### REFACTOR: Close Loopholes

Agent found a new way to miss the intended outcome? Add a targeted correction and re-test. Correct alternative approaches need no counter; no finite probe set establishes universal reliability.

### Micro-Test Wording Before Full Scenarios

Full pressure-scenario runs are the final gate, but they are slow and expensive per iteration. Verify the wording itself first with micro-tests:

1. **One fresh-context sample per call**: a raw API call, or a single-shot subagent if you don't have API access. System prompt = the realistic context the guidance will live in (the full skill or prompt template, not the guidance in isolation); user message = a task that tempts the failure.
2. **Include a no-guidance control where useful.** If it succeeds and current wording fails, removal or narrowing may be the fix. Compare against the task outcome, not compliance alone.
3. **5+ fresh reps per variant for reliability claims.** Smaller or reused-context checks are regression evidence; report their limits, not a cross-model reliability estimate.
4. **Manually read every flagged match.** Score programmatically if you like, but template echoes and quoted counter-examples masquerade as hits; automated counts alone overstate both failure and success.
5. **Variance is a metric.** Inspect whether different outputs meet the same behavioral contract. Equivalent correct approaches need not have identical form. Tighten wording when variation causes a concrete failure.

Micro-tests verify wording; they do not replace pressure scenarios for discipline skills.

**Testing methodology:** See [testing-skills-with-subagents.md](testing-skills-with-subagents.md) for the complete testing methodology:
- How to write pressure scenarios
- Pressure types (time, sunk cost, authority, exhaustion)
- Plugging holes systematically
- Meta-testing techniques

## STOP: Before Moving to Next Skill

**Verify each changed contract before shipping.** Related skills may be revised
as one batch when their interaction is the defect. Do not skip any affected
scenario, but do not publish each skill separately just to enforce sequencing.

**Do NOT:**
- Create multiple skills in batch without testing each
- Ship a changed contract before its relevant checks complete
- Skip testing because "batching is more efficient"

**The deployment checklist below is MANDATORY for EACH skill.**

Deploying untested skills = deploying untested code. It's a violation of quality standards.

## Skill Creation Checklist (TDD Adapted)

Use the checklist below to track the checks relevant to this change.

**RED Phase - Write Failing Test:**
- [ ] Create pressure scenarios (3+ combined pressures for discipline skills)
- [ ] Run scenarios WITHOUT skill - document baseline behavior verbatim
- [ ] Identify patterns in rationalizations/failures

**GREEN Phase - Write Minimal Skill:**
- [ ] Name uses only letters, numbers, hyphens (no parentheses/special chars)
- [ ] YAML frontmatter with required `name` and `description` fields (max 1024 chars; see [spec](https://agentskills.io/specification))
- [ ] Description starts with "Use when..." and includes specific triggers/symptoms
- [ ] Description written in third person
- [ ] Keywords throughout for search (errors, symptoms, tools)
- [ ] Clear overview with core principle
- [ ] Address specific baseline failures identified in RED
- [ ] Guidance form matches the failure type (see Match the Form to the Failure)
- [ ] For behavior-shaping guidance: wording micro-tested against a no-guidance control (5+ fresh reps for reliability claims; smaller checks labeled as regression evidence, every flagged match read manually): N/A for pure reference skills
- [ ] Code inline OR link to separate file
- [ ] One excellent example (not multi-language)
- [ ] Run scenarios WITH skill - verify the intended outcome, preservation, authority, and evidence

**REFACTOR Phase - Close Loopholes:**
- [ ] Identify NEW rationalizations from testing
- [ ] Add explicit counters (if discipline skill)
- [ ] Build rationalization table from all test iterations
- [ ] Create red flags list
- [ ] Re-test observed failure cases and report remaining coverage limits

**Quality Checks:**
- [ ] Small flowchart only if decision non-obvious
- [ ] Quick reference table
- [ ] Common mistakes section
- [ ] No narrative storytelling
- [ ] Supporting files only for tools or heavy reference
- [ ] Reference pointers identify their target, purpose and applicable branch
- [ ] Shared requirements remain inline; each concept's rules stay together
- [ ] Substantive steps have observable completion criteria

**Deployment:**
- [ ] Commit/push only under existing explicit authority; keep a reviewable local diff otherwise
- [ ] Consider contributing back via PR (if broadly useful)

## Discovery Workflow

How future agents find your skill:

1. **Encounters problem** ("tests are flaky")
2. **Searches skills** (greps descriptions, browses categories)
3. **Finds SKILL** (description matches)
4. **Scans overview** (is this relevant?)
5. **Reads patterns** (quick reference table)
6. **Loads example** (only when implementing)

**Optimize for this flow** - put searchable terms early and often.
