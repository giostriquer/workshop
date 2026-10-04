# Domain Glossary Format

## Locate the glossary

Resolve one authoritative glossary for the relevant domain before reading its
vocabulary or writing a term:

1. Follow the location or convention named by the user's request or the repo's
   `AGENTS.md` / `CLAUDE.md`. An explicit repository pointer wins over a default
   filename. If the named file is missing, report that gap; create it only when
   recording a resolved term is authorized.
2. Otherwise look for `GLOSSARY-MAP.md` or legacy `CONTEXT-MAP.md` at the root.
   Follow the existing map's paths as written, even when they mix filename
   conventions. Select the context relevant to the topic; ask if unclear.
3. Without a map, reuse an existing root `GLOSSARY.md` or `CONTEXT.md`.
4. If competing maps or glossaries exist and repo guidance does not identify
   the owner, ask which is authoritative before editing or treating either as
   settled vocabulary. Continue independent work while that choice is pending.
5. When none exists and the repo specifies no convention, use root
   `GLOSSARY.md`, created lazily when the first term is resolved. A read-only
   survey reports the missing glossary and creates nothing.

Use the resolved location consistently in reads, edits, reports, and subagent
briefs. Keep existing names. Do not rename, merge, or create a parallel glossary
as part of terminology work. The examples below show the default for new repos;
the legacy names remain supported.

## Structure

```md
# {Context Name}

{One or two sentence description of what this context is and why it exists.}

## Language

**Order**:
{A one or two sentence description of the term}
_Avoid_: Purchase, transaction

**Invoice**:
A request for payment sent to a customer after delivery.
_Avoid_: Bill, payment request

**Customer**:
A person or organization that places orders.
_Avoid_: Client, buyer, account
```

## Rules

- **Be opinionated.** When multiple words exist for the same concept, pick the best one and list the others under `_Avoid_`.
- **Keep definitions tight.** One or two sentences max. Define what it IS, not what it does.
- **Only include terms specific to this project's context.** General programming concepts (timeouts, error types, utility patterns) don't belong even if the project uses them extensively. Before adding a term, ask: is this a concept unique to this context, or a general programming concept? Only the former belongs.
- **Group terms under subheadings** when natural clusters emerge. If all terms belong to a single cohesive area, a flat list is fine.

## Single vs multi-context repos

**Single context (most repos):** One glossary at the resolved location.

**Multiple contexts:** A `GLOSSARY-MAP.md` (or existing `CONTEXT-MAP.md`) at the repo root lists the contexts, where they live, and how they relate to each other:

```md
# Glossary Map

## Contexts

- [Ordering](./src/ordering/GLOSSARY.md): receives and tracks customer orders
- [Billing](./src/billing/GLOSSARY.md): generates invoices and processes payments
- [Fulfillment](./src/fulfillment/GLOSSARY.md): manages warehouse picking and shipping

## Relationships

- **Ordering → Fulfillment**: Ordering emits `OrderPlaced` events; Fulfillment consumes them to start picking
- **Fulfillment → Billing**: Fulfillment emits `ShipmentDispatched` events; Billing consumes them to generate invoices
- **Ordering ↔ Billing**: Shared types for `CustomerId` and `Money`
```

Follow the lookup order above for existing repos. A glossary map routes terms;
its presence does not authorize inventing another context or moving files.
