#!/usr/bin/env bash
# codex-task.sh — dispatch an implementation task to Codex CLI (codex exec)
# and capture run artifacts for an orchestrating Claude Code session.
#
# Verified against codex-cli 0.141.0 on Windows git-bash (2026-07-02):
#   - session id arrives as {"type":"thread.started","thread_id":"<uuid>"}
#     (same id re-fires on resume)
#   - `codex exec resume` has no -s/-C/--add-dir flags; sandbox comes from
#     -c sandbox_mode=..., and it runs in the INVOKING cwd, not the thread's
#     original root — hence the cd into --repo below.
#   - --profile is unusable while ~/.codex/config.toml has legacy
#     [profiles.*] tables; explicit flags only.
set -euo pipefail

usage() {
  cat >&2 <<'EOF'
usage:
  codex-task.sh new    --repo <dir> --brief <file> [options]
  codex-task.sh resume --repo <dir> --session <uuid> --brief <file> [options]
options:
  --effort <low|medium|high|xhigh>  reasoning effort (default: user config)
  --model <name>                    model override (default: user config)
  --sandbox <mode>                  danger-full-access (default; operator
                                    decision 2026-07-02 so codex can run
                                    builds/tests itself) or workspace-write
                                    (codex becomes a pure code-writer: the
                                    Windows sandbox denies deletes, so cargo
                                    fails inside it)
  --add-dir <dir>                   extra writable dir (new mode only; repeatable)
  --run-dir <dir>                   artifact dir (default: mktemp)
EOF
  exit 2
}

MODE="${1:-}"
{ [ "$MODE" = new ] || [ "$MODE" = resume ]; } || usage
shift

REPO="" BRIEF="" SESSION="" EFFORT="" MODEL="" RUN_DIR=""
SANDBOX="danger-full-access"
ADD_DIRS=()
while [ $# -gt 0 ]; do
  case "$1" in
    --repo)    REPO="$2"; shift 2 ;;
    --brief)   BRIEF="$2"; shift 2 ;;
    --session) SESSION="$2"; shift 2 ;;
    --effort)  EFFORT="$2"; shift 2 ;;
    --model)   MODEL="$2"; shift 2 ;;
    --sandbox) SANDBOX="$2"; shift 2 ;;
    --add-dir) ADD_DIRS+=("$2"); shift 2 ;;
    --run-dir) RUN_DIR="$2"; shift 2 ;;
    *) echo "codex-task.sh: unknown option: $1" >&2; usage ;;
  esac
done

[ -d "$REPO" ]  || { echo "codex-task.sh: --repo not a directory: $REPO" >&2; exit 2; }
[ -f "$BRIEF" ] || { echo "codex-task.sh: --brief not a file: $BRIEF" >&2; exit 2; }
if [ "$MODE" = resume ] && [ -z "$SESSION" ]; then
  echo "codex-task.sh: resume requires --session <uuid>" >&2; exit 2
fi
if [ "$MODE" = resume ] && [ "${#ADD_DIRS[@]}" -gt 0 ]; then
  echo "codex-task.sh: --add-dir is not supported on resume (codex 0.141 limitation)" >&2; exit 2
fi

[ -n "$RUN_DIR" ] || RUN_DIR=$(mktemp -d "${TMPDIR:-/tmp}/codex-task.XXXXXX")
mkdir -p "$RUN_DIR"

ARGS=(exec)
[ "$MODE" = resume ] && ARGS+=(resume "$SESSION")
ARGS+=(--json -o "$RUN_DIR/last-message.md" -c 'approval_policy="never"')
if [ "$MODE" = new ]; then
  ARGS+=(-s "$SANDBOX" -C "$REPO")
  if [ "${#ADD_DIRS[@]}" -gt 0 ]; then
    for d in "${ADD_DIRS[@]}"; do ARGS+=(--add-dir "$d"); done
  fi
else
  ARGS+=(-c "sandbox_mode=\"$SANDBOX\"")
fi
[ -n "$EFFORT" ] && ARGS+=(-c "model_reasoning_effort=\"$EFFORT\"")
[ -n "$MODEL" ]  && ARGS+=(-m "$MODEL")

START=$(date +%s)
set +e
( cd "$REPO" && codex "${ARGS[@]}" - ) < "$BRIEF" \
  > "$RUN_DIR/events.jsonl" 2> "$RUN_DIR/stderr.txt"
CODE=$?
set -e
WALL=$(( $(date +%s) - START ))

SESSION_ID=$(grep -m1 -o '"thread_id":"[^"]*"' "$RUN_DIR/events.jsonl" | cut -d'"' -f4 || true)
[ -n "$SESSION_ID" ] || echo "codex-task.sh: WARNING: no thread_id in events.jsonl" >&2

USAGE_JSON=$(grep -o '"usage":{[^}]*}' "$RUN_DIR/events.jsonl" | tail -1 | sed 's/^"usage"://' || true)

cat > "$RUN_DIR/meta.json" <<EOF
{
  "mode": "$MODE",
  "session_id": "$SESSION_ID",
  "exit_code": $CODE,
  "wall_seconds": $WALL,
  "usage": ${USAGE_JSON:-null},
  "repo": "$REPO",
  "brief": "$BRIEF"
}
EOF

git -C "$REPO" diff --stat        > "$RUN_DIR/diff-stat.txt"        2>&1 || true
git -C "$REPO" status --porcelain > "$RUN_DIR/status-porcelain.txt" 2>&1 || true

echo "run_dir:      $RUN_DIR"
echo "session_id:   ${SESSION_ID:-<none>}"
echo "exit_code:    $CODE"
echo "wall_seconds: $WALL"
echo "usage:        ${USAGE_JSON:-<none>}"
echo "last_message: $RUN_DIR/last-message.md"
echo "--- git status (porcelain) ---"
cat "$RUN_DIR/status-porcelain.txt"
echo "--- git diff --stat ---"
cat "$RUN_DIR/diff-stat.txt"

exit $CODE
