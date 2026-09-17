# Writing Good Tests

**Load this reference when:** writing or changing tests, adding mocks, or
adding cleanup/helper methods for tests.

## Overview

A test exists to catch a specific break. Two principles govern everything
here:

```
1. Every test names the break it catches
2. Every test exercises the real thing
```

Strict TDD produces both naturally: a test written first and watched
failing against real code has already proven it can fail, and only earns
a mock when the real dependency proves slow or external.

## Principle 1: Name the Break

Before writing the test body, answer: **what production change should
make this test fail, and is that change a bug or a decision?** A test
earns its place by catching a wrong branch, missing side effect, wrong
argument, boundary case, or broken contract.

**Derive expectations independently.** Use literals and hand-checked
fixtures; table-driven tests with literal `want` values are the preferred
shape. An expectation computed by the code under test (or its helpers)
passes no matter what that code does:

```typescript
// ❌ Mirror assertion: the same builder computes both sides, always true
const expected = buildSearchQuery({ tag: 'urgent' });
expect(buildSearchQuery({ tag: 'urgent' })).toBe(expected);

// ✅ Hand-derived literal
expect(buildSearchQuery({ tag: 'urgent' })).toBe('tag:"urgent"');
```

**No change detectors.** A test that can fail only on intentional decisions,
such as a constant's value, exact message wording, or private structure, fires
on redesign and sleeps through bugs. Test the behavior that depends on the
decision. Instead of `expect(MAX_RETRIES).toBe(5)`, assert that "a failing call
is retried 5 times and the 6th attempt never happens."

**Behavior, not text.** Asserting that a script, skill, or config
contains an exact line proves only that the source is the source. Run
scripts against controlled inputs and assert outputs, side effects, or
exit codes. Documents that instruct agents are tested by the consuming
agent's behavior; prose for humans earns no test at all.

**Your code, not the framework.** Test the contract your code makes at
its boundaries: the route you register, the query you emit, the payload
you produce. Upstream mechanics are their maintainers' tests to write
(the classic: asserting your router invokes a registered handler; that
is the framework's test, not yours). When upstream behavior genuinely
surprised you, write one narrow characterization test naming the
assumption. The same boundary applies inside your code: constructors,
getters, constants, and trivial forwarding earn tests only when they
validate, normalize, default, derive, enforce, or cause side effects;
otherwise, assert the first consumer-visible result that depends on them.

### Gate Function

```
BEFORE writing the test body:
  Name the production change that would make this test fail.

  Cannot name one            → redesign around an observable behavior
  "The source text changed"  → run the artifact and assert its effects
  Only intentional decisions → change detector; test the behavior
                               that depends on the decision

  Confirm the expected value is derived without the code under test.
  IF it reuses the code's logic or helpers:
    Replace it with a literal or hand-checked fixture
```

## Principle 2: Exercise the Real Thing

**Assert the contract, not mere mock presence.** An assertion that a mock exists
says nothing about the component. Assert real behavior; when calls, arguments,
or ordering are themselves part of the boundary contract, assert those on the
double as described below. Otherwise unmock the component or remove the assertion.

```typescript
// ✅ Real behavior
expect(screen.getByRole('navigation')).toBeInTheDocument();

// ❌ Mock existence
expect(screen.getByTestId('sidebar-mock')).toBeInTheDocument();
```

**the user's correction:** "Are we testing the behavior of a
mock?"

**Mock at the right level.** Learn every side effect of the real method
before replacing it; mock the slow or external operation and keep what
the test depends on real. When unsure, run the test against the real
implementation first and observe what actually needs to happen.

```typescript
// ❌ The mock swallows the config write that duplicate detection reads
vi.mock('ToolCatalog', () => ({
  discoverAndCacheTools: vi.fn().mockResolvedValue(undefined)
}));

// ✅ Mock only the slow server startup; the config write stays real
vi.mock('MCPServerManager');
```

**Make doubles specific.** When arguments, call counts, or ordering are
part of the contract, assert them: a fake that accepts anything verifies
nothing. Give each branch (success, error, malformed) its own fixture or
spy, so the wrong branch cannot satisfy the expectation.

**Model realistic data for the exercised contract.** Include required fields
and fields consumed by the real downstream path. Use typed or schema-checked
fixtures when available. Do not invent every optional field; missing fields
should be deliberate cases rather than accidental omissions.

**Production classes carry production responsibilities.** Test-only cleanup
belongs in test utilities. A resource owner may legitimately expose `destroy()`
or disposal even when current callers are tests. Ask: is this method called only from tests? Does this
class own this resource's lifecycle? Wrong answers → test utility.

**Prefer real components over complex mocks.** When mock setup outgrows
the test logic, mocks miss methods the real components have, or tests
break when the mock changes, switch to an integration test with real
components. **the user's question:** "Do we need to be using a
mock here?"

### Gate Function

```
BEFORE adding a mock or test helper:
  List the real method's side effects; keep the ones the test
  depends on real: mock the slow/external level below them.

  Mock responses model required fields and the exercised downstream contract.

  A method only tests call belongs in test utilities unless it implements a real production responsibility, such as resource disposal.

  About to assert on the mock itself?
    If it checks mere mock presence, unmock it or remove it; retain contractual interaction assertions.
```

## Choose the Test Shape

Before writing the failing test, pick its shape from the behavior:

| The behavior | Test shape |
|---|---|
| Crosses your own modules: a service and its store, a handler and its validator, a reducer and its selectors | **Integration test** through the public entry point, with the real collaborators in process: in-memory or local implementations, a temp directory, the real schema. Double only what cannot run locally (third-party network APIs, paid services) or what the test must control (clock, randomness). |
| Pure logic with many cases: parsing, arithmetic, rule tables | **Unit test**, table-driven with literal expectations. |
| True for every input in a domain: round trips (`parse(format(x))` returns `x`), idempotence, ordering, totals that must balance, "never throws on valid input" | **Property-based test** over generated inputs, next to one literal example. |
| Stateful and driven by sequences of operations: caches, queues, stores, state machines | **Model-based test**: generated command sequences run against the real component and a simple model, compared after each command. |
| A critical user journey whose failure blocks a release | **E2E test**, for those few journeys only; it runs in a slower pipeline stage, not the per-change loop. |

Most application behavior crosses modules, so most of a suite is integration
tests. A unit test proves one piece works, not that the pieces work together;
it does not replace the integration test for a behavior.

```typescript
// ❌ Doubles the store the rule depends on: passes even if the real store lets duplicates in
const members = { findByHandle: vi.fn().mockResolvedValue(undefined), insert: vi.fn() };
await joinTeam(members, { handle: 'ada' });
expect(members.insert).toHaveBeenCalled();

// ✅ Real in-memory store: lookup, insert, and the duplicate rule run together
const members = createInMemoryMemberStore();
await joinTeam(members, { handle: 'ada' });
await expect(joinTeam(members, { handle: 'ada' })).rejects.toThrow(DuplicateHandle);
```

In TypeScript, property-based and model-based tests use `fast-check`:
`fc.assert(fc.property(...))` for properties, and `fc.commands` with
`fc.modelRun` or `fc.asyncModelRun` for models. Effect 3.10 and later 3.x
releases re-export it (`import { FastCheck, Arbitrary } from "effect"`) and
derive generators from schemas with `Arbitrary.make(schema)`; in those
codebases, use the re-export. Other ecosystems have their own (Hypothesis, proptest, jqwik). If the
project has no property-testing library, adding one is a dependency decision:
propose it instead of installing it.

## Tests Ship With the Implementation

The TDD cycle (failing test, minimal implementation, refactor) is what
"complete" means. Ship the tests the behavior needs and only those:
trivial code and human prose earn none, and a test written to satisfy
process costs maintenance forever.

## The Mutation Check

Before finishing, mentally mutate the production code; at least one test
should fail for each realistic mutation:

- Wrong constant or argument
- Wrong branch handler
- Missing state change or side effect
- Empty or default return
- Missing validation for zero, empty, nil, unauthorized, or malformed input

A mutation nothing catches marks the behavior as unprotected, or the
test as tautological. When the project supports a mutation-testing tool
(StrykerJS for JavaScript and TypeScript), the test-quality review runs this
check for real over the changed code; do not install one to satisfy it.

## Quick Reference

| When you... | Do |
|-------------|-----|
| Write any test | Name the break it catches: a bug, not a decision |
| Test a behavior that crosses your modules | Integration test with the real collaborators in process |
| Find an invariant or an operation sequence | Property-based or model-based test |
| Build an expected value | Derive it by hand; never with the code under test |
| Test a script or document | Run it / pressure-test its consumer; never grep its text |
| Reach for a dependency test | Test your boundary contract, not their documented mechanics |
| Want to assert on a mocked element | Test observable behavior or an actual interaction contract; do not prove only the mock's setup |
| Are about to mock a method | Learn its side effects; mock the slow/external level |
| Build a mock response | Model the required and exercised contract |
| Need cleanup only tests use | Put test-only scaffolding in test utilities; preserve legitimate resource-owner disposal APIs |
| Watch mock setup balloon | Switch to an integration test with real components |
| Finish a test file | Run the mutation check |

## Warning Signs

- Setup and assertion share the same object, guaranteeing equality
- The test can fail only through a panic, crash, or missing selector
- The test fails on every intentional change, never on accidental breakage
- Expected values are hidden behind loops, builders, or helpers
- The test greps source text, or asserts a removed symbol stays removed
- The test would still matter if only the framework remained
- The test exists for coverage, checking no side effect or outcome
- An assertion checks a `*-mock` test ID, or fails if you remove the mock
- A method is called only from test files
- Mock setup is more than half the test, or you can't explain why the mock is needed
- Mocking "just to be safe"
- A behavior that spans modules is tested only with its collaborators doubled
