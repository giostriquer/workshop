import { execFile } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

const execute = promisify(execFile);
const USAGE = [
  'Usage: node ci-run-time.mjs --pr <number> [--job <name text>]... [--repo <owner/name>]',
  '         [--base-runs <n>] [--percent <n>] [--seconds <n>] [--json]',
  'Writes the "## CI run time" section of a pull request body: each GitHub Actions job of the',
  'pull request head against the median of its last successful runs on the base branch.',
  'Exit 0: section written. Exit 3: no GitHub Actions job ran on the head. Exit 1: error.',
].join('\n');
const NO_JOBS = 3;
const PLACEHOLDER = '_cause and decision not written yet_';
// A job that a path filter or a cache skips is absent from some base runs, so look further back than the sample size.
const SCAN = 3;
const STEP_FLOOR = 5;
const ORDER = ['slower', 'slower-in-range', 'new', 'faster', 'not-compared', 'running', 'within'];

export function options(argv) {
  const config = { pr: null, repo: null, jobs: [], baseRuns: 3, percent: 10, seconds: 20, json: false, help: false };
  const numbers = { '--pr': 'pr', '--base-runs': 'baseRuns', '--percent': 'percent', '--seconds': 'seconds' };
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    if (flag === '--help' || flag === '-h') config.help = true;
    else if (flag === '--json') config.json = true;
    else if (flag === '--repo' || flag === '--job' || numbers[flag]) {
      const value = argv[index += 1];
      if (value === undefined || value === '') throw new Error(`${flag} needs a value\n${USAGE}`);
      if (flag === '--repo') config.repo = value;
      else if (flag === '--job') config.jobs.push(value);
      else if (!Number.isFinite(Number(value)) || Number(value) < 0) throw new Error(`${flag} needs a number\n${USAGE}`);
      else config[numbers[flag]] = Number(value);
    } else throw new Error(`Unknown argument: ${flag}\n${USAGE}`);
  }
  if (config.help) return config;
  if (!Number.isInteger(config.pr) || config.pr < 1) throw new Error(`--pr needs a pull request number\n${USAGE}`);
  if (!Number.isInteger(config.baseRuns) || config.baseRuns < 1) throw new Error(`--base-runs needs a whole number above 0\n${USAGE}`);
  return config;
}

export function median(values) {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function compare(after, samples, limit) {
  if (!samples.length) return { status: 'new' };
  const before = median(samples);
  const change = after - before;
  const percent = before > 0 ? change / before * 100 : null;
  const over = Math.abs(change) > limit.seconds && (percent === null || Math.abs(percent) > limit.percent);
  const slowest = Math.max(...samples);
  const status = !over ? 'within' : change < 0 ? 'faster' : after <= slowest ? 'slower-in-range' : 'slower';
  return { status, before, change, percent, fastest: Math.min(...samples), slowest, runs: samples.length };
}

function elapsed(startedAt, completedAt) {
  const seconds = (Date.parse(completedAt) - Date.parse(startedAt)) / 1000;
  return Number.isFinite(seconds) && seconds >= 0 ? seconds : null;
}

function stepTimes(job) {
  const steps = new Map();
  for (const step of job.steps ?? []) {
    const seconds = elapsed(step.startedAt, step.completedAt);
    if (seconds !== null) steps.set(step.name, seconds);
  }
  return steps;
}

function pullRequestJobs(rollup) {
  const jobs = new Map();
  for (const row of rollup) {
    const conclusion = String(row.conclusion ?? '').toLowerCase();
    if (row.__typename !== 'CheckRun' || !row.workflowName || conclusion === 'skipped' || conclusion === 'neutral') continue;
    const finished = row.status === 'COMPLETED';
    const job = { key: `${row.workflowName} / ${row.name}`, workflow: row.workflowName, name: row.name,
      state: !finished ? 'running' : conclusion === 'success' ? 'passed' : conclusion || 'unknown',
      after: finished ? elapsed(row.startedAt, row.completedAt) : null, startedAt: row.startedAt ?? '',
      link: row.detailsUrl ?? '' };
    const seen = jobs.get(job.key);
    if (!seen || job.startedAt > seen.startedAt) jobs.set(job.key, job);
  }
  return [...jobs.values()];
}

async function baseSamples(workflow, base, config, scope, read) {
  const list = event => read(['run', 'list', ...scope, '--workflow', workflow, '--branch', base, '--status', 'success',
    ...(event ? ['--event', event] : []), '--limit', String(config.baseRuns * SCAN), '--json', 'databaseId']);
  let runs = await list('push');
  if (!runs.length) runs = await list(null);
  const samples = new Map();
  for (const run of runs) {
    // One request at a time for each workflow: a burst of parallel job reads gets HTTP 502 from GitHub.
    const view = await read(['run', 'view', String(run.databaseId), ...scope, '--json', 'jobs']);
    for (const job of view.jobs ?? []) {
      const seconds = job.conclusion === 'success' ? elapsed(job.startedAt, job.completedAt) : null;
      const kept = samples.get(job.name) ?? [];
      if (seconds !== null && kept.length < config.baseRuns) samples.set(job.name, [...kept, { seconds, steps: stepTimes(job) }]);
    }
  }
  return samples;
}

async function grownSteps(job, samples, scope, read) {
  const [, run, id] = /\/actions\/runs\/(\d+)\/job\/(\d+)/.exec(job.link) ?? [];
  if (!run) return [];
  const view = await read(['run', 'view', run, ...scope, '--json', 'jobs']);
  const own = stepTimes((view.jobs ?? []).find(candidate => String(candidate.databaseId) === id) ?? {});
  return [...own].map(([name, after]) => {
    const before = samples.filter(sample => sample.steps.has(name)).map(sample => sample.steps.get(name));
    return { name, after, before: before.length ? median(before) : 0 };
  }).map(step => ({ ...step, change: step.after - step.before }))
    .filter(step => step.change > STEP_FLOOR).sort((left, right) => right.change - left.change).slice(0, 3);
}

export async function report(config, read = github, today = new Date()) {
  const scope = config.repo ? ['--repo', config.repo] : [];
  const pr = await read(['pr', 'view', String(config.pr), ...scope, '--json', 'number,url,headRefOid,baseRefName,statusCheckRollup']);
  const jobs = pullRequestJobs(pr.statusCheckRollup ?? []);
  const known = new Set(jobs.length ? (await read(['workflow', 'list', ...scope, '--all', '--json', 'name'])).map(workflow => workflow.name) : []);
  const workflows = [...new Set(jobs.map(job => job.workflow))];
  const samples = new Map(await Promise.all(workflows.map(async workflow =>
    [workflow, known.has(workflow) ? await baseSamples(workflow, pr.baseRefName, config, scope, read) : new Map()])));
  const rows = await Promise.all(jobs.map(async job => {
    if (job.state !== 'passed' || job.after === null) return { ...job, status: job.state === 'running' ? 'running' : 'not-compared' };
    const base = samples.get(job.workflow).get(job.name) ?? [];
    const row = { ...job, ...compare(job.after, base.map(sample => sample.seconds), config) };
    return row.status === 'slower' ? { ...row, steps: await grownSteps(job, base, scope, read) } : row;
  }));
  const shown = config.jobs.map(text => text.toLowerCase());
  return { pr: pr.number, url: pr.url, head: pr.headRefOid, base: pr.baseRefName, readOn: today.toISOString().slice(0, 10),
    limit: { percent: config.percent, seconds: config.seconds }, baseRuns: config.baseRuns,
    jobs: rows.map(({ startedAt, link, state, ...row }) => ({ ...row, ...(row.status === 'not-compared' ? { state } : {}),
      named: shown.some(text => row.key.toLowerCase().includes(text)) })) };
}

function clock(seconds) {
  const whole = Math.round(seconds);
  return `${Math.floor(whole / 60)}m${String(whole % 60).padStart(2, '0')}s`;
}

function signed(seconds) {
  const whole = Math.round(Math.abs(seconds));
  const sign = Math.round(seconds) > 0 ? '+' : Math.round(seconds) < 0 ? '-' : '';
  return whole < 60 ? `${sign}${whole}s` : `${sign}${clock(whole)}`;
}

function changed(row) {
  if (row.percent === null) return signed(row.change);
  const percent = Math.round(row.percent);
  return `${signed(row.change)} (${percent > 0 ? '+' : ''}${percent}%)`;
}

export function markdown(result) {
  const base = `\`${result.base}\``;
  const cell = text => String(text).replaceAll('|', '\\|');
  const rows = [...result.jobs].sort((left, right) => ORDER.indexOf(left.status) - ORDER.indexOf(right.status)
    || Math.abs(right.change ?? 0) - Math.abs(left.change ?? 0) || left.key.localeCompare(right.key));
  const line = row => {
    const before = row.before === undefined ? (row.status === 'new' ? `no job of this name on ${base}` : '') : clock(row.before);
    const after = row.after === null || row.after === undefined ? '' : clock(row.after);
    const change = { new: 'new', running: 'still running', 'not-compared': `not compared: ${row.state}`,
      slower: `**${row.before === undefined ? '' : changed(row)}**` }[row.status] ?? changed(row);
    return `| ${cell(row.key)} | ${before} | ${after} | ${change} |`;
  };
  const table = list => [`| Job | Before (median of ${base}) | After | Change |`, '|---|---|---|---|', ...list.map(line)];
  const visible = rows.filter(row => row.status !== 'within' || row.named);
  const compared = rows.filter(row => row.before !== undefined);
  const notes = [];
  for (const row of rows.filter(candidate => candidate.status === 'slower')) {
    notes.push(`- **${row.key} (${signed(row.change)}):** ${PLACEHOLDER}`);
    if (row.steps?.length) {
      notes.push(`  - Steps that grew most: ${row.steps.map(step =>
        `\`${step.name}\` ${signed(step.change)} (${clock(step.after)}, ${clock(step.before)} on ${base})`).join('; ')}.`);
    }
  }
  for (const row of rows.filter(candidate => candidate.status === 'slower-in-range')) {
    notes.push(`- **${row.key} (${signed(row.change)}) is inside the range of ${base}:** its last ${row.runs} runs took ${clock(row.fastest)} to ${clock(row.slowest)}.`);
  }
  if (!notes.length) notes.push('- No job is over the limit.');
  if (compared.length) {
    const before = compared.reduce((sum, row) => sum + row.before, 0);
    const after = compared.reduce((sum, row) => sum + row.after, 0);
    notes.push(`- Job time in total for the ${compared.length} compared jobs: ${clock(before)} before, ${clock(after)} after (${signed(after - before)}).`);
  }
  const folded = visible.length < rows.length
    ? ['', `<details><summary>All ${rows.length} jobs</summary>`, '', ...table(rows), '', '</details>'] : [];
  return ['## CI run time', '',
    `Before is the median of the last ${result.baseRuns} successful ${base} runs of each job; after is this pull request's run at \`${result.head.slice(0, 10)}\`. `
      + `Read from GitHub on ${result.readOn}. A job is over the limit when it changes by more than ${result.limit.percent}% and more than ${result.limit.seconds}s.`,
    '', ...(visible.length ? [...table(visible), ''] : []), ...notes, ...folded, ''].join('\n');
}

export async function github(args, { run = execute, pause = 2000, attempts = 3 } = {}) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      const { stdout } = await run('gh', args, { maxBuffer: 64 * 1024 * 1024 });
      return JSON.parse(stdout);
    } catch (error) {
      const reason = String(error.stderr || error.message).trim();
      if (attempt >= attempts || !/HTTP 5\d\d|timed? ?out|connection reset|EAI_AGAIN/i.test(reason)) {
        throw new Error(`gh ${args.join(' ')} failed: ${reason}`);
      }
      await new Promise(resolve => setTimeout(resolve, pause));
    }
  }
}

export async function main(argv, { read = github, out = process.stdout, err = process.stderr, today = new Date() } = {}) {
  const config = options(argv);
  if (config.help) {
    out.write(`${USAGE}\n`);
    return 0;
  }
  const result = await report(config, read, today);
  if (!result.jobs.length) {
    err.write(`No GitHub Actions job ran on ${result.head.slice(0, 10)}: write no CI run time section.\n`);
    return NO_JOBS;
  }
  out.write(config.json ? `${JSON.stringify(result, null, 2)}\n` : markdown(result));
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main(process.argv.slice(2)).then(code => { process.exitCode = code; }, error => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
