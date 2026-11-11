import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const runner = path.resolve(path.dirname(fileURLToPath(import.meta.url)),
  '../plugins/workbench/skills/test-quality-review/scripts/rust-mutants-runner.mjs');
const { applyDiff, parse, spread, testTimeout, verdict } = await import(pathToFileURL(runner).href);
const hasCargoMutants = spawnSync('cargo', ['mutants', '--version']).status === 0;
const needsTool = { timeout: 60000, skip: hasCargoMutants ? false : 'cargo-mutants is not installed' };
const sha = data => createHash('sha256').update(data).digest('hex');

const SOURCE = `pub fn clamp_percent(value: i32) -> i32 {
    if value < 0 {
        0
    } else if value > 100 {
        100
    } else {
        value
    }
}

pub fn label(n: u32) -> &'static str {
    if n == 0 {
        "none"
    } else {
        "some"
    }
}
`;

// Stands in for the Bazel launcher. It finds the line cargo-mutants marked and answers
// as Bazel would: tests cover clamp_percent but not label, a 1 hangs a test, a -1 does
// not build. Each call is logged with the file's content.
const STUB = `
const fs = require('fs');
const [file, log, mode] = [process.env.STUB_FILE, process.env.STUB_LOG, process.env.STUB_MODE ?? ''];
const text = fs.readFileSync(file, 'utf8');
fs.appendFileSync(log, JSON.stringify({ args: process.argv.slice(2), text }) + '\\n');
const lines = text.split('\\n');
const marked = lines.findIndex(line => line.includes('/* ~ changed by cargo-mutants ~ */'));
const say = (code, line) => { console.log(line); process.exit(code); };
const answer = () => {
  if (marked < 0) return mode === 'failing-baseline' ? say(3, '//calc:calc_test FAILED in 0.2s') : say(0, '//calc:calc_test PASSED in 0.5s');
  if (mode === 'lock-file') fs.chmodSync(file, 0o444);
  if (/^\\s*-1 \\/\\*/.test(lines[marked])) return say(1, 'ERROR: Build did NOT complete successfully');
  if (/^\\s*1 \\/\\*/.test(lines[marked])) return say(3, '//calc:calc_test TIMEOUT in 20.0s');
  if (marked >= lines.findIndex(line => line.startsWith('pub fn label'))) return say(0, '//calc:calc_test PASSED in 0.4s');
  say(3, '//calc:calc_test FAILED in 0.3s');
};
process.on('SIGINT', () => process.exit(8));
const delay = Number(process.env[marked < 0 ? 'STUB_BASELINE_DELAY' : 'STUB_DELAY'] ?? 0);
if (delay) { if (process.env.STUB_STARTED && marked >= 0) fs.writeFileSync(process.env.STUB_STARTED, ''); setTimeout(answer, delay); }
else answer();
`;

function rig(t) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'rust-mutants-runner-test-'));
  const r = { root, repo: path.join(root, 'repo'), out: path.join(root, 'out'), log: path.join(root, 'bazel.log'),
    stub: path.join(root, 'bazel-stub') };
  r.file = path.join(r.repo, 'calc', 'src', 'lib.rs');
  r.env = { ...process.env, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1', STUB_FILE: r.file, STUB_LOG: r.log };
  mkdirSync(path.dirname(r.file), { recursive: true });
  writeFileSync(r.file, SOURCE);
  writeFileSync(r.stub, `#!${process.execPath}\n${STUB}`);
  chmodSync(r.stub, 0o755);
  r.git = (...args) => spawnSync('git', ['-c', 'user.name=test', '-c', 'user.email=test@example.invalid',
    '-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null', ...args], { cwd: r.repo, env: r.env, encoding: 'utf8' });
  r.git('init', '-q', '-b', 'main');
  r.git('add', '-A');
  r.git('commit', '-qm', 'fixture');
  r.calls = () => readFileSync(r.log, 'utf8').trim().split('\n').map(line => JSON.parse(line));
  r.results = () => JSON.parse(readFileSync(path.join(r.out, 'results.json'), 'utf8'));
  t.after(() => { if (existsSync(r.file)) chmodSync(r.file, 0o644); rmSync(root, { recursive: true, force: true }); });
  return r;
}

const args = (r, extra = []) => [runner, '--crate', path.join(r.repo, 'calc'), '--file', 'src/lib.rs',
  '--bazel', r.stub, '--out', r.out, ...extra, '--', '//calc:calc_test'];
const run = (r, extra = [], env = {}) => spawnSync(process.execPath, args(r, extra),
  { env: { ...r.env, ...env }, encoding: 'utf8' });

test('applies a unified diff exactly where its hunk says, and nowhere else', () => {
  const text = 'a\nb\nc\nd\n';
  assert.equal(applyDiff(text, '--- x\n+++ y\n@@ -2,2 +2,2 @@\n-b\n+B\n c\n'), 'a\nB\nc\nd\n');
  assert.equal(applyDiff(text, '@@ -1,1 +1,1 @@\n-a\n+A\n@@ -4,1 +4,2 @@\n d\n+e\n'), 'A\nb\nc\nd\ne\n');
  // A hunk whose old side matches only at another line is refused, not applied with an offset.
  assert.equal(applyDiff('x\nb\nb\n', '@@ -1,1 +1,1 @@\n-b\n+B\n'), null);
  assert.equal(applyDiff(text, '@@ -2,1 +2,1 @@\n-changed elsewhere\n+B\n'), null);
  assert.equal(applyDiff(text, 'no hunk at all\n'), null);
  assert.equal(applyDiff('a\nb', '@@ -2,1 +2,1 @@\n-b\n\\ No newline at end of file\n+B\n\\ No newline at end of file\n'), 'a\nB');
  assert.equal(applyDiff('a\nb\n', '@@ -1,2 +1,2 @@\n a\n-b\n+b\n\\ No newline at end of file\n'), 'a\nb');
});

test('maps Bazel exits and summary lines to verdicts', () => {
  assert.equal(verdict(0, '//calc:calc_test  PASSED in 0.4s'), 'MISSED');
  assert.equal(verdict(1, 'ERROR: Build did NOT complete successfully'), 'UNVIABLE');
  assert.equal(verdict(3, '//calc:calc_test  FAILED in 2.2s'), 'CAUGHT');
  assert.equal(verdict(3, '//calc:calc_test  TIMEOUT in 20.3s'), 'TIMEOUT');
  assert.equal(verdict(3, '//a:t  TIMEOUT in 20.3s\n//b:t  FAILED in 0.2s'), 'CAUGHT');
  assert.equal(verdict(3, 'no summary line'), 'INCONCLUSIVE');
  for (const code of [2, 4, 8, 37, null]) assert.equal(verdict(code, '//calc:calc_test  FAILED in 1s'), 'INCONCLUSIVE');
});

test('sets the test timeout at five times the slowest baseline test, never under 20 seconds', () => {
  assert.equal(testTimeout('//a:t  (cached) PASSED in 2.8s\n//b:t  PASSED in 9.1s'), 46);
  assert.equal(testTimeout('//a:t  PASSED in 0.5s'), 20);
  assert.equal(testTimeout('INFO: Build completed successfully'), null);
});

test('takes an even spread when more mutants exist than the cap', () => {
  const items = Array.from({ length: 21 }, (_, i) => i);
  assert.deepEqual(spread(items, 5), [0, 4, 8, 12, 16]);
  assert.deepEqual(spread([1, 2], 10), [1, 2]);
});

test('rejects incomplete or unknown options', () => {
  assert.throws(() => parse(['--crate', 'c', '--file', 'f']), /bazel test arguments/);
  assert.throws(() => parse(['--crate', 'c', '--file', 'f', '--max', '0', '--', ':t']), /positive/);
  assert.throws(() => parse(['--crate', 'c', '--file', 'f', '--bogus', '1', '--', ':t']), /unknown/);
  assert.throws(() => parse(['--crate', 'c', '--', ':t']), /required/);
  assert.throws(() => parse(['--crate', 'c', '--file', 'f', '--base', 'main', '--in-diff', 'p', '--', ':t']), /exclude/);
  assert.equal(parse(['--crate', 'c', '--file', 'f', '--list']).list, true);
  assert.deepEqual(parse(['--crate', 'c', '--file', 'f', '--', '//a:t', '--test_arg=x']).bazelArgs, ['//a:t', '--test_arg=x']);
});

test('tests each mutant as an exact change, gives each verdict and restores the file', needsTool, t => {
  const r = rig(t);
  const result = run(r, ['--max', '50']);
  assert.equal(result.status, 2, result.stderr);
  assert.equal(readFileSync(r.file, 'utf8'), SOURCE);
  assert.equal(r.git('status', '--porcelain').stdout, '');
  const { counts, results, testTimeout: timeout } = r.results();
  assert.ok(counts.CAUGHT > 0 && counts.MISSED > 0 && counts.TIMEOUT === 1 && counts.UNVIABLE === 1, JSON.stringify(counts));
  assert.equal(timeout, 20);
  for (const missed of results.filter(entry => entry.verdict === 'MISSED')) assert.match(missed.name, /\blabel\b/);
  const [baseline, ...mutants] = r.calls();
  assert.equal(baseline.text, SOURCE);
  assert.deepEqual(baseline.args, ['test', '//calc:calc_test']);
  assert.equal(mutants.length, results.length);
  mutants.forEach((call, index) => {
    const diff = readFileSync(path.join(r.out, `mutant-${String(index + 1).padStart(2, '0')}.diff`), 'utf8');
    assert.equal(call.text, applyDiff(SOURCE, diff));
    assert.notEqual(call.text, SOURCE);
    assert.deepEqual(call.args, ['test', '--test_timeout=20', '//calc:calc_test']);
  });
});

test('lists without running Bazel or touching the file', needsTool, t => {
  const r = rig(t);
  const result = run(r, ['--list', '--max', '3']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /^\d+ mutants in src\/lib\.rs; listing 3\n/);
  assert.equal(existsSync(r.log), false);
  assert.equal(existsSync(r.out), false);
});

test('keeps only mutants on lines changed since the base, uncommitted ones included', needsTool, t => {
  const r = rig(t);
  const changed = SOURCE.replace('"some"', '"many"');
  writeFileSync(r.file, changed);
  const result = run(r, ['--base', 'main']);
  assert.equal(result.status, 2, result.stderr);
  assert.match(result.stdout, /^\d+ mutants in src\/lib\.rs on lines changed since main; running \d+\n/);
  const { results, found } = r.results();
  assert.ok(found > 0 && results.every(entry => /\blabel\b/.test(entry.name)), JSON.stringify(results));
  assert.equal(readFileSync(r.file, 'utf8'), changed);
});

test('in a copy without git, takes the changed lines from a diff made in the author checkout', needsTool, t => {
  const r = rig(t);
  writeFileSync(r.file, SOURCE.replace('"some"', '"many"'));
  const copy = path.join(r.root, 'copy');
  cpSync(r.repo, copy, { recursive: true });
  rmSync(path.join(copy, '.git'), { recursive: true });
  const crateDiff = path.join(r.root, 'crate.diff');
  const rootDiff = path.join(r.root, 'root.diff');
  writeFileSync(crateDiff, spawnSync('git', ['diff', '--relative', 'main', '--', 'src/lib.rs'],
    { cwd: path.join(r.repo, 'calc'), env: r.env, encoding: 'utf8' }).stdout);
  writeFileSync(rootDiff, r.git('diff', 'main', '--', 'calc/src/lib.rs').stdout);
  const list = (...extra) => spawnSync(process.execPath, [runner, '--crate', path.join(copy, 'calc'), '--file', 'src/lib.rs',
    '--list', '--max', '50', ...extra], { env: r.env, encoding: 'utf8' });
  const listed = list('--in-diff', crateDiff);
  assert.equal(listed.status, 0, listed.stderr);
  const names = listed.stdout.trim().split('\n').slice(1);
  assert.ok(names.length > 0 && names.every(name => /\blabel\b/.test(name)), listed.stdout);
  const misplaced = list('--in-diff', rootDiff);
  assert.equal(misplaced.status, 1);
  assert.match(misplaced.stderr, /the diff changes no src\/lib\.rs; make it with git diff --relative in /);
  const noGit = list('--base', 'main');
  assert.equal(noGit.status, 1);
  assert.match(noGit.stderr, /--base needs a git checkout/);
});

test('runs nothing when the base shows no changed line', needsTool, t => {
  const r = rig(t);
  const result = run(r, ['--base', 'main']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /^0 mutants .* on lines changed since main; running 0\n/);
  assert.equal(existsSync(r.log), false);
});

test('mutates every line of a file git does not track yet', needsTool, t => {
  const r = rig(t);
  const fresh = path.join(r.repo, 'calc', 'src', 'extra.rs');
  writeFileSync(r.file, `${SOURCE}\nmod extra;\n`);
  writeFileSync(fresh, 'pub fn double(n: u32) -> u32 {\n    n * 2\n}\n');
  const result = spawnSync(process.execPath, [runner, '--crate', path.join(r.repo, 'calc'), '--file', 'src/extra.rs',
    '--base', 'main', '--list', '--max', '50'], { env: r.env, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const listed = spawnSync(process.execPath, [runner, '--crate', path.join(r.repo, 'calc'), '--file', 'src/extra.rs',
    '--list', '--max', '50'], { env: r.env, encoding: 'utf8' });
  assert.equal(result.stdout.split('\n')[0].split(' ')[0], listed.stdout.split('\n')[0].split(' ')[0]);
  assert.match(result.stdout, /double/);
});

test('stops before any mutant when the baseline fails', needsTool, t => {
  const r = rig(t);
  const result = run(r, [], { STUB_MODE: 'failing-baseline' });
  assert.equal(result.status, 4);
  assert.match(result.stderr, /fail before any mutant \(bazel exit 3\)/);
  assert.equal(r.calls().length, 1);
  assert.equal(readFileSync(r.file, 'utf8'), SOURCE);
});

test('a baseline that outlasts the budget is stopped and reported', needsTool, t => {
  const r = rig(t);
  const result = run(r, ['--budget', '1'], { STUB_BASELINE_DELAY: '30000' });
  assert.equal(result.status, 4);
  assert.match(result.stderr, /did not finish within the budget/);
});

test('starts no mutant the budget cannot fit and records the rest as not run', needsTool, t => {
  const r = rig(t);
  const result = run(r, ['--budget', '3.5', '--max', '50'], { STUB_DELAY: '1000' });
  assert.equal(result.status, 3, result.stderr);
  const { counts } = r.results();
  // Mutants of equal length: the guard stops before one the budget would cut short.
  assert.equal(counts.INCONCLUSIVE, undefined, JSON.stringify(counts));
  assert.ok(counts['NOT RUN'] > 0 && r.calls().length >= 2, JSON.stringify(counts));
  assert.equal(readFileSync(r.file, 'utf8'), SOURCE);
});

test('stops a mutant still running when the budget ends', needsTool, t => {
  const r = rig(t);
  const result = run(r, ['--budget', '2'], { STUB_DELAY: '30000' });
  assert.equal(result.status, 3, result.stderr);
  assert.match(result.stdout, /INCONCLUSIVE .*\(bazel exit 8, budget\)/);
  assert.equal(readFileSync(r.file, 'utf8'), SOURCE);
});

test('a signal mid-mutant stops Bazel, restores the file and exits 128 plus the signal', needsTool, async t => {
  const r = rig(t);
  const started = path.join(r.root, 'started');
  const child = spawn(process.execPath, args(r, ['--max', '5']),
    { env: { ...r.env, STUB_DELAY: '30000', STUB_STARTED: started }, stdio: 'ignore' });
  const deadline = Date.now() + 20000;
  while (!existsSync(started) && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 50));
  assert.notEqual(readFileSync(r.file, 'utf8'), SOURCE);
  child.kill('SIGTERM');
  const code = await new Promise(resolve => child.on('close', resolve));
  assert.equal(code, 143);
  assert.equal(readFileSync(r.file, 'utf8'), SOURCE);
  assert.equal(r.results().counts['NOT RUN'], 4);
});

test('a file it cannot restore stops the run and names the saved original', needsTool, t => {
  const r = rig(t);
  const result = run(r, [], { STUB_MODE: 'lock-file' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /was not restored \(EACCES\); the original is in /);
  chmodSync(r.file, 0o644);
  assert.equal(sha(readFileSync(path.join(r.out, 'original-lib.rs'))), sha(SOURCE));
});
