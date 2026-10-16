# The workbench flow

Workflow overview for **workbench**: entry, scoping, implementation, and
delivery. The [canonical orientation skill](../plugins/workbench/skills/using-workbench/SKILL.md)
and each owning skill define execution. Filled teal boxes mark decisions the
user supplies only when the request has left them open; existing choices and
authorization carry forward.

This Markdown diagram and its [HTML view](workbench-flow.html) summarize the
same flow. Update both when the workflow changes. Rationale lives in
[workbench-system](decisions/workbench-system.md).

## Entry & scoping: two optional doors

```mermaid
flowchart TD
    classDef gate fill:#0e7468,stroke:#0a5c52,color:#ffffff
    classDef stage fill:#e6f2f0,stroke:#0e7468,color:#1d2321
    classDef term fill:none,stroke:#8a948f,color:#5d6763

    A0([something to verify, hunt, or check]):::term --> A1
    A1[["SCOPE: use the request; ask if ambiguous:<br/>quick · static review · deep · team sweep"]]:::gate
    A1 --> A2["AUDIT: inline review or the selected engine"]:::stage
    A2 --> A3[["REPORT: preserve evidence and uncertainty<br/>ask only for missing intent or access"]]:::gate
    A3 -->|audit was the ask| A4([report · done]):::term
    A3 -->|"unresolved design"| B2
    A3 -->|"authorized repair; settled design"| I0([continue implementation]):::term
    A3 -->|"confirmed fix; route still open"| RG

    B0([an idea]):::term --> B1["GROUND: inspect the codebase;<br/>ask for unresolved intent"]:::stage
    B1 -->|what the code can't answer| B2["BRAINSTORM for unresolved design;<br/>review the design at meaningful checkpoints"]:::stage
    B2 --> RG[["ROUTE: carry the user's choice;<br/>ask only if unsettled"]]:::gate

    RG --> R1["DIRECT<br/>straight from session context"]:::stage
    RG --> R2["PLAN<br/>mechanism discovered from the user's stack:<br/>plugin skill → repo skill → repo standards → harness plan mode"]:::stage
    RG --> R3["HANDOFF-GOAL<br/>contract dir; fresh session pursues;<br/>same flow, own cadence"]:::stage
```

## Implementation: agency belongs to the user and the harness

During brainstorming, unresolved choices about module ownership, interfaces,
state, or dependencies load Workbench's `codebase-design` before the workset
is defined. The selected design and its constraints travel with the accepted
scope into implementation and review. Bounded work stays bounded; Toolkit is
not required.

```mermaid
flowchart LR
    classDef gate fill:#0e7468,stroke:#0a5c52,color:#ffffff
    classDef stage fill:#e6f2f0,stroke:#0e7468,color:#1d2321
    classDef sat fill:none,stroke:#8a948f,color:#5d6763

    TDD["test-driven-development<br/>default where a harness exists;<br/>repo conventions take precedence"]:::sat -.- I
    SD["systematic-debugging<br/>persistent or unclear failures"]:::sat -.- I

    I["IMPLEMENT<br/>in-session or dispatched: user / harness call;<br/>handed the plan / goal if present"]:::stage
    TR["COMMENT TRIM<br/>trim-comments, dispatched to comment-trimmer;<br/>code comments only; encoding offers wait for the user"]:::stage
    AR["ADVERSARIAL REVIEW ON THE TRIMMED DIFF<br/>code quality; test quality in parallel<br/>when logic or tests changed"]:::stage
    OG[["USER: PR or merge?<br/>session outlines what was done first;<br/>repo / user rules may pre-authorize"]]:::gate
    L["LAND<br/>file-pr · merge · push;<br/>fix-ci: separate CI watcher"]:::stage

    I -->|"deemed ready = verified<br/>(verification-before-completion;<br/>focused empirical-proof for behavior)"| TR
    TR --> AR
    AR -->|"blocking corrections → reviewer verification<br/>automatic follow-ups; not converging → hold"| OG
    OG --> L
    L -.->|"feedback: receiving-code-review;<br/>verified fixes re-enter"| I
```

## Read the owning contract

| Need | Source |
| --- | --- |
| Choose a skill for the task | [Skills handbook](skills/README.md) |
| Understand review timing, proof, and delivery authority | [using-workbench](../plugins/workbench/skills/using-workbench/SKILL.md) |
| Understand why this workflow exists | [Workbench decisions](decisions/workbench-system.md) |
| Understand repository layout and maintenance tools | [Repository map](../README.md#repository-map) |

Broad QA remains user-requested. Focused consumer proof supports behavioral
completion; a blocked check stays incomplete. Independent review runs when the
full agreed change is verified and ready for delivery. Each discipline owns its
blocking findings and follow-ups; unchanged evidence and completed stages stay
valid until a relevant change invalidates them. Explicit declines and
superseding repository rules retain precedence.
