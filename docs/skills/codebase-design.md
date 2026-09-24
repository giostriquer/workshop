# codebase-design

## What it does

`codebase-design` fixes the words used to design a module and states the
principles that follow from them. It is a reference, not a process: it has no
loop, no artifact, and no checkpoint. Skills that design or restructure code
load it for the vocabulary, and on its own it gives you the language and stops.

| Term | What it means | Don't say |
| --- | --- | --- |
| **Module** | Anything with an interface and an implementation, at any scale | unit, component, service |
| **Interface** | Everything a caller must know: types, invariants, ordering, error modes, config, performance | API, signature |
| **Depth** | Behaviour a caller or test can exercise per unit of interface learned | |
| **Seam** | Where an interface lives; a place behaviour can change without editing there | boundary |
| **Adapter** | A concrete thing filling a seam; names a role, not a substance | |
| **Leverage** | What callers get from depth | |
| **Locality** | What maintainers get from depth: change and bugs concentrate in one place | |

The four principles: depth belongs to the interface, not the implementation;
the **deletion test** (delete the module: if complexity vanishes it was a
pass-through, if it reappears across callers it earned its keep); the interface
is the test surface; and one adapter is a hypothetical seam, two make a real
one.

Two supporting files load on demand. `DEEPENING.md` sorts a candidate's
dependencies into four categories (in-process, local-substitutable, remote but
owned, true external), which decide how the deepened module is tested.
`DESIGN-IT-TWICE.md` has several sub-agents design radically different
interfaces for one module, usage first, and then compares them on depth,
locality, and seam placement.

## When to reach for it

It is model-invocable: the agent loads it when you design or reshape a
module's interface, argue about where a seam goes, or judge whether an
extraction earns its keep, and [improve-codebase-architecture](improve-codebase-architecture.md)
loads it by name.

| The problem | The skill |
| --- | --- |
| The shape of one module: its interface, seam, depth | `codebase-design` |
| The words of the domain ("account" means three things) | [domain-modeling](domain-modeling.md) |
| You don't know yet which module to redesign | [improve-codebase-architecture](improve-codebase-architecture.md) |
| A feature or refactor to design end to end | [brainstorming](brainstorming.md) |

## Common questions

**I pointed a session at it and it ran off redesigning things.**
It is a reference, so it has no stopping rule of its own. Drive the session
with a skill that has one ([improve-codebase-architecture](improve-codebase-architecture.md),
[brainstorming](brainstorming.md), [grill-me](grill-me.md)) and let this one
supply the words.

**Does design-it-twice work on hosts without sub-agents?**
Yes, more slowly: the agent writes the designs one after another, each against
its own constraint, without revising the earlier ones toward the later.

**Is a deep module a folder layout?**
No. A module is scale-agnostic, and depth is about the interface. File
structure can hint at modules but does not make them.

## It's working if

- Design talk says "module", "interface", "seam", not "component", "service",
  "boundary".
- A proposed extraction comes with a deletion-test verdict.
- A proposed seam names its second adapter, not only the first.
- Interface discussion covers invariants, ordering, and error modes, not only
  types.

## Where it fits

The vocabulary layer under the design skills, and the bench a chosen candidate
is designed on. Its sibling [domain-modeling](domain-modeling.md) does the same
job for the problem domain's words.

`codebase-design` ships in the optional **toolkit** plugin. Its
[canonical skill](../../plugins/toolkit/skills/codebase-design/SKILL.md) is the
authority for behavior.
