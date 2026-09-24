// Named mutants of ci-watcher's loop template, to check that the matrix still catches the
// defects it was built against. Optional: the default matrix run does not load this file.
//
//   node scripts/ci-watcher-harness/mutants.mjs                    every mutant
//   node scripts/ci-watcher-harness/mutants.mjs no-attempt-gate    the named ones
//
// The clean matrix runs first and must pass; otherwise no mutant runs. Each mutant then re-runs
// matrix.test.mjs with CI_WATCHER_MUTANT set, and is killed when at least one row fails on an
// assertion about the loop's output. A row that fails any other way (a missing shell, a timeout,
// the harness guard, a setup error) makes that mutant an `error`, never a kill. The edits match
// the template text of 2026-09-24: after a template edit a mutant that no longer applies reports
// `stale` rather than a result. Exits non-zero when the baseline fails or any named mutant
// survives, errors, is stale or is unknown.
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadTemplate, replaceOnce } from './template.mjs';

// The flake branch of the loop, from its `if` to the matching `fi`.
const FLAKE_BRANCH = /^( *)if \[ -n "\$run" \]; then {2}# a flake rerun[^\n]*\n[\s\S]*?^\1fi\n/m;

// The loop before the independent review: checks read first, then the attempt.
const CHECKS_BEFORE_ATTEMPT = String.raw`  ck=$(gh pr checks $pr --json name,bucket -q '[.[] | "\(.name)=\(.bucket)"] | join(" ")' 2>>"$err")
  if [ -n "$run" ]; then  # until the rerun's new attempt starts, the old failure still shows
    [ "$(gh run view $run --json attempt -q .attempt 2>>"$err")" -gt "$att" ] 2>/dev/null && run= || ck="rerun=pending"
  fi
`;

// The attempt read first, but the checks read in the same poll that first shows the new attempt.
const CHECKS_IN_ATTEMPT_POLL = String.raw`  ck="rerun=pending"
  [ -z "$run" ] || { [ "$(gh run view $run --json attempt -q .attempt 2>>"$err")" -gt "$att" ] 2>/dev/null && run=; }
  [ -n "$run" ] || ck=$(gh pr checks $pr --json name,bucket -q '[.[] | "\(.name)=\(.bucket)"] | join(" ")' 2>>"$err")
`;

const UNGATED = ['if [ -n "$st" ]; then', 'if :; then'];
const EMPTY_HEAD_IS_PINNED = ['"$sha"*) ;;', '"$sha"*|"") ;;'];

// name: [from, to] edits, each of which must match the template exactly once.
export const MUTANTS = {
  // Both loop fixes from the independent review undone: the template that review read.
  'pre-review': [[FLAKE_BRANCH, CHECKS_BEFORE_ATTEMPT], UNGATED, EMPTY_HEAD_IS_PINNED],
  // Verdicts judged on a poll whose gh pr view failed, an empty head counting as superseded.
  'ungated-verdicts': [UNGATED],
  // The earlier ungated verdicts, where an empty head counted as the pinned one.
  'earlier-verdicts': [UNGATED, EMPTY_HEAD_IS_PINNED],
  'checks-before-attempt': [[FLAKE_BRANCH, CHECKS_BEFORE_ATTEMPT]],
  'checks-in-attempt-poll': [[FLAKE_BRANCH, CHECKS_IN_ATTEMPT_POLL]],
  // lim keyed on BASH_MAX_TIMEOUT_MS alone, so Codex slices too.
  'lim-without-claudecode': [['lim=${CLAUDECODE:+${BASH_MAX_TIMEOUT_MS:-600000}}', 'lim=${BASH_MAX_TIMEOUT_MS:-600000}']],
  // The slice checked before the sleep without the thirty seconds the sleep takes.
  'slice-without-margin': [['[ $(( now + 30 )) -lt $slice ]', '[ $now -lt $slice ]']],
  // The slice computed after the snapshot instead of from the call's start.
  'slice-after-snapshot': [['slice=$(( t0 + ${lim:-0}', 'slice=$(( $(date +%s) + ${lim:-0}']],
  // An empty checks list no longer counts as pending.
  'empty-checks-settle': [['*=pending*|"  ") ;;', '*=pending*) ;;']],
  'no-blocked-counter': [['[ $n -lt 4 ] || { echo "exit: blocked"; cat "$err"; break; }', ':']],
  'no-attempt-gate': [['if [ -n "$run" ]; then  # a flake', 'if false; then  # a flake']],
  'no-mkdir': [['; mkdir -p "${out%/*}"', '']],
};

export function mutate(template, name) {
  const edits = MUTANTS[name];
  if (!edits) throw new Error(`unknown mutant ${name}; known: ${Object.keys(MUTANTS).join(', ')}`);
  return edits.reduce((text, [from, to]) => replaceOnce(text, from, to, `mutant ${name}: ${String(from).slice(0, 60)}`), template);
}

// Failed rows from a TAP run, each marked as a kill (an assertion about the loop's output) or not.
// The rows sit one level under their shell's describe block; each failure's YAML block follows it.
function failedRows(tap) {
  const lines = tap.split('\n');
  const rows = [];
  lines.forEach((line, i) => {
    const m = line.match(/^ {4}not ok \d+ - (.+)$/);
    if (!m) return;
    const block = [];
    for (let j = i + 1; j < lines.length && !/^ {6}\.\.\.$/.test(lines[j]); j += 1) block.push(lines[j]);
    // The error message: inline after `error:`, or on the next line after a block marker.
    const at = block.findIndex((l) => /^\s+error:/.test(l));
    const inline = at < 0 ? '' : block[at].replace(/^\s+error:\s*/, '');
    const message = (/^[|>]-?$/.test(inline) ? block[at + 1] ?? '' : inline).trim().replace(/^['"]/, '');
    const assertion = block.some((l) => /^\s+code: 'ERR_ASSERTION'$/.test(l));
    rows.push({ name: m[1], kill: assertion && !message.startsWith('harness') });
  });
  return rows;
}

function runMatrix(here, env, mutant) {
  const run = spawnSync(process.execPath, ['--test', '--test-reporter=tap', path.join(here, 'matrix.test.mjs')], {
    env: mutant ? { ...env, CI_WATCHER_MUTANT: mutant } : env, encoding: 'utf8',
  });
  return { status: run.status, output: `${run.stdout}${run.stderr}`, rows: failedRows(run.stdout) };
}

function main(names) {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const template = loadTemplate();
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  delete env.CI_WATCHER_MUTANT;
  const baseline = runMatrix(here, env);
  if (baseline.status !== 0) {
    console.log(`error     baseline: the clean matrix does not pass, so no mutant result means anything\n${baseline.output}`);
    process.exitCode = 1;
    return;
  }
  let bad = 0;
  for (const name of names) {
    try {
      mutate(template, name);
    } catch (error) {
      console.log(`stale     ${name}: ${error.message}`);
      bad += 1;
      continue;
    }
    const { status, output, rows } = runMatrix(here, env, name);
    const other = rows.filter((r) => !r.kill);
    const kills = rows.filter((r) => r.kill);
    if (other.length) {
      console.log(`error     ${name}: ${other.length} rows failed outside the loop's assertions (${[...new Set(other.map((r) => r.name))].join('; ')})`);
      bad += 1;
    } else if (kills.length) {
      console.log(`killed    ${name}: ${kills.length} rows fail (${[...new Set(kills.map((r) => r.name))].join('; ')})`);
    } else {
      console.log(status === 0 ? `SURVIVED  ${name}` : `error     ${name}: the matrix failed outside any row\n${output}`);
      bad += 1;
    }
  }
  process.exitCode = bad ? 1 : 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main(process.argv.length > 2 ? process.argv.slice(2) : Object.keys(MUTANTS));
