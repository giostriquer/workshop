# improve-codebase-architecture

[Canonical skill](../../plugins/toolkit/skills/improve-codebase-architecture/SKILL.md)

Ships in Toolkit and requires Workbench for `codebase-design` and
`domain-modeling`. Its interview uses Toolkit's `grilling`. If Workbench is
missing, the survey reports that dependency instead of claiming completion.

## What it does

`improve-codebase-architecture` surveys a codebase for **deepening
opportunities**: places where a shallow module (an interface nearly as complex
as what it hides) could become a deep one. It writes the candidates up as an
HTML report, stops, and asks which one you want to explore. Once you pick, it
[grills](grilling.md) you through that candidate's decisions.

The survey itself changes no code. The run produces one HTML file outside the
repo and a conversation; the refactor happens later, through your normal build
flow. If your invocation already says to implement the candidates, it skips the
question and the interview: it writes a decision record per candidate and hands
each one to that build flow.

It is **user-invoked only** (`disable-model-invocation: true`, plus
`allow_implicit_invocation: false` for Codex).

## When to reach for it

Type `/improve-codebase-architecture` (`/toolkit:improve-codebase-architecture`
in Claude Code, `$toolkit:improve-codebase-architecture` in Codex, when another
plugin also ships one), optionally naming a direction.

| Situation | How to use it |
| --- | --- |
| Routine upkeep | Run it every so often to queue up structural work between features. |
| Before a big build | Name the change: "how can we make this change easy?" This is the most actionable prompt. |
| Brownfield audit | Run it on an unfamiliar or unstructured repo to see what shape it is in. |
| Legacy test work | Use it to find the missing seams before writing tests against untestable code. |

Neighbours it is easy to confuse with:

| The problem | The skill |
| --- | --- |
| Which module should be redesigned, and why | `improve-codebase-architecture` |
| The shape of one module you already chose | [codebase-design](codebase-design.md) |
| Designing a new feature or refactor into an approved design | [brainstorming](brainstorming.md) |
| Whether a finished diff is fit to ship | [code-quality-review](code-quality-review.md) |

## Prerequisites and side effects

Install Workbench alongside Toolkit for its design and domain references.
No existing glossary or ADR is required. With no direction given, it reads recent commit history and
weights the scan toward files that keep changing. It reads the repo's glossary
and ADRs (in `docs/adr/`, or wherever the repo keeps decision records)
when they exist, and names candidates in your domain's own nouns.

Glossary lookup follows repository pointers, existing `GLOSSARY-MAP.md` or
`CONTEXT-MAP.md` maps, and either `GLOSSARY.md` or `CONTEXT.md`. It keeps existing
names and asks when competing sources have no clear owner. Exploration briefs
carry the resolved path; the read-only survey creates no glossary.

It writes in two places. The report goes outside the repo, to
`architecture-review-<YYYYMMDD-HHMMSS>.html` in the session's scratch directory
when the host has one, otherwise your OS temp directory. During the
grilling loop it adds or sharpens terms in that same glossary (creating it lazily
if needed; `GLOSSARY.md` by default for a new unconfigured repo) and offers to
record a rejected candidate as an ADR, so a later run
does not suggest it again.

## The report

Each candidate is a card:

| Part | What it holds |
| --- | --- |
| Files | The modules involved, with `file:line` evidence from a traced call path |
| Problem / Solution | One sentence each |
| Wins | The gain in glossary terms: locality, leverage, what tests get simpler |
| Prevention | Recurring-mistake candidates only: the ownership, visibility rule, or check that stops the traced mistake |
| Before / After | A side-by-side diagram of the shallowness and the deepening |
| Strength | `Strong`, `Worth exploring`, or `Speculative` |
| Gaps | What the trace could not settle, when anything; a recurring-mistake candidate adds its unrun negative and positive checks |

The report ends with a **Top recommendation**. It is one static file with
inline CSS and SVG, so it renders offline and behind strict content policies.
It opens in dark mode.

Candidates are screened before they reach the report: a proposed deepening
that adds a pass-through, splits a module by execution order, or passes a
transport type through its new interface is revised or dropped.

The survey also traces split ownership, equivalent competing paths, reachable
internals, and hand-synchronized lists. A recurring-mistake candidate names
the prevention mechanism on its own Prevention line, preserves required
compatibility, and names unrun negative and positive checks in Gaps.

## Common questions

**I only want the report, not an interview.**
The interview starts only on a candidate you pick. Read the report, and pick
nothing or say you are done.

**I already told it to implement the candidates. Why no interview?**
The interview needs you in the conversation. When your invocation's own words
authorize implementation, each candidate gets a decision record in the work
scope's folder instead: the decisions the interview would have walked, the
option taken, and the code evidence behind it. A candidate with a decision the
code cannot settle, or one that contradicts an ADR, is named with its open
question and left alone. The rest are settled designs: they skip
[brainstorming](brainstorming.md)'s design steps and go to implementation on the
route you authorized. Worktrees, merges and pushes happen only where you named them.

**It gave me twelve candidates. Do I work through them in one session?**
One candidate per session. The report is a temp file, so carry the candidate
you chose, not the file, and turn the rest into tickets or notes.

**Will it ever say the codebase is fine?**
Rarely: it is built to find candidates. A report where everything is
`Speculative` is how it says it found nothing worth doing.

**Does it work outside Claude Code?**
Yes. Exploration runs through a sub-agent where the host has one, and inline
otherwise. The report needs no network.

**I also have the `mattpocock-skills` plugin installed.**
The upstream plugin ships this skill and its dependencies. Workshop splits
them between Toolkit and Workbench. The Toolkit survey
loads `workbench:codebase-design`, `toolkit:grilling` and
`workbench:domain-modeling` by their plugin-prefixed names on Claude Code and
Codex. On OpenCode, skill names must be unique across scanned directories, so
load one set.

## It's working if

- Candidates use your domain's terms ("the Order intake module"), not class
  names, and the architecture glossary (module, interface, seam, depth), not
  "component" or "service".
- Every card cites `file:line` evidence, and names what it could not trace.
- Candidates cluster in recently changed files unless you named a direction.
- The survey changes no code or glossary; it writes the report outside the
  repo. A chosen candidate's later interview can update the glossary and
  offer an ADR.
- It stops after the report and asks which candidate to explore. When the
  invocation already authorized implementation, every covered candidate has a
  decision record instead, and is either in the build flow or named with its
  open question.
- A recurring-mistake card has a Prevention line and its unrun checks in Gaps.
- Rejecting a candidate for a durable reason gets you an ADR offer.

## Where it fits

Periodic maintenance, outside the workbench flow. It borrows its vocabulary
from [codebase-design](codebase-design.md), walks your decisions with
[grilling](grilling.md), and keeps the glossary current through
[domain-modeling](domain-modeling.md). What it produces is a decision about one
candidate, which enters your build flow at [brainstorming](brainstorming.md)
or a spec.

## Independent exploration

A new explorer starts with a fresh context containing the accepted scope, source paths, resolved glossary and decision records, and evidence requirements. Related follow-ups reuse that helper. Without helpers, exploration stays inline; the survey still proposes candidates rather than implementing them.
