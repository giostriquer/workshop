---
name: audit
description: Use when asked to do an audit or check. Not for work that starts from an idea to build (that path grounds against the codebase and goes to brainstorming).
---

# Audit

Asks the user to size the workload first, dispatches the right engine, brings flagged uncertainties back for confirmation, then routes the exit by shape. This is pure protocol and never investigates by itself.

The workbench flow's door A: turn "something to check" into a sized, engine-run,
user-confirmed investigation. This skill is **protocol, not investigation**.
The division of labor is strict: the user sizes it, an engine runs it, the user
confirms what it flagged, and this skill routes what comes out.

## Steps

1. **Ask the user to size the workload**: skip the question only when they
   already stated a size. The three tiers:

   | Tier | Engine | Fits |
   | --- | --- | --- |
   | **quick look** | inline, this session: a few reads/greps, minutes | "is this config even used?", a suspicion worth five minutes |
   | **deep audit** | the `claim-check` skill | one premise investigated to evidence-graded verdict: a bug to pin down, a ticket to validate, "is the refactor complete?" |
   | **team sweep** | the `qa-sweep` skill | a broad, decomposable surface: a release, a feature area, corroborated findings at team scale |

   Ask with a structured question tool (`AskUserQuestion` or the host's
   equivalent) when one is available: one option per tier, the recommended
   tier first and marked; otherwise present the tiers as a numbered list and
   wait for the pick. Recommend a tier with one line of reasoning, but the
   pick is the user's.

   **Runtime modality flag.** The tiers size breadth; this flags *where the
   evidence must come from*. When the thing to check is behavior a real
   client can drive (an endpoint, a flow in the running app, a CLI) code
   reading alone cannot settle it: say so in the recommendation and confirm,
   as part of the same sizing question, whether the check should drive the
   booted app. A confirmed runtime check is part of the workload handed to
   the engine (a team sweep is runtime by construction; for the other tiers,
   pass the confirmation along so the evidence comes from the running
   surface, not reading alone).

2. **Run the engine.** Quick look: investigate inline and keep it genuinely
   quick, if it starts growing past its size, stop and say so; growing the
   workload is the user's call, not drift. Deep audit / team sweep: invoke the
   engine skill and let it run per its own rules (they own their rigor;
   this skill adds none on top).

3. **Collect findings and flag uncertainty.** Separate what the evidence
   settles from what it doesn't: ambiguous reproductions, contested
   assumptions, results that surprised you, anything where two readings
   survive. Those are the **flags**.

4. **Confirm the flags, only when there are flags.** Bring each flagged point
   to the user as a concrete question (what was found, why it's uncertain,
   what reading you lean toward) and wait for their answers. A clean audit with
   findings but no flags skips this pause entirely and goes straight on.

5. **Route the exit:**
   - **The audit was the ask** → deliver the report (verdict-first, per the
     engine's own output shape when one ran) and stop.
   - **Work was revealed, feature/refactor-shaped** → hand into
     `brainstorming` with the findings and confirmed flags as its context; it
     must not re-derive them.
   - **Work was revealed, a confirmed fix** → skip the design debate; present
     the route pick (direct / plan / handoff-goal) directly: asked like the
     sizing question: structured question tool when available, with
     user-facing labels (**Direct**, **Plan**, **Long-running goal**) and the
     recommended route first and marked; a numbered list otherwise.

## Output

- The sized tier and engine that ran, with the runtime modality when it was
  flagged.
- Findings, verdict-first; flagged uncertainties with the user's resolutions.
- The exit taken: report-and-done, handed to brainstorming, or at the route
  gate.

## Boundaries

- **Never investigates by itself** beyond the quick-look tier: deep and sweep
  work belongs to the engines.
- **Never grows the workload silently.** A quick look that wants to become a
  deep audit is a question for the user, not a decision.
- **Never skips the flag confirmation when flags exist**, and never invents the
  pause when they don't.
- **Never starts the revealed work.** Its last act is a hand-off to the
  report, to brainstorming, or to the route gate.
