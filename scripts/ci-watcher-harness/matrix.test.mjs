import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { chmodSync, copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { loadRunner, runnerFile } from './template.mjs';

const { watch, options } = await loadRunner();
const SHA = 'a'.repeat(40);
const OTHER = 'b'.repeat(40);
const PR_FIELDS = 'number,url,state,headRefOid,headRefName,mergedAt,closedAt,mergeable,mergeStateStatus,statusCheckRollup';
const RUN_FIELDS = 'databaseId,headSha,headBranch,status,conclusion,attempt,name,url,workflowDatabaseId,event';
const link = 'https://example.com/acme/webapp/actions/runs/11/job/22';
const check = (name = 'unit', conclusion = 'SUCCESS', extra = {}) => ({
  name, status: conclusion === null ? 'IN_PROGRESS' : 'COMPLETED', conclusion, detailsUrl: '', ...extra,
});
const pr = (checks = [check()], extra = {}) => ({
  number: 1, url: 'https://example.com/acme/webapp/pull/1', state: 'OPEN', headRefOid: SHA,
  headRefName: 'feature', mergedAt: null, closedAt: null, mergeable: 'MERGEABLE', mergeStateStatus: 'CLEAN',
  statusCheckRollup: checks, ...extra,
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
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, state.toLowerCase());
  assert.deepEqual(result.checks, []);
  assert.equal(r.calls.length, 1);
  assert.equal(r.sleeps.length, 0);
});

test('a merged PR reports the check state at merge time without reading runs', async () => {
  const r = rig([pr([check('unit', null, { detailsUrl: link }), check('lint')], { state: 'MERGED' })]);
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, 'merged');
  assert.deepEqual(result.pending.map(row => row.name), ['unit']);
  assert.deepEqual(result.counts, { pass: 1, fail: 0, pending: 1, skip: 0, cancel: 0 });
  assert.equal(r.calls.length, 1);
});

test('a moved PR head never certifies passing checks', async () => {
  const r = rig([pr([check()], { headRefOid: OTHER })]);
  assert.equal((await watch(r.state, r.deps)).status, 'superseded');
  assert.equal(r.calls.length, 1);
});

test('a head that moves after a pending poll carries none of the old head checks', async () => {
  const r = rig([pr([check('unit', null)]), pr([check()], { headRefOid: OTHER })]);
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, 'superseded');
  assert.equal(result.observedSha, OTHER);
  assert.deepEqual(result.checks, []);
  assert.equal(r.calls.length, 2);
  assert.equal(r.sleeps.length, 1);
});

test('optional failure returns while required checks are pending, without another read', async () => {
  const r = rig([pr([check('optional', 'FAILURE', { detailsUrl: link }), check('required', null)])], { expected: ['required'] });
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, 'failed');
  assert.deepEqual(result.failed, [{ name: 'optional', bucket: 'fail', link }]);
  assert.deepEqual(result.pending.map(row => row.name), ['required']);
  assert.equal(result.targetSha, SHA);
  assert.equal(result.observedSha, SHA);
  assert.deepEqual(result.pr, { number: 1, url: 'https://example.com/acme/webapp/pull/1', state: 'OPEN',
    mergedAt: null, closedAt: null, mergeable: 'MERGEABLE', mergeStateStatus: 'CLEAN' });
  assert.deepEqual(result.counts, { pass: 0, fail: 1, pending: 1, skip: 0, cancel: 0 });
  assert.deepEqual(result.required, { expected: ['required'], missing: ['required'], coverage: 'caller-specified' });
  assert.equal(r.calls.length, 1);
});

test('a conflicted PR returns at once, even before any check reports', async () => {
  const r = rig([pr([], { mergeable: 'CONFLICTING', mergeStateStatus: 'DIRTY' })]);
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, 'conflicted');
  assert.equal(result.pr.mergeable, 'CONFLICTING');
  assert.equal(result.pr.mergeStateStatus, 'DIRTY');
  assert.equal(r.calls.length, 1);
  assert.equal(r.sleeps.length, 0);
});

test('a conflict outranks passing checks and carries the failed and pending checks', async () => {
  const r = rig([pr([check('unit'), check('lint', 'FAILURE', { detailsUrl: link }), check('e2e', null)],
    { mergeable: 'CONFLICTING' })], { expected: ['unit'] });
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, 'conflicted');
  assert.deepEqual(result.failed, [{ name: 'lint', bucket: 'fail', link }]);
  assert.deepEqual(result.pending.map(row => row.name), ['e2e']);
  assert.deepEqual(result.required.missing, []);
  assert.equal(r.calls.length, 1);
});

test('a conflict that appears while checks run ends the watch on that poll', async () => {
  const running = [check('unit', null)];
  const r = rig([pr(running), pr(running, { mergeable: 'CONFLICTING' })]);
  assert.equal((await watch(r.state, r.deps)).status, 'conflicted');
  assert.equal(r.calls.length, 2);
  assert.equal(r.sleeps.length, 1);
});

test('passing checks wait for GitHub to compute mergeability', async () => {
  const r = rig([pr([check()], { mergeable: 'UNKNOWN', mergeStateStatus: 'UNKNOWN' }), pr([check()])]);
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, 'passed');
  assert.equal(result.pr.mergeable, 'MERGEABLE');
  assert.equal(r.calls.length, 2);
  assert.equal(r.sleeps.length, 1);
});

test('mergeability that stays unknown is pending at the deadline, not passed or blocked', async () => {
  const r = rig([pr([check()], { mergeable: 'UNKNOWN' })], { deadline: 1600 });
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, 'pending');
  assert.equal(result.reason, 'Watch deadline reached');
  assert.equal(r.state.errors, 0);
  assert.deepEqual(result.pending, [{ name: 'GitHub mergeability', bucket: 'pending',
    link: 'https://example.com/acme/webapp/pull/1' }]);
  assert.equal(r.now(), 1600000);
});

test('all-skipped checks wait for mergeability before blocking', async () => {
  const skipped = [check('optional', 'SKIPPED')];
  const r = rig([pr(skipped, { mergeable: 'UNKNOWN' }), pr(skipped)]);
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, 'blocked');
  assert.equal(result.reason, 'No check passed');
  assert.equal(r.calls.length, 2);
  assert.equal(r.sleeps.length, 1);
});

test('merge state is reported, not judged, when the PR is mergeable', async () => {
  const r = rig([pr([check()], { mergeStateStatus: 'BLOCKED' })]);
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, 'passed');
  assert.equal(result.pr.mergeStateStatus, 'BLOCKED');
});

for (const [label, extra, status] of [['a moved head', { headRefOid: OTHER }, 'superseded'],
  ['a closed PR', { state: 'CLOSED' }, 'closed'], ['a merged PR', { state: 'MERGED' }, 'merged']]) {
  test(`${label} outranks a reported conflict`, async () => {
    const r = rig([pr([check()], { mergeable: 'CONFLICTING', ...extra })]);
    assert.equal((await watch(r.state, r.deps)).status, status);
    assert.equal(r.calls.length, 1);
  });
}

test('mergeability is validated only at the pinned head', async () => {
  const r = rig([pr([check()], { headRefOid: OTHER, mergeable: undefined })]);
  assert.equal((await watch(r.state, r.deps)).status, 'superseded');
  assert.equal(r.calls.length, 1);
});

for (const [label, detailsUrl] of Object.entries({ job: link,
  workflow: 'https://example.com/acme/webapp/actions/runs/11',
  query: 'https://example.com/acme/webapp/actions/runs/11?check_suite_focus=true' })) test(`${label} link exposes a failed child while its PR workflow remains pending`, async () => {
  const r = rig([pr([check('aggregate', null, { detailsUrl })]),
    run({ status: 'in_progress', conclusion: '', jobs: [check('child', 'FAILURE')] })]);
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, 'failed');
  assert.deepEqual(result.failed.map(row => row.name), ['child']);
  assert.equal(r.calls.length, 2);
  assert.deepEqual(r.calls, [['pr', 'view', '1', '--repo', 'acme/webapp', '--json', PR_FIELDS],
    ['run', 'view', '11', '--repo', 'acme/webapp', '--json', `${RUN_FIELDS},jobs`]]);
});

test('run details replace a stale pending rollup row for the same run', async () => {
  const r = rig([pr([check('unit', null, { detailsUrl: link })]), run()]);
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, 'passed');
  assert.deepEqual(result.checks.map(row => [row.name, row.bucket]), [['CI', 'pass'], ['unit', 'pass']]);
  assert.equal(r.calls.length, 2);
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
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, 'failed');
  assert.deepEqual(result.failed.map(row => row.name), ['external']);
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
  pr([], { headRefOid: `x${SHA}` }), pr([], { headRefOid: `${SHA}x` }),
  pr([check()], { mergeable: undefined }), pr([check()], { mergeable: 'YES' })]) {
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

test('a conflict during a rerun omits the stale attempt it replaces', async () => {
  const r = rig([pr([check('unit', 'FAILURE', { detailsUrl: link }), check('lint')], { mergeable: 'CONFLICTING' })],
    { rerun: '11', afterAttempt: 1 });
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, 'conflicted');
  assert.deepEqual(result.failed, []);
  assert.deepEqual(result.checks.map(row => row.name), ['lint']);
  assert.equal(r.calls.length, 1);
});

test('an unrelated failure returns even while the requested rerun has not started', async () => {
  const r = rig([pr([check('old', 'FAILURE', { detailsUrl: link }), check('other', 'FAILURE')])], { rerun: '11', afterAttempt: 1 });
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, 'failed');
  assert.deepEqual(result.failed.map(row => row.name), ['other']);
  assert.equal(r.calls.length, 1);
});

test('the newer rerun attempt can fail immediately', async () => {
  const r = rig([pr([check('old', 'FAILURE', { detailsUrl: link })]), run({ attempt: 2 }),
    run({ attempt: 2, jobs: [check('new failure', 'FAILURE')] })], { rerun: '11', afterAttempt: 1 });
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, 'failed');
  assert.deepEqual(result.failed.map(row => row.name), ['new failure']);
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
  assert.deepEqual(result.failed.map(row => row.name), ['broken']);
  assert.deepEqual(result.pending.map(row => row.name), ['CI']);
  assert.equal(r.calls.length, 2);
  assert.equal(r.sleeps.length, 0);
});

test('branch watches detect failed jobs before their run completes', async () => {
  const r = rig([{ sha: SHA }, [run()], run({ status: 'in_progress', conclusion: '', jobs: [check('child', 'FAILURE')] })],
    { pr: undefined, branch: 'feature' });
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, 'failed');
  assert.deepEqual(result.failed.map(row => row.name), ['child']);
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
  assert.deepEqual(result.failed.map(row => row.name), ['child']);
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

test('an unnamed workflow run is reported by its run id', async () => {
  const r = rig([{ sha: SHA }, [run({ name: '', status: 'in_progress', conclusion: '' })],
    run({ name: '', conclusion: 'failure', jobs: [] })], { pr: undefined, branch: 'feature' });
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, 'failed');
  assert.deepEqual(result.failed.map(row => row.name), ['Run 11']);
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
  // The fake is extensionless CommonJS; a "type": "module" package.json above
  // the temp directory would otherwise make Node load it as an ES module.
  writeFileSync(path.join(bin, 'package.json'), '{"type":"commonjs"}');
  const fixture = path.join(dir, 'responses.json');
  writeFileSync(fixture, JSON.stringify([{ args: ['pr', 'view', '1', '--repo', 'acme/webapp', '--json',
    PR_FIELDS], response, delayMs }]));
  const state = path.join(dir, 'nested', 'watch.json');
  const trace = path.join(dir, 'calls.jsonl');
  const env = { ...process.env, PATH: `${bin}${path.delimiter}${process.env.PATH}`, CI_WATCHER_FIXTURE: fixture,
    WORKBENCH_CI_WATCH_REGISTRY: path.join(dir, 'registry'),
    CI_WATCHER_TRACE: trace, CI_WATCHER_STATE: state };
  delete env.CLAUDECODE;
  Object.assign(env, host);
  const call = (args, preload, environment = {}) => spawnSync(process.execPath, [...(preload ? ['--require', preload] : []), runnerFile, ...args], { cwd: dir, env: { ...env, ...environment }, encoding: 'utf8', timeout: 5000 });
  const start = (args, preload) => {
    const child = spawn(process.execPath, [...(preload ? ['--require', preload] : []), runnerFile, ...args], { cwd: dir, env });
    let stdout = '';
    child.stdout.on('data', data => { stdout += data; });
    const done = new Promise((resolve, reject) => {
      child.on('error', reject);
      child.on('close', status => resolve({ status, stdout }));
    });
    t.after(() => { if (child.exitCode === null) child.kill(); });
    return { child, done };
  };
  return { call, start, state, fixture, trace, dir };
}

test('the packaged CLI runs from a different cwd, persists its result and resumes without gh', t => {
  const { call, state, fixture, trace } = cli(t);
  const first = call(['--repo', 'acme/webapp', '--pr', '1', '--sha', SHA, '--state', state]);
  assert.equal(first.status, 0, first.stderr);
  assert.equal(JSON.parse(first.stdout).status, 'failed');
  const observed = JSON.parse(readFileSync(trace, 'utf8').trim());
  assert.equal(observed.watcherPid, first.pid);
  assert.equal(observed.lockOwner, String(first.pid));
  assert.deepEqual(JSON.parse(readFileSync(state, 'utf8')).result.failed.map(row => row.name), ['unit']);
  assert.equal(existsSync(`${state}.lock`), false);
  writeFileSync(fixture, '[]');
  const resumed = call(['--resume', state]);
  assert.equal(resumed.status, 0, resumed.stdout);
  assert.equal(JSON.parse(resumed.stdout).status, 'failed');
  assert.equal(JSON.parse(resumed.stdout).reused, true);
  const duplicate = call(['--repo', 'acme/webapp', '--pr', '1', '--sha', SHA, '--state', state]);
  assert.equal(duplicate.status, 0);
  assert.equal(JSON.parse(duplicate.stdout).status, 'failed');
  assert.equal(JSON.parse(duplicate.stdout).reused, true);
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

test('protocol evidence is explicit and old saved passes cannot acquire new guarantees', async t => {
  const r = rig([pr()]);
  assert.equal((await watch(r.state, r.deps)).protocolVersion, 2);
  const { call, state, fixture } = cli(t);
  mkdirSync(path.dirname(state));
  writeFileSync(state, JSON.stringify({ version: 1, config: config(), result: { status: 'passed' } }));
  const before = readFileSync(fixture, 'utf8');
  const result = call(['--resume', state, '--protocol', '2']);
  assert.equal(result.status, 2);
  assert.match(JSON.parse(result.stdout).reason, /Invalid watch state/);
  assert.equal(readFileSync(fixture, 'utf8'), before);
});

test('a protocol mismatch fails before any GitHub read', t => {
  const { call, state, fixture } = cli(t);
  const before = readFileSync(fixture, 'utf8');
  const result = call(['--repo', 'acme/webapp', '--pr', '1', '--sha', SHA, '--state', state, '--protocol', '1']);
  assert.equal(result.status, 2);
  assert.match(JSON.parse(result.stdout).reason, /protocol/i);
  assert.equal(readFileSync(fixture, 'utf8'), before);
});

test('background mode bypasses automatic foreground slicing', t => {
  const { call, state } = cli(t, 400, { CLAUDECODE: '1', BASH_MAX_TIMEOUT_MS: '60200' });
  const result = call(['--repo', 'acme/webapp', '--pr', '1', '--sha', SHA, '--state', state,
    '--protocol', '2', '--wait-mode', 'background']);
  assert.equal(result.status, 0, result.stdout);
  assert.equal(JSON.parse(result.stdout).status, 'failed');
  assert.equal(JSON.parse(result.stdout).protocolVersion, 2);
});

test('a different state filename reuses terminal target evidence without polling again', t => {
  const { call, state, fixture } = cli(t);
  const first = call(['--repo', 'acme/webapp', '--pr', '1', '--sha', SHA, '--state', state]);
  assert.equal(JSON.parse(first.stdout).status, 'failed');
  writeFileSync(fixture, '[]');
  const other = path.join(path.dirname(state), 'another.json');
  const result = call(['--repo', 'ACME/WEBAPP', '--pr', '1', '--sha', SHA, '--state', other]);
  assert.equal(result.status, 0, result.stdout);
  assert.equal(JSON.parse(result.stdout).status, 'failed');
  assert.equal(JSON.parse(result.stdout).reused, true);
  assert.equal(JSON.parse(result.stdout).stateFile, state);
  assert.equal(existsSync(other), false);
});

test('shared target evidence cannot silently weaken a second caller required checks', t => {
  const { call, state, fixture } = cli(t);
  call(['--repo', 'acme/webapp', '--pr', '1', '--sha', SHA, '--state', state]);
  writeFileSync(fixture, '[]');
  const result = call(['--repo', 'acme/webapp', '--pr', '1', '--sha', SHA,
    '--state', `${state}.other`, '--expect', 'integration']);
  assert.equal(result.status, 2);
  assert.match(JSON.parse(result.stdout).reason, /expected checks/i);
});

test('two processes with different state paths share one active target owner', async t => {
  const { start, call, state, trace } = cli(t, 1500);
  const args = ['--repo', 'acme/webapp', '--pr', '1', '--sha', SHA, '--state', state];
  const first = start(args);
  const until = Date.now() + 3000;
  while (!existsSync(trace) && Date.now() < until) await new Promise(resolve => setTimeout(resolve, 10));
  assert.ok(existsSync(trace), 'first process must reach the GitHub boundary');
  const originalDeadline = JSON.parse(readFileSync(state, 'utf8')).config.deadline;
  const result = call([...args.slice(0, -1), `${state}.other`, '--deadline', String(originalDeadline + 3600)]);
  assert.equal(result.status, 0, result.stdout);
  assert.equal(JSON.parse(result.stdout).deadline, originalDeadline);
  assert.equal(JSON.parse(result.stdout).status, 'watching');
  assert.equal(JSON.parse(result.stdout).stateFile, state);
  assert.equal(existsSync(`${state}.other`), false);
  assert.equal((await first.done).status, 0);
  assert.equal(readFileSync(trace, 'utf8').trim().split('\n').length, 1);
});

test('an interrupted target resumes its original state and deadline under a different filename', t => {
  const { call, state, fixture } = cli(t, 500);
  const args = ['--repo', 'acme/webapp', '--pr', '1', '--sha', SHA, '--state', state];
  const first = call([...args, '--call-limit-ms', '60200']);
  assert.equal(JSON.parse(first.stdout).status, 'slice');
  const originalDeadline = JSON.parse(readFileSync(state, 'utf8')).config.deadline;
  writeFileSync(fixture, '[]');
  const result = call([...args.slice(0, -1), `${state}.other`, '--deadline', String(originalDeadline + 3600)]);
  assert.equal(result.status, 0, result.stdout);
  assert.equal(JSON.parse(result.stdout).status, 'resumable');
  assert.equal(JSON.parse(result.stdout).deadline, originalDeadline);
  assert.equal(JSON.parse(result.stdout).stateFile, state);
});

test('the CLI returns compact evidence while retaining every check in state', t => {
  const { call, state } = cli(t, 0, {}, pr([check('unit'), check('advisory', 'SKIPPED')]));
  const result = call(['--repo', 'acme/webapp', '--pr', '1', '--sha', SHA, '--state', state, '--protocol', '2']);
  const verdict = JSON.parse(result.stdout);
  assert.equal(verdict.status, 'passed');
  assert.equal(verdict.checks, undefined);
  assert.deepEqual(verdict.skipped.map(x => x.name), ['advisory']);
  assert.equal(verdict.pr.mergeable, 'MERGEABLE');
  assert.ok(Number.isFinite(Date.parse(verdict.observedAt)));
  assert.deepEqual(JSON.parse(readFileSync(state, 'utf8')).checks.map(x => x.name), ['unit', 'advisory']);
});

test('completed PR jobs are cached while current metadata still guards a rerun', async () => {
  let poll = 0;
  const r = rig([args => {
    if (args[0] === 'pr') { poll += 1; return pr([check('unit', 'SUCCESS', { detailsUrl: link }), check('external', null)]); }
    const fields = args[args.indexOf('--json') + 1];
    if (poll < 3) return run(fields.includes('jobs') ? {} : { jobs: undefined });
    return run({ attempt: 2, status: 'in_progress', conclusion: '', jobs: [check('regression', 'FAILURE')] });
  }]);
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, 'failed');
  assert.deepEqual(result.failed.map(x => x.name), ['regression']);
  const reads = r.calls.filter(args => args[0] === 'run');
  assert.equal(reads[1][reads[1].indexOf('--json') + 1], RUN_FIELDS);
  assert.equal(reads.filter(args => args.includes(`${RUN_FIELDS},jobs`)).length, 2);
});

test('branch metadata avoids rereading completed jobs while another workflow runs', async () => {
  let poll = 0;
  const r = rig([args => {
    if (args[0] === 'api') return { sha: SHA };
    if (args[1] === 'list') { poll += 1; return [run(), run({ databaseId: 12, workflowDatabaseId: 8, status: 'in_progress', conclusion: '' })]; }
    if (args[2] === '11') return run();
    return run({ databaseId: 12, workflowDatabaseId: 8, jobs: [check('integration', poll === 1 ? null : 'FAILURE')], status: 'in_progress', conclusion: '' });
  }], { pr: undefined, branch: 'feature' });
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, 'failed');
  assert.deepEqual(result.failed.map(x => x.name), ['integration']);
  assert.equal(r.calls.filter(args => args[1] === 'view' && args[2] === '11').length, 1);
  assert.equal(r.calls.filter(args => args[1] === 'view' && args[2] === '12').length, 2);
});

test('rate limiting pauses beyond four reads and recovers inside the original deadline', async () => {
  let reads = 0;
  const r = rig([() => { if (++reads <= 5) throw new Error('HTTP 429: secondary rate limit'); return pr(); }], { deadline: 3000 });
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, 'passed');
  assert.equal(r.state.errors, 0);
  assert.deepEqual(r.sleeps, [60000, 120000, 240000, 300000, 300000]);
});

test('a rate limit pause survives slices without extending the watch deadline', async () => {
  const r = rig([new Error('HTTP 429: Retry-After: 120')], { deadline: 1100 });
  assert.equal((await watch(r.state, { ...r.deps, callLimitMs: 30000 })).status, 'slice');
  const next = rig([pr()], {}, JSON.parse(JSON.stringify(r.state)));
  next.setClock(r.now());
  assert.equal((await watch(next.state, next.deps)).status, 'pending');
  assert.equal(next.calls.length, 0);
  assert.equal(next.state.config.deadline, 1100);
});


test('completed metadata with unfinished jobs is reread for an early child failure', async () => {
  let poll = 0;
  const r = rig([args => {
    if (args[0] === 'pr') { poll += 1; return pr([check('unit', null, { detailsUrl: link })]); }
    return run({ jobs: [check('unit', poll === 1 ? null : 'FAILURE')] });
  }]);
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, 'failed');
  assert.deepEqual(result.failed.map(row => row.name), ['unit']);
  assert.ok(r.calls.filter(args => args[0] === 'run').every(args => args.includes(`${RUN_FIELDS},jobs`)));
});

test('a cached run rejects mismatched metadata and detail attempts instead of passing', async () => {
  const r = rig([args => args[0] === 'pr' ? pr([check('unit', 'SUCCESS', { detailsUrl: link })]) :
    args.includes(RUN_FIELDS) ? run({ attempt: 2, jobs: undefined }) : run()]);
  r.state.runCache = { 11: run() };
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, 'blocked');
  assert.match(result.reason, /attempt changed/);
  assert.equal(r.state.errors, 4);
});


for (const seam of ['claim', 'registry']) test(`an acquisition interrupted at ${seam} can resume its original state`, t => {
  const { call, state, fixture, dir } = cli(t, 500);
  const args = ['--repo', 'acme/webapp', '--pr', '1', '--sha', SHA, '--state', state];
  assert.equal(JSON.parse(call([...args, '--call-limit-ms', '60200']).stdout).status, 'slice');
  const before = JSON.parse(readFileSync(state, 'utf8'));
  const registry = path.join(dir, 'registry');
  const entry = path.join(registry, readdirSync(registry).find(name => name.endsWith('.json')));
  const preload = path.join(dir, 'interrupt.cjs');
  writeFileSync(preload, `const fs = require('node:fs');
const original = fs.writeFileSync;
fs.writeFileSync = function(file, data, ...rest) {
  const result = original.call(this, file, data, ...rest);
  if (${JSON.stringify(seam)} === 'claim' ? String(file).endsWith('.claim') :
      (String(file) === ${JSON.stringify(entry)} || (String(file).startsWith(${JSON.stringify(entry + '.')}) && !String(file).includes('.lock') && String(file).endsWith('.tmp')))) process.kill(process.pid, 'SIGKILL');
  return result;
};
require('node:module').syncBuiltinESMExports();`);
  assert.equal(call(['--resume', state], preload).signal, 'SIGKILL');
  assert.equal(JSON.parse(readFileSync(state, 'utf8')).config.deadline, before.config.deadline);
  const other = call([...args.slice(0, -1), `${state}.other`]);
  assert.equal(JSON.parse(other.stdout).status, 'resumable');
  assert.equal(JSON.parse(other.stdout).deadline, before.config.deadline);
  writeFileSync(fixture, JSON.stringify([{ args: ['pr', 'view', '1', '--repo', 'acme/webapp', '--json', PR_FIELDS], response: pr() }]));
  const resumed = JSON.parse(call(['--resume', state]).stdout);
  assert.equal(resumed.status, 'passed');
  assert.equal(resumed.deadline, before.config.deadline);
});

test('a registry pathname reused by another head cannot lend its verdict to the original target', t => {
  const { call, state, trace } = cli(t);
  const args = ['--repo', 'acme/webapp', '--pr', '1', '--sha', SHA, '--state', state, '--deadline', '1'];
  assert.equal(JSON.parse(call(args).stdout).targetSha, SHA);
  renameSync(state, `${state}.archive`);
  assert.equal(JSON.parse(call(args.map(x => x === SHA ? OTHER : x)).stdout).targetSha, OTHER);
  const result = call(args.map(x => x === state ? `${state}.other` : x));
  assert.equal(result.status, 2);
  assert.match(JSON.parse(result.stdout).reason, /another target/);
  assert.equal(existsSync(trace), false);
});

test('registry identities separate repository, PR, branch, SHA and rerun attempts', t => {
  const { call, state, trace } = cli(t);
  const targets = [{}, { repo: 'acme/other' }, { sha: OTHER }, { pr: '2' },
    { branch: 'feature' }, { branch: 'other' }, { rerun: '11', 'after-attempt': '1' },
    { rerun: '12', 'after-attempt': '1' }, { rerun: '11', 'after-attempt': '2' }];
  for (const [index, changed] of targets.entries()) {
    const next = { repo: 'acme/webapp', pr: '1', sha: SHA, deadline: '1', ...changed, state: `${state}.${index}` };
    if (next.branch) delete next.pr;
    const result = JSON.parse(call(Object.entries(next).flatMap(([k, v]) => [`--${k}`, v])).stdout);
    assert.equal(result.status, 'pending');
    assert.equal(result.reused, undefined);
    assert.equal(result.stateFile, next.state);
  }
  assert.equal(existsSync(trace), false);
});

for (const field of ['attempt', 'status', 'conclusion']) test(`completed cache invalidates when only ${field} changes`, async () => {
  const changed = { attempt: 2, status: 'in_progress', conclusion: 'failure' };
  const r = rig([args => args[0] === 'pr' ? pr([check('unit', 'SUCCESS', { detailsUrl: link })]) :
    run({ [field]: changed[field], jobs: [check('new-child', 'FAILURE')] })]);
  r.state.runCache = { 11: run() };
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, 'failed');
  assert.ok(result.failed.some(row => row.name === 'new-child'));
});

for (const invalid of [{ databaseId: 12 }, { headSha: OTHER }, { attempt: undefined }, { attempt: 0 }, { attempt: 1.5 }]) {
  test(`cached metadata rejects invalid identity ${JSON.stringify(invalid)}`, async () => {
    const r = rig([args => args[0] === 'pr' ? pr([check('unit', 'SUCCESS', { detailsUrl: link })]) : run(invalid)]);
    r.state.runCache = { 11: run() };
    assert.equal((await watch(r.state, r.deps)).status, 'blocked');
    assert.equal(r.state.errors, 4);
  });
}


test('concurrent takeover of a dead owner leaves only one GitHub reader', async t => {
  const { call, start, state, fixture, trace, dir } = cli(t, 500);
  const args = ['--repo', 'acme/webapp', '--pr', '1', '--sha', SHA, '--state', state];
  assert.equal(JSON.parse(call([...args, '--call-limit-ms', '60200']).stdout).status, 'slice');
  const saved = JSON.parse(readFileSync(state, 'utf8'));
  const owner = spawnSync(process.execPath, ['-e', '']);
  const registry = path.join(dir, 'registry');
  const entry = path.join(registry, readdirSync(registry).find(name => name.endsWith('.json')));
  writeFileSync(`${entry}.lock`, JSON.stringify({ pid: owner.pid, stateFile: state, config: saved.config }));
  writeFileSync(`${state}.lock`, String(owner.pid));
  writeFileSync(trace, '');
  writeFileSync(fixture, JSON.stringify([{ args: ['pr', 'view', '1', '--repo', 'acme/webapp', '--json', PR_FIELDS],
    response: pr([check('unit', 'FAILURE')]), delayMs: 500 }]));
  const results = await Promise.all([start(['--resume', state]).done, start(['--resume', state]).done]);
  assert.equal(results.filter(result => JSON.parse(result.stdout).status === 'failed').length, 1);
  assert.equal(readFileSync(trace, 'utf8').trim().split('\n').length, 1);
  assert.equal(JSON.parse(readFileSync(state, 'utf8')).result.status, 'failed');
});

test('cancelled evidence names only the cancelled checks alongside passing work', t => {
  const { call, state } = cli(t, 0, {}, pr([check('unit', 'CANCELLED'), check('lint')]));
  const result = JSON.parse(call(['--repo', 'acme/webapp', '--pr', '1', '--sha', SHA, '--state', state]).stdout);
  assert.equal(result.status, 'blocked');
  assert.deepEqual(result.cancelled, [{ name: 'unit', bucket: 'cancel', link: '' }]);
  assert.equal(result.counts.cancel, 1);
  assert.equal(result.counts.pass, 1);
  assert.deepEqual(JSON.parse(readFileSync(state, 'utf8')).result.cancelled, result.cancelled);
});

for (const [header, delay, space] of [[120, 120000, ''], [120, 120000, ' '], [999999, 86400000, ' '], [0, 1000, ' ']]) {
  test(`Retry-After:${space}${header} permits the next read after its bounded pause`, async () => {
    const r = rig([new Error(`HTTP 429 rate limit; Retry-After:${space}${header}`), pr()], { deadline: 200000 });
    const result = await watch(r.state, r.deps);
    assert.equal(result.status, 'passed');
    assert.deepEqual(r.sleeps, [delay]);
    assert.equal(r.calls.length, 2);
  });
}

for (const invalid of [{ databaseId: 12 }, { headSha: OTHER }, { attempt: undefined }, { attempt: 0 }, { attempt: 1.5 }]) {
  test(`invalid metadata cannot trigger a detail read ${JSON.stringify(invalid)}`, async () => {
    const r = rig([args => args[0] === 'pr' ? pr([check('unit', 'SUCCESS', { detailsUrl: link })]) :
      args.includes(RUN_FIELDS) ? run(invalid) : run()]);
    r.state.runCache = { 11: run() };
    assert.equal((await watch(r.state, r.deps)).status, 'blocked');
    assert.equal(r.calls.filter(args => args.includes(`${RUN_FIELDS},jobs`)).length, 0);
  });
}

test('valid fresh metadata cannot certify job details from a different run', async () => {
  const r = rig([args => args[0] === 'pr' ? pr([check('unit', 'SUCCESS', { detailsUrl: link })]) :
    args.includes(RUN_FIELDS) ? run({ attempt: 2 }) : run({ attempt: 2, databaseId: 12 })]);
  r.state.runCache = { 11: run() };
  const result = await watch(r.state, r.deps);
  assert.equal(result.status, 'blocked');
  assert.match(result.reason, /identity/);
});

test('both host wait modes work on new watches and protocol-checked resumes', () => {
  const base = ['--repo', 'acme/webapp', '--pr', '1', '--sha', SHA, '--state', '/tmp/acme.json'];
  for (const mode of ['foreground', 'background']) {
    assert.equal(options([...base, '--wait-mode', mode])['wait-mode'], mode);
    const resumed = options(['--resume', '/tmp/acme.json', '--protocol', '2', '--wait-mode', mode]);
    assert.equal(resumed.resume, '/tmp/acme.json');
    assert.equal(resumed.protocol, '2');
    assert.equal(resumed['wait-mode'], mode);
  }
  assert.throws(() => options([...base, '--wait-mode', 'automatic']), /wait-mode/);
});

for (const ticket of [0, 7]) test(`a live acquisition claim ${ticket} blocks before GitHub or state writes`, t => {
  const { call, state, fixture, trace, dir } = cli(t, 500);
  assert.equal(JSON.parse(call(['--repo', 'acme/webapp', '--pr', '1', '--sha', SHA, '--state', state, '--call-limit-ms', '60200']).stdout).status, 'slice');
  const before = readFileSync(state, 'utf8');
  const registry = path.join(dir, 'registry');
  const entry = path.join(registry, readdirSync(registry).find(name => name.endsWith('.json')));
  writeFileSync(path.join(`${entry}.lock.claims`, `${process.pid}.claim`), String(ticket));
  writeFileSync(trace, '');
  writeFileSync(fixture, JSON.stringify([{ args: ['pr', 'view', '1', '--repo', 'acme/webapp', '--json', PR_FIELDS], response: pr() }]));
  const result = call(['--resume', state]);
  assert.equal(result.status, 2);
  assert.equal(JSON.parse(result.stdout).status, 'blocked');
  assert.equal(readFileSync(trace, 'utf8'), '');
  assert.equal(readFileSync(state, 'utf8'), before);
});

test('a contender cannot overtake an owner paused before lock publication', async t => {
  const { call, start, state, fixture, trace, dir } = cli(t, 500);
  assert.equal(JSON.parse(call(['--repo', 'acme/webapp', '--pr', '1', '--sha', SHA, '--state', state, '--call-limit-ms', '60200']).stdout).status, 'slice');
  const marker = path.join(dir, 'publishing');
  const preload = path.join(dir, 'pause-publication.cjs');
  writeFileSync(preload, `const fs = require('node:fs'); const write = fs.writeFileSync;
fs.writeFileSync = function(file, data, ...rest) {
  const result = write.call(this, file, data, ...rest);
  if (String(file).includes('.lock.claims/') && String(file).endsWith('.tmp') && String(data).includes('"config"')) {
    write(${JSON.stringify(marker)}, 'ready');
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);
  }
  return result;
}; require('node:module').syncBuiltinESMExports();`);
  writeFileSync(trace, '');
  const answer = { args: ['pr', 'view', '1', '--repo', 'acme/webapp', '--json', PR_FIELDS], response: pr([check('unit', 'FAILURE')]) };
  writeFileSync(fixture, JSON.stringify([answer, answer]));
  const first = start(['--resume', state], preload);
  const until = Date.now() + 3000;
  while (!existsSync(marker) && Date.now() < until) await new Promise(resolve => setTimeout(resolve, 10));
  assert.ok(existsSync(marker), 'owner must be in the publication collision window');
  const second = start(['--resume', state]);
  const results = await Promise.all([first.done, second.done]);
  assert.equal(results.filter(result => JSON.parse(result.stdout).status === 'failed').length, 1);
  assert.equal(results.filter(result => JSON.parse(result.stdout).status === 'blocked').length, 1);
  assert.equal(readFileSync(trace, 'utf8').trim().split('\n').length, 1);
});

test('Claude foreground mode works when no maximum timeout is configured', t => {
  const { call, state } = cli(t, 0, { CLAUDECODE: '1', BASH_MAX_TIMEOUT_MS: '' });
  const result = call(['--repo', 'acme/webapp', '--pr', '1', '--sha', SHA, '--state', state, '--wait-mode', 'foreground']);
  assert.equal(result.status, 0);
  assert.equal(JSON.parse(result.stdout).status, 'failed');
});

test('different GitHub hosts have separate targets and resume cannot change its saved host', t => {
  const { call, state, trace } = cli(t);
  const args = ['--repo', 'acme/webapp', '--pr', '1', '--sha', SHA, '--state', state, '--deadline', '1'];
  assert.equal(call(args, undefined, { GH_HOST: 'github.com' }).status, 0);
  const other = JSON.parse(call(args.map(x => x === state ? `${state}.host` : x), undefined, { GH_HOST: 'ghe.example' }).stdout);
  assert.equal(other.reused, undefined);
  assert.equal(other.stateFile, `${state}.host`);
  const before = readFileSync(state, 'utf8');
  const changedHost = call(['--resume', state], undefined, { GH_HOST: 'ghe.example' });
  assert.equal(changedHost.status, 2);
  assert.match(JSON.parse(changedHost.stdout).reason, /host/i);
  assert.equal(readFileSync(state, 'utf8'), before);
  assert.equal(existsSync(trace), false);
});

test('a pathname reused by a different PR on the same SHA is rejected', t => {
  const { call, state } = cli(t);
  const args = ['--repo', 'acme/webapp', '--pr', '1', '--sha', SHA, '--state', state, '--deadline', '1'];
  assert.equal(call(args).status, 0);
  renameSync(state, `${state}.archive`);
  const otherPr = [...args]; otherPr[3] = '2';
  assert.equal(call(otherPr).status, 0);
  const result = call(args.map(x => x === state ? `${state}.other` : x));
  assert.equal(result.status, 2);
  assert.match(JSON.parse(result.stdout).reason, /another target/);
});

test('compatible nonempty required coverage reuses its terminal evidence', t => {
  const { call, state, trace } = cli(t, 0, {}, pr());
  const args = ['--repo', 'acme/webapp', '--pr', '1', '--sha', SHA, '--state', state, '--expect', 'unit'];
  assert.equal(JSON.parse(call(args).stdout).status, 'passed');
  const result = call(args.map(x => x === state ? `${state}.other` : x));
  assert.equal(result.status, 0);
  assert.equal(JSON.parse(result.stdout).reused, true);
  assert.deepEqual(JSON.parse(result.stdout).required.expected, ['unit']);
  assert.equal(readFileSync(trace, 'utf8').trim().split('\n').length, 1);
});

test('active owners cannot share incompatible required coverage', async t => {
  const { start, call, state, trace } = cli(t, 1000, {}, pr());
  const args = ['--repo', 'acme/webapp', '--pr', '1', '--sha', SHA, '--state', state, '--expect', 'unit'];
  const first = start(args);
  const until = Date.now() + 3000;
  while (!existsSync(trace) && Date.now() < until) await new Promise(resolve => setTimeout(resolve, 10));
  assert.ok(existsSync(trace));
  const result = call(args.map(x => x === state ? `${state}.other` : x === 'unit' ? 'integration' : x));
  assert.equal(result.status, 2);
  assert.match(JSON.parse(result.stdout).reason, /expected checks/);
  assert.equal((await first.done).status, 0);
  assert.equal(readFileSync(trace, 'utf8').trim().split('\n').length, 1);
});

for (const legacy of ['nonterminal-state', 'missing-result-protocol', 'old-result-protocol']) test(`protocol rejects an independently old ${legacy}`, t => {
  const { call, state, trace } = cli(t);
  assert.equal(call(['--repo', 'acme/webapp', '--pr', '1', '--sha', SHA, '--state', state]).status, 0);
  const saved = JSON.parse(readFileSync(state, 'utf8'));
  if (legacy === 'nonterminal-state') { saved.version = 1; saved.config.deadline = 1; delete saved.result; }
  else if (legacy === 'old-result-protocol') saved.result.protocolVersion = 1;
  else delete saved.result.protocolVersion;
  writeFileSync(state, JSON.stringify(saved));
  const result = call(['--resume', state]);
  assert.equal(result.status, 2);
  assert.match(JSON.parse(result.stdout).reason, /Invalid watch state/);
  assert.equal(readFileSync(trace, 'utf8').trim().split('\n').length, 1);
});

test('simultaneous equal acquisition tickets select one owner', async t => {
  const { start, state, fixture, trace, dir } = cli(t);
  const barriers = path.join(dir, 'barriers'); mkdirSync(barriers);
  const preload = path.join(dir, 'equal-tickets.cjs');
  writeFileSync(preload, `const fs = require('node:fs'); const path = require('node:path');
const write = fs.writeFileSync, rename = fs.renameSync;
const root = ${JSON.stringify(barriers)}, registry = ${JSON.stringify(path.join(dir, 'registry') + path.sep)};
const pause = ms => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
const meet = (phase, value) => {
  write(path.join(root, phase + '-' + process.pid), String(value));
  const until = Date.now() + 3000;
  while (fs.readdirSync(root).filter(name => name.startsWith(phase + '-')).length < 2) {
    if (Date.now() >= until) throw new Error('Two-process barrier did not fill');
    pause(10);
  }
};
const target = file => String(file).startsWith(registry) && String(file).includes('.lock.claims/');
fs.writeFileSync = function(file, data, ...rest) {
  if (target(file) && String(file).endsWith('.tmp')) {
    if (/^\\d+$/.test(String(data))) meet('selected', data);
    if (String(data).includes('"config"')) { write(path.join(root, 'entered-' + process.pid), 'ready'); pause(700); }
  }
  return write.call(this, file, data, ...rest);
};
fs.renameSync = function(from, to) {
  const result = rename.call(this, from, to);
  if (target(to) && String(to).endsWith('.claim')) meet('published', 'ready');
  return result;
}; require('node:module').syncBuiltinESMExports();`);
  const answer = { args: ['pr', 'view', '1', '--repo', 'acme/webapp', '--json', PR_FIELDS],
    response: pr([check('unit', 'FAILURE')]), delayMs: 500 };
  writeFileSync(fixture, JSON.stringify([answer, answer]));
  const args = ['--repo', 'acme/webapp', '--pr', '1', '--sha', SHA, '--state', state];
  const results = await Promise.all([start(args, preload).done,
    start(args.map(x => x === state ? `${state}.other` : x), preload).done]);
  const names = readdirSync(barriers);
  assert.deepEqual(names.filter(name => name.startsWith('selected-')).map(name => readFileSync(path.join(barriers, name), 'utf8')), ['1', '1']);
  assert.equal(names.filter(name => name.startsWith('entered-')).length, 1);
  assert.equal(results.filter(result => JSON.parse(result.stdout).status === 'failed').length, 1);
  assert.equal(results.filter(result => JSON.parse(result.stdout).status === 'blocked').length, 1);
  assert.equal(readFileSync(trace, 'utf8').trim().split('\n').length, 1);
});

test('resuming a copied snapshot returns the registered owner terminal evidence', t => {
  const { call, state, fixture, trace } = cli(t, 500);
  const args = ['--repo', 'acme/webapp', '--pr', '1', '--sha', SHA, '--state', state];
  assert.equal(JSON.parse(call([...args, '--call-limit-ms', '60200']).stdout).status, 'slice');
  const copied = `${state}.copy`;
  copyFileSync(state, copied);
  const answer = conclusion => ({ args: ['pr', 'view', '1', '--repo', 'acme/webapp', '--json', PR_FIELDS], response: pr([check('unit', conclusion)]) });
  writeFileSync(fixture, JSON.stringify([answer('FAILURE')]));
  assert.equal(JSON.parse(call(['--resume', state]).stdout).status, 'failed');
  writeFileSync(fixture, JSON.stringify([answer('SUCCESS')]));
  const result = call(['--resume', copied]);
  assert.equal(result.status, 0);
  const verdict = JSON.parse(result.stdout);
  assert.equal(verdict.status, 'failed');
  assert.equal(verdict.reused, true);
  assert.equal(verdict.stateFile, state);
  assert.equal(readFileSync(trace, 'utf8').trim().split('\n').length, 2);
  assert.equal(JSON.parse(readFileSync(fixture, 'utf8')).length, 1);
});
