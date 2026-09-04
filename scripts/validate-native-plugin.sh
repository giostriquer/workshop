#!/usr/bin/env sh
# Validates the shipped plugin payloads and every host surface's marketplace.
#
# POSIX sh + awk, with node used only as a JSON reader (the repo already
# depends on node for its .mjs tooling, and unlike jq it is present in Git
# Bash on Windows). Runs on macOS, Linux, and Windows/Git Bash.
#
# Replaces validate-native-plugin.ps1, which needed PowerShell. Unlike that
# script this one is runnable from any working directory.
#
# The marketplace ships two plugins: workbench (the process core: agents,
# everyday skills, and the workbench flow layer) and toolkit (optional
# artifact-making utilities). The repo's own working set (.claude/, .codex/,
# .opencode/) and the attic are outside this validator's scope: .claude/ is
# canonical for the pieces this repo runs (change-log, push, wiki-maintainer,
# and the repo-only workbench-drift), mirrored nowhere.

set -eu

cd "$(dirname "$0")/.."

WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT INT TERM

fail() {
    echo "native plugin validation failed: $1" >&2
    exit 1
}

command -v node >/dev/null 2>&1 || fail "node is required to read JSON manifests"

# ── JSON reader ───────────────────────────────────────────────────────────
# json <op> <file> [dotted.path] [field]
#   check  parse only
#   get    print the value at path (objects/arrays as JSON); exit 1 if absent
#   has    exit 0 if path exists, 1 otherwise
#   pluck  path is an array; print <field> of each element, one per line
JSON_JS=$(cat <<'JS'
const fs = require("fs");
const [op, file, path, field] = process.argv.slice(1);
let doc;
try { doc = JSON.parse(fs.readFileSync(file, "utf8")); }
catch (e) { console.error(e.message); process.exit(3); }
const render = (x) => (typeof x === "object" && x !== null ? JSON.stringify(x) : String(x));
let v = doc;
for (const k of path ? path.split(".") : []) {
  if (v === null || typeof v !== "object" || !(k in v)) process.exit(1);
  v = v[k];
}
if (op === "check" || op === "has") process.exit(0);
if (op === "get") {
  if (v === undefined) process.exit(1);
  process.stdout.write(render(v));
  process.exit(0);
}
if (op === "pluck") {
  if (!Array.isArray(v)) process.exit(1);
  for (const el of v) {
    if (el === null || typeof el !== "object" || !(field in el)) process.exit(1);
    process.stdout.write(render(el[field]) + "\n");
  }
  process.exit(0);
}
process.exit(2);
JS
)

json() { node -e "$JSON_JS" -- "$@"; }

read_json() {
    [ -f "$1" ] || fail "missing JSON file: $1"
    json check "$1" || fail "invalid JSON in $1"
}

# value at path, or empty string when absent
jget() { json get "$1" "$2" 2>/dev/null || true; }
jhas() { json has "$1" "$2" 2>/dev/null; }

# node_check <js> <args...> : js prints a message and exits nonzero on failure
node_check() {
    _js=$1
    shift
    _out=$(node -e "$_js" -- "$@" 2>&1) || fail "${_out:-check failed}"
}

# ── frontmatter ───────────────────────────────────────────────────────────
# Strict check of a skill/agent .md YAML frontmatter. There is no portable
# YAML parser here, so this validates the flat shape the plugins use:
# `key: value` lines (plus one level of indented nesting) whose unquoted
# values must be legal plain scalars. Hosts reject the file otherwise
# ("mapping values are not allowed in this context").
FM_AWK=$(cat <<'AWK'
function bad(msg) { printf "%s:%d: %s\n", FILE, NR, msg; aborted = 1; exit 2 }
{ sub(/\r$/, "") }
NR == 1 {
    if ($0 != "---") { printf "%s: frontmatter must open with --- on line 1\n", FILE; exit 2 }
    next
}
closed { next }
$0 == "---" { closed = 1; next }
{
    t = $0; sub(/^[ \t]+/, "", t); sub(/[ \t]+$/, "", t)
    if (t == "" || substr(t, 1, 1) == "#") next
    if ($0 !~ /^[ \t]*[A-Za-z0-9_-]+:([ \t]+.*)?$/) bad("frontmatter line is not key: value")

    indent = $0; sub(/[^ \t].*$/, "", indent)
    key = $0; sub(/^[ \t]*/, "", key); sub(/:.*$/, "", key)
    if (indent == "") keys[key] = 1

    if ($0 !~ /^[ \t]*[A-Za-z0-9_-]+:[ \t]+/) next   # nested block follows
    v = $0; sub(/^[ \t]*[A-Za-z0-9_-]+:[ \t]+/, "", v); sub(/[ \t]+$/, "", v)
    if (v == "") next

    f = substr(v, 1, 1)
    if (f == "\"" || f == "'" || f == "|" || f == ">" || f == "[" || f == "{") next
    if (index("&*!%@", f) > 0 || f == sprintf("%c", 96) || v == "-" || substr(v, 1, 2) == "- ")
        bad("unquoted value starts with reserved YAML indicator '" f "'")
    if (index(v, ": ") > 0 || substr(v, length(v), 1) == ":")
        bad("unquoted value contains ': ' (reword it; do not quote)")
    if (index(v, " #") > 0)
        bad("unquoted value contains ' #' (starts a YAML comment)")
}
END {
    if (aborted) exit 2
    if (!closed) { printf "%s: frontmatter never closes with ---\n", FILE; exit 2 }
    if (!("name" in keys)) { printf "%s: frontmatter missing required key 'name'\n", FILE; exit 2 }
    if (!("description" in keys)) { printf "%s: frontmatter missing required key 'description'\n", FILE; exit 2 }
}
AWK
)

assert_frontmatter() {
    _out=$(awk -v FILE="$1" "$FM_AWK" "$1") || fail "$_out"
}

# opencode's skill loader keys a skill on its SKILL.md frontmatter name, which
# must be lowercase-hyphenated, at most 64 chars, and match the folder name.
# Claude Code wants the same folder parity, so the rule is enforced across
# hosts from one place.
NAME_AWK=$(cat <<'AWK'
{ sub(/\r$/, "") }
NR == 1 { next }
$0 == "---" { exit }
/^name:([ \t]+.*)?$/ {
    v = $0; sub(/^name:[ \t]*/, "", v); sub(/[ \t]+$/, "", v)
    print v; exit
}
AWK
)

assert_skill_name() {
    _path=$1
    _folder=$2
    _name=$(awk "$NAME_AWK" "$_path")
    [ -n "$_name" ] || fail "$_path: frontmatter 'name' has no value"
    printf '%s' "$_name" | grep -Eq '^[a-z0-9]+(-[a-z0-9]+)*$' \
        || fail "$_path: skill name '$_name' must be lowercase hyphen-separated"
    [ "${#_name}" -le 64 ] || fail "$_path: skill name exceeds 64 characters"
    [ "$_name" = "$_folder" ] \
        || fail "$_path: skill name '$_name' must match its folder '$_folder'"
}

# ── list comparison ───────────────────────────────────────────────────────
assert_same_list() {
    # $1 expected (newline-separated), $2 actual (newline-separated), $3 context
    printf '%s\n' "$1" | LC_ALL=C sort >"$WORK/exp"
    printf '%s\n' "$2" | LC_ALL=C sort >"$WORK/act"
    cmp -s "$WORK/exp" "$WORK/act" && return 0
    _details=$(comm -3 "$WORK/exp" "$WORK/act" \
        | sed -e 's/^\t\(.*\)/=> \1/' -e 's/^\([^=]\)/<= \1/' \
        | paste -sd';' - | sed 's/;/; /g')
    fail "$3 file list mismatch: $_details"
}

list_dirs() { find "$1" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | sed 's|.*/||' | LC_ALL=C sort; }
list_files() { find "$1" -mindepth 1 -maxdepth 1 -type f 2>/dev/null | sed 's|.*/||' | LC_ALL=C sort; }

# ── expected payloads ─────────────────────────────────────────────────────
WORKBENCH_SKILLS="audit
brainstorming
claim-check
code-quality-review
empirical-proof
epic-orchestration
file-pr
fix-ci
handoff-goal
model-reference
qa-sweep
receiving-code-review
self-audit
systematic-debugging
test-driven-development
using-workbench
verification-before-completion"

WORKBENCH_AGENTS="ci-watcher.md
code-quality-reviewer.md
pattern-reviewer.md
spec-reviewer.md
test-quality-reviewer.md"

TOOLKIT_SKILLS="adopt-global-rules
arch-map
get-pr-comments
html-report
me-human
ui-demo-video"

assert_plugin() {
    name=$1
    expected_skills=$2
    expected_agents=$3   # empty = plugin must have no agents directory

    root="plugins/$name"
    claude="$root/.claude-plugin/plugin.json"
    codex="$root/.codex-plugin/plugin.json"
    cursor="$root/.cursor-plugin/plugin.json"
    antigravity="$root/plugin.json"

    for f in "$claude" "$codex" "$cursor" "$antigravity"; do read_json "$f"; done

    [ "$(jget "$claude" name)" = "$name" ] || fail "$name plugin name must be $name"
    [ "$(jget "$codex" name)" = "$name" ] || fail "Codex $name plugin name must be $name"
    [ "$(jget "$cursor" name)" = "$name" ] || fail "Cursor $name manifest name must be $name"
    [ "$(jget "$antigravity" name)" = "$name" ] || fail "Antigravity $name manifest name must be $name"

    version=$(jget "$claude" version)
    [ -n "$version" ] || fail "$name plugin manifest has no version"
    [ "$(jget "$codex" version)" = "$version" ] || fail "Codex $name manifest version must match Claude manifest"
    [ "$(jget "$cursor" version)" = "$version" ] || fail "Cursor $name manifest version must match Claude manifest"
    [ "$(jget "$antigravity" version)" = "$version" ] || fail "Antigravity $name manifest version must match Claude manifest"

    for f in "$claude" "$codex"; do
        ! jhas "$f" mcpServers || fail "$name manifests must not contain mcpServers"
    done
    ! jhas "$codex" apps || fail "Codex $name manifest must not contain apps"

    [ "$(jget "$codex" skills)" = "./skills" ] || fail "Codex $name plugin manifest must set skills to ./skills"
    jhas "$codex" interface.capabilities || fail "Codex $name manifest must declare interface.capabilities"
    [ "$(jget "$codex" interface.capabilities)" = '["Skills"]' ] \
        || fail "Codex $name capabilities must be exactly Skills"

    skills_dir="$root/skills"
    [ -d "$skills_dir" ] || fail "$name must contain a skills directory"
    assert_same_list "$expected_skills" "$(list_dirs "$skills_dir")" "$name skills"

    _old_ifs=$IFS
    IFS='
'
    for skill in $expected_skills; do
        IFS=$_old_ifs
        [ -f "$skills_dir/$skill/SKILL.md" ] || fail "$name skill missing SKILL.md: $skill"
        assert_frontmatter "$skills_dir/$skill/SKILL.md"
        assert_skill_name "$skills_dir/$skill/SKILL.md" "$skill"
        IFS='
'
    done
    IFS=$_old_ifs

    agent_dir="$root/agents"
    if [ -n "$expected_agents" ]; then
        [ -d "$agent_dir" ] || fail "$name must contain an agents directory"
        assert_same_list "$expected_agents" "$(list_files "$agent_dir")" "$name agents"
        IFS='
'
        for agent in $expected_agents; do
            IFS=$_old_ifs
            assert_frontmatter "$agent_dir/$agent"
            IFS='
'
        done
        IFS=$_old_ifs
    elif [ -d "$agent_dir" ]; then
        fail "$name must not contain an agents directory"
    fi
}

assert_plugin workbench "$WORKBENCH_SKILLS" "$WORKBENCH_AGENTS"
assert_plugin toolkit "$TOOLKIT_SKILLS" ""

EXPECTED_NAMES="toolkit
workbench"

# ── marketplaces: each host surface lists exactly the two plugins ─────────

CLAUDE_MP=".claude-plugin/marketplace.json"
read_json "$CLAUDE_MP"
assert_same_list "$EXPECTED_NAMES" "$(json pluck "$CLAUDE_MP" plugins name)" "Claude marketplace plugins"
node_check '
const fs = require("fs");
const mp = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
for (const e of mp.plugins) {
  if (e.source !== `./plugins/${e.name}`) {
    console.error(`${e.name} marketplace source must be ./plugins/${e.name}`); process.exit(1);
  }
  const manifest = JSON.parse(fs.readFileSync(`plugins/${e.name}/.claude-plugin/plugin.json`, "utf8"));
  if (e.version !== manifest.version) {
    console.error(`${e.name} marketplace version must match its plugin manifest`); process.exit(1);
  }
}
' "$CLAUDE_MP"

CODEX_MP=".agents/plugins/marketplace.json"
read_json "$CODEX_MP"
assert_same_list "$EXPECTED_NAMES" "$(json pluck "$CODEX_MP" plugins name)" "Codex marketplace plugins"
node_check '
const fs = require("fs");
const mp = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
for (const e of mp.plugins) {
  if (!e.source || e.source.path !== `./plugins/${e.name}`) {
    console.error(`Codex ${e.name} marketplace source path must be ./plugins/${e.name}`); process.exit(1);
  }
  if (!e.policy || e.policy.installation !== "AVAILABLE") {
    console.error(`Codex ${e.name} marketplace installation policy must be AVAILABLE`); process.exit(1);
  }
  if (e.policy.authentication !== "ON_INSTALL") {
    console.error(`Codex ${e.name} marketplace authentication policy must be ON_INSTALL`); process.exit(1);
  }
  if (!("category" in e)) {
    console.error(`Codex ${e.name} marketplace entry must include category`); process.exit(1);
  }
}
' "$CODEX_MP"

CURSOR_MP=".cursor-plugin/marketplace.json"
read_json "$CURSOR_MP"
assert_same_list "$EXPECTED_NAMES" "$(json pluck "$CURSOR_MP" plugins name)" "Cursor marketplace plugins"
[ "$(jget "$CURSOR_MP" metadata.pluginRoot)" = "plugins" ] \
    || fail "Cursor marketplace metadata.pluginRoot must be plugins"
node_check '
const fs = require("fs");
const mp = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
for (const e of mp.plugins) {
  if (e.source !== e.name) {
    console.error(`Cursor ${e.name} marketplace source must be ${e.name} (relative to metadata.pluginRoot)`);
    process.exit(1);
  }
}
' "$CURSOR_MP"

[ ! -d "plugins/agent-workshop" ] \
    || fail "plugins/agent-workshop was deleted 2026-08-11; it must not reappear"

# opencode has no manifest convention: skills load by directory scan
# (skills.paths or ~/.config/opencode/skill/), so a per-plugin manifest
# directory would be inert fiction (docs/decisions/opencode-plugin-surface.md).
for name in workbench toolkit; do
    [ ! -d "plugins/$name/.opencode-plugin" ] \
        || fail "plugins/$name/.opencode-plugin must not exist: opencode has no manifest convention; adoption is skills.paths or copying into a scanned directory"
done

echo "native plugin validation ok"
