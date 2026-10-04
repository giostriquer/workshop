---
name: domain-modeling
description: Use when a project's domain terms are being challenged, sharpened, or settled during design, when code and the stated domain language disagree, or when writing or editing a GLOSSARY.md, legacy CONTEXT.md, or ADR. Not for only reading a glossary to borrow its vocabulary.
---

# Domain Modeling

Actively build and sharpen the project's domain model as you design. This is the *active* discipline: challenging terms, inventing edge-case scenarios, and writing the glossary and decisions down the moment they crystallise. Merely reading the glossary for vocabulary is a habit any skill can have; this skill is for changing the model.

## File structure

First [locate the glossary](CONTEXT-FORMAT.md#locate-the-glossary): respect repo
pointers and existing `GLOSSARY` or `CONTEXT` files and maps. Use that resolved
location throughout this session. Most new repos have a single context:

```
/
├── GLOSSARY.md
├── docs/
│   └── adr/
│       ├── 0001-event-sourced-orders.md
│       └── 0002-postgres-for-write-model.md
└── src/
```

An existing glossary map points to where each context lives. For example:

```
/
├── GLOSSARY-MAP.md
├── docs/
│   └── adr/                          ← system-wide decisions
├── src/
│   ├── ordering/
│   │   ├── GLOSSARY.md
│   │   └── docs/adr/                 ← context-specific decisions
│   └── billing/
│       ├── GLOSSARY.md
│       └── docs/adr/
```

Create files lazily: only when you have something to write. Create the resolved glossary when the first term is settled; an existing glossary keeps its path and name. If no `docs/adr/` exists, create it when the first ADR is needed.

If the repo already keeps decision records somewhere else (for example `docs/decisions/`, or a template its `AGENTS.md` or `CLAUDE.md` names), write ADRs there in that format instead of starting a parallel `docs/adr/`.

## During the session

### Challenge against the glossary

When the user uses a term that conflicts with the resolved glossary, call it out immediately. "Your glossary defines 'cancellation' as X, but you seem to mean Y. Which is it?"

### Sharpen fuzzy language

When the user uses vague or overloaded terms, propose a precise canonical term. "You're saying 'account': do you mean the Customer or the User? Those are different things."

### Discuss concrete scenarios

When domain relationships are being discussed, stress-test them with specific scenarios. Invent scenarios that probe edge cases and force the user to be precise about the boundaries between concepts.

### Cross-reference with code

When the user states how something works, check whether the code agrees. If you find a contradiction, surface it: "Your code cancels entire Orders, but you just said partial cancellation is possible. Which is right?"

### Update the glossary inline

When a term is resolved, update the selected glossary right there. Don't batch these up: capture them as they happen. Use the format in [CONTEXT-FORMAT.md](./CONTEXT-FORMAT.md).

The glossary should be totally devoid of implementation details. Do not treat it as a spec, a scratch pad, or a repository for implementation decisions. It is a glossary and nothing else.

### Offer ADRs sparingly

Only offer to create an ADR when all three are true:

1. **Hard to reverse**: the cost of changing your mind later is meaningful
2. **Surprising without context**: a future reader will wonder "why did they do it this way?"
3. **The result of a real trade-off**: there were genuine alternatives and you picked one for specific reasons

If any of the three is missing, skip the ADR. Use the format in [ADR-FORMAT.md](./ADR-FORMAT.md).
