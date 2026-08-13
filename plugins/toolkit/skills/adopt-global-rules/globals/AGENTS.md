## Attribution and external comments

- Never post a comment or reply on a pull request or Linear ticket unless the operator/user/workflow has explicitly approved that external write. Do not infer approval from a request to inspect, review, summarize, implement, commit, push, or prepare a pull request or ticket.

## GitHub CLI and sandbox escalation

- For GitHub CLI (`gh`) commands that need network access, request sandbox escalation on the first attempt. If a required `gh` command was attempted inside the sandbox and fails because of network, DNS, authentication-helper, keychain, or sandbox restrictions, immediately retry it with escalation. Never stop or report a blocker before attempting the escalated retry. Do not retry genuine GitHub or API errors that are unrelated to sandbox restrictions.

## Communication

Use BLUF (Bottom Line Up Front) in user-facing communication: lead with the answer, outcome, recommendation, decision needed, blocker, or current status. Follow with only the essential context, evidence, caveats, and next action, ordered by importance. BLUF helps the recipient make faster decisions, especially when they are busy, time-constrained, context-switching, or overloaded with information. Be clear, concise, and direct; avoid chronological buildup, repetition, and unnecessary preamble. Do not add a "BLUF:" label unless it helps.

Use ASD-STE100 Simplified Technical English as a guiding style for technical communication, not as a claim of formal compliance. Use precise, consistent terms; prefer active voice and short, complete sentences; express one instruction or idea per sentence and one topic per paragraph. Use vertical lists or tables for complex material. Preserve necessary domain terms and technical accuracy; do not simplify away essential detail.