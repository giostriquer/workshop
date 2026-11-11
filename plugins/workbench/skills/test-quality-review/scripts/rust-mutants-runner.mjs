#!/usr/bin/env node
// Mutation testing for a Rust crate that Bazel builds and that has no Cargo manifest:
//   node rust-mutants-runner.mjs --crate <dir> --file <path in crate> [--crate-root src/lib.rs]
//       [--base <ref> | --in-diff <patch>] [--max 10] [--budget 900] [--out <dir>] [--bazel bazelisk] [--list]
//       -- <bazel test arguments, such as //lib/parser:parser_test>
// cargo-mutants lists the mutants from a scratch copy of the crate's .rs files under a
// stand-in Cargo.toml, which needs no build. Each mutant is then written into the file,
// tested with `<bazel> test`, one at a time, and the file is restored and its digest checked.
// --base keeps the mutants on lines changed since the merge base with that ref,
// uncommitted changes included; --in-diff does it from a diff with paths relative to the
// crate directory, for a checkout where git cannot run. Over --max mutants, an even
// spread is taken. --budget bounds the whole run in seconds: no mutant starts that the
// slowest one so far would carry past it, and the remaining ones are NOT RUN.
// Verdicts: CAUGHT (tests failed), MISSED (tests passed), TIMEOUT (a test hit the timeout,
// 5x the baseline test time and at least 20 s), UNVIABLE (the build failed), INCONCLUSIVE
// (any other Bazel exit), NOT APPLIED (the diff did not match the file), NOT RUN (budget).
// Exit: 0 nothing missed or uncertain, 2 a mutant MISSED, 3 none missed but some TIMEOUT,
// INCONCLUSIVE, NOT APPLIED or NOT RUN, 4 the baseline failed, 1 usage or run failure,
// 128+n after signal n.
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, statSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MANIFEST = '[package]\nname = "mutants-scratch"\nversion = "0.0.0"\nedition = "2021"\n\n[lib]\npath = "ROOT"\n\n[workspace]\n';
const SIGNALS = ['SIGINT', 'SIGTERM', 'SIGHUP'];
const KILL_GRACE_MS = 60000;
const digest = data => createHash('sha256').update(data).digest('hex');

export function parse(argv) {
  const split = argv.indexOf('--');
  const flags = split < 0 ? argv : argv.slice(0, split);
  const options = { crateRoot: 'src/lib.rs', max: 10, budget: 900, bazel: 'bazelisk', list: false,
    bazelArgs: split < 0 ? [] : argv.slice(split + 1) };
  const names = { '--crate': 'crate', '--file': 'file', '--crate-root': 'crateRoot', '--base': 'base',
    '--in-diff': 'inDiff', '--out': 'out', '--bazel': 'bazel', '--max': 'max', '--budget': 'budget' };
  for (let i = 0; i < flags.length; i += 1) {
    const [flag, value] = [flags[i], flags[i + 1]];
    if (flag === '--list') options.list = true;
    else if (names[flag] && value !== undefined && !value.startsWith('--')) {
      options[names[flag]] = ['max', 'budget'].includes(names[flag]) ? Number(value) : value;
      i += 1;
    } else throw new Error(`unknown or incomplete option: ${flag}`);
  }
  if (!options.crate || !options.file) throw new Error('--crate and --file are required');
  if (options.base && options.inDiff) throw new Error('--base and --in-diff exclude each other');
  if (!(options.max >= 1) || !(options.budget > 0)) throw new Error('--max and --budget take positive numbers');
  if (!options.list && !options.bazelArgs.length) throw new Error('missing the bazel test arguments after --');
  return options;
}

// Applies a unified diff to text exactly: every hunk's old side must match at its stated
// line, with no fuzz or offset. Returns null when one does not.
export function applyDiff(text, diff) {
  const lines = text.match(/[^\n]*\n|[^\n]+$/g) ?? [];
  const body = diff.split('\n');
  const result = [];
  let [copied, hunks] = [0, 0];
  for (let i = 0; i < body.length; i += 1) {
    const header = body[i].match(/^@@ -(\d+)(?:,(\d+))? \+\d+(?:,(\d+))? @@/);
    if (!header) continue;
    let [oldLeft, newLeft] = [Number(header[2] ?? 1), Number(header[3] ?? 1)];
    const start = oldLeft === 0 ? Number(header[1]) : Number(header[1]) - 1;
    const [before, after] = [[], []];
    while (oldLeft > 0 || newLeft > 0) {
      i += 1;
      if (i >= body.length) return null;
      const [mark, line] = [body[i][0] ?? ' ', `${body[i].slice(1)}\n`];
      if (mark !== '+') { before.push(line); oldLeft -= 1; }
      if (mark !== '-') { after.push(line); newLeft -= 1; }
      if (body[i + 1]?.startsWith('\\')) {
        if (mark !== '+') before[before.length - 1] = before.at(-1).slice(0, -1);
        if (mark !== '-') after[after.length - 1] = after.at(-1).slice(0, -1);
        i += 1;
      }
    }
    if (start < copied || lines.slice(start, start + before.length).join('') !== before.join('')) return null;
    result.push(...lines.slice(copied, start), ...after);
    copied = start + before.length;
    hunks += 1;
  }
  return hunks ? [...result, ...lines.slice(copied)].join('') : null;
}

export const spread = (items, max) => items.length <= max ? items
  : Array.from({ length: max }, (_, i) => items[Math.floor((i * items.length) / max)]);

export function testTimeout(baselineOutput) {
  const times = [...baselineOutput.matchAll(/\bPASSED in ([\d.]+)s/g)].map(match => Number(match[1]));
  return times.length ? Math.max(20, Math.ceil(5 * Math.max(...times))) : null;
}

// Bazel exits 0 when every test passed, 1 when the build failed and 3 when a test failed
// or timed out; the summary line tells those two apart.
export function verdict(code, output) {
  if (code === 0) return 'MISSED';
  if (code === 1) return 'UNVIABLE';
  if (code === 3 && /\bFAILED in [\d.]+s/.test(output)) return 'CAUGHT';
  if (code === 3 && /\bTIMEOUT in [\d.]+s/.test(output)) return 'TIMEOUT';
  return 'INCONCLUSIVE';
}

function copySources(from, to) {
  for (const entry of readdirSync(from, { withFileTypes: true })) {
    if (entry.isSymbolicLink() || /^(\.|bazel-|target$)/.test(entry.name)) continue;
    const source = path.join(from, entry.name);
    if (entry.isDirectory()) copySources(source, path.join(to, entry.name));
    else if (entry.name.endsWith('.rs')) {
      mkdirSync(to, { recursive: true });
      copyFileSync(source, path.join(to, entry.name));
    }
  }
}

function git(args, cwd) {
  const run = spawnSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return { ok: run.status === 0, out: run.stdout ?? '', err: (run.stderr || run.error?.message || '').trim() };
}

// An untracked file is new in every line, so it takes no filter (null).
function changedSince(options) {
  const tracked = git(['ls-files', '--', options.file], options.crate);
  if (!tracked.ok) throw new Error(`--base needs a git checkout: ${tracked.err}`);
  if (!tracked.out.trim()) return null;
  const base = git(['merge-base', options.base, 'HEAD'], options.crate);
  if (!base.ok) throw new Error(`git merge-base ${options.base} HEAD failed: ${base.err}`);
  const changed = git(['diff', '--no-ext-diff', '--no-color', '--no-textconv', '--relative',
    '--src-prefix=a/', '--dst-prefix=b/', base.out.trim(), '--', options.file], options.crate);
  if (!changed.ok) throw new Error(`git diff failed: ${changed.err}`);
  return changed.out;
}

function listMutants(options) {
  const scratch = mkdtempSync(path.join(os.tmpdir(), 'rust-mutants-scratch-'));
  try {
    copySources(options.crate, scratch);
    writeFileSync(path.join(scratch, 'Cargo.toml'), MANIFEST.replace('ROOT', options.crateRoot));
    const command = ['mutants', '--no-config', '--list', '--json', '--diff', '--file', options.file];
    const changed = options.inDiff ? readFileSync(options.inDiff, 'utf8') : options.base ? changedSince(options) : null;
    if (changed !== null) {
      if (!changed.trim()) return [];
      const files = changed.split('\n').filter(line => line.startsWith('+++ ')).map(line => line.slice(4).replace(/\t.*$/, ''));
      if (!files.some(name => name === options.file || name === `b/${options.file}`)) {
        throw new Error(`the diff changes no ${options.file}; make it with git diff --relative in ${options.crate}`);
      }
      writeFileSync(path.join(scratch, 'changed.diff'), changed);
      command.push('--in-diff', 'changed.diff');
    }
    const listed = spawnSync('cargo', command, { cwd: scratch, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
    if (listed.status !== 0) throw new Error(`cargo mutants --list failed: ${(listed.stderr || listed.error?.message || '').trim().slice(-600)}`);
    return listed.stdout.trim() ? JSON.parse(listed.stdout) : [];
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

export async function main(argv) {
  let options;
  try {
    options = parse(argv);
  } catch (error) {
    console.error(`usage: ${error.message}`);
    return 1;
  }
  options.crate = path.resolve(options.crate);
  if (options.inDiff) options.inDiff = path.resolve(options.inDiff);
  const target = path.resolve(options.crate, options.file);
  options.file = path.relative(options.crate, target);
  if (!existsSync(target) || !statSync(target).isFile() || !existsSync(path.join(options.crate, options.crateRoot))) {
    console.error(`STOP: ${options.file} or ${options.crateRoot} is not a file in ${options.crate}`);
    return 1;
  }
  const original = readFileSync(target);
  const before = digest(original);
  let found;
  try {
    found = listMutants(options);
  } catch (error) {
    console.error(`STOP: ${error.message}`);
    return 1;
  }
  const chosen = spread(found, options.max);
  const since = options.base ? ` on lines changed since ${options.base}` : options.inDiff ? ' on lines the diff changes' : '';
  console.log(`${found.length} mutants in ${options.file}${since}; `
    + `${options.list ? 'listing' : 'running'} ${chosen.length}`);
  if (options.list) {
    for (const mutant of chosen) console.log(`  ${mutant.name}`);
    return 0;
  }
  if (!found.length) {
    if (!since) console.log(`check that ${options.crateRoot} reaches ${options.file} through mod declarations`);
    return 0;
  }

  const out = path.resolve(options.out ?? mkdtempSync(path.join(os.tmpdir(), 'rust-mutants-')));
  mkdirSync(out, { recursive: true });
  writeFileSync(path.join(out, `original-${path.basename(target)}`), original);
  console.log(`the original ${options.file} is saved in ${out}`);
  const started = Date.now();
  const elapsed = () => (Date.now() - started) / 1000;
  let child = null;
  let stopping = null;
  let unrestored = false;
  const restore = () => {
    try {
      if (digest(readFileSync(target)) !== before) writeFileSync(target, original);
      if (digest(readFileSync(target)) === before) return;
    } catch (error) {
      throw new Error(`${target} was not restored (${error.code ?? error.message}); the original is in ${out}`);
    }
    throw new Error(`${target} was not restored; the original is in ${out}`);
  };
  const onSignal = signal => {
    stopping ??= signal;
    try { restore(); } catch (error) { console.error(`STOP: ${error.message}`); }
    child?.kill('SIGINT');
  };
  const bazel = (args, log) => new Promise(resolve => {
    let output = '';
    let overBudget = false;
    const proc = spawn(options.bazel, ['test', ...args], { cwd: options.crate, stdio: ['ignore', 'pipe', 'pipe'] });
    child = proc;
    proc.stdout.on('data', chunk => { output += chunk; });
    proc.stderr.on('data', chunk => { output += chunk; });
    const left = Math.max(0, options.budget - elapsed()) * 1000;
    const stop = setTimeout(() => { overBudget = true; proc.kill('SIGINT'); }, left);
    const kill = setTimeout(() => proc.kill('SIGKILL'), left + KILL_GRACE_MS);
    proc.on('error', error => { output += `${error.message}\n`; });
    proc.on('close', code => {
      clearTimeout(stop);
      clearTimeout(kill);
      child = null;
      writeFileSync(log, output);
      resolve({ code, output, overBudget });
    });
  });

  for (const signal of SIGNALS) process.on(signal, onSignal);
  const results = [];
  const report = (label, outcome, seconds, name, note = '') =>
    console.log(`${label} ${outcome.padEnd(12)} ${String(seconds).padStart(5)}s  ${name}${note}`);
  let testTime = null;
  try {
    const baseline = await bazel(options.bazelArgs, path.join(out, 'baseline.log'));
    if (stopping) return 128 + os.constants.signals[stopping];
    if (baseline.code !== 0) {
      const why = baseline.overBudget ? 'did not finish within the budget' : `fail before any mutant (bazel exit ${baseline.code})`;
      console.error(`STOP: the tests ${why}; see ${out}/baseline.log`);
      return 4;
    }
    testTime = testTimeout(baseline.output);
    console.log(`baseline passed in ${Math.round(elapsed())}s; test timeout ${testTime ? `${testTime}s` : 'left to Bazel'}`);
    const args = [...(testTime ? [`--test_timeout=${testTime}`] : []), ...options.bazelArgs];
    let slowest = 0;
    for (const [index, mutant] of chosen.entries()) {
      const label = `[${index + 1}/${chosen.length}]`;
      if (stopping || elapsed() + slowest > options.budget) {
        for (const rest of chosen.slice(index)) results.push({ name: rest.name, verdict: 'NOT RUN', seconds: 0 });
        console.log(`${label} NOT RUN for ${chosen.length - index} mutants: ${stopping ?? 'the budget would end first'}`);
        break;
      }
      const mutated = applyDiff(original.toString('utf8'), mutant.diff ?? '');
      if (mutated === null || digest(mutated) === before) {
        results.push({ name: mutant.name, verdict: 'NOT APPLIED', seconds: 0 });
        report(label, 'NOT APPLIED', 0, mutant.name);
        continue;
      }
      const log = path.join(out, `mutant-${String(index + 1).padStart(2, '0')}.log`);
      writeFileSync(path.join(out, `mutant-${String(index + 1).padStart(2, '0')}.diff`), mutant.diff);
      const begun = Date.now();
      writeFileSync(target, mutated);
      const tested = await bazel(args, log);
      restore();
      const took = (Date.now() - begun) / 1000;
      const seconds = Math.round(took);
      slowest = Math.max(slowest, took);
      const outcome = tested.overBudget || stopping ? 'INCONCLUSIVE' : verdict(tested.code, tested.output);
      results.push({ name: mutant.name, verdict: outcome, seconds, bazelExit: tested.code, log });
      const reason = tested.overBudget ? ', budget' : stopping ? `, ${stopping}` : '';
      const note = outcome === 'INCONCLUSIVE' ? ` (bazel exit ${tested.code}${reason})` : '';
      report(label, outcome, seconds, mutant.name, note);
      if (index === 0 && chosen.length > 1 && !stopping) {
        console.log(`estimate: ${chosen.length - 1} more x ${seconds}s = ${((chosen.length - 1) * seconds / 60).toFixed(1)} min`);
      }
    }
  } catch (error) {
    console.error(`STOP: ${error.message}`);
    return 1;
  } finally {
    for (const signal of SIGNALS) process.off(signal, onSignal);
    try { restore(); } catch (error) { console.error(`STOP: ${error.message}`); unrestored = true; }
  }

  const counts = {};
  for (const result of results) counts[result.verdict] = (counts[result.verdict] ?? 0) + 1;
  writeFileSync(path.join(out, 'results.json'), `${JSON.stringify({ file: options.file, bazelArgs: options.bazelArgs,
    base: options.base ?? null, inDiff: options.inDiff ?? null, found: found.length, testTimeout: testTime, counts, results }, null, 2)}\n`);
  console.log(`summary: ${Object.entries(counts).map(([name, count]) => `${count} ${name}`).join(', ')}; `
    + `${found.length} found; restored ${options.file} (sha256 ${before.slice(0, 12)}); details in ${out}`);
  if (unrestored) return 1;
  if (stopping) return 128 + os.constants.signals[stopping];
  if (counts.MISSED) return 2;
  return Object.keys(counts).some(name => !['CAUGHT', 'UNVIABLE'].includes(name)) ? 3 : 0;
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main(process.argv.slice(2));
}
