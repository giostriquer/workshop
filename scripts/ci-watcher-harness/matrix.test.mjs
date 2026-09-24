// Exit-path matrix for ci-watcher's polling loop: node --test scripts/ci-watcher-harness/matrix.test.mjs
//
// Each row runs the loop template, read from plugins/workbench/agents/ci-watcher.md at run
// time, under `bash --norc --noprofile` and `zsh -f` against the fake gh, date and sleep in
// bin/. The fakes keep a virtual clock: each gh call advances it two seconds and sleep
// advances it at once, so a ten-minute window runs in well under a second. The rows are the
// table in docs/decisions/fix-ci.md. Every row works in a fresh directory under the system
// temp dir, removed afterwards, so nothing is written to the repo, and no gh call leaves the
// machine. CI_WATCHER_MUTANT=<name> runs the same rows against a mutant (see mutants.mjs).
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  chmodSync, closeSync, copyFileSync, existsSync, mkdirSync, mkdtempSync, openSync, readFileSync, readdirSync,
  realpathSync, rmSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { loadTemplate, replaceOnce } from './template.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const EPOCH = 1000000; // the virtual clock's start, which bin/date also assumes
const SHELLS = [['bash', '--norc', '--noprofile'], ['zsh', '-f']];
const LINK = 'https://example.com/acme/webapp/actions/runs/111/job/222';

const mutant = process.env.CI_WATCHER_MUTANT;
let template = loadTemplate();
if (mutant) template = (await import('./mutants.mjs')).mutate(template, mutant);

// `expect` matches the call's output with each line ended by `;`, `polls` is the number of
// `gh pr view` state polls, and `maxElapsed` bounds the virtual seconds the row may take.
// `flake` fills run and att; `lim` sets it by hand; `resume` starts the clock late and runs a
// later call with the printed deadline; `secondCall` re-runs after a `slice` line, `gap`
// seconds later, as the watcher does.
const rows = [
  { path: 'Merged', scenario: 'merged', expect: /(^|;)exit: MERGED;$/, polls: 2 },
  { path: 'Merged at dispatch', scenario: 'merged0', expect: /(^|;)exit: MERGED;$/, polls: 1, maxElapsed: 12 },
  { path: 'Closed', scenario: 'closed', expect: /(^|;)exit: CLOSED;$/, polls: 2 },
  { path: 'Superseded', scenario: 'moved', expect: /(^|;)exit: superseded def456fullsha;$/, polls: 2 },
  { path: 'Failed, with links', scenario: 'fail', expect: new RegExp(`exit: failed;unit tests ${LINK};`), polls: 2 },
  { path: 'Settled', scenario: 'settled', expect: /(^|;)exit: settled;$/, polls: 2 },
  { path: 'Deadline, Codex', scenario: 'pending', expect: /(^|;)exit: deadline;$/, maxElapsed: 604 },
  { path: 'Slice, Claude Code', scenario: 'pending', env: { CLAUDECODE: '1' },
    expect: /(^|;)slice: deadline=1000600;$/, maxElapsed: 544 },
  { path: 'Second call', scenario: 'pending', env: { CLAUDECODE: '1' }, resume: { at: 1000525, deadline: 1000600 },
    expect: /(^|;)exit: deadline;$/, maxElapsed: 75 },
  { path: 'Raised limit', scenario: 'pending', env: { CLAUDECODE: '1', BASH_MAX_TIMEOUT_MS: '900000' },
    expect: /(^|;)exit: deadline;$/, maxElapsed: 604 },
  { path: 'Other host', scenario: 'pending', lim: 300000, expect: /(^|;)slice: deadline=1000600;$/, maxElapsed: 244 },
  { path: 'Empty poll continues', scenario: 'noviewcont', expect: /(^|;)exit: settled;$/, polls: 4 },
  { path: 'No checks yet', scenario: 'nochecks', expect: /(^|;)exit: settled;$/, polls: 4 },
  { path: 'Empty polls reach blocked', scenario: 'blocked', expect: /exit: blocked;.*gh auth login;$/, polls: 4 },
  { path: 'Counter resets', scenario: 'flakyview', expect: /(^|;)exit: settled;$/, polls: 9 },
  { path: 'Empty poll, checks passing', scenario: 'noviewpass', expect: /exit: blocked;HTTP 502: Bad Gateway[^;]*;$/, polls: 4 },
  { path: 'Empty poll, head moved', scenario: 'noviewmoved', expect: /(^|;)exit: superseded def456fullsha;$/, polls: 3 },
  { path: 'Empty poll, check failing', scenario: 'noviewfail', expect: new RegExp(`exit: failed;unit tests ${LINK};$`), polls: 3 },
  { path: 'Flake wait', scenario: 'flake', flake: true, expect: /(^|;)exit: settled;$/, polls: 5 },
  { path: 'Flake, new attempt fails', scenario: 'flakerefail', flake: true, expect: /exit: failed;unit tests/, polls: 5 },
  { path: 'Flake, gh run view errors', scenario: 'flakegherr', flake: true, expect: /(^|;)exit: settled;$/, polls: 5 },
  { path: 'Flake, attempt appears mid-poll', scenario: 'flakerace', flake: true, expect: /(^|;)exit: settled;$/, polls: 6 },
  { path: 'Flake, check runs trail the attempt', scenario: 'flakelag', flake: true, expect: /(^|;)exit: settled;$/, polls: 6 },
  { path: 'Flake, attempt appears between calls', scenario: 'flakeslice', flake: true, env: { CLAUDECODE: '1' },
    secondCall: { gap: 15 }, expect: /(^|;)slice: deadline=1000600;exit: settled;$/ },
  { path: 'Scratch folder missing', scenario: 'settled', missingScratch: true, expect: /(^|;)exit: settled;$/, polls: 2 },
];

// Runs first in every script: a gh, date or sleep other than the fake (say, from a startup
// file that rewrote PATH) stops the row before any of them runs.
const GUARD = 'for c in gh date sleep; do [ "$(command -v $c)" = "$FAKE_BIN/$c" ] || '
  + '{ echo "harness: $c is $(command -v $c), not the fake" >&2; exit 97; }; done\n';

const base = realpathSync(mkdtempSync(path.join(tmpdir(), 'ci-watcher-harness-')));
after(() => rmSync(base, { recursive: true, force: true }));
// Copied with the executable bit set, since a checkout or a package may drop it.
const fakeBin = path.join(base, 'bin');
mkdirSync(fakeBin);
for (const name of readdirSync(path.join(here, 'bin'))) {
  copyFileSync(path.join(here, 'bin', name), path.join(fakeBin, name));
  chmodSync(path.join(fakeBin, name), 0o755);
}

function fill(text, placeholder, value) {
  assert.ok(text.includes(placeholder), `harness: the template has no ${placeholder}`);
  return text.split(placeholder).join(value);
}

// A later call: the same lines with only the deadline changed and the snapshot dropped.
function rearm(script, deadline) {
  const lines = replaceOnce(script, /deadline=\$\(\( t0 \+ 600 \)\)/, `deadline=${deadline}`, 'the first-call deadline')
    .split('\n');
  const kept = lines.filter((line) => !line.startsWith('gh '));
  assert.ok(kept.length < lines.length, 'harness: the template has no snapshot line starting with gh');
  return kept.join('\n');
}

function script(row, dir) {
  let s = fill(template, '<n>', '1');
  s = fill(s, '<pinned sha>', 'abc123');
  s = fill(s, '<scratch>', row.missingScratch ? path.join(dir, 'missing/sub') : dir);
  if (row.flake) s = replaceOnce(s, /^run=; att=.*$/m, 'run=111; att=1', 'the run and att line');
  if (row.lim) s = replaceOnce(s, /^lim=.*$/m, `lim=${row.lim}`, 'the lim line');
  if (row.resume) s = rearm(s, row.resume.deadline);
  return s;
}

// One tool call: stdout and stderr share one file, in order, as `2>&1` would give them.
function spawnCall(shell, dir, env, name, text) {
  const file = path.join(dir, name);
  writeFileSync(file, GUARD + text);
  const fd = openSync(`${file}.out`, 'w');
  let result;
  try {
    result = spawnSync(shell[0], [...shell.slice(1), file], { cwd: dir, env, stdio: ['ignore', fd, fd], timeout: 60000 });
  } finally {
    closeSync(fd);
  }
  if (result.error) throw result.error;
  return { status: result.status, out: readFileSync(`${file}.out`, 'utf8').replace(/\n+$/, '') };
}

// Built from scratch, so nothing from the calling session (CLAUDECODE, BASH_ENV, a real gh
// config) reaches the shell under test.
function shellEnv(dir, row, pathDirs = [fakeBin]) {
  return {
    PATH: [...pathDirs, '/usr/bin', '/bin'].join(':'), HOME: dir, ZDOTDIR: dir, LC_ALL: 'C',
    FAKE_BIN: fakeBin, FAKE_STATE: dir, FAKE_SCENARIO: row.scenario, FAKE_LATENCY: '2', ...row.env,
  };
}

function rowDir(t, start) {
  const dir = mkdtempSync(path.join(base, 'row-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  writeFileSync(path.join(dir, 'clock'), `${start}\n`);
  writeFileSync(path.join(dir, 'p'), '0\n');
  return dir;
}

const readNumber = (dir, name) => Number(readFileSync(path.join(dir, name), 'utf8'));

for (const shell of SHELLS) {
  describe(`${shell.join(' ')}${mutant ? `, mutant ${mutant}` : ''}`, () => {
    for (const row of rows) {
      test(row.path, (t) => {
        const start = row.resume?.at ?? EPOCH;
        const dir = rowDir(t, start);
        const env = shellEnv(dir, row);
        const call = (name, text) => {
          const { status, out } = spawnCall(shell, dir, env, name, text);
          assert.notEqual(status, 97, `harness guard: ${out}`);
          return out;
        };
        const first = script(row, dir);
        let out = call('call1.sh', first);
        const printed = out.match(/^slice: deadline=(\d+)$/m)?.[1];
        if (row.secondCall && printed) {
          writeFileSync(path.join(dir, 'clock'), `${readNumber(dir, 'clock') + row.secondCall.gap}\n`);
          out += `\n${call('call2.sh', rearm(first, printed))}`;
        }
        const elapsed = readNumber(dir, 'clock') - start;
        const polls = readNumber(dir, 'p');
        const flat = `${out.split('\n').join(';')};`;
        t.diagnostic(`polls=${polls} elapsed=${elapsed}s ${out.split('\n').filter((l) => !/^(pending|required|\{)/.test(l)).join(' | ')}`);
        const seen = `polls=${polls} elapsed=${elapsed}s output: ${flat}`;
        assert.match(flat, row.expect, seen);
        if (row.polls !== undefined) assert.equal(polls, row.polls, seen);
        if (row.maxElapsed !== undefined) assert.ok(elapsed <= row.maxElapsed, `elapsed over ${row.maxElapsed}s: ${seen}`);
      });
    }
  });
}

describe('harness', () => {
  for (const shell of SHELLS) {
    test(`${shell[0]}: a gh ahead of the fake on PATH stops the row before any gh runs`, (t) => {
      const dir = rowDir(t, EPOCH);
      const decoy = path.join(dir, 'decoy');
      mkdirSync(decoy);
      writeFileSync(path.join(decoy, 'gh'), `#!/bin/sh\ntouch "${dir}/decoy-ran"\n`);
      chmodSync(path.join(decoy, 'gh'), 0o755);
      const row = { scenario: 'settled' };
      const { status, out } = spawnCall(shell, dir, shellEnv(dir, row, [decoy, fakeBin]), 'call1.sh', script(row, dir));
      assert.equal(status, 97, out);
      assert.match(out, /^harness: gh is .*\/decoy\/gh, not the fake$/m);
      assert.ok(!existsSync(path.join(dir, 'decoy-ran')), 'the decoy gh ran');
    });
  }
});
