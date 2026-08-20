# Decision: `file-pr`'s review gate gets a rationalization table

## Context

`file-pr` gained a MUST gate: the branch diff has had a dispatched
`code-quality-review` before the PR is filed. It shipped with two exemptions
and nothing defending them.

`writing-skills` classifies this failure shape directly. An agent that knows
the rule and skips it under pressure is a *discipline* failure, and the form
that works is a prohibition plus a rationalization table plus red flags. Soft
guidance is the wrong form. The gate had the prohibition and neither of the
other two.

The exemptions were the exposed surface. "Trivial, non-code, or
documentation-only" invites a session to classify its own refactor as trivial,
and "the review already ran for this work-stream" invites counting a review
that predates half the commits in the diff.

## Change

**The first exemption is measured, not judged.** "Trivial" is gone. The
exemption is now *the branch changes no code*, measured on the diff rather
than on how routine the work felt. A one-line change to a conditional is code.

**The second exemption is scoped to the diff.** "Already ran for this
work-stream" becomes "already ran on this diff": dispatched, returned, and its
findings acted on. Commits added since the review are unreviewed code.

**A closing sentence forbids the rest.** Not a deadline, not a waiting
reviewer, not a long-open branch, not the user asking for the PR directly. If
the gate cannot be satisfied, the session says so and asks rather than filing
and mentioning it afterward.

**A nine-row rationalization table and a five-item red-flag list** name the
specific reasoning that gets a session past the gate, including the two that
`code-quality-review` already forbids and a session under pressure still
reaches for: an author's own careful reading, and a self-served pass over its
own diff. Both are answered with what that skill states rather than implies.

The spirit-vs-letter line is stated once at the top, which cuts off the class
of "I'm honoring the intent" arguments rather than answering them one at a
time.

## What this is not

This was not pressure-tested. `writing-skills` requires a RED phase, running
the scenario without the guidance and capturing the baseline rationalizations
verbatim, and the table here was written from the exemptions' obvious failure
modes rather than from observed behavior. The rows are hypotheses. A real
baseline run may find that sessions reach for something else entirely, and the
table should be rewritten from what it finds.
