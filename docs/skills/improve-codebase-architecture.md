# improve-codebase-architecture

## What it does

`improve-codebase-architecture` surveys a codebase for **deepening
opportunities**: places where a shallow module (an interface nearly as complex
as what it hides) could become a deep one. It writes the candidates up as an
HTML report, stops, and asks which one you want to explore. Once you pick, it
[grills](grilling.md) you through that candidate's decisions.

It changes no code. The run produces one HTML file in your OS temp directory
and a conversation; the refactor itself happens later, through your normal
build flow.

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

None to run it. With no direction given, it reads recent commit history and
weights the scan toward files that keep changing. It reads `CONTEXT.md` and
the repo's ADRs (in `docs/adr/`, or wherever the repo keeps decision records)
when they exist, and names candidates in your domain's own nouns.

It writes in two places. The report goes to
`<tmpdir>/architecture-review-<timestamp>.html`, outside the repo. During the
grilling loop it adds or sharpens terms in `CONTEXT.md` (creating it if
needed) and offers to record a rejected candidate as an ADR, so a later run
does not suggest it again.

## The report

Each candidate is a card:

| Part | What it holds |
| --- | --- |
| Files | The modules involved, with `file:line` evidence from a traced call path |
| Problem / Solution | One sentence each |
| Wins | The gain in glossary terms: locality, leverage, what tests get simpler |
| Before / After | A side-by-side diagram of the shallowness and the deepening |
| Strength | `Strong`, `Worth exploring`, or `Speculative` |
| Gaps | What the trace could not settle, when anything |

The report ends with a **Top recommendation**. It is one static file with
inline CSS and SVG, so it renders offline and behind strict content policies.
It opens in dark mode.

Candidates are screened before they reach the report: a proposed deepening
that adds a pass-through, splits a module by execution order, or passes a
transport type through its new interface is revised or dropped.

## Common questions

**I only want the report, not an interview.**
The interview starts only on a candidate you pick. Read the report, and pick
nothing or say you are done.

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
Both plugins ship this skill and its three dependencies. The toolkit copy
loads `toolkit:codebase-design`, `toolkit:grilling` and
`toolkit:domain-modeling` by their plugin-prefixed names on Claude Code and
Codex. On OpenCode, skill names must be unique across scanned directories, so
load one set.

## It's working if

- Candidates use your domain's terms ("the Order intake module"), not class
  names, and the architecture glossary (module, interface, seam, depth), not
  "component" or "service".
- Every card cites `file:line` evidence, and names what it could not trace.
- Candidates cluster in recently changed files unless you named a direction.
- No code changed. The only new file is the report in your temp directory.
- It stops after the report and asks which candidate to explore.
- Rejecting a candidate for a durable reason gets you an ADR offer.

## Where it fits

Periodic maintenance, outside the workbench flow. It borrows its vocabulary
from [codebase-design](codebase-design.md), walks your decisions with
[grilling](grilling.md), and keeps the glossary current through
[domain-modeling](domain-modeling.md). What it produces is a decision about one
candidate, which enters your build flow at [brainstorming](brainstorming.md)
or a spec.

`improve-codebase-architecture` ships in the optional **toolkit** plugin. Its
[canonical skill](../../plugins/toolkit/skills/improve-codebase-architecture/SKILL.md)
is the authority for behavior.
