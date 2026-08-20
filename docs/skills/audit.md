# audit

## What it does

`audit` turns "something to check" into a sized, engine-run, user-confirmed
investigation. You bring a bug to identify, a refactor to confirm complete, a
premise to test. It asks you how big the job is, dispatches the engine that
matches your answer, brings back anything the evidence left uncertain, and
routes what comes out.

It is protocol, not investigation. The skill states the division of labor
directly: "the user sizes it, an engine runs it, the user confirms what it
flagged, and this skill routes what comes out." The only work `audit` does with
its own hands is the smallest tier: a quick look, a few reads and greps. Deep
and broad work belongs to `claim-check` and `qa-sweep`, and `audit` "adds none"
of its own rigor on top of theirs.

It does not fix anything. Its last act is a hand-off: "**Never starts the
revealed work.**" If the investigation surfaces a bug, you end up either with a
report, or in `brainstorming`, or at the route gate, never mid-repair.

## When to reach for it

Type `/audit`, or ask for one in words: "audit X", "check whether ...". The
trigger fires on the ask itself. A session following the workbench flow will
also reach for it on its own when the work starts from something to verify
rather than something to build.

It fits when you have a claim, a suspicion, or a deliverable whose state you
distrust. It does not fit when you already know what you want built; that path
grounds the idea against the codebase and goes to `brainstorming`.

| The problem | The skill |
| --- | --- |
| Something to verify, hunt, or check, and you don't know how big it is | `audit` |
| One premise investigated to an evidence-graded verdict | `claim-check` (audit's deep-audit engine) |
| A broad, decomposable surface at team scale | `qa-sweep` (audit's team-sweep engine) |
| Proving one just-finished change actually works | `empirical-proof` |
| An idea to build | `brainstorming` |
| A bug you are already fixing | `systematic-debugging` |

## The protocol

**Step 1: the user sizes the workload.** The question is skipped only when you
already stated a size. Three tiers:

| Tier | Engine | Fits |
| --- | --- | --- |
| **quick look** | inline, this session: a few reads/greps, minutes | "is this config even used?", a suspicion worth five minutes |
| **deep audit** | the `claim-check` skill | one premise investigated to evidence-graded verdict: a bug to pin down, a ticket to validate, "is the refactor complete?" |
| **team sweep** | the `qa-sweep` skill | a broad, decomposable surface: a release, a feature area, corroborated findings at team scale |

The ask has mechanics: a structured question tool (`AskUserQuestion` or the
host's equivalent) when one is available, one option per tier, the recommended
tier first and marked; a numbered list otherwise. The session recommends with
one line of reasoning, "but the pick is the user's."

**The runtime modality flag.** Riding on the same question is a second axis:
where the evidence must come from. "When the thing to check is behavior a real
client can drive (an endpoint, a flow in the running app, a CLI) code reading
alone cannot settle it." The recommendation says so, and the same sizing
question confirms whether the check should drive the booted app. A confirmed
runtime check travels to the engine as part of the workload. A team sweep is
runtime by construction.

**Step 2: run the engine.** A quick look stays quick: "if it starts growing
past its size, stop and say so; growing the workload is the user's call, not
drift." Deep and sweep tiers invoke their engine skill and let it run by its
own rules.

**Step 3: collect findings and flag uncertainty.** Separate what the evidence
settles from what it doesn't. Ambiguous reproductions, contested assumptions,
surprising results, anything where two readings survive; those are the flags.

**Step 4: confirm the flags, only when there are flags.** Each flagged point
comes back as a concrete question: what was found, why it's uncertain, which
reading the session leans toward. "A clean audit (findings but no flags)
skips this pause entirely and goes straight on."

**Step 5: route the exit.** Three shapes:

| What came out | Where it goes |
| --- | --- |
| The audit was the ask | Deliver the report, verdict-first, and stop |
| Work revealed, feature- or refactor-shaped | Hand into `brainstorming` with findings and confirmed flags as context: "it must not re-derive them" |
| Work revealed, a confirmed fix | Skip the design debate; present the route pick directly: **Direct**, **Plan**, **Long-running goal** |

## Common questions

**Why is it asking me to size something before it even looks?**

Because the size determines which engine runs, and the engines differ by an
order of magnitude in cost. The sizing question is one of the three user gates
in the workbench flow: the one `audit` owns. If you already said "just take a
quick look," the question is skipped.

**I asked it to check whether a feature works and it only read code.**

That was a real gap. Sizing is a breadth axis and says nothing about where
evidence comes from, so a runtime-demanding request sized as a quick look
silently became greps, and a deep audit could satisfy `claim-check`'s evidence
ladder with an in-process repro that never touched the running app. The
runtime-modality flag now rides on the sizing question so the case gets named
and confirmed up front
([decision](../decisions/audit-sizing-ask-and-runtime-modality.md)). The shape
that exposed it ("check whether existing behavior X actually works") is
single-surface, runtime-demanding, too narrow for `qa-sweep`, and out of scope
for `empirical-proof`, which covers just-finished changes only.

**The quick look is turning into a real investigation. What now?**

It stops and tells you. "**Never grows the workload silently.** A quick look
that wants to become a deep audit is a question for the user, not a decision."

**It didn't pause to confirm anything. Did it skip a step?**

Probably not. The confirmation pause exists only for flags. A clean audit with
findings settled by the evidence and nothing ambiguous goes straight to the exit.
The rule cuts both ways: it "never skips the flag confirmation when flags
exist, and never invents the pause when they don't."

**Does `audit` make `claim-check` or `qa-sweep` stricter?**

No. The engines own their rigor. `audit` sizes, dispatches, relays the runtime
modality as scope, and handles the exchanges around the run. When the runtime
flag was added, the engines were deliberately left untouched: the confirmation
reaches `claim-check` as investigation context, not as new skill text.

**It found the bug. Will it fix it?**

No. A confirmed fix goes to the route gate and waits for your pick; anything
feature- or refactor-shaped goes to `brainstorming` carrying the findings. Both
exits are hand-offs.

**Where does the evidence end up?**

In one folder for the whole work scope (`.workbench/<work_scope>/`) including
whatever dispatched agents produce. This was a field failure: an audit run left
its evidence spread across three per-agent system-temp directories although it
all belonged to one scope. The dispatching session now hands the scope folder's
path to every agent in its contract
([decision](../decisions/evidence-one-home-per-scope.md)).

**How battle-tested is this one?**

Less than its neighbors. `audit` is native to workbench rather than ported, and
the record that introduced it calls it "workbench's one unproven piece: born
from the flow whiteboard rather than lived use," flagged as such in the
provenance manifest with tuning expected after real runs
([decision](../decisions/workbench-system.md)). Two rounds of tuning have
landed since: the structured sizing ask and the runtime-modality flag. Treat
its engines as the proven part.

## It's working if

- You got an explicit sizing question with three tiers, a marked
  recommendation, and no investigation started before you answered.
- When the target was running-app behavior, the same question asked whether to
  drive the booted app.
- Uncertain findings came back as concrete questions, each naming what was
  found and which reading the session leans toward.
- The report leads with the verdict.
- The session's last move was a hand-off: report, `brainstorming`, or the
  route pick.
- Negative signal: it starts a deep investigation without asking, or it starts
  fixing what it found. Either means the protocol was skipped, not applied.

## Where it fits

`audit` is door A of the workbench flow: one of the two optional entry points,
the one for work that starts from something to verify rather than something to
build. It sits before scoping and dispatches sideways into `claim-check` or
`qa-sweep` for the actual investigation. Its exits feed the next stage:
`brainstorming` when the revealed work needs design, the route gate when the
fix is already confirmed, or nothing at all when the report was the deliverable.
Nothing hands off to `audit`; it is where the session begins.
