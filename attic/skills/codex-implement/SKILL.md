---
name: codex-implement
description: Use when dispatching implementation tasks to Codex CLI (GPT-5.5) as the coder while this session plans and judges — a written plan or task brief exists and coding labor should be delegated to codex exec. Not for planning, review, or tasks that need conversation with the user.
---

# codex-implement — this session plans and judges, Codex codes

Dispatch coding tasks to Codex CLI (`codex exec`, GPT-5.5) and judge the
results. The orchestrating session never writes the implementation code
itself: it writes briefs, dispatches, verifies firsthand, reviews, and
iterates.

## Prerequisites

- `codex` CLI ≥ 0.141 on PATH, authenticated (`~/.codex/auth.json`).
- Target repo is a git repository; snapshot `git status --porcelain` before
  dispatch so codex's changes are attributable.
- bash (git-bash on Windows). The wrapper is bash-only. Pass `--repo`,
  `--brief`, and `--run-dir` as POSIX-style paths (`/c/Users/...`) — the
  wrapper writes them into meta.json unescaped, so backslash Windows paths
  would produce invalid JSON.

## Dispatch

1. Write a self-contained brief to a temp file (see Brief authoring).
2. Run via the Bash tool with `run_in_background: true` (implementation runs
   can exceed foreground timeouts; the harness notifies on completion):

       bash ~/.claude/skills/codex-implement/codex-task.sh new \
         --repo <repo-dir> --brief <brief-file> \
         [--effort xhigh] [--model <m>] [--add-dir <dir>]... [--run-dir <dir>]

3. On completion, read the stdout summary and run-dir artifacts:
   `events.jsonl` (full event stream), `last-message.md` (codex's final
   message), `meta.json` (session_id, exit_code, wall_seconds, usage),
   `diff-stat.txt` + `status-porcelain.txt` (what actually changed).
4. Record `session_id` — fix rounds resume it.

## Fix rounds

    bash ~/.claude/skills/codex-implement/codex-task.sh resume \
      --repo <repo-dir> --session <uuid> --brief <findings-file> [--effort ...]

Resume caveats (verified on codex 0.141.0): no `--add-dir`; the wrapper cds
into `--repo` because codex resume runs in the invoking cwd, not the thread's
original root. If the `new` dispatch needed `--add-dir`, verify writes still
succeed on resume before relying on it — otherwise start a fresh session with
a full re-brief.

## Brief authoring

Codex starts with zero conversational context. Every brief carries:

- **Goal** — what to build or fix, one paragraph.
- **Repo map** — exact paths to touch, and exact paths to read first for
  conventions and context (spec, plan, style docs).
- **Constraints** — style rules, forbidden patterns, dependency policy, and a
  scope fence ("do not touch anything outside X, Y").
- **Tests** — expected coverage, the exact build/test commands, and an
  instruction to RUN them and iterate until green before returning (codex
  runs unsandboxed by default — operator decision 2026-07-02 — precisely so
  it self-verifies instead of bouncing compiler output through the
  orchestrator's context).
- **Definition of done** — observable criteria; require the final message to
  end with files changed + commands run + their results.

Be explicit about exact file content down to newlines — codex reproduces
literally what the brief specifies and no more.

## Failure handling (non-zero wrapper exit)

A non-zero exit is NOT a fix round — the run may not even be resumable.
Before deciding retry vs fallback, classify the failure from the tail of
`events.jsonl`, `stderr.txt`, and `last-message.md`:

- **auth** (expired/missing subscription auth) → surface to the user; do not
  retry.
- **sandbox denial** (only under `--sandbox workspace-write`: permission
  errors on writes) → re-dispatch as a NEW session with the needed
  `--add-dir`, or switch to the full-access default.
- **model refusal** → rework the brief; new session.
- **crash / transient CLI error** → retry once as a new session; twice → fall
  back to the native implementer.

## Sandbox posture (operator decision 2026-07-02)

The wrapper defaults to `--sandbox danger-full-access`: automated codex runs
execute unsandboxed with approvals off, so codex builds and tests its own
work and returns only finished iterations. The orchestrator still runs ONE
firsthand verification pass plus the host repo's review gates on the final
diff — trust, but verify once.

Why not workspace-write: the unelevated Windows sandbox allows creates and
in-place writes but **denies all deletes/rename-replace**, so cargo (and any
build tool that temp-renames artifacts) fails inside it with "Access is
denied (os error 5)"; no `--add-dir` fixes a delete ban. Calibrated live on
codex 0.141.0. Interactive codex avoids this because `approval_policy =
"on-request"` runs approved commands outside the sandbox.

`--sandbox workspace-write` remains available for untrusted contexts; under
it, codex is a pure code-writer — brief it NOT to run build/test commands,
run them yourself, and feed failures back via resume briefs (this bloats the
orchestrator's context on iterative tasks; that trade-off is why the operator
chose full access).

## Judge loop

After each run: read `last-message.md` AND the real diff (trust git, not the
claims), run the repo's build/tests firsthand, then apply whatever review
process the host repo mandates (for conosterm: the four-stage SDD task gate).
Send findings back as a resume brief quoting each finding exactly.

## Escalation rule (defaults; a host repo's plan may override)

Every fix round — firsthand verification failure OR review-gate finding —
counts toward one per-task budget. Fall back to the host repo's native
implementer path when:

- (a) two consecutive rounds end with a non-compiling diff or failing tests, or
- (b) total fix rounds for the task exceed 4.

A run that "succeeds" with no diff counts toward (b) only; sharpen the brief
and resume. Record the failure mode whenever you fall back.

## Cost defaults

- Real implementation: `--effort xhigh` (or omit; user config default).
- Trivial mechanical edits: `--effort low` or `medium`.
- Observed floor: ~45 s wall per dispatch (startup) at `low`; ~20-65k input
  tokens per trivial run. Budget accordingly for judging round-trips.

## Beyond implementation

- **Taste caveat:** GPT-5.5's taste (UI/UX, copy, API design) trails its
  engineering. For user-facing surfaces either keep a native implementer or
  expect taste findings at review — plan a Fable/Opus design pass.
- **Read-only investigation:** for token-hungry analysis (long files, logs,
  data crunching) that would bloat the orchestrator's context, dispatch the
  wrapper with `--sandbox read-only` and a self-contained question brief;
  consume only `last-message.md`.
- **Inside Agent/Workflow fan-outs** (the model parameter only takes Claude
  models): spawn a thin Claude wrapper agent (`model: opus`, `effort: high`
  or `xhigh` — Sonnet and Haiku are banned outright per the operator's model
  rules) whose prompt says to write a self-contained codex brief, run
  `codex-task.sh` via Bash, and return codex's final message verbatim. The
  courier agent must not editorialize or re-review.
- See also `~/.claude/rules/model-selection.md` for the cross-model routing
  rubric (cost/intelligence/taste).
- **For a SET of work** (multiple units, a feature campaign): the
  `orchestrate` skill carries the campaign doctrine — decomposition, state
  tracking, per-unit judging, re-planning, and whole-of-work completion.
  This skill stays the per-dispatch mechanics layer underneath it.
