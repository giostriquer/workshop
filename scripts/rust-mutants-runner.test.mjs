import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const runner = path.resolve(path.dirname(fileURLToPath(import.meta.url)),
  '../plugins/workbench/skills/test-quality-review/scripts/rust-mutants-runner.mjs');
const { applyDiff, budgetClock, parse, spread, testTimeout, verdict } = await import(pathToFileURL(runner).href);
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
// not build. Each call is logged with the file's content. STUB_FIRST_DELAY, when set,
// replaces STUB_DELAY for the first mutant.
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
const first = marked >= 0 && fs.readFileSync(log, 'utf8').trim().split('\\n').length === 2;
const delay = Number(process.env[marked < 0 ? 'STUB_BASELINE_DELAY' : first && process.env.STUB_FIRST_DELAY ? 'STUB_FIRST_DELAY' : 'STUB_DELAY'] ?? 0);
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
  // Hunks out of order, or overlapping the one before, are refused.
  assert.equal(applyDiff(text, '@@ -3,1 +3,1 @@\n-c\n+C\n@@ -1,1 +1,1 @@\n-a\n+A\n'), null);
  assert.equal(applyDiff(text, '@@ -2,2 +2,2 @@\n-b\n-c\n+B\n+C\n@@ -3,1 +3,1 @@\n-c\n+X\n'), null);
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

const fakeClock = () => {
  let ms = 1700000000000;
  const now = () => ms;
  now.advance = step => { ms += step; };
  return now;
};

test('the budget guard starts a mutant only when the slowest so far would end within the budget, to the millisecond', () => {
  const now = fakeClock();
  const clock = budgetClock(3.5, now);
  assert.equal(clock.fits(), true);
  now.advance(100);
  const begun = clock.elapsed();
  now.advance(1400);
  assert.equal(clock.took(begun), 1400);
  now.advance(600);
  // 2100 elapsed + 1400 slowest ends exactly at the 3500 budget: it starts.
  assert.equal(clock.fits(), true);
  now.advance(1);
  assert.equal(clock.fits(), false);
});

test('the budget guard keeps the slowest mutant time to the millisecond, not the last or a rounded one', () => {
  const now = fakeClock();
  const clock = budgetClock(4, now);
  now.advance(200);
  let begun = clock.elapsed();
  now.advance(1600);
  assert.equal(clock.took(begun), 1600);
  begun = clock.elapsed();
  now.advance(300);
  assert.equal(clock.took(begun), 300);
  assert.equal(clock.elapsed(), 2100);
  now.advance(300);
  // 2400 + 1600 = 4000, the budget: rounding 1600 ms up to 2 s would refuse this one.
  assert.equal(clock.fits(), true);
  now.advance(1);
  // 2401 + 1600 = 4001: keeping the last time (300 ms) or 1600 ms rounded down to 1 s would start it.
  assert.equal(clock.fits(), false);
});

test('the budget counts whole milliseconds: what is left stops a running mutant and never goes below zero', () => {
  for (const [seconds, ms] of [[3.5, 3500], [1.005, 1005], [2.007, 2007], [900, 900000]]) {
    const now = fakeClock();
    const clock = budgetClock(seconds, now);
    assert.equal(clock.left(), ms, `--budget ${seconds}`);
    now.advance(ms - 250);
    assert.equal(clock.left(), 250, `--budget ${seconds}`);
    assert.equal(clock.fits(), true, `--budget ${seconds}`);
    now.advance(250);
    assert.equal(clock.left(), 0, `--budget ${seconds}`);
    assert.equal(clock.fits(), true, `--budget ${seconds}`);
    now.advance(1);
    assert.equal(clock.fits(), false, `--budget ${seconds}`);
    now.advance(5000);
    assert.equal(clock.left(), 0, `--budget ${seconds}`);
  }
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

test('reads --help and -h before the bazel arguments only', () => {
  for (const argv of [['--help'], ['-h'], ['--crate', 'c', '-h'], ['--bogus', '--help', '--', '//a:t']]) {
    assert.equal(parse(argv).help, true, argv.join(' '));
  }
  const options = parse(['--crate', 'c', '--file', 'f', '--', '//a:t', '-h', '--help']);
  assert.equal(options.help, undefined);
  assert.deepEqual(options.bazelArgs, ['//a:t', '-h', '--help']);
});

test('--help and -h print the options, verdicts and exit codes, run nothing and exit 0', t => {
  const r = rig(t);
  const help = spawnSync(process.execPath, [runner, '--help'], { env: r.env, encoding: 'utf8' });
  assert.equal(help.status, 0, help.stderr);
  assert.equal(help.stderr, '');
  assert.match(help.stdout, /^usage: node rust-mutants-runner\.mjs --crate <dir> --file <path in crate> /);
  const text = help.stdout.replace(/\s+/g, ' ');
  for (const option of ['--crate-root', '--base', '--in-diff', '--max', '--budget', '--out', '--bazel', '--list', '-h, --help']) {
    assert.ok(text.includes(option), option);
  }
  for (const outcome of ['CAUGHT', 'MISSED', 'TIMEOUT', 'UNVIABLE', 'INCONCLUSIVE', 'NOT APPLIED', 'NOT RUN']) {
    assert.ok(text.includes(` ${outcome} (`), outcome);
  }
  assert.ok(text.includes('Exit: 0 nothing missed or uncertain, 2 a mutant MISSED, 3 none missed but some TIMEOUT, '
    + 'INCONCLUSIVE, NOT APPLIED or NOT RUN, 4 the baseline failed, 1 usage or run failure, 128+n after signal n.'), text);
  const short = spawnSync(process.execPath, [runner, '-h'], { env: r.env, encoding: 'utf8' });
  assert.equal(short.status, 0, short.stderr);
  assert.equal(short.stdout, help.stdout);
  const full = run(r, ['--help']);
  assert.equal(full.status, 0, full.stderr);
  assert.equal(full.stdout, help.stdout);
  assert.equal(existsSync(r.log), false);
  assert.equal(existsSync(r.out), false);
});

test('a wrong or missing option fails with exit 1 and says how to get the help', () => {
  for (const [argv, message] of [
    [['--bogus'], 'unknown or incomplete option: --bogus'],
    [['--crate', 'c', '--file'], 'unknown or incomplete option: --file'],
    [[], '--crate and --file are required'],
  ]) {
    const result = spawnSync(process.execPath, [runner, ...argv], { encoding: 'utf8' });
    assert.equal(result.status, 1, argv.join(' '));
    assert.equal(result.stdout, '');
    assert.equal(result.stderr, `${message}; run with --help for the usage\n`);
  }
});

test('--crate-root names a crate root other than src/lib.rs', needsTool, t => {
  const r = rig(t);
  const crate = path.join(r.repo, 'calc');
  renameSync(r.file, path.join(crate, 'src', 'calc.rs'));
  const list = (...extra) => spawnSync(process.execPath, [runner, '--crate', crate, '--file', 'src/calc.rs',
    '--list', '--max', '50', ...extra], { env: r.env, encoding: 'utf8' });
  const missing = list();
  assert.equal(missing.status, 1);
  assert.match(missing.stderr, /src\/lib\.rs is not a file in /);
  const listed = list('--crate-root', 'src/calc.rs');
  assert.equal(listed.status, 0, listed.stderr);
  assert.match(listed.stdout, /^[1-9]\d* mutants in src\/calc\.rs; listing [1-9]/);
  assert.match(listed.stdout, /clamp_percent/);
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

test('starts no mutant the slowest so far would carry past the budget and records the rest as not run', needsTool, t => {
  const r = rig(t);
  // The first mutant ends near 4 s of a 6 s budget, and another as slow would end near 7.5 s,
  // so the guard stops there although the others would take 0.2 s.
  const result = run(r, ['--budget', '6', '--max', '50'], { STUB_FIRST_DELAY: '3000', STUB_DELAY: '200' });
  assert.equal(result.status, 3, result.stderr);
  const [first, ...rest] = r.results().results;
  assert.equal(r.calls().length, 2);
  assert.ok(['CAUGHT', 'MISSED', 'TIMEOUT', 'UNVIABLE'].includes(first.verdict), JSON.stringify(first));
  assert.ok(rest.length > 0 && rest.every(entry => entry.verdict === 'NOT RUN'), JSON.stringify(rest));
  assert.match(result.stdout, /\[2\/\d+\] NOT RUN for \d+ mutants: the budget would end first/);
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
