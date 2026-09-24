---
name: trim-comments
description: Use when the user asks to trim comments or comment slop from the current branch diff before review, such as narration, banners, commented-out code, or comments the change made stale. Not a repo-wide cleanup, not for code-level cleanup, and not a substitute for the review gate. User-invoked only.
disable-model-invocation: true
---

# Trim Comments

Trim comment slop from the current branch diff before review. Edit comments
only; preserve behavior absolutely.

## Checklist

1. Scope the pass to `git diff` against the default branch (`origin/main`, or
   whatever `origin/HEAD` names), or the branch's merge base with it when it
   differs. Touch only comments on lines the diff adds or changes, plus any
   comment the diff made wrong. Never run a repo-wide cleanup.
2. Read the repository's comment rules first (`AGENTS.md`, `CLAUDE.md`,
   `CONTRIBUTING`, or their equivalents). Where they say which comments to
   remove or keep, they win over the lists below.
3. In every changed hunk, remove these comments:
   - narration and prose that restates the code;
   - syntax explanation;
   - banners and section dividers;
   - commented-out code;
   - a comment the diff made wrong;
   - a workaround sermon: a long justification with no external constraint
     behind it. Remove it, and name the code it excused in the report for the
     author to reshape.
4. Keep these comments:
   - license and copyright headers;
   - a comment explaining non-obvious behavior forced by something outside the
     repository's control: a dependency, platform, vendor, or protocol;
   - doc comments that define a public API contract;
   - issue or RFC links that explain a constraint the code can't express;
   - formatter and tool directives, such as `prettier-ignore`.

   A comment on neither list stays.
5. Handle constraint comments and suppressions as below.
6. Make no functional edits. Change only comments; leave defensive checks,
   `try`/`catch`, casts, helpers, fallbacks and style to the review. If removing
   a comment could change behavior (a tool reads it), leave it. Before
   reporting, confirm your edits delete or change comment lines only.
7. Report the result in 1 to 3 sentences of plain prose, one sentence per
   part, in this order: what changed; each item left for the author, in a few
   words; and, when an encoding offer is waiting, the offer as a question. For
   example: "Removed four narrating comments, a banner and a commented-out
   retry in `src/session.ts`. Left for you: a `@ts-expect-error` in
   `refreshToken` hiding a possible `null` (narrow it first), and the polling
   loop in `fetchProfile` whose defending comment I removed. Should a test pin
   the `LOGIN_FAILED` message so its `do not change this wording` comment can
   go?"

## Constraint comments

A comment such as `do not remove`, `do not change this wording`, or `talk to X
before changing` states a constraint. Never delete it silently, however much
it reads like slop. Offer the cheapest in-scope encoding (a type, a runtime
check, a test, or a lint rule), finish the rest of the pass, and wait for the
user's approval. If approved, encode it, then delete the comment. Otherwise
leave the comment and report the constraint as open.

## Suppressions

For each `eslint-disable`, `@ts-ignore`, `@ts-expect-error`, `# noqa`,
`# type: ignore`, `#[allow(...)]` or similar in the diff, look up the rule it
silences. When the rule protects correctness or safety, leave the suppression
in place and report it with the fix the rule asks for; never delete it or keep
it silently. Keep a suppression of a style-only rule.

## Before the review gate, never instead of it

Run trim-comments before the repository's review gate (when workbench is
installed, before `code-quality-review`), never instead of it. The review gate
remains the required correctness and safety review.
