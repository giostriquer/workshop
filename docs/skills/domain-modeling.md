# domain-modeling

## What it does

`domain-modeling` builds and sharpens a project's domain language while you
design. It challenges a term that conflicts with the glossary, pushes a vague
word toward a precise one, stress-tests relationships with edge-case
scenarios, and checks your description against the code. When a term is
settled it writes it into the project's glossary at that moment, not in a batch at the
end.

It is the **active** discipline. Reading the glossary to borrow its words is a
habit any skill can have; this skill is for changing the model.

## When to reach for it

It is model-invocable: the agent loads it when terms are being argued, when
code and your description disagree, or when you write or edit a glossary or
an ADR. [improve-codebase-architecture](improve-codebase-architecture.md) loads
it during its grilling loop.

| The situation | The move |
| --- | --- |
| Two people mean different things by "cancellation" | `domain-modeling`: pick the canonical term, list the other under `_Avoid_` |
| A hard-to-reverse choice was just made | `domain-modeling`: it offers an ADR if the choice clears the bar |
| The module's shape is the problem | [codebase-design](codebase-design.md) |
| You only want to look a term up | Nothing: read the project's glossary |

## Two artifacts, two bars

| | Glossary | ADR |
| --- | --- | --- |
| Holds | Terms: what a thing is, in one or two sentences, with rejected synonyms under `_Avoid_` | One decision: context, choice, reason, in a few sentences |
| Bar | A term became canonical | All three: hard to reverse, surprising without context, the result of a real trade-off |
| When | Inline, as the term settles | Offered, never assumed |
| Never | Implementation detail, a spec, a scratch pad | A diary of every choice |

Both files are created lazily, when there is something to write. The skill
follows repository pointers first, then an existing `GLOSSARY-MAP.md` or
`CONTEXT-MAP.md`, then a root `GLOSSARY.md` or `CONTEXT.md`. Map entries can use
either naming convention. Existing files keep their names; new unconfigured
repositories default to `GLOSSARY.md`. Competing files without a clear owner
prompt a location question before writing or using their vocabulary.
ADRs go in `docs/adr/` unless the repo already keeps decision records somewhere
else (for example `docs/decisions/`), in which case they follow that location
and format.

## Common questions

**Do I need to rename my `CONTEXT.md`?**
No. Both naming conventions work. The skill reuses your existing file and does
not create a second glossary or migrate one automatically.

**My glossary keeps growing.**
It has absorbed implementation detail or decisions. Ask for it to be cut back
to terms only; the file is a glossary and nothing else.

**Can I keep my own ADR format?**
Yes. When the repo already has a decision-record location or a template its
`AGENTS.md` or `CLAUDE.md` names, ADRs follow it instead of starting a second
`docs/adr/`.

**Will it invent a domain language for me?**
No. It enforces precision on understanding you have; it does not manufacture
vocabulary.

## It's working if

- It stops to ask which of two meanings you intended, instead of picking one.
- The selected glossary changes during the conversation, not in a burst at the end.
- It declines an ADR for something easy to undo, naming the test that failed.
- It quotes your code back when your code and your sentence disagree.

## Where it fits

A model-invoked reference that usually runs underneath another skill. Its
sibling [codebase-design](codebase-design.md) owns the module's shape; this
one owns the domain's words.

`domain-modeling` ships in the optional **toolkit** plugin. Its
[canonical skill](../../plugins/toolkit/skills/domain-modeling/SKILL.md) is the
authority for behavior.
