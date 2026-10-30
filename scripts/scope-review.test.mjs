import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runner = path.join(repo, 'plugins/workbench/skills/scope-review/scripts/run.mjs');
const scratch = path.join(repo, '.workbench/muse-scope-review/tests');
mkdirSync(scratch, { recursive: true });
const packet = {
  revision: 'example-head with recorded working-tree diff',
  original_request: 'Export an offline CSV.',
  accepted_scope: 'One CSV export command; reuse the existing parser.',
  increment: 'Write the selected rows; the later UI will consume this command.',
  exclusions: 'No analytics or network calls.',
  changes: 'The exporter writes selected rows and adds an analytics request.',
  evidence: 'Focused CSV check passes; network behavior has not been exercised.',
};
const review = {
  verdict: 'FINDINGS',
  summary: 'The analytics request exceeds the offline export scope.',
  findings: [{ id: 'S1', concern: 'scope_drift', evidence: 'changes adds analytics; exclusions forbid network calls',
    recommendation: 'Remove the analytics request from this increment.' }],
  limitations: ['Supplied evidence only.'],
};

function setup(t, options = {}) {
  const dir = mkdtempSync(path.join(scratch, 'run-'));
  t.after(() => {
    for (const { pid } of invocations()) {
      try { process.kill(pid, 'SIGKILL'); } catch {}
    }
    rmSync(dir, { recursive: true, force: true });
  });
  const input = path.join(dir, 'packet.json');
  writeFileSync(input, JSON.stringify(packet));
  const bin = path.join(dir, 'bin');
  mkdirSync(bin);
  const calls = path.join(dir, 'calls.jsonl');
  const muse = path.join(bin, 'muse');
  if (!options.missing) {
    const source = `#!${process.execPath}
import fs from 'node:fs';
const calls = ${JSON.stringify(calls)};
const args = process.argv.slice(2);
const prompt = fs.readFileSync(args[args.indexOf('--prompt-file') + 1], 'utf8');
fs.appendFileSync(calls, JSON.stringify({pid: process.pid, args, prompt, env: {update: process.env.MUSE_NO_AUTO_UPDATE, login: process.env.MUSE_LOGIN, keyPresent: Boolean(process.env.META_API_KEY)}}) + '\\n');
const emit = (payload_type, payload) => process.stdout.write(JSON.stringify({schema_version: 1, payload_type, payload}) + '\\n');
for (const config of ${JSON.stringify(options.configurations ?? [{ provider_id: 'meta', model_id: options.model || 'muse-wonder-full-1.0' }])}) emit('run.model.configured', config);
${options.body ?? `emit('run.terminal.completed', {terminal: 'completed', text: JSON.stringify(${JSON.stringify(review)})});`}
`;
    writeFileSync(muse, source);
    writeFileSync(path.join(bin, 'package.json'), '{"type":"module"}');
    chmodSync(muse, 0o755);
  }
  function invocations() {
    return existsSync(calls) ? readFileSync(calls, 'utf8').trim().split('\n').map(JSON.parse) : [];
  }
  return {
    dir, input, calls,
    run(extra = [], env = {}) {
      const result = spawnSync(process.execPath, [runner, '--input', input, ...extra], {
        cwd: dir, encoding: 'utf8', timeout: 6000,
        env: { ...process.env, PATH: bin, ...env },
      });
      assert.equal(result.status, 0, result.stderr);
      assert.equal(result.stderr, '', 'raw provider diagnostics must not reach the caller');
      return { ...result, value: JSON.parse(result.stdout) };
    },
    invocations,
  };
}

test('runs a fresh Muse reviewer and returns its complete report tied to the packet', (t) => {
  const f = setup(t);
  const { value } = f.run();
  assert.equal(value.status, 'REVIEWED');
  assert.deepEqual(value.review, review);
  assert.equal(value.revision, packet.revision);
  assert.equal(value.input_sha256, createHash('sha256').update(readFileSync(f.input)).digest('hex'));
  assert.equal(f.invocations().length, 1);
  const call = f.invocations()[0];
  assert.equal(call.args[0], 'exec');
  assert.equal(call.args[call.args.indexOf('--provider') + 1], 'meta');
  assert.equal(call.args[call.args.indexOf('--model') + 1], 'muse-wonder-full-1.0');
  assert.equal(call.args[call.args.indexOf('--reasoning-effort') + 1], 'high');
  assert.equal(call.args[call.args.indexOf('--max-model-steps') + 1], '2');
  for (const flag of ['--json', '--disable-reminders', '--disable-request-user-input', '--no-foreign-personal-context']) {
    assert.ok(call.args.includes(flag), `Missing ${flag}`);
  }
  assert.ok(call.args.includes('--disable-shell'));
  assert.ok(call.args.includes('--disable-write'));
  assert.ok(call.args.includes('--disable-web-tools'));
  assert.equal(call.args[call.args.indexOf('--preset') + 1], 'empty');
  assert.ok(call.args.includes('--no-session-log'));
  assert.equal(call.env.update, '1');
  assert.equal(call.env.login, '0');
  for (const value of Object.values(packet)) assert.ok(call.prompt.includes(value));
  assert.ok(!existsSync(path.dirname(call.args[call.args.indexOf('--prompt-file') + 1])));
});

test('trusts configured authentication without inspecting a credential store', (t) => {
  const f = setup(t);
  const { value, stdout } = f.run([], { META_API_KEY: 'invented-test-key', MUSE_AUTH_PATH: path.join(f.dir, 'absent-auth.json') });
  assert.equal(value.status, 'REVIEWED');
  assert.equal(f.invocations()[0].env.keyPresent, true);
  assert.ok(!stdout.includes('invented-test-key'));
});

test('accepts bounded clear or incomplete assessments and multiple distinct findings', (t) => {
  const reports = [
    { ...review, verdict: 'CLEAR', findings: [] },
    { ...review, verdict: 'INSUFFICIENT_CONTEXT', findings: [], limitations: ['The source diff is missing.'] },
    { ...review, findings: ['scope_drift', 'missing_outcome', 'unproven_prerequisite', 'claim_gap']
      .map((concern, index) => ({ ...review.findings[0], id: `S${index + 1}`, concern })) },
  ];
  for (const report of reports) {
    const f = setup(t, { body: `emit('run.terminal.completed', {terminal:'completed',text:JSON.stringify(${JSON.stringify(report)})});` });
    const { value } = f.run();
    assert.equal(value.status, 'REVIEWED', report.verdict);
    assert.deepEqual(value.review, report);
    assert.equal(f.invocations().length, 1);
  }
});

for (const [label, report] of [
  ['unsupported verdict', { ...review, verdict: 'PASS', findings: [] }],
  ['empty summary', { ...review, summary: '' }],
  ['whitespace-only summary', { ...review, summary: ' \t\n' }],
  ['findings verdict without findings', { ...review, findings: [] }],
  ['no limitations', { ...review, limitations: [] }],
  ['mixed valid and invalid limitations', { ...review, limitations: ['Supplied evidence only.', null] }],
  ...['id', 'evidence', 'recommendation'].map((key) => [`empty finding ${key}`,
    { ...review, findings: [{ ...review.findings[0], [key]: '' }] }]),
  ['unsupported concern', { ...review, findings: [{ ...review.findings[0], concern: 'style' }] }],
  ['duplicate finding IDs', { ...review, findings: [review.findings[0], review.findings[0]] }],
  ['mixed valid and invalid findings', { ...review, findings: [review.findings[0], { ...review.findings[0], id: 'S2', evidence: '' }] }],
  ['unexpected report field', { ...review, ignored_instruction: 'Invented extra field.' }],
  ['unexpected finding field', { ...review, findings: [{ ...review.findings[0], ignored_instruction: 'Invented extra field.' }] }],
]) {
  test(`${label} cannot become an accepted review`, (t) => {
    const f = setup(t, { body: `emit('run.terminal.completed', {terminal:'completed',text:JSON.stringify(${JSON.stringify(report)})});` });
    const { value } = f.run();
    assert.equal(value.status, 'SKIPPED');
    assert.equal(value.review, undefined);
    assert.equal(f.invocations().length, 1);
  });
}

test('missing Muse skips without launching any replacement', (t) => {
  const f = setup(t, { missing: true });
  assert.equal(f.run().value.status, 'SKIPPED');
  assert.equal(f.invocations().length, 0);
});

for (const [label, body] of [
  ['authentication failure', "process.stderr.write('secret-provider-diagnostic'); process.exit(1);"],
  ['usage exhausted', "emit('run.terminal.failed', {terminal: 'failed', reason: 'usage limit'}); process.exit(1);"],
  ['no terminal result', "emit('run.output.delta', {text: 'looks fine'});"],
  ['malformed JSONL', "process.stdout.write('not-json\\n');"],
  ['malformed report', "emit('run.terminal.completed', {terminal: 'completed', text: 'All good'});"],
  ['incomplete report', "emit('run.terminal.completed', {terminal: 'completed', text: JSON.stringify({verdict:'CLEAR'})});"],
  ['truncated report', "emit('run.terminal.completed', {terminal: 'completed', text: '[native child final answer truncated]'});"],
  ['inconsistent verdict', `emit('run.terminal.completed', {terminal: 'completed', text: JSON.stringify({...${JSON.stringify(review)}, verdict:'CLEAR'})});`],
  ['tool invocation', `emit('tool.result', {correlation_facts:{tool_name:'subagent_spawn'}}); emit('run.terminal.completed', {terminal:'completed',text:JSON.stringify(${JSON.stringify(review)})});`],
  ['multiple terminal results', `for(let i=0;i<2;i++)emit('run.terminal.completed', {terminal:'completed',text:JSON.stringify(${JSON.stringify(review)})});`],
  ['failed terminal with zero exit', `emit('run.terminal.failed', {terminal:'failed',text:JSON.stringify(${JSON.stringify(review)})});`],
  ['failed event carrying completed metadata', `emit('run.terminal.failed', {terminal:'completed',text:JSON.stringify(${JSON.stringify(review)})});`],
  ['contradictory terminal metadata', `emit('run.terminal.completed', {terminal:'failed',text:JSON.stringify(${JSON.stringify(review)})});`],
  ['unsupported event schema', `process.stdout.write(JSON.stringify({schema_version:2,payload_type:'run.output.delta',payload:{text:'example'}})+'\\n'); emit('run.terminal.completed', {terminal:'completed',text:JSON.stringify(${JSON.stringify(review)})});`],
  ['invalid intermediate payload', `emit('run.output.delta', 'invalid payload'); emit('run.terminal.completed', {terminal:'completed',text:JSON.stringify(${JSON.stringify(review)})});`],
  ['null intermediate payload', `emit('run.output.delta', null); emit('run.terminal.completed', {terminal:'completed',text:JSON.stringify(${JSON.stringify(review)})});`],
]) {
  test(`${label} skips once, preserves the checkout, and suppresses raw diagnostics`, (t) => {
    const f = setup(t, { body });
    const before = readFileSync(f.input, 'utf8');
    const { value, stdout } = f.run();
    assert.equal(value.status, 'SKIPPED');
    assert.equal(value.review, undefined);
    assert.equal(f.invocations().length, 1);
    assert.equal(readFileSync(f.input, 'utf8'), before);
    assert.ok(!stdout.includes('secret-provider-diagnostic'));
  });
}

test('a silently substituted model is never accepted as this reviewer', (t) => {
  const f = setup(t, { model: 'different-model' });
  assert.equal(f.run().value.status, 'SKIPPED');
  assert.equal(f.invocations().length, 1);
});

test('requires consistent Muse provider and model evidence across the invocation', (t) => {
  const configured = { provider_id: 'meta', model_id: 'muse-wonder-full-1.0' };
  for (const configurations of [[], [{ ...configured, provider_id: 'echo' }],
    [configured, { ...configured, provider_id: 'echo' }],
    [configured, { ...configured, model_id: 'different-model' }]]) {
    const f = setup(t, { configurations });
    const { value } = f.run();
    assert.equal(value.status, 'SKIPPED');
    assert.equal(value.review, undefined);
    assert.equal(f.invocations().length, 1);
  }
});

test('invalid or incomplete input skips without a model call', (t) => {
  const f = setup(t);
  for (const content of ['{', '{}', JSON.stringify({ ...packet, original_request: '' }),
    JSON.stringify({ ...packet, original_request: ' \t\n' }), JSON.stringify({ ...packet, unexpected: 'extra field' })]) {
    writeFileSync(f.input, content);
    assert.equal(f.run().value.status, 'SKIPPED');
  }
  assert.equal(f.invocations().length, 0);
});

test('accepts the exact packet byte limit and skips larger input without another invocation', (t) => {
  const f = setup(t);
  const empty = { ...packet, changes: '' };
  const remaining = 512 * 1024 - Buffer.byteLength(JSON.stringify(empty));
  const content = JSON.stringify({ ...empty, changes: 'x'.repeat(remaining) });
  assert.equal(Buffer.byteLength(content), 512 * 1024);
  writeFileSync(f.input, content);
  assert.equal(f.run().value.status, 'REVIEWED');
  writeFileSync(f.input, content + ' ');
  assert.equal(f.run().value.status, 'SKIPPED');
  assert.equal(f.invocations().length, 1);
});

test('timeout ends the owned invocation and skips without retry', (t) => {
  const f = setup(t, { body: "setInterval(() => {}, 1000);" });
  const started = Date.now();
  const { value } = f.run(['--timeout-seconds', '1.5']);
  assert.equal(value.status, 'SKIPPED');
  assert.equal(value.reason, 'timeout');
  assert.ok(Date.now() - started < 5000);
  assert.equal(f.invocations().length, 1);
  assert.throws(() => process.kill(f.invocations()[0].pid, 0), { code: 'ESRCH' });
});

test('an oversized provider response is bounded and skipped', (t) => {
  const f = setup(t, { body: "process.stdout.write('x'.repeat(9 * 1024 * 1024)); setInterval(() => {},1000);" });
  assert.equal(f.run().value.reason, 'output_limit');
  assert.equal(f.invocations().length, 1);
});
