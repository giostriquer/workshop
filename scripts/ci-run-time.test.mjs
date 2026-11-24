import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const helper = path.resolve(path.dirname(fileURLToPath(import.meta.url)),
  '../plugins/workbench/skills/file-pr/scripts/ci-run-time.mjs');
const { compare, github, main, markdown, median, options, report } = await import(pathToFileURL(helper).href);

const START = Date.parse('2026-01-05T10:00:00Z');
const at = seconds => new Date(START + seconds * 1000).toISOString();
const TODAY = new Date('2026-01-06T08:00:00Z');
const LIMIT = { percent: 10, seconds: 20 };

const check = (name, seconds, extra = {}) => ({ __typename: 'CheckRun', workflowName: 'CI', name, status: 'COMPLETED',
  conclusion: 'SUCCESS', startedAt: at(0), completedAt: at(seconds), detailsUrl: '', ...extra });
const job = (name, seconds, extra = {}) => ({ name, conclusion: 'success', startedAt: at(0), completedAt: at(seconds), ...extra });
const step = (name, seconds) => ({ name, startedAt: at(0), completedAt: at(seconds) });
const pull = rollup => ({ number: 12, url: 'https://github.com/acme/webapp/pull/12',
  headRefOid: 'abc1234567890abc1234567890abc1234567890a', baseRefName: 'main', statusCheckRollup: rollup });

function fake({ pr, workflows = ['CI'], lists = {}, views = {} }) {
  const calls = [];
  const read = async args => {
    calls.push(args);
    if (args[0] === 'pr') return pr;
    if (args[0] === 'workflow') return workflows.map(name => ({ name }));
    const value = flag => args[args.indexOf(flag) + 1];
    if (args[1] === 'list') return (lists[`${value('--workflow')}:${args.includes('--event') ? value('--event') : 'any'}`] ?? []).map(databaseId => ({ databaseId }));
    if (args[1] === 'view' && views[args[2]]) return views[args[2]];
    throw new Error(`unexpected gh call: ${args.join(' ')}`);
  };
  return { read, calls };
}

const config = (...argv) => options(['--pr', '12', ...argv]);
const statuses = result => Object.fromEntries(result.jobs.map(row => [row.key, row.status]));

test('options: defaults, every flag, and refusals', () => {
  assert.deepEqual(config(), { pr: 12, repo: null, jobs: [], baseRuns: 3, percent: 10, seconds: 20, json: false, help: false });
  assert.deepEqual(config('--repo', 'acme/webapp', '--job', 'Unit', '--job', 'Lint', '--base-runs', '5', '--percent', '15', '--seconds', '30', '--json'),
    { pr: 12, repo: 'acme/webapp', jobs: ['Unit', 'Lint'], baseRuns: 5, percent: 15, seconds: 30, json: true, help: false });
  assert.equal(options(['--help']).help, true);
  assert.throws(() => options([]), /--pr needs a pull request number/);
  assert.throws(() => options(['--pr', '0']), /--pr needs a pull request number/);
  assert.throws(() => options(['--pr', '1.5']), /--pr needs a pull request number/);
  assert.throws(() => options(['--pr']), /--pr needs a value/);
  assert.throws(() => config('--percent', 'ten'), /--percent needs a number/);
  assert.throws(() => config('--seconds', '-1'), /--seconds needs a number/);
  assert.throws(() => config('--base-runs', '0'), /--base-runs needs a whole number above 0/);
  assert.throws(() => config('--base-runs', '2.5'), /--base-runs needs a whole number above 0/);
  assert.throws(() => config('--job'), /--job needs a value/);
  assert.throws(() => config('--verbose'), /Unknown argument: --verbose/);
});

test('median: odd and even counts, input order kept', () => {
  const values = [30, 10, 20];
  assert.equal(median(values), 20);
  assert.deepEqual(values, [30, 10, 20]);
  assert.equal(median([40, 10, 20, 30]), 25);
  assert.equal(median([7]), 7);
});

test('compare: a job is over the limit only beyond both the percent and the seconds', () => {
  const status = (after, samples) => compare(after, samples, LIMIT).status;
  assert.equal(status(120, [100, 100, 100]), 'within', 'exactly 20 s is not over');
  assert.equal(status(121, [100, 100, 100]), 'slower');
  assert.equal(status(220, [200, 200, 200]), 'within', 'exactly 10% is not over');
  assert.equal(status(15, [10, 10, 10]), 'within', '50% but only 5 s');
  assert.equal(status(1230, [1200, 1200, 1200]), 'within', '30 s but only 2.5%');
  assert.equal(status(70, [100, 100, 100]), 'faster');
  assert.equal(status(79, [100, 100, 100]), 'faster');
  assert.equal(status(80, [100, 100, 100]), 'within');
  assert.equal(status(130, [90, 100, 130]), 'slower-in-range', 'a base run already took this long');
  assert.equal(status(131, [90, 100, 130]), 'slower');
  assert.equal(status(30, []), 'new');
  assert.equal(status(30, [0, 0, 0]), 'slower', 'a base of 0 s has no percent');
  assert.equal(status(20, [0, 0, 0]), 'within');
  assert.deepEqual(compare(150, [90, 100, 130], LIMIT),
    { status: 'slower', before: 100, change: 50, percent: 50, fastest: 90, slowest: 130, runs: 3 });
});

test('report: each kind of pull request job gets its status, and rows that are not jobs are left out', async () => {
  const { read } = fake({
    pr: pull([check('Unit tests', 300), check('Lint', 61), check('New suite', 90), check('Build', 200, { conclusion: 'FAILURE' }),
      check('Deploy preview', 0, { status: 'IN_PROGRESS', conclusion: '', completedAt: null }),
      check('Docs', 5, { conclusion: 'SKIPPED' }), check('Advisory', 5, { conclusion: 'NEUTRAL' }),
      check('External review', 40, { workflowName: '' }),
      { __typename: 'StatusContext', context: 'legacy/status', state: 'SUCCESS' }]),
    lists: { 'CI:push': [1, 2, 3] },
    views: { 1: { jobs: [job('Unit tests', 100), job('Lint', 60), job('Build', 180)] },
      2: { jobs: [job('Unit tests', 110), job('Lint', 62), job('Build', 190)] },
      3: { jobs: [job('Unit tests', 90), job('Lint', 58), job('Build', 200)] } },
  });
  const result = await report(config('--job', 'lint'), read, TODAY);
  assert.deepEqual(statuses(result), { 'CI / Unit tests': 'slower', 'CI / Lint': 'within', 'CI / New suite': 'new',
    'CI / Build': 'not-compared', 'CI / Deploy preview': 'running' });
  assert.deepEqual(result.jobs.find(row => row.name === 'Unit tests'), { key: 'CI / Unit tests', workflow: 'CI', name: 'Unit tests',
    after: 300, status: 'slower', before: 100, change: 200, percent: 200, fastest: 90, slowest: 110, runs: 3, steps: [], named: false });
  assert.equal(result.jobs.find(row => row.name === 'Build').state, 'failure');
  assert.equal(result.jobs.find(row => row.name === 'Lint').named, true, '--job matches part of the name in any letter case');
  assert.deepEqual({ pr: result.pr, head: result.head, base: result.base, readOn: result.readOn, limit: result.limit, baseRuns: result.baseRuns },
    { pr: 12, head: 'abc1234567890abc1234567890abc1234567890a', base: 'main', readOn: '2026-01-06', limit: LIMIT, baseRuns: 3 });
});

test('report: base samples are the newest successful jobs, from push runs first', async () => {
  const views = Object.fromEntries([100, 500, 110, 120, 130, 140, 150, 160, 170].map((seconds, index) =>
    [index + 1, { jobs: [job('Unit tests', seconds, index === 1 ? { conclusion: 'skipped' } : {}), job('Rare', 40, index < 6 ? { conclusion: 'skipped' } : {})] }]));
  const { read, calls } = fake({ pr: pull([check('Unit tests', 100), check('Rare', 40)]),
    lists: { 'CI:push': [1, 2, 3, 4, 5, 6, 7, 8, 9] }, views });
  const result = await report(config(), read, TODAY);
  const unit = result.jobs.find(row => row.name === 'Unit tests');
  assert.deepEqual([unit.fastest, unit.before, unit.slowest, unit.runs], [100, 110, 120, 3], 'the skipped run gives no sample, and the next run fills its place');
  assert.equal(result.jobs.find(row => row.name === 'Rare').runs, 3, 'a job skipped in the newest runs takes older ones');
  const list = calls.find(args => args[0] === 'run' && args[1] === 'list');
  assert.deepEqual(list, ['run', 'list', '--workflow', 'CI', '--branch', 'main', '--status', 'success', '--event', 'push', '--limit', '9', '--json', 'databaseId']);
});

test('report: a base with no push run is read from any event, and a workflow the base does not have is new', async () => {
  const { read, calls } = fake({ pr: pull([check('Unit tests', 100), check('Smoke', 30, { workflowName: 'Nightly' }),
    check('Fresh', 50, { workflowName: 'Added here' })]), workflows: ['CI', 'Nightly'],
  lists: { 'CI:push': [1], 'Nightly:any': [2] }, views: { 1: { jobs: [job('Unit tests', 95)] }, 2: { jobs: [job('Smoke', 30)] } } });
  const result = await report(config('--repo', 'acme/webapp'), read, TODAY);
  assert.deepEqual(statuses(result), { 'CI / Unit tests': 'within', 'Nightly / Smoke': 'within', 'Added here / Fresh': 'new' });
  const lists = calls.filter(args => args[0] === 'run' && args[1] === 'list').map(args => [args[args.indexOf('--workflow') + 1], args.includes('--event')]);
  assert.deepEqual(lists.sort(), [['CI', true], ['Nightly', false], ['Nightly', true]]);
  assert.ok(calls.every(args => args[args.indexOf('--repo') + 1] === 'acme/webapp'), 'every gh call names the repository');
});

test('report: the newest of two rows for one job counts, and a pull request with no job reads no base', async () => {
  const twice = fake({ pr: pull([check('Unit tests', 100, { startedAt: at(0), completedAt: at(100) }),
    check('Unit tests', 400, { startedAt: at(1000), completedAt: at(1400) })]),
  lists: { 'CI:push': [1] }, views: { 1: { jobs: [job('Unit tests', 100)] } } });
  assert.equal((await report(config(), twice.read, TODAY)).jobs[0].after, 400);
  const none = fake({ pr: pull([check('Docs', 5, { conclusion: 'SKIPPED' })]) });
  assert.deepEqual((await report(config(), none.read, TODAY)).jobs, []);
  assert.deepEqual(none.calls.map(args => args[0]), ['pr']);
});

test('report: a slower job names the three steps that grew most, from its own run', async () => {
  const { read } = fake({
    pr: pull([check('Unit tests', 300, { detailsUrl: 'https://github.com/acme/webapp/actions/runs/77/job/901' })]),
    lists: { 'CI:push': [1, 2, 3] },
    views: { 77: { jobs: [{ ...job('Other', 10), databaseId: 900, steps: [step('Install', 999)] },
      { ...job('Unit tests', 300), databaseId: 901, steps: [step('Install', 60), step('Test', 200), step('Upload', 12),
        step('Cache', 16), step('Checkout', 9), { name: 'Skipped step', startedAt: null, completedAt: null }] }] },
    1: { jobs: [job('Unit tests', 100, { steps: [step('Install', 10), step('Test', 80), step('Cache', 4), step('Checkout', 5)] })] },
    2: { jobs: [job('Unit tests', 100, { steps: [step('Install', 14), step('Test', 82), step('Cache', 6), step('Checkout', 4)] })] },
    3: { jobs: [job('Unit tests', 100, { steps: [step('Install', 12), step('Test', 90), step('Cache', 5), step('Checkout', 4)] })] } },
  });
  const [row] = (await report(config(), read, TODAY)).jobs;
  assert.deepEqual(row.steps, [{ name: 'Test', after: 200, before: 82, change: 118 }, { name: 'Install', after: 60, before: 12, change: 48 },
    { name: 'Upload', after: 12, before: 0, change: 12 }], 'largest growth first; a step the base lacks counts from 0; growth of 5 s or less is left out');
});

const RESULT = { pr: 12, url: 'https://github.com/acme/webapp/pull/12', head: 'abc1234567890abc', base: 'main', readOn: '2026-01-06',
  limit: LIMIT, baseRuns: 3, jobs: [
    { key: 'CI / Lint', status: 'within', before: 60, after: 62, change: 2, percent: 3.33, named: false },
    { key: 'CI / Unit | fast', status: 'slower', before: 217, after: 545, change: 328, percent: 151.15, fastest: 200, slowest: 230, runs: 3, named: false,
      steps: [{ name: 'Test', after: 500, before: 180, change: 320 }] },
    { key: 'CI / Types', status: 'slower-in-range', before: 80, after: 119, change: 39, percent: 48.75, fastest: 72, slowest: 119, runs: 3, named: false },
    { key: 'CI / New suite', status: 'new', after: 88, named: false },
    { key: 'CI / Build', status: 'not-compared', state: 'failure', after: 200, named: false },
    { key: 'CI / Deploy', status: 'running', after: null, named: false },
    { key: 'CI / Docs', status: 'faster', before: 150, after: 104, change: -46, percent: -30.67, named: false },
    { key: 'CI / Format', status: 'within', before: 43, after: 43, change: 0, percent: 0, named: true },
  ] };

test('markdown: the section has one fixed form', () => {
  assert.equal(markdown(RESULT), `## CI run time

Before is the median of the last 3 successful \`main\` runs of each job; after is this pull request's run at \`abc1234567\`. Read from GitHub on 2026-01-06. A job is over the limit when it changes by more than 10% and more than 20s.

| Job | Before (median of \`main\`) | After | Change |
|---|---|---|---|
| CI / Unit \\| fast | 3m37s | 9m05s | **+5m28s (+151%)** |
| CI / Types | 1m20s | 1m59s | +39s (+49%) |
| CI / New suite | no job of this name on \`main\` | 1m28s | new |
| CI / Docs | 2m30s | 1m44s | -46s (-31%) |
| CI / Build |  | 3m20s | not compared: failure |
| CI / Deploy |  |  | still running |
| CI / Format | 0m43s | 0m43s | 0s (0%) |

- **CI / Unit | fast (+5m28s):** _cause and decision not written yet_
  - Steps that grew most: \`Test\` +5m20s (8m20s, 3m00s on \`main\`).
- **CI / Types (+39s) is inside the range of \`main\`:** its last 3 runs took 1m12s to 1m59s.
- Job time in total for the 5 compared jobs: 9m10s before, 14m33s after (+5m23s).

<details><summary>All 8 jobs</summary>

| Job | Before (median of \`main\`) | After | Change |
|---|---|---|---|
| CI / Unit \\| fast | 3m37s | 9m05s | **+5m28s (+151%)** |
| CI / Types | 1m20s | 1m59s | +39s (+49%) |
| CI / New suite | no job of this name on \`main\` | 1m28s | new |
| CI / Docs | 2m30s | 1m44s | -46s (-31%) |
| CI / Build |  | 3m20s | not compared: failure |
| CI / Deploy |  |  | still running |
| CI / Lint | 1m00s | 1m02s | +2s (+3%) |
| CI / Format | 0m43s | 0m43s | 0s (0%) |

</details>
`);
});

test('markdown: with nothing over the limit it says so, and with every row shown it folds nothing', () => {
  const quiet = markdown({ ...RESULT, jobs: [{ key: 'CI / Lint', status: 'within', before: 60, after: 62, change: 2, percent: 3.33, named: true },
    { key: 'CI / Zero', status: 'slower', before: 0, after: 30, change: 30, percent: null, fastest: 0, slowest: 0, runs: 3, named: false, steps: [] }] });
  assert.ok(!quiet.includes('<details>'));
  assert.ok(quiet.includes('| CI / Zero | 0m00s | 0m30s | **+30s** |'), 'a base of 0 s shows no percent');
  assert.ok(!quiet.includes('Steps that grew most'), 'no step line without steps');
  const calm = markdown({ ...RESULT, jobs: [{ key: 'CI / Lint', status: 'within', before: 60, after: 62, change: 2, percent: 3.33, named: false }] });
  assert.ok(calm.includes('\n\n- No job is over the limit.\n- Job time in total for the 1 compared jobs: 1m00s before, 1m02s after (+2s).\n\n<details>'));
  assert.ok(!calm.includes('|---|---|---|---|\n\n-'), 'no empty table above the notes');
  const fresh = markdown({ ...RESULT, jobs: [{ key: 'CI / New suite', status: 'new', after: 88, named: false }] });
  assert.ok(fresh.endsWith('| new |\n\n- No job is over the limit.\n'), 'no total line with no compared job');
});

function sink() {
  const chunks = [];
  return { write: text => chunks.push(text), text: () => chunks.join('') };
}

test('main: help, the section, JSON, and exit 3 with nothing written when no job ran', async () => {
  const help = sink();
  assert.equal(await main(['--help'], { out: help }), 0);
  assert.match(help.text(), /^Usage: node ci-run-time\.mjs --pr <number>/);
  const { read } = fake({ pr: pull([check('Unit tests', 100)]), lists: { 'CI:push': [1] }, views: { 1: { jobs: [job('Unit tests', 100)] } } });
  const section = sink();
  assert.equal(await main(['--pr', '12'], { read, out: section, today: TODAY }), 0);
  assert.ok(section.text().startsWith('## CI run time\n\nBefore is the median of the last 3 successful `main` runs'));
  const json = sink();
  assert.equal(await main(['--pr', '12', '--json'], { read, out: json, today: TODAY }), 0);
  assert.equal(JSON.parse(json.text()).jobs[0].status, 'within');
  const out = sink();
  const err = sink();
  const none = fake({ pr: pull([check('Docs', 5, { conclusion: 'SKIPPED' })]) });
  assert.equal(await main(['--pr', '12'], { read: none.read, out, err, today: TODAY }), 3);
  assert.equal(out.text(), '');
  assert.equal(err.text(), 'No GitHub Actions job ran on abc1234567: write no CI run time section.\n');
});

test('github: a server error is tried again, another error is not, and the tries end', async () => {
  const failure = stderr => Object.assign(new Error('Command failed'), { stderr });
  const runner = outcomes => {
    const seen = [];
    return { seen, run: async (command, args) => {
      seen.push([command, ...args]);
      const next = outcomes.shift();
      if (next instanceof Error) throw next;
      return { stdout: next };
    } };
  };
  const flaky = runner([failure('HTTP 502: Server Error'), '{"ok":true}']);
  assert.deepEqual(await github(['run', 'view', '1'], { run: flaky.run, pause: 0 }), { ok: true });
  assert.deepEqual(flaky.seen, [['gh', 'run', 'view', '1'], ['gh', 'run', 'view', '1']]);
  const denied = runner([failure('HTTP 404: Not Found'), '{"ok":true}']);
  await assert.rejects(github(['pr', 'view', '9'], { run: denied.run, pause: 0 }), /^Error: gh pr view 9 failed: HTTP 404: Not Found$/);
  assert.equal(denied.seen.length, 1);
  const down = runner([failure('HTTP 503'), failure('HTTP 503'), failure('HTTP 503'), '{"ok":true}']);
  await assert.rejects(github(['pr', 'view', '9'], { run: down.run, pause: 0 }), /failed: HTTP 503$/);
  assert.equal(down.seen.length, 3);
});

test('command line: it calls gh on PATH, writes the section, and reports a gh failure with exit 1', t => {
  const bin = mkdtempSync(path.join(os.tmpdir(), 'ci-run-time-test-'));
  t.after(() => rmSync(bin, { recursive: true, force: true }));
  const answers = { pr: pull([check('Unit tests', 300)]), workflow: [{ name: 'CI' }], list: [{ databaseId: 1 }], view: { jobs: [job('Unit tests', 100)] } };
  writeFileSync(path.join(bin, 'gh'), `#!${process.execPath}
const args = process.argv.slice(2);
if (process.env.FAKE_GH_FAILS) { process.stderr.write('HTTP 401: Bad credentials\\n'); process.exit(1); }
const answers = ${JSON.stringify(answers)};
process.stdout.write(JSON.stringify(args[0] === 'run' ? answers[args[1]] : answers[args[0]]));
`);
  chmodSync(path.join(bin, 'gh'), 0o755);
  const run = env => spawnSync(process.execPath, [helper, '--pr', '12'],
    { encoding: 'utf8', env: { ...process.env, PATH: `${bin}${path.delimiter}${process.env.PATH}`, ...env } });
  const passed = run({});
  assert.equal(passed.status, 0, passed.stderr);
  assert.match(passed.stdout, /^## CI run time\n/);
  assert.ok(passed.stdout.includes('| CI / Unit tests | 1m40s | 5m00s | **+3m20s (+200%)** |'));
  assert.ok(passed.stdout.includes('- **CI / Unit tests (+3m20s):** _cause and decision not written yet_'));
  const failed = run({ FAKE_GH_FAILS: '1' });
  assert.equal(failed.status, 1);
  assert.equal(failed.stdout, '');
  assert.match(failed.stderr, /^gh pr view 12 --json [a-zA-Z,]+ failed: HTTP 401: Bad credentials\n$/);
});
