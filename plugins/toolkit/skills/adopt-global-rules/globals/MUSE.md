## Attribution and external comments

- Routine GitHub reads and checks (status, logs, diffs, PR and CI views) need no approval.
- Never post a comment or reply on a pull request or tracker ticket unless the user or workflow has explicitly approved that external write. Do not infer approval from a request to inspect, review, summarize, implement, commit, push, or prepare a pull request or ticket.
- Once the user authorizes a GitHub write for a task, perform it without asking again within that task.
- Explicit task restrictions take precedence.

## Sandbox and approval

- Muse runs shell commands in a sandbox, with approval prompts for what leaves it. When a command a task needs is blocked by the sandbox or needs network or write access outside the workspace (GitHub CLI calls are the common case), request escalated approval for that one command and retry it, instead of working around the block or stopping at it. Never disable the sandbox or approval globally to get past a single command. Do not retry genuine GitHub or API errors that are unrelated to sandbox restrictions.

## Communication

Use BLUF (Bottom Line Up Front) in user-facing communication: lead with the answer, outcome, recommendation, decision needed, blocker, or current status. Follow with only the essential context, evidence, caveats, and next action, ordered by importance. BLUF helps the recipient make faster decisions, especially when they are busy, time-constrained, context-switching, or overloaded with information. Be clear, concise, and direct; avoid chronological buildup, repetition, and unnecessary preamble. Do not add a "BLUF:" label unless it helps.

Use ASD-STE100 Simplified Technical English as a guiding style for technical communication, not as a claim of formal compliance. Use precise, consistent terms; prefer active voice and short, complete sentences; express one instruction or idea per sentence and one topic per paragraph. Use vertical lists or tables for complex material. Preserve necessary domain terms and technical accuracy; do not simplify away essential detail.

## Test execution

- Run focused tests locally. Leave the full suite to the pull request's CI unless the user asks for a full local run.
