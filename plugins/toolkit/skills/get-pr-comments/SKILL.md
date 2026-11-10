---
name: get-pr-comments
description: Use when feedback on the active pull request still has to be fetched from GitHub and sorted into what it asks you to change. Not for acting on feedback already in hand.
---

# Get PR Comments

## Trigger

Use when the active pull request has feedback that still has to be fetched and sorted. Feedback already in hand needs no fetch: go straight to acting on it.

## Workflow

1. Resolve the active PR for the current branch: `gh pr view --json number,url,headRefName,state`.
2. Fetch the feedback:
   - Conversation comments and review summaries: `gh pr view --json comments,reviews`.
   - Inline review comments on the diff: `gh api --paginate "repos/{owner}/{repo}/pulls/<number>/comments"`, with `<number>` replaced by the PR number from step 1. `gh` fills `{owner}` and `{repo}` itself and no other placeholder: a literal `{number}` returns 404. Consume the full output across all pages.
   - Thread state, which the REST comments do not carry:

     ```sh
     gh api graphql --paginate -F owner='{owner}' -F name='{repo}' -F number=<number> -f query='
     query($owner: String!, $name: String!, $number: Int!, $endCursor: String) {
       repository(owner: $owner, name: $name) {
         pullRequest(number: $number) {
           reviewThreads(first: 100, after: $endCursor) {
             pageInfo { hasNextPage endCursor }
             nodes { isResolved isOutdated comments(first: 100) { totalCount nodes { databaseId } } }
           }
         }
       }
     }'
     ```

     Each `databaseId` is the `id` of one inline comment from the REST fetch. Mark every inline comment `open`, `resolved` or `outdated` from its thread; a comment no thread lists, including the overflow of a thread whose `totalCount` exceeds its returned nodes, is `state unknown`.
   - Check each fetch's exit status before calling retrieval complete. A later page can fail after earlier comments have printed, leaving partial or invalid JSON. If any source fails, summarize usable feedback as partial and name the failed source and error; missing feedback remains unknown.
3. Group the feedback by **severity** (blocking / should-fix / nit) and **actionability** (a clear change requested vs. an open question). Inline comments marked `resolved` or `outdated` form their own group, counted and listed by path; the action list is built from `open` and `state unknown` comments, with the unknown ones labelled.
4. Return a concise action list ordered by priority, plus the questions that still need a human answer.

## Output

- Retrieval coverage: complete, or partial with the failed source and remaining gap.
- Grouped feedback summary (by severity / actionability).
- Closed threads: the resolved and outdated inline comments, counted, outside the action list.
- Action list ordered by priority.
- Open questions that still need clarification.

## Boundaries

- **Do NOT reply to, resolve, react to, or otherwise respond to any PR comment unless the user explicitly asks you to.** This skill *reads and summarizes* feedback. It never posts a reply, resolves a thread, adds a reaction, or comments on the PR on its own. Posting any response requires an explicit, per-action instruction from the user.
- Read-only otherwise: it does not edit code, push, or change PR state. Acting on the feedback is a separate step the user directs.
- If there is no active PR for the branch, or `gh` is unauthenticated, say so plainly rather than guessing.
