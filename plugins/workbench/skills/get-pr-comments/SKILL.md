---
name: get-pr-comments
description: Fetch and summarize review comments from the active pull request. Use when you need a concise, actionable summary of feedback on the active PR.
---

# Get PR Comments

## Trigger

Use when you need a concise, actionable summary of feedback on the active pull request.

## Workflow

1. Resolve the active PR for the current branch: `gh pr view --json number,url,headRefName,state`.
2. Fetch the feedback:
   - Conversation comments and review summaries: `gh pr view --json comments,reviews`.
   - Inline review comments on the diff: `gh api repos/{owner}/{repo}/pulls/{number}/comments`.
3. Group the feedback by **severity** (blocking / should-fix / nit) and **actionability** (a clear change requested vs. an open question).
4. Return a concise action list ordered by priority, plus the questions that still need a human answer.

## Output

- Grouped feedback summary (by severity / actionability).
- Action list ordered by priority.
- Open questions that still need clarification.

## Boundaries

- **Do NOT reply to, resolve, react to, or otherwise respond to any PR comment unless the user explicitly asks you to.** This skill *reads and summarizes* feedback — it never posts a reply, resolves a thread, adds a reaction, or comments on the PR on its own. Posting any response requires an explicit, per-action instruction from the user.
- Read-only otherwise: it does not edit code, push, or change PR state. Acting on the feedback is a separate step the user directs.
- If there is no active PR for the branch, or `gh` is unauthenticated, say so plainly rather than guessing.
