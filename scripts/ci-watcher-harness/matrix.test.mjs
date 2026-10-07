import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { loadRunner, runnerFile } from './template.mjs';

const { watch, options } = await loadRunner();
const SHA = 'a'.repeat(40);
const OTHER = 'b'.repeat(40);
const PR_FIELDS = 'number,url,state,headRefOid,headRefName,mergedAt,closedAt,statusCheckRollup';
const RUN_FIELDS = 'databaseId,headSha,headBranch,status,conclusion,attempt,name,url,workflowDatabaseId,event';
const link = 'https://example.com/acme/webapp/actions/runs/11/job/22';
const check = (name = 'unit', conclusion = 'SUCCESS', extra = {}) => ({
  name, status: conclusion === null ? 'IN_PROGRESS' : 'COMPLETED', conclusion, detailsUrl: '', ...extra,
});
const pr = (checks = [check()], extra = {}) => ({
  number: 1, url: 'https://example.com/acme/webapp/pull/1', state: 'OPEN', headRefOid: SHA,
  headRefName: 'feature', mergedAt: null, closedAt: null, statusCheckRollup: checks, ...extra,
});
const run = (extra = {}) => ({ databaseId: 11, headSha: SHA, headBranch: 'feature', attempt: 1,
  workflowDatabaseId: 7, event: 'pull_request', name: 'CI', url: link,
  status: 'completed', conclusion: 'success', jobs: [check()], ...extra });
const config = extra => ({ repo: 'acme/webapp', pr: '1', sha: SHA, expected: [], deadline: 1600, ...extra });

function rig(responses, extra = {}, existing) {
  let clock = 1000000;
  const calls = [];
  const sleeps = [];
  const state = existing ?? { version: 1, config: config(extra), errors: 0, checks: [] };
  const deps = {
    now: () => clock,
    sleep: async ms => { sleeps.push(ms); clock += ms; },
    read: async (args, timeout) => {
      assert.ok(timeout > 0 && timeout <= 30000);
      const answer = responses[Math.min(calls.length, responses.length - 1)];
      calls.push(args);
      if (typeof answer === 'function') return answer(args, timeout);
      if (answer instanceof Error) throw answer;
      return answer;
    },
  };
  return { state, deps, calls, sleeps, setClock: value => { clock = value; }, now: () => clock };
}

for (const state of ['MERGED', 'CLOSED']) test(`${state} ends before reading checks or runs`, async () => {
  const r = rig([pr(null, { state })]);
  assert.equal((await watch(r.state, r.deps)).status, state.toLowerCase());
  assert.equal(r.calls.length, 1);
  assert.equal(r.sleeps.length, 0);
});

test('a moved PR head never certifies passing checks', async () => {
  const r = rig([pr([check()], { headRefOid: OTHER })]);
  assert.equal((await watch(r.state, r.deps)).status, 'superseded');
  assert.equal(r.calls.length, 1);
});

test('optional failure returns while required checks are pending, without another read', async () => {
  const r = rig([pr([check('optional', 'FAILURE', { detailsUrl: link }), check('required', null)])], { expected: ['required'] });
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, 'failed');
  assert.deepEqual(result.failed, [{ name: 'optional', bucket: 'fail', link }]);
  assert.equal(result.pending[0].name, 'required');
  assert.equal(result.targetSha, SHA);
  assert.equal(result.observedSha, SHA);
  assert.deepEqual(result.pr, { number: 1, url: 'https://example.com/acme/webapp/pull/1', state: 'OPEN',
    mergedAt: null, closedAt: null });
  assert.deepEqual(result.counts, { pass: 0, fail: 1, pending: 1, skip: 0, cancel: 0 });
  assert.deepEqual(result.required, { expected: ['required'], missing: ['required'], coverage: 'caller-specified' });
  assert.equal(r.calls.length, 1);
});

for (const [label, detailsUrl] of Object.entries({ job: link,
  workflow: 'https://example.com/acme/webapp/actions/runs/11',
  query: 'https://example.com/acme/webapp/actions/runs/11?check_suite_focus=true' })) test(`${label} link exposes a failed child while its PR workflow remains pending`, async () => {
  const r = rig([pr([check('aggregate', null, { detailsUrl })]),
    run({ status: 'in_progress', conclusion: '', jobs: [check('child', 'FAILURE')] })]);
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, 'failed');
  assert.equal(result.failed[0].name, 'child');
  assert.equal(r.calls.length, 2);
  assert.deepEqual(r.calls, [['pr', 'view', '1', '--repo', 'acme/webapp', '--json', PR_FIELDS],
    ['run', 'view', '11', '--repo', 'acme/webapp', '--json', `${RUN_FIELDS},jobs`]]);
});

test('passing linked run details preserve unrelated pending checks', async () => {
  const r = rig([args => args[0] === 'pr'
    ? pr([check('unit', 'SUCCESS', { detailsUrl: link }), check('external', null)]) : run()], { deadline: 1060 });
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, 'pending');
  assert.deepEqual(result.pending.map(row => row.name), ['external']);
});

for (const conclusion of ['ERROR', 'TIMED_OUT', 'ACTION_REQUIRED', 'STARTUP_FAILURE', 'STALE']) {
  test(`${conclusion} is a terminal failure`, async () => {
    const r = rig([pr([check('unit', conclusion)])]);
    const result = await watch(r.state, r.deps);
    assert.equal(result.status, 'failed');
    assert.equal(result.counts.fail, 1);
    assert.equal(r.calls.length, 1);
  });
}

for (const status of ['PENDING', 'QUEUED', 'REQUESTED', 'WAITING', 'EXPECTED', 'COMPLETED']) {
  test(`${status} remains pending until the deadline`, async () => {
    const r = rig([pr([check('unit', null, { status })])], { deadline: 1060 });
    const result = await watch(r.state, r.deps);
    assert.equal(result.status, 'pending');
    assert.equal(result.counts.pending, 1);
    assert.equal(r.state.errors, 0);
    assert.equal(r.now(), 1060000);
  });
}

test('check names containing shell syntax are plain data', async () => {
  const r = rig([pr([check('build $(touch /tmp/should-not-exist) =pending')])]);
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, 'passed');
  assert.deepEqual(result.required, { expected: [], missing: [], coverage: 'not supplied' });
});

for (const conclusion of ['NEUTRAL', 'SKIPPED']) test(`${conclusion} can settle beside a passing check`, async () => {
  const r = rig([pr([check('unit'), check('optional', conclusion)])]);
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, 'passed');
  assert.equal(result.counts.pass, 1);
  assert.equal(result.counts.skip, 1);
  assert.equal(r.calls.length, 1);
});

test('cancelled checks cannot pass', async () => {
  const r = rig([pr([check('lint'), check('integration', 'CANCELLED')])]);
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, 'blocked');
  assert.equal(result.counts.cancel, 1);
  assert.equal(r.calls.length, 1);
});

test('all-skipped is not a passing CI run', async () => {
  const r = rig([pr([check('optional', 'SKIPPED')])]);
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, 'blocked');
  assert.equal(result.counts.skip, 1);
  assert.equal(r.calls.length, 1);
});

test('one passing check cannot hide another pending check', async () => {
  const r = rig([pr([check('lint'), check('unit', null, { detailsUrl: undefined })])], { deadline: 1060 });
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, 'pending');
  assert.deepEqual(result.pending[0], { name: 'unit', bucket: 'pending', link: '' });
  assert.equal(r.now(), 1060000);
});

test('legacy commit statuses participate in the same verdict', async () => {
  const r = rig([pr([{ context: 'external', state: 'FAILURE', targetUrl: 'https://example.com/build' }])]);
  assert.equal((await watch(r.state, r.deps)).failed[0].name, 'external');
});

for (const checks of [[], [check('optional')], [check('required', 'SKIPPED')]]) {
  test(`missing expected coverage waits to the original deadline: ${JSON.stringify(checks)}`, async () => {
    const r = rig([pr(checks)], { expected: ['required'], deadline: 1060 });
    const result = await watch(r.state, r.deps);
    assert.equal(result.status, 'pending');
    assert.deepEqual(result.required.missing, ['required']);
    assert.equal(r.now(), 1060000);
  });
}

for (const response of [new Error('Access denied'), pr(null), pr([check('bad', 'UNKNOWN')]),
  pr([check('')]), pr([check(7)]), pr([], { state: 'UNKNOWN' }), pr([check('unit', null, { status: 'UNKNOWN' })]),
  pr([], { headRefOid: `x${SHA}` }), pr([], { headRefOid: `${SHA}x` })]) {
  test(`four invalid reads block without certifying stale data: ${JSON.stringify(response)}`, async () => {
    const r = rig([response]);
    const result = await watch(r.state, r.deps);
    assert.equal(result.status, 'blocked');
    assert.equal(r.calls.length, 4);
  });
}

test('successful reads reset the consecutive error count', async () => {
  const error = new Error('Temporary outage');
  const r = rig([error, error, error, pr([check('unit', null)]), error, error, error, pr()]);
  assert.equal((await watch(r.state, r.deps)).status, 'passed');
  assert.equal(r.calls.length, 8);
});

test('a call slice persists deadline and failure count across resume', async () => {
  const r = rig([new Error('Access denied')], { deadline: 1600 });
  let saved;
  assert.equal((await watch(r.state, { ...r.deps, callLimitMs: 60000,
    save: state => { saved = JSON.stringify(state); } })).status, 'slice');
  const restored = JSON.parse(saved);
  assert.equal(restored.errors, 2);
  assert.equal(restored.config.deadline, 1600);
  assert.equal(restored.result, undefined);
  const next = rig([new Error('Access denied')], {}, restored);
  next.setClock(r.now());
  assert.equal((await watch(next.state, next.deps)).status, 'blocked');
  assert.equal(r.calls.length + next.calls.length, 4);
});

test('resuming a deadline-expired watch does not make a network call', async () => {
  const r = rig([pr()], { deadline: 999 });
  assert.equal((await watch(r.state, r.deps)).status, 'pending');
  assert.equal(r.calls.length, 0);
});

test('resuming a terminal result returns it without another read', async () => {
  const r = rig([pr([check('unit', 'FAILURE')])]);
  const first = await watch(r.state, r.deps);
  assert.deepEqual(await watch(r.state, r.deps), first);
  assert.equal(r.calls.length, 1);
});

test('each network call is bounded by the remaining watch budget', async () => {
  const timeouts = [];
  const r = rig([(args, timeout) => { timeouts.push(timeout); r.setClock(1005000); throw new Error('Timeout'); }], { deadline: 1005 });
  assert.equal((await watch(r.state, r.deps)).status, 'pending');
  assert.deepEqual(timeouts, [5000]);
  assert.equal(r.calls.length, 1);
});

test('a pending read sleeps only to the remaining deadline', async () => {
  const r = rig([pr([check('unit', null)])], { deadline: 1005 });
  assert.equal((await watch(r.state, r.deps)).status, 'pending');
  assert.equal(r.now(), 1005000);
  assert.deepEqual(r.sleeps, [5000]);
});

for (const terminal of ['blocked', 'pending']) test(`${terminal} result is saved and resumes without reads`, async () => {
  const r = rig([terminal === 'blocked' ? new Error('Unavailable') : pr([])], { deadline: 1120 });
  let saved;
  const result = await watch(r.state, { ...r.deps, save: state => { saved = JSON.stringify(state); } });
  assert.equal(result.status, terminal);
  const next = rig([pr()], {}, JSON.parse(saved));
  assert.deepEqual(await watch(next.state, next.deps), result);
  assert.equal(next.calls.length, 0);
});

test('progress is saved before each polling sleep', async () => {
  const r = rig([pr([check('unit', null)])], { deadline: 1060 });
  const events = [];
  await watch(r.state, { ...r.deps, save: state => events.push(['save', state.result?.status ?? null]),
    sleep: async ms => { events.push(['sleep', ms]); await r.deps.sleep(ms); } });
  assert.deepEqual(events, [['save', null], ['sleep', 30000], ['save', null], ['sleep', 30000], ['save', 'pending']]);
});

test('a rerun ignores old linked failures until a newer attempt exists', async () => {
  const old = pr([check('unit', 'FAILURE', { detailsUrl: link })]);
  const r = rig([old, run(), old, run({ attempt: 2 }), args => {
    assert.ok(args.includes('--attempt'));
    assert.equal(args[args.indexOf('--attempt') + 1], '2');
    return run({ attempt: 2 });
  }], { rerun: '11', afterAttempt: 1 });
  assert.equal((await watch(r.state, r.deps)).status, 'passed');
  assert.equal(r.calls.length, 5);
  assert.equal(r.sleeps.length, 1);
  assert.deepEqual(r.calls.slice(-2), [
    ['run', 'view', '11', '--repo', 'acme/webapp', '--json', `${RUN_FIELDS},jobs`],
    ['run', 'view', '11', '--repo', 'acme/webapp', '--attempt', '2', '--json', `${RUN_FIELDS},jobs`],
  ]);
});

test('an old rerun attempt cannot pass just because an unrelated check passed', async () => {
  const r = rig([args => args[0] === 'pr' ? pr([check('other')]) : run()],
    { rerun: '11', afterAttempt: 1, deadline: 1060 });
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, 'pending');
  assert.equal(result.counts.pending, 1);
});

test('a branch rerun waits past its old failed listing for the new attempt', async () => {
  let metadataReads = 0;
  const r = rig([args => {
    if (args[0] === 'api') return { sha: SHA };
    if (args[1] === 'list') return [run({ conclusion: 'failure' })];
    if (args.includes('--attempt')) return run({ attempt: 2 });
    metadataReads += 1;
    return run({ attempt: metadataReads === 1 ? 1 : 2, conclusion: metadataReads === 1 ? 'failure' : 'success' });
  }], { pr: undefined, branch: 'feature', rerun: '11', afterAttempt: 1 });
  assert.equal((await watch(r.state, r.deps)).status, 'passed');
  assert.equal(r.sleeps.length, 1);
  assert.equal(r.calls.length, 7);
});

test('an unrelated failure returns even while the requested rerun has not started', async () => {
  const r = rig([pr([check('old', 'FAILURE', { detailsUrl: link }), check('other', 'FAILURE')])], { rerun: '11', afterAttempt: 1 });
  assert.equal((await watch(r.state, r.deps)).failed[0].name, 'other');
  assert.equal(r.calls.length, 1);
});

test('the newer rerun attempt can fail immediately', async () => {
  const r = rig([pr([check('old', 'FAILURE', { detailsUrl: link })]), run({ attempt: 2 }),
    run({ attempt: 2, jobs: [check('new failure', 'FAILURE')] })], { rerun: '11', afterAttempt: 1 });
  assert.equal((await watch(r.state, r.deps)).failed[0].name, 'new failure');
  assert.equal(r.calls.length, 3);
});

test('a rerun for another SHA is an evidence gap, not a pass', async () => {
  const r = rig([args => args[0] === 'pr' ? pr([]) : run({ headSha: OTHER, attempt: 2 })], { rerun: '11', afterAttempt: 1 });
  assert.equal((await watch(r.state, r.deps)).status, 'blocked');
});

for (const mismatch of ['sha', 'attempt']) test(`invalid rerun metadata ${mismatch} is rejected before valid detail`, async () => {
  const r = rig([args => {
    if (args[0] === 'pr') return pr([]);
    if (mismatch === 'sha') return run({ headSha: args.includes('--attempt') ? SHA : OTHER, attempt: 2 });
    return run({ attempt: '2' });
  }], { rerun: '11', afterAttempt: 1 });
  assert.equal((await watch(r.state, r.deps)).status, 'blocked');
  assert.equal(r.calls.some(args => args.includes('--attempt')), false);
});

test('an attempt change between metadata and exact-job reads cannot pass', async () => {
  const r = rig([args => args[0] === 'pr' ? pr([]) : run({ attempt: args.includes('--attempt') ? 3 : 2 })],
    { rerun: '11', afterAttempt: 1 });
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, 'blocked');
  assert.match(result.reason, /attempt changed/);
});

test('passing run details from another SHA cannot certify PR checks', async () => {
  const r = rig([args => args[0] === 'pr' ? pr([check('unit', 'SUCCESS', { detailsUrl: link })]) : run({ headSha: OTHER })]);
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, 'blocked');
  assert.match(result.reason, /another revision/);
});

for (const target of ['pr', 'branch']) test(`${target} partial rerun retains required jobs that already passed`, async () => {
  const latest = run({ attempt: 2, jobs: [check('lint'), check('unit')] });
  const r = rig([args => {
    if (args[0] === 'pr') return pr([check('lint', 'SUCCESS', { detailsUrl: link }), check('unit', 'FAILURE', { detailsUrl: link })]);
    if (args[0] === 'api') return { sha: SHA };
    if (args[1] === 'list') return [latest];
    return args.includes('--attempt') ? run({ attempt: 2, jobs: [check('unit')] }) : latest;
  }], { ...(target === 'branch' ? { pr: undefined, branch: 'feature' } : {}),
    rerun: '11', afterAttempt: 1, expected: ['lint', 'unit'] });
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, 'passed');
  assert.deepEqual(result.required.missing, []);
  assert.equal(r.sleeps.length, 0);
});

for (const conclusion of ['SUCCESS', 'FAILURE']) test(`rerun waits for new job records then reports ${conclusion}`, async () => {
  const old = pr([check('lint', 'SUCCESS', { detailsUrl: link }), check('unit', 'FAILURE', { detailsUrl: link })]);
  const stale = run({ attempt: 2, status: 'in_progress', conclusion: '', jobs: [check('lint'), check('unit', 'FAILURE')] });
  const r = rig([old, stale, run({ attempt: 2, status: 'in_progress', conclusion: '', jobs: [] }),
    old, stale, run({ attempt: 2, jobs: [check('unit', conclusion)] })],
  { rerun: '11', afterAttempt: 1, expected: ['lint', 'unit'] });
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, conclusion === 'SUCCESS' ? 'passed' : 'failed');
  assert.equal(r.sleeps.length, 1);
  assert.equal(r.calls.length, 6);
});

test('current rerun pending jobs replace earlier passing evidence', async () => {
  const r = rig([args => {
    if (args[0] === 'pr') return pr([check('unit', 'SUCCESS', { detailsUrl: link })]);
    return run({ attempt: 2, status: 'in_progress', conclusion: '',
      jobs: [check('unit', args.includes('--attempt') ? null : 'SUCCESS')] });
  }], { rerun: '11', afterAttempt: 1, expected: ['unit'], deadline: 1060 });
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, 'pending');
  assert.deepEqual(result.required.missing, ['unit']);
});

test('branch failures already in the listing return before any detail read', async () => {
  const r = rig([args => {
    if (args[0] === 'api') return { sha: SHA };
    if (args[1] === 'list') return [run({ status: 'in_progress', conclusion: '' }),
      run({ databaseId: 12, workflowDatabaseId: 8, name: 'broken', conclusion: 'failure' })];
    throw new Error('Details unavailable');
  }], { pr: undefined, branch: 'feature' });
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, 'failed');
  assert.equal(result.failed[0].name, 'broken');
  assert.equal(result.pending[0].name, 'CI');
  assert.equal(r.calls.length, 2);
  assert.equal(r.sleeps.length, 0);
});

test('branch watches detect failed jobs before their run completes', async () => {
  const r = rig([{ sha: SHA }, [run()], run({ status: 'in_progress', conclusion: '', jobs: [check('child', 'FAILURE')] })],
    { pr: undefined, branch: 'feature' });
  assert.equal((await watch(r.state, r.deps)).failed[0].name, 'child');
  assert.equal(r.calls.length, 3);
  assert.deepEqual(r.calls, [
    ['api', 'repos/acme/webapp/commits/feature'],
    ['run', 'list', '--repo', 'acme/webapp', '--branch', 'feature', '--commit', SHA, '--limit', '100', '--json', RUN_FIELDS],
    ['run', 'view', '11', '--repo', 'acme/webapp', '--json', `${RUN_FIELDS},jobs`],
  ]);
});

test('a branch child failure returns before another workflow detail read', async () => {
  const r = rig([{ sha: SHA }, [run({ status: 'in_progress', conclusion: '' }),
    run({ databaseId: 12, workflowDatabaseId: 8, status: 'in_progress', conclusion: '' })],
  run({ status: 'in_progress', conclusion: '', jobs: [check('child', 'FAILURE')] }), new Error('Details unavailable')],
  { pr: undefined, branch: 'feature' });
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, 'failed');
  assert.equal(result.failed[0].name, 'child');
  assert.equal(r.calls.length, 3);
});

test('branch watches select latest runs per workflow/event, not obsolete failures', async () => {
  const r = rig([{ sha: SHA }, [run({ databaseId: 12 }), run({ databaseId: 11, conclusion: 'failure' })], args => {
    assert.equal(args[2], '12'); return run({ databaseId: 12 });
  }], { pr: undefined, branch: 'feature' });
  assert.equal((await watch(r.state, r.deps)).status, 'passed');
});

test('branch listing entries for another SHA cannot certify the pinned revision', async () => {
  const r = rig([args => args[0] === 'api' ? { sha: SHA } : args[1] === 'list' ? [run({ headSha: OTHER })] : run()],
    { pr: undefined, branch: 'feature' });
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, 'blocked');
  assert.match(result.reason, /another revision/);
});

for (const sha of [`x${SHA}`, `${SHA}x`, null]) test(`a malformed branch SHA is a bounded read gap: ${sha}`, async () => {
  const r = rig([args => args[0] === 'api' ? { sha } : args[1] === 'list' ? [run()] : run()],
    { pr: undefined, branch: 'feature' });
  assert.equal((await watch(r.state, r.deps)).status, 'blocked');
  assert.equal(r.calls.length, 4);
});

for (const field of ['workflowDatabaseId', 'databaseId']) test(`missing branch ${field} blocks before reading details`, async () => {
  const r = rig([args => args[0] === 'api' ? { sha: SHA } : args[1] === 'list' ? [run({ [field]: undefined })] : run()],
    { pr: undefined, branch: 'feature' });
  assert.equal((await watch(r.state, r.deps)).status, 'blocked');
  assert.equal(r.calls.some(args => args[1] === 'view'), false);
});

test('branch run selection keeps each workflow and event independently', async () => {
  const runs = [run({ databaseId: 11, workflowDatabaseId: 7, event: 'push', name: 'unit' }),
    run({ databaseId: 12, workflowDatabaseId: 7, event: 'workflow_dispatch', name: 'manual' }),
    run({ databaseId: 13, workflowDatabaseId: 8, event: 'push', name: 'lint' })];
  const r = rig([args => {
    if (args[0] === 'api') return { sha: SHA };
    if (args[1] === 'list') return runs;
    return runs.find(value => String(value.databaseId) === args[2]);
  }], { pr: undefined, branch: 'feature', expected: ['unit', 'manual', 'lint'] });
  assert.equal((await watch(r.state, r.deps)).status, 'passed');
  assert.deepEqual(r.calls.filter(args => args[1] === 'view').map(args => args[2]).sort(), ['11', '12', '13']);
});

test('branch movement ends before listing old-head runs', async () => {
  const r = rig([{ sha: OTHER }], { pr: undefined, branch: 'feature' });
  assert.equal((await watch(r.state, r.deps)).status, 'superseded');
  assert.equal(r.calls.length, 1);
});

test('a full run-list page cannot silently truncate coverage', async () => {
  const r = rig([args => args[0] === 'api' ? { sha: SHA } : args[1] === 'list' ? Array(100).fill(run()) : run()],
    { pr: undefined, branch: 'feature' });
  assert.equal((await watch(r.state, r.deps)).status, 'blocked');
  assert.equal(r.calls.some(args => args[1] === 'view'), false);
});

test('CLI requires an explicit full revision and one target type', () => {
  const base = ['--repo', 'acme/webapp', '--pr', '1', '--sha', SHA, '--state', '/tmp/watch.json'];
  assert.equal(options(base, 1000000).deadline, 1600);
  assert.throws(() => options([...base, '--branch', 'feature']), /exactly one/);
  assert.throws(() => options(base.map(x => x === SHA ? 'abc123' : x)), /full 40/);
  assert.throws(() => options([...base, '--rerun', '11']), /together/);
  assert.throws(() => options(['--resume', '/tmp/watch.json', '--deadline', '999']), /resume accepts/);
  const configured = options([...base, '--expect', 'lint', '--expect', 'unit', '--rerun', '11', '--after-attempt', '2',
    '--deadline', '1700']);
  assert.deepEqual(configured.expected, ['lint', 'unit']);
  assert.equal(configured.rerun, '11');
  assert.equal(configured.afterAttempt, 2);
  assert.equal(configured.deadline, 1700);
  assert.throws(() => options([...base, '--pr', '2']), /Duplicate/);
  assert.throws(() => options([...base, '--unknown', 'value']), /Invalid option/);
  assert.throws(() => options(base.map((entry, index) => index === 0 ? 'repo' : entry)), /Invalid option/);
  assert.throws(() => options([...base, '--expect', '--deadline']), /Invalid option/);
  const branch = options(['--repo', 'acme/webapp', '--branch', 'feature', '--sha', SHA, '--state', '/tmp/watch.json']);
  assert.equal(branch.branch, 'feature');
  assert.equal(branch.pr, undefined);
  for (const sha of [`x${SHA}`, `${SHA}x`]) assert.throws(() => options(base.map(x => x === SHA ? sha : x)), /full 40/);
  for (const value of ['0', 'invalid', '9007199254740992']) {
    assert.throws(() => options([...base, '--deadline', value]), /positive integer/);
    assert.throws(() => options([...base, '--rerun', '11', '--after-attempt', value]), /positive integer/);
    assert.throws(() => options(base.map((entry, index) => index === 3 ? value : entry)), /positive integer/);
  }
});

function cli(t, delayMs = 0, host = {}, response = pr([check('unit', 'FAILURE')])) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'watch-ci-cli-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const bin = path.join(dir, 'bin'); mkdirSync(bin);
  const fake = path.join(bin, 'gh');
  copyFileSync(new URL('./bin/gh', import.meta.url), fake); chmodSync(fake, 0o755);
  const fixture = path.join(dir, 'responses.json');
  writeFileSync(fixture, JSON.stringify([{ args: ['pr', 'view', '1', '--repo', 'acme/webapp', '--json',
    'number,url,state,headRefOid,headRefName,mergedAt,closedAt,statusCheckRollup'], response, delayMs }]));
  const state = path.join(dir, 'nested', 'watch.json');
  const trace = path.join(dir, 'calls.jsonl');
  const env = { ...process.env, PATH: `${bin}${path.delimiter}${process.env.PATH}`, CI_WATCHER_FIXTURE: fixture,
    CI_WATCHER_TRACE: trace, CI_WATCHER_STATE: state };
  delete env.CLAUDECODE;
  Object.assign(env, host);
  const call = args => spawnSync(process.execPath, [runnerFile, ...args], { cwd: dir, env, encoding: 'utf8', timeout: 5000 });
  return { call, state, fixture, trace };
}

test('the packaged CLI runs from a different cwd, persists its result and resumes without gh', t => {
  const { call, state, fixture, trace } = cli(t);
  const first = call(['--repo', 'acme/webapp', '--pr', '1', '--sha', SHA, '--state', state]);
  assert.equal(first.status, 0, first.stderr);
  assert.equal(JSON.parse(first.stdout).status, 'failed');
  const observed = JSON.parse(readFileSync(trace, 'utf8').trim());
  assert.equal(observed.watcherPid, first.pid);
  assert.equal(observed.lockOwner, String(first.pid));
  assert.equal(JSON.parse(readFileSync(state, 'utf8')).result.failed[0].name, 'unit');
  assert.equal(existsSync(`${state}.lock`), false);
  writeFileSync(fixture, '[]');
  const resumed = call(['--resume', state]);
  assert.equal(resumed.status, 0, resumed.stdout);
  assert.equal(JSON.parse(resumed.stdout).status, 'failed');
  const duplicate = call(['--repo', 'acme/webapp', '--pr', '1', '--sha', SHA, '--state', state]);
  assert.equal(duplicate.status, 2);
  assert.match(JSON.parse(duplicate.stdout).reason, /already exists/);
});

test('the CLI sleeps after a pending poll until its real deadline', t => {
  const { call, state, trace } = cli(t, 0, {}, pr([check('unit', null)]));
  const deadline = Math.floor(Date.now() / 1000) + 2;
  const result = call(['--repo', 'acme/webapp', '--pr', '1', '--sha', SHA, '--state', state, '--deadline', String(deadline)]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).status, 'pending');
  assert.ok(Date.now() >= deadline * 1000);
  assert.equal(readFileSync(trace, 'utf8').trim().split('\n').length, 1);
});

test('the CLI returns before the host call limit even when gh is slow', t => {
  const { call, state } = cli(t, 2000);
  const first = call(['--repo', 'acme/webapp', '--pr', '1', '--sha', SHA, '--state', state, '--call-limit-ms', '60200']);
  assert.equal(first.status, 0, first.stderr);
  assert.equal(JSON.parse(first.stdout).status, 'slice');
  const saved = JSON.parse(readFileSync(state, 'utf8'));
  assert.match(saved.error, /exceeded the watch time budget/);
  assert.equal(saved.result, undefined);
  assert.equal(existsSync(`${state}.lock`), false);
});

for (const explicit of [false, true]) test(`Claude host budget is detected with explicit override=${explicit}`, t => {
  const { call, state } = cli(t, 500, { CLAUDECODE: '1', BASH_MAX_TIMEOUT_MS: explicit ? '61000' : '60200' });
  const args = ['--repo', 'acme/webapp', '--pr', '1', '--sha', SHA, '--state', state];
  if (explicit) args.push('--call-limit-ms', '60200');
  const result = call(args);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).status, 'slice');
  assert.match(JSON.parse(readFileSync(state, 'utf8')).error, /exceeded the watch time budget/);
});

test('a live watcher lock blocks resume without replacing state or lock', t => {
  const { call, state } = cli(t);
  mkdirSync(path.dirname(state));
  const original = JSON.stringify({ version: 1, config: config(), result: { status: 'failed' } });
  writeFileSync(state, original);
  writeFileSync(`${state}.lock`, String(process.pid));
  const result = call(['--resume', state]);
  assert.equal(result.status, 2);
  assert.equal(JSON.parse(result.stdout).status, 'blocked');
  assert.match(JSON.parse(result.stdout).reason, /active watcher/);
  assert.equal(readFileSync(state, 'utf8'), original);
  assert.equal(readFileSync(`${state}.lock`, 'utf8'), String(process.pid));
});

test('a stale watcher lock is recovered after its owner exits', t => {
  const { call, state } = cli(t);
  const owner = spawnSync(process.execPath, ['-e', ''], { timeout: 5000 });
  assert.equal(owner.status, 0);
  assert.throws(() => process.kill(owner.pid, 0), { code: 'ESRCH' });
  mkdirSync(path.dirname(state));
  writeFileSync(`${state}.lock`, String(owner.pid));
  const result = call(['--repo', 'acme/webapp', '--pr', '1', '--sha', SHA, '--state', state]);
  assert.equal(result.status, 0, result.stdout);
  assert.equal(JSON.parse(result.stdout).status, 'failed');
  assert.equal(existsSync(`${state}.lock`), false);
});

test('an unsupported saved-state version is rejected without a GitHub read', t => {
  const { call, state, fixture } = cli(t);
  mkdirSync(path.dirname(state));
  writeFileSync(state, JSON.stringify({ version: 0, config: config(), result: { status: 'passed' } }));
  const original = readFileSync(fixture, 'utf8');
  const result = call(['--resume', state]);
  assert.equal(result.status, 2);
  assert.match(JSON.parse(result.stdout).reason, /Invalid watch state/);
  assert.equal(readFileSync(fixture, 'utf8'), original);
});
