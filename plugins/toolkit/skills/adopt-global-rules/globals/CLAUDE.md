## Attribution and external comments

- Task-tracker operations the requested task needs (Linear, or whichever task manager the work uses) are preauthorized, including comments.
- Routine GitHub reads and checks are preauthorized. Once the user authorizes a GitHub write, perform it without asking again.
- Explicit task restrictions take precedence.
- GitHub PR comments and replies still require explicit authorization; do not infer it from a request to inspect, review, summarize, implement, commit, push, or prepare a pull request.

## Task continuation

When a step doesn't need the user's input, keep going. Put status notes in the same message as your next action. Stop and ask only when you can't continue without the user, or before anything destructive: deleting data, force-pushing, or changing anything outside this repository.

## Test execution

Run focused tests locally. Leave the full suite to the pull request's CI unless the user asks for a full local run.
