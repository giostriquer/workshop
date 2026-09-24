# test-audit

## What it does

`test-audit`, in the optional `toolkit` plugin, holds tests to one value bar: a
test earns its maintenance cost by protecting behavior, a credible regression,
or an independently meaningful contract. It works in three modes:

| Mode | What it does |
| --- | --- |
| Authoring gate | Before a new or changed test lands, asks what it protects, what regression makes it fail, why existing coverage misses that, and whether it needs a production seam no real caller uses. Then checks it against the junk patterns. |
| Audit | Sweeps existing tests, read-only, for ones that re-assert source, duplicate stronger proof, couple behavior to implementation, or keep test-only exports alive. Records the evidence for each candidate before any edit. |
| Campaign | Prunes one subsystem's whole test surface (a plugin such as `plugins/chat`, or one core area) in one PR: baseline, lanes, a per-test ledger, a layer plan, cutover, a preservation review with mutations, product defects, and reconciliation. |

It is **user-invoked only** (`disable-model-invocation: true`, plus
`allow_implicit_invocation: false` for Codex). Invoke `/test-audit`, or
`$test-audit` in Codex, with the test or scope and what you want from it:

- "Gate this test before I add it: it spies on the tax helper to prove
  discounts apply first."
- "Audit `tests/checkout/` for junk and tell me what can go."
- "Run a pruning campaign over `plugins/chat`'s tests."

## When to reach for it

When the question is whether a test is worth keeping, not whether the tests are
strong enough.

| The problem | The skill |
| --- | --- |
| Is this test I'm about to add worth landing, and at which boundary? | `test-audit`, authoring gate |
| Which existing tests in this area are junk, and what can go with them? | `test-audit`, audit |
| A subsystem's test surface has outgrown its value | `test-audit`, campaign |
| A finished diff changes logic or tests, and the completion review is due | [test-quality-review](test-quality-review.md) (workbench) |
| Do these tests catch regressions? Which mutants survive? | [test-quality-review](test-quality-review.md) (workbench) |
| Writing the tests in the first place | [test-driven-development](test-driven-development.md) (workbench) |

The line with `test-quality-review`: that skill is workbench's default-on gate
over a finished diff. A reviewer that did not write the tests looks for weak
assertions, missing cases and surviving mutants, and never edits. `test-audit`
runs only when you ask. It judges whether tests earn their cost, and after
recording its evidence it removes, consolidates or moves them at their owner
boundary. One asks "is this diff's testing strong enough?", the other "which
of these tests should exist?".

## Common questions

**Will it delete tests as soon as it finds junk?**
No. Discovery stays read-only, and every candidate needs recorded evidence
before an edit: the test's name and location, what failure it can actually
detect, the non-test callers of the seam it covers, the stronger proof that
remains, its history, what deletion it unlocks, and the risk with a focused
validation command. A missing field means the candidate is not ready.

**What counts as junk?**
Tests with no assertions, self-comparisons, copied inventories, exact source or
string greps, duplicate invocations of one contract, mocks that implement the
behavior being asserted, expected values produced by the code under test,
negative controls that pass for an unrelated reason, and names that promise
more than the test exercises. It also counts tests whose only purpose is keeping
a test-only export or wrapper alive.

**It kept a test that looks like implementation detail.**
The retention bar keeps a test that independently enforces a public API,
protocol, config, storage, security or similar contract. It also keeps call
order when the order is observable, a regression with a credible failure mode,
and a source check when that is the cheapest guard that survives an
identifier-only rename. Static or slow is not a deletion reason.

**A test it meant to keep fails on the baseline.**
It treats that as a possible product bug: reproduce it and repair the owner,
rather than deleting the test.

**Which commands does it run?**
Your repository's own: the focused test command for the owner and sibling
tests, the script or dry-run that owns a removed source check's real contract,
targeted formatting, `git diff --check`, your changed-files gate, and
`git diff --numstat` with production and test lines reported apart. It never
edits source or tests while the test runner is running in the checkout.

**Does it commit or open the PR?**
Only when you authorize it, through your repository's review and PR process, one
coherent PR at a time. With workbench installed, `file-pr` files it.

**Does it need workbench?**
No. It runs on its own; the workbench skills above are neighbours, not
dependencies.

## It's working if

- Every removed test has a candidate evidence record that names the stronger
  proof left behind, or why the test protected nothing.
- The report lists retained false positives and why each stays.
- Production and test line counts are reported separately, and test-only
  exports or wrappers went with the tests that kept them alive.
- In authoring mode, a rejected test comes back with the boundary it belongs
  at, not only a "no".
- Negative signal: edits before the evidence, replacement tests that restate
  the implementation, deletion count treated as the goal, or a regression test
  removed with nothing else guarding its bug.

## Where it fits

Outside the workbench gates, on your ask. When workbench is installed,
`test-driven-development` writes tests, `test-audit` judges whether a test or a
suite earns its place, `test-quality-review` checks a finished diff's tests at
completion, and `file-pr` lands the result.
