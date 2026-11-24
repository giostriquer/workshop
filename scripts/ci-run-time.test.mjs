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
const HEAD = 'abc1234567890abc1234567890abc1234567890a';

const check = (name, seconds, extra = {}) => ({ __typename: 'CheckRun', workflowName: 'CI', name, status: 'COMPLETED',
  conclusion: 'SUCCESS', startedAt: at(0), completedAt: at(seconds), detailsUrl: '', ...extra });
const job = (name, seconds, extra = {}) => ({ name, conclusion: 'success', startedAt: at(0), completedAt: at(seconds), ...extra });
const step = (name, seconds) => ({ name, startedAt: at(0), completedAt: at(seconds) });
const pull = rollup => ({ number: 12, url: 'https://github.com/acme/webapp/pull/12', headRefOid: HEAD, baseRefName: 'main', statusCheckRollup: rollup });
const runs = (...ids) => ids.map(databaseId => ({ databaseId }));

// The exact gh commands the script may send, written out here and not taken from the script.
const prCall = (...scope) => ['pr', 'view', '12', ...scope, '--json', 'number,url,headRefOid,baseRefName,statusCheckRollup'];
const listCall = (workflow, event, { limit = 9, scope = [] } = {}) => ['run', 'list', ...scope, '--workflow', workflow, '--branch', 'main',
  '--status', 'success', '--all', ...(event ? ['--event', event] : []), '--limit', String(limit), '--json', 'databaseId'];
const viewCall = (run, ...scope) => ['run', 'view', String(run), ...scope, '--json', 'jobs'];

// A strict stand-in for gh: it answers only the listed commands and fails on any other.
function fake(answers) {
  const table = new Map(answers.map(([args, value]) => [args.join('\n'), value]));
  const calls = [];
  const read = async args => {
    calls.push(args);
    if (!table.has(args.join('\n'))) throw new Error(`unexpected gh call: ${args.join(' ')}`);
    const value = table.get(args.join('\n'));
    if (value instanceof Error) throw value;
    return value;
  };
  return { read, calls, count: args => calls.filter(call => call.join('\n') === args.join('\n')).length };
}

const config = (...argv) => options(['--pr', '12', ...argv]);
const statuses = result => Object.fromEntries(result.jobs.map(row => [row.key, row.status]));
const named = result => result.jobs.filter(row => row.named).map(row => row.name);

test('options: defaults, every flag, and refusals', () => {
  assert.deepEqual(config(), { pr: 12, repo: null, jobs: [], baseRuns: 3, percent: 10, seconds: 20, json: false, help: false });
  assert.deepEqual(config('--repo', 'acme/webapp', '--job', 'Unit', '--job', 'Lint', '--base-runs', '5', '--percent', '15', '--seconds', '30', '--json'),
    { pr: 12, repo: 'acme/webapp', jobs: ['Unit', 'Lint'], baseRuns: 5, percent: 15, seconds: 30, json: true, help: false });
  assert.equal(options(['--pr', '1']).pr, 1);
  assert.equal(config('--base-runs', '1').baseRuns, 1);
  assert.equal(config('--percent', '0', '--seconds', '0').percent, 0);
  assert.equal(options(['--help']).help, true);
  assert.equal(options(['-h']).help, true);
  assert.throws(() => options([]), /--pr needs a pull request number/);
  assert.throws(() => options(['--pr', '0']), /--pr needs a pull request number/);
  assert.throws(() => options(['--pr', '1.5']), /--pr needs a pull request number/);
  assert.throws(() => options(['--pr']), /--pr needs a value/);
  assert.throws(() => config('--percent', 'ten'), /--percent needs a number/);
  assert.throws(() => config('--seconds', '-1'), /--seconds needs a number/);
  assert.throws(() => config('--base-runs', '0'), /--base-runs needs a whole number above 0/);
  assert.throws(() => config('--base-runs', '2.5'), /--base-runs needs a whole number above 0/);
  assert.throws(() => config('--job'), /--job needs a value/);
  assert.throws(() => config('--job', ''), /--job needs a value/);
  assert.throws(() => config('--repo', ''), /--repo needs a value/);
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
  assert.equal(status(120, [100, 100, 100]), 'within', 'exactly 20 s is not over, at 20%');
  assert.equal(status(121, [100, 100, 100]), 'slower');
  assert.equal(status(330, [300, 300, 300]), 'within', 'exactly 10% is not over, at 30 s');
  assert.equal(status(331, [300, 300, 300]), 'slower');
  assert.equal(status(15, [10, 10, 10]), 'within', '50% but only 5 s');
  assert.equal(status(1230, [1200, 1200, 1200]), 'within', '30 s but only 2.5%');
  assert.equal(status(270, [300, 300, 300]), 'within');
  assert.equal(status(269, [300, 300, 300]), 'faster');
  assert.equal(status(130, [90, 100, 130]), 'slower-in-range', 'a base run already took this long');
  assert.equal(status(131, [90, 100, 130]), 'slower');
  assert.equal(status(30, []), 'new');
  assert.equal(status(20, [0, 0, 0]), 'within');
  assert.deepEqual(compare(30, [0, 0, 0], LIMIT), { status: 'slower', before: 0, change: 30, percent: null, fastest: 0, slowest: 0, runs: 3 },
    'a base of 0 s has no percent');
  assert.deepEqual(compare(150, [90, 100, 130], LIMIT),
    { status: 'slower', before: 100, change: 50, percent: 50, fastest: 90, slowest: 130, runs: 3 });
});

test('report: each kind of pull request job gets its status, and rows that are not jobs are left out', async () => {
  const link = id => `https://github.com/acme/webapp/actions/runs/77/job/${id}`;
  const answers = [
    [prCall(), pull([check('Unit tests', 300, { detailsUrl: link(901) }), check('Lint', 61, { detailsUrl: link(902) }), check('New suite', 90),
      check('Gate', 0), check('Build', 200, { conclusion: 'FAILURE' }),
      check('Deploy preview', 0, { status: 'IN_PROGRESS', conclusion: '', completedAt: null }),
      check('Docs', 5, { conclusion: 'SKIPPED' }), check('Advisory', 5, { conclusion: 'NEUTRAL' }),
      check('External review', 40, { workflowName: '' }),
      { __typename: 'StatusContext', context: 'legacy/status', state: 'SUCCESS' }])],
    [listCall('CI', 'push'), runs(1, 2, 3)],
    [viewCall(1), { jobs: [job('Unit tests', 100), job('Lint', 60), job('Gate', 0), job('Build', 180)] }],
    [viewCall(2), { jobs: [job('Unit tests', 110), job('Lint', 62), job('Gate', 0), job('Build', 190)] }],
    [viewCall(3), { jobs: [job('Unit tests', 90), job('Lint', 58), job('Gate', 0), job('Build', 200)] }],
    [viewCall(77), { jobs: [{ ...job('Unit tests', 300), databaseId: 901, steps: [] }] }],
  ];
  const { read, count } = fake(answers);
  const result = await report(config('--job', 'lint', '--job', 'GATE'), read, TODAY);
  assert.deepEqual(statuses(result), { 'CI / Unit tests': 'slower', 'CI / Lint': 'within', 'CI / New suite': 'new', 'CI / Gate': 'within',
    'CI / Build': 'not-compared', 'CI / Deploy preview': 'running' });
  assert.deepEqual(result.jobs.find(row => row.name === 'Unit tests'), { key: 'CI / Unit tests', workflow: 'CI', name: 'Unit tests', named: false,
    after: 300, status: 'slower', before: 100, change: 200, percent: 200, fastest: 90, slowest: 110, runs: 3, steps: [] });
  assert.deepEqual(result.jobs.find(row => row.name === 'Lint'), { key: 'CI / Lint', workflow: 'CI', name: 'Lint', named: true,
    after: 61, status: 'within', before: 60, change: 1, percent: 100 / 60, fastest: 58, slowest: 62, runs: 3 },
  'a job that is not slower gets no step list');
  assert.deepEqual(result.jobs.find(row => row.name === 'Gate'), { key: 'CI / Gate', workflow: 'CI', name: 'Gate', named: true,
    after: 0, status: 'within', before: 0, change: 0, percent: null, fastest: 0, slowest: 0, runs: 3 }, 'a job of 0 s is compared');
  assert.deepEqual(result.jobs.find(row => row.name === 'Build'), { key: 'CI / Build', workflow: 'CI', name: 'Build', named: false,
    status: 'not-compared', state: 'failure', after: 200 });
  assert.deepEqual(result.jobs.find(row => row.name === 'Deploy preview'), { key: 'CI / Deploy preview', workflow: 'CI', name: 'Deploy preview',
    named: false, status: 'running' });
  assert.deepEqual(named(result), ['Lint', 'Gate'], 'each --job matches part of a name in any letter case; the other rows are not named');
  assert.equal(count(viewCall(77)), 1, 'only the slower job reads its own run');
  assert.deepEqual({ pr: result.pr, head: result.head, base: result.base, readOn: result.readOn, limit: result.limit, baseRuns: result.baseRuns, scanned: result.scanned },
    { pr: 12, head: HEAD, base: 'main', readOn: '2026-01-06', limit: LIMIT, baseRuns: 3, scanned: 9 });
  assert.deepEqual(named(await report(config(), fake(answers).read, TODAY)), [], 'no --job names no row');
});

test('report: base samples are the newest successful jobs, and the scan stops when every job has its samples', async () => {
  const view = (unit, rare) => ({ jobs: [job('Unit tests', unit.seconds, unit.extra), job('Rare', 40, rare ? {} : { conclusion: 'skipped' }), job('Not in this PR', 999)] });
  const complete = fake([[prCall(), pull([check('Unit tests', 100)])], [listCall('CI', 'push'), runs(1, 2, 3, 4, 5, 6, 7, 8, 9)],
    [viewCall(1), view({ seconds: 100 }, false)], [viewCall(2), view({ seconds: 500, extra: { conclusion: 'failure' } }, false)],
    [viewCall(3), view({ seconds: 110 }, false)], [viewCall(4), view({ seconds: 120 }, false)]]);
  const [unit] = (await report(config(), complete.read, TODAY)).jobs;
  assert.deepEqual([unit.fastest, unit.before, unit.slowest, unit.runs], [100, 110, 120, 3], 'a run where the job did not pass gives no sample, and the next run fills its place');
  assert.deepEqual(complete.calls.filter(call => call[0] === 'run' && call[1] === 'view').map(call => call[2]), ['1', '2', '3', '4'], 'runs 5 to 9 are not read');

  const deep = fake([[prCall(), pull([check('Unit tests', 100), check('Rare', 40)])], [listCall('CI', 'push'), runs(1, 2, 3, 4, 5, 6, 7, 8, 9)],
    ...[1, 2, 3, 4, 5, 6].map(id => [viewCall(id), view({ seconds: 100 + id }, false)]),
    ...[7, 8, 9].map(id => [viewCall(id), view({ seconds: 900 }, true)])]);
  const result = await report(config(), deep.read, TODAY);
  assert.equal(result.jobs.find(row => row.name === 'Rare').runs, 3, 'a job skipped in the newest runs takes older ones');
  assert.deepEqual(result.jobs.find(row => row.name === 'Unit tests').slowest, 103, 'older runs add no fourth sample');

  const two = fake([[prCall(), pull([check('Unit tests', 100)])], [listCall('CI', 'push', { limit: 6 }), runs(1, 2)],
    [viewCall(1), view({ seconds: 100 }, false)], [viewCall(2), view({ seconds: 140 }, false)]]);
  assert.equal((await report(config('--base-runs', '2'), two.read, TODAY)).jobs[0].before, 120, '--base-runs sets the sample size and the scan');
});

test('report: a base with no push run is read from any event, a workflow the base lacks is new, and another gh error stops the run', async () => {
  const missing = new Error('gh run list failed: could not find any workflows named Added here');
  const scope = ['--repo', 'acme/webapp'];
  const { read, calls } = fake([
    [prCall(...scope), pull([check('Unit tests', 100), check('Smoke', 30, { workflowName: 'Nightly' }), check('Fresh', 50, { workflowName: 'Added here' })])],
    [listCall('CI', 'push', { scope }), runs(1)], [viewCall(1, ...scope), { jobs: [job('Unit tests', 95)] }],
    [listCall('Nightly', 'push', { scope }), []], [listCall('Nightly', null, { scope }), runs(2)], [viewCall(2, ...scope), { jobs: [job('Smoke', 30)] }],
    [listCall('Added here', 'push', { scope }), missing],
  ]);
  const result = await report(config('--repo', 'acme/webapp'), read, TODAY);
  assert.deepEqual(statuses(result), { 'CI / Unit tests': 'within', 'Nightly / Smoke': 'within', 'Added here / Fresh': 'new' });
  assert.equal(calls.length, 7, 'a workflow that gh does not know is asked once');
  const denied = fake([[prCall(), pull([check('Unit tests', 100)])], [listCall('CI', 'push'), new Error('gh run list failed: HTTP 403: Resource not accessible')]]);
  await assert.rejects(report(config(), denied.read, TODAY), /HTTP 403: Resource not accessible/);
});

test('report: the newest of two rows for one job counts in either order, and a pull request with no job reads no base', async () => {
  const older = check('Unit tests', 100, { startedAt: at(0), completedAt: at(100) });
  const newer = check('Unit tests', 400, { startedAt: at(1000), completedAt: at(1400) });
  for (const rollup of [[older, newer], [newer, older]]) {
    const { read } = fake([[prCall(), pull(rollup)], [listCall('CI', 'push'), runs(1)], [viewCall(1), { jobs: [job('Unit tests', 400)] }]]);
    assert.equal((await report(config(), read, TODAY)).jobs[0].after, 400);
  }
  const none = fake([[prCall(), pull([check('Docs', 5, { conclusion: 'SKIPPED' })])]]);
  assert.deepEqual((await report(config(), none.read, TODAY)).jobs, []);
  assert.deepEqual(none.calls, [prCall()]);
});

test('report: a slower job names the steps that grew by more than 5 s, largest first, at most three, from one read of its run', async () => {
  const link = id => `https://github.com/acme/webapp/actions/runs/77/job/${id}`;
  const base = extra => ({ jobs: [job('Unit tests', 100, { steps: [step('Install', 12), step('Test', 82), step('Cache', 5), step('Checkout', 9), ...extra] }),
    job('E2E', 100, { steps: [step('Browser', 50), step('Run', 40), step('Report', 4), step('Pack', 3)] })] });
  const { read, count } = fake([
    [prCall(), pull([check('Unit tests', 300, { detailsUrl: link(901) }), check('E2E', 300, { detailsUrl: link(902) })])],
    [listCall('CI', 'push'), runs(1, 2, 3)],
    [viewCall(1), base([])], [viewCall(2), base([{ name: 'Install', startedAt: null, completedAt: null }])], [viewCall(3), base([])],
    [viewCall(77), { jobs: [{ ...job('Other', 10), databaseId: 900, steps: [step('Install', 999)] },
      { ...job('Unit tests', 300), databaseId: 901, steps: [step('Install', 60), step('Test', 200), step('Cache', 10), step('Checkout', 4),
        { name: 'Skipped step', startedAt: null, completedAt: null }] },
      { ...job('E2E', 300), databaseId: 902, steps: [step('Browser', 60), step('Run', 100), step('Report', 30), step('Pack', 20), step('Upload', 12)] }] }],
  ]);
  const result = await report(config(), read, TODAY);
  assert.deepEqual(result.jobs.find(row => row.name === 'Unit tests').steps, [{ name: 'Test', after: 200, before: 82, change: 118 },
    { name: 'Install', after: 60, before: 12, change: 48 }],
  'exactly +5 s, a step that shrank and a step with no time are left out; a base step with no time gives no sample');
  assert.deepEqual(result.jobs.find(row => row.name === 'E2E').steps, [{ name: 'Run', after: 100, before: 40, change: 60 },
    { name: 'Report', after: 30, before: 4, change: 26 }, { name: 'Pack', after: 20, before: 3, change: 17 }],
  'three at most; Upload (+12 s, absent on the base) and Browser (+10 s) come after them');
  assert.equal(count(viewCall(77)), 1, 'two slower jobs of one run read it once');
});

const RESULT = { pr: 12, url: 'https://github.com/acme/webapp/pull/12', head: 'abc1234567890abc', base: 'main', readOn: '2026-01-06',
  limit: LIMIT, baseRuns: 3, scanned: 9, jobs: [
    { key: 'CI / Lint', status: 'within', before: 60, after: 62, change: 2, percent: 3.33, named: false },
    { key: 'CI / Smoke', status: 'slower', before: 60, after: 120, change: 60, percent: 100, fastest: 55, slowest: 70, runs: 3, named: false, steps: [] },
    { key: 'CI / Unit | fast', status: 'slower', before: 217, after: 545, change: 328, percent: 151.15, fastest: 200, slowest: 230, runs: 3, named: false,
      steps: [{ name: 'Test', after: 500, before: 180, change: 320 }, { name: 'Install', after: 20, before: 12, change: 8 }] },
    { key: 'CI / Types', status: 'slower-in-range', before: 80, after: 119, change: 39, percent: 48.75, fastest: 72, slowest: 119, runs: 3, named: false },
    { key: 'CI / New suite', status: 'new', after: 88, named: false },
    { key: 'CI / Build', status: 'not-compared', state: 'failure', after: 200, named: false },
    { key: 'CI / Deploy', status: 'running', named: false },
    { key: 'CI / Docs', status: 'faster', before: 150, after: 104, change: -46, percent: -30.67, named: false },
    { key: 'CI / Format', status: 'within', before: 43, after: 43, change: 0, percent: 0, named: true },
  ] };

test('markdown: the section has one fixed form', () => {
  assert.equal(markdown(RESULT), `## CI run time

Before is the median of the last 3 successful \`main\` runs of each job; after is this pull request's run at \`abc1234567\`. Read from GitHub on 2026-01-06. A job is over the limit when it changes by more than 10% and more than 20s. Bold marks a job that is over the limit and slower than every one of those \`main\` runs.

| Job | Before (median of \`main\`) | After | Change |
|---|---|---|---|
| CI / Unit \\| fast | 3m37s | 9m05s | **+5m28s (+151%)** |
| CI / Smoke | 1m00s | 2m00s | **+1m00s (+100%)** |
| CI / Types | 1m20s | 1m59s | +39s (+49%) |
| CI / New suite | no successful run in the last 9 \`main\` runs | 1m28s | new |
| CI / Docs | 2m30s | 1m44s | -46s (-31%) |
| CI / Build |  | 3m20s | not compared: failure |
| CI / Deploy |  |  | still running |
| CI / Format | 0m43s | 0m43s | 0s (0%) |

- **CI / Unit | fast (+5m28s):** _cause and decision not written yet_
  - Steps that grew most: \`Test\` +5m20s (8m20s, 3m00s on \`main\`); \`Install\` +8s (0m20s, 0m12s on \`main\`).
- **CI / Smoke (+1m00s):** _cause and decision not written yet_
- **CI / Types (+39s) is inside the range of \`main\`:** its last 3 runs took 1m12s to 1m59s.
- Job time in total for the 6 compared jobs: 10m10s before, 16m33s after (+6m23s).

<details><summary>All 9 jobs</summary>

| Job | Before (median of \`main\`) | After | Change |
|---|---|---|---|
| CI / Unit \\| fast | 3m37s | 9m05s | **+5m28s (+151%)** |
| CI / Smoke | 1m00s | 2m00s | **+1m00s (+100%)** |
| CI / Types | 1m20s | 1m59s | +39s (+49%) |
| CI / New suite | no successful run in the last 9 \`main\` runs | 1m28s | new |
| CI / Docs | 2m30s | 1m44s | -46s (-31%) |
| CI / Build |  | 3m20s | not compared: failure |
| CI / Deploy |  |  | still running |
| CI / Lint | 1m00s | 1m02s | +2s (+3%) |
| CI / Format | 0m43s | 0m43s | 0s (0%) |

</details>
`);
});

test('markdown: the notes say when no job is slower, and the folded block appears only when a row is left out', () => {
  const row = { key: 'CI / Lint', status: 'within', before: 60, after: 62, change: 2, percent: 3.33, named: false };
  const zero = markdown({ ...RESULT, jobs: [{ ...row, named: true },
    { key: 'CI / Zero', status: 'slower', before: 0, after: 30, change: 30, percent: null, fastest: 0, slowest: 0, runs: 3, named: false, steps: [] }] });
  assert.ok(!zero.includes('<details>'), 'every row is in the table');
  assert.ok(zero.includes('| CI / Zero | 0m00s | 0m30s | **+30s** |'), 'a base of 0 s shows no percent');
  assert.ok(zero.includes('not written yet_\n- Job time in total'), 'no step line without steps');
  const calm = markdown({ ...RESULT, jobs: [row] });
  assert.ok(calm.includes('runs.\n\n- No job is slower than the limit.\n- Job time in total for the 1 compared jobs: 1m00s before, 1m02s after (+2s).\n\n<details>'),
    'no table above the notes when every row is folded');
  const faster = markdown({ ...RESULT, jobs: [{ key: 'CI / Docs', status: 'faster', before: 150, after: 104, change: -46, percent: -30.67, named: false }] });
  assert.ok(faster.includes('| CI / Docs | 2m30s | 1m44s | -46s (-31%) |\n\n- No job is slower than the limit.\n'), 'a faster job is over the limit and is not slower');
  const fresh = markdown({ ...RESULT, jobs: [{ key: 'CI / New suite', status: 'new', after: 88, named: false }] });
  assert.ok(fresh.endsWith('| new |\n\n- No job is slower than the limit.\n'), 'no total line with no compared job');
});

function sink() {
  const chunks = [];
  return { write: text => chunks.push(text), text: () => chunks.join('') };
}

test('main: help, the section, JSON, and exit 3 with nothing written when no job ran', async () => {
  const help = sink();
  assert.equal(await main(['--help'], { out: help }), 0);
  assert.match(help.text(), /^Usage: node ci-run-time\.mjs --pr <number>/);
  const answers = [[prCall(), pull([check('Unit tests', 100)])], [listCall('CI', 'push'), runs(1)], [viewCall(1), { jobs: [job('Unit tests', 100)] }]];
  const section = sink();
  assert.equal(await main(['--pr', '12'], { read: fake(answers).read, out: section, today: TODAY }), 0);
  assert.ok(section.text().startsWith('## CI run time\n\nBefore is the median of the last 3 successful `main` runs'));
  const json = sink();
  assert.equal(await main(['--pr', '12', '--json'], { read: fake(answers).read, out: json, today: TODAY }), 0);
  assert.equal(JSON.parse(json.text()).jobs[0].status, 'within');
  const out = sink();
  const err = sink();
  const none = fake([[prCall(), pull([check('Docs', 5, { conclusion: 'SKIPPED' })])]]);
  assert.equal(await main(['--pr', '12'], { read: none.read, out, err, today: TODAY }), 3);
  assert.equal(out.text(), '');
  assert.equal(err.text(), 'No GitHub Actions job ran on abc1234567: write no CI run time section.\n');
});

test('github: a server error or no answer is tried again, another error is not, and the tries end', async () => {
  const failure = (stderr, extra = {}) => Object.assign(new Error('Command failed'), { stderr, ...extra });
  const runner = outcomes => {
    const seen = [];
    return { seen, run: async (command, args, settings) => {
      seen.push({ command, args, settings });
      const next = outcomes.shift();
      if (next instanceof Error) throw next;
      return { stdout: next };
    } };
  };
  const flaky = runner([failure('HTTP 502: Server Error'), failure('', { killed: true }), '{"ok":true}']);
  assert.deepEqual(await github(['run', 'view', '1'], { run: flaky.run, pause: 0, timeout: 7000 }), { ok: true });
  assert.deepEqual(flaky.seen.map(call => [call.command, ...call.args]), [['gh', 'run', 'view', '1'], ['gh', 'run', 'view', '1'], ['gh', 'run', 'view', '1']]);
  assert.equal(flaky.seen[0].settings.timeout, 7000);
  assert.equal(flaky.seen[0].settings.killSignal, 'SIGKILL');
  assert.deepEqual([flaky.seen[0].settings.env.GH_PROMPT_DISABLED, flaky.seen[0].settings.env.GH_PAGER], ['1', 'cat']);
  const slow = runner([failure('dial tcp: i/o timed out'), '{"ok":true}']);
  assert.deepEqual(await github(['pr', 'view', '9'], { run: slow.run, pause: 0 }), { ok: true });
  const denied = runner([failure('HTTP 404: Not Found'), '{"ok":true}']);
  await assert.rejects(github(['pr', 'view', '9'], { run: denied.run, pause: 0 }), /^Error: gh pr view 9 failed: HTTP 404: Not Found$/);
  assert.equal(denied.seen.length, 1);
  const down = runner([failure('HTTP 503'), failure('HTTP 503'), failure('HTTP 503'), '{"ok":true}']);
  await assert.rejects(github(['pr', 'view', '9'], { run: down.run, pause: 0 }), /failed: HTTP 503$/);
  assert.equal(down.seen.length, 3);
  const hung = runner([failure('', { killed: true }), failure('', { killed: true })]);
  await assert.rejects(github(['pr', 'view', '9'], { run: hung.run, pause: 0, attempts: 2, timeout: 5000 }), /^Error: gh pr view 9 failed: no answer in 5s$/);
});

test('command line: it calls gh on PATH and passes on exit 0 with the section, exit 3 with nothing, and exit 1 with the gh error', t => {
  const bin = mkdtempSync(path.join(os.tmpdir(), 'ci-run-time-test-'));
  t.after(() => rmSync(bin, { recursive: true, force: true }));
  const answers = { pr: pull([check('Unit tests', 300)]), skipped: pull([check('Docs', 5, { conclusion: 'SKIPPED' })]),
    list: runs(1), view: { jobs: [job('Unit tests', 100)] } };
  writeFileSync(path.join(bin, 'gh'), `#!${process.execPath}
const args = process.argv.slice(2);
if (process.env.FAKE_GH === 'fails') { process.stderr.write('HTTP 401: Bad credentials\\n'); process.exit(1); }
const answers = ${JSON.stringify(answers)};
const key = args[0] === 'pr' ? (process.env.FAKE_GH === 'skipped' ? 'skipped' : 'pr') : args[1];
process.stdout.write(JSON.stringify(answers[key]));
`);
  chmodSync(path.join(bin, 'gh'), 0o755);
  const run = mode => spawnSync(process.execPath, [helper, '--pr', '12'],
    { encoding: 'utf8', env: { ...process.env, PATH: `${bin}${path.delimiter}${process.env.PATH}`, FAKE_GH: mode } });
  const passed = run('passes');
  assert.equal(passed.status, 0, passed.stderr);
  assert.match(passed.stdout, /^## CI run time\n/);
  assert.ok(passed.stdout.includes('| CI / Unit tests | 1m40s | 5m00s | **+3m20s (+200%)** |'));
  assert.ok(passed.stdout.includes('- **CI / Unit tests (+3m20s):** _cause and decision not written yet_'));
  const empty = run('skipped');
  assert.deepEqual([empty.status, empty.stdout, empty.stderr], [3, '', 'No GitHub Actions job ran on abc1234567: write no CI run time section.\n']);
  const failed = run('fails');
  assert.equal(failed.status, 1);
  assert.equal(failed.stdout, '');
  assert.match(failed.stderr, /^gh pr view 12 --json [a-zA-Z,]+ failed: HTTP 401: Bad credentials\n$/);
});
