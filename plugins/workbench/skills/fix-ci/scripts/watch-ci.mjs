import { execFile } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, renameSync, openSync, closeSync, unlinkSync, existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

const execute = promisify(execFile);
const PR_FIELDS = 'number,url,state,headRefOid,headRefName,mergedAt,closedAt,statusCheckRollup';
const RUN_FIELDS = 'databaseId,headSha,headBranch,status,conclusion,attempt,name,url,workflowDatabaseId,event';
const FAILURES = new Set(['failure', 'error', 'timed_out', 'action_required', 'startup_failure', 'stale']);
const PENDING = new Set(['pending', 'queued', 'in_progress', 'requested', 'waiting', 'expected']);

function bucket(status, conclusion) {
  const result = String(conclusion || status || '').toLowerCase();
  if (FAILURES.has(result)) return 'fail';
  if (result === 'success') return 'pass';
  if (result === 'skipped' || result === 'neutral') return 'skip';
  if (result === 'cancelled') return 'cancel';
  if (PENDING.has(result) || (result === 'completed' && !conclusion)) return 'pending';
  throw new Error(`Unrecognized check state: ${result || '(missing)'}`);
}

function check(row) {
  const name = row.name ?? row.context;
  if (typeof name !== 'string' || !name) throw new Error('Check has no name');
  return { name, bucket: bucket(row.status ?? row.state, row.conclusion),
    link: row.detailsUrl ?? row.targetUrl ?? row.url ?? '' };
}

function array(value, label) {
  if (!Array.isArray(value)) throw new Error(`${label} is not an array`);
  return value;
}

function runChecks(run, sha) {
  if (run.headSha !== sha) throw new Error('Workflow run belongs to another revision');
  const jobs = array(run.jobs, 'Workflow jobs').map(check);
  return [check({ ...run, name: run.name || `Run ${run.databaseId}` }), ...jobs];
}

function summary(state, status, reason) {
  const checks = state.checks ?? [];
  const expected = state.config.expected;
  return {
    status, reason, targetSha: state.config.sha, observedSha: state.observedSha ?? null,
    pr: state.pr ?? null, deadline: state.config.deadline,
    counts: Object.fromEntries(['pass', 'fail', 'pending', 'skip', 'cancel'].map(
      name => [name, checks.filter(c => c.bucket === name).length])),
    failed: checks.filter(c => c.bucket === 'fail'), pending: checks.filter(c => c.bucket === 'pending'),
    required: { expected, missing: expected.filter(name => !checks.some(c => c.name === name && c.bucket === 'pass')),
      coverage: expected.length ? 'caller-specified' : 'not supplied' },
    checks,
  };
}

async function snapshot(state, read) {
  const c = state.config;
  const repo = ['--repo', c.repo];
  let rows;
  if (c.pr) {
    const pr = await read(['pr', 'view', c.pr, ...repo, '--json', PR_FIELDS]);
    if (!['OPEN', 'MERGED', 'CLOSED'].includes(pr.state) || !/^[a-f0-9]{40}$/i.test(pr.headRefOid ?? '')) {
      throw new Error('PR response lacks a valid state or full head SHA');
    }
    state.observedSha = pr.headRefOid;
    state.pr = { number: pr.number, url: pr.url, state: pr.state, mergedAt: pr.mergedAt, closedAt: pr.closedAt };
    state.checks = [];
    if (pr.state !== 'OPEN') {
      try { state.checks = array(pr.statusCheckRollup, 'PR check rollup').map(check); }
      catch { state.checks = []; }
      return summary(state, pr.state.toLowerCase(), 'PR is no longer open');
    }
    if (pr.headRefOid !== c.sha) return summary(state, 'superseded', 'PR head moved');
    rows = array(pr.statusCheckRollup, 'PR check rollup').map(check);
  } else {
    const head = await read(['api', `repos/${c.repo}/commits/${encodeURIComponent(c.branch)}`]);
    if (!/^[a-f0-9]{40}$/i.test(head.sha ?? '')) throw new Error('Branch response lacks a full SHA');
    state.observedSha = head.sha;
    state.checks = [];
    if (head.sha !== c.sha) return summary(state, 'superseded', 'Branch head moved');
    const runs = array(await read(['run', 'list', ...repo, '--branch', c.branch, '--commit', c.sha,
      '--limit', '100', '--json', RUN_FIELDS]), 'Workflow runs');
    if (runs.length === 100) throw new Error('Run listing reached its limit; coverage is incomplete');
    const latest = new Map();
    for (const run of runs) {
      if (run.headSha !== c.sha) throw new Error('Run listing contains another revision');
      if (!Number.isSafeInteger(run.workflowDatabaseId) || !Number.isSafeInteger(run.databaseId)) {
        throw new Error('Run listing lacks workflow identity');
      }
      const key = `${run.workflowDatabaseId}:${run.event}`;
      if (!latest.has(key) || latest.get(key).databaseId < run.databaseId) latest.set(key, run);
    }
    const selected = [...latest.values()].filter(run => String(run.databaseId) !== c.rerun);
    const summaries = selected.map(run => check({ ...run, name: run.name || `Run ${run.databaseId}` }));
    rows = [...summaries];
    state.checks = rows;
    if (rows.some(row => row.bucket === 'fail')) return summary(state, 'failed', 'Workflow failed');
    for (const [index, run] of selected.entries()) {
      const detail = await read(['run', 'view', String(run.databaseId), ...repo, '--json', `${RUN_FIELDS},jobs`]);
      rows.splice(rows.indexOf(summaries[index]), 1, ...runChecks(detail, c.sha));
      state.checks = rows;
      if (rows.some(row => row.bucket === 'fail')) return summary(state, 'failed', 'Workflow or child job failed');
    }
  }

  if (c.rerun) {
    // The attempt-specific jobs replace stale rollup rows from that run, even when
    // GitHub keeps the previous attempt's check records visible for several polls.
    rows = rows.filter(row => !new RegExp(`/actions/runs/${c.rerun}(?:/|$|\\?)`).test(row.link));
    state.checks = rows;
    if (rows.some(row => row.bucket === 'fail')) return summary(state, 'failed', 'Another check failed during the rerun');
    const run = await read(['run', 'view', c.rerun, ...repo, '--json', `${RUN_FIELDS},jobs`]);
    if (run.headSha !== c.sha || !Number.isSafeInteger(run.attempt)) throw new Error('Rerun identity is not verified');
    if (run.attempt <= c.afterAttempt) {
      rows.push({ name: `Run ${c.rerun}: awaiting a newer attempt`, bucket: 'pending', link: run.url || '' });
    } else {
      const attempt = await read(['run', 'view', c.rerun, ...repo, '--attempt', String(run.attempt),
        '--json', `${RUN_FIELDS},jobs`]);
      if (attempt.attempt !== run.attempt) throw new Error('Rerun attempt changed during the snapshot');
      const current = runChecks(attempt, c.sha);
      const retained = array(run.jobs, 'Workflow jobs').map(check)
        .filter(job => job.bucket === 'pass' && !current.some(row => row.name === job.name));
      rows.push(...retained, ...current);
    }
  }
  state.checks = rows;
  if (rows.some(row => row.bucket === 'fail')) return summary(state, 'failed', 'A check or job failed');
  if (c.pr) {
    const ids = [...new Set(rows.map(row => row.link.match(/\/actions\/runs\/(\d+)(?:\/|$|\?)/)?.[1])
      .filter(id => id && id !== c.rerun))];
    for (const id of ids) {
      const run = await read(['run', 'view', id, ...repo, '--json', `${RUN_FIELDS},jobs`]);
      rows = rows.filter(row => !new RegExp(`/actions/runs/${id}(?:/|$|\\?)`).test(row.link));
      rows.push(...runChecks(run, c.sha));
      state.checks = rows;
      if (rows.some(row => row.bucket === 'fail')) return summary(state, 'failed', 'Workflow or child job failed');
    }
  }
  if (rows.some(row => row.bucket === 'cancel')) return summary(state, 'blocked', 'Cancelled checks are not passed');
  if (!rows.length || rows.some(row => row.bucket === 'pending')) return null;
  if (c.expected.some(name => !rows.some(row => row.name === name && row.bucket === 'pass'))) return null;
  if (!rows.some(row => row.bucket === 'pass')) return summary(state, 'blocked', 'No check passed');
  return summary(state, 'passed', 'All reported checks settled without failure');
}

export async function watch(state, { read, now = Date.now, sleep = ms => new Promise(r => setTimeout(r, ms)),
  save = () => {}, callLimitMs = Infinity } = {}) {
  if (state.result) return state.result;
  const end = Math.min(state.config.deadline * 1000, now() + callLimitMs);
  const finish = (status, reason) => {
    const result = summary(state, status, reason);
    if (status !== 'slice') state.result = result;
    save(state);
    return result;
  };
  while (now() < end) {
    try {
      const result = await snapshot(state, async args => {
        const remaining = end - now();
        if (remaining <= 0) throw new Error('Watch window ended during a snapshot');
        return read(args, Math.min(30000, remaining));
      });
      state.errors = 0;
      delete state.error;
      if (result) {
        state.result = result;
        save(state);
        return result;
      }
    } catch (error) {
      state.errors = (state.errors ?? 0) + 1;
      state.error = String(error.message).slice(0, 500);
      if (state.errors >= 4) return finish('blocked', state.error);
    }
    save(state);
    const remaining = end - now();
    if (remaining > 0) await sleep(Math.min(30000, remaining));
  }
  return now() >= state.config.deadline * 1000
    ? finish('pending', state.error || 'Watch deadline reached')
    : finish('slice', 'Resume the same state file; the original deadline is unchanged');
}

function positive(value, name) {
  if (!/^\d+$/.test(value ?? '') || !Number.isSafeInteger(Number(value)) || Number(value) <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
  return Number(value);
}

export function options(argv, now = Date.now()) {
  const values = { expected: [] };
  const allowed = new Set(['repo', 'pr', 'branch', 'sha', 'state', 'deadline', 'rerun', 'after-attempt', 'expect', 'resume', 'call-limit-ms']);
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i].replace(/^--/, '');
    const value = argv[i + 1];
    if (!argv[i].startsWith('--') || !allowed.has(key) || !value || value.startsWith('--')) throw new Error(`Invalid option ${argv[i]}`);
    if (key === 'expect') values.expected.push(value);
    else {
      if (values[key] !== undefined) throw new Error(`Duplicate option --${key}`);
      values[key] = value;
    }
  }
  if (values.resume) {
    if (Object.keys(values).some(k => !['expected', 'resume', 'call-limit-ms'].includes(k)) || values.expected.length) {
      throw new Error('--resume accepts only --call-limit-ms as an additional option');
    }
    return values;
  }
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(values.repo ?? '')) throw new Error('--repo must be OWNER/REPO');
  if (!/^[a-f0-9]{40}$/i.test(values.sha ?? '')) throw new Error('--sha must be the full 40-character commit SHA');
  if (Boolean(values.pr) === Boolean(values.branch)) throw new Error('Supply exactly one of --pr or --branch');
  if (values.pr) positive(values.pr, '--pr');
  if (!values.state) throw new Error('--state is required');
  if (Boolean(values.rerun) !== Boolean(values['after-attempt'])) throw new Error('--rerun and --after-attempt must be supplied together');
  if (values.rerun) positive(values.rerun, '--rerun');
  values.afterAttempt = values.rerun ? positive(values['after-attempt'], '--after-attempt') : undefined;
  values.deadline = values.deadline ? positive(values.deadline, '--deadline') : Math.floor(now / 1000) + 600;
  values.sha = values.sha.toLowerCase();
  return values;
}

async function github(args, timeout) {
  try {
    const { stdout } = await execute('gh', args, { timeout, killSignal: 'SIGKILL', maxBuffer: 4 * 1024 * 1024,
      env: { ...process.env, GH_PROMPT_DISABLED: '1', GH_PAGER: 'cat' } });
    return JSON.parse(stdout);
  } catch (error) {
    throw new Error(error.killed ? 'GitHub CLI read exceeded the watch time budget' :
      String(error.stderr || error.message).trim().slice(0, 500));
  }
}

const HELP = `Read-only PR or branch CI watcher (Node 18+, authenticated gh).
node watch-ci.mjs --repo acme/webapp --pr 123 --sha <full-sha> --state <scratch>/watch.json
node watch-ci.mjs --repo acme/webapp --branch main --sha <full-sha> --state <scratch>/watch.json
node watch-ci.mjs --resume <scratch>/watch.json

Optional: --deadline <Unix-seconds> (default: ten minutes), --expect <required-check-name>
(repeatable), --rerun <run-id> --after-attempt <failed-attempt>, --call-limit-ms <milliseconds>.
The command polls every 30 seconds, writes only its state file, and prints one JSON verdict.
On slice, resume the same state file. No log reads, reruns, repository edits or pushes occur.
Exit 0: reported verdict. Exit 2: invocation/runtime gap. Inspect status; exit 0 is not CI green.
`;

export async function main(argv) {
  if (argv.length === 1 && argv[0] === '--help') { console.log(HELP); return; }
  let lock;
  try {
    const args = options(argv);
    const file = path.resolve(args.resume || args.state);
    mkdirSync(path.dirname(file), { recursive: true });
    const lockFile = `${file}.lock`;
    if (existsSync(lockFile)) {
      const owner = positive(readFileSync(lockFile, 'utf8').trim(), 'Lock owner');
      try { process.kill(owner, 0); throw new Error('This state file already has an active watcher'); }
      catch (error) { if (error.code !== 'ESRCH') throw error; }
      unlinkSync(lockFile);
    }
    const fd = openSync(lockFile, 'wx', 0o600);
    writeFileSync(fd, String(process.pid)); closeSync(fd); lock = lockFile;
    let state;
    if (args.resume) {
      state = JSON.parse(readFileSync(file, 'utf8'));
      if (state.version !== 1 || !state.config || !Number.isSafeInteger(state.config.deadline)) throw new Error('Invalid watch state');
    } else {
      if (existsSync(file)) throw new Error('State already exists; use --resume or a new state file');
      const { state: unused, 'call-limit-ms': limit, ...config } = args;
      state = { version: 1, config, errors: 0, checks: [] };
    }
    let limit = args['call-limit-ms'];
    if (!limit && process.env.CLAUDECODE) limit = process.env.BASH_MAX_TIMEOUT_MS || '600000';
    const callLimitMs = limit ? positive(limit, 'Call limit') - 60000 : Infinity;
    if (callLimitMs <= 0) throw new Error('Call limit must exceed the 60-second return margin');
    const save = value => {
      const temporary = `${file}.${process.pid}.tmp`;
      writeFileSync(temporary, JSON.stringify(value), { mode: 0o600 });
      renameSync(temporary, file);
    };
    save(state);
    console.log(JSON.stringify(await watch(state, { read: github, save, callLimitMs })));
  } catch (error) {
    console.log(JSON.stringify({ status: 'blocked', reason: String(error.message).slice(0, 500) }));
    process.exitCode = 2;
  } finally {
    if (lock) unlinkSync(lock);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await main(process.argv.slice(2));
