# audit

[Canonical skill](../../plugins/workbench/skills/audit/SKILL.md)

## What it does

`audit` turns "something to check" into a sized, engine-run,
evidence-grounded investigation: a bug to pin down, a refactor to confirm
complete, a premise to test. It establishes the coverage, picks the engine,
preserves what the evidence leaves uncertain, and routes the exit by shape.

## When to reach for it

Ask for an investigation or audit: `/audit`, "audit X", "check whether ...".
Routine checks and known fixes stay in their ordinary workflow. An idea to
build goes to `brainstorming` instead.

| The problem | The skill |
| --- | --- |
| Something to verify, hunt, or check, size unknown | `audit` |
| Proving one just-finished change works | `empirical-proof` |
| An idea to build | `brainstorming` |
| A bug you are already fixing | `systematic-debugging` |

## The protocol

**Step 1: size the workload.** It states the tier that fits, with one line of
reasoning. It asks you to pick only when two tiers both fit and differ in what
you pay (a team sweep, or delegated readers you have not authorized) or in
runtime modality, and you have not already stated or clearly implied the
coverage ("full audit").

| Tier | Engine | Fits |
| --- | --- | --- |
| **quick look** | inline: a few reads/greps, minutes | "is this config even used?" |
| **deep audit** | `claim-check` | one premise to an evidence-graded verdict: a bug, a ticket, "is the refactor complete?" |
| **static review** | inline, or independent readers where delegation is authorized | a read-only audit across many files with no single premise: code, instructions, configuration, or documents |
| **team sweep** | `qa-sweep` | a release or feature area, corroborated at team scale |

When it asks, it uses a structured question tool when available, recommended
tier first; an asked pick is yours.

**Runtime modality flag.** Tiers size breadth; this flags where evidence
must come from. When the check concerns behavior a real client can drive (an
endpoint, an app flow, a CLI), code reading alone cannot settle it, so the skill
confirms whether to drive the booted app: in the sizing question when it asks
one, otherwise as its own question. A confirmed runtime check
travels to the engine.

**Step 2: run the engine.** A static review inventories the surface and
reports coverage with source evidence. When independent readers did the
reading, the session reads the cited lines itself for every reader claim the
verdict rests on; anything it did not check is reported as the reader's,
unverified. A quick look stays quick: "if it starts
growing past its size, stop and say so." Deep and sweep tiers invoke their
engine and let it run by its own rules.

**Step 3: flag uncertainty.** Ambiguous reproductions, contested
assumptions, anything where two readings survive.

**Step 4: resolve flags by what is missing.** Reachable evidence gets
investigated. An open preference or intended behavior that changes the verdict
goes to you. An ambiguous reproduction stays an evidence gap in the report;
you are never asked to certify it. Independent findings continue while an
answer is pending.

**Step 5: route the exit.**

| What came out | Where it goes |
| --- | --- |
| The audit was the ask | The report, verdict-first; stop |
| Feature- or refactor-shaped work | `brainstorming`, with findings and confirmed flags as context |
| Repairs already authorized | Confirmed in-scope fixes continue; `brainstorming` only for unsettled design |
| A confirmed fix, no implementation authority | The route pick: **Direct** or **Plan** |

## Common questions

**Why is it asking me to size something before it even looks?**

It asks only when two tiers fit and differ in cost or in whether the running
app gets driven; then the pick is yours. State the coverage in the ask ("full
audit") and it skips the question. When one tier plainly fits, it names that
tier and starts, and you can redirect it.

**I asked it to check whether a feature works and it only read code.**

The runtime modality flag exists for this: when the behavior is drivable, the
recommendation should say reading alone cannot settle it and confirm whether
to drive the booted app
([decision](../decisions/workbench-operator-decisions.md)).

**The quick look is turning into a real investigation. What now?**

It stops and tells you. "**Never grows the workload silently.**"

**It didn't pause to confirm anything. Did it skip a step?**

Pauses are only for decisions you can supply. Empirical uncertainty stays in
the report.

**Does `audit` make `claim-check` or `qa-sweep` stricter?**

No. The engines own their rigor.

**It found the bug. Will it fix it?**

An audit-only request ends in its report. With repairs already authorized, it
continues confirmed in-scope fixes; without, it offers the route pick.

## It's working if

- It used the coverage you stated and asked for a tier only when you hadn't.
- Runtime claims carry runtime evidence or a stated gap.
- Evidence gaps are reported as uncertainty; questions concern intent,
  access, or other decisions you can supply.
- The report leads with the verdict and names the tier and engine that ran.
- Negative signal: it grows past the sized tier without asking, or starts
  repairs without authority.

## Where it fits

`audit` is door A of the workbench flow: work that starts from something to
verify. It dispatches into `claim-check` or `qa-sweep`, then exits to
`brainstorming`, to the route pick, or nowhere when the report was the
deliverable.
