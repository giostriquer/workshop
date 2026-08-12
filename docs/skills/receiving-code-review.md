# receiving-code-review

Technical rigor when review feedback arrives: verify before implementing, ask
before assuming, correctness over comfort. Derived from
[obra/superpowers](https://github.com/obra/superpowers) (MIT, Jesse Vincent);
adapted per [`workbench-system.md`](../decisions/workbench-system.md). Kept on an
explicit operator call — it governs workbench's feedback loop, fed by
`get-pr-comments`' triage.

## Use it

- Trigger: review feedback on landed work — especially when it's unclear or
  technically questionable.
- The pattern: read all of it → restate or ask → verify against the codebase →
  evaluate for *this* stack → respond technically → implement one item at a
  time, testing each.
- Multi-item feedback: clarify **everything** unclear before implementing
  **anything** — items relate.
- Push back with technical reasoning when the reviewer is wrong (external
  reviewers get the skepticism checks; the user's feedback is trusted, scope
  clarified). Wrong pushback gets corrected factually, no apology spiral.
- YAGNI check: "implement properly" suggestions get a grep first — unused means
  "remove it?", not "build it out."

## Don't

- Don't perform agreement — no "You're absolutely right!", no "Great point!",
  no thanks of any kind; state the fix or just fix it.
- Don't implement the understood subset of multi-item feedback first.
- Don't batch fixes without testing each.
- Don't assume the reviewer is right — or wrong; check.
- Don't reply to GitHub inline comments as top-level PR comments — use the
  thread.
