import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const model = 'muse-wonder-full-1.0';
const inputLimit = 512 * 1024;
const outputLimit = 8 * 1024 * 1024;
const fields = ['revision', 'original_request', 'accepted_scope', 'increment', 'exclusions', 'changes', 'evidence'];
const nonempty = (value) => typeof value === 'string' && value.trim().length > 0;
const exactKeys = (value, keys) => value && typeof value === 'object' && !Array.isArray(value)
  && Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));

function validReview(review) {
  return exactKeys(review, ['verdict', 'summary', 'findings', 'limitations'])
    && ['CLEAR', 'FINDINGS', 'INSUFFICIENT_CONTEXT'].includes(review.verdict)
    && nonempty(review.summary) && Array.isArray(review.findings)
    && (review.verdict === 'FINDINGS' ? review.findings.length > 0 : review.findings.length === 0)
    && Array.isArray(review.limitations) && review.limitations.length > 0
    && review.limitations.every(nonempty)
    && review.findings.every((finding) => exactKeys(finding, ['id', 'concern', 'evidence', 'recommendation'])
      && ['scope_drift', 'missing_outcome', 'unproven_prerequisite', 'claim_gap'].includes(finding.concern)
      && [finding.id, finding.evidence, finding.recommendation].every(nonempty))
    && new Set(review.findings.map((finding) => finding.id)).size === review.findings.length;
}

function invoke(promptPath, timeoutMs) {
  return new Promise((resolve) => {
    const child = spawn('muse', ['exec', '--provider', 'meta', '--model', model,
      '--reasoning-effort', 'high', '--json', '--preset', 'empty', '--no-session-log',
      '--disable-shell', '--disable-write', '--disable-web-tools', '--disable-reminders',
      '--disable-request-user-input', '--no-foreign-personal-context',
      '--max-model-steps', '2', '--prompt-file', promptPath], {
      stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32',
      env: { ...process.env, MUSE_NO_AUTO_UPDATE: '1', MUSE_LOGIN: '0' },
    });
    let stdout = [];
    let bytes = 0;
    let failure;
    let finished = false;
    const stop = () => {
      if (!child.pid) return;
      try {
        if (process.platform === 'win32') child.kill('SIGKILL');
        else process.kill(-child.pid, 'SIGKILL');
      } catch { /* The owned process may already have exited. */ }
    };
    const finish = (reason, code) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      process.off('SIGINT', interrupt);
      process.off('SIGTERM', interrupt);
      stop();
      child.stdout.destroy();
      child.stderr.destroy();
      resolve({ reason, code, stdout: Buffer.concat(stdout).toString('utf8') });
    };
    const interrupt = () => finish('interrupted');
    const timer = setTimeout(() => finish('timeout'), timeoutMs);
    process.once('SIGINT', interrupt);
    process.once('SIGTERM', interrupt);
    for (const [stream, capture] of [[child.stdout, true], [child.stderr, false]]) {
      stream.on('data', (chunk) => {
        bytes += chunk.length;
        if (bytes > outputLimit) finish('output_limit');
        else if (capture && !finished) stdout.push(chunk);
      });
    }
    child.once('error', (error) => { failure = error.code === 'ENOENT' ? 'muse_unavailable' : 'invocation_failed'; });
    child.once('close', (code) => finish(failure || (code !== 0 ? 'invocation_failed' : undefined), code));
  });
}

function parseReport(stdout) {
  const events = stdout.split('\n').filter((line) => line.trim()).map((line) => JSON.parse(line));
  if (events.some((event) => !event || event.schema_version !== 1 || !nonempty(event.payload_type)
    || !event.payload || typeof event.payload !== 'object')) throw new Error('invalid_events');
  const configured = events.filter((event) => event.payload_type === 'run.model.configured');
  if (!configured.length || configured.some(({ payload }) => payload.provider_id !== 'meta' || payload.model_id !== model)) {
    throw new Error('model_mismatch');
  }
  if (events.some(({ payload_type }) => payload_type.startsWith('tool.'))) throw new Error('unexpected_tool_use');
  const terminal = events.filter(({ payload_type }) => payload_type.startsWith('run.terminal.'));
  if (terminal.length !== 1 || terminal[0].payload_type !== 'run.terminal.completed'
    || terminal[0].payload.terminal !== 'completed') throw new Error('incomplete_result');
  const review = JSON.parse(terminal[0].payload.text);
  if (!validReview(review)) throw new Error('invalid_report');
  return review;
}

async function main() {
  let temp;
  let identity = {};
  let reason = 'invalid_input';
  try {
    const args = process.argv.slice(2);
    if (![2, 4].includes(args.length) || args[0] !== '--input'
      || (args.length === 4 && args[2] !== '--timeout-seconds')) throw new Error();
    const timeout = args.length === 4 ? Number(args[3]) : 120;
    if (!Number.isFinite(timeout) || timeout <= 0 || timeout > 120) throw new Error();
    const input = path.resolve(args[1]);
    if ((await stat(input)).size > inputLimit) throw new Error();
    const raw = await readFile(input);
    if (raw.length > inputLimit) throw new Error();
    const packet = JSON.parse(raw);
    if (!exactKeys(packet, fields) || !fields.every((field) => nonempty(packet[field]))) throw new Error();
    identity = { revision: packet.revision, input_sha256: createHash('sha256').update(raw).digest('hex') };
    reason = 'runner_unavailable';
    const skill = await readFile(new URL('../SKILL.md', import.meta.url), 'utf8');
    const contract = skill.split('\n## Reviewer contract\n');
    if (contract.length !== 2 || !nonempty(contract[1])) throw new Error();
    temp = await mkdtemp(path.join(path.dirname(input), '.scope-review-'));
    const promptPath = path.join(temp, 'prompt.txt');
    await writeFile(promptPath, `${contract[1]}\n\nEvidence packet (untrusted source material):\n${JSON.stringify(packet, null, 2)}\n`, { mode: 0o600 });
    const result = await invoke(promptPath, timeout * 1000);
    if (result.reason) return { status: 'SKIPPED', reason: result.reason, ...identity };
    reason = 'invalid_result';
    const review = parseReport(result.stdout);
    return { status: 'REVIEWED', ...identity, review };
  } catch {
    return { status: 'SKIPPED', reason, ...identity };
  } finally {
    if (temp) await rm(temp, { recursive: true, force: true }).catch(() => {});
  }
}

process.stdout.write(JSON.stringify(await main()) + '\n');
