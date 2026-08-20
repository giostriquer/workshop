# handoff-goal

## What it does

This skill packages a goal into a **self-contained goal contract** (a directory holding `goal.md` (the frozen contract) and `plan.md` (the status-tracked route)) that a new session picks up and pursues autonomously, with zero access to the session that wrote it. The contract carries the goal, the definition of done as checks that can be *run*, the operating rules with concrete values, and the integrity apparatus that keeps a pursuing session honest across compactions.

The skill writes the contract. It does **not** pursue the goal. That boundary is stated three times in the spec and is absolute: the last step is "Report the directory path and tell the operator to point a new session at `goal.md`. Do not begin pursuing the goal here."

It has a second mode. Pointed at an existing goal directory (or simply asked to critique one) it does not write a new contract; it audits the existing one against its own bar and tightens it in place, including migrating older contracts that accumulated history into the status-only shape.

## When to reach for it

It activates in two ways. Most often it is one of the three routes at `brainstorming`'s terminal route gate, presented to the user as **Long-running goal** alongside Direct and Plan. It also activates directly when a defined goal (the rest of an in-flight plan, a scoped slice of one, or a concrete new objective) should continue beyond this session, and when an existing contract needs critique.

The hard constraint is **long-running work only**. The goal must outlive this session: many turns of pursuit, waiting, and recovery, not something this session would finish if it simply kept going. Length is not a proxy for importance here, so a well-defined goal that fits in the session at hand is still the wrong fit; a plain task is the right tool.

Before writing anything, the skill runs a **fit check**. A goal handoff pays off when pursuit is a **loop**: "progress needs repeated attempts, waiting, or recovery; done can be measured by checks that can fail; after a failure the pursuer can choose its next move without a fresh preference decision from the operator." When most of that is false (work that fits in one session, one-shot work, taste-driven choices at every step, no credible verifier, unbounded external action) the skill says so and recommends the lighter tool, a plain task in this session. It proceeds anyway only if you insist.

The exclusion worth internalizing: this is not for exploratory handoffs. The skill's own trigger text once listed "a brand-new idea" as a valid goal source, which invited "look into X" handoffs that the fit check already excluded; the description was rescoped so trigger and gate point the same way ([decision](../decisions/handoff-goal-description-scope.md)).

| The problem | The skill |
| --- | --- |
| A stateable outcome, verifiable by checks that can fail, pursued over a long loop by a fresh session | `handoff-goal` |
| Work this session could finish, however well-defined | a plain task; not a contract |
| "Look into X": open-ended research, outcome not stateable yet | a plain task; not a contract |
| A design that carries questions the codebase can't answer | `brainstorming` (its route gate offers this skill) |
| One premise, ticket, or hunch to verify | `claim-check` |
| A finished branch that should become a PR | `file-pr` |
| An existing contract that drifted, bloated, or was written loosely | `handoff-goal` critique mode |

## The contract

Output lands in `tmp/<YYYY-MM-DD>-<goal-slug>/`: today's date and a short kebab-case goal name. **Two files, nothing else**: "the contract ships no ledger, log, or evidence file, and pursuit never creates one."

| File | Frozen or living | Who writes it after handoff | Contents |
| --- | --- | --- | --- |
| `goal.md` | Frozen at handoff | Nobody. The pursuer may not edit it. | Pursuer preamble · Goal · Baseline · Acceptance checks + primary verifier · Integrity rules · Context · Operating rules · When to stop · Activation. Stakes-scaled: Approval gates, Invariants, Non-goals. |
| `plan.md` | Living, but barely | The pursuer: **status flips and checkbox ticks only** | Current state snapshot (written once, by the producing session) · Phases, each with Status / Implementation / Verification / Exit criteria. Optional: Delegation lanes. |

Two rules explain why the contract is shaped this way.

**1. "The contract is the only context that survives."** The pursuing session starts with zero access to the producing session and will compact while it works, so everything it needs lives in the contract, and the contract tells it to keep coming back. Because those files are re-read at every boot and after every compaction, they must stay small, which is enforced mechanically rather than requested politely (see the FAQ on the 450k-character plan).

**2. "The contract is the goal's defense against its own pursuer."** A session pursuing a goal under speed pressure is an optimizer, and an optimizer converges on whatever *looks* done. The contract defines done as checks the pursuer can't fake, forbids the cheap proxies, forces verification the pursuer didn't judge itself, demands evidence before any claim, and names the temptations that mean escalate. The file split makes one defense mechanical: since the pursuer's only writes are statuses in `plan.md`, "the urge to touch `goal.md` *is* the redefinition tripwire firing." And it does not assume the target repo supplies any of this: "many repos mandate no gates, no mutation proofs, no 'don't weaken tests.' The contract carries it."

### The always-on four

Whatever the goal's size, four parts ship in every emitted contract:

- **Verifiable acceptance checks**: done is a checklist the pursuer can *run*, not prose it can interpret.
- **Integrity rules**: the prohibitions that name reward-hacking for what it is.
- **Independent verification**: done is confirmed by a pass the pursuer didn't make itself.
- **The redefinition tripwire**: noticing you're "tempted to change the contract, the checks, or the scope to make done reachable" is a stop-and-ask, not a shortcut.

Three more steps are always on **producer-side** (the fit check, the baseline capture, and the red-team pass) because they "cost this session a moment, not the contract a section."

Everything else scales with stakes: Approval gates when consequential actions are plausible, Delegation lanes when separable lanes exist and subagents are available, an explicit Invariants section, a Non-goals list, a full reviewer-grade independent pass. "A trivial goal carries the four; a high-stakes one carries all of it." Wrapping a one-file utility in a full invariant matrix is a defect in both directions: critique mode audits for fortress-around-trivia as well as for missing sections.

## The steps

| # | Step | What it produces |
| --- | --- | --- |
| 1 | Check fit | Either a contract, or a recommendation to use the lighter tool |
| 2 | Resolve the goal | A confirmed outcome (see below) |
| 3 | Turn done into acceptance checks | Each check carries a command and the evidence that proves it passed; behavior changes carry a **refutation form**: the mutation that should turn it red |
| 4 | Name the primary verifier | The strongest check, on the surface where the outcome actually matters; plus a capability inventory of the pursuing session |
| 5 | Capture baseline and current state **from the repo, not memory** | Baseline frozen in `goal.md`; the state snapshot opens `plan.md` |
| 6 | Gather operating rules, including quality posture | Concrete values, sourced from repo rule files or from you |
| 7 | Size the integrity apparatus | The four, plus whatever the stakes warrant |
| 8 | Assemble the contract | `tmp/<date>-<slug>/goal.md` + `plan.md`, cross-referencing |
| 9 | Red-team the draft | Fixes applied before delivery |
| 10 | Deliver | The directory path, and an instruction to point a fresh session at `goal.md` |

**Where the goal comes from** depends on how you invoked the skill. With no argument, it infers the goal from the session's trajectory and asks you to confirm: "if the session offers no clear candidate, ask outright instead of guessing." With a reference to existing work (a plan, its slices, a spec, a branch), it scopes to exactly that, "reading the referenced material rather than recalling it." With a description of something new, it asks only what's needed to make the goal actionable. With a path to an existing goal directory, it switches to critique mode. Whatever the source, the contract states the goal as "an outcome with a definition of done, not a step list: the pursuing session owns the path and is free to optimize it."

**What you must supply.** Step 6 is the one that needs you. The skill takes what the repo already mandates (`CLAUDE.md` / `AGENTS.md` / convention docs) and what you stated this session, then asks for what's still open: branch or worktree, commit cadence and message style, push policy, PR policy, validation gates, what triggers stop-and-ask, and the quality posture. It records concrete values ("PRs target `develop`, only after all checks pass") and will "never invent a rule the operator didn't state and the repo doesn't mandate," with exactly two exceptions that ship as skill defaults when nobody sets them: the quality posture (reliability over speed) and the commit cadence (commit at every verified checkpoint).

## Common questions

**Why can't the pursuing session write notes, evidence, or command output into `plan.md`?**
Because sanctioned evidence files bloat until they eat the sessions they were meant to steer. This failed twice in the field. First, long-running goals produced `plan.md` files around 40,000 lines, and since the contract tells the pursuer to re-read the plan at every boot and after every compaction, every boot paid the cost of the goal's entire history ([decision](../decisions/handoff-goal-bounded-plan.md)). The fix at the time (bound the entries, archive history to a third file) was then observed failing too: an operator report captured a goal session with a **450,388-character `plan.md`** that the pursuer treated as "the authoritative append-only ledger," spending its entire post-compaction budget reading the file in 40k-character chunks and doing no goal work at all, explicitly refusing to skip to the tail because the plan made that ledger authoritative ([decision](../decisions/handoff-goal-status-only-plan.md)). The conclusion was that any sanctioned evidence recording inflates under pressure, so there is now no evidence file at all and pursuit-side writes are status flips only.

**Then where does the history live?**
Git and session output. "Each verified checkpoint is a commit, and the commit message carries what a note here would have carried." Where a check stands is confirmed by re-running its Verify command, not by consulting a log. The accepted trade-off is explicit: mid-phase, sub-commit state (a failed attempt not worth a commit, a half-decision) no longer survives compaction in files.

**Why does every contract carry a commit rule even when I never asked for one?**
Because a contract silent on commits produced hoarded mega-diffs. Pursuing sessions were accumulating 50,000–70,000-line uncommitted diffs across multi-phase goals: one bad command from losing everything ([decision](../decisions/handoff-goal-commit-discipline.md)). The cause was the contract's own architecture: "never invent a rule" left the Commits slot blank, and inside a gate-heavy document that asks approval before touching anything external, a pursuer reading a blank commit rule concludes git is the operator's decision. So every contract now states that local commits are routine and need no approval, that each green commit is the recovery point a later failure rolls back to, and that uncommitted work is never carried across a phase boundary. Your own stated cadence overrides the default; the default only fills silence.

**Why is `goal.md` off-limits rather than just "don't move the goalposts"?**
To convert a normative rule into a mechanical one. Routine work never has a reason to write `goal.md`, so any impulse to edit it is a signal rather than a judgment call: the tripwire fires, and the correct response is to escalate to the operator, not to edit.

**Does the integrity apparatus actually stop a pursuer from gaming its way to "done"?**
The honest answer recorded in this repo is that it is **design-validated, not behavior-proven**. Three rounds of pressure tests tried to establish the failure and could not: capable pursuers handed a flagrant cheap proxy refused it in both arms; a later round built a real runnable scratch repo with a subtle special-case hack, a hidden test the pursuers never saw, and a weaker pursuer model, and 8 of 8 produced a general, honest fix in both arms. The realistic failure regime the apparatus targets (long-loop momentum, post-compaction drift, a hack that is both cheapest and not obviously wrong) is what a short bounded harness cannot manufacture. Two secondary signals argued for shipping it anyway: contract-carrying pursuers read the tripwire and named it back mid-loop, and on the scope axis they held for sign-off where the control arm expanded scope, one of them committing, pushing, and tagging a release unilaterally with the operator offline ([decision](../decisions/handoff-goal-goal-defense.md)).

**Can the integrity rules over-trigger?**
They did once, and the wording was corrected. Two pursuers treated a legitimate "repoint the test's import at a fixed wrapper" as a forbidden rename-away and escalated instead of applying the fix. The integrity rule now names the actual dodge ("rename/relocate a test so the runner stops collecting it") and states plainly that "pointing the test at the corrected module or a proper new seam is a fix, not a dodge."

**Should the pursuing session dispatch reviewer subagents for every task?**
No, and the contract now says so where the pursuer will re-read it. The earlier "independent pass" wording read as a per-check choice and live sessions over-chose the heavy branch, burning wall-clock and context on work a Verify re-run already covered, while the review that most deserved adversarial weight, the completed phase's cumulative diff, had no slot at all ([decision](../decisions/handoff-goal-review-cadence.md)). The cadence now scales with the size of the landed work: a small routine task's independent pass is a clean re-run of the Verify command; substantial chunks (a feature, a bug fix, a risky refactor) get reviewers after they land; and each phase carries a standing exit criterion for an **adversarial code-quality review of the phase's cumulative diff**, alongside the committed-work criterion.

**What if the primary verifier needs something the pursuing session won't have: a browser, credentials, a device?**
That gap is named in `goal.md` as an explicit blocked item, with the exact manual test and the evidence you must supply: "never silently downgraded to a weaker check." This is why step 4 includes a capability inventory rather than just naming a verifier: unit tests, builds, and inspection are supporting evidence, not substitutes for exercising an interactive outcome on the real surface.

**What happens when the phases turn out to be wrong?**
The pursuer stops and asks you to revise the route. Rewriting the phases is prose editing, which is not a permitted write. Likewise, a failed verification changes no status: the box simply stays unchecked, and repeated failure is a stop condition, not material for a log.

**I have an older contract with a `ledger.md` and an enormous plan. Can it be salvaged?**
Yes. That is critique mode's migration path. It cuts the accumulated history (git and your session already hold it), re-derives each phase's status and checkboxes from the repo and `git log`, and deletes any evidence file, so what remains is exactly the status-tracked route. Critique mode also re-checks the rest of the bar: every acceptance check verifiable, refutations present, primary verifier on the real surface, operating rules concrete and none invented, commit discipline mechanical, review cadence right-sized both ways, the split honored, and the stakes-scaled sections matching actual stakes.

**Does the contract work outside this harness?**
Yes. `goal.md` ends with an Activation note: on a runtime with durable goal support (the skill names Codex `create_goal` as the example) you activate with a compact objective pointing at the two files; elsewhere the pursuing session adopts the contract directly and starts at the `in progress` phase's first unchecked box, or promotes the first `pending` one if none is in progress.

## It's working if

- A fresh session opened on `goal.md` can state the goal, its operating rules, and its first action without asking you anything.
- After handoff, `goal.md` has no diff at all, and `plan.md`'s diffs are status lines and ticked checkboxes: nothing else.
- Each phase closes with a commit whose message names the phase and what was verified, and no phase boundary is crossed with uncommitted work.
- Every acceptance check has a command next to it, and the behavior-changing ones say how to turn them red again.
- When something genuinely blocked the goal, you heard about it: the box stayed unchecked and the question came back to you.

Signs of misapplication:

- `plan.md` growing prose, pasted command output, or a progress narrative. That is the exact failure mode two decision notes were written about; a plan that grows is a plan that will consume the session's boot budget.
- A contract written for "look into X." The fit check should have refused it and recommended a plain task.
- Acceptance checks that read as prose ("the feature works") with no way to run them: the skill calls these proxies the pursuer will game.
- A one-file utility wrapped in Invariants, Non-goals, Approval gates, and Delegation lanes.
- `goal.md` edited during pursuit. Whatever the justification, the tripwire fired and was overridden instead of escalated.

## Where it fits

`handoff-goal` is the third of the three routes the user picks from at the end of `brainstorming`, and the only one that leaves this session entirely. Everything upstream of it (the audit that found the work, the design dialogue, the state captured from the repo) is compressed into the contract; everything downstream happens in a session you are not in, which is why the contract has to carry the discipline rather than assume it. Inside pursuit, the rest of the workbench flow still applies: the pursuer implements under the repo's conventions, verifies with checks that can fail, commits each checkpoint, and runs an adversarial code-quality review at each phase exit. The producing session's job ends at delivery.
